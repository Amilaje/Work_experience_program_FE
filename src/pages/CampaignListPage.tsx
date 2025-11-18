import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Add this import
import './CampaignListPage.css';

// API 명세서 및 DB 스키마 기반의 캠페인 데이터 타입 정의
interface Campaign {
  campaignId: string;
  requestDate: string; // Changed from request_date
  marketer_id: string;
  purpose: string;
  core_benefit_text: string;
  source_url: string | null;
  status: string; // 백엔드에서 오는 영문 상태값 (e.g., "COMPLETED")
  updated_at: string;
}

// Spring Pageable API 응답을 위한 타입
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
}

// 백엔드 영문 상태 -> 프론트엔드 한글 표시
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

const CampaignListPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Page<Campaign>>('/api/campaigns');
      const sortedCampaigns = response.data.content.sort((a, b) => {
        const dateA = new Date(a.requestDate);
        const dateB = new Date(b.requestDate);
        return dateB.getTime() - dateA.getTime();
      });
      setCampaigns(sortedCampaigns);

    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(`데이터를 불러오는 데 실패했습니다: ${e.message}`);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);





  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(campaign => 
        statusFilter ? campaign.status === statusFilter : true
      )
      .filter(campaign =>
        campaign.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [campaigns, searchTerm, statusFilter]);

  return (
    <div className="campaign-list-container">
      <div className="campaign-list-header">
        <h1>프로모션 목록</h1>
        <div className="filter-and-search">
          <input 
            type="text" 
            placeholder="캠페인 목적 검색..." 
            className="search-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select 
            className="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option key="all" value="">모든 상태</option>
            {Object.entries(statusMap).map(([en, ko]) => (
              <option key={en} value={en}>{ko}</option>
            ))}
          </select>
          <Link to="/promotion/create" className="new-promotion-button">프로모션 생성</Link>
        </div>
      </div>
      {loading ? (
        <p>목록을 불러오는 중입니다...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <table className="campaign-table">
            <thead>
              <tr>

                <th>요청일</th>
                <th>캠페인 목적</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign, index) => (
                  <tr key={campaign.campaignId || index}>

                    <td>{campaign.requestDate ? new Date(campaign.requestDate.replace(' ', 'T')).toLocaleDateString() : '날짜 없음'}</td>
                    <td>
                      <Link to={`/campaign/${campaign.campaignId}`} className="campaign-link">
                        {campaign.purpose}
                      </Link>
                    </td>
                    <td><span className={`status-badge status-${campaign.status}`}>{statusMap[campaign.status] || campaign.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>결과가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>

        </>
      )}
    </div>
  );
};

export default CampaignListPage;
