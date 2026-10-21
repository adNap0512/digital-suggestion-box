/** 画面表示用。矛盾データでも壊れないように匿名へ倒す */
export function formatAuthorLabel(input: {
  isAnonymous: boolean;
  authorName?: string;
}): string {
  if (input.isAnonymous) return '匿名';
  const name = input.authorName?.trim();
  return name ? name : '匿名';
}

/** フォーム入力から既存の DraftForm 識別フィールドを組み立てる */
export function toDraftIdentity(authorName: string): {
  isAnonymous: boolean;
  authorName: string;
} {
  const trimmed = authorName.trim();
  if (!trimmed) {
    return { isAnonymous: true, authorName: '' };
  }
  return { isAnonymous: false, authorName: trimmed };
}
