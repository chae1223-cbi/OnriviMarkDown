'use client';

/**
 * 프로그램명 : 1:1 문의사항 탭 컴포넌트 (InquiriesTab Component)
 * 버전 정보 : 1.0.0
 * 프로그램 ID : oaar-admin-inquiries-tab-001
 * -----------------------------------------------------------------------
 * 변경내역
 * -----------------------------------------------------------------------
 * <2026.05.29> 최초작성
 *   * 🚨 @PATCH : **2026-08-12** — 답변 저장 시 처리 상태를 자동으로 'RESOLVED'(완료됨)로 변경하도록 PATCH 데이터 전송 강제화 및 드롭다운/필터 목록에서 'IN_PROGRESS'(처리중) 상태 배제 처리
 * -----------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showToast } from '@/utils/toast';
import { Eye, Mail, CheckCircle2, MessageSquare, Clock, X, Paperclip, Trash2, Download } from 'lucide-react';

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  type: string;
  type_name: string;
  title: string;
  content: string;
  attachment_urls: string[];
  status: string;
  status_name: string;
  created_at: string;
  answer_content: string | null;
  answered_at: string | null;
  answered_by: string | null;
  answer_attachment_urls: string[];
}

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusCodes, setStatusCodes] = useState<Array<{ code_value: string; code_name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState('');
  const [isAdminSuper, setIsAdminSuper] = useState(false);
  const [isAdminSupport, setIsAdminSupport] = useState(false);

  // 필터링 상태
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  // 답변 폼 상태
  const [answerContent, setAnswerContent] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyGreeting, setReplyGreeting] = useState('');
  const [replyClosing, setReplyClosing] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionToken(session.access_token);
        fetchAdminRole(session.user.id);
        fetchStatusCodes();
        fetchInquiries(session.access_token);
      }
    };
    init();
  }, []);

  const fetchStatusCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('common_codes')
        .select('code_value, code_name')
        .eq('group_code', 'INQUIRY_STATUS')
        .eq('is_use', true)
        .order('sort_order', { ascending: true });
      if (!error && data) {
        setStatusCodes(data);
      }
    } catch (err) {
      console.error('Failed to fetch status codes', err);
    }
  };

  const fetchAdminRole = async (userId: string) => {
    const { data } = await supabase.from('admins').select('admin_role').eq('user_id', userId).single();
    if (data?.admin_role === 'SUPER') setIsAdminSuper(true);
    if (data?.admin_role === 'SUPPORT') setIsAdminSupport(true);
  };

  const fetchInquiries = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await res.json();
      setInquiries(data);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerContent(inquiry.answer_content || '');
    // 💡 답변 저장 시 자동으로 RESOLVED로 완료 처리되므로 기본 표시 상태를 'RESOLVED'로 설정
    setStatusToUpdate('RESOLVED');
    setSendEmail(true);
    setReplyFiles([]);
    setExistingUrls(inquiry.answer_attachment_urls || []);
    setReplySubject(`[답변] ${inquiry.title} 문의에 대한 답변입니다.`);
    setReplyGreeting(`안녕하세요, ${inquiry.name}님. ${inquiry.title}과(와) 관련하여 추가로 궁금하신 점이 있으셨던 것 같아 답변 정리하여 보내드립니다.`);
    setReplyClosing('답변 드린 내용 외에 추가로 궁금하신 점이나 확인이 필요한 사항이 있으시면 언제든 편하게 말씀해 주시기 바랍니다.');
    setModalOpen(true);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Brevo API 허용 확장자 필터링 (보안상 차단되는 sql, exe 등 방지)
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z'];
      const invalidFiles = newFiles.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        return !ext || !allowedExtensions.includes(ext);
      });

      if (invalidFiles.length > 0) {
        showToast('보안상 첨부할 수 없는 파일 형식입니다. (zip으로 압축 권장)', 'warning');
        return;
      }

      const totalSize = [...replyFiles, ...newFiles].reduce((acc, f) => acc + f.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        showToast('총 첨부파일 용량은 20MB를 초과할 수 없습니다.', 'warning');
        return;
      }
      setReplyFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setReplyFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (replyFiles.length === 0) return [];
    const urls: string[] = [];
    for (const file of replyFiles) {
      try {
        const base64Data = await readFileAsBase64(file);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;

        const resp = await fetch('/api/upload-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({ base64Data, fileName: file.name, targetFolder: 'inquiry_reply' }),
        });

        if (resp.ok) {
          const d = await resp.json();
          if (d.status === 'success' && d.relativePath) {
            const fullUrl = d.relativePath.startsWith('http')
              ? d.relativePath
              : 'https://onrivi.com' + d.relativePath + '?name=' + encodeURIComponent(file.name);
            urls.push(fullUrl);
          }
        }
      } catch (err) {
        console.error('R2 업로드 실패:', err);
      }
    }
    return urls;
  };

  const handleSaveReply = async () => {
    if (!selectedInquiry) return;
    if (!answerContent.trim()) {
      showToast('답변 내용을 입력해주세요.', 'warning');
      return;
    }

    setSaving(true);
    setUploading(true);
    try {
      const uploadedUrls = await uploadFiles();
      const finalAttachmentUrls = [
        ...existingUrls,
        ...uploadedUrls
      ];

      const res = await fetch('/api/admin/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          id: selectedInquiry.id,
          status: 'RESOLVED', // 💡 답변 저장 시 자동으로 'RESOLVED'(완료됨)로 변경
          answer_content: answerContent,
          send_email: sendEmail,
          answer_attachment_urls: finalAttachmentUrls,
          reply_subject: replySubject,
          reply_greeting: replyGreeting,
          reply_closing: replyClosing
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      showToast(`답변이 저장되었습니다. ${json.emailSent ? '(이메일 발송 완료)' : ''}`, 'success');
      setModalOpen(false);
      fetchInquiries(sessionToken);
    } catch (err: any) {
      showToast(err.message || '저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    statusFilter === 'ALL' ? true : inq.status === statusFilter
  );

  const getStatusBadge = (status: string, statusName: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={12}/> {statusName}</span>;
      case 'IN_PROGRESS': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><MessageSquare size={12}/> {statusName}</span>;
      case 'RESOLVED': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 size={12}/> {statusName}</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{statusName}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-[var(--admin-text-muted)]">로딩 중...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold font-montserrat text-[var(--admin-text)] tracking-tight">문의 및 지원</h1>
          <p className="text-[var(--admin-text-muted)] mt-1">고객의 1:1 문의 내역을 확인하고 답변을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-surface)] border-[var(--admin-border)] border text-[var(--admin-text)] rounded-xl text-sm font-medium hover:bg-[var(--admin-surface-bright)] transition-colors outline-none"
          >
            <option value="ALL">모든 문의</option>
            {statusCodes.filter(code => code.code_value !== 'IN_PROGRESS').map(code => (
              <option key={code.code_value} value={code.code_value}>{code.code_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--admin-surface-bright)] text-[var(--admin-text-muted)] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">상태</th>
                <th className="px-6 py-4 font-medium">유형</th>
                <th className="px-6 py-4 font-medium">문의 제목</th>
                <th className="px-6 py-4 font-medium">작성자</th>
                <th className="px-6 py-4 font-medium">등록일</th>
                <th className="px-6 py-4 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--admin-text-muted)]">
                    조회된 문의 내역이 없습니다.
                  </td>
                </tr>
              ) : filteredInquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[var(--admin-surface)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(inq.status, inq.status_name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--admin-text-muted)]">{inq.type_name}</td>
                  <td className="px-6 py-4 font-medium text-[var(--admin-text)] max-w-xs truncate">{inq.title}</td>
                  <td className="px-6 py-4 text-sm text-[var(--admin-text-muted)]">
                    <div className="flex flex-col">
                      <span className="font-medium">{inq.name}</span>
                      <span className="text-xs">{inq.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--admin-text-muted)] whitespace-nowrap">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => openModal(inq)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      {inq.status === 'RESOLVED' ? <><Eye size={14}/> 조회</> : <><Mail size={14}/> 답변 작성</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[var(--admin-surface)] text-[var(--admin-text)] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[var(--admin-border)] my-auto overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                문의 상세 및 답변
                {getStatusBadge(selectedInquiry.status, selectedInquiry.status_name)}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>
            
            <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {/* 사용자 문의 내용 (Read-only) */}
              <div className="bg-[var(--admin-background)] p-4 rounded-xl border border-[var(--admin-border)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 border-b border-[var(--admin-border)] pb-4">
                  <div>
                    <div className="text-sm text-[var(--admin-text-muted)] mb-1">문의 제목 ({selectedInquiry.type_name})</div>
                    <div className="font-bold text-lg">{selectedInquiry.title}</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-sm text-[var(--admin-text-muted)] mb-1">작성자</div>
                    <div className="font-medium">{selectedInquiry.name} <span className="text-xs text-gray-400">({selectedInquiry.email})</span></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--admin-text-muted)] mb-2">문의 내용</div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedInquiry.content}</div>
                </div>
                {selectedInquiry.attachment_urls && selectedInquiry.attachment_urls.length > 0 && (
                  <div className="pt-3 border-t border-[var(--admin-border)]">
                    <div className="text-sm text-[var(--admin-text-muted)] mb-2">고객 첨부파일</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedInquiry.attachment_urls.map((url, i) => {
                        const nameMatch = url.match(/name=([^&]+)/);
                        const fileName = nameMatch ? decodeURIComponent(nameMatch[1]) : `첨부파일 ${i + 1}`;
                        return (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-xs hover:bg-[var(--admin-surface-bright)] transition-colors">
                            <Download size={14} className="text-gray-400" />
                            <span className="truncate max-w-[150px]">{fileName}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 관리자 답변 입력 폼 */}
              <fieldset disabled={!(isAdminSuper || isAdminSupport)} className="space-y-4 min-w-0 border-none p-0 m-0">
                <div>
                  <label className="block text-sm font-medium mb-1">처리 상태 변경</label>
                  <select 
                    value={statusToUpdate}
                    onChange={(e) => setStatusToUpdate(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-[var(--admin-background)] text-[var(--admin-text)] rounded-xl border border-[var(--admin-border)] focus:border-blue-500 outline-none"
                  >
                    {statusCodes.length > 0 ? statusCodes.filter(code => code.code_value !== 'IN_PROGRESS').map(code => (
                      <option key={code.code_value} value={code.code_value}>{code.code_name} ({code.code_value})</option>
                    )) : (
                      <>
                        <option value="PENDING">대기중 (PENDING)</option>
                        <option value="RESOLVED">완료됨 (RESOLVED)</option>
                      </>
                    )}
                  </select>
                </div>

                {sendEmail && (
                  <div className="space-y-4 p-4 bg-[var(--admin-surface-bright)] rounded-xl border border-[var(--admin-border)]">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--admin-text-muted)]">이메일 제목</label>
                      <input 
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--admin-background)] text-[var(--admin-text)] rounded-xl border border-[var(--admin-border)] focus:border-blue-500 outline-none"
                        placeholder="이메일 제목을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--admin-text-muted)]">도입부 인사말 (Greeting)</label>
                      <input 
                        type="text"
                        value={replyGreeting}
                        onChange={(e) => setReplyGreeting(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--admin-background)] text-[var(--admin-text)] rounded-xl border border-[var(--admin-border)] focus:border-blue-500 outline-none"
                        placeholder="예: 문의하신 내용에 대한 답변입니다."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-[var(--admin-text-muted)]">맺음말 (Closing)</label>
                      <input 
                        type="text"
                        value={replyClosing}
                        onChange={(e) => setReplyClosing(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--admin-background)] text-[var(--admin-text)] rounded-xl border border-[var(--admin-border)] focus:border-blue-500 outline-none"
                        placeholder="예: 추가로 궁금하신 점이 있으시면 편하게 말씀해 주시기 바랍니다."
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium">관리자 답변</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sendEmail} 
                        onChange={(e) => setSendEmail(e.target.checked)} 
                        className="w-4 h-4 text-blue-600 rounded" 
                      />
                      <span className="text-xs font-medium text-[var(--admin-text-muted)]">저장 시 이메일 발송</span>
                    </label>
                  </div>
                  <textarea 
                    rows={6}
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="고객에게 전송될 답변 내용을 입력하세요..."
                    className="w-full px-3 py-2 bg-[var(--admin-background)] text-[var(--admin-text)] rounded-xl border border-[var(--admin-border)] focus:border-blue-500 outline-none resize-y"
                  />
                </div>

                {/* 첨부파일 입력 폼 */}
                <div>
                  <div className="block text-sm font-medium mb-2">답변 첨부파일</div>
                  <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] border-dashed rounded-xl cursor-pointer hover:bg-[var(--admin-surface-bright)] hover:border-blue-500 transition-colors">
                      <Paperclip size={16} className="text-blue-500" />
                      <span className="text-sm text-[var(--admin-text-muted)] font-medium">새 파일 첨부하기</span>
                      <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>

                    {/* 새로 첨부할 파일 리스트 */}
                    {replyFiles.length > 0 && (
                      <div className="space-y-2 mt-1">
                        {replyFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-[var(--admin-background)] border border-[var(--admin-border)] rounded-lg">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Paperclip size={14} className="text-gray-400 shrink-0" />
                              <span className="text-sm truncate text-[var(--admin-text)]">{f.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 기존 답변 첨부파일 (삭제 가능) */}
                    {existingUrls.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-[var(--admin-text-muted)] mb-2">기존 첨부된 파일:</div>
                        <div className="flex flex-col gap-2">
                          {existingUrls.map((url, i) => {
                            const nameMatch = url.match(/name=([^&]+)/);
                            const fileName = nameMatch ? decodeURIComponent(nameMatch[1]) : `기존 첨부파일 ${i + 1}`;
                            return (
                              <div key={i} className="flex items-center justify-between p-2 bg-[var(--admin-background)] border border-[var(--admin-border)] rounded-lg">
                                <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 overflow-hidden hover:text-blue-500 transition-colors">
                                  <Download size={14} className="text-blue-500 shrink-0" />
                                  <span className="text-sm truncate text-[var(--admin-text)]">{fileName}</span>
                                </a>
                                <button 
                                  onClick={() => setExistingUrls(prev => prev.filter((_, idx) => idx !== i))} 
                                  className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                                  title="기존 첨부파일 삭제"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--admin-border)] flex justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                취소
              </button>
              {(isAdminSuper || isAdminSupport) && (
                <button 
                  onClick={handleSaveReply} 
                  disabled={saving || uploading}
                  className="px-5 py-2.5 admin-btn-primary text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(saving || uploading) ? '업로드 및 저장 중...' : <><CheckCircle2 size={16}/> 답변 저장</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
