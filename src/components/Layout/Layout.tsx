import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../../auth/AdminAuthContext';

export function Layout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAdmin, logout } = useAdminAuth();
  const mineOnly = searchParams.get('mine') === '1';

  const isActive = (path: string) =>
    location.pathname === path ? 'active' : '';

  const allListActive =
    location.pathname === '/list' && !mineOnly ? 'active' : '';
  const myListActive =
    location.pathname === '/list' && mineOnly ? 'active' : '';

  return (
    <>
      <header className="layout-header">
        <div className="layout-header__inner">
          <Link to="/" className="layout-header__logo">
            デジタル目安箱
          </Link>
          <nav className="layout-nav" aria-label="メインナビゲーション">
            <Link to="/" className={isActive('/')}>
              トップ
            </Link>
            <Link to="/post" className={isActive('/post')}>
              投稿する
            </Link>
            <Link to="/list" data-testid="nav-all-list" className={allListActive}>
              みんなの投稿
            </Link>
            <Link
              to="/list?mine=1"
              data-testid="nav-my-list"
              className={myListActive}
            >
              自分の投稿
            </Link>
            <span className="layout-nav__admin">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    data-testid="nav-admin"
                    className={isActive('/admin')}
                  >
                    管理者画面
                  </Link>
                  <button
                    type="button"
                    className="layout-nav__logout"
                    data-testid="nav-logout"
                    onClick={logout}
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  data-testid="nav-admin-login"
                  className={isActive('/admin/login')}
                >
                  管理者ログイン
                </Link>
              )}
            </span>
          </nav>
        </div>
      </header>
      <main className="app-container">
        <Outlet />
      </main>
    </>
  );
}
