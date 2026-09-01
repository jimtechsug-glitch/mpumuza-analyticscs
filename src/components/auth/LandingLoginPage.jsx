import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import PortalLoginPage from './PortalLoginPage';

export default function LandingLoginPage() {
  // Default to landing showcase; only switch to signin when user navigates there
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#login') {
      return 'signin';
    }
    return 'showcase';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#login') {
        setView('signin');
      } else {
        setView('showcase');
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
    if (typeof window !== 'undefined') window.location.hash = '';
    setView('showcase');
  };

  if (view === 'signin') {
    return <PortalLoginPage onBackToHome={goToHome} />;
  }

  return <LandingPage onGoToSignIn={goToSignIn} />;
}

