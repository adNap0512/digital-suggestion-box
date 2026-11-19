import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { verifyAdminCredentials } from './adminAuth';
import {
  authenticateSupabaseAdmin,
  restoreSupabaseAdmin,
  signOutSupabaseAdmin,
} from './supabaseAdminAuth';
import { getSupabaseClient } from '../services/supabaseClient';

type AdminAuthContextValue = {
  isAdmin: boolean;
  login: (adminId: string, password: string) => Promise<boolean>;
  loading: boolean;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(getSupabaseClient()));

  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    void restoreSupabaseAdmin()
      .then((ok) => {
        if (active) {
          setIsAdmin(ok);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
      });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!session && active) {
        setIsAdmin(false);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (adminId: string, password: string) => {
    const ok = getSupabaseClient()
      ? await authenticateSupabaseAdmin(adminId, password)
      : verifyAdminCredentials(adminId, password);
    setIsAdmin(ok);
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    void signOutSupabaseAdmin();
  }, []);

  const value = useMemo(
    () => ({ isAdmin, loading, login, logout }),
    [isAdmin, loading, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth は AdminAuthProvider 内で使ってください');
  }
  return context;
}
