// ====================================================================
// 📊 [OMD-SUPPORT-contact-api-0001] route ➔ ContactRouteHandler
// 🎯 @KICK  : 문의하기(Contact) 제출 메일을 Brevo SMTP를 사용해 관리자(support@onrivi.com)에게 전송
// 🛡️ @GUARD : 필수 파라미터 체크 및 환경변수(BREVO_API_KEY) 부재 방어 가드
// 🚨 @PATCH : **2026-06-28** — 신규 개설: Brevo REST API 호출 기반 문의 메일 송신 엔드포인트 구현
// 🔗 @CALLS : fetch (Brevo SMTP API)
// ====================================================================
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, title, content } = body;

    // 1. 입력 필드 검증 가드
    if (!name || !email || !title || !content) {
      return NextResponse.json(
        { error: "필수 입력 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    // 2. Brevo API Key 환경변수 체크 가드
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error("[Contact API] BREVO_API_KEY 환경변수가 설정되어 있지 않습니다.");
      return NextResponse.json(
        { error: "이메일 발송 서버 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    // 문의 유형 한글 매핑
    const typeMap: Record<string, string> = {
      general: "일반 문의 / 기타",
      billing: "요금제 / 결제 / 환불 문의",
      tech: "기술 지원 / 오류 제보",
      suggestion: "서비스 건의 / 파트너 제휴",
    };
    const typeLabel = typeMap[type] || "일반 문의";

    // 3. Brevo Transactional Email 발송
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Onrivi Author System",
          email: "support@onrivi.com",
        },
        to: [
          {
            email: "support@onrivi.com",
            name: "Onrivi Author 관리자",
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `[온리비 문의 접수] ${typeLabel} - ${title}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">온리비 문의 접수 알림</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">접수자 이름:</td>
                <td style="padding: 8px 0; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">회신 이메일:</td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">문의 유형:</td>
                <td style="padding: 8px 0; color: #0f172a;">${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">문의 제목:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${title}</td>
              </tr>
            </table>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 14px; color: #0f172a; line-height: 1.6; white-space: pre-wrap;">
              ${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              * 본 메일은 [support@onrivi.com] 발신전용 알림입니다. 문의자에게 즉시 답장하시려면 이 메일의 [답장] 버튼을 클릭해 주십시오 (Reply-To 주소가 문의자의 이메일로 자동 연결됩니다).
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Contact API] Brevo 발송 에러 응답:", errorText);
      throw new Error("SMTP 발송에 실패했습니다.");
    }

    return NextResponse.json({ success: true, message: "문의가 접수되었습니다." });
  } catch (err: any) {
    console.error("[Contact API] 예외 발생:", err);
    return NextResponse.json(
      { error: err.message || "서버 통신 실패" },
      { status: 500 }
    );
  }
}
