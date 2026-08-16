'use server';

// ============================================================
// SECURITY: Developer auth bypass permanently disabled.
// This previously allowed ANY email ending in @gizami.com (and a
// few hardcoded test accounts) to obtain a valid session with no
// password and no OTP -- a full backdoor, including into the admin
// account. It is now a no-op. Do NOT re-enable in production.
// ============================================================

export async function authBypass(
  _email: string,
  _type: 'magiclink' = 'magiclink',
  _metadata?: any
) {
  return { error: 'Authentication bypass is disabled.' };
}
