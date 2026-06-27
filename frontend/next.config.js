/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 데스크톱/애드온을 위한 정적 HTML 내보내기 생성
  productionBrowserSourceMaps: true, // 🔍 [임시] TDZ 에러 추적용 소스맵 활성화
  assetPrefix: process.env.ASSET_PREFIX !== undefined ? process.env.ASSET_PREFIX : '', // cloudflare/web: (기본) '', desktop: ASSET_PREFIX=./
  images: {
    unoptimized: true, // ?적 빌드 ????지 최적??경고 방?
  },
  reactStrictMode: false, // ??? ?로고침 ??충돌 ?화??해 ?시 비활?화
  generateBuildId: async () => {
    // 매 빌드 타임의 타임스탬프를 ID로 사용하여 브라우저 정적 파일 캐시 강제 무력화(Bust)
    return `build-${new Date().getTime()}`;
  },
  webpack: (config, { dev, isServer, webpack }) => {
    // Windows ?일 ?금 ?슈 ?화??한 ?팩 캐시 비활?화 (개발 모드 ?용)
    if (dev && !isServer) {
      config.cache = false;
    }

    // ?�적 ?�보?�기�??�해 추출??CSS ?�의 ?��? ?�트 URL ?�정
    if (!isServer) {
      class FixCssFontUrlsPlugin {
        apply(compiler) {
          compiler.hooks.thisCompilation.tap('FixCssFontUrls', (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: 'FixCssFontUrls',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
              },
              (assets) => {
                for (const [name, asset] of Object.entries(assets)) {
                  if (name.endsWith('.css')) {
                    let source = asset.source();
                    if (typeof source === 'string' && source.includes('url(_next/static/media/')) {
                      source = source
                        .replace(/url\(_next\/static\/media\//g, 'url(../media/')
                        .replace(/url\('_next\/static\/media\//g, "url('../media/")
                        .replace(/url\("_next\/static\/media\//g, 'url("../media/');
                      compilation.updateAsset(
                        name,
                        new webpack.sources.RawSource(source)
                      );
                    }
                  }
                }
              }
            );
          });
        }
      }
      config.plugins.push(new FixCssFontUrlsPlugin());
    }

    return config;
  },
};

module.exports = nextConfig;

