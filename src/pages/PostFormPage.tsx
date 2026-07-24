import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { useSuggestions } from '../context/SuggestionsContext';
import type { Category, DraftForm } from '../utils/types';

const DRAFT_KEY = 'suggestion-box-draft';

const defaultDraft: DraftForm = {
  category: '業務改善',
  isAnonymous: true,
  authorName: '',
  title: '',
  body: '',
};

export function PostFormPage() {
  const navigate = useNavigate();
  const { addSuggestion } = useSuggestions();
  const [draft, setDraft] = useState<DraftForm>(defaultDraft);
  const [savedMessage, setSavedMessage] = useState('');

  const update = (partial: Partial<DraftForm>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSavedMessage('');
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setSavedMessage('下書きを保存しました');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;
    addSuggestion(draft);
    localStorage.removeItem(DRAFT_KEY);
    navigate('/list');
  };

  return (
    <div className="form-page" data-testid="post-form-page">
      <h1 className="page-title">投稿する</h1>
      <p className="page-description">
        あなたの声が、職場を少しずつ良くします。匿名でも安心して投稿できます。
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">カテゴリ</label>
          <select
            id="category"
            data-testid="input-category"
            value={draft.category}
            onChange={(e) => update({ category: e.target.value as Category })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <span>投稿方法</span>
          <div className="radio-group" role="radiogroup" aria-label="匿名または記名">
            <label
              className={`radio-card ${draft.isAnonymous ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="anonymous"
                data-testid="input-anonymous"
                checked={draft.isAnonymous}
                onChange={() => update({ isAnonymous: true })}
              />
              匿名で投稿
            </label>
            <label
              className={`radio-card ${!draft.isAnonymous ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="anonymous"
                data-testid="input-named"
                checked={!draft.isAnonymous}
                onChange={() => update({ isAnonymous: false })}
              />
              記名で投稿
            </label>
          </div>
        </div>

        {!draft.isAnonymous && (
          <div className="form-group">
            <label htmlFor="authorName">お名前</label>
            <input
              id="authorName"
              data-testid="input-author"
              value={draft.authorName}
              onChange={(e) => update({ authorName: e.target.value })}
              placeholder="例: 田中"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            data-testid="input-title"
            value={draft.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="一言で内容をまとめてください"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">本文</label>
          <textarea
            id="body"
            data-testid="input-body"
            value={draft.body}
            onChange={(e) => update({ body: e.target.value })}
            placeholder="困りごとや改善アイデアを自由に書いてください"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment">添付（任意）</label>
          <input id="attachment" type="file" data-testid="input-attachment" />
        </div>

        <div className="form-notice">
          投稿内容は社内改善のために活用されます。個人を特定する情報の記載はお控えください。
          匿名投稿の場合、投稿者名は表示されません。
        </div>

        {savedMessage && <p data-testid="draft-saved">{savedMessage}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            data-testid="btn-save-draft"
            onClick={handleSaveDraft}
          >
            下書き保存
          </button>
          <button type="submit" className="btn btn-primary" data-testid="btn-submit">
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
