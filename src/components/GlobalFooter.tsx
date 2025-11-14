import React from 'react';
import './GlobalFooter.css';

const GlobalFooter: React.FC = () => {
  return (
    <footer className="global-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} MAIX. All rights reserved.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
