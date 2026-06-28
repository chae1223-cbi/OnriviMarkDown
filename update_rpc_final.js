const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.check_license_session(p_payment_no text, p_device_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE v_license_id UUID; v_max_devices INT; v_has_session BOOLEAN; v_active_count INT;
BEGIN
  IF p_payment_no IS NULL OR p_payment_no = '' THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_EMPTY_PAYMENT_NO', 'message', '결제번호가 없습니다.'); END IF;
  IF p_device_uuid IS NULL OR p_device_uuid = '' THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_EMPTY_DEVICE_UUID', 'message', '기기 식별자가 없습니다.'); END IF;
  BEGIN SELECT id INTO STRICT v_license_id FROM software_licenses WHERE payment_no = p_payment_no;
  EXCEPTION WHEN NO_DATA_FOUND THEN RETURN jsonb_build_object('success', false, 'code', 'ERR_LICENSE_NOT_FOUND', 'message', '라이선스가 없습니다.'); END;
  
  -- UPDATE HEARTBEAT (User can still keep session alive while open)
  UPDATE license_activations 
  SET activated_at = NOW(), last_active_at = NOW() 
  WHERE license_id = v_license_id AND device_uuid = p_device_uuid;

  SELECT EXISTS(SELECT 1 FROM license_activations WHERE license_id = v_license_id AND device_uuid = p_device_uuid) INTO v_has_session;
  
  -- USER RULE: Do NOT check 45 seconds. ONLY check license_activations exist.
  SELECT COUNT(*) INTO v_active_count FROM license_activations WHERE license_id = v_license_id;
  
  BEGIN SELECT s.max_devices INTO STRICT v_max_devices FROM subscriptions s JOIN software_licenses l ON l.subscription_id = s.id WHERE l.id = v_license_id;
  EXCEPTION WHEN NO_DATA_FOUND THEN v_max_devices := 1; END;
  
  RETURN jsonb_build_object('success', true, 'code', 'OK', 'has_session', v_has_session, 'active_count', v_active_count, 'max_devices', v_max_devices);
END; $function$;


CREATE OR REPLACE FUNCTION public.insert_license_activation(p_license_id uuid, p_device_uuid text, p_device_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_max_devices INT;
  v_other_active_count INT;
BEGIN
  -- 1. Get max_devices for this license
  BEGIN
    SELECT s.max_devices INTO STRICT v_max_devices 
    FROM subscriptions s 
    JOIN software_licenses l ON l.subscription_id = s.id 
    WHERE l.id = p_license_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      v_max_devices := 1;
  END;

  -- USER RULE: Do NOT check 45 seconds. ONLY count license_activations.
  SELECT COUNT(*) INTO v_other_active_count 
  FROM license_activations 
  WHERE license_id = p_license_id 
    AND device_uuid != p_device_uuid;

  -- 3. If other active devices >= max_devices, REJECT
  IF v_other_active_count >= v_max_devices THEN
    RETURN jsonb_build_object(
      'success', false, 
      'code', 'ERR_MAX_DEVICES_EXCEEDED', 
      'message', '동시 접속 가능 기기 수를 초과했습니다. 다른 브라우저나 기기에서 로그아웃 한 뒤 접속해주세요.'
    );
  END IF;

  -- 4. Otherwise, allow activation (upsert)
  DELETE FROM license_activations
  WHERE license_id = p_license_id
    AND device_uuid = p_device_uuid;

  INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
  VALUES (p_license_id, p_device_uuid, p_device_name, now(), now());

  RETURN jsonb_build_object('success', true, 'code', 'SUCCESS', 'message', '기기가 활성화되었습니다.');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
END;
$function$;
  `;
  
  await client.query(sql);
  console.log('Successfully updated RPCs to ignore time checks.');

  // Clean DB for user test
  await client.query("DELETE FROM license_activations");
  await client.end();
}
run().catch(console.error);
