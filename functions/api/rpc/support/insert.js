export async function onRequestOptions() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };
  return new Response(null, { headers: corsHeaders });
}

function getTypeName(type) {
  const normType = (type || '').toLowerCase();
  switch (normType) {
    case 'general': return '일반 문의 / 기타';
    case 'billing': return '요금제 / 결제 / 환불 문의';
    case 'tech': return '기술 지원 / 오류 제보';
    case 'suggestion': return '서비스 건의 / 파트너 제휴';
    default: return '일반 문의';
  }
}

function decodeFilename(url) {
  try {
    const rawFilename = url.split('/').pop() || '';
    let decoded = decodeURIComponent(rawFilename);
    const match = decoded.match(/^[0-9]+_[a-z0-9]+_(.*)$/i);
    if (match) {
      return match[1];
    }
    return decoded;
  } catch (e) {
    return url;
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { p_name, p_email, p_type, p_title, p_content, p_user_id, p_attachment_urls } = body;

    if (!p_name || !p_email || !p_title || !p_content) {
      return new Response(JSON.stringify({ success: false, code: 'INVALID_PARAMS', message: '필수 인자가 누락되었습니다.' }), { status: 400, headers: corsHeaders });
    }

    const attachmentUrls = Array.isArray(p_attachment_urls) ? p_attachment_urls : [];
    const upperType = (p_type || 'GENERAL').toUpperCase();
    let inquiryId = null;
    let resolvedUserId = p_user_id || null;

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const brevoApiKey = env.BREVO_API_KEY || '';

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };

    if (!resolvedUserId && p_email) {
      const cleanEmail = p_email.trim().toLowerCase();
      const userRes = await fetch(`${supabaseUrl}/rest/v1/users?email=ilike.${encodeURIComponent(cleanEmail)}&is_deleted=eq.false&select=id&limit=1`, { headers });
      const userRows = await userRes.json();
      if (userRes.ok && userRows && userRows.length > 0) {
        resolvedUserId = userRows[0].id;
      }
    }

    const now = new Date().toISOString();
    const insertData = {
      created_by: resolvedUserId,
      created_at: now,
      updated_by: resolvedUserId,
      updated_at: now,
      user_id: resolvedUserId,
      name: p_name,
      email: p_email,
      type: upperType,
      title: p_title,
      content: p_content,
      attachment_urls: attachmentUrls,
      status: 'PENDING'
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/support_inquiries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(insertData)
    });
    
    if (!insertRes.ok) {
      const err = await insertRes.json();
      return new Response(JSON.stringify({ success: false, code: 'ERROR', message: err.message || 'DB 오류' }), { status: 500, headers: corsHeaders });
    }

    const insertRows = await insertRes.json();
    if (insertRows && insertRows.length > 0) {
      inquiryId = insertRows[0].id;
    }

    if (brevoApiKey) {
      const typeLabel = getTypeName(p_type);
      let attachmentsHtml = '';
      if (attachmentUrls.length > 0) {
        attachmentsHtml = `
          <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #eff6ff, #f0f9ff); border: 1px solid #bae6fd; border-radius: 12px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #0369a1; display: flex; align-items: center; gap: 6px;">📎 첨부 파일 다운로드</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        `;
        attachmentUrls.forEach((url) => {
          const cleanFilename = decodeFilename(url);
          const fullUrl = url.startsWith('/') ? `https://onrivi.com${url}` : url;
          attachmentsHtml += `
            <tr><td style="padding: 6px 0; border-bottom: 1px solid #e0f2fe;">
              <a href="${fullUrl}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                📄 ${cleanFilename} 다운로드
              </a>
            </td></tr>
          `;
        });
        attachmentsHtml += `</table></div>`;
      }

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://onrivi.com/icon.png" alt="Onrivi" style="width: 48px; height: 48px; border-radius: 12px;" />
            <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px;">온리비 문의가 접수되었습니다</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 접수</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; background: #f8fafc; border-radius: 12px; padding: 16px;">
            <tr><td style="padding: 10px 16px; font-weight: 600; color: #475569; width: 100px; white-space: nowrap;">👤 이름</td><td style="padding: 10px 16px; color: #0f172a;">${p_name}</td></tr>
            <tr><td style="padding: 10px 16px; font-weight: 600; color: #475569;">📧 이메일</td><td style="padding: 10px 16px; color: #0f172a;"><a href="mailto:${p_email}" style="color: #2563eb;">${p_email}</a></td></tr>
            <tr><td style="padding: 10px 16px; font-weight: 600; color: #475569;">📂 유형</td><td style="padding: 10px 16px; color: #0f172a;"><span style="background: #dbeafe; color: #1d4ed8; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;">${typeLabel}</span></td></tr>
            <tr><td style="padding: 10px 16px; font-weight: 600; color: #475569;">📌 제목</td><td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${p_title}</td></tr>
          </table>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">📝 문의 내용</h4>
            <div style="font-size: 14px; color: #0f172a; line-height: 1.7; white-space: pre-wrap;">${p_content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          ${attachmentsHtml}
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
            이 메일은 onrivi.com 문의하기를 통해 자동 발송되었습니다.<br>
            답장하시려면 이 메일의 [Reply] 버튼을 클릭하거나 <a href="mailto:${p_email}" style="color: #2563eb;">${p_email}</a>로 직접 회신해 주세요.
          </div>
        </div>
      `;

      const payload = {
        sender: { name: 'Onrivi Author', email: 'support@onrivi.com' },
        to: [{ email: 'firstonrivi@onrivi.com', name: 'Onrivi Author 관리자' }],
        replyTo: { email: p_email, name: p_name },
        subject: `[온리비 문의] ${typeLabel} — ${p_title}`,
        htmlContent
      };

      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {}
    }

    return new Response(JSON.stringify({ success: true, code: 'SUCCESS', message: '문의가 접수되었습니다.', inquiry_id: inquiryId }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, code: 'ERROR', message: error.message }), { status: 500, headers: corsHeaders });
  }
}
