import { corsHeaders, jsonResponse, handleOptions, getSupabaseAdmin, checkAdminAuth } from './_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error }, authResult.status);
    }

    const { data: plans, error: plansError } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (plansError) throw plansError;

    const { data: codes, error: codesError } = await supabaseAdmin
      .from('common_codes')
      .select('group_code, code_value, code_name');

    if (codesError) throw codesError;

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
    const supabaseAdmin = getSupabaseAdmin(env);

    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error === 'Forbidden' ? 'SUPER 권한만 요금제를 추가할 수 있습니다.' : authResult.error }, authResult.status);
    }

    const body = await request.json();
    const { 
      plan_code, sys_type, tagline, badge, is_free, tier_emoji, 
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd, 
      features, cta, cta_variant, is_highlighted, sort_order, is_active 
    } = body;

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .insert([{
        plan_code, sys_type, tagline, badge, is_free, tier_emoji,
        price_monthly, price_monthly_usd, price_yearly, price_yearly_usd,
        features, cta, cta_variant, is_highlighted, sort_order, is_active,
        created_by: authResult.user.id,
        updated_by: authResult.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return jsonResponse(data);
  } catch (error) {
    console.error('[Admin API] Error creating plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER']);
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

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .update({
        plan_code, sys_type, tagline, badge, is_free, tier_emoji,
        price_monthly, price_monthly_usd, price_yearly, price_yearly_usd,
        features, cta, cta_variant, is_highlighted, sort_order, is_active,
        updated_by: authResult.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return jsonResponse(data);
  } catch (error) {
    console.error('[Admin API] Error updating plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const supabaseAdmin = getSupabaseAdmin(env);

    const authResult = await checkAdminAuth(request, supabaseAdmin, ['SUPER']);
    if (authResult.error) {
      return jsonResponse({ error: authResult.error === 'Forbidden' ? 'SUPER 권한만 요금제를 삭제할 수 있습니다.' : authResult.error }, authResult.status);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return jsonResponse({ error: 'ID is required' }, 400);

    const { error } = await supabaseAdmin
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('[Admin API] Error deleting plan:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
