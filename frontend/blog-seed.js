/** 초기 블로그 글 4개를 한 DB 트랜잭션에서 1회 이관한다. 기존 slug는 건드리지 않는다. */
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.BLOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('BLOG_DATABASE_URL 또는 DATABASE_URL이 필요합니다.');
  const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/generated/blogSnapshot.json'), 'utf8'));
  const db = new Client({
    connectionString: databaseUrl,
    ssl: process.env.BLOG_DATABASE_CA_CERT
      ? { ca: process.env.BLOG_DATABASE_CA_CERT.replace(/\\n/g, '\n'), rejectUnauthorized: true }
      : { rejectUnauthorized: false },
  });
  await db.connect();
  try {
    await db.query('BEGIN');
    for (const post of posts) {
      const existing = await db.query('SELECT id FROM public.blog_posts WHERE slug = $1 FOR UPDATE', [post.slug]);
      if (existing.rows.length) continue;
      const inserted = await db.query(
        `INSERT INTO public.blog_posts
          (slug, category, is_featured, desired_public, deployment_status, published_at)
         VALUES ($1, $2, $3, true, 'live', $4) RETURNING id`,
        [post.slug, post.category, Boolean(post.isFeatured), post.publishedAt.replace(/\./g, '-')],
      );
      const revision = await db.query(
        `INSERT INTO public.blog_post_revisions
          (post_id, title, excerpt, content, cover_image, tags, author_name, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [inserted.rows[0].id, post.title, post.excerpt, post.content,
          post.coverImage || null, post.tags, post.author, post.publishedAt.replace(/\./g, '-')],
      );
      await db.query(
        'UPDATE public.blog_posts SET target_revision_id = $2, live_revision_id = $2 WHERE id = $1',
        [inserted.rows[0].id, revision.rows[0].id],
      );
    }
    await db.query('COMMIT');
    console.log('[blog-seed] 초기 글 이관 완료');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }
}

main().catch(error => { console.error('[blog-seed]', error); process.exit(1); });
