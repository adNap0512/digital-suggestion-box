import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { SuggestionCard } from '../components/SuggestionCard/SuggestionCard';
import { CategoryBadge } from '../components/CategoryBadge/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge/StatusBadge';
import { useSuggestions } from '../context/SuggestionsContext';
import { STATUSES } from '../data/categories';
import { filterSuggestions } from '../utils/filterSuggestions';
import type { FilterOptions, Status, Suggestion } from '../utils/types';

export function ListDetailPage() {
  const [searchParams] = useSearchParams();
  const { suggestions, empathize, changeStatus, submitResponse } =
    useSuggestions();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [adminStatus, setAdminStatus] = useState<Status>('未確認');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (searchParams.get('mine') === '1') {
      setFilters((f) => ({ ...f, mineOnly: true }));
    }
  }, [searchParams]);

  const filtered = filterSuggestions(suggestions, filters);

  const openDetail = (s: Suggestion) => {
    setSelected(s);
    setAdminStatus(s.status);
    setAdminResponse(s.response ?? '');
  };

  const handleStatusSave = () => {
    if (!selected) return;
    changeStatus(selected.id, adminStatus);
    setSelected((prev) =>
      prev ? { ...prev, status: adminStatus } : null,
    );
  };

  const handleResponseSave = () => {
    if (!selected) return;
    submitResponse(selected.id, adminResponse);
    setSelected((prev) =>
      prev
        ? {
            ...prev,
            response: adminResponse,
            hasResponse: adminResponse.trim().length > 0,
          }
        : null,
    );
  };

  return (
    <div data-testid="list-detail-page">
      <h1 className="page-title">
        {filters.mineOnly ? '自分の投稿' : 'みんなの投稿'}
      </h1>
      <p className="page-description">
        投稿の対応状況を確認できます。共感ボタンで応援もできます。
      </p>

      <FilterBar filters={filters} onChange={setFilters} />

      <label className="admin-toggle">
        <input
          type="checkbox"
          data-testid="admin-mode-toggle"
          checked={adminMode}
          onChange={(e) => setAdminMode(e.target.checked)}
        />
        管理者モード
      </label>

      <div className="card-grid">
        {filtered.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onClick={() => openDetail(s)}
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

          {adminMode && (
            <div className="admin-section" data-testid="admin-section">
              <h3>管理者向け操作</h3>
              <div className="form-group">
                <label htmlFor="admin-status">ステータス変更</label>
                <select
                  id="admin-status"
                  data-testid="admin-status-select"
                  value={adminStatus}
                  onChange={(e) =>
                    setAdminStatus(e.target.value as Status)
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-testid="admin-status-save"
                  onClick={handleStatusSave}
                >
                  ステータスを更新
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="admin-response">回答入力</label>
                <textarea
                  id="admin-response"
                  data-testid="admin-response-input"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="投稿者への回答を入力"
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  data-testid="admin-response-save"
                  onClick={handleResponseSave}
                >
                  回答を保存
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
