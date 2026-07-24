import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockSuggestions } from '../data/mockSuggestions';
import type { DraftForm, Status, Suggestion } from '../utils/types';
import {
  addResponse,
  incrementEmpathy,
  updateStatus,
  updateSuggestionById,
} from '../utils/suggestionActions';

interface SuggestionsContextValue {
  suggestions: Suggestion[];
  addSuggestion: (draft: DraftForm) => void;
  empathize: (id: string) => void;
  changeStatus: (id: string, status: Status) => void;
  submitResponse: (id: string, response: string) => void;
}

const SuggestionsContext = createContext<SuggestionsContextValue | null>(null);

export function SuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);

  const addSuggestion = useCallback((draft: DraftForm) => {
    const newItem: Suggestion = {
      id: String(Date.now()),
      title: draft.title,
      body: draft.body,
      category: draft.category,
      isAnonymous: draft.isAnonymous,
      authorName: draft.isAnonymous ? undefined : draft.authorName,
      status: '未確認',
      empathyCount: 0,
      hasResponse: false,
      createdAt: new Date().toISOString(),
      isMine: true,
    };
    setSuggestions((prev) => [newItem, ...prev]);
  }, []);

  const empathize = useCallback((id: string) => {
    setSuggestions((prev) =>
      updateSuggestionById(prev, id, incrementEmpathy),
    );
  }, []);

  const changeStatus = useCallback((id: string, status: Status) => {
    setSuggestions((prev) =>
      updateSuggestionById(prev, id, (s) => updateStatus(s, status)),
    );
  }, []);

  const submitResponse = useCallback((id: string, response: string) => {
    setSuggestions((prev) =>
      updateSuggestionById(prev, id, (s) => addResponse(s, response)),
    );
  }, []);

  const value = useMemo(
    () => ({
      suggestions,
      addSuggestion,
      empathize,
      changeStatus,
      submitResponse,
    }),
    [suggestions, addSuggestion, empathize, changeStatus, submitResponse],
  );

  return (
    <SuggestionsContext.Provider value={value}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  const ctx = useContext(SuggestionsContext);
  if (!ctx) {
    throw new Error('useSuggestions must be used within SuggestionsProvider');
  }
  return ctx;
}
