import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.section`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333333;
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DonutChart: React.FC<{ percentage: number }> = ({ percentage }) => {
  const sqSize = 200;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox}>
      <circle
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        stroke="#e6e6e6"
        fill="none"
      />
      <circle
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        stroke="url(#gradient)"
        fill="none"
        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
      <text x="50%" y="50%" dy=".3em" textAnchor="middle" fontSize="2em" fontWeight="bold" fill="#333333">
        {`${percentage}%`}
      </text>
      <defs>
        <linearGradient id="gradient">
          <stop offset="0%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#00C6FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const CampaignStatus: React.FC = () => {
  // 예시 데이터
  const campaignProgress = 75;

  return (
    <SectionContainer>
      <Title>캠페인 현황</Title>
      <ChartContainer>
        <DonutChart percentage={campaignProgress} />
      </ChartContainer>
    </SectionContainer>
  );
};

export default CampaignStatus;