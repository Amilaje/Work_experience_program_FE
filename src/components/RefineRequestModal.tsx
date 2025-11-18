import React, { useState } from 'react';
import './RefineRequestModal.css';

interface RefineRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedbackText: string) => void;
}

const RefineRequestModal: React.FC<RefineRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedbackText, setFeedbackText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(feedbackText);
    setFeedbackText(''); // Clear feedback after submission
  };

  const handleClose = () => {
    setFeedbackText(''); // Clear feedback on close
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>메시지 수정 재요청</h2>
        <p>AI Agent에게 메시지 수정에 대한 피드백을 남겨주세요.</p>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="예: '좀 더 감성적이고 따뜻한 느낌으로 메시지를 수정해주세요. '사랑하는 가족' 같은 키워드를 넣어주세요.'"
          rows={5}
        ></textarea>
        <div className="modal-actions">
          <button className="submit-button" onClick={handleSubmit}>재요청</button>
          <button className="cancel-button" onClick={handleClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default RefineRequestModal;
