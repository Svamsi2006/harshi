export interface RazorpayPublicConfig {
  configured: boolean;
  keyId: string;
  mode: 'live' | 'test' | 'unconfigured';
}

export interface RazorpaySuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: Record<string, unknown>) => void) => void;
    };
  }
}

let razorpayScriptPromise: Promise<boolean> | null = null;

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function fetchRazorpayPublicConfig(): Promise<RazorpayPublicConfig> {
  try {
    const res = await fetch('/api/razorpay/config', {
      headers: { Accept: 'application/json' },
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      return {
        configured: Boolean(data?.configured),
        keyId: typeof data?.keyId === 'string' ? data.keyId : '',
        mode:
          data?.mode === 'live' || data?.mode === 'test' ? data.mode : 'unconfigured',
      };
    }
  } catch {
    // ignore
  }
  return { configured: false, keyId: '', mode: 'unconfigured' };
}

export async function openRazorpayLiveCheckout(params: {
  amountInr: number;
  storeName: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  receipt?: string;
}): Promise<{
  ok: boolean;
  paymentId?: string;
  orderId?: string;
  cancelled?: boolean;
  error?: string;
}> {
  const scriptReady = await loadRazorpayCheckoutScript();
  if (!scriptReady || !window.Razorpay) {
    return {
      ok: false,
      error: 'Could not load Razorpay Checkout script. Please check your internet connection.',
    };
  }

  // Step 1: Create signed Razorpay order on server
  let createJson: Record<string, any> = {};
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountInr: params.amountInr,
        receipt: params.receipt,
        notes: {
          customerName: params.customerName,
          customerEmail: params.customerEmail,
        },
      }),
    });
    createJson = await res.json().catch(() => ({}));
    if (!res.ok || !createJson?.ok || !createJson?.orderId || !createJson?.keyId) {
      return {
        ok: false,
        error:
          typeof createJson?.error === 'string'
            ? createJson.error
            : 'Failed to initialize Razorpay payment order.',
      };
    }
  } catch {
    return { ok: false, error: 'Unable to reach Razorpay order server.' };
  }

  // Step 2: Open official Razorpay Checkout modal & verify signature server-side
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: createJson.keyId,
      amount: createJson.amount,
      currency: createJson.currency || 'INR',
      name: params.storeName || 'varniks_atelier',
      description: params.description,
      order_id: createJson.orderId,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone,
      },
      theme: {
        color: '#6D1836',
      },
      modal: {
        ondismiss: () => {
          resolve({
            ok: false,
            cancelled: true,
            error: 'Razorpay payment window was closed before completion.',
          });
        },
      },
      handler: async (response: RazorpaySuccessPayload) => {
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyJson = await verifyRes.json().catch(() => ({}));
          if (!verifyRes.ok || !verifyJson?.verified) {
            resolve({
              ok: false,
              error:
                typeof verifyJson?.error === 'string'
                  ? verifyJson.error
                  : 'Razorpay payment signature verification failed.',
            });
            return;
          }
          resolve({
            ok: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          });
        } catch {
          resolve({
            ok: false,
            error: 'Could not verify payment with the studio server.',
          });
        }
      },
    });

    rzp.on('payment.failed', (failure: Record<string, unknown>) => {
      const errObj = failure?.error as { description?: string } | undefined;
      resolve({
        ok: false,
        error: errObj?.description || 'Payment failed in Razorpay. Please try again.',
      });
    });

    rzp.open();
  });
}
