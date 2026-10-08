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
