import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './KnowledgeManagementPage.css';
import KnowledgeDetailModal from './KnowledgeDetailModal';
import KnowledgeCreationModal from '../components/KnowledgeCreationModal';
import KnowledgeEditModal from '../components/KnowledgeEditModal';

// 타입 정의 (파일 내부에 임시적으로 정의하거나, 별도 파일에서 import 해야 합니다)
interface KnowledgeListItem {
  knowledge_id: string;
  title: string;
  source_type: string;
  upload_date: string;
}

interface KnowledgeDetail {
  document: string;
  // 상세 정보에 필요한 필드를 정의합니다.
  id: string;
  metadata: {
    title: string;
    source_type: string;
    registration_date: string;
    content_text: string;
  };
}

interface KnowledgeSourceItem {
    id: string;
    metadata: {
        title: string;
        source_type: string;
        registration_date: string;
    };
}

interface Page<T> {
    knowledge_base?: T[];
    data?: T[];
    total_pages: number;
}

const sourceTypeMap: { [key: string]: string } = {
  '성공_사례': 'success',
  '실패_사례': 'failure',
  '정책': 'policy',
  '약관': 'terms',
  '가이드': 'guide',
};


const KnowledgeManagementPage: React.FC = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSourceType, setFilterSourceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [knowledgeDetail, setKnowledgeDetail] = useState<KnowledgeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKnowledgeForEdit, setSelectedKnowledgeForEdit] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1); // 페이지를 1-based로 변경
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Debounce search term to prevent API calls on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only trigger a new search if the debounced term is different
      if (searchTerm !== debouncedSearchTerm) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to first page for new search
      }
    }, 500); // 500ms delay

    // Cleanup timeout on component unmount or if searchTerm changes
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearchTerm]);


  const fetchKnowledge = async () => {
    try {
      setLoading(true);

      // 모든 파라미터를 하나의 객체로 관리하여 axios에 전달
      const params: any = {
        page: currentPage, // 1-based 페이지 전송
        size: pageSize,
        sort: 'registration_date,desc', // 날짜 내림차순 정렬
      };

      if (filterSourceType !== 'all') {
        params.source_type = filterSourceType;
      }
      // Use the debounced term for the API call
      if (debouncedSearchTerm) {
        params.title = debouncedSearchTerm;
      }

      const response = await axios.get<Page<KnowledgeSourceItem>>('/api/knowledge', { params });
      
      const items = response.data.knowledge_base || response.data.data || [];

      const transformedKnowledgeBase: KnowledgeListItem[] = items.map(item => ({
        knowledge_id: item.id,
        title: item.metadata.title,
        source_type: item.metadata.source_type,
        upload_date: item.metadata.registration_date,
      }));
      
      setKnowledgeBase(transformedKnowledgeBase);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      setError('지식 베이스 데이터를 불러오는 데 실패했습니다.');
      console.error('Error fetching knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  // Main data fetching effect, now depends on the debounced search term
  useEffect(() => {
    fetchKnowledge();
  }, [currentPage, filterSourceType, debouncedSearchTerm]);


  const handleOpenDetailModal = async (knowledgeId: string) => {
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const response = await axios.get<KnowledgeDetail>(`/api/knowledge/${knowledgeId}`);
      setKnowledgeDetail(response.data);
    } catch (error) {
      console.error("Error fetching knowledge detail:", error);
      setError('상세 정보를 불러오는 데 실패했습니다.');
      setKnowledgeDetail(null);
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

  if (loading && !knowledgeBase.length) return <div className="knowledge-list-container"><h1>Loading...</h1></div>;

  return (
    <div className="knowledge-list-container">
      <div className="knowledge-list-header">
        <h1>RAG 지식 베이스 관리</h1>
      </div>
      <div className="filter-and-search">
        <input
          type="text"
          placeholder="제목으로 검색..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="status-filter"
          value={filterSourceType}
          onChange={(e) => {
            setCurrentPage(1); // 1-based로 리셋
            setFilterSourceType(e.target.value);
          }}
        >
          <option value="all">모든 출처</option>
          <option value="정책">정책</option>
          <option value="약관">약관</option>
          <option value="성공_사례">성공 사례</option>
          <option value="실패_사례">실패 사례</option>
          <option value="가이드">가이드</option>
        </select>
        <button className="new-knowledge-button" onClick={handleOpenCreateModal}>신규 지식 등록</button>
      </div>
      {loading ? (
        <p>목록을 불러오는 중입니다...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
      <>
      <table className="knowledge-table">
        <thead>
          <tr>
            <th>등록일</th>
            <th>제목</th>
            <th>출처</th>
          </tr>
        </thead>
        <tbody>
          {knowledgeBase.length > 0 ? (
            knowledgeBase.map(item => (
              <tr key={item.knowledge_id}>
                <td>{item.upload_date.split(' ')[0]}</td>
                <td 
                  className="knowledge-title"
                  onClick={() => handleOpenDetailModal(item.knowledge_id)}
                >
                  <div className="knowledge-title-content">{item.title}</div>
                </td>
                <td>
                  <span className={`source-badge source-${sourceTypeMap[item.source_type] || 'default'}`}>
                    {item.source_type}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center' }}>결과가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
      </>
      )}
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