import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, ArrowRight, Mountain, Users, Heart } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Left Side - Brand Section -->
      <div class="hidden lg:flex lg:w-2/5 bg-gradient-brand relative overflow-hidden">
        <div class="absolute inset-0 bg-black bg-opacity-10"></div>
        <div class="relative z-10 flex flex-col justify-between p-12 text-white">
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
              Welcome Back to<br/>Your Adventure Community
            </h2>
            <p class="text-lg text-white/90 leading-relaxed">
              Connect with fellow mountaineers, eco-tourism professionals, and conservation champions from across the Himalayas.
            </p>
          </div>

          <!-- Features -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="mountainIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Himalayan Expeditions</p>
                <p class="text-sm text-white/80">Connect with expert guides</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="usersIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Alumni Network</p>
                <p class="text-sm text-white/80">500+ members worldwide</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="heartIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Conservation Impact</p>
                <p class="text-sm text-white/80">Protecting our mountains</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-sm text-white/70">
            © 2024 IHCAE Sikkim. All rights reserved.
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8">
            <img src="images/logo.png" alt="IHCAE Logo" class="h-16 w-auto mx-auto mb-3">
            <h1 class="text-2xl font-bold text-neutral-900">IHCAE Alumni</h1>
          </div>

          <!-- Form Container -->
          <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-neutral-900 mb-2">
                Sign In
              </h2>
              <p class="text-sm text-neutral-600">
                Welcome back! Please enter your credentials.
              </p>
            </div>
          
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
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
                  [class.input-error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Enter your email"
                />
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="form-error">
                  <p *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</p>
                  <p *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</p>
                </div>
              </div>
              
              <!-- Password Field -->
              <div class="form-group">
                <label for="password" class="input-label">
                  <div class="flex items-center gap-1.5">
                    <lucide-icon [img]="lockIcon" [size]="14" class="text-neutral-500"></lucide-icon>
                    <span>Password</span>
                  </div>
                </label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="input-field-lg"
                  [class.input-error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Enter your password"
                />
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="form-error">
                  <p *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</p>
                </div>
              </div>

              <!-- Forgot Password Link -->
              <div class="flex items-center justify-end">
                <a routerLink="/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading"
                class="btn-primary btn-lg w-full flex items-center justify-center gap-2"
              >
                <span *ngIf="isLoading">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
                <lucide-icon *ngIf="!isLoading" [img]="arrowIcon" [size]="16"></lucide-icon>
              </button>
            </form>
          </div>

          <!-- Sign Up Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-neutral-600">
              Don't have an account?
              <a routerLink="/register" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Create account
              </a>
            </p>
          </div>

          <!-- Back to Home -->
          <div class="mt-4 text-center">
            <a routerLink="/" class="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Lucide icons
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly arrowIcon = ArrowRight;
  readonly mountainIcon = Mountain;
  readonly usersIcon = Users;
  readonly heartIcon = Heart;

  loginForm: FormGroup;
  isLoading = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        this.authService.login({
          email: this.loginForm.value.email,
          password: this.loginForm.value.password
        }).subscribe({
          next: (result) => {
            if (result.success) {
              this.notificationService.showSuccess('Welcome back!', 'Login successful');
              
              // Check if user is admin and redirect accordingly
              const isAdmin = result.user?.roles?.includes('Admin') || false;
              if (isAdmin) {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            } else {
              this.notificationService.showError('Login failed', result.message || 'Invalid credentials');
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.notificationService.showError('Login failed', 'An unexpected error occurred');
            console.error('Login error:', error);
            this.isLoading = false;
          }
        });
      } catch (error) {
        this.notificationService.showError('Login failed', 'An unexpected error occurred');
        console.error('Login error:', error);
        this.isLoading = false;
      }
    }
  }
}
