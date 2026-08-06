import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // 1. 활성 요금제 조회 (정렬 순서대로)
    const { data: plans, error: plansError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) throw plansError;

    // 2. 공통코드에서 표시명 가져오기
    const { data: codes, error: codesError } = await supabase
      .from('common_codes')
      .select('group_code, code_value, code_name');

    if (codesError) throw codesError;

    // 3. 데이터 병합 (name과 environment 한글명 매핑)
    const enrichedPlans = (plans || []).map(plan => {
      const planCodeInfo = codes?.find(c => c.group_code === 'PLAN_NAME' && c.code_value === plan.plan_code);
      const sysTypeInfo = codes?.find(c => c.group_code === 'SYS_TYPE' && c.code_value === plan.sys_type);

      return {
        ...plan,
        name: planCodeInfo ? planCodeInfo.code_name : plan.plan_code,
        environment_name: sysTypeInfo ? sysTypeInfo.code_name : plan.sys_type
      };
    });

    return NextResponse.json(enrichedPlans);
  } catch (error: any) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
