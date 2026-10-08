// 🚨 @PATCH : 2026-10-08 — R2 스토리지 및 DB 연계 불필요한 콘텐츠 영구 삭제(DELETE) 기능 추가
// 🚨 @PATCH : 2026-10-08 — 사용자 개인 에디터 첨부 제외 공식 콘텐츠(고객 문의 첨부, 기술 블로그 에셋) 통합 관리 API 신규 구축
import { handleOptions, checkAdminAuth } from './_shared.js';
import { withBlogTransaction, blogJson } from '../blog/_db.js';

export const onRequestOptions = handleOptions;

// URL에서 파일명 디코딩 추출 유틸
function extractFileName(url) {
  if (!url) return 'unknown';
  try {
    const parsed = new URL(url);
    const queryName = parsed.searchParams.get('name');
    if (queryName) return decodeURIComponent(queryName);
    const pathname = parsed.pathname;
    const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
    return decodeURIComponent(lastPart) || 'file';
  } catch {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1].split('?')[0]) || 'file';
  }
}

// URL에서 R2 키 추출 유틸
function extractR2Key(url) {
  if (!url) return null;
  if (url.includes('/api/image/')) {
    const rawKey = url.split('/api/image/')[1].split('?')[0];
    try {
      let key = decodeURIComponent(rawKey);
      if (key.includes('%')) key = decodeURIComponent(key);
      return key;
    } catch {
      return rawKey;
    }
  }
  return null;
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return blogJson({ success: false, error: authResult.error }, authResult.status || 403);
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const typeFilter = url.searchParams.get('type') || 'ALL'; // ALL, INQUIRY, BLOG

    const result = await withBlogTransaction(env, async db => {
      // 1. 고객 문의 첨부파일 수집 (사용자 개인 에디터 문서는 철저히 제외, 문의 접수 첨부만)
      const inquiryRes = await db.query(`
        SELECT 
          i.id as source_id,
          i.title as source_title,
          i.email as author,
          i.created_at,
          url as file_url
        FROM public.support_inquiries i,
        LATERAL unnest(i.attachment_urls) as url
        WHERE url IS NOT NULL AND url != ''
        ORDER BY i.created_at DESC
      `);

      const inquiryItems = inquiryRes.rows.map((row, idx) => ({
        id: `inquiry_${row.source_id}_${idx}`,
        category: 'INQUIRY',
        category_name: '고객 문의 첨부',
        url: row.file_url,
        file_name: extractFileName(row.file_url),
        source_title: row.source_title || '고객 문의 첨부파일',
        source_id: row.source_id,
        author: row.author || '익명/회원',
        created_at: row.created_at,
        source_type: 'support'
      }));

      // 2. 기술 블로그 공식 에셋 수집 (커버 이미지 및 본문 미디어 에셋)
      const blogRevRes = await db.query(`
        SELECT 
          r.post_id as source_id,
          r.title as source_title,
          r.author_name as author,
          r.content,
          r.cover_image,
          r.created_at
        FROM public.blog_post_revisions r
        ORDER BY r.created_at DESC
      `);

      const blogItems = [];
      const seenBlogUrls = new Set();

      for (const rev of blogRevRes.rows) {
        // 커버 이미지
        if (rev.cover_image && !seenBlogUrls.has(rev.cover_image)) {
          seenBlogUrls.add(rev.cover_image);
          blogItems.push({
            id: `blog_cover_${rev.source_id}`,
            category: 'BLOG',
            category_name: '블로그 커버 에셋',
            url: rev.cover_image,
            file_name: extractFileName(rev.cover_image),
            source_title: rev.source_title || '기술 블로그 커버',
            source_id: rev.source_id,
            author: rev.author || '온리비 팀',
            created_at: rev.created_at,
            source_type: 'blog'
          });
        }

        // 본문 이미지 정규식 매칭 (![...](url))
        if (rev.content) {
          const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g;
          let match;
          let imgIdx = 0;
          while ((match = imgRegex.exec(rev.content)) !== null) {
            const imgUrl = match[2];
            if (imgUrl && !seenBlogUrls.has(imgUrl) && !imgUrl.includes('example.com')) {
              seenBlogUrls.add(imgUrl);
              blogItems.push({
                id: `blog_content_${rev.source_id}_${imgIdx++}`,
                category: 'BLOG',
                category_name: '블로그 본문 에셋',
                url: imgUrl,
                file_name: extractFileName(imgUrl),
                source_title: rev.source_title || '기술 블로그 본문',
                source_id: rev.source_id,
                author: rev.author || '온리비 팀',
                created_at: rev.created_at,
                source_type: 'blog'
              });
            }
          }
        }
      }

      // 3. 통계 집계
      const stats = {
        total: inquiryItems.length + blogItems.length,
        inquiry: inquiryItems.length,
        blog: blogItems.length
      };

      // 4. 통합 및 필터링
      let allItems = [];
      if (typeFilter === 'INQUIRY') {
        allItems = inquiryItems;
      } else if (typeFilter === 'BLOG') {
        allItems = blogItems;
      } else {
        allItems = [...inquiryItems, ...blogItems];
      }

      // 최신순 정렬
      allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 검색어 필터링
      if (search) {
        allItems = allItems.filter(item =>
          item.file_name.toLowerCase().includes(search) ||
          item.source_title.toLowerCase().includes(search) ||
          item.author.toLowerCase().includes(search) ||
          item.url.toLowerCase().includes(search)
        );
      }

      const totalFiltered = allItems.length;
      const paginatedItems = allItems.slice((page - 1) * limit, page * limit);

      return {
        data: paginatedItems,
        total: totalFiltered,
        stats
      };
    });

    return blogJson({
      success: true,
      data: result.data,
      total: result.total,
      stats: result.stats,
      page,
      limit,
      canManage: authResult.adminData?.admin_role === 'SUPER',
      asOf: new Date().toISOString()
    });
  } catch (error) {
    console.error('[/api/admin/contents] Error fetching contents:', error);
    return blogJson({ success: false, error: error.message }, 500);
  }
}

