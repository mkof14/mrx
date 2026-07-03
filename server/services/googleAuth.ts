const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export function isGoogleAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}

export async function verifyGoogleCredential(credential: string): Promise<{
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google sign-in is not configured');
  }

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!res.ok) {
    throw new Error('Invalid Google credential');
  }

  const payload = (await res.json()) as Record<string, string>;

  if (payload.aud !== GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }

  if (payload.email_verified !== 'true') {
    throw new Error('Google email is not verified');
  }

  if (!payload.email || !payload.sub) {
    throw new Error('Incomplete Google profile');
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    email_verified: true,
    name: payload.name,
    picture: payload.picture
  };
}
