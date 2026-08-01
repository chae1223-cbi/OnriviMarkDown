import React from 'react';
import { X, User, Calendar, CreditCard, Laptop, MonitorSmartphone } from 'lucide-react';

interface Device {
  id: string;
  device_name: string;
  activated_at: string;
}

interface UserDetailProps {
  user: any; // { email, nick_name, plan, status, date, last_login, start_date, end_date, devices }
  onClose: () => void;
  onKillSession?: () => void;
  onKillSingleSession?: (deviceId: string) => void;
}

export default function UserDetailModal({ user, onClose, onKillSession, onKillSingleSession }: UserDetailProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-background)]">
          <h2 className="text-lg font-semibold text-[var(--admin-text)] font-montserrat flex items-center gap-2">
            <User size={20} className="text-[var(--admin-primary)]" />
            사용자 상세 정보
          </h2>
          <button onClick={onClose} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors p-1 rounded-md hover:bg-[var(--admin-border)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* Profile Section */}
          <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-5 border border-[var(--admin-border)]">
            <h3 className="text-[var(--admin-text)] font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <User size={16} /> 프로필 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1">이메일</p>
                <p className="text-[var(--admin-text)] text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1">닉네임</p>
                <p className="text-[var(--admin-text)] text-sm">{user.nick_name}</p>
              </div>
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1">상태</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'ACTIVE' ? 'bg-[rgba(46,204,113,0.15)] text-[var(--admin-success)]' :
                  user.status === 'SUSPENDED' ? 'bg-[rgba(231,76,60,0.15)] text-[var(--admin-error)]' :
                  user.status === 'DELETED' ? 'bg-[rgba(255,255,255,0.1)] text-[var(--admin-text-muted)]' :
                  'bg-[rgba(52,152,219,0.15)] text-[var(--admin-primary)]'
                }`}>
                  {user.status === 'ACTIVE' ? '정상' :
                   user.status === 'SUSPENDED' ? '정지됨' :
                   user.status === 'DELETED' ? '탈퇴' : user.status}
                </span>
              </div>
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1">마지막 접속</p>
                <p className="text-[var(--admin-text)] text-sm">{user.last_login}</p>
              </div>
            </div>
          </div>

          {/* Plan Section */}
          <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-5 border border-[var(--admin-border)]">
            <h3 className="text-[var(--admin-text)] font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} /> 플랜 정보
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1">현재 플랜</p>
                <span className="px-2 py-1 bg-[rgba(52,152,219,0.1)] text-[var(--admin-primary)] text-xs font-semibold rounded-md border border-[rgba(52,152,219,0.2)] inline-block">
                  {user.plan}
                </span>
              </div>
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1 flex items-center gap-1">
                  <Calendar size={12} /> 시작일
                </p>
                <p className="text-[var(--admin-text)] text-sm">{user.start_date !== '-' ? user.start_date : '기록 없음'}</p>
              </div>
              <div>
                <p className="text-[var(--admin-text-muted)] text-xs mb-1 flex items-center gap-1">
                  <Calendar size={12} /> 만료일
                </p>
                <p className="text-[var(--admin-text)] text-sm">{user.end_date !== '-' ? user.end_date : '무제한'}</p>
              </div>
            </div>
          </div>

          {/* Devices Section */}
          <div className="bg-[rgba(0,0,0,0.2)] rounded-lg p-5 border border-[var(--admin-border)]">
            <h3 className="text-[var(--admin-text)] font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Laptop size={16} /> 활성화된 접속 환경
            </h3>
            {(!user.devices || user.devices.length === 0) ? (
              <p className="text-[var(--admin-text-muted)] text-sm text-center py-4">활성화된 접속 환경이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {user.devices.map((device: Device, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[var(--admin-background)] rounded-md border border-[var(--admin-border)]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--admin-surface)] rounded-full">
                        <MonitorSmartphone size={16} className="text-[var(--admin-text-muted)]" />
                      </div>
                      <div>
                        <p className="text-[var(--admin-text)] text-sm font-medium">{device.device_name || '알 수 없는 기기'}</p>
                        <p className="text-[var(--admin-text-muted)] text-xs">활성화: {new Date(device.activated_at).toLocaleString('ko-KR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-[rgba(46,204,113,0.1)] text-[var(--admin-success)] text-[10px] font-semibold rounded-full uppercase tracking-wider">
                        Active
                      </span>
                      {onKillSingleSession && (
                        <button
                          onClick={() => onKillSingleSession(device.id)}
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-[var(--admin-error)] hover:bg-[rgba(231,76,60,0.1)] rounded-md transition-colors"
                          title="이 세션 종료하기"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-background)]">
          {onKillSession ? (
            <button
              onClick={() => {
                onKillSession();
                onClose();
              }}
              className="px-4 py-2 bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.2)] hover:bg-[rgba(231,76,60,0.2)] text-[var(--admin-error)] rounded-md transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MonitorSmartphone size={16} /> 세션 강제 종료
            </button>
          ) : <div></div>}
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--admin-surface)] hover:bg-[var(--admin-border)] text-[var(--admin-text)] rounded-md transition-colors text-sm font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
