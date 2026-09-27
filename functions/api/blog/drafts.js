import { withBlogTransaction, requireBlogCategory, getBlogUser, blogJson } from './_db.js';

// ====================================================================
// 📊 [OMD-IO-0041] frontend/functions/api/blog/drafts.js ➔ onRequestPost
// 🎯 @KICK  : 로그인 사용자의 블로그 초안을 DB 자동번호 주소와 함께 한 트랜잭션으로 저장한다.
// 🛡️ @GUARD : 분류와 입력 길이를 검증하고 주소는 클라이언트 값 대신 DB 기본값으로 발급한다.
// 🔗 @CALLS : getBlogUser(), withBlogTransaction(), Client.query(), blogJson()
// ====================================================================
export async function onRequestPost({ request, env }) {
  try {
    const user = await getBlogUser(request, env);
    if (!user?.id) return blogJson({ error: '로그인이 필요합니다.' }, 401);
    const body = await request.json();
    const title = String(body.title || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const content = String(body.content || '');
    const category = String(body.category || '');
    const coverImage = String(body.coverImage || '').trim() || null;
    const tags = Array.isArray(body.tags) ? body.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 20) : [];
    if (!title || title.length > 200 || excerpt.length > 600 || content.length > 300000 ||
        (coverImage && coverImage.length > 2048)) {
      return blogJson({ error: '제목 또는 본문 입력값을 확인해 주세요.' }, 400);
    }

    const saved = await withBlogTransaction(env, async db => {
      await requireBlogCategory(db, category);
      const inserted = await db.query(
        'INSERT INTO public.blog_posts (author_id, category) VALUES ($1, $2) RETURNING id, slug',
        [user.id, category],
      );
      const postId = inserted.rows[0].id;
      const revision = await db.query(
        `INSERT INTO public.blog_post_revisions
          (post_id, title, excerpt, content, cover_image, tags, author_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [postId, title, excerpt, content, coverImage, tags, 'Onrivi Author'],
      );
      await db.query(
        `UPDATE public.blog_posts SET category = $2, target_revision_id = $3,
          deployment_status = 'draft', updated_at = now() WHERE id = $1`,
        [postId, category, revision.rows[0].id],
      );
      return { id: postId, slug: inserted.rows[0].slug, revisionId: revision.rows[0].id, status: 'draft' };
    });
    return blogJson(saved, 201);
  } catch (error) {
    console.error('[blog drafts] save failed', error);
    return blogJson({ error: error.message || '초안 저장 실패' }, error.status || (error.code === '23505' ? 409 : 500));
  }
}
