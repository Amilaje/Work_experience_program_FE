import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './KnowledgeManagementPage.css';

import KnowledgeDetailModal from './KnowledgeDetailModal';
import KnowledgeCreationModal from '../components/KnowledgeCreationModal';
import KnowledgeEditModal from '../components/KnowledgeEditModal';

// API 목록 응답을 위한 타입
interface KnowledgeListItem {
  knowledge_id: string;
  title: string;
  source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
  upload_date: string;
}

// API 상세 응답을 위한 타입
interface KnowledgeDetail {
  document: string;
  id: string;
  metadata: {
    title: string;
    registration_date: string;
    source_type: '정책' | '약관' | '성공_사례' | '실패_사례';
    campaign_id?: string;
    // content_text는 상세 API에 없으므로 제거
  };
}

const KnowledgeManagementPage: React.FC = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSourceType, setFilterSourceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 state 추가

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [knowledgeDetail, setKnowledgeDetail] = useState<KnowledgeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKnowledgeForEdit, setSelectedKnowledgeForEdit] = useState<any | null>(null);


  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const params: { source_type?: string } = {};
      if (filterSourceType !== 'all') {
        params.source_type = filterSourceType;
      }
      const response = await axios.get<{ knowledge_base: any[] }>('/api/knowledge', { params });
      const transformedKnowledgeBase: KnowledgeListItem[] = response.data.knowledge_base.map(item => ({
        knowledge_id: item.id,
        title: item.metadata.title,
        source_type: item.metadata.source_type,
        upload_date: item.metadata.registration_date,
      }));
      setKnowledgeBase(transformedKnowledgeBase || []);
    } catch (err) {
      setError('지식 베이스 데이터를 불러오는 데 실패했습니다.');
      console.error('Error fetching knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [filterSourceType]);

  // 필터링과 정렬을 함께 처리하는 useMemo
  const filteredAndSortedKnowledgeBase = useMemo(() => {
    return knowledgeBase
      .filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
  }, [knowledgeBase, searchTerm]);

  const handleOpenDetailModal = async (knowledgeId: string) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const response = await axios.get<KnowledgeDetail>(`/api/knowledge/${knowledgeId}`);
      setKnowledgeDetail(response.data);
    } catch (error) {
      console.error("Error fetching knowledge detail:", error);
      setError('상세 정보를 불러오는 데 실패했습니다.');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setKnowledgeDetail(null);
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!window.confirm('정말로 이 지식을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axios.delete(`/api/knowledge/${id}`);
      alert('지식이 성공적으로 삭제되었습니다.');
      handleCloseDetailModal();
      fetchKnowledge(); // 목록 새로고침
    } catch (err) {
      console.error('Error deleting knowledge item:', err);
      alert('지식 삭제에 실패했습니다.');
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    fetchKnowledge();
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedKnowledgeForEdit(item);
    setIsEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedKnowledgeForEdit(null);
    fetchKnowledge();
  };

  if (error) {
    return (
      <div className="knowledge-management-container">
        <h1>RAG 지식 베이스 관리</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (loading) return <div className="knowledge-management-container"><h1>Loading...</h1></div>;

  return (
    <div className="knowledge-management-container">
      <h1>RAG 지식 베이스 관리</h1>
      <div className="toolbar">
        <div className="filter-controls">
          <label htmlFor="source-type-filter">출처:</label>
          <select
            id="source-type-filter"
            className="filter-dropdown"
            value={filterSourceType}
            onChange={(e) => setFilterSourceType(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="정책">정책</option>
            <option value="약관">약관</option>
            <option value="성공_사례">성공 사례</option>
            <option value="실패_사례">실패 사례</option>
          </select>
          <input
            type="text"
            placeholder="제목으로 검색..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="new-knowledge-button" onClick={handleOpenCreateModal}>신규 지식 등록</button>
      </div>
      <table className="knowledge-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>출처</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedKnowledgeBase.map(item => (
            <tr key={item.knowledge_id}>
              <td 
                className="knowledge-title"
                onClick={() => handleOpenDetailModal(item.knowledge_id)}
              >
                {item.title}
              </td>
              <td>{item.source_type}</td>
              <td>{item.upload_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <KnowledgeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onDelete={handleDeleteKnowledge}
        onEdit={handleOpenEditModal}
        data={knowledgeDetail}
        loading={loadingDetail}
      />
      <KnowledgeCreationModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onKnowledgeCreated={fetchKnowledge}
      />
      <KnowledgeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onKnowledgeUpdated={fetchKnowledge}
        knowledgeItem={selectedKnowledgeForEdit}
      />
    </div>
  );
};

export default KnowledgeManagementPage;