import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, ArrowRight, Mountain, Users, Heart } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
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
                Welcome Back to Your<br/>Adventure Community
              </h2>
              <p class="text-sm text-primary-200/90 leading-relaxed max-w-sm font-normal">
                Connect with fellow mountaineers, eco-tourism professionals, and conservation champions from across the Himalayas.
              </p>
            </div>

            <!-- Sleek Minimalist Feature Grid (Cardless) -->
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="mountainIcon" [size]="18" class="text-primary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Himalayan Expeditions</p>
                  <p class="text-xs text-primary-300/80">Connect with expert alpine guides</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="usersIcon" [size]="18" class="text-secondary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Alumni Network</p>
                  <p class="text-xs text-primary-300/80">500+ verified members worldwide</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="heartIcon" [size]="18" class="text-red-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Conservation Impact</p>
                  <p class="text-xs text-primary-300/80">Protecting and restoring fragile peaks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Flat Login Form -->
        <div class="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 overflow-y-auto bg-white">
          <div class="w-full max-w-sm">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-10">
              <div class="w-14 h-14 rounded-2xl bg-primary-950 border border-primary-900 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <img src="images/logo.png" alt="IHCAE" class="w-8 h-8 object-contain brightness-200">
              </div>
              <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-500 font-medium">Sikkim, India</p>
            </div>

            <!-- Form Container (Completely Flat & Minimalist) -->
            <div class="py-2">
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-neutral-900 mb-2">Sign In</h2>
                <p class="text-sm text-neutral-500 font-normal">Welcome back! Please enter your credentials.</p>
              </div>

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
                <div>
                  <label for="email" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    <span class="inline-flex items-center gap-1.5">
                      <lucide-icon [img]="mailIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Email Address
                    </span>
                  </label>
                  <input id="email" type="email" formControlName="email"
                    class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                    [class.ring-red-100]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                    placeholder="Enter your email" />
                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <p class="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <span>•</span>
                      @if (loginForm.get('email')?.errors?.['required']) { Email is required }
                      @if (loginForm.get('email')?.errors?.['email']) { Please enter a valid email }
                    </p>
                  }
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label for="password" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                      <span class="inline-flex items-center gap-1.5">
                        <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                        Password
                      </span>
                    </label>
                    <a routerLink="/forgot-password" class="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <input id="password" type="password" formControlName="password"
                    class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    [class.ring-red-100]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                    placeholder="Enter your password" />
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <p class="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <span>•</span> Password is required
                    </p>
                  }
                </div>

                <button type="submit" [disabled]="loginForm.invalid || isLoading"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 mt-6 cursor-pointer">
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

            <!-- Footer links -->
            <div class="mt-8 text-center border-t border-neutral-100 pt-6">
              <p class="text-sm text-neutral-500">
                Don't have an account?
                <a routerLink="/register" class="font-bold text-primary-600 hover:text-primary-700 hover:underline">Create account</a>
              </p>
            </div>

            <div class="mt-4 text-center">
              <a routerLink="/" class="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors">
                Back to home
              </a>
            </div>

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
