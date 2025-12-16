import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalHeader from './components/GlobalHeader';
import Home from './pages/Home';
import CampaignListPage from './pages/CampaignListPage';
import CampaignCreationPage from './pages/CampaignCreationPage'; // 추가
import CampaignDetailPage from './pages/CampaignDetailPage'; // 주석 해제 및 확인
import KnowledgeManagementPage from './pages/KnowledgeManagementPage';

function App() {
  return (
    <Router>
      <GlobalHeader />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:conversationId" element={<Home />} />
          <Route path="/promotion" element={<CampaignListPage />} />
          <Route path="/promotion/create" element={<CampaignCreationPage />} /> {/* 추가 */}
          <Route path="/campaign/:campaignId" element={<CampaignDetailPage />} /> {/* campaign_id를 campaignId로 변경 */}
          <Route path="/rag-db" element={<KnowledgeManagementPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
