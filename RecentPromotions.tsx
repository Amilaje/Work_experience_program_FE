import React from 'react';
import styled from 'styled-components';
import './src/pages/Home.css'; // 스타일을 위해 Home.css를 import 합니다.

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
`;

const RecentPromotions: React.FC = () => {
  return (
    <SectionContainer>
      <Title>최근 프로모션</Title>
      {/* 최근 프로모션 목록이 여기에 추가됩니다. */}
      <div className="centered-button-container">
        <button className="new-promotion-button">새 프로모션 만들기</button>
      </div>
    </SectionContainer>
  );
};

export default RecentPromotions;