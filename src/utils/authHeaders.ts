const ADMIN_TOKEN_KEY = 'goinfoev_admin_token';
const USER_TOKEN_KEY = 'goinfoev_user_token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem('pakev_admin_auth');
  } catch {
    // ignore
  }
}

export function getAdminAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAdminToken();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}

export function getUserToken(): string | null {
  try {
    return localStorage.getItem(USER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setUserToken(token: string) {
  try {
    localStorage.setItem(USER_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearUserToken() {
  try {
    localStorage.removeItem(USER_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getUserAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getUserToken();
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : { ...extra };
}
