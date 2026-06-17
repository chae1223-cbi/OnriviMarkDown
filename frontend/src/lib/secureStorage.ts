import CryptoJS from 'crypto-js';

// 💡 [한글 주석] 로컬 저장 암호화용 고유 솔트 키 (빌드 난독화 대비용 상수 지정)
const SECRET_SALT = 'ONRIVI-AUTHOR-SECURE-KEY-SPEC-SALT';

/**
 * [ONR-IO-003] 안전 난독화 저장소 연동 (saveSecureData / loadSecureData)
 * 💡 [한글 주석] 주어진 키와 값 객체를 AES-256 알고리즘으로 강력하게 암호화하여 로컬 스토리지에 보관합니다.
 * @param key 로컬 스토리지 키 이름
 * @param value 암호화하여 보관할 객체 데이터
 */
// ====================================================================
// 📊 [OMD-AUTH-secureStorage-0001] secureStorage.ts ➔ saveSecureData
// 🎯 @KICK  : AES-256 암호화하여 로컬 스토리지에 보안 데이터 저장
// 🛡️ @GUARD : window 부재, JSON.stringify 실패 시 catch
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const saveSecureData = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;
  try {
    const rawString = JSON.stringify(value);
    const ciphertext = CryptoJS.AES.encrypt(rawString, SECRET_SALT).toString();
    localStorage.setItem(key, ciphertext);
  } catch (error) {
    console.error('로컬 보안 데이터 저장 중 오류 발생:', error);
  }
};

/**
 * 💡 [한글 주석] 로컬 스토리지에서 암호화된 문자열을 가져와 복호화한 후 JSON 객체로 파싱하여 반환합니다.
 * @param key 로컬 스토리지 키 이름
 * @returns 복호화된 원본 데이터 객체 또는 null
 */
// ====================================================================
// 📊 [OMD-AUTH-secureStorage-0002] secureStorage.ts ➔ loadSecureData
// 🎯 @KICK  : 로컬 스토리지 AES-256 암호화 데이터 복호화 및 JSON 파싱
// 🛡️ @GUARD : window 부재, ciphertext null, 복호화 결과 유효성, 변조 의심 시 null 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const loadSecureData = <T = any>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const ciphertext = localStorage.getItem(key);
    if (!ciphertext) return null;

    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_SALT);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    // 복호화 결과 텍스트가 올바른 구조가 아니면 변조된 것으로 판단
    if (!decryptedText) return null;

    return JSON.parse(decryptedText) as T;
  } catch (error) {
    console.error('로컬 보안 데이터 복호화 중 오류 발생 (변조 의심):', error);
    return null;
  }
};
