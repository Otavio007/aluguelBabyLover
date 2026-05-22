import { Platform } from 'react-native';

const STORAGE_KEY = 'babylover_admin_rentals_last_seen_at';

export function getLastSeenRentalsAt(): string | null {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}

export function setLastSeenRentalsAt(iso: string = new Date().toISOString()): void {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, iso);
  }
}
