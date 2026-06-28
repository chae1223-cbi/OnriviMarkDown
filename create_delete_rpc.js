const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.niyvcgvayofdqbebmche:chaetangsu6!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  
  const sql = `
CREATE OR REPLACE FUNCTION public.delete_license_activation(p_device_uuid text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM license_activations WHERE device_uuid = p_device_uuid;
  RETURN jsonb_build_object('success', true, 'code', 'SUCCESS');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'ERROR', 'message', SQLERRM);
END;
$function$;
  `;
  
  await client.query(sql);
  console.log('Successfully created delete_license_activation RPC.');
  await client.end();
}
run().catch(console.error);
