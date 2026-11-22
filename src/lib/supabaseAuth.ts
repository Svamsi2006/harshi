import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';

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

function buildLoginRedirectUrl(redirectPath = '/account'): string {
  const safeRedirect = sanitizeRedirectPath(redirectPath, '/account');
  try {
    sessionStorage.setItem('varniks_post_auth_redirect', safeRedirect);
  } catch {
    // ignore
  }
  return `${window.location.origin}/login?redirect=${encodeURIComponent(safeRedirect)}`;
}

export async function startSupabaseGoogleSignIn(
  redirectPath = '/account'
): Promise<{ ok: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return {
      ok: false,
      error: 'Google Sign-In is temporarily unavailable. Please try again shortly.',
    };
  }

  const redirectTo = buildLoginRedirectUrl(redirectPath);
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

export async function signUpWithSupabaseEmail(params: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  redirectPath?: string;
}): Promise<{
  ok: boolean;
  configured: boolean;
  needsVerification?: boolean;
  session?: Session | null;
  user?: User | null;
  error?: string;
}> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, configured: false, error: 'Supabase Auth is not configured.' };
  }

  const email = params.email.trim().toLowerCase();
  const redirectTo = buildLoginRedirectUrl(params.redirectPath || '/account');

  const { data, error } = await client.auth.signUp({
    email,
    password: params.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: params.fullName.trim(),
        phone: params.phone.trim(),
      },
    },
  });

  if (error) {
    const msg = error.message || 'Could not create account.';
    if (/already registered|already exists/i.test(msg)) {
      return {
        ok: false,
        configured: true,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }
    return { ok: false, configured: true, error: msg };
  }

  // Supabase returns an empty identities array when email already exists with confirmation enabled
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      ok: false,
      configured: true,
      error: 'An account with this email already exists. Please sign in or reset your password.',
    };
  }

  if (data.session) {
    return {
      ok: true,
      configured: true,
      needsVerification: false,
      session: data.session,
      user: data.user,
    };
  }

  return {
    ok: true,
    configured: true,
    needsVerification: true,
    session: null,
    user: data.user,
  };
}

export async function signInWithSupabasePassword(params: {
  email: string;
  password: string;
}): Promise<{
  ok: boolean;
  configured: boolean;
  needsVerification?: boolean;
  session?: Session | null;
  user?: User | null;
  error?: string;
}> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, configured: false, error: 'Supabase Auth is not configured.' };
  }

  const email = params.email.trim().toLowerCase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: params.password,
  });

  if (error) {
    const msg = error.message || 'Invalid email or password.';
    if (/email not confirmed|not confirmed/i.test(msg)) {
      return {
        ok: false,
        configured: true,
        needsVerification: true,
        error:
          'Your email address is not verified yet. Enter the OTP code or click the verification link sent to your inbox.',
      };
    }
    if (/invalid login credentials/i.test(msg)) {
      return {
        ok: false,
        configured: true,
        error: 'Incorrect email or password. If you signed up with Google, use Continue with Google.',
      };
    }
    return { ok: false, configured: true, error: msg };
  }

  return {
    ok: true,
    configured: true,
    session: data.session,
    user: data.user,
  };
}

export async function sendSupabaseLoginOtp(params: {
  email: string;
  redirectPath?: string;
}): Promise<{ ok: boolean; configured: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, configured: false, error: 'Supabase Auth is not configured.' };
  }

  const email = params.email.trim().toLowerCase();
  const redirectTo = buildLoginRedirectUrl(params.redirectPath || '/account');

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    if (/signups not allowed|user not found/i.test(error.message || '')) {
      return {
        ok: false,
        configured: true,
        error: 'No account found with this email. Please create an account first.',
      };
    }
    return { ok: false, configured: true, error: error.message || 'Could not send login OTP.' };
  }

  return { ok: true, configured: true };
}

export async function verifySupabaseEmailOtp(params: {
  email: string;
  token: string;
  mode: 'signup' | 'login';
}): Promise<{
  ok: boolean;
  session?: Session | null;
  user?: User | null;
  error?: string;
}> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase Auth is not configured.' };
  }

  const email = params.email.trim().toLowerCase();
  const token = params.token.trim();
  const primaryType = params.mode === 'signup' ? 'signup' : 'email';
  const fallbackType = params.mode === 'signup' ? 'email' : 'magiclink';

  const first = await client.auth.verifyOtp({
    email,
    token,
    type: primaryType,
  });

  if (!first.error && first.data.session) {
    return { ok: true, session: first.data.session, user: first.data.user };
  }

  // Fallback for templates configured as email/magiclink OTP
  const second = await client.auth.verifyOtp({
    email,
    token,
    type: fallbackType,
  });

  if (!second.error && second.data.session) {
    return { ok: true, session: second.data.session, user: second.data.user };
  }

  return {
    ok: false,
    error:
      first.error?.message ||
      second.error?.message ||
      'Invalid or expired verification code. Please check your email or resend a new one.',
  };
}

export async function resendSupabaseVerificationEmail(params: {
  email: string;
  redirectPath?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase Auth is not configured.' };
  }

  const email = params.email.trim().toLowerCase();
  const redirectTo = buildLoginRedirectUrl(params.redirectPath || '/account');

  const { error } = await client.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    return { ok: false, error: error.message || 'Could not resend verification email.' };
  }
  return { ok: true };
}

export async function sendSupabasePasswordReset(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase Auth is not configured.' };
  }

  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/forgot-password?mode=update`,
  });

  if (error) {
    return { ok: false, error: error.message || 'Could not send password reset email.' };
  }
  return { ok: true };
}

export async function updateSupabasePassword(
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const client = await getBrowserSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase Auth is not configured.' };
  }

  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) {
    return { ok: false, error: error.message || 'Could not update password.' };
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
  const client = cachedClient ?? (await getBrowserSupabaseClient());
  if (!client) return;
  try {
    await client.auth.signOut();
  } catch {
    // ignore
  }
}
