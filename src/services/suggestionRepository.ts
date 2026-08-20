import type { DraftForm, Suggestion } from '../utils/types';

/**
 * 投稿の永続化方式を隠す契約。
 * Promise にするのは、Goal B 以降の HTTP / 共通PF API を同じ境界で差し替えるため。
 */
export interface SuggestionRepository {
  list(): Promise<Suggestion[]>;
  create(draft: DraftForm): Promise<Suggestion>;
}
