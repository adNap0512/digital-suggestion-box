import type { Category } from '../../utils/types';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="badge badge--category" data-testid="category-badge">
      {category}
    </span>
  );
}
