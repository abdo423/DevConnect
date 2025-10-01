import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '@/app/store';

const PrivateRoutes = () => {
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <div>Loading...</div>;

  // if fetching fails or user is not authenticated -> redirect
  if (error || !user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default PrivateRoutes;
