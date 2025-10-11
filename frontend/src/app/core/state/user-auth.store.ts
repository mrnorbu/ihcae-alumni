import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../shared/models';

/**
 * Authentication state interface for the user auth store.
 */
export interface UserAuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

/**
 * Core authentication store service.
 * Manages global authentication state using RxJS BehaviorSubject.
 * Follows the service-based state management pattern as specified in the architecture.
 */
@Injectable({
  providedIn: 'root'
})
export class UserAuthStore {
  /**
   * Initial authentication state.
   */
  private readonly initialState: UserAuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false
  };

  /**
   * Private BehaviorSubject holding the current authentication state.
   */
  private readonly _state = new BehaviorSubject<UserAuthState>(this.initialState);

  /**
   * Public readonly Observable exposing the authentication state.
   * Components can subscribe to this to react to authentication changes.
   */
  public readonly state$: Observable<UserAuthState> = this._state.asObservable();

  /**
   * Gets the current authentication state synchronously.
   * @returns Current authentication state
   */
  public get currentState(): UserAuthState {
    return this._state.value;
  }

  /**
   * Gets the current user synchronously.
   * @returns Current user or null if not authenticated
   */
  public get currentUser(): User | null {
    return this._state.value.user;
  }

  /**
   * Gets the current authentication token synchronously.
   * @returns Current token or null if not authenticated
   */
  public get currentToken(): string | null {
    return this._state.value.token;
  }

  /**
   * Checks if the user is currently authenticated.
   * @returns True if authenticated, false otherwise
   */
  public get isAuthenticated(): boolean {
    return this._state.value.isAuthenticated;
  }

  /**
   * Sets the authentication state with user and token.
   * @param user The authenticated user
   * @param token The JWT authentication token
   */
  public setAuthState(user: User, token: string): void {
    const newState: UserAuthState = {
      isAuthenticated: true,
      user,
      token,
      isLoading: false
    };
    
    this._state.next(newState);
    
    // Store token in localStorage for persistence
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Clears the authentication state (logout).
   */
  public clearAuthState(): void {
    this._state.next(this.initialState);
    
    // Remove token and user data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  /**
   * Sets the loading state for authentication operations.
   * @param isLoading Whether authentication is in progress
   */
  public setLoading(isLoading: boolean): void {
    const currentState = this._state.value;
    this._state.next({
      ...currentState,
      isLoading
    });
  }

  /**
   * Initializes authentication state from localStorage.
   * Called during app startup to restore authentication state.
   */
  public initializeFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.setAuthState(user, token);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        this.clearAuthState();
      }
    }
  }

  /**
   * Updates the current user data.
   * @param user Updated user data
   */
  public updateUser(user: User): void {
    const currentState = this._state.value;
    if (currentState.isAuthenticated) {
      this._state.next({
        ...currentState,
        user
      });
      
      // Update localStorage
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  /**
   * Checks if the current user has a specific role.
   * @param role The role to check for
   * @returns True if user has the role, false otherwise
   */
  public hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.roles.includes(role) : false;
  }

  /**
   * Checks if the current user is an admin.
   * @returns True if user is an admin, false otherwise
   */
  public isAdmin(): boolean {
    return this.hasRole('Admin');
  }
}
