import React from 'react';
import GlobalHeader from './components/GlobalHeader';
import GlobalFooter from './components/GlobalFooter';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <>
      <GlobalHeader />
      <main className="main-content">
        <Home />
      </main>
      <GlobalFooter />
    </>
  );
}

export default App;
