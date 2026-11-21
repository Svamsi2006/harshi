import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

interface PublicAuthConfig {
  url: string;
  anonKey: string;
  googleAuthEnabled: boolean;
}

let cachedConfig: PublicAuthConfig | null = null;
let cachedClient: SupabaseClient | null = null;

function readEnvPublicConfig(): PublicAuthConfig {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
  return {
    url,
    anonKey,
    googleAuthEnabled: Boolean(url && anonKey),
  };
}

export async function getPublicAuthConfig(): Promise<PublicAuthConfig> {
  if (cachedConfig) return cachedConfig;

  const envCfg = readEnvPublicConfig();
  if (envCfg.googleAuthEnabled) {
    cachedConfig = envCfg;
    return envCfg;
  }

  try {
    const res = await fetch('/api/auth/config', {
      headers: { Accept: 'application/json' },
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const json = (await res.json()) as Partial<PublicAuthConfig>;
      const url = typeof json.url === 'string' ? json.url.trim() : '';
      const anonKey = typeof json.anonKey === 'string' ? json.anonKey.trim() : '';
      const cfg: PublicAuthConfig = {
        url,
        anonKey,
        googleAuthEnabled: Boolean(url && anonKey),
      };
      cachedConfig = cfg;
      return cfg;
    }
  } catch {
    // ignore
  }

  cachedConfig = envCfg;
  return envCfg;
}

export async function getBrowserSupabaseClient(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;
  const cfg = await getPublicAuthConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  cachedClient = createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return cachedClient;
}

export function sanitizeRedirectPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  return trimmed;
}

export async function startSupabaseGoogleSignIn(
  redirectPath = '/account'
): Promise<{ ok: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error:
        'Google Sign-In needs SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) added to your environment variables, and Google enabled under Supabase → Authentication → Providers.',
    };
  }

  const safeRedirect = sanitizeRedirectPath(redirectPath, '/account');
  try {
    sessionStorage.setItem('varniks_post_auth_redirect', safeRedirect);
  } catch {
    // ignore
  }

  const redirectTo = `${window.location.origin}/login?redirect=${encodeURIComponent(safeRedirect)}`;
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message || 'Could not start Google sign-in.' };
  }
  return { ok: true };
}

export async function getActiveSupabaseSession(): Promise<Session | null> {
  const client = await getBrowserSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session ?? null;
}

export async function signOutBrowserSupabase(): Promise<void> {
  if (!cachedClient) return;
  try {
    await cachedClient.auth.signOut();
  } catch {
    // ignore
  }
}
