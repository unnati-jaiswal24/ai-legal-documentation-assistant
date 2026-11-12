import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function getStartAgreementNavigation(user, loading) {
  if (loading) return null;
  if (!user) return { to: '/login', options: { state: { from: '/drafts/new?auto=true' } } };
  return { to: '/drafts/new?auto=true' };
}

export default function useStartAgreement() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const startAgreement = useCallback(() => {
    const destination = getStartAgreementNavigation(user, loading);
    if (destination) navigate(destination.to, destination.options);
  }, [user, loading, navigate]);

  return {
    startAgreement,
    loading,
  };
}
