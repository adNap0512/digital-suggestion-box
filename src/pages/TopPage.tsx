import { Link } from 'react-router-dom';
import { SummaryCard } from '../components/SummaryCard/SummaryCard';
import { SuggestionCard } from '../components/SuggestionCard/SuggestionCard';
import { useSuggestions } from '../context/SuggestionsContext';
import { getRecentSuggestions } from '../utils/filterSuggestions';
import { getSummaryStats } from '../utils/summaryStats';

export function TopPage() {
  const { suggestions } = useSuggestions();
  const stats = getSummaryStats(suggestions);
  const recent = getRecentSuggestions(suggestions, 3);

  return (
    <div data-testid="top-page">
      <h1 className="page-title">デジタル目安箱</h1>
      <p className="page-description">
        困りごとや改善アイデアを気軽に投稿して、社内改善の輪を広げましょう。
      </p>

      <div className="cta-group">
        <Link to="/post" className="btn btn-primary" data-testid="cta-post">
          投稿する
        </Link>
        <Link to="/list" className="btn btn-secondary" data-testid="cta-all-list">
          みんなの投稿を見る
        </Link>
        <Link
          to="/list?mine=1"
          className="btn btn-secondary"
          data-testid="cta-my-list"
        >
          自分の投稿を見る
        </Link>
      </div>

      <div className="summary-grid" data-testid="summary-section">
        <SummaryCard label="投稿数" value={stats.total} />
        <SummaryCard label="対応済み" value={stats.resolved} />
        <SummaryCard label="検討中" value={stats.reviewing} />
      </div>

      <h2 className="section-heading">最近の投稿</h2>
      <div className="card-grid">
        {recent.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>
    </div>
  );
}
