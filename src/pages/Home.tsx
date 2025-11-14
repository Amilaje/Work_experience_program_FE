import React from 'react';
import './Home.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// 임시 컴포넌트들 - 실제로는 별도 파일로 분리될 수 있습니다.
const CampaignStatus: React.FC = () => {
    const data = {
        labels: ['진행 중', '미진행'],
        datasets: [
            {
                data: [5, 15], // 예시 데이터: 20개 중 5개 진행
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
            const { ctx, data } = chart;
            const centerX = chart.getDatasetMeta(0).data[0].x;
            const centerY = chart.getDatasetMeta(0).data[0].y;
            
            ctx.save();
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const campaignCount = data.datasets[0].data[0];
            ctx.fillText(`${campaignCount}개`, centerX, centerY - 10);

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

const RecentPromotions: React.FC = () => (
    <div id="recent-promotions" className="home-section">
        <h2>최근 프로모션</h2>
        <ul>
            <li>겨울 시즌 할인 (진행중)</li>
            <li>신규 고객 환영 (자동)</li>
            <li>VIP 고객 감사 (완료)</li>
        </ul>
    </div>
);


const Home: React.FC = () => {
    return (
        <div className="home-container">
            <div className="centered-button-container">
                <button className="new-promotion-button">새 프로모션 만들기</button>
            </div>
            <CampaignStatus />
            <RecentPromotions />
        </div>
    );
};

export default Home;
