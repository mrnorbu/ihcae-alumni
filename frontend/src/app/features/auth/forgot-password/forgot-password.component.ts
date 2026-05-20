import { Component, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Forgot Password Component
 * 
 * Modern split-screen design for password reset functionality.
 * Standardized to match the main login and setup screens.
 * 
 * @author IHCAE Development Team
 * @version 2.0.0
 */
@Component({
  selector: 'app-forgot-password',
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
              <h2 class="text-2xl font-bold mb-3 leading-tight">
                Secure Password Reset
              </h2>
              <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
                We'll help you regain access to your account quickly and securely.
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="lockIcon" [size]="16" class="text-green-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Secure Process</p>
                  <p class="text-xs text-slate-400">Your security is our priority</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="mailIcon" [size]="16" class="text-blue-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Email Verification</p>
                  <p class="text-xs text-slate-400">Link expires in 1 hour</p>
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

            <!-- Success State -->
            @if (isEmailSent()) {
              <div class="space-y-6">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <lucide-icon [img]="checkIcon" [size]="32" class="text-green-600"></lucide-icon>
                  </div>
                  <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                    Check Your Email
                  </h2>
                  <p class="text-sm text-neutral-600">
                    We've sent a password reset link to
                  </p>
                  <p class="text-sm font-semibold text-neutral-900 mt-1">
                    {{ forgotPasswordForm.value.email }}
                  </p>
                </div>
                <div class="bg-white border border-neutral-200 rounded-xl p-6">
                  <div class="space-y-3 text-sm text-neutral-600">
                    <p class="flex items-start gap-2">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-green-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Check your email inbox (and spam folder)</span>
                    </p>
                    <p class="flex items-start gap-2">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-green-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Click the reset link within 1 hour</span>
                    </p>
                    <p class="flex items-start gap-2">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-green-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Create your new password</span>
                    </p>
                  </div>
                </div>
                <div class="space-y-2">
                  <button
                    (click)="goToLogin()"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                    <lucide-icon [img]="arrowLeftIcon" [size]="16"></lucide-icon>
                    <span>Back to Sign In</span>
                  </button>
                  <button
                    (click)="resetForm()"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border border-neutral-200 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                    Send Another Email
                  </button>
                </div>
              </div>
            }

            <!-- Form State -->
            @if (!isEmailSent()) {
              <div>
                <div class="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8">
                  <div class="mb-6">
                    <h2 class="text-xl font-bold text-neutral-900 mb-1">
                      Forgot Password?
                    </h2>
                    <p class="text-xs text-neutral-500">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>
                  <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <!-- Email Field -->
                    <div>
                      <label for="email" class="block text-xs font-medium text-neutral-700 mb-1.5">
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="mailIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Email Address
                        </span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        formControlName="email"
                        class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-colors"
                        [class.border-red-300]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                        placeholder="Enter your email"
                        />
                      @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                        <p class="mt-1 text-xs text-red-500">
                          @if (forgotPasswordForm.get('email')?.errors?.['required']) {
                            Email is required
                          }
                          @if (forgotPasswordForm.get('email')?.errors?.['email']) {
                            Please enter a valid email
                          }
                        </p>
                      }
                    </div>
                    <!-- Submit Button -->
                    <button
                      type="submit"
                      [disabled]="forgotPasswordForm.invalid || isLoading()"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                      >
                      @if (isLoading()) {
                        <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      }
                      <span>{{ isLoading() ? 'Sending...' : 'Send Reset Link' }}</span>
                      @if (!isLoading()) {
                        <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                      }
                    </button>
                  </form>
                </div>
                <!-- Back to Login Link -->
                <div class="mt-5 text-center">
                  <a routerLink="/login" class="text-xs text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1">
                    <lucide-icon [img]="arrowLeftIcon" [size]="12"></lucide-icon>
                    <span>Back to sign in</span>
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
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Lucide icons
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly arrowIcon = ArrowRight;
  readonly checkIcon = CheckCircle;
  readonly arrowLeftIcon = ArrowLeft;

  forgotPasswordForm: FormGroup;
  isLoading = signal(false);
  isEmailSent = signal(false);

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      const email = this.forgotPasswordForm.value.email;

      try {
        const response = await this.http.post<ForgotPasswordResponse>(
          `${environment.apiUrl}/api/v1/passwordreset/forgot-password`,
          { email }
        ).toPromise();

        if (response?.success) {
          this.isEmailSent.set(true);
          this.notificationService.showSuccess('Email Sent', 'Password reset instructions have been sent to your email');
        } else {
          this.notificationService.showError('Request Failed', response?.message || 'Failed to process your request');
        }
      } catch (error: any) {
        console.error('Forgot password error:', error);
        this.notificationService.showError('Request Failed', 'An error occurred. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  resetForm(): void {
    this.isEmailSent.set(false);
    this.forgotPasswordForm.reset();
    this.isLoading.set(false);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
