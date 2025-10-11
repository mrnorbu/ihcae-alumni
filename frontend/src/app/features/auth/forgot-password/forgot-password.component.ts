import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-angular';

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Forgot Password Component
 * 
 * Modern split-screen design for password reset functionality.
 * Features:
 * - Split-screen layout with brand gradient
 * - Lucide icons
 * - Compact form design
 * - Success state with clear instructions
 * 
 * @author IHCAE Development Team
 * @version 2.0.0
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
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
              Secure Password Reset
            </h2>
            <p class="text-lg text-white/90 leading-relaxed">
              We'll help you regain access to your account quickly and securely.
            </p>
          </div>

          <!-- Security Info -->
          <div class="mt-12 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="lockIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Secure Process</p>
                <p class="text-sm text-white/80">Your security is our priority</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="mailIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Email Verification</p>
                <p class="text-sm text-white/80">Link expires in 1 hour</p>
              </div>
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

          <!-- Success State -->
          <div *ngIf="isEmailSent()" class="space-y-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <lucide-icon [img]="checkIcon" [size]="32" class="text-success-600"></lucide-icon>
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

            <div class="card">
              <div class="space-y-3 text-sm text-neutral-600">
                <p class="flex items-start gap-2">
                  <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                  <span>Check your email inbox (and spam folder)</span>
                </p>
                <p class="flex items-start gap-2">
                  <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                  <span>Click the reset link within 1 hour</span>
                </p>
                <p class="flex items-start gap-2">
                  <lucide-icon [img]="checkIcon" [size]="16" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                  <span>Create your new password</span>
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <button
                (click)="goToLogin()"
                class="btn-primary w-full flex items-center justify-center gap-2"
              >
                <lucide-icon [img]="arrowLeftIcon" [size]="16"></lucide-icon>
                <span>Back to Sign In</span>
              </button>
              <button
                (click)="resetForm()"
                class="btn-outline w-full"
              >
                Send Another Email
              </button>
            </div>
          </div>

          <!-- Form State -->
          <div *ngIf="!isEmailSent()">
            <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
              <div class="mb-6">
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <lucide-icon [img]="lockIcon" [size]="24" class="text-primary-600"></lucide-icon>
                </div>
                <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                  Forgot Password?
                </h2>
                <p class="text-sm text-neutral-600">
                  Enter your email and we'll send you a reset link
                </p>
              </div>
            
              <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Email Field -->
                <div class="form-group">
                  <label for="email" class="input-label">
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="mailIcon" [size]="14" class="text-neutral-500"></lucide-icon>
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="input-field-lg"
                    [class.input-error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                    placeholder="Enter your email"
                  />
                  <div *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched" class="form-error">
                    <p *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</p>
                    <p *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Please enter a valid email</p>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="forgotPasswordForm.invalid || isLoading()"
                  class="btn-primary btn-lg w-full flex items-center justify-center gap-2"
                >
                  <span *ngIf="isLoading()">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  <span>{{ isLoading() ? 'Sending...' : 'Send Reset Link' }}</span>
                  <lucide-icon *ngIf="!isLoading()" [img]="arrowIcon" [size]="16"></lucide-icon>
                </button>
              </form>
            </div>

            <!-- Back to Login Link -->
            <div class="mt-6 text-center">
              <a routerLink="/login" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1">
                <lucide-icon [img]="arrowLeftIcon" [size]="14"></lucide-icon>
                <span>Back to sign in</span>
              </a>
            </div>
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
