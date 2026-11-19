import { HashRouter, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './auth/AdminAuthContext';
import { RequireAdmin } from './auth/RequireAdmin';
import { Layout } from './components/Layout/Layout';
import { SuggestionsProvider } from './context/SuggestionsContext';
import { TopPage } from './pages/TopPage';
import { PostFormPage } from './pages/PostFormPage';
import { ListDetailPage } from './pages/ListDetailPage';
import { AdminListPage } from './pages/AdminListPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

export function App() {
  return (
    <SuggestionsProvider>
      <AdminAuthProvider>
        {/* GitHub Pages では直接パスアクセスで 404 になりやすいため HashRouter を使う */}
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<TopPage />} />
              <Route path="/post" element={<PostFormPage />} />
              <Route path="/list" element={<ListDetailPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminListPage />} />
              </Route>
            </Route>
          </Routes>
        </HashRouter>
      </AdminAuthProvider>
    </SuggestionsProvider>
  );
}
