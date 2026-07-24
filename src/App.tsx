import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { SuggestionsProvider } from './context/SuggestionsContext';
import { TopPage } from './pages/TopPage';
import { PostFormPage } from './pages/PostFormPage';
import { ListDetailPage } from './pages/ListDetailPage';

export function App() {
  return (
    <SuggestionsProvider>
      {/* GitHub Pages では直接パスアクセスで 404 になりやすいため HashRouter を使う */}
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<TopPage />} />
            <Route path="/post" element={<PostFormPage />} />
            <Route path="/list" element={<ListDetailPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </SuggestionsProvider>
  );
}
