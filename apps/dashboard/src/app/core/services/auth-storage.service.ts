import { Injectable } from '@angular/core';
import { AuthPayload } from '@turbovetnx/data';

interface StoredSession {
  token: string;
  expiresAt: number;
  user: AuthPayload['user'];
}

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly storageKey = 'turbovet.session';

  save(payload: AuthPayload): void {
    if (!this.isBrowser()) {
      return;
    }
    const expiresAt = Date.now() + payload.expiresIn * 1000;
    const value: StoredSession = {
      token: payload.accessToken,
      expiresAt,
      user: payload.user,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(value));
  }

  load(): StoredSession | null {
    if (!this.isBrowser()) {
      return null;
    }
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed.expiresAt < Date.now()) {
        this.clear();
        return null;
      }
      return parsed;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
