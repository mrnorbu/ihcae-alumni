import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, ArrowRight, Mountain, Users, Heart } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LucideAngularModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <app-header></app-header>

      <div class="flex-1 flex pt-16">
        <!-- Left Side - Flat Brand Panel -->
        <div class="hidden lg:flex lg:w-2/5 bg-slate-900 relative">
          <div class="flex flex-col justify-between p-10 text-white w-full">
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
                Welcome Back to<br/>Your Adventure Community
              </h2>
              <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
                Connect with fellow mountaineers, eco-tourism professionals, and conservation champions from across the Himalayas.
              </p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="mountainIcon" [size]="16" class="text-green-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Himalayan Expeditions</p>
                  <p class="text-xs text-slate-400">Connect with expert guides</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="usersIcon" [size]="16" class="text-blue-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Alumni Network</p>
                  <p class="text-xs text-slate-400">500+ members worldwide</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="heartIcon" [size]="16" class="text-red-400"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium">Conservation Impact</p>
                  <p class="text-xs text-slate-400">Protecting our mountains</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div class="w-full max-w-sm">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-8">
              <div class="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center mx-auto mb-3">
                <img src="images/logo.png" alt="IHCAE" class="w-7 h-7 object-contain brightness-200">
              </div>
              <h1 class="text-xl font-bold text-neutral-900">IHCAE Alumni</h1>
            </div>

            <!-- Form -->
            <div class="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
              <div class="mb-5">
                <h2 class="text-xl font-bold text-neutral-900 mb-1">Sign In</h2>
                <p class="text-xs text-neutral-500">Welcome back! Enter your credentials.</p>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label for="email" class="block text-xs font-medium text-neutral-700 mb-1.5">
                    <span class="inline-flex items-center gap-1">
                      <lucide-icon [img]="mailIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Email Address
                    </span>
                  </label>
                  <input id="email" type="email" formControlName="email"
                    class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-colors"
                    [class.border-red-300]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                    [class.ring-red-200]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                    placeholder="Enter your email" />
                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <p class="mt-1 text-xs text-red-500">
                      @if (loginForm.get('email')?.errors?.['required']) { Email is required }
                      @if (loginForm.get('email')?.errors?.['email']) { Please enter a valid email }
                    </p>
                  }
                </div>

                <div>
                  <label for="password" class="block text-xs font-medium text-neutral-700 mb-1.5">
                    <span class="inline-flex items-center gap-1">
                      <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Password
                    </span>
                  </label>
                  <input id="password" type="password" formControlName="password"
                    class="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white transition-colors"
                    [class.border-red-300]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    placeholder="Enter your password" />
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <p class="mt-1 text-xs text-red-500">Password is required</p>
                  }
                </div>

                <div class="flex items-center justify-end">
                  <a routerLink="/forgot-password" class="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <button type="submit" [disabled]="loginForm.invalid || isLoading"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors">
                  @if (isLoading) {
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  }
                  <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
                  @if (!isLoading) {
                    <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                  }
                </button>
              </form>
            </div>

            <div class="mt-5 text-center">
              <p class="text-xs text-neutral-500">
                Don't have an account?
                <a routerLink="/register" class="font-semibold text-neutral-900 hover:underline">Create account</a>
              </p>
            </div>

            <div class="mt-3 text-center">
              <a routerLink="/" class="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                Back to home
              </a>
            </div>
          </div>
        </div>
      </div>

      <app-footer></app-footer>
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
