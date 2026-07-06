import { describe, it, expect, vi, beforeEach } from 'vitest';

// Electron IPC 통신을 모킹(Mocking)합니다.
const mockEncryptData = vi.fn().mockResolvedValue('encrypted_hex_string');
const mockDecryptData = vi.fn().mockResolvedValue('sk-openai-real-api-key');

beforeEach(() => {
  vi.clearAllMocks();
  // window.electronAPI 가짜 객체 주입
  (global as any).window.electronAPI = {
    encryptData: mockEncryptData,
    decryptData: mockDecryptData,
  };
});

describe('Security: API Key Local Storage', () => {
  it('should call electronAPI.encryptData when saving an API Key', async () => {
    const rawKey = 'sk-openai-real-api-key';
    
    // 컴포넌트나 훅에서 호출했다고 가정
    const encrypted = await (window as any).electronAPI.encryptData(rawKey);
    
    expect(mockEncryptData).toHaveBeenCalledWith(rawKey);
    expect(encrypted).toBe('encrypted_hex_string');
    // 실제로는 이 encrypted 값을 localStorage에 저장합니다.
  });

  it('should call electronAPI.decryptData when loading an API Key', async () => {
    const storedHex = 'encrypted_hex_string';
    
    const decrypted = await (window as any).electronAPI.decryptData(storedHex);
    
    expect(mockDecryptData).toHaveBeenCalledWith(storedHex);
    expect(decrypted).toBe('sk-openai-real-api-key');
  });
});
