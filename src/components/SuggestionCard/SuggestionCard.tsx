import type { Suggestion } from '../../utils/types';
import { CategoryBadge } from '../CategoryBadge/CategoryBadge';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick?: () => void;
  onEmpathize?: () => void;
}

export function SuggestionCard({
  suggestion,
  onClick,
  onEmpathize,
}: SuggestionCardProps) {
  return (
    <article
      className="suggestion-card"
      data-testid="suggestion-card"
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="suggestion-card__header">
        <CategoryBadge category={suggestion.category} />
        <StatusBadge status={suggestion.status} />
      </div>
      <h3 className="suggestion-card__title">{suggestion.title}</h3>
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
            onClick={(e) => {
              e.stopPropagation();
              onEmpathize();
            }}
          >
            共感する
          </button>
        )}
      </div>
    </article>
  );
}
