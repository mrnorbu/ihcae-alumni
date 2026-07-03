import { Component, inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, User, CheckCircle, ArrowRight, Mountain, Globe, Shield } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-register',
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
                Join Our Global<br/>Alumni Community
              </h2>
              <p class="text-sm text-primary-200/90 leading-relaxed max-w-sm font-normal">
                Connect with mountaineers, eco-tourism professionals, and conservation leaders across the Himalayas.
              </p>
            </div>
    
            <!-- Sleek Minimalist Feature Grid (Cardless) -->
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="mountainIcon" [size]="18" class="text-primary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Expert Training</p>
                  <p class="text-xs text-primary-300/80">World-class mountaineering programs</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="globeIcon" [size]="18" class="text-secondary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Global Network</p>
                  <p class="text-xs text-primary-300/80">Connect across continents</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0">
                  <lucide-icon [img]="shieldIcon" [size]="18" class="text-primary-300"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-semibold">Verified Members</p>
                  <p class="text-xs text-primary-300/80">Secure and trusted community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Right Side - Flat Register Form -->
        <div class="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8 overflow-y-auto bg-white">
          <div class="w-full max-w-sm">
            <!-- Mobile Logo -->
            <div class="lg:hidden text-center mb-8">
              <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-500 font-medium">Sikkim, India</p>
            </div>
    
            <!-- Form Container -->
            <div class="py-2">
              <div class="mb-6">
                <h2 class="text-3xl font-bold text-neutral-900 mb-2">Create Account</h2>
                <p class="text-sm text-neutral-500 font-normal">Join the IHCAE alumni network today</p>
              </div>
    
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Name Fields -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="firstName" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      <span class="inline-flex items-center gap-1.5">
                        <lucide-icon [img]="userIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                        First Name
                      </span>
                    </label>
                    <input id="firstName" type="text" formControlName="firstName"
                      class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                      [class.border-red-300]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                      placeholder="First name" />
                    @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                      <p class="mt-1 text-[11px] text-red-500 font-medium">
                        @if (registerForm.get('firstName')?.errors?.['required']) { First name required }
                      </p>
                    }
                  </div>
    
                  <div>
                    <label for="lastName" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Last Name</label>
                    <input id="lastName" type="text" formControlName="lastName"
                      class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                      [class.border-red-300]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                      placeholder="Last name" />
                    @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                      <p class="mt-1 text-[11px] text-red-500 font-medium">
                        @if (registerForm.get('lastName')?.errors?.['required']) { Last name required }
                      </p>
                    }
                  </div>
                </div>
    
                <!-- Email Field -->
                <div>
                  <label for="email" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    <span class="inline-flex items-center gap-1.5">
                      <lucide-icon [img]="mailIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Email Address
                    </span>
                  </label>
                  <input id="email" type="email" formControlName="email"
                    class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                    placeholder="your@email.com" />
                  <p class="text-[10px] text-neutral-400 mt-1 leading-normal">If you completed a course at IHCAE, use the email you registered with us to get instant access.</p>
                  @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                    <p class="mt-1 text-[11px] text-red-500 font-medium">
                      @if (registerForm.get('email')?.errors?.['required']) { Email is required }
                      @if (registerForm.get('email')?.errors?.['email']) { Please enter a valid email }
                    </p>
                  }
                </div>
    
                <!-- Password Field -->
                <div>
                  <label for="password" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    <span class="inline-flex items-center gap-1.5">
                      <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Password
                    </span>
                  </label>
                  <input id="password" type="password" formControlName="password"
                    class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                    placeholder="Create a password (min. 8 characters)" />
                  @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                    <p class="mt-1 text-[11px] text-red-500 font-medium">
                      @if (registerForm.get('password')?.errors?.['required']) { Password is required }
                      @if (registerForm.get('password')?.errors?.['minlength']) { Must be at least 8 characters }
                    </p>
                  }
                </div>
    
                <!-- Confirm Password Field -->
                <div>
                  <label for="confirmPassword" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    <span class="inline-flex items-center gap-1.5">
                      <lucide-icon [img]="checkIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                      Confirm Password
                    </span>
                  </label>
                  <input id="confirmPassword" type="password" formControlName="confirmPassword"
                    class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                    placeholder="Confirm your password" />
                  @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                    <p class="mt-1 text-[11px] text-red-500 font-medium">
                      @if (registerForm.get('confirmPassword')?.errors?.['required']) { Please confirm password }
                      @if (registerForm.get('confirmPassword')?.errors?.['mismatch']) { Passwords do not match }
                    </p>
                  }
                </div>
    

    
                <!-- Submit Button -->
                <button type="submit" [disabled]="registerForm.invalid || isLoading"
                  class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 mt-6 cursor-pointer">
                  @if (isLoading) {
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  }
                  <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
                  @if (!isLoading) {
                    <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                  }
                </button>
              </form>
            </div>
    
            <!-- Sign In Link -->
            <div class="mt-8 text-center border-t border-neutral-100 pt-6">
              <p class="text-sm text-neutral-500 font-normal">
                Already have an account?
                <a routerLink="/login" class="font-bold text-primary-600 hover:text-primary-700 hover:underline">Sign in</a>
              </p>
            </div>
    
            <!-- Back to Home -->
            <div class="mt-4 text-center">
              <a routerLink="/" class="text-xs font-semibold text-neutral-450 hover:text-neutral-600 transition-colors">
                Back to home
              </a>
            </div>

            <p class="mt-8 text-center text-[11px] text-neutral-400 font-medium tracking-wide">
              © 2026 IHCAE Sikkim. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Lucide icons
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly userIcon = User;
  readonly checkIcon = CheckCircle;
  readonly arrowIcon = ArrowRight;
  readonly mountainIcon = Mountain;
  readonly globeIcon = Globe;
  readonly shieldIcon = Shield;

  registerForm: FormGroup;
  isLoading = false;

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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

  async onSubmit() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        this.authService.register({
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        }).subscribe({
          next: (result) => {
            if (result.success) {
              this.notificationService.showSuccess('Account created successfully!', 'Please check your email for verification.');
              this.router.navigate(['/login']);
            } else {
              this.notificationService.showError('Registration failed', result.message || 'Registration failed');
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Registration error:', error);
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Registration error:', error);
        this.isLoading = false;
      }
    }
  }
}
