import { corsHeaders, jsonResponse, handleOptions, getSupabaseConfig, checkAdminAuth } from './_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const plansRes = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?select=*&order=sort_order.asc`, { headers });
    if (!plansRes.ok) throw new Error(`Failed to fetch plans: ${await plansRes.text()}`);
    const plans = await plansRes.json();

    const codesRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?select=group_code,code_value,code_name`, { headers });
    let codes = [];
    if (codesRes.ok) {
      codes = await codesRes.json();
    }

    const enrichedPlans = (plans || []).map(plan => {
      const planCodeInfo = codes?.find(c => c.group_code === 'PLAN_NAME' && c.code_value === plan.plan_code);
      const sysTypeInfo = codes?.find(c => c.group_code === 'SYS_TYPE' && c.code_value === plan.sys_type);

      return {
        ...plan,
        name: planCodeInfo ? planCodeInfo.code_name : plan.plan_code,
        environment_name: sysTypeInfo ? sysTypeInfo.code_name : plan.sys_type
      };
    });

    return jsonResponse(enrichedPlans);
  } catch (error) {
    console.error('[Admin API] Error fetching plans:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    const authResult = await checkAdminAuth(request, env, ['SUPER']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error === 'Forbidden' ? 'SUPER 권한만 요금제를 추가할 수 있습니다.' : authResult.error }, authResult.status);
    }

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    const body = await request.json();
    const { 
      plan_code, sys_type, tagline, badge, is_free, tier_emoji, 
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd, 
      features, cta, cta_variant, is_highlighted, sort_order, is_active 
    } = body;

    const payload = {
      plan_code, sys_type, tagline, badge, is_free, tier_emoji,
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd,
      features, cta, cta_variant, is_highlighted, sort_order, is_active,
      created_by: authResult.user.id,
      updated_by: authResult.user.id
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/pricing_plans`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    if (!insertRes.ok) throw new Error(`Failed to create plan: ${await insertRes.text()}`);
    const data = await insertRes.json();

    return jsonResponse(data && data.length > 0 ? data[0] : null);
  } catch (error) {
    console.error('[Admin API] Error creating plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    
    const authResult = await checkAdminAuth(request, env, ['SUPER']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error === 'Forbidden' ? 'SUPER 권한만 요금제를 수정할 수 있습니다.' : authResult.error }, authResult.status);
    }

    const body = await request.json();
    const { 
      id, plan_code, sys_type, tagline, badge, is_free, tier_emoji, 
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd, 
      features, cta, cta_variant, is_highlighted, sort_order, is_active 
    } = body;

    if (!id) return jsonResponse({ error: 'ID is required' }, 400);

    const { supabaseUrl, headers } = getSupabaseConfig(env);
    
    const payload = {
      plan_code, sys_type, tagline, badge, is_free, tier_emoji,
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd,
      features, cta, cta_variant, is_highlighted, sort_order, is_active,
      updated_by: authResult.user.id,
      updated_at: new Date().toISOString()
    };

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    if (!updateRes.ok) throw new Error(`Failed to update plan: ${await updateRes.text()}`);
    const data = await updateRes.json();

    return jsonResponse(data && data.length > 0 ? data[0] : null);
  } catch (error) {
    console.error('[Admin API] Error updating plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error === 'Forbidden' ? 'SUPER 권한만 요금제를 삭제할 수 있습니다.' : authResult.error }, authResult.status);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return jsonResponse({ error: 'ID is required' }, 400);

    const { supabaseUrl, headers } = getSupabaseConfig(env);

    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });

    if (!deleteRes.ok) throw new Error(`Failed to delete plan: ${await deleteRes.text()}`);
    
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('[Admin API] Error deleting plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
