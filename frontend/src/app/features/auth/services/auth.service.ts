import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RegisterResponse, 
  User 
} from '../../../shared/models';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Authentication service for handling login, registration, and user management.
 * Communicates with the backend API for authentication operations.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  /**
   * Base URL for authentication API endpoints.
   */
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;

  /**
   * Injected dependencies using Angular 20 inject() function.
   */
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(UserAuthStore);
  private readonly notificationService = inject(NotificationService);

  /**
   * Logs in a user with email and password.
   * @param credentials The login credentials
   * @returns Observable of the authentication response
   */
  public login(credentials: LoginRequest): Observable<AuthResponse> {
    this.authStore.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap({
        next: (response) => {
          if (response.success && response.token && response.user) {
            // Update authentication state
            this.authStore.setAuthState(response.user, response.token);
          }
          this.authStore.setLoading(false);
        },
        error: (error) => {
          this.authStore.setLoading(false);
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Registers a new user.
   * @param userData The registration data
   * @returns Observable of the registration response
   */
  public register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.authStore.setLoading(true);
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap({
        next: (response) => {
          this.authStore.setLoading(false);
        },
        error: (error) => {
          this.authStore.setLoading(false);
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Refreshes the authentication token.
   * @returns Observable of the authentication response
   */
  public refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap({
        next: (response) => {
          if (response.success && response.token && response.user) {
            // Update authentication state with new token
            this.authStore.setAuthState(response.user, response.token);
          }
        },
        error: (error) => {
          // If refresh fails, clear auth state and redirect to login
          this.authStore.clearAuthState();
          this.notificationService.showError('Session Expired', 'Please log in again');
        }
      })
    );
  }

  /**
   * Logs out the current user.
   * @returns Observable of the logout response
   */
  public logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => {
          // Clear authentication state
          this.authStore.clearAuthState();
          this.notificationService.showInfo('Logged Out', 'You have been logged out successfully');
        },
        error: (error) => {
          // Even if logout fails on server, clear local state
          this.authStore.clearAuthState();
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Gets the current user's profile information.
   * @returns Observable of the user data
   */
  public getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /**
   * Updates the current user's profile.
   * @param userData The updated user data
   * @returns Observable of the updated user data
   */
  public updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap({
        next: (updatedUser) => {
          // Update the user in the auth store
          this.authStore.updateUser(updatedUser);
          this.notificationService.showSuccessMessage('Profile Update');
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Changes the user's password.
   * @param currentPassword The current password
   * @param newPassword The new password
   * @returns Observable of the response
   */
  public changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccessMessage('Password Change');
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Requests a password reset email.
   * @param email The user's email address
   * @returns Observable of the response
   */
  public requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/passwordreset/forgot-password`, { email }).pipe(
      tap({
        next: () => {
          this.notificationService.showInfo(
            'Password Reset', 
            'If an account with that email exists, you will receive a password reset link.'
          );
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Resets the password using a reset token.
   * @param token The reset token
   * @param newPassword The new password
   * @returns Observable of the response
   */
  public resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/passwordreset/reset-password`, {
      token,
      newPassword
    }).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccessMessage('Password Reset');
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Verifies the user's email address.
   * @param token The verification token
   * @returns Observable of the response
   */
  public verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token }).pipe(
      tap({
        next: () => {
          this.notificationService.showSuccessMessage('Email Verification');
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }

  /**
   * Resends the email verification.
   * @returns Observable of the response
   */
  public resendVerificationEmail(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, {}).pipe(
      tap({
        next: () => {
          this.notificationService.showInfo(
            'Verification Email Sent', 
            'Please check your email for the verification link.'
          );
        },
        error: (error) => {
          this.notificationService.showApiError(error);
        }
      })
    );
  }
}