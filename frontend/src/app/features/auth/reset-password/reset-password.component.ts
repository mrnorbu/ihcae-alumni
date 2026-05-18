import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Lock, CheckCircle, ArrowRight, Key, AlertCircle } from 'lucide-angular';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Reset Password Component
 * 
 * Modern split-screen design for password reset completion.
 * Features:
 * - Split-screen layout with brand gradient
 * - Lucide icons
 * - Password strength validation
 * - Success state with redirect
 * 
 * @author IHCAE Development Team
 * @version 2.0.0
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Brand Section -->
      <div class="hidden lg:flex lg:w-2/5 bg-gradient-brand relative overflow-hidden">
        <div class="absolute inset-0 bg-black bg-opacity-10"></div>
        <div class="relative z-10 flex flex-col justify-center p-12 text-white">
          <!-- Logo & Brand -->
          <div>
            <div class="flex items-center gap-3 mb-8">
              <img src="images/logo.png" alt="IHCAE Logo" class="h-12 w-auto">
              <div>
                <h1 class="text-xl font-bold">IHCAE Alumni</h1>
                <p class="text-sm text-white/80">Sikkim, India</p>
              </div>
            </div>
            <h2 class="text-3xl font-display font-bold mb-4">
              Create New Password
            </h2>
            <p class="text-lg text-white/90 leading-relaxed">
              Choose a strong password to keep your account secure.
            </p>
          </div>
    
          <!-- Password Requirements -->
          <div class="mt-12 space-y-3">
            <p class="text-sm font-semibold mb-3">Password must contain:</p>
            <div class="flex items-start gap-3">
              <lucide-icon [img]="checkIcon" [size]="16" class="text-white/80 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-sm text-white/80">At least 8 characters</p>
            </div>
            <div class="flex items-start gap-3">
              <lucide-icon [img]="checkIcon" [size]="16" class="text-white/80 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-sm text-white/80">Mix of letters and numbers</p>
            </div>
            <div class="flex items-start gap-3">
              <lucide-icon [img]="checkIcon" [size]="16" class="text-white/80 flex-shrink-0 mt-0.5"></lucide-icon>
              <p class="text-sm text-white/80">Not easily guessable</p>
            </div>
          </div>
    
          <!-- Footer -->
          <div class="mt-auto text-sm text-white/70">
            © 2024 IHCAE Sikkim. All rights reserved.
          </div>
        </div>
      </div>
    
      <!-- Right Side - Form -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8">
            <img src="images/logo.png" alt="IHCAE Logo" class="h-16 w-auto mx-auto mb-3">
            <h1 class="text-2xl font-bold text-neutral-900">IHCAE Alumni</h1>
          </div>
    
          <!-- Invalid/Expired Token State -->
          @if (isTokenInvalid()) {
            <div class="space-y-6">
              <div class="text-center mb-6">
                <div class="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <lucide-icon [img]="alertIcon" [size]="32" class="text-error-600"></lucide-icon>
                </div>
                <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                  Invalid or Expired Link
                </h2>
                <p class="text-sm text-neutral-600">
                  This password reset link is invalid or has expired.
                </p>
              </div>
              <div class="card">
                <p class="text-sm text-neutral-600 mb-4">
                  Password reset links expire after 1 hour for security reasons. Please request a new password reset link.
                </p>
                <a routerLink="/forgot-password" class="btn-primary w-full flex items-center justify-center gap-2">
                  <span>Request New Link</span>
                  <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                </a>
              </div>
              <div class="text-center">
                <a routerLink="/login" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Back to sign in
                </a>
              </div>
            </div>
          }
    
          <!-- Success State -->
          @if (isPasswordReset()) {
            <div class="space-y-6">
              <div class="text-center mb-6">
                <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <lucide-icon [img]="checkIcon" [size]="32" class="text-success-600"></lucide-icon>
                </div>
                <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                  Password Reset Successful!
                </h2>
                <p class="text-sm text-neutral-600">
                  Your password has been updated successfully
                </p>
              </div>
              <div class="card">
                <p class="text-sm text-neutral-600 mb-4">
                  You can now sign in with your new password. You'll be redirected to the login page in <strong>{{countdown()}}</strong> seconds.
                </p>
                <button (click)="goToLogin()" class="btn-primary w-full flex items-center justify-center gap-2">
                  <span>Sign In Now</span>
                  <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                </button>
              </div>
            </div>
          }
    
          <!-- Form State -->
          @if (!isTokenInvalid() && !isPasswordReset()) {
            <div>
              <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
                <div class="mb-6">
                  <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <lucide-icon [img]="keyIcon" [size]="24" class="text-primary-600"></lucide-icon>
                  </div>
                  <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                    Reset Password
                  </h2>
                  <p class="text-sm text-neutral-600">
                    Enter your new password below
                  </p>
                </div>
                <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
                  <!-- Password Field -->
                  <div class="form-group">
                    <label for="password" class="input-label">
                      <div class="flex items-center gap-1.5">
                        <lucide-icon [img]="lockIcon" [size]="14" class="text-neutral-500"></lucide-icon>
                        <span>New Password</span>
                      </div>
                    </label>
                    <input
                      id="password"
                      type="password"
                      formControlName="password"
                      class="input-field-lg"
                      [class.input-error]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
                      placeholder="Enter new password (min. 8 characters)"
                      />
                    @if (resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched) {
                      <div class="form-error">
                        @if (resetPasswordForm.get('password')?.errors?.['required']) {
                          <p>Password is required</p>
                        }
                        @if (resetPasswordForm.get('password')?.errors?.['minlength']) {
                          <p>Password must be at least 8 characters</p>
                        }
                      </div>
                    }
                  </div>
                  <!-- Confirm Password Field -->
                  <div class="form-group">
                    <label for="confirmPassword" class="input-label">
                      <div class="flex items-center gap-1.5">
                        <lucide-icon [img]="checkIcon" [size]="14" class="text-neutral-500"></lucide-icon>
                        <span>Confirm Password</span>
                      </div>
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      formControlName="confirmPassword"
                      class="input-field-lg"
                      [class.input-error]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
                      placeholder="Confirm your password"
                      />
                    @if (resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched) {
                      <div class="form-error">
                        @if (resetPasswordForm.get('confirmPassword')?.errors?.['required']) {
                          <p>Please confirm your password</p>
                        }
                        @if (resetPasswordForm.get('confirmPassword')?.errors?.['mismatch']) {
                          <p>Passwords do not match</p>
                        }
                      </div>
                    }
                  </div>
                  <!-- Submit Button -->
                  <button
                    type="submit"
                    [disabled]="resetPasswordForm.invalid || isLoading()"
                    class="btn-primary btn-lg w-full flex items-center justify-center gap-2"
                    >
                    @if (isLoading()) {
                      <span>
                        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    }
                    <span>{{ isLoading() ? 'Resetting Password...' : 'Reset Password' }}</span>
                    @if (!isLoading()) {
                      <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                    }
                  </button>
                </form>
              </div>
              <!-- Back to Login Link -->
              <div class="mt-6 text-center">
                <a routerLink="/login" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Back to sign in
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  // Lucide icons
  readonly lockIcon = Lock;
  readonly checkIcon = CheckCircle;
  readonly arrowIcon = ArrowRight;
  readonly keyIcon = Key;
  readonly alertIcon = AlertCircle;

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  isTokenInvalid = signal(false);
  isPasswordReset = signal(false);
  countdown = signal(5);
  token = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.isTokenInvalid.set(true);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      try {
        const response = await this.http.post<ResetPasswordResponse>(
          `${environment.apiUrl}/api/v1/passwordreset/reset-password`,
          {
            token: this.token,
            newPassword: this.resetPasswordForm.value.password
          }
        ).toPromise();

        if (response?.success) {
          this.isPasswordReset.set(true);
          this.notificationService.showSuccess('Success', 'Your password has been reset successfully');
          this.startCountdown();
        } else {
          this.notificationService.showError('Reset Failed', response?.message || 'Failed to reset password');
        }
      } catch (error: any) {
        console.error('Reset password error:', error);
        if (error.status === 400 || error.status === 404) {
          this.isTokenInvalid.set(true);
        }
        this.notificationService.showError('Reset Failed', 'An error occurred. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      const current = this.countdown();
      if (current > 1) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(interval);
        this.goToLogin();
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
