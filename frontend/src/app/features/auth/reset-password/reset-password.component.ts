import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Lock, CheckCircle, ArrowRight, Key, AlertCircle, Eye, EyeOff } from 'lucide-angular';
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
    <div class="h-screen bg-white flex flex-col overflow-hidden">
      <app-header></app-header>

      <div class="flex-1 flex pt-16 overflow-hidden">
        <!-- Left Side - Flat Premium Brand Panel -->
        <div class="hidden lg:flex lg:w-2/5 bg-primary-950 relative overflow-hidden">
          <!-- Subtle decorative radial background overlay for depth -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,107,184,0.15)_0%,transparent_70%)]"></div>
          
          <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full h-full">
            <div>
              <!-- Tagline -->
              <h2 class="text-3xl font-bold mb-4 leading-tight">
                {{ isSetupMode() ? 'Welcome to Your Alumni Community' : 'Secure Password Reset' }}
              </h2>
              <p class="text-sm text-primary-200/90 leading-relaxed max-w-sm font-normal">
                {{ isSetupMode() 
                  ? 'Your account has been created by the admin team. Set your secure password below to claim your account and connect.' 
                  : 'Choose a strong, unique password to keep your alumni account secure and private.' }}
              </p>
            </div>

            <!-- Sleek requirements list using the rounded card icon blocks (Cardless style) -->
            <div class="space-y-4">
              <p class="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-1">Password requirements:</p>
              
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="lockIcon" [size]="18" class="text-primary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">At least 8 characters</p>
                  <p class="text-xs text-primary-300/80">Length requirement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Flat Form -->
        <div class="flex-1 flex items-start justify-center px-6 sm:px-8 lg:px-12 py-12 lg:py-8 overflow-y-auto bg-white lg:items-center">
          <div class="w-full max-w-sm">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-10">
              <div class="w-14 h-14 rounded-2xl bg-primary-950 border border-primary-900 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <img src="images/logo.png" alt="IHCAE" class="w-8 h-8 object-contain brightness-200">
              </div>
              <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-500 font-medium">Sikkim, India</p>
            </div>

            <!-- Invalid/Expired Token State -->
            @if (isTokenInvalid()) {
              <div class="space-y-6 py-2">
                <!-- Icon + heading -->
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <lucide-icon [img]="alertIcon" [size]="28" class="text-red-500"></lucide-icon>
                  </div>
                  <h2 class="text-3xl font-bold text-neutral-900 mb-2">
                    {{ isSetupMode() ? 'Setup Link Expired' : 'Link Expired' }}
                  </h2>
                  <p class="text-sm text-neutral-500 leading-relaxed font-normal">
                    {{ isSetupMode()
                      ? 'This account setup link has already been used or has expired.'
                      : 'This password reset link is no longer valid.' }}
                  </p>
                </div>

                <!-- Info box -->
                <div class="bg-neutral-50 border border-neutral-100 rounded-2xl p-6">
                  @if (isSetupMode()) {
                    <div class="flex gap-3.5">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                        <lucide-icon [img]="alertIcon" [size]="14" class="text-amber-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-neutral-800 mb-1">What happened?</p>
                        <p class="text-xs text-neutral-500 leading-relaxed font-medium">
                          Setup links are single-use and expire after 7 days. If you've already set your password, you can sign in below. Otherwise, contact the IHCAE admin team and ask them to resend your invitation.
                        </p>
                      </div>
                    </div>
                  } @else {
                    <div class="flex gap-3.5">
                      <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                        <lucide-icon [img]="alertIcon" [size]="14" class="text-amber-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-neutral-800 mb-1">What happened?</p>
                        <p class="text-xs text-neutral-500 leading-relaxed font-medium">
                          Password reset links expire after 1 hour for security reasons. Request a new link and check your inbox.
                        </p>
                      </div>
                    </div>
                  }
                </div>

                <!-- Primary action -->
                <div class="pt-4">
                  @if (isSetupMode()) {
                    <a routerLink="/login"
                      class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all duration-200 cursor-pointer">
                      <span>Go to Sign In</span>
                      <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                    </a>
                  } @else {
                    <a routerLink="/forgot-password"
                      class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all duration-200 cursor-pointer">
                      <span>Request New Link</span>
                      <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                    </a>
                    <div class="text-center mt-6">
                      <a routerLink="/login" class="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                        Back to sign in
                      </a>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Success State -->
            @if (isPasswordReset()) {
              <div class="space-y-6 py-2">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <lucide-icon [img]="checkIcon" [size]="28" class="text-emerald-600"></lucide-icon>
                  </div>
                  <h2 class="text-3xl font-bold text-neutral-900 mb-2">
                    {{ isSetupMode() ? 'Account Activated!' : 'Password Updated!' }}
                  </h2>
                  <p class="text-sm text-neutral-500 font-normal leading-relaxed">
                    {{ isSetupMode() ? 'Your password has been set. You can now sign in to the alumni network.' : 'Your password has been updated successfully.' }}
                  </p>
                </div>
                
                <div class="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 text-center">
                  <p class="text-sm text-neutral-600 mb-4">
                    Redirecting to login in <strong class="text-primary-600 font-bold">{{ countdown() }}</strong> seconds.
                  </p>
                  <button (click)="goToLogin()" class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all duration-200 cursor-pointer">
                    <span>Sign In Now</span>
                    <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            }

            <!-- Form State -->
            @if (!isTokenInvalid() && !isPasswordReset()) {
              <div class="py-2">
                <div class="mb-8">
                  <h2 class="text-3xl font-bold text-neutral-900 mb-2">
                    {{ isSetupMode() ? 'Set Password' : 'Reset Password' }}
                  </h2>
                  <p class="text-sm text-neutral-500 font-normal">
                    {{ isSetupMode() ? 'Create a secure password to activate your alumni account.' : 'Please enter your new password below.' }}
                  </p>
                </div>
                
                <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-5">
                  <!-- Password Field -->
                  <div>
                    <label for="password" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                      <span class="inline-flex items-center gap-1.5">
                        <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                        New Password
                      </span>
                    </label>
                    <div class="relative">
                      <input
                        id="password"
                        [type]="showPassword ? 'text' : 'password'"
                        formControlName="password"
                        class="w-full px-4 py-3 pr-10 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        [class.border-red-300]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
                        [class.ring-red-100]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
                        placeholder="Enter new password (min. 8 chars)"
                        />
                      <button type="button" (click)="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none">
                        <lucide-icon [img]="showPassword ? eyeOffIcon : eyeIcon" [size]="16"></lucide-icon>
                      </button>
                    </div>
                    @if (resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched) {
                      <p class="mt-1.5 text-xs text-red-500 font-medium flex flex-col gap-1">
                        @if (resetPasswordForm.get('password')?.errors?.['required']) { <span>• Password is required</span> }
                        @if (resetPasswordForm.get('password')?.errors?.['minlength']) { <span>• Password must be at least 8 characters</span> }
                      </p>
                    }
                  </div>
                  
                  <!-- Confirm Password Field -->
                  <div>
                    <label for="confirmPassword" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                      <span class="inline-flex items-center gap-1.5">
                        <lucide-icon [img]="checkIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                        Confirm Password
                      </span>
                    </label>
                    <div class="relative">
                      <input
                        id="confirmPassword"
                        [type]="showConfirmPassword ? 'text' : 'password'"
                        formControlName="confirmPassword"
                        class="w-full px-4 py-3 pr-10 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        [class.border-red-300]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
                        [class.ring-red-100]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
                        placeholder="Confirm your new password"
                        />
                      <button type="button" (click)="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none">
                        <lucide-icon [img]="showConfirmPassword ? eyeOffIcon : eyeIcon" [size]="16"></lucide-icon>
                      </button>
                    </div>
                    @if (resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched) {
                      <p class="mt-1.5 text-xs text-red-500 font-medium flex flex-col gap-1">
                        <span>•</span>
                        @if (resetPasswordForm.get('confirmPassword')?.errors?.['required']) { Please confirm your password }
                        @if (resetPasswordForm.get('confirmPassword')?.errors?.['mismatch']) { Passwords do not match }
                      </p>
                    }
                  </div>
                  
                  <!-- Submit Button -->
                  <button
                    type="submit"
                    [disabled]="resetPasswordForm.invalid || isLoading()"
                    class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 mt-6 cursor-pointer"
                    >
                    @if (isLoading()) {
                      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    }
                    <span>{{ isLoading() ? (isSetupMode() ? 'Setting Password...' : 'Resetting Password...') : (isSetupMode() ? 'Set Password & Continue' : 'Reset Password') }}</span>
                    @if (!isLoading()) {
                      <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                    }
                  </button>
                </form>

                <!-- Back to Login Link -->
                <div class="mt-8 text-center border-t border-neutral-100 pt-6">
                  <a routerLink="/login" class="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                    Back to sign in
                  </a>
                </div>
              </div>
            }

            <p class="mt-10 text-center text-[11px] text-neutral-400 font-medium tracking-wide">
              © 2026 IHCAE Sikkim. All rights reserved.
            </p>
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
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  showPassword = false;
  showConfirmPassword = false;
  isTokenInvalid = signal(false);
  isPasswordReset = signal(false);
  isSetupMode = signal(false);
  countdown = signal(5);
  token = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8)
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
