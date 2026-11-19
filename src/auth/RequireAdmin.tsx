import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

/** 画面上のガード。削除などの実権限は RLS 側で検証する。 */
export function RequireAdmin() {
  const { isAdmin, loading } = useAdminAuth();
  if (loading) {
    return <p role="status">認証状態を確認しています…</p>;
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
