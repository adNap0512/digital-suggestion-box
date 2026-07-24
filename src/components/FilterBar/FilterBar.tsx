import { CATEGORIES, STATUSES } from '../../data/categories';
import type { FilterOptions } from '../../utils/types';

interface FilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" data-testid="filter-bar">
      <select
        aria-label="カテゴリフィルタ"
        data-testid="filter-category"
        value={filters.category ?? 'すべて'}
        onChange={(e) =>
          onChange({
            ...filters,
            category: e.target.value as FilterOptions['category'],
          })
        }
      >
        <option value="すべて">すべてのカテゴリ</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        aria-label="ステータスフィルタ"
        data-testid="filter-status"
        value={filters.status ?? 'すべて'}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as FilterOptions['status'],
          })
        }
      >
        <option value="すべて">すべてのステータス</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label>
        <input
          type="checkbox"
          data-testid="filter-mine"
          checked={filters.mineOnly ?? false}
          onChange={(e) =>
            onChange({ ...filters, mineOnly: e.target.checked })
          }
        />
        自分の投稿のみ
      </label>
    </div>
  );
}
