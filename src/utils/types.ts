export type Status = '未確認' | '検討中' | '対応中' | '対応済み';

export type Category =
  | '業務改善'
  | '職場環境'
  | 'ツール・システム'
  | 'イベント・福利厚生'
  | 'その他';

export interface Suggestion {
  id: string;
  title: string;
  body: string;
  category: Category;
  isAnonymous: boolean;
  authorName?: string;
  status: Status;
  empathyCount: number;
  hasResponse: boolean;
  response?: string;
  createdAt: string;
  isMine: boolean;
}

export interface FilterOptions {
  category?: Category | 'すべて';
  status?: Status | 'すべて';
  mineOnly?: boolean;
}

export interface SummaryStats {
  total: number;
  resolved: number;
  reviewing: number;
}

export interface DraftForm {
  category: Category;
  isAnonymous: boolean;
  authorName: string;
  title: string;
  body: string;
}
