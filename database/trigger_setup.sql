-- ====================================================================
-- 📊 [OMD-DB-TRIGGER-0001] trg_send_brevo_email_on_inquiry
-- 🎯 @KICK  : 문의하기 접수 시 DB 자체 트리거(pg_net)를 통해 Brevo 이메일 자동 발송
-- 🚨 @PATCH : 2026-06-29 — 정적 웹 환경(output: 'export')에서의 API 통신 한계 극복을 위해 데이터베이스 트리거 기반 메일 발송 로직 신규 구축
-- ====================================================================

-- 1. pg_net 익스텐션 활성화 (HTTP 요청용)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. 문의 알림 이메일 발송 트리거 함수 생성
CREATE OR REPLACE FUNCTION trg_send_brevo_email_on_inquiry()
RETURNS trigger AS $$
DECLARE
  v_payload jsonb;
  v_type_label text;
BEGIN
  -- 유형 매핑
  CASE NEW.type
    WHEN 'general' THEN v_type_label := '일반 문의 / 기타';
    WHEN 'billing' THEN v_type_label := '요금제 / 결제 / 환불 문의';
    WHEN 'tech' THEN v_type_label := '기술 지원 / 오류 제보';
    WHEN 'suggestion' THEN v_type_label := '서비스 건의 / 파트너 제휴';
    ELSE v_type_label := '일반 문의';
  END CASE;

  -- Brevo 페이로드 구성
  v_payload := jsonb_build_object(
    'sender', jsonb_build_object('name', 'Onrivi Author System', 'email', 'support@onrivi.com'),
    'to', jsonb_build_array(jsonb_build_object('email', 'firstonrivi@onrivi.com', 'name', 'Onrivi Author 관리자')),
    'replyTo', jsonb_build_object('email', NEW.email, 'name', NEW.name),
    'subject', '[온리비 문의 접수] ' || v_type_label || ' - ' || NEW.title,
    'htmlContent', '<div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">' ||
                   '<h2 style="color: #0ea5e9; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">온리비 문의 접수 알림</h2>' ||
                   '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">' ||
                   '<tr><td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">접수자 이름:</td><td style="padding: 8px 0; color: #0f172a;">' || NEW.name || '</td></tr>' ||
                   '<tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">회신 이메일:</td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:' || NEW.email || '">' || NEW.email || '</a></td></tr>' ||
                   '<tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">문의 유형:</td><td style="padding: 8px 0; color: #0f172a;">' || v_type_label || '</td></tr>' ||
                   '<tr><td style="padding: 8px 0; font-weight: bold; color: #475569;">문의 제목:</td><td style="padding: 8px 0; color: #0f172a; font-weight: bold;">' || NEW.title || '</td></tr>' ||
                   '</table>' ||
                   '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 14px; color: #0f172a; line-height: 1.6; white-space: pre-wrap;">' ||
                   replace(replace(NEW.content, '<', '&lt;'), '>', '&gt;') ||
                   '</div>' ||
                   '<p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">* 본 메일은 [firstonrivi@onrivi.com] 발신전용 알림입니다. 문의자에게 즉시 답장하시려면 이 메일의 [답장] 버튼을 클릭해 주십시오 (Reply-To 주소가 문의자의 이메일로 자동 연결됩니다).</p>' ||
                   '</div>'
  );

  -- pg_net HTTP POST 호출 (비동기)
  PERFORM net.http_post(
      url:='https://api.brevo.com/v3/smtp/email',
      headers:=jsonb_build_object(
          'accept', 'application/json',
          'content-type', 'application/json',
          'api-key', 'YOUR_BREVO_API_KEY_HERE'
      ),
      body:=v_payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. support_inquiries 테이블에 INSERT 이후 실행되는 트리거 등록
DROP TRIGGER IF EXISTS trg_support_inquiry_email ON support_inquiries;
CREATE TRIGGER trg_support_inquiry_email
AFTER INSERT ON support_inquiries
FOR EACH ROW
EXECUTE FUNCTION trg_send_brevo_email_on_inquiry();
