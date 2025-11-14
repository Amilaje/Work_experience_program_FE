import React, { useState } from 'react';
import './GlobalHeader.css';
import ktLogo from '../assets/kt_logo.png'; // kt 로고 이미지 임포트

const GlobalHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 현재 경로를 기반으로 active 클래스를 동적으로 설정하기 위한 로직
    // 지금은 react-router-dom이 없으므로 'Home'에 기본적으로 active 스타일을 적용합니다.
    const currentPath = '/'; 

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="global-header">
            <div className="logo">
                <span className="logo-main">MAIX</span>
                <span className="logo-separator">x</span>
                <img src={ktLogo} alt="KT Logo" className="logo-kt-img" />
            </div>
            <button className="hamburger-menu" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                <ul>
                    <li>
                        <a href="/" className={currentPath === '/' ? 'active' : ''}>
                            Home (대시보드)
                        </a>
                    </li>
                    <li>
                        <a href="/promotions" className={currentPath === '/promotions' ? 'active' : ''}>
                            프로모션 목록
                        </a>
                    </li>
                    <li>
                        <a href="/rag-db" className={currentPath === '/rag-db' ? 'active' : ''}>
                            RAG DB 관리
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default GlobalHeader;
