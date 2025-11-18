import React from 'react';
import './KnowledgeDetailModal.css';

// API 상세 응답을 위한 타입
interface KnowledgeDetail {
  document: string;
  id: string;
  metadata: {
    title: string;
    registration_date: string;
    source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
    campaign_id?: string;
  };
}

interface KnowledgeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (item: any) => void; // TODO: Edit 타입을 API 응답에 맞게 수정 필요
  data: KnowledgeDetail | null;
  loading: boolean;
}

const KnowledgeDetailModal: React.FC<KnowledgeDetailModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  onEdit,
  data,
  loading,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleDelete = () => {
    if (data && window.confirm(`'${data.metadata.title}' 지식을 정말로 삭제하시겠습니까?`)) {
      onDelete(data.id);
    }
  };

  const handleEdit = () => {
    if (data) {
      // TODO: onEdit으로 넘기는 데이터가 KnowledgeEditModal과 호환되어야 함
      // 우선 data 객체 전체를 넘기도록 구현
      onEdit(data);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="modal-body">
            <div className="loading-spinner"></div>
            <p>상세 내용을 불러오는 중입니다...</p>
          </div>
        ) : data ? (
          <>
            <div className="modal-header">
              <h2>지식 상세 정보</h2>
              <button onClick={onClose} className="close-button">&times;</button>
            </div>
            <div className="modal-subheader">
              <h3>{data.metadata.title}</h3>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <strong>출처:</strong>
                  <span>{data.metadata.source_type}</span>
                </div>
                <div className="info-item">
                  <strong>등록일:</strong>
                  <span>{data.metadata.registration_date}</span>
                </div>
              </div>
              <div className="document-content">
                <pre>{data.document}</pre>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="delete-button-in-modal"
                onClick={handleDelete}
              >
                삭제
              </button>
              <button
                className="edit-button-in-modal"
                onClick={handleEdit}
              >
                수정
              </button>
              <button onClick={onClose} className="close-button-in-footer">
                닫기
              </button>
            </div>
          </>
        ) : (
          <div className="modal-body">
            <p>데이터를 불러오는 데 실패했습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDetailModal;