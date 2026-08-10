import { jsonResponse, handleOptions, getSupabaseConfig, checkAdminAuth } from '../admin/_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestPut(context) {
  try {
    const { request, env, params } = context;
    const { id } = params;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error }, authResult.status);
    }

    if (!id) return jsonResponse({ error: 'FAQ ID is required' }, 400);

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const body = await request.json();
    
    const { question, answer, is_active, sort_order } = body;
    
    const payload = {};
    if (question !== undefined) payload.question = question;
    if (answer !== undefined) payload.answer = answer;
    if (is_active !== undefined) payload.is_active = is_active;
    if (sort_order !== undefined) payload.sort_order = sort_order;
    
    if (Object.keys(payload).length > 0) {
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/faqs?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) throw new Error(`Failed to update FAQ: ${await updateRes.text()}`);
      const data = await updateRes.json();
      return jsonResponse(data && data.length > 0 ? data[0] : null);
    }
    
    return jsonResponse({ error: 'No fields to update' }, 400);
  } catch (error) {
    console.error('[FAQs API] Error updating FAQ:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env, params } = context;
    const { id } = params;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error }, authResult.status);
    }

    if (!id) return jsonResponse({ error: 'FAQ ID is required' }, 400);

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/faqs?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteRes.ok) throw new Error(`Failed to delete FAQ: ${await deleteRes.text()}`);
    
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('[FAQs API] Error deleting FAQ:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
