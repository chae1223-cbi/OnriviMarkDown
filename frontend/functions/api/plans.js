import { jsonResponse, handleOptions, getSupabaseConfig } from './admin/_shared.js';

export const onRequestOptions = handleOptions;

export async function onRequestGet(context) {
  try {
    const { env } = context;
    const { supabaseUrl, headers } = getSupabaseConfig(env);

    // 1. 활성 요금제 조회
    const plansRes = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?select=*&is_active=eq.true&order=sort_order.asc`, { headers });
    if (!plansRes.ok) throw new Error(`Failed to fetch plans: ${await plansRes.text()}`);
    const plans = await plansRes.json();

    // 2. 공통코드에서 표시명 가져오기
    const codesRes = await fetch(`${supabaseUrl}/rest/v1/common_codes?select=group_code,code_value,code_name`, { headers });
    let codes = [];
    if (codesRes.ok) {
      codes = await codesRes.json();
    }

    // 3. 데이터 병합
    const enrichedPlans = (plans || []).map(plan => {
      const planCodeInfo = codes?.find(c => c.group_code === 'PLAN_NAME' && c.code_value === plan.plan_code);
      const sysTypeInfo = codes?.find(c => c.group_code === 'SYS_TYPE' && c.code_value === plan.sys_type);

      let parsedFeatures = plan.features;
      if (typeof parsedFeatures === 'string') {
        try {
          parsedFeatures = JSON.parse(parsedFeatures);
        } catch (e) {
          parsedFeatures = [];
        }
      }

      return {
        ...plan,
        features: parsedFeatures,
        name: planCodeInfo ? planCodeInfo.code_name : plan.plan_code,
        environment_name: sysTypeInfo ? sysTypeInfo.code_name : plan.sys_type
      };
    });

    return jsonResponse(enrichedPlans);
  } catch (error) {
    console.error('[Public API] Error fetching plans:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}
