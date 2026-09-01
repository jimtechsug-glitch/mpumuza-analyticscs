import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import PortalLoginPage from './PortalLoginPage';

export default function LandingLoginPage({ initialView = 'signin' }) {
  // Check hash or default to standout portal sign in
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#showcase') {
      return 'showcase';
    }
    return 'signin';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#showcase') {
        setView('showcase');
      } else {
        setView('signin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goToSignIn = () => {
    if (typeof window !== 'undefined') window.location.hash = '#login';
    setView('signin');
  };

  const goToHome = () => {
    if (typeof window !== 'undefined') window.location.hash = '#showcase';
    setView('showcase');
  };

  if (view === 'showcase') {
    return <LandingPage onGoToSignIn={goToSignIn} />;
  }

  return <PortalLoginPage onBackToHome={goToHome} />;
}
