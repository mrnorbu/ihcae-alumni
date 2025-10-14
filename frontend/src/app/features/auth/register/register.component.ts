import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, User, CheckCircle, ArrowRight, Mountain, Globe, Shield } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../shared/components';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-white">
      <app-header></app-header>
      
      <div class="flex pt-16">
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
              Join Our Global<br/>Alumni Community
            </h2>
            <p class="text-lg text-white/90 leading-relaxed">
              Connect with mountaineers, eco-tourism professionals, and conservation leaders across the Himalayas.
            </p>
          </div>

          <!-- Features -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="mountainIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Expert Training</p>
                <p class="text-sm text-white/80">World-class mountaineering programs</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="globeIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Global Network</p>
                <p class="text-sm text-white/80">Connect across continents</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <lucide-icon [img]="shieldIcon" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div>
                <p class="font-semibold">Verified Members</p>
                <p class="text-sm text-white/80">Secure and trusted community</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-sm text-white/70">
            © 2024 IHCAE Sikkim. All rights reserved.
          </div>
        </div>
      </div>

      <!-- Right Side - Register Form -->
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
                Create Account
              </h2>
              <p class="text-sm text-neutral-600">
                Join the IHCAE alumni network today
              </p>
            </div>
          
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3">
              <!-- Name Fields -->
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label for="firstName" class="input-label">
                    <div class="flex items-center gap-1.5">
                      <lucide-icon [img]="userIcon" [size]="14" class="text-neutral-500"></lucide-icon>
                      <span>First Name</span>
                    </div>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    formControlName="firstName"
                    class="input-field"
                    [class.input-error]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                    placeholder="First name"
                  />
                  <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched" class="form-error">
                    <p *ngIf="registerForm.get('firstName')?.errors?.['required']">Required</p>
                    <p *ngIf="registerForm.get('firstName')?.errors?.['maxlength']">Too long</p>
                  </div>
                </div>

                <div class="form-group">
                  <label for="lastName" class="input-label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    formControlName="lastName"
                    class="input-field"
                    [class.input-error]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                    placeholder="Last name"
                  />
                  <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched" class="form-error">
                    <p *ngIf="registerForm.get('lastName')?.errors?.['required']">Required</p>
                    <p *ngIf="registerForm.get('lastName')?.errors?.['maxlength']">Too long</p>
                  </div>
                </div>
              </div>
              
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
                  [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  placeholder="your@email.com"
                />
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="form-error">
                  <p *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</p>
                  <p *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</p>
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
                  [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Create a password (min. 8 characters)"
                />
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="form-error">
                  <p *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</p>
                  <p *ngIf="registerForm.get('password')?.errors?.['minlength']">Must be at least 8 characters</p>
                </div>
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
                  [class.input-error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                  placeholder="Confirm your password"
                />
                <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="form-error">
                  <p *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm password</p>
                  <p *ngIf="registerForm.get('confirmPassword')?.errors?.['mismatch']">Passwords do not match</p>
                </div>
              </div>

              <!-- Terms Checkbox -->
              <div class="flex items-start gap-2 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  formControlName="acceptTerms"
                  class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label for="terms" class="text-xs text-neutral-600 leading-relaxed">
                  I agree to the 
                  <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</a>
                  and 
                  <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a>
                </label>
              </div>
              <div *ngIf="registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched" class="form-error">
                <p>You must accept the terms to continue</p>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="btn-primary btn-lg w-full flex items-center justify-center gap-2 mt-4"
              >
                <span *ngIf="isLoading">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
                <lucide-icon *ngIf="!isLoading" [img]="arrowIcon" [size]="16"></lucide-icon>
              </button>
            </form>
          </div>

          <!-- Sign In Link -->
          <div class="mt-6 text-center">
            <p class="text-sm text-neutral-600">
              Already have an account?
              <a routerLink="/login" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
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
      
      <app-footer></app-footer>
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
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
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
            this.notificationService.showError('Registration failed', 'An unexpected error occurred');
            console.error('Registration error:', error);
            this.isLoading = false;
          }
        });
      } catch (error) {
        this.notificationService.showError('Registration failed', 'An unexpected error occurred');
        console.error('Registration error:', error);
        this.isLoading = false;
      }
    }
  }
}
