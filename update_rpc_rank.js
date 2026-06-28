const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.insert_license_activation(p_license_id uuid, p_device_uuid text, p_device_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_max_devices INT;
  v_rank INT;
BEGIN
  -- 1. Get max_devices
  BEGIN
    SELECT s.max_devices INTO STRICT v_max_devices 
    FROM subscriptions s 
    JOIN software_licenses l ON l.subscription_id = s.id 
    WHERE l.id = p_license_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN v_max_devices := 1;
  END;

  -- 2. UNCONDITIONALLY UPSERT THE SESSION
  INSERT INTO public.license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
  VALUES (p_license_id, p_device_uuid, p_device_name, now(), now())
  ON CONFLICT (license_id, device_uuid) DO UPDATE SET
    last_active_at = now();

  -- 3. Calculate rank of THIS device based on activated_at
  SELECT rank INTO v_rank
  FROM (
    SELECT device_uuid, ROW_NUMBER() OVER (ORDER BY activated_at ASC) as rank
    FROM license_activations
    WHERE license_id = p_license_id
  ) ranked
  WHERE device_uuid = p_device_uuid;

  -- 4. If rank > max_devices, return Restricted!
  IF v_rank > v_max_devices THEN
    RETURN jsonb_build_object(
      'success', false, 
      'code', 'ERR_MAX_DEVICES_EXCEEDED', 
      'message', '동시 접속 가능 기기 수를 초과했습니다. 다른 기기에서 로그아웃 한 뒤 접속해주세요.',
      'max_devices', v_max_devices,
      'rank', v_rank
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'code', 'SUCCESS', 'message', '기기가 활성화되었습니다.', 'max_devices', v_max_devices, 'rank', v_rank);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_license_session(p_payment_no text, p_device_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE 
  v_license_id UUID; 
  v_max_devices INT; 
  v_has_session BOOLEAN; 
  v_active_count INT;
  v_rank INT;
BEGIN
  IF p_payment_no IS NULL OR p_payment_no = '' THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_EMPTY_PAYMENT_NO', 'message', '결제번호가 없습니다.'); END IF;
  IF p_device_uuid IS NULL OR p_device_uuid = '' THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_EMPTY_DEVICE_UUID', 'message', '기기 식별자가 없습니다.'); END IF;
  
  BEGIN SELECT id INTO STRICT v_license_id FROM software_licenses WHERE payment_no = p_payment_no;
  EXCEPTION WHEN NO_DATA_FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_LICENSE_NOT_FOUND', 'message', '라이선스가 없습니다.'); END;
  
  BEGIN SELECT s.max_devices INTO STRICT v_max_devices FROM subscriptions s JOIN software_licenses l ON l.subscription_id = s.id WHERE l.id = v_license_id;
  EXCEPTION WHEN NO_DATA_FOUND THEN v_max_devices := 1; END;

  UPDATE license_activations 
  SET last_active_at = NOW() 
  WHERE license_id = v_license_id AND device_uuid = p_device_uuid;

  SELECT EXISTS(SELECT 1 FROM license_activations WHERE license_id = v_license_id AND device_uuid = p_device_uuid) INTO v_has_session;
  SELECT COUNT(*) INTO v_active_count FROM license_activations WHERE license_id = v_license_id;

  IF v_has_session THEN
    SELECT rank INTO v_rank
    FROM (
      SELECT device_uuid, ROW_NUMBER() OVER (ORDER BY activated_at ASC) as rank
      FROM license_activations
      WHERE license_id = v_license_id
    ) ranked
    WHERE device_uuid = p_device_uuid;

    IF v_rank > v_max_devices THEN
      RETURN jsonb_build_object('success', false, 'code', 'ERR_MAX_DEVICES_EXCEEDED', 'has_session', true, 'active_count', v_active_count, 'max_devices', v_max_devices, 'rank', v_rank);
    END IF;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'code', 'OK', 'has_session', v_has_session, 'active_count', v_active_count, 'max_devices', v_max_devices, 'rank', v_rank);
END; 
$function$;

CREATE OR REPLACE FUNCTION public.verify_desktop_license(p_email text, p_device_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  DECLARE
    v_user_id uuid;
    v_sub subscriptions%ROWTYPE;
    v_lic software_licenses%ROWTYPE;
    v_rank INT;
  BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = p_email LIMIT 1;
    IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'User not found.'); END IF;

    SELECT * INTO v_sub FROM subscriptions WHERE user_id = v_user_id AND plan_status IN ('ACTIVE', 'FREE') AND plan_name LIKE '%데스크탑%' ORDER BY current_period_end DESC LIMIT 1;
    IF v_sub.id IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'NO_PLAN', 'message', 'No active desktop subscription.'); END IF;

    SELECT * INTO v_lic FROM software_licenses WHERE subscription_id = v_sub.id LIMIT 1;

    INSERT INTO public.license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
    VALUES (v_lic.id, p_device_uuid, 'Desktop App', now(), now())
    ON CONFLICT (license_id, device_uuid) DO UPDATE SET last_active_at = now();

    SELECT rank INTO v_rank
    FROM (
      SELECT device_uuid, ROW_NUMBER() OVER (ORDER BY activated_at ASC) as rank
      FROM license_activations
      WHERE license_id = v_lic.id
    ) ranked
    WHERE device_uuid = p_device_uuid;

    IF v_rank > v_sub.max_devices THEN
      RETURN jsonb_build_object(
        'success', false, 'code', 'ERR_MAX_DEVICES_EXCEEDED', 'message', '동시 접속 가능 기기 수를 초과했습니다. 제한 사용자로 접근합니다.',
        'max_devices', v_sub.max_devices, 'verify_key', v_lic.verify_key, 'payment_no', v_lic.payment_no, 'license_key', v_lic.license_key, 'plan_name', v_sub.plan_name, 'next_payment_date', v_sub.current_period_end, 'rank', v_rank
      );
    END IF;

    RETURN jsonb_build_object(
      'success', true, 'code', 'SUCCESS', 'message', 'Desktop activated.', 'verify_key', v_lic.verify_key, 'payment_no', v_lic.payment_no, 'license_key', v_lic.license_key, 'plan_name', v_sub.plan_name, 'next_payment_date', v_sub.current_period_end, 'rank', v_rank
    );
  EXCEPTION
    WHEN OTHERS THEN RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
  END;
$function$;
  `;
  
  await client.query(sql);
  console.log('Successfully updated 3 RPCs to UNCONDITIONALLY insert and rank by activated_at.');
  
  await client.query("DELETE FROM license_activations");
  await client.end();
}
run().catch(console.error);
