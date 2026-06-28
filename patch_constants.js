const fs = require('fs');
let content = fs.readFileSync('frontend/src/lib/constants.tsx', 'utf8');

const regex = /cta:\s*"프리미엄 플랜 구독",\s*ctaVariant:\s*"secondary",\s*\},\s*\];/;

const desktopPlan = `cta: "프리미엄 플랜 구독",
    ctaVariant: "secondary",
  },
  {
    name: "데스크탑 에디터",
    tagline: "데스크탑 전용 에디터 플랜",
    priceMonthly: 15000,
    priceUSD: "10$",
    features: [
      "데스크탑 앱 무제한 사용",
      "오프라인 환경 편집 완벽 지원",
      "웹 에디터 제외"
    ],
    cta: "데스크탑 플랜 구독",
    ctaVariant: "secondary",
  },
];`;

content = content.replace(regex, desktopPlan);

fs.writeFileSync('frontend/src/lib/constants.tsx', content);
console.log('Added desktop plan to constants.tsx');
