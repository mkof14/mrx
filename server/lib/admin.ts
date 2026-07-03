const SUPER_ADMIN_EMAILS = ['dnainform@gmail.com'];

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(normalized)) return true;
  const raw = process.env.ADMIN_EMAILS || '';
  const admins = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(normalized);
}

export function maskSecret(value: string | undefined, visible = 4): string | null {
  if (!value) return null;
  if (value.length <= visible) return '••••';
  return `${value.slice(0, visible)}…${value.slice(-2)}`;
}
