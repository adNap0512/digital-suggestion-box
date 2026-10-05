import { useState } from 'react';
import { SuggestionCard } from '../components/SuggestionCard/SuggestionCard';
import { CategoryBadge } from '../components/CategoryBadge/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge/StatusBadge';
import { useSuggestions } from '../context/SuggestionsContext';
import { STATUSES } from '../data/categories';
import type { Status, Suggestion } from '../utils/types';

export function AdminListPage() {
  const { suggestions, changeStatus, submitResponse, removeSuggestion } =
    useSuggestions();
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [adminStatus, setAdminStatus] = useState<Status>('未確認');
  const [adminResponse, setAdminResponse] = useState('');

  const openDetail = (suggestion: Suggestion) => {
    setSelected(suggestion);
    setAdminStatus(suggestion.status);
    setAdminResponse(suggestion.response ?? '');
  };

  const handleStatusSave = () => {
    if (!selected) return;
    changeStatus(selected.id, adminStatus);
    setSelected((prev) => (prev ? { ...prev, status: adminStatus } : null));
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

  const handleDelete = () => {
    if (!selected) return;
    // 認証が無いので、誤操作だけは確認で止める
    const confirmed = window.confirm(
      'この投稿を削除しますか？削除すると元に戻せません。',
    );
    if (!confirmed) return;
    removeSuggestion(selected.id);
    setSelected(null);
  };

  return (
    <div data-testid="admin-list-page">
      <h1 className="page-title">投稿管理</h1>
      <p className="admin-notice" data-testid="admin-auth-notice">
        管理者認証は未実装の PoC
        です。この画面の URL を知っている人は、ステータス変更・回答・投稿の削除ができます。削除はデータベースにも反映されます。
      </p>

      <div className="card-grid">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onClick={() => openDetail(suggestion)}
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
          <p data-testid="detail-response">
            {selected.hasResponse ? '回答あり' : '回答なし'}
          </p>
          {selected.response && <blockquote>{selected.response}</blockquote>}

          <div className="admin-section" data-testid="admin-section">
            <h3>管理者向け操作</h3>
            <div className="form-group">
              <label htmlFor="admin-status">ステータス変更</label>
              <select
                id="admin-status"
                data-testid="admin-status-select"
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value as Status)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
            <div className="form-group">
              <button
                type="button"
                className="btn btn-danger"
                data-testid="admin-delete"
                onClick={handleDelete}
              >
                投稿を削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
