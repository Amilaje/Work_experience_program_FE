import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignDetailPage.css';
import PerformanceModal from '../components/PerformanceModal'; // Import the modal
import RefineRequestModal from '../components/RefineRequestModal'; // Import the RefineRequestModal

// --- Type Definitions based on API Spec ---
interface ValidatorReportFromAPI {
  spam_risk_score: number;
  policy_compliance: 'PASS' | 'FAIL';
  review_summary: string;
  recommended_action: string;
}

interface MessageResultFromAPI {
  resultId: string;
  targetGroupIndex: number;
  targetName: string;
  targetFeatures: string | null;
  messageDraftIndex: number;
  messageText: string;
  validatorReport: ValidatorReportFromAPI | null;
  selected: boolean;
}

interface CampaignDetailFromAPI {
  campaignId: string;
  requestDate: string;
  marketerId: string;
  purpose: string;
  coreBenefitText: string;
  sourceUrl: string | null;
  customColumns: string;
  status: string;
  actualCtr: number | null;
  conversionRate: number | null;
  updatedAt: string;
  messageResults: MessageResultFromAPI[];
}

// --- Component's Internal Type Definitions (transformed from API) ---
interface ValidatorReport { // This is what the component expects
  spam_risk_score: number;
  policy_compliance: 'PASS' | 'FAIL';
  review_summary: string;
  recommended_action: string;
}

interface MessageResult { // This is what the component expects inside TargetGroup
  result_id: string;
  message_draft_index: 1 | 2;
  message_text: string;
  validator_report: ValidatorReport;
  is_selected: boolean;
}

interface TargetGroup {
  target_group_index: number;
  target_name: string;
  target_features: string;
  message_results: MessageResult[];
}

interface CampaignDetail { // This is what the component expects as its state
  campaignId: string;
  purpose: string;
  actualCtr: number | null;
  conversionRate: number | null;
  status: string; // Add status here
  target_groups: TargetGroup[];
}

// Function to transform API response to component's expected structure
const transformApiResponse = (apiResponse: CampaignDetailFromAPI): CampaignDetail => {
  const targetGroupsMap = new Map<number, TargetGroup>();

  apiResponse.messageResults.forEach(apiMessage => {
    if (!targetGroupsMap.has(apiMessage.targetGroupIndex)) {
      targetGroupsMap.set(apiMessage.targetGroupIndex, {
        target_group_index: apiMessage.targetGroupIndex,
        target_name: apiMessage.targetName,
        target_features: apiMessage.targetFeatures || '',
        message_results: [],
      });
    }
    const targetGroup = targetGroupsMap.get(apiMessage.targetGroupIndex)!;
    targetGroup.message_results.push({
      result_id: apiMessage.resultId,
      message_draft_index: apiMessage.messageDraftIndex as (1 | 2),
      validator_report: apiMessage.validatorReport ? {
        spam_risk_score: apiMessage.validatorReport.spam_risk_score,
        policy_compliance: apiMessage.validatorReport.policy_compliance,
        review_summary: apiMessage.validatorReport.review_summary,
        recommended_action: apiMessage.validatorReport.recommended_action,
      } : { // Default validator report if null
        spam_risk_score: 0,
        policy_compliance: 'PASS',
        review_summary: 'No report available',
        recommended_action: 'None',
      },
      message_text: apiMessage.messageText,
      is_selected: apiMessage.selected,
    });
  });

  return {
    campaignId: apiResponse.campaignId,
    purpose: apiResponse.purpose,
    actualCtr: apiResponse.actualCtr,
    conversionRate: apiResponse.conversionRate,
    status: apiResponse.status, // Map status
    target_groups: Array.from(targetGroupsMap.values()),
  };
};

const statusMap: { [key: string]: string } = {
  PROCESSING: '처리 중',
  REFINING: '수정 중',
  COMPLETED: '생성 완료',
  FAILED: '실패',
  MESSAGE_SELECTED: '메시지 선택 완료',
  PERFORMANCE_REGISTERED: '성과 등록 완료',
  SUCCESS_CASE: '성공 사례 지정',
  RAG_REGISTERED: 'RAG DB 등록 완료',
};

