import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { SuggestionCard } from '../components/SuggestionCard/SuggestionCard';
import { CategoryBadge } from '../components/CategoryBadge/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge/StatusBadge';
import { useSuggestions } from '../context/SuggestionsContext';
import { filterSuggestions } from '../utils/filterSuggestions';
import type { FilterOptions, Suggestion } from '../utils/types';

export function ListDetailPage() {
  const [searchParams] = useSearchParams();
  const { suggestions, empathize } = useSuggestions();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selected, setSelected] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (searchParams.get('mine') === '1') {
      setFilters((f) => ({ ...f, mineOnly: true }));
    }
  }, [searchParams]);

  const filtered = filterSuggestions(suggestions, filters);

  return (
    <div data-testid="list-detail-page">
      <h1 className="page-title">
        {filters.mineOnly ? '自分の投稿' : 'みんなの投稿'}
      </h1>
      <p className="page-description">
        投稿の対応状況を確認できます。共感ボタンで応援もできます。
      </p>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="card-grid">
        {filtered.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onClick={() => setSelected(s)}
            onEmpathize={() => empathize(s.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="detail-panel" data-testid="detail-panel">
          <div className="suggestion-card__header">
            <CategoryBadge category={selected.category} />
            <StatusBadge status={selected.status} />
          </div>
          <h2>{selected.title}</h2>
          <p className="detail-panel__body">{selected.body}</p>
          <p data-testid="detail-empathy">共感 {selected.empathyCount}</p>
          <p data-testid="detail-response">
            {selected.hasResponse ? '回答あり' : '回答なし'}
          </p>
          {selected.response && (
            <blockquote>{selected.response}</blockquote>
          )}
        </div>
      )}
    </div>
  );
}
