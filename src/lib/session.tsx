import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Las cuentas de ciprianos usan su CÓDIGO ULIMA como usuario (correo interno, nunca se envían correos). */
export const MEMBER_DOMAIN = 'ciprianos.cipro.invalid';
export const codeToEmail = (ucode: string) => `${ucode.replace(/\D/g, '')}@${MEMBER_DOMAIN}`;
export const isMemberEmail = (email?: string | null) => !!email?.endsWith('@' + MEMBER_DOMAIN);

const Ctx = createContext<{ session: Session | null; ready: boolean }>({ session: null, ready: false });
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ session, ready }}>{children}</Ctx.Provider>;
}
export const useSession = () => useContext(Ctx);

export async function callMemberAccount(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('member-account', { body });
  if (error) return { ok: false, error: 'No se pudo conectar con el servidor.' } as { ok: boolean; error?: string };
  return data as { ok: boolean; error?: string };
}
