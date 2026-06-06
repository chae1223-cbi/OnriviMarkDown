/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 데스크톱 앱을 위한 정적 HTML 내보내기 활성화
  assetPrefix: './', // 로컬 file:// 프로토콜에서 정적 리소스(CSS, JS 등)를 상대 경로로 참조하도록 설정
  images: {
    unoptimized: true, // 정적 빌드 시 이미지 최적화 경고 방지
  },
  reactStrictMode: false, // 잦은 새로고침 시 충돌 완화를 위해 잠시 비활성화
  webpack: (config, { dev, isServer, webpack }) => {
    // Windows 파일 잠금 이슈 완화를 위한 웹팩 캐시 비활성화 (개발 모드 전용)
    if (dev && !isServer) {
      config.cache = false;
    }

    // 정적 내보내기를 위해 추출된 CSS 내의 상대 폰트 URL 수정
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
