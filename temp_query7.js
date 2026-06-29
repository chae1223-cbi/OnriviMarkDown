const { Client } = require('pg');

async function updateDesktopRPC() {
  const client = new Client({ connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query(`
CREATE OR REPLACE FUNCTION subscribe_desktop_plan(p_user_id uuid, p_device_uuid text, p_device_name text)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  v_subscription_id uuid;
  v_license_id uuid;
  v_license_key text;
  v_verify_key text;
  v_payment_no text;
  v_today_str text;
  v_plan_end_date text;
  v_now_timestamptz timestamptz;
BEGIN
  v_now_timestamptz := now() AT TIME ZONE 'Asia/Seoul';
  v_today_str := to_char(v_now_timestamptz, 'YYYYMMDD');
  v_plan_end_date := to_char(v_now_timestamptz + interval '1 year', 'YYYYMMDD');

  SELECT license_key INTO v_license_key FROM users WHERE id = p_user_id;
  
  IF v_license_key IS NULL OR v_license_key = '' THEN
    v_license_key := 'OMD-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));
    UPDATE users SET license_key = v_license_key WHERE id = p_user_id;
  END IF;

  UPDATE subscriptions
  SET plan_status = 'CANCELED',
      is_expired = 'Y',
      plan_end_date = v_today_str
  WHERE user_id = p_user_id
    AND is_expired = 'N'
    AND plan_name LIKE '%데스크탑%'; 

  v_subscription_id := gen_random_uuid();
  INSERT INTO subscriptions (
    id, user_id, plan_name, plan_status, billing_interval,
    max_devices, current_period_end, plan_start_date,
    is_expired, plan_end_date, created_at
  ) VALUES (
    v_subscription_id, p_user_id, '데스크탑 에디터 (연간)', 'ACTIVE', 'yearly',
    999, (v_now_timestamptz + interval '1 year'), v_today_str,
    'N', v_plan_end_date, now()
  );

  v_verify_key := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 16));
  v_payment_no := 'PAY-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 8));

  INSERT INTO software_licenses (
    id, subscription_id, user_id, license_key, verify_key,
    payment_no, is_active
  ) VALUES (
    gen_random_uuid(), v_subscription_id, p_user_id, v_license_key, v_verify_key,
    v_payment_no, true
  )
  ON CONFLICT (license_key) DO UPDATE
  SET subscription_id = EXCLUDED.subscription_id,
      verify_key = EXCLUDED.verify_key,
      payment_no = EXCLUDED.payment_no,
      is_active = true
  RETURNING id INTO v_license_id;

  DELETE FROM license_activations
  WHERE license_id = v_license_id
    AND device_uuid = p_device_uuid;

  INSERT INTO license_activations (license_id, device_uuid, device_name, activated_at)
  VALUES (v_license_id, p_device_uuid, p_device_name, now());

  RETURN jsonb_build_object(
    'success', true, 'code', 'SUCCESS', 'message', '데스크탑 결제 및 활성화 완료.',
    'license_key', v_license_key,
    'verify_key', v_verify_key,
    'payment_no', v_payment_no,
    'subscription_id', v_subscription_id,
    'license_id', v_license_id,
    'plan_end_date', v_plan_end_date
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
END;
$function$;
  `);
  console.log("Updated subscribe_desktop_plan RPC successfully");
  await client.end();
}
updateDesktopRPC().catch(console.error);