const getRagButtonTooltip = (status: string): string => {
  if (status === 'RAG_REGISTERED') {
    return "이미 RAG DB에 등록된 캠페인입니다.";
  }
  if (status === 'SUCCESS_CASE') {
    return "이 캠페인을 '성공 사례'로 RAG DB에 저장합니다.";
  }
  if (status === 'PERFORMANCE_REGISTERED') {
    return "이 캠페인을 '실패 사례'로 RAG DB에 저장합니다.";
  }
  
  return "RAG DB에 반영하려면 성과 등록을 완료해야 합니다.";
};

const getPerformanceButtonText = (status: string): string => {
  if (status === 'PERFORMANCE_REGISTERED' || status === 'SUCCESS_CASE' || status === 'RAG_REGISTERED') {
    return "성과 수정";
  }
  return "성과 등록";
};

const getPerformanceButtonTooltip = (status: string): string => {
  if (status === 'PROCESSING' || status === 'REFINING' || status === 'FAILED') {
    return "메시지 생성 완료 후 성과 등록이 가능합니다.";
  }
  if (status === 'RAG_REGISTERED') {
    return "이미 RAG DB에 등록된 캠페인입니다. 성과 수정은 가능합니다.";
  }
  if (status === 'COMPLETED') {
    return "메시지 선택 후 성과 등록이 가능합니다.";
  }
  return "캠페인 성과(CTR, 전환율)를 등록 또는 수정합니다.";
};

const getRefineButtonTooltip = (status: string): string => {
  if (status === 'PROCESSING' || status === 'REFINING' || status === 'FAILED') {
    return "메시지 생성 완료 후 수정 요청이 가능합니다.";
  }
  if (status === 'RAG_REGISTERED') {
    return "이미 RAG DB에 등록된 캠페인입니다. 수정 요청은 불가능합니다.";
  }
  return "메시지 내용, 타겟, 목적 등을 수정 요청합니다.";
};

const CampaignDetailPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [initialCampaign, setInitialCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);

  const fetchCampaignDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<CampaignDetailFromAPI>(`/api/campaigns/${campaignId}`);
      const transformedData = transformApiResponse(response.data);
      setCampaign(transformedData);
      setInitialCampaign(JSON.parse(JSON.stringify(transformedData))); // Deep copy for comparison
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError('캠페인 정보를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetail();
    }
  }, [campaignId]);

  const handleSelectMessage = (resultId: string) => {
    setCampaign(prevCampaign => {
      if (!prevCampaign) return null;

      const newTargetGroups = prevCampaign.target_groups.map(group => ({
        ...group,
        message_results: group.message_results.map(result => {
          if (result.result_id === resultId) {
            return { ...result, is_selected: !result.is_selected }; // Toggle the flag
          }
          return result;
        }),
      }));

      return { ...prevCampaign, target_groups: newTargetGroups };
    });
  };

  const handleSaveSelection = async () => {
    if (!campaign) return;

    const selectedIds = campaign.target_groups
      .flatMap(g => g.message_results)
      .filter(r => r.is_selected)
      .map(r => r.result_id);

    try {
      await axios.put(`/api/campaigns/${campaignId}/selection`, {
        resultIds: selectedIds,
      });
      alert('메시지 선택이 저장되었습니다.');
      fetchCampaignDetail(); // Refetch to get updated state from server
    } catch (err) {
      console.error('Error saving selection:', err);
      alert('선택 저장에 실패했습니다.');
    }
  };

  const isButtonDisabled = (action: 'refine' | 'performance' | 'rag') => {
    if (!campaign) return true;
    const status = campaign.status;
    if (status === 'RAG_REGISTERED') return true;

    switch (action) {
      case 'refine':
        return ['PROCESSING', 'REFINING', 'FAILED'].includes(status);
      case 'performance':
        return ['PROCESSING', 'REFINING', 'FAILED', 'COMPLETED'].includes(status);
      case 'rag':
        return !['PERFORMANCE_REGISTERED', 'SUCCESS_CASE'].includes(status);
      default:
        return false;
    }
  };

  const handleDeleteCampaign = async () => {
    if (window.confirm(`'${campaign?.purpose}' 캠페인을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        await axios.delete(`/api/campaigns/${campaignId}`);
        alert('캠페인이 삭제되었습니다.');
        navigate('/promotion');
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('캠페인 삭제에 실패했습니다.');
      }
    }
  };

  const handlePerformanceSubmit = async (actualCtr: number, conversionRate: number, isSuccessCase: boolean) => {
    try {
      await axios.put(`/api/campaigns/${campaignId}/performance`, {
        actualCtr,
        conversionRate,
        isSuccessCase,
      });
      alert('성과가 성공적으로 저장되었습니다.');
      setIsPerformanceModalOpen(false);
      fetchCampaignDetail(); // Re-fetch data to show updated status
    } catch (err) {
      console.error('Error submitting performance:', err);
      alert('성과 저장에 실패했습니다.');
    }
  };

  const handleRagTrigger = async () => {
    if (!campaign) return;

    const confirmMessage = campaign.status === 'SUCCESS_CASE'
      ? '이 캠페인을 RAG DB에 성공 사례로 반영하시겠습니까?'
      : '이 캠페인은 "성공" 사례가 아닙니다. 실패 사례로 RAG DB에 반영하시겠습니까?';

    if (window.confirm(confirmMessage)) {
      try {
        await axios.post(`/api/campaigns/${campaignId}/rag-trigger`);
        alert('RAG DB에 성공적으로 반영되었습니다.');
        fetchCampaignDetail(); // Re-fetch data to show updated status
      } catch (err) {
        console.error('Error triggering RAG:', err);
        alert('RAG DB 반영에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="campaign-detail-container"><h2>로딩 중...</h2></div>;
  }

  if (error) {
    return <div className="campaign-detail-container"><h2 className="error-message">{error}</h2></div>;
  }

  if (!campaign) {
    return <div className="campaign-detail-container"><h2>캠페인 정보를 찾을 수 없습니다.</h2></div>;
  }

  const getSuccessStatusInfo = (status: string): { text: string; className: string } => {
    if (status === 'SUCCESS_CASE') {
      return { text: '성공', className: 'status-SUCCESS_CASE' };
    }
    if (status === 'FAILED') {
      return { text: '실패', className: 'status-FAILED' };
    }
    if (status === 'PERFORMANCE_REGISTERED' || status === 'RAG_REGISTERED') {
      return { text: '실패', className: 'status-FAILED' };
    }
    return { text: '미정', className: 'status-PROCESSING' };
  };

  const hasSelectionChanged = () => {
    if (!campaign || !initialCampaign) return false;
    const currentSelected = campaign.target_groups.flatMap(g => g.message_results).filter(r => r.is_selected).map(r => r.result_id).sort();
    const initialSelected = initialCampaign.target_groups.flatMap(g => g.message_results).filter(r => r.is_selected).map(r => r.result_id).sort();
    return JSON.stringify(currentSelected) !== JSON.stringify(initialSelected);
  };

  const successStatusInfo = getSuccessStatusInfo(campaign.status);

  return (
    <div className="campaign-detail-container">
      <header className="campaign-detail-header">
        <h1>{campaign.purpose}</h1>
      </header>

      <main className="campaign-content">
        <section className="campaign-meta">
          <div className="meta-stats">
            <div className="meta-item">
              <strong>상태:</strong> 
              <span className={`status-badge status-${campaign.status}`}>
                {statusMap[campaign.status] || campaign.status}
              </span>
            </div>
            <div className="meta-item">
              <strong>성공여부:</strong> 
              <span className={`status-badge ${successStatusInfo.className}`}>
                {successStatusInfo.text}
              </span>
            </div>
            <div className="meta-item">
              <strong>CTR:</strong> {campaign.actualCtr !== null ? `${campaign.actualCtr}%` : 'N/A'}
            </div>
            <div className="meta-item">
              <strong>전환율:</strong> {campaign.conversionRate !== null ? `${campaign.conversionRate}%` : 'N/A'}
            </div>
          </div>
        </section>

        <section className="action-buttons">
          <div className="tooltip-container">
            <button 
              className="action-button refine-button"
              onClick={() => setIsRefineModalOpen(true)}
              disabled={isButtonDisabled('refine')}
            >
              수정 요청
            </button>
            <span className="tooltip-text">{getRefineButtonTooltip(campaign.status)}</span>
          </div>
          <div className="tooltip-container">
            <button 
              className="action-button performance-button"
              onClick={() => setIsPerformanceModalOpen(true)}
              disabled={isButtonDisabled('performance')}
            >
              {getPerformanceButtonText(campaign.status)}
            </button>
            <span className="tooltip-text">{getPerformanceButtonTooltip(campaign.status)}</span>
          </div>
          <div className="tooltip-container">
            <button 
              className="action-button rag-button"
              onClick={handleRagTrigger}
              disabled={isButtonDisabled('rag')}
            >
              RAG DB 반영
            </button>
            <span className="tooltip-text">{getRagButtonTooltip(campaign.status)}</span>
          </div>
        </section>

        {['PROCESSING', 'REFINING'].includes(campaign.status) ? (
          <div className="processing-notice">
            <h2>메시지 생성 중...</h2>
            <p>AI가 메시지를 생성하고 있습니다. 잠시 후 페이지를 새로고침하여 확인해주세요.</p>
          </div>
        ) : (
          <>
            <div className="target-group-grid">
              {campaign.target_groups.map(group => (
                <div key={group.target_group_index} className="target-group-card">
                  <div className="target-group-header">
                    <h2 className="target-group-name">{group.target_name}</h2>
                    <p className="target-group-features">{group.target_features}</p>
                  </div>
                  <div className="message-drafts-container">
                    {group.message_results.map((result) => (
                      <div key={result.result_id} className={`message-draft ${result.is_selected ? 'selected' : ''}`}>
                        <div>
                          <div className="message-header">
                            <h3>메시지 시안 {result.message_draft_index}</h3>
                          </div>
                          <p className="message-text">{result.message_text}</p>
                          <div className="validator-report">
                            <div className="report-title">AI Validator Report</div>
                            <div className="report-item">
                              <span>정책 준수:</span>
                              <span className={`value ${result.validator_report.policy_compliance === 'PASS' ? 'safe' : ''}`}>
                                {result.validator_report.policy_compliance}
                              </span>
                            </div>
                            <div className="report-item">
                              <span>스팸 위험도:</span>
                              <span className="value">{result.validator_report.spam_risk_score}%</span>
                            </div>
                            <div className="report-item">
                              <strong>검토 요약:</strong> {result.validator_report.review_summary}
                            </div>
                            <div className="report-item">
                              <strong>권장 조치:</strong> {result.validator_report.recommended_action}
                            </div>
                          </div>
                        </div>
                        <div className="action-buttons">
                          <button 
                            className="select-button"
                            onClick={() => handleSelectMessage(result.result_id)}
                            disabled={!['COMPLETED', 'MESSAGE_SELECTED'].includes(campaign.status)}
                          >
                            {result.is_selected ? '선택 해제' : '이 메시지 선택'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {hasSelectionChanged() && (
              <div className="save-selection-container">
                <button className="save-selection-button" onClick={handleSaveSelection}>
                  선택 저장
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <PerformanceModal 
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        campaignId={campaignId!}
        onSubmit={handlePerformanceSubmit}
        initialActualCtr={campaign.actualCtr}
        initialConversionRate={campaign.conversionRate}
        initialIsSuccessCase={campaign.status === 'SUCCESS_CASE'}
      />
      <RefineRequestModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        campaignId={campaignId!}
      />

      <div className="page-actions-container">
        <button 
          className="action-button"
          onClick={() => navigate('/promotion')}
        >
          목록으로
        </button>
        <button 
          className="action-button delete-button"
          onClick={handleDeleteCampaign}
        >
          캠페인 삭제
        </button>
      </div>
    </div>
  );
};


export default CampaignDetailPage;
