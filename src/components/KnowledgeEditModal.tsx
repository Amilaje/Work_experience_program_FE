import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KnowledgeModal.css'; // 모달 스타일 재활용

interface Knowledge {
  knowledge_id: string;
  title: string;
  content_text: string;
  source_type: '정책' | '약관' | '성공_사례';
  upload_date: string;
  is_active: boolean;
  related_campaign_id?: string;
}

interface KnowledgeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKnowledgeUpdated: () => void; // 지식 수정 후 목록 새로고침을 위한 콜백
  knowledgeItem: Knowledge | null; // 수정할 지식 데이터
}

const KnowledgeEditModal: React.FC<KnowledgeEditModalProps> = ({ isOpen, onClose, onKnowledgeUpdated, knowledgeItem }) => {
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [sourceType, setSourceType] = useState<'정책' | '약관' | '성공_사례'>('정책');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && knowledgeItem) {
      setTitle(knowledgeItem.title);
      setContentText(knowledgeItem.content_text);
      setSourceType(knowledgeItem.source_type);
      setError(null);
    } else if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setTitle('');
      setContentText('');
      setSourceType('정책');
      setError(null);
    }
  }, [isOpen, knowledgeItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!knowledgeItem) {
      setError('수정할 지식 정보가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`/api/knowledge/${knowledgeItem.knowledge_id}`, {
        campaign_summary: `${title} 요약: ${contentText.substring(0, 50)}...`, // title과 content_text를 조합하여 campaign_summary 생성
        campaign_details: {
          content_text: contentText,
          source_type: sourceType,
          title: title,
        },
      });
      alert('지식이 성공적으로 수정되었습니다.');
      onKnowledgeUpdated(); // 부모 컴포넌트에 지식 수정 알림
      onClose(); // 모달 닫기
    } catch (err) {
      setError('지식 수정에 실패했습니다.');
      console.error('Error updating knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>지식 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contentText">내용</label>
            <textarea
              id="contentText"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sourceType">출처</label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as '정책' | '약관' | '성공_사례')}
            >
              <option value="정책">정책</option>
              <option value="약관">약관</option>
              <option value="성공_사례">성공 사례</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? '수정 중...' : '수정'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeEditModal;
