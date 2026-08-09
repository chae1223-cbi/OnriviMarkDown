export async function onRequestOptions() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  };
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Content-Type': 'application/json'
  };

  try {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://niyvcgvayofdqbebmche.supabase.co';
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Accept': 'application/json'
    };

    const now = new Date().toISOString();
    const url = `${supabaseUrl}/rest/v1/promotions?is_active=eq.true&or=(start_date.is.null,start_date.lte.${encodeURIComponent(now)})&or=(end_date.is.null,end_date.gte.${encodeURIComponent(now)})&select=code,title,description,end_date&order=created_at.desc&limit=1`;

    const res = await fetch(url, { headers });
    const data = await res.json();

    const promotion = (Array.isArray(data) && data.length > 0) ? data[0] : null;
    return new Response(JSON.stringify({ promotion }), { status: 200, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ promotion: null }), { status: 200, headers: corsHeaders });
  }
}
