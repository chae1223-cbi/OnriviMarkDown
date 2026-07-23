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
    AS $$
      DECLARE
        v_user_id uuid;
        v_sub public.subscriptions%ROWTYPE;
        v_rank INT;
      BEGIN
        SELECT id INTO v_user_id FROM public.users WHERE email = p_email LIMIT 1;
        IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'User not found.'); END IF;

        SELECT * INTO v_sub FROM public.subscriptions 
        WHERE user_id = v_user_id AND is_active = true AND plan_status IN ('ACTIVE', 'FREE') AND (plan_name LIKE '%데스크탑%' OR plan_name = 'ELITEPRO') 
        ORDER BY current_period_end DESC LIMIT 1;
        
        IF v_sub.id IS NULL THEN RETURN jsonb_build_object('success', false, 'code', 'NO_PLAN', 'message', 'No active desktop subscription.'); END IF;

        IF NOT EXISTS (SELECT 1 FROM public.license_activations WHERE subscription_id = v_sub.id AND device_uuid = p_device_uuid) THEN
          IF (SELECT COUNT(*) FROM public.license_activations WHERE subscription_id = v_sub.id) >= 1 THEN
            RETURN jsonb_build_object('success', false, 'code', 'ERR_MAX_DEVICES_EXCEEDED', 'message', '동시 접속 가능 기기 수를 초과했습니다.');
          END IF;
          INSERT INTO public.license_activations (subscription_id, device_uuid, device_name, activated_at, updated_at)
          VALUES (v_sub.id, p_device_uuid, 'Desktop App', now(), now());
        END IF;

        UPDATE public.license_activations SET updated_at = now() WHERE subscription_id = v_sub.id AND device_uuid = p_device_uuid;

        SELECT rank INTO v_rank
        FROM (
          SELECT device_uuid, ROW_NUMBER() OVER (ORDER BY activated_at ASC) as rank
          FROM public.license_activations
          WHERE subscription_id = v_sub.id AND device_name = 'Desktop App'
        ) ranked
        WHERE device_uuid = p_device_uuid;

        IF v_rank > 1 THEN
          RETURN jsonb_build_object(
            'success', false, 'code', 'ERR_MAX_DEVICES_EXCEEDED', 'message', '동시 접속 가능 기기 수를 초과했습니다. 제한 사용자로 접근합니다.',
            'max_devices', 1, 'verify_key', v_sub.verify_key, 'payment_no', v_sub.payment_no, 'license_key', v_sub.license_key, 'plan_name', v_sub.plan_name, 'next_payment_date', v_sub.current_period_end, 'rank', v_rank
          );
        END IF;

        RETURN jsonb_build_object(
          'success', true, 'code', 'SUCCESS', 'message', 'Desktop activated.', 'verify_key', v_sub.verify_key, 'payment_no', v_sub.payment_no, 'license_key', v_sub.license_key, 'plan_name', v_sub.plan_name, 'next_payment_date', v_sub.current_period_end, 'rank', v_rank
        );
      EXCEPTION
        WHEN OTHERS THEN RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
      END;
    $$;
  `;
  
  await client.query(sql);
  console.log('RPC verify_desktop_license successfully updated!');
  await client.end();
}

run().catch(console.error);
