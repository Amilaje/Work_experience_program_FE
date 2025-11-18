import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardSummary {
    ongoingCampaigns: number;
    successCases: number;
    totalKnowledge: number;
}

interface RecentActivityItem {
    campaignId: string;
    requestDate: string;
    marketerId: string;
    purpose: string;
    coreBenefitText: string;
    sourceUrl: string;
    customColumns: string;
    status: string;
    actualCtr: number;
    conversionRate: number;
    updatedAt: string;
    messageResults: any[];
}

const CampaignStatus: React.FC<{ ongoingCampaigns: number }> = ({ ongoingCampaigns }) => {
    const data = {
        labels: ['진행 중', '미진행'],
        datasets: [
            {
                data: [ongoingCampaigns, 20 - ongoingCampaigns], // 예시 데이터: 총 20개 중 진행 중인 캠페인 수
                backgroundColor: ['#00C6FF', '#E0E0E0'],
                borderColor: ['#00C6FF', '#E0E0E0'],
                borderWidth: 1,
                cutout: '80%', // 도넛 두께 조절
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            }
        },
    };

    const textCenterPlugin = {
        id: 'textCenter',
        beforeDraw: (chart: ChartJS) => {
            const { ctx } = chart;
            const centerX = chart.getDatasetMeta(0).data[0].x;
            const centerY = chart.getDatasetMeta(0).data[0].y;
            
            ctx.save();
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${ongoingCampaigns}개`, centerX, centerY - 10);

            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#666666';
            ctx.fillText('진행 중', centerX, centerY + 15);
            ctx.restore();
        }
    };

    return (
        <div id="campaign-status" className="home-section">
            <h2>캠페인 현황</h2>
            <div style={{ height: '200px', position: 'relative' }}>
                <Doughnut data={data} options={options} plugins={[textCenterPlugin]} />
            </div>
        </div>
    );
};

const RecentPromotions: React.FC<{ activities: RecentActivityItem[] }> = ({ activities }) => {
    const navigate = useNavigate();

    const handleActivityClick = (campaignId: string) => {
        navigate(`/campaigns/${campaignId}`);
    };

    const getStatusDisplayName = (status: string): string => {
        switch (status) {
            case 'PROCESSING':
                return 'AI 메시지 생성 중';
            case 'REFINING':
                return 'AI 메시지 수정 중';
            case 'COMPLETED':
                return '메시지 생성 완료';
            case 'FAILED':
                return '메시지 생성 실패';
            case 'MESSAGE_SELECTED':
                return '메시지 선택 완료';
            case 'PERFORMANCE_REGISTERED':
                return '성과 등록 완료';
            case 'SUCCESS_CASE':
                return '성공 사례 지정';
            case 'RAG_REGISTERED':
                return 'RAG DB 등록 완료';
            default:
                return status;
        }
    };

    return (
        <div id="recent-promotions" className="home-section">
            <h2>최근 프로모션</h2>
            {activities.length > 0 ? (
                <ul>
                    {activities.map((activity) => (
                        <li key={activity.campaignId} onClick={() => handleActivityClick(activity.campaignId)}>
                            {activity.purpose} ({getStatusDisplayName(activity.status)})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>최근 활동이 없습니다.</p>
            )}
        </div>
    );
};


const Home: React.FC = () => {
    const navigate = useNavigate();
    const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
    const [recentActivityData, setRecentActivityItem] = useState<RecentActivityItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const summaryResponse = await axios.get<DashboardSummary>('/api/dashboard/summary');
                setSummaryData(summaryResponse.data);

                const activityResponse = await axios.get<RecentActivityItem[]>('/api/dashboard/recent-activity');
                setRecentActivityItem(activityResponse.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("대시보드 데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleNewPromotionClick = () => {
        navigate('/promotion/create');
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-message">데이터를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="centered-button-container">
                <button className="new-promotion-button" onClick={handleNewPromotionClick}>새 프로모션 만들기</button>
            </div>
            {summaryData && <CampaignStatus ongoingCampaigns={summaryData.ongoingCampaigns} />}
            <RecentPromotions activities={recentActivityData} />
        </div>
    );
};

export default Home;
