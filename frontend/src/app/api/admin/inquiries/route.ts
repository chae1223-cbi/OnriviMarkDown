/**
 * 프로그램명 : 고객 문의 관리 API (Admin Inquiries API)
 * 버전 정보 : 1.0.0
 * 프로그램 ID : oaar-api-inquiries-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.29> 최초작성
 *   * 🚨 @PATCH : **2026-08-12** — API 인증(401 Unauthorized) 실패 시 구체적인 Supabase Auth 에러 로그를 서버 콘솔에 출력하도록 console.error 디버깅 로그 추가
 * -----------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mail';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('[Admin Inquiries GET] User auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 확인 (SUPER 또는 SUPPORT)
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['SUPER', 'SUPPORT'].includes(adminData.admin_role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. 전체 문의 조회 (최신순)
    const { data: inquiries, error: inquiriesError } = await supabaseAdmin
      .from('support_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (inquiriesError) throw inquiriesError;

    // 2. 공통코드에서 표시명 가져오기
    const { data: codes, error: codesError } = await supabaseAdmin
      .from('common_codes')
      .select('group_code, code_value, code_name');

    if (codesError) throw codesError;

    // 3. 데이터 매핑
    const enrichedInquiries = (inquiries || []).map((inquiry: any) => {
      const typeInfo = codes?.find((c: any) => c.group_code === 'INQUIRY_TYPE' && c.code_value === inquiry.type);
      const statusInfo = codes?.find((c: any) => c.group_code === 'INQUIRY_STATUS' && c.code_value === inquiry.status);

      return {
        ...inquiry,
        type_name: typeInfo ? typeInfo.code_name : inquiry.type,
        status_name: statusInfo ? statusInfo.code_name : inquiry.status
      };
    });

    return NextResponse.json(enrichedInquiries);
  } catch (error: any) {
    console.error('Admin inquiries GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('[Admin Inquiries PATCH] User auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 권한 확인 (SUPER 또는 SUPPORT)
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['SUPER', 'SUPPORT'].includes(adminData.admin_role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, answer_content, send_email, answer_attachment_urls, reply_subject, reply_greeting, reply_closing } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // 1. 기존 문의내역 정보 가져오기 (이메일 발송을 위해)
    const { data: inquiryData, error: inquiryError } = await supabaseAdmin
      .from('support_inquiries')
      .select('email, title, content')
      .eq('id', id)
      .single();
    
    if (inquiryError || !inquiryData) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // 2. 이메일 발송 처리 (실패 시 DB 업데이트 중단)
    let emailSent = false;
    if (send_email && inquiryData.email && answer_content) {
      const emailSubject = reply_subject || `[답변] ${inquiryData.title} 문의에 대한 답변입니다.`;
      const greetingText = reply_greeting || `문의하신 내용에 대한 답변입니다.`;
      const closingText = reply_closing || `답변 드린 내용 외에 추가로 궁금하신 점이나 확인이 필요한 사항이 있으시면 언제든 편하게 말씀해 주시기 바랍니다.`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-bottom: 24px;">${greetingText}</h2>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; color: #4b5563; font-size: 14px; font-weight: bold;">[접수된 문의내용]</p>
            <p style="margin: 8px 0 0 0; color: #374151; white-space: pre-wrap;">${inquiryData.content}</p>
          </div>

          <div style="padding: 16px; border-radius: 6px; border: 1px solid #d1d5db;">
            <p style="margin: 0; color: #1f2937; font-size: 14px; font-weight: bold;">[답변 내용]</p>
            <p style="margin: 8px 0 0 0; color: #111827; white-space: pre-wrap;">${answer_content}</p>
          </div>
          
          <p style="margin-top: 24px; font-size: 14px; color: #374151; line-height: 1.5;">
            ${closingText}
          </p>
          
          <p style="margin-top: 32px; font-size: 13px; color: #6b7280; text-align: center;">
            본 메일은 발신 전용 메일입니다. 추가 문의사항이 있으시면 웹사이트를 이용해 주세요.
          </p>
        </div>
      `;

      const mailResult = await sendMail(inquiryData.email, emailSubject, emailHtml, answer_attachment_urls);
      
      // 이메일 발송 실패 시, 에러를 던져 DB 업데이트(트랜잭션)를 중단시킴
      if (!mailResult.success) {
        throw new Error('이메일 발송에 실패했습니다: ' + ((mailResult.error as any)?.message || '알 수 없는 오류'));
      }
      emailSent = true;
    }

    // 3. 문의내역 업데이트 (이메일 발송 성공 시에만 실행됨)
    const updateData: any = {
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    if (answer_content !== undefined) {
      updateData.answer_content = answer_content;
      updateData.answered_at = new Date().toISOString();
      updateData.answered_by = user.id;
      if (answer_attachment_urls !== undefined) {
        updateData.answer_attachment_urls = answer_attachment_urls;
      }
    }

    const { data: updatedInquiry, error: updateError } = await supabaseAdmin
      .from('support_inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ ...updatedInquiry, emailSent });
  } catch (error: any) {
    console.error('Admin inquiries PATCH error:', error);
    // 프론트엔드로 에러 메시지를 전달하여 토스트로 표시되게 함
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
