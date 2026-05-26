// 💡 [ Onrivi Author - 공용 독립형 프리미엄 알림 유틸리티 모듈 ]
// 이 모듈은 일렉트론 Chromium 캐시나 컴파일러 한글 인코딩 변조에 100% 독립적으로
// 한글 깨짐 현상을 원천 차단하고 보석 같은 글래스모피즘 알림창을 동적으로 꽂아 넣습니다.

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showToast = (message: string, type: ToastType = 'info') => {
  if (typeof window === 'undefined') return;

  // 1. 공용 컨테이너 확인 및 자동 생성
  let container = document.getElementById('premium-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'premium-toast-container';
    container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; width: 100%; max-width: 380px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
    document.body.appendChild(container);
  }

  // 2. 알림 본체 엘리먼트 생성
  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: auto;
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px 16px 22px;
    border-radius: 16px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.85);
    color: #1f2937;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: translateY(-15px);
    opacity: 0;
    transition: all 0.35s cubic-bezier(0.19, 1, 0.22, 1);
  `;

  // 다크모드 대응
  const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  if (isDark) {
    toast.style.background = 'rgba(18, 18, 24, 0.9)';
    toast.style.color = '#f3f4f6';
    toast.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
  }

  // 3. 상태별 스타일 & 네온 바 & SVG 아이콘 결정
  let neonColor = '';
  let iconSvg = '';
  if (type === 'success') {
    neonColor = 'linear-gradient(180deg, #10b981, #059669)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    neonColor = 'linear-gradient(180deg, #f43f5e, #e11d48)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'warning') {
    neonColor = 'linear-gradient(180deg, #f59e0b, #d97706)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    neonColor = 'linear-gradient(180deg, #0ea5e9, #0284c7)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  // 좌측 광채 네온 데코 바
  const neonBar = document.createElement('div');
  neonBar.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
    border-radius: 16px 0 0 16px;
    background: ${neonColor};
  `;
  toast.appendChild(neonBar);

  // 아이콘 컨테이너
  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = 'flex-shrink: 0; display: flex; align-items: center; justify-content: center;';
  iconWrapper.innerHTML = iconSvg;
  toast.appendChild(iconWrapper);

  // 텍스트 바디 (innerText로 유니코드 깨짐 원천 봉쇄!)
  const bodyWrapper = document.createElement('div');
  bodyWrapper.style.cssText = 'flex: 1; min-width: 0;';
  const textNode = document.createElement('p');
  textNode.style.cssText = 'margin: 0; font-size: 13.5px; font-weight: 600; line-height: 1.45; letter-spacing: -0.01em;';
  textNode.innerText = message; // 👈 텍스트 노드 바인딩으로 인코딩 깨짐을 원천 봉쇄!
  bodyWrapper.appendChild(textNode);
  toast.appendChild(bodyWrapper);

  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'flex-shrink: 0; background: none; border: none; padding: 4px; cursor: pointer; opacity: 0.35; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: currentColor;';
  closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  closeBtn.onmouseenter = () => closeBtn.style.opacity = '0.9';
  closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.35';
  closeBtn.onclick = () => {
    toast.style.transform = 'translateY(-15px) scale(0.95)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  };
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // 애니메이션 렌더링
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 40);

  // 4초 후 자동 닫힘
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateY(-10px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }
  }, 4000);
};
