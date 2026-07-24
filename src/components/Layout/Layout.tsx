import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'active' : '';

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
            <Link to="/list" className={isActive('/list')}>
              みんなの投稿
            </Link>
            <Link to="/list?mine=1" className={location.search.includes('mine=1') ? 'active' : ''}>
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
