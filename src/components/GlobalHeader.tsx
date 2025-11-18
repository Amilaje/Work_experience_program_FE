import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ktLogo from '../assets/KT_Logo.png';

const GlobalHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="global-header">
            <div className="logo">
                <span className="logo-main">MAIX</span>
                <span className="logo-separator">|</span>
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
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/promotion" className={({ isActive }) => isActive ? 'active' : ''}>
                            프로모션
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/rag-db" className={({ isActive }) => isActive ? 'active' : ''}>
                            RAG DB 관리
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default GlobalHeader;