// 💥 DELETE: 콘텐츠 파일 삭제 및 스토리지/DB 동기화
export async function onRequestDelete(context) {
  try {
    const { request, env } = context;

    const authResult = await checkAdminAuth(request, env, ['SUPER', 'SUPPORT']);
    if (authResult.error) {
      return blogJson({ success: false, error: authResult.error }, authResult.status || 403);
    }

    const body = await request.json();
    const { url, source_id, category, reason } = body;

    if (!url) {
      return blogJson({ success: false, error: '삭제할 파일 URL이 누락되었습니다.' }, 400);
    }

    // 1. R2 버킷에서 파일 실제 삭제
    const r2Key = extractR2Key(url);
    if (r2Key && env.R2_BUCKET) {
      try {
        await env.R2_BUCKET.delete(r2Key);
        console.log(`[R2_DELETE] Successfully deleted from R2: ${r2Key}`);
      } catch (r2Err) {
        console.warn(`[R2_DELETE] Failed to delete from R2 (${r2Key}):`, r2Err);
      }
    }

    // 2. 데이터베이스 참조 정리
    await withBlogTransaction(env, async db => {
      if (category === 'INQUIRY' && source_id) {
        // 고객 문의 첨부파일 목록에서 해당 URL 제거
        await db.query(`
          UPDATE public.support_inquiries
          SET attachment_urls = array_remove(attachment_urls, $1)
          WHERE id = $2::uuid
        `, [url, source_id]);
      } else if (category === 'BLOG' && source_id) {
        // 블로그 포스트 커버 이미지인 경우 null 처리
        await db.query(`
          UPDATE public.blog_post_revisions
          SET cover_image = NULL
          WHERE post_id = $1::uuid AND cover_image = $2
        `, [source_id, url]);
      }

      // 3. 관리자 감사 로그 기록
      try {
        await db.query(`
          INSERT INTO public.user_audit_logs (admin_id, action_type, reason, created_at)
          VALUES ($1, 'CONTENT_DELETE', $2, now())
        `, [
          authResult.adminData?.user_id || null,
          `콘텐츠 파일 삭제: [${category || 'ASSET'}] ${extractFileName(url)} (${reason || '불필요한 파일 관리자 삭제'})`
        ]);
      } catch (auditErr) {
        console.warn('Failed to insert audit log for content delete:', auditErr);
      }
    });

    return blogJson({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      deleted_url: url
    });
  } catch (error) {
    console.error('[/api/admin/contents] Error deleting content:', error);
    return blogJson({ success: false, error: error.message }, 500);
  }
}
