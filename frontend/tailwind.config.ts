// ====================================================================
// 📊 [OMD-CONFIG-tailwind-0001] tailwind.config ➔ Config
// 🎯 @KICK  : TailwindCSS 컴파일러 설정 및 컬러/폰트/스페이싱 변수 셋업
// 🛡️ @GUARD : 기존 에디터 CSS 변수 기반 컬러 유지, OMDLanding 스타일 주입
// 🚨 @PATCH : **2026-06-21** — OMDLanding 이식에 필요한 세부 컬러, 폰트패밀리, 라운딩, 스페이싱 병합 패치
// 🔗 @CALLS : 없음
// ====================================================================
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 기존 에디터 CSS 변수 기반 색상 유지
        primary: "rgb(var(--primary) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "surface-dim": "rgb(var(--surface-dim) / <alpha-value>)",
        "surface-bright": "rgb(var(--surface-bright) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant) / <alpha-value>)",
        outline: "rgb(var(--outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",

        // OMDLanding 전용 색상 추가
        "surface-container-low": "#f5f2ff",
        "on-tertiary-container": "#ea7a5a",
        "surface-container-lowest": "#ffffff",
        "primary-fixed": "#e2dfff",
        "on-secondary-fixed-variant": "#3322cc",
        "inverse-on-surface": "#f3effb",
        "on-tertiary": "#ffffff",
        "on-secondary-container": "#fffbff",
        "on-secondary-fixed": "#0f0069",
        "surface-container-high": "#eae7ee",
        "on-primary": "#ffffff",
        "surface-variant": "#e4e1ed",
        "surface-container": "#f0ecf3",
        "on-tertiary-fixed": "#3b0900",
        "tertiary-fixed": "#ffdbd1",
        "secondary-container": "#655dfb",
        "error": "#ba1a1a",
        "inverse-surface": "#302f38",
        "inverse-primary": "#c3c0ff",
        "secondary-fixed": "#e2dfff",
        "on-primary-fixed": "#0f0069",
        "on-primary-fixed-variant": "#372cbc",
        "on-tertiary-fixed-variant": "#7f2a11",
        "primary-fixed-dim": "#c3c0ff",
        "on-secondary": "#ffffff",
        "surface-tint": "#5049d4",
        "primary-container": "#1e00a9",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "tertiary-container": "#621500",
        "secondary": "#4b41e1",
        "on-background": "#1b1b23",
        "surface-container-highest": "#e4e1ee",
        "error-container": "#ffdad6",
        "secondary-fixed-dim": "#c3c0ff",
        "tertiary-fixed-dim": "#ffb5a0",
        "tertiary": "#3d0a00",
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "space-8": "2.75rem",
        "space-4": "1.4rem",
        "space-20": "5rem",
        "space-24": "6rem",
        "space-10": "3.5rem"
      },
      fontFamily: {
        ui: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        editor: ["JetBrains Mono", "Fira Code", "monospace"],
        "label-sm": ["JetBrains Mono"],
        "display-sm": ["Inter"],
        "code-block": ["JetBrains Mono"],
        "headline-sm": ["Inter"],
        "body-lg": ["Inter"],
        "label-md": ["JetBrains Mono"],
        "display-lg": ["Inter"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "1.4", "fontWeight": "500" }],
        "display-sm": ["36px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "code-block": ["14px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-sm": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-lg": ["16px", { "lineHeight": "1.75", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "1.5", "fontWeight": "500" }],
        "display-lg": ["56px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }]
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
