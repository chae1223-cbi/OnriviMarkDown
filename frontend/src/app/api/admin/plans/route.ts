import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || !['SUPER', 'SUPPORT'].includes(adminData.admin_role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. 모든 요금제 조회 (활성화/비활성화 모두)
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (plansError) throw plansError;

    // 2. 공통코드에서 표시명 가져오기
    const { data: codes, error: codesError } = await supabaseAdmin
      .from('common_codes')
      .select('group_code, code_value, code_name');

    if (codesError) throw codesError;

    // 3. 데이터 병합
    const enrichedPlans = (plans || []).map((plan: any) => {
      const planCodeInfo = codes?.find((c: any) => c.group_code === 'PLAN_NAME' && c.code_value === plan.plan_code);
      const sysTypeInfo = codes?.find((c: any) => c.group_code === 'SYS_TYPE' && c.code_value === plan.sys_type);

      return {
        ...plan,
        name: planCodeInfo ? planCodeInfo.code_name : plan.plan_code,
        environment_name: sysTypeInfo ? sysTypeInfo.code_name : plan.sys_type
      };
    });

    return NextResponse.json(enrichedPlans);
  } catch (error: any) {
    console.error('Admin plans GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role (SUPER ONLY for POST)
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.admin_role !== 'SUPER') {
      return NextResponse.json({ error: 'SUPER 권한만 요금제를 추가할 수 있습니다.' }, { status: 403 });
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
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin plans POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role (SUPER ONLY for PATCH)
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.admin_role !== 'SUPER') {
      return NextResponse.json({ error: 'SUPER 권한만 요금제를 수정할 수 있습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      id, plan_code, sys_type, tagline, badge, is_free, tier_emoji, 
      price_monthly, price_monthly_usd, price_yearly, price_yearly_usd, 
      features, cta, cta_variant, is_highlighted, sort_order, is_active 
    } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .update({
        plan_code, sys_type, tagline, badge, is_free, tier_emoji,
        price_monthly, price_monthly_usd, price_yearly, price_yearly_usd,
        features, cta, cta_variant, is_highlighted, sort_order, is_active,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin plans PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check admin role (SUPER ONLY for DELETE)
    const { data: adminData } = await supabaseAdmin
      .from('admins')
      .select('admin_role')
      .eq('user_id', user.id)
      .single();

    if (!adminData || adminData.admin_role !== 'SUPER') {
      return NextResponse.json({ error: 'SUPER 권한만 요금제를 삭제할 수 있습니다.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin plans DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
