const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const sql = `
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
    v_other_active_count INT;
  BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = p_email LIMIT 1;
    IF v_user_id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'User not found.');
    END IF;

    SELECT * INTO v_sub FROM subscriptions 
    WHERE user_id = v_user_id AND plan_status IN ('ACTIVE', 'FREE') 
      AND plan_name LIKE '%데스크탑%'
    ORDER BY current_period_end DESC LIMIT 1;

    IF v_sub.id IS NULL THEN
      RETURN jsonb_build_object('success', false, 'code', 'NO_PLAN', 'message', 'No active desktop subscription.');
    END IF;

    SELECT * INTO v_lic FROM software_licenses WHERE subscription_id = v_sub.id LIMIT 1;

    -- Count existing sessions (excluding self)
    SELECT COUNT(*) INTO v_other_active_count 
    FROM license_activations 
    WHERE license_id = v_lic.id 
      AND device_uuid != p_device_uuid;

    IF v_other_active_count >= v_sub.max_devices THEN
      RETURN jsonb_build_object(
        'success', false, 
        'code', 'ERR_MAX_DEVICES_EXCEEDED', 
        'message', '동시 접속 가능 기기 수를 초과했습니다. 제한 사용자로 접근합니다.',
        'max_devices', v_sub.max_devices
      );
    END IF;

    -- Upsert
    DELETE FROM license_activations WHERE license_id = v_lic.id AND device_uuid = p_device_uuid;

    INSERT INTO public.license_activations (license_id, device_uuid, device_name, activated_at, last_active_at)
    VALUES (v_lic.id, p_device_uuid, 'Desktop App', now(), now());

    RETURN jsonb_build_object(
      'success', true,
      'code', 'SUCCESS',
      'message', 'Desktop activated.',
      'verify_key', v_lic.verify_key,
      'payment_no', v_lic.payment_no,
      'license_key', v_lic.license_key,
      'plan_name', v_sub.plan_name,
      'next_payment_date', v_sub.current_period_end
    );
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
  END;
  $function$;
  `;
  
  await client.query(sql);
  console.log('Successfully updated verify_desktop_license.');
  await client.end();
}
run().catch(console.error);
