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
  v_other_active_count INT;
  v_exists BOOLEAN;
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

  -- 1.5. Clean up expired sessions first (using last_active_at, NOT activated_at)
  DELETE FROM license_activations
  WHERE license_id = p_license_id
    AND last_active_at < NOW() - INTERVAL '60 seconds';

  -- 2. Check if this device already has an active session
  SELECT EXISTS(
    SELECT 1 FROM license_activations 
    WHERE license_id = p_license_id AND device_uuid = p_device_uuid
  ) INTO v_exists;

  -- 3. If exists, just update last_active_at and allow access (skipping max limit check)
  IF v_exists THEN
    UPDATE license_activations
    SET last_active_at = now(),
        device_name = p_device_name
    WHERE license_id = p_license_id AND device_uuid = p_device_uuid;
    
    RETURN jsonb_build_object('success', true, 'code', 'SUCCESS', 'message', '기기 활성화가 갱신되었습니다.');
  END IF;

  -- 4. If new device, check concurrent device count
  SELECT COUNT(*) INTO v_other_active_count 
  FROM license_activations 
  WHERE license_id = p_license_id 
    AND device_uuid != p_device_uuid;

  -- 5. If limit exceeded, REJECT
  IF v_other_active_count >= v_max_devices THEN
    RETURN jsonb_build_object(
      'success', false, 
      'code', 'ERR_MAX_DEVICES_EXCEEDED', 
      'message', '동시 접속 가능 기기 수를 초과했습니다. 기존 접속이 종료될 때까지 대기해주세요.',
      'max_devices', v_max_devices
    );
  END IF;

  -- 6. Insert new device activation (initialize last_active_at to now)
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
  console.log('Successfully updated insert_license_activation to delete expired sessions.');
  await client.end();
}
run().catch(console.error);
