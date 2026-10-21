import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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
          </nav>
        </div>
      </header>
      <main className="app-container">
        <Outlet />
      </main>
    </>
  );
}
