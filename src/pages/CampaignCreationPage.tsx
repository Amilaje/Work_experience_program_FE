import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CampaignCreationPage.css";

const CampaignCreationPage = () => {
  const [purpose, setPurpose] = useState("");
  const [coreBenefit, setCoreBenefit] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [customColumns, setCustomColumns] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("AI Agent 구동을 요청했습니다. 잠시만 기다려주세요...");

    const campaignData = {
      marketerId: "tester", // 사용자명 또는 컴퓨터 구별 번호
      purpose,
      coreBenefitText: coreBenefit,
      sourceUrl: sourceUrl,
      customColumns: customColumns,
    };

    try {
      console.log("Submitting campaign data:", campaignData);
      const response = await axios.post("/api/campaigns", campaignData);

      // Assuming the backend returns the created campaign object with its ID
      const newCampaignId = response.data.campaignId;

      setStatus("캠페인 생성이 완료되었습니다. 상세 페이지로 이동합니다.");

      // On success, redirect to the detail page of the newly created campaign.
      navigate(`/campaign/${newCampaignId}`);

    } catch (error) {
      console.error("Failed to create campaign:", error);
      setStatus("캠페인 생성에 실패했습니다. 다시 시도해 주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className="campaign-creation-container">
      <h1>새 프로모션 생성</h1>
      <form onSubmit={handleSubmit} className="creation-form">
        <div className="form-group">
          <label htmlFor="purpose">프로모션 목적</label>
          <input
            type="text"
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="예: 20대 신규 고객 확보"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="coreBenefit">프로모션 내용 (핵심 혜택)</label>
          <textarea
            id="coreBenefit"
            value={coreBenefit}
            onChange={(e) => setCoreBenefit(e.target.value)}
            placeholder="고객에게 제공할 핵심 혜택을 상세히 설명해주세요. 예: '데이터 무제한 요금제 50% 할인'"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sourceUrl">참조 URL / Image</label>
          <input
            type="text"
            id="sourceUrl"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/promotion_image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="customColumns">사용 가능한 고객 데이터 컬럼</label>
          <textarea
            id="customColumns"
            value={customColumns}
            onChange={(e) => setCustomColumns(e.target.value)}
            placeholder="[이름], [가입일], [요금제명]"
          />
          <p className="form-hint">
            메시지 개인화에 사용할 수 있는 컬럼명을 쉼표(,)로 구분하여
            입력해주세요.
          </p>
        </div>

        <div className="submit-btn-container">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "요청 처리 중..." : "AI Agent 메시지 초안 요청"}
          </button>
        </div>
      </form>

      {status && <div className="status-message">{status}</div>}
    </div>
  );
};

export default CampaignCreationPage;