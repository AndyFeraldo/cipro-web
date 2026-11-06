import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

type Settings = Record<string, string>;
const Ctx = createContext<{ settings: Settings; reload: () => void }>({ settings: {}, reload: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({});
  const reload = () => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const s: Settings = {};
      data?.forEach((r) => (s[r.key] = r.value ?? ''));
      setSettings(s);
    });
  };
  useEffect(reload, []);
  return <Ctx.Provider value={{ settings, reload }}>{children}</Ctx.Provider>;
}
export const useSettings = () => useContext(Ctx);
