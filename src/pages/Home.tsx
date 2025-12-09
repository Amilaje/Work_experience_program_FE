import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Chart.js-Elemente registrieren
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// --- INTERFACES ---
interface MonthlySummary {
    month: string;
    ongoingCount: number;
    completedCount: number;
}

interface RecentActivityItem {
    campaignId: string;
    purpose: string;
    status: string;
    updatedAt: string;
}

// --- Status-Mapping-Funktion ---
const getStatusDisplayName = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        CREATING: '생성중',
        ONGOING: '진행중',
        CASE_REGISTERED: '사례 등록',
        DB_REGISTERED: 'DB 등록',
        PROCESSING: 'AI 메시지 생성 중',
        REFINING: 'AI 메시지 수정 중',
        COMPLETED: '메시지 생성 완료',
        FAILED: '메시지 생성 실패',
        MESSAGE_SELECTED: '메시지 선택 완료',
        PERFORMANCE_REGISTERED: '성과 등록 완료',
        SUCCESS_CASE: '성공 사례 지정',
        RAG_REGISTERED: 'RAG DB 등록 완료',
    };
    return statusMap[status] || status;
};

// --- KOMPONENTEN ---

const MonthlyPerformanceChart: React.FC<{ data: MonthlySummary[] }> = ({ data }) => {
    const chartData = {
        labels: data.map(d => d.month),
        datasets: [
            {
                type: 'bar' as const,
                label: '완료',
                data: data.map(d => d.completedCount),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                order: 1,
            },
            {
                type: 'bar' as const,
                label: '진행중',
                data: data.map(d => d.ongoingCount),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                order: 1,
            },
            {
                type: 'line' as const,
                label: '완료 추세',
                data: data.map(d => d.completedCount),
                borderColor: '#003366',
                backgroundColor: 'transparent',
                pointBackgroundColor: '#003366',
                tension: 0.3,
                order: 0,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    filter: (item) => {
                        return item.text !== '완료 추세';
                    }
                }
            },
            title: {
                display: true,
                text: '최근 6개월 프로모션 현황',
                font: {
                    size: 20
                }
            },
        },
        scales: {
            x: { stacked: true },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { stepSize: 1 }
            },
        },
    };

    return (
        <div className="home-section">
            <Bar data={chartData} options={options} />
        </div>
    );
};

const RecentPromotions: React.FC<{ activities: RecentActivityItem[], onNewPromotionClick: () => void }> = ({ activities, onNewPromotionClick }) => {
    const navigate = useNavigate();

    const handleActivityClick = (campaignId: string) => {
        navigate(`/campaign/${campaignId}`);
    };

    return (
        <div id="recent-promotions" className="home-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgb(74, 144, 226)', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: '0px', borderBottom: 'none' }}>최근 프로모션</h2>
                <button className="new-promotion-button" onClick={onNewPromotionClick} style={{ fontSize: '0.9rem', padding: '8px 16px', boxShadow: 'none' }}>새 프로모션 만들기</button>
            </div>
            {activities.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {activities.map((activity) => (
                        <li key={activity.campaignId} onClick={() => handleActivityClick(activity.campaignId)}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                            <div>
                                <div className="promotion-title" style={{ fontWeight: 'bold' }} title={activity.purpose}>
                                  {activity.purpose}
                                </div>
                                <div style={{ fontSize: '0.9em', color: '#666' }}>{getStatusDisplayName(activity.status)}</div>
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#999' }}>{new Date(activity.updatedAt).toLocaleDateString()}</div>
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
    const [summaryData, setSummaryData] = useState<MonthlySummary[]>([]);
    const [recentActivityData, setRecentActivityData] = useState<RecentActivityItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [summaryResponse, activityResponse] = await Promise.all([
                    axios.get<MonthlySummary[]>('/api/dashboard/summary'),
                    axios.get<RecentActivityItem[]>('/api/dashboard/recent-activity')
                ]);
                setSummaryData(summaryResponse.data);
                setRecentActivityData(activityResponse.data);
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
            <div className="home-container" style={{padding: "20px"}}>
                <div className="loading-message">데이터를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container" style={{padding: "20px"}}>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="home-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    background: 'linear-gradient(to right, #4A90E2, #00C6FF)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                }}>
                    마케팅 현황
                </h1>
                <p style={{ margin: '5px 0 0', color: '#666' }}>
                    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </p>
            </div>
            <div className="dashboard-layout">
                <MonthlyPerformanceChart data={summaryData} />
                <RecentPromotions activities={recentActivityData} onNewPromotionClick={handleNewPromotionClick} />
            </div>
        </div>
    );
};

export default Home;