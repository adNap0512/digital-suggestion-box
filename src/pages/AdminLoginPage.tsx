import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { ADMIN_LOGIN_ERROR_MESSAGE } from '../auth/adminAuth';

export function AdminLoginPage() {
  const { isAdmin, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p role="status">認証状態を確認しています…</p>;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    let ok = false;
    try {
      ok = await login(adminId, password);
    } catch {
      ok = false;
    }
    setSubmitting(false);
    if (!ok) {
      setError(ADMIN_LOGIN_ERROR_MESSAGE);
      return;
    }
    setError('');
    navigate('/admin');
  };

  return (
    <div className="form-page login-page" data-testid="admin-login-page">
      <h1 className="page-title">管理者ログイン</h1>
      <p className="page-description">
        Supabase接続時は認証済みの管理者のみログインできます。ローカル保存時は開発用の仮ログインです。
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="admin-id">管理者ID</label>
          <input
            id="admin-id"
            data-testid="input-admin-id"
            autoComplete="username"
            value={adminId}
            onChange={(event) => setAdminId(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="admin-password">パスワード</label>
          <input
            id="admin-password"
            data-testid="input-admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p className="form-error" data-testid="admin-login-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loading}
          className="btn btn-primary"
          data-testid="admin-login-submit"
        >
          ログイン
        </button>
      </form>

      <p className="form-help">
        <Link to="/" data-testid="admin-login-back">
          トップへ戻る
        </Link>
      </p>
    </div>
  );
}
