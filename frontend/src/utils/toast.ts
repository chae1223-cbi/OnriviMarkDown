// 💡 [ Onrivi Author - 공용 독립형 프리미엄 '토마토 테마' 알림 유틸리티 모듈 ]
// 이 모듈은 일렉트론 Chromium 캐시나 컴파일러 한글 인코딩 변조에 100% 독립적으로
// 한글 깨짐 현상을 원천 차단하고 보석 같은 글래스모피즘 알림창을 동적으로 꽂아 넣습니다.
// 사용자 요청에 따라 영롱하고 화사한 '토마토(Tomato, #FF6347)' 테마 기조로 제작되었습니다.

// ====================================================================
// 📊 [OMD-EDIT-toast-0002] toast ➔ ToastType
// 🎯 @KICK  : Toast 알림의 유형을 정의하는 유니온 타입을 선언한다
// 🛡️ @GUARD : 'success' | 'error' | 'info' | 'warning' 네 가지 값만 허용
// 🚨 @PATCH : 없음
// 🔗 @CALLS : showToast
// ====================================================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// ====================================================================
// 📊 [OMD-EDIT-toast-0001] toast ➔ showToast
// 🎯 @KICK  : 화면 우측 상단에 프리미엄 토마토 테마 Toast 알림을 동적으로 생성하여 표시한다
// 🛡️ @GUARD : SSR 환경에서는 early return, 컨테이너 미존재 시 생성
// 🚨 @PATCH : 없음
// 🔗 @CALLS : ToastType
// ====================================================================
/**
 * 화면 우측 상단에 프리미엄 토마토 테마의 Toast 알림을 동적으로 생성하여 띄워줍니다.
 * @param message 표시할 알림 메시지 내용
 * @param type 알림의 성격 ('success', 'error', 'info', 'warning')
 */
export const showToast = (message: string, type: ToastType = 'info') => {
  if (typeof window === 'undefined') return;

  // 1. 알림 컨테이너가 없으면 body 하단에 생성 및 고유 스타일 부여 (Flex 레이아웃 구조)
  let container = document.getElementById('premium-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'premium-toast-container';
    container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; width: 100%; max-width: 380px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';
    document.body.appendChild(container);
  }

  // 2. 알림 메시지에 기본 토마토 접두사 바인딩 및 정제 (일치하지 않는 일반 메시지 보정)
  let formattedMessage = message;
  if (!message.startsWith('🍅')) {
    formattedMessage = `🍅 [온리비 어서] ${message}`;
  }

  // 3. 알림 본체 엘리먼트 생성 및 고급스러운 글래스모피즘(Glassmorphism) 스타일 장착
  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: auto;
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px 16px 22px;
    border-radius: 16px;
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 99, 71, 0.25); /* 토마토 연한 테두리 */
    background: rgba(255, 255, 255, 0.9);
    color: #1f2937;
    box-shadow: 0 10px 30px rgba(255, 99, 71, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
    transform: translateY(-15px) scale(0.95);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  `;

  // 시스템 다크모드 설정 체크 및 다크 토마토 테마 스타일 강제 오버라이딩
  const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  if (isDark) {
    toast.style.background = 'rgba(26, 21, 20, 0.95)'; /* 딥 토마토 차콜 배경 */
    toast.style.color = '#f9fafb';
    toast.style.borderColor = 'rgba(255, 99, 71, 0.15)';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
  }

  // 4. 각 상태별로 토마토(#FF6347) 기조의 세부 그라데이션 및 네온 효과 세분화
  let neonColor = ''; // 좌측 네온 바 그라데이션
  let iconSvg = '';  // 좌측 상태 아이콘 SVG 코드
  
  if (type === 'success') {
    // 성공 알림: 밝은 토마토 오렌지에서 딥 오렌지 귤색 그라데이션
    neonColor = 'linear-gradient(180deg, #FF6347, #FF4500)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    // 오류 알림: 진한 불타는 토마토 레드에서 다크 크림슨 그라데이션
    neonColor = 'linear-gradient(180deg, #FF3B30, #C20A00)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else if (type === 'warning') {
    // 경고 알림: 부드러운 산호색 토마토 골드 그라데이션
    neonColor = 'linear-gradient(180deg, #FFA07A, #FF7F50)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF7F50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    // 정보 알림: 싱그러운 그린 토마토/라임 멜론 그라데이션
    neonColor = 'linear-gradient(180deg, #9ACD32, #4F8F00)';
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ACD32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  // 5. 좌측 포인트 네온 데코 바 엘리먼트 조립
  const neonBar = document.createElement('div');
  neonBar.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 100%;
    border-radius: 16px 0 0 16px;
    background: ${neonColor};
    box-shadow: 1px 0 8px rgba(255, 99, 71, 0.3);
  `;
  toast.appendChild(neonBar);

  // 6. 아이콘 컨테이너 및 뱃지 삽입
  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = 'flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255, 99, 71, 0.08);';
  iconWrapper.innerHTML = iconSvg;
  toast.appendChild(iconWrapper);

  // 7. 한글 깨짐 및 유니코드 왜곡 없는 안전한 innerText 메시지 바인딩
  const bodyWrapper = document.createElement('div');
  bodyWrapper.style.cssText = 'flex: 1; min-width: 0;';
  const textNode = document.createElement('p');
  textNode.style.cssText = 'margin: 0; font-size: 13.5px; font-weight: 600; line-height: 1.45; letter-spacing: -0.01em;';
  textNode.innerText = formattedMessage; // 👈 innerText 로 한글 자모 씹힘 원천 가드
  bodyWrapper.appendChild(textNode);
  toast.appendChild(bodyWrapper);

  // 8. 닫기 전용 버튼 엘리먼트 배치 및 호버 투명도 애니메이션
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'flex-shrink: 0; background: none; border: none; padding: 4px; cursor: pointer; opacity: 0.35; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: currentColor;';
  closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  closeBtn.onmouseenter = () => closeBtn.style.opacity = '0.9';
  closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.35';
  closeBtn.onclick = () => {
    toast.style.transform = 'translateY(-15px) scale(0.9)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  };
  toast.appendChild(closeBtn);

  // 컨테이너 트리거에 최종 조립 알림 주입
  container.appendChild(toast);

  // 부드러운 스케일 업 슬라이드 애니메이션 렌더링 가동
  setTimeout(() => {
    toast.style.transform = 'translateY(0) scale(1)';
    toast.style.opacity = '1';
  }, 40);

  // 9. 4.5초 후 자연스러운 페이드아웃 후 엘리먼트 메모리 완전 소거
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateY(-10px) scale(0.95)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }
  }, 4500);
};

