/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 데스크톱/애드온을 위한 정적 HTML 내보내기 생성
  productionBrowserSourceMaps: true, // 🔍 [임시] TDZ 에러 추적용 소스맵 활성화
  assetPrefix: './', // 로컬 file:// 프로토콜에서 정적 리소스(CSS, JS 등)의 경로를 상대 참조하도록 설정
  images: {
    unoptimized: true, // ?�적 빌드 ???��?지 최적??경고 방�?
  },
  reactStrictMode: false, // ??? ?�로고침 ??충돌 ?�화�??�해 ?�시 비활?�화
  webpack: (config, { dev, isServer, webpack }) => {
    // Windows ?�일 ?�금 ?�슈 ?�화�??�한 ?�팩 캐시 비활?�화 (개발 모드 ?�용)
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

