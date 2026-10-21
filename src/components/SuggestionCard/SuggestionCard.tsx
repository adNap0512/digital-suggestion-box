import { formatAuthorLabel } from '../../utils/authorDisplay';
import type { Suggestion } from '../../utils/types';
import { CategoryBadge } from '../CategoryBadge/CategoryBadge';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  /** 詳細を開く。カード全体クリックは使わない */
  onViewDetail?: (trigger: HTMLButtonElement) => void;
  onEmpathize?: () => void;
}

export function SuggestionCard({
  suggestion,
  onViewDetail,
  onEmpathize,
}: SuggestionCardProps) {
  const interactive = Boolean(onViewDetail);

  return (
    <article
      className={
        interactive
          ? 'suggestion-card suggestion-card--interactive'
          : 'suggestion-card'
      }
      data-testid="suggestion-card"
    >
      <div className="suggestion-card__header">
        <CategoryBadge category={suggestion.category} />
        <StatusBadge status={suggestion.status} />
      </div>
      <h3 className="suggestion-card__title">{suggestion.title}</h3>
      <p className="suggestion-card__author" data-testid="author-label">
        {formatAuthorLabel(suggestion)}
      </p>
      <p className="suggestion-card__body">{suggestion.body}</p>
      <div className="suggestion-card__meta">
        <span data-testid="empathy-count">共感 {suggestion.empathyCount}</span>
        <span data-testid="response-status">
          {suggestion.hasResponse ? (
            <span className="response-badge">回答あり</span>
          ) : (
            <span className="no-response">回答なし</span>
          )}
        </span>
        {onEmpathize && (
          <button
            type="button"
            className="btn btn-empathy"
            data-testid="empathy-button"
            onClick={onEmpathize}
          >
            共感する
          </button>
        )}
        {onViewDetail && (
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="view-detail"
            onClick={(event) => onViewDetail(event.currentTarget)}
          >
            詳細を見る
          </button>
        )}
      </div>
    </article>
  );
}
