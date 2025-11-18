import React from 'react';
import './KnowledgeModal.css';

interface KnowledgeModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ onClose, children }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

export default KnowledgeModal;
