import { jsonResponse, handleOptions, getSupabaseConfig, checkAdminAuth } from './admin/_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    let query = `${supabaseUrl}/rest/v1/faqs?select=*&order=sort_order.asc`;
    if (!isAdmin) {
      query += `&is_active=eq.true`;
    }

    const res = await fetch(query, { headers });
    if (!res.ok) throw new Error(`Failed to fetch FAQs: ${await res.text()}`);
    
    const data = await res.json();
    return jsonResponse(data);
  } catch (error) {
    console.error('[FAQs API] Error fetching FAQs:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // admin/_shared.js의 checkAdminAuth를 통해 토큰 확인
    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const body = await request.json();
    
    const { question, answer, is_active, sort_order } = body;
    if (!question || !answer) {
      return jsonResponse({ error: 'Question and answer are required' }, 400);
    }

    const payload = {
      question,
      answer,
      is_active: is_active ?? true,
      sort_order: sort_order ?? 999,
      created_by: authResult.user.id
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/faqs`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    if (!insertRes.ok) throw new Error(`Failed to create FAQ: ${await insertRes.text()}`);
    const data = await insertRes.json();

    return jsonResponse(data && data.length > 0 ? data[0] : null);
  } catch (error) {
    console.error('[FAQs API] Error creating FAQ:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
