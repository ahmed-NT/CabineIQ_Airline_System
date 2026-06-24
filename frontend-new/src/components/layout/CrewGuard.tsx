import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function CrewGuard({ children }: { children: React.ReactNode }) {
  const { isCrew } = useAuth();
  if (isCrew) return <Navigate to="/" replace />;
  return <>{children}</>;
}
