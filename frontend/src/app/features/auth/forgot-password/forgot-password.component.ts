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
                Secure Password Reset
              </h2>
              <p class="text-sm text-primary-200/90 leading-relaxed max-w-sm font-normal">
                We'll help you regain access to your account quickly and securely.
              </p>
            </div>

            <!-- Sleek Minimalist Feature Grid (Cardless) -->
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="lockIcon" [size]="18" class="text-primary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Secure Process</p>
                  <p class="text-xs text-primary-300/80">Your security is our top priority</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="mailIcon" [size]="18" class="text-secondary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Email Verification</p>
                  <p class="text-xs text-primary-300/80">Links expire within 1 hour</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Forgot Password Form -->
        <div class="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 overflow-y-auto bg-white">
          <div class="w-full max-w-md">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-10">
              <div class="w-14 h-14 rounded-2xl bg-primary-950 border border-primary-900 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <img src="images/logo.png" alt="IHCAE" class="w-8 h-8 object-contain brightness-200">
              </div>
              <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-500 font-medium">Sikkim, India</p>
            </div>

            <!-- Success State (Completely Flat & Minimalist) -->
            @if (isEmailSent()) {
              <div class="space-y-6 py-2">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-success-50 border border-success-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <lucide-icon [img]="checkIcon" [size]="28" class="text-success-600"></lucide-icon>
                  </div>
                  <h2 class="text-3xl font-bold text-neutral-900 mb-2">Check Your Email</h2>
                  <p class="text-sm text-neutral-500">
                    We've sent a password reset link to
                  </p>
                  <p class="text-sm font-bold text-primary-600 mt-1">
                    {{ forgotPasswordForm.value.email }}
                  </p>
                </div>
                
                <div class="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                  <div class="space-y-4 text-sm text-neutral-600">
                    <p class="flex items-start gap-3">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Check your email inbox (and spam folder)</span>
                    </p>
                    <p class="flex items-start gap-3">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Click the reset link within 1 hour</span>
                    </p>
                    <p class="flex items-start gap-3">
                      <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>Create your new password</span>
                    </p>
                  </div>
                </div>
                
                <div class="space-y-3 pt-4">
                  <button
                    (click)="goToLogin()"
                    class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all duration-200 cursor-pointer"
                    >
                    <lucide-icon [img]="arrowLeftIcon" [size]="16"></lucide-icon>
                    <span>Back to Sign In</span>
                  </button>
                  <button
                    (click)="resetForm()"
                    class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold border border-neutral-200 bg-white text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                    Send Another Email
                  </button>
                </div>
              </div>
            }

            <!-- Form State (Completely Flat & Minimalist) -->
            @if (!isEmailSent()) {
              <div class="py-2">
                <div class="mb-8">
                  <h2 class="text-3xl font-bold text-neutral-900 mb-2">Forgot Password?</h2>
                  <p class="text-sm text-neutral-500 font-normal">Enter your email and we'll send you a reset link.</p>
                </div>
                
                <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-5">
                  <!-- Email Field -->
                  <div>
                    <label for="email" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                      <span class="inline-flex items-center gap-1.5">
                        <lucide-icon [img]="mailIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                        Email Address
                      </span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                      [class.border-red-300]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                      [class.ring-red-100]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                      placeholder="Enter your email address"
                      />
                    @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                      <p class="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                        <span>•</span>
                        @if (forgotPasswordForm.get('email')?.errors?.['required']) { Email is required }
                        @if (forgotPasswordForm.get('email')?.errors?.['email']) { Please enter a valid email }
                      </p>
                    }
                  </div>
                  
                  <!-- Submit Button -->
                  <button
                    type="submit"
                    [disabled]="forgotPasswordForm.invalid || isLoading()"
                    class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 mt-6 cursor-pointer"
                    >
                    @if (isLoading()) {
                      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    }
                    <span>{{ isLoading() ? 'Sending link...' : 'Send Reset Link' }}</span>
                    @if (!isLoading()) {
                      <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                    }
                  </button>
                </form>

                <!-- Back to Login Link -->
                <div class="mt-8 text-center border-t border-neutral-100 pt-6">
                  <a routerLink="/login" class="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1.5 transition-colors">
                    <lucide-icon [img]="arrowLeftIcon" [size]="14"></lucide-icon>
                    <span>Back to sign in</span>
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
