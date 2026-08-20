import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPersistentSuggestionRepository } from '../services/persistentSuggestionRepository';
import type { SuggestionRepository } from '../services/suggestionRepository';
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

interface SuggestionsProviderProps {
  children: ReactNode;
  /** 省略時は Goal B の Persistent（Web Storage）。特定 DB 製品には依存しない */
  repository?: SuggestionRepository;
}

export function SuggestionsProvider({
  children,
  repository,
}: SuggestionsProviderProps) {
  const fallbackRepoRef = useRef<SuggestionRepository | null>(null);
  if (fallbackRepoRef.current === null) {
    fallbackRepoRef.current = createPersistentSuggestionRepository();
  }
  const repo = repository ?? fallbackRepoRef.current;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // in-flight の list が、後続の create 結果を古いスナップショットで上書きしないため
  const loadGenerationRef = useRef(0);

  useEffect(() => {
    const generation = ++loadGenerationRef.current;
    void repo.list().then((items) => {
      if (generation !== loadGenerationRef.current) return;
      setSuggestions(items);
    });
  }, [repo]);

  const addSuggestion = useCallback(
    (draft: DraftForm) => {
      const generation = ++loadGenerationRef.current;
      void repo.create(draft).then((created) => {
        if (generation !== loadGenerationRef.current) return;
        setSuggestions((prev) => [created, ...prev]);
      });
    },
    [repo],
  );

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
