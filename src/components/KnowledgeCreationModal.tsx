import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KnowledgeModal.css'; // 모달 스타일 재활용

interface KnowledgeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKnowledgeCreated: () => void; // 지식 생성 후 목록 새로고침을 위한 콜백
}

const KnowledgeCreationModal: React.FC<KnowledgeCreationModalProps> = ({ isOpen, onClose, onKnowledgeCreated }) => {
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [sourceType, setSourceType] = useState<'정책' | '약관' | '성공_사례'>('정책');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setTitle('');
      setContentText('');
      setSourceType('정책');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/knowledge', {
        campaign_summary: `${title} 요약: ${contentText.substring(0, 50)}...`, // title과 content_text를 조합하여 campaign_summary 생성
        campaign_details: {
          content_text: contentText,
          source_type: sourceType,
          title: title,
        },
      });
      alert('새로운 지식이 성공적으로 등록되었습니다.');
      onKnowledgeCreated(); // 부모 컴포넌트에 지식 생성 알림
      onClose(); // 모달 닫기
    } catch (err) {
      setError('지식 등록에 실패했습니다.');
      console.error('Error creating knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>신규 지식 등록</h2>
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
              {loading ? '등록 중...' : '등록'}
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

export default KnowledgeCreationModal;
