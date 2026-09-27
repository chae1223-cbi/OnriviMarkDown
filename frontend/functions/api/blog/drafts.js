import { withBlogTransaction, requireBlogCategory, getBlogUser, blogJson } from './_db.js';

// ====================================================================
// 📊 [OMD-IO-0041] frontend/functions/api/blog/drafts.js ➔ onRequestPost
// 🎯 @KICK  : 로그인 사용자의 블로그 초안을 게시글·리비전 한 트랜잭션으로 저장한다.
// 🛡️ @GUARD : 소유자와 공개 상태를 확인하고 슬러그 중복·입력 길이를 검증한다.
// 🔗 @CALLS : getBlogUser(), withBlogTransaction(), Client.query(), blogJson()
// ====================================================================
export async function onRequestPost({ request, env }) {
  try {
    const user = await getBlogUser(request, env);
    if (!user?.id) return blogJson({ error: '로그인이 필요합니다.' }, 401);
    const body = await request.json();
    const slug = String(body.slug || '').trim().toLowerCase();
    const title = String(body.title || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const content = String(body.content || '');
    const category = String(body.category || '');
    const coverImage = String(body.coverImage || '').trim() || null;
    const tags = Array.isArray(body.tags) ? body.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 20) : [];
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 120 ||
        !title || title.length > 200 || excerpt.length > 600 || content.length > 300000 ||
        (coverImage && coverImage.length > 2048)) {
      return blogJson({ error: '제목, 주소 또는 본문 입력값을 확인해 주세요.' }, 400);
    }

    const saved = await withBlogTransaction(env, async db => {
      await requireBlogCategory(db, category);
      const existing = await db.query(
        'SELECT id, author_id, desired_public FROM public.blog_posts WHERE slug = $1 AND deleted_at IS NULL FOR UPDATE',
        [slug],
      );
      let postId;
      if (existing.rows.length) {
        const post = existing.rows[0];
        if (post.author_id !== user.id || post.desired_public) {
          const error = new Error('이미 사용 중인 주소입니다.');
          error.status = 409;
          throw error;
        }
        postId = post.id;
      } else {
        const inserted = await db.query(
          'INSERT INTO public.blog_posts (slug, author_id, category) VALUES ($1, $2, $3) RETURNING id',
          [slug, user.id, category],
        );
        postId = inserted.rows[0].id;
      }
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
      return { id: postId, slug, revisionId: revision.rows[0].id, status: 'draft' };
    });
    return blogJson(saved, 201);
  } catch (error) {
    console.error('[blog drafts] save failed', error);
    return blogJson({ error: error.message || '초안 저장 실패' }, error.status || (error.code === '23505' ? 409 : 500));
  }
}
