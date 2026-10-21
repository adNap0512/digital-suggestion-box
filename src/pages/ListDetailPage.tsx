import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { SuggestionCard } from '../components/SuggestionCard/SuggestionCard';
import { CategoryBadge } from '../components/CategoryBadge/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge/StatusBadge';
import { useSuggestions } from '../context/SuggestionsContext';
import { formatAuthorLabel } from '../utils/authorDisplay';
import { filterSuggestions } from '../utils/filterSuggestions';
import type { FilterOptions, Suggestion } from '../utils/types';

export function ListDetailPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { suggestions, empathize } = useSuggestions();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  // URL の mine=1 を正とする。state にコピーしない
  const mineOnly = searchParams.get('mine') === '1';
  const appliedFilters: FilterOptions = { ...filters, mineOnly };
  const filtered = filterSuggestions(suggestions, appliedFilters);

  const handleFilterChange = (next: FilterOptions) => {
    setFilters({ category: next.category, status: next.status });
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next.mineOnly) {
          params.set('mine', '1');
        } else {
          params.delete('mine');
        }
        return params;
      },
      { replace: true },
    );
  };

  const restoreFocusOnCloseRef = useRef(false);

  const closeDetail = () => {
    restoreFocusOnCloseRef.current = true;
    setSelected(null);
  };

  // フィルタ後に一覧へ無い詳細は残さない
  useEffect(() => {
    if (selected && !filtered.some((item) => item.id === selected.id)) {
      setSelected(null);
    }
  }, [filtered, selected]);

  // パネルが消えたあとに、操作した「詳細を見る」へフォーカスを戻す
  useEffect(() => {
    if (selected || !restoreFocusOnCloseRef.current) return;
    restoreFocusOnCloseRef.current = false;
    lastTriggerRef.current?.focus();
  }, [selected]);

  // 描画後に詳細が見える位置へ寄せる。過剰な動きは避ける
  useEffect(() => {
    if (!selected) return;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || typeof panel.scrollIntoView !== 'function') return;
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panel.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDetail();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  return (
    <div data-testid="list-detail-page">
      <h1 className="page-title">
        {mineOnly ? '自分の投稿' : 'みんなの投稿'}
      </h1>
      <p className="page-description">
        投稿の対応状況を確認できます。共感ボタンで応援もできます。
      </p>

      <FilterBar filters={appliedFilters} onChange={handleFilterChange} />

      <div className="card-grid">
        {filtered.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onViewDetail={(trigger) => {
              lastTriggerRef.current = trigger;
              setSelected(s);
            }}
            onEmpathize={() => empathize(s.id)}
          />
        ))}
      </div>

      {selected && (
        <div
          className="detail-panel"
          data-testid="detail-panel"
          ref={panelRef}
          tabIndex={-1}
        >
          <div className="suggestion-card__header">
            <CategoryBadge category={selected.category} />
            <StatusBadge status={selected.status} />
          </div>
          <h2>{selected.title}</h2>
          <p data-testid="detail-author">{formatAuthorLabel(selected)}</p>
          <p className="detail-panel__body">{selected.body}</p>
          <p data-testid="detail-empathy">共感 {selected.empathyCount}</p>
          <p data-testid="detail-response">
            {selected.hasResponse ? '回答あり' : '回答なし'}
          </p>
          {selected.response && (
            <blockquote>{selected.response}</blockquote>
          )}
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="detail-close"
            onClick={closeDetail}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
