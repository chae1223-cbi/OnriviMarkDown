import { getBlogUser, withBlogTransaction, blogJson } from '../blog/_db.js';

// 다른 브라우저에서 세션을 해제했는지 확인한다. 현재 사용자 소유의 웹 세션만 조회한다.
export async function onRequestGet({ request, env }) {
  try {
    const user = await getBlogUser(request, env);
    if (!user?.id) return blogJson({ error: '로그인이 필요합니다.' }, 401);

    const deviceUuid = new URL(request.url).searchParams.get('device_uuid');
    if (!deviceUuid || deviceUuid.length > 200) return blogJson({ error: '기기 정보가 올바르지 않습니다.' }, 400);

    const exists = await withBlogTransaction(env, async db => {
      const result = await db.query(`
        SELECT 1 FROM public.license_activations AS activation
        JOIN public.subscriptions AS subscription ON subscription.id = activation.subscription_id
        WHERE subscription.user_id = $1 AND activation.device_uuid = $2
          AND lower(trim(coalesce(activation.device_name, ''))) IN ('web saas', 'web browser')
        LIMIT 1`, [user.id, deviceUuid]);
      return result.rows.length > 0;
    });
    return blogJson({ exists });
  } catch (error) {
    console.error('[session-status] lookup failed', error);
    return blogJson({ error: '세션 확인에 실패했습니다.' }, 500);
  }
}
