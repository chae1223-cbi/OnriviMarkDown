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

  -- 2. Count other active devices in the last 5 minutes
  SELECT COUNT(*) INTO v_other_active_count 
  FROM license_activations 
  WHERE license_id = p_license_id 
    AND device_uuid != p_device_uuid 
    AND activated_at >= NOW() - INTERVAL '5 minutes';

  -- 3. If other active devices >= max_devices, REJECT
  IF v_other_active_count >= v_max_devices THEN
    RETURN jsonb_build_object(
      'success', false, 
      'code', 'ERR_MAX_DEVICES_EXCEEDED', 
      'message', '동시 접속 가능 기기 수를 초과했습니다. 기존 접속이 종료될 때까지 대기해주세요.'
    );
  END IF;

  -- 4. Otherwise, allow activation (upsert)
  DELETE FROM license_activations
  WHERE license_id = p_license_id
    AND device_uuid = p_device_uuid;

  INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at)
  VALUES (p_license_id, p_device_uuid, p_device_name, now());

  RETURN jsonb_build_object('success', true, 'code', 'SUCCESS', 'message', '기기가 활성화되었습니다.');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
END;
$function$;
  `;
  
  await client.query(sql);
  console.log('Successfully updated insert_license_activation function.');
  
  // Clean up any extraneous sessions for the user to reset state
  await client.query("DELETE FROM license_activations WHERE license_id IN (SELECT id FROM software_licenses WHERE payment_no = 'PAY-20260628-2F11B90A')");
  console.log('Cleared current sessions for testing.');

  await client.end();
}
run().catch(console.error);
