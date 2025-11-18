import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PerformanceModal.css';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSubmit: (actualCtr: number, conversionRate: number, isSuccessCase: boolean) => void;
  initialActualCtr?: number | null;
  initialConversionRate?: number | null;
  initialIsSuccessCase?: boolean;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({ 
  isOpen, 
  onClose, 
  campaignId, 
  onSubmit,
  initialActualCtr,
  initialConversionRate,
  initialIsSuccessCase,
}) => {
  const [actualCtr, setActualCtr] = useState<string>(initialActualCtr?.toString() || '');
  const [conversionRate, setConversionRate] = useState<string>(initialConversionRate?.toString() || '');
  const [isSuccessCase, setIsSuccessCase] = useState<boolean>(initialIsSuccessCase || false);

  useEffect(() => {
    setActualCtr(initialActualCtr?.toString() || '');
    setConversionRate(initialConversionRate?.toString() || '');
    setIsSuccessCase(initialIsSuccessCase || false);
  }, [initialActualCtr, initialConversionRate, initialIsSuccessCase, isOpen]); // Re-initialize when props or modal visibility changes


  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(actualCtr), parseFloat(conversionRate), isSuccessCase);
    // No need to clear form here, as it will be re-initialized by useEffect on next open
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>성과 등록/수정</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="actualCtr">클릭률 (CTR)</label>
            <input type="number" id="actualCtr" name="actualCtr" value={actualCtr} onChange={(e) => setActualCtr(e.target.value)} placeholder="예: 15.5" step="0.01" required />
          </div>
          <div className="form-group">
            <label htmlFor="conversionRate">전환율 (CVR)</label>
            <input type="number" id="conversionRate" name="conversionRate" value={conversionRate} onChange={(e) => setConversionRate(e.target.value)} placeholder="예: 7.8" step="0.01" required />
          </div>
          <div className="form-group">
            <label>프로모션 성공 여부</label>
            <div className="radio-group">
              <input type="radio" id="successTrue" name="isSuccessCase" value="true" checked={isSuccessCase === true} onChange={() => setIsSuccessCase(true)} required />
              <label htmlFor="successTrue">성공</label>
              <input type="radio" id="successFalse" name="isSuccessCase" value="false" checked={isSuccessCase === false} onChange={() => setIsSuccessCase(false)} required />
              <label htmlFor="successFalse">실패</label>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>취소</button>
            <button type="submit" className="save-button">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceModal;
