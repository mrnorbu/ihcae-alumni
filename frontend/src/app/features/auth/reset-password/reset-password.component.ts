import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Lock, CheckCircle, ArrowRight, Key, AlertCircle } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Reset Password Component
 * 
 * Modern split-screen design for password reset completion.
 * Standardized to match the main login and setup screens.
 * 
 * @author IHCAE Development Team
 * @version 2.0.0
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LucideAngularModule, HeaderComponent],
  template: `
    <div class="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <app-header></app-header>

      <div class="flex-1 flex pt-16 overflow-hidden">
        <!-- Left Side - Flat Brand Panel -->
        <div class="hidden lg:flex lg:w-2/5 bg-slate-900 relative">
          <div class="flex flex-col justify-between p-10 text-white w-full h-full">
            <div>
              <div class="flex items-center gap-3 mb-10">
                <div class="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <img src="images/logo.png" alt="IHCAE" class="w-6 h-6 object-contain brightness-200">
                </div>
                <div>
                  <h1 class="text-lg font-bold">IHCAE Alumni</h1>
                  <p class="text-xs text-slate-400">Sikkim, India</p>
                </div>
              </div>
              @if (isSetupMode()) {
                <h2 class="text-2xl font-bold mb-3 leading-tight">
                  Welcome to IHCAE<br/>Alumni Network
                </h2>
                <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Your account has been created by the IHCAE admin team. Set your password below to claim your account and access the network.
                </p>
              } @else {
                <h2 class="text-2xl font-bold mb-3 leading-tight">
                  Create New Password
                </h2>
                <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Choose a strong password to keep your account secure and private.
                </p>
              }
            </div>

            <!-- Sleek requirements list using the rounded card icon blocks -->
            <div class="space-y-3">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Password requirements:</p>
              
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="lockIcon" [size]="16" class="text-green-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">At least 8 characters</p>
                  <p class="text-xs text-slate-400">Length requirement</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="checkIcon" [size]="16" class="text-blue-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Mix of letters & numbers</p>
                  <p class="text-xs text-slate-400">Complexity requirement</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="keyIcon" [size]="16" class="text-red-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Not easily guessable</p>
                  <p class="text-xs text-slate-400">Security requirement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Form -->
        <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto bg-neutral-50">
          <div class="w-full max-w-md">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-8">
              <div class="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center mx-auto mb-3">
                <img src="images/logo.png" alt="IHCAE" class="w-7 h-7 object-contain brightness-200">
              </div>
              <h1 class="text-xl font-bold text-neutral-900">IHCAE Alumni</h1>
            </div>

            <!-- Invalid/Expired Token State -->
            @if (isTokenInvalid()) {
              <div>
                <!-- Icon + heading -->
                <div class="text-center mb-8">
                  <div class="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <lucide-icon [img]="alertIcon" [size]="24" class="text-red-500"></lucide-icon>
                  </div>
                  <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                    {{ isSetupMode() ? 'Setup Link Expired' : 'Link Invalid or Expired' }}
                  </h2>
                  <p class="text-sm text-neutral-500 leading-relaxed">
                    {{ isSetupMode()
                      ? 'This account setup link has already been used or has expired.'
                      : 'This password reset link is no longer valid.' }}
                  </p>
                </div>

                <!-- Info box -->
                <div class="bg-white border border-neutral-200 rounded-xl p-5 mb-5">
                  @if (isSetupMode()) {
                    <div class="flex gap-3">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                        <lucide-icon [img]="alertIcon" [size]="14" class="text-amber-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-neutral-800 mb-1">What happened?</p>
                        <p class="text-sm text-neutral-500 leading-relaxed">
                          Setup links are single-use and expire after 7 days. If you've already set your password, you can sign in below. Otherwise, contact the IHCAE admin team and ask them to resend your invitation.
                        </p>
                      </div>
                    </div>
                  } @else {
                    <div class="flex gap-3">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                        <lucide-icon [img]="alertIcon" [size]="14" class="text-amber-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-neutral-800 mb-1">What happened?</p>
                        <p class="text-sm text-neutral-500 leading-relaxed">
                          Password reset links expire after 1 hour for security reasons. Request a new link and check your inbox.
                        </p>
                      </div>
                    </div>
                  }
                </div>

                <!-- Primary action -->
                @if (isSetupMode()) {
                  <a routerLink="/login"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
                    <span>Go to Sign In</span>
                    <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                  </a>
                } @else {
                  <a routerLink="/forgot-password"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
                    <span>Request New Link</span>
                    <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                  </a>
                  <div class="text-center mt-4">
                    <a routerLink="/login" class="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                      Back to sign in
                    </a>
                  </div>
                }
              </div>
            }

            <!-- Success State -->
            @if (isPasswordReset()) {
              <div class="space-y-6">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <lucide-icon [img]="checkIcon" [size]="32" class="text-green-600"></lucide-icon>
                  </div>
                  <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                    {{ isSetupMode() ? 'Account Activated!' : 'Password Reset Successful!' }}
                  </h2>
                  <p class="text-sm text-neutral-600">
                    {{ isSetupMode() ? 'Your password has been set. You can now sign in to the alumni network.' : 'Your password has been updated successfully.' }}
                  </p>
                </div>
                <div class="bg-white border border-neutral-200 rounded-xl p-5">
                  <p class="text-sm text-neutral-600 mb-4">
                    You'll be redirected to the login page in <strong>{{countdown()}}</strong> seconds.
                  </p>
                  <button (click)="goToLogin()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                    <span>Sign In Now</span>
                    <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                  </button>
                </div>
              </div>
            }

            <!-- Form State -->
            @if (!isTokenInvalid() && !isPasswordReset()) {
              <div>
                <div class="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
                  <div class="mb-6">
                    <h2 class="text-xl font-bold text-neutral-900 mb-1">
                      {{ isSetupMode() ? 'Set Your Password' : 'Reset Password' }}
                    </h2>
                    <p class="text-xs text-neutral-500">
                      {{ isSetupMode() ? 'Create a password to activate your alumni account.' : 'Enter your new password below.' }}
                    </p>
                  </div>
                  <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <!-- Password Field -->
                    <div>
                      <label for="password" class="block text-xs font-medium text-neutral-700 mb-1.5">
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          New Password
                        </span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        formControlName="password"
                        class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-colors"
                        [class.border-red-300]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
                        placeholder="Enter new password (min. 8 characters)"
                        />
                      @if (resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched) {
                        <p class="mt-1 text-xs text-red-500 flex flex-col gap-0.5">
                          @if (resetPasswordForm.get('password')?.errors?.['required']) { <span>Password is required</span> }
                          @if (resetPasswordForm.get('password')?.errors?.['minlength']) { <span>Password must be at least 8 characters</span> }
                          @if (resetPasswordForm.get('password')?.errors?.['pattern']) { <span>Must contain uppercase, lowercase, number, and special character</span> }
                        </p>
                      }
                    </div>
                    <!-- Confirm Password Field -->
                    <div>
                      <label for="confirmPassword" class="block text-xs font-medium text-neutral-700 mb-1.5">
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="checkIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Confirm Password
                        </span>
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        formControlName="confirmPassword"
                        class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-colors"
                        [class.border-red-300]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
                        placeholder="Confirm your password"
                        />
                      @if (resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched) {
                        <p class="mt-1 text-xs text-red-500">
                          @if (resetPasswordForm.get('confirmPassword')?.errors?.['required']) { Please confirm your password }
                          @if (resetPasswordForm.get('confirmPassword')?.errors?.['mismatch']) { Passwords do not match }
                        </p>
                      }
                    </div>
                    <!-- Submit Button -->
                    <button
                      type="submit"
                      [disabled]="resetPasswordForm.invalid || isLoading()"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                      >
                      @if (isLoading()) {
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      }
                      <span>{{ isLoading() ? (isSetupMode() ? 'Setting Password...' : 'Resetting Password...') : (isSetupMode() ? 'Set Password & Continue' : 'Reset Password') }}</span>
                      @if (!isLoading()) {
                        <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
                      }
                    </button>
                  </form>
                </div>
                <!-- Back to Login Link -->
                <div class="mt-5 text-center">
                  <a routerLink="/login" class="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
                    Back to sign in
                  </a>
                </div>
              </div>
            }

            <p class="mt-6 text-center text-[10px] text-neutral-400">
              © 2026 IHCAE Sikkim. All rights reserved.
            </p>
          </div>
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
  isSetupMode = signal(false);
  countdown = signal(5);
  token = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Detect setup mode from route path OR query param
    const isSetupRoute = this.router.url.startsWith('/setup-account');
    if (isSetupRoute) {
      this.isSetupMode.set(true);
    }
    this.route.queryParams.subscribe(params => {
      this.token = (params['token'] ?? '').trim();
      if (!isSetupRoute) {
        this.isSetupMode.set(params['setup'] === 'true');
      }
      if (!this.token) {
        this.isTokenInvalid.set(true);
      } else {
        this.validateToken();
      }
    });
  }

  async validateToken(): Promise<void> {
    try {
      const response = await this.http.get<{ valid: boolean }>(
        `${environment.apiUrl}/api/v1/passwordreset/validate-token`,
        { params: { token: this.token } }
      ).toPromise();

      if (!response || !response.valid) {
        this.isTokenInvalid.set(true);
      }
    } catch (error) {
      this.isTokenInvalid.set(true);
    }
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
          const successMessage = this.isSetupMode() 
            ? 'Your account has been set up successfully' 
            : 'Your password has been reset successfully';
          this.notificationService.showSuccess('Success', successMessage);
          this.startCountdown();
        } else {
          const failTitle = this.isSetupMode() ? 'Setup Failed' : 'Reset Failed';
          const failMsg = this.isSetupMode() ? 'Failed to complete account setup' : 'Failed to reset password';
          this.notificationService.showError(failTitle, response?.message || failMsg);
        }
      } catch (error: any) {
        const errorMessage = error.error?.message || '';
        if (errorMessage && (errorMessage.includes('Password') || errorMessage.includes('password'))) {
          this.notificationService.showError('Validation Error', errorMessage);
        } else if (error.status === 400 || error.status === 404) {
          this.isTokenInvalid.set(true);
          // Don't show a toast — the expired/invalid state page is self-explanatory
        } else {
          const failTitle = this.isSetupMode() ? 'Setup Failed' : 'Reset Failed';
          this.notificationService.showError(failTitle, 'An error occurred. Please try again.');
        }
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
