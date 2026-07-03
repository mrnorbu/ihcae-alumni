import { Component, inject, signal } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Mail, Lock, User, CheckCircle, ArrowRight, Mountain, Globe, Shield, Phone, GraduationCap, MapPin, ChevronLeft, Clock } from 'lucide-angular';
import { HeaderComponent } from '../../../shared/components';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, LucideAngularModule, HeaderComponent],
  template: `
    <div class="h-screen bg-white flex flex-col overflow-hidden">
      <app-header></app-header>
    
      <div class="flex-1 flex pt-20 lg:pt-16 overflow-hidden">
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
        <div class="flex-1 flex items-start justify-center px-6 sm:px-8 lg:px-12 py-12 lg:py-8 overflow-y-auto bg-white lg:items-center">
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

              <!-- Progress Indicator -->
              <div class="flex items-center gap-2 mb-6">
                <div class="h-1.5 flex-1 rounded-full transition-all duration-300" [class.bg-primary-600]="step() >= 1" [class.bg-neutral-200]="step() < 1"></div>
                <div class="h-1.5 flex-1 rounded-full transition-all duration-300" [class.bg-primary-600]="step() === 2" [class.bg-neutral-200]="step() < 2"></div>
              </div>
    
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
                
                <!-- STEP 1: Account setup -->
                @if (step() === 1) {
                  <div class="space-y-4">
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

                    <!-- Next Step Button -->
                    <button type="button" [disabled]="!isStep1Valid()" (click)="nextStep()"
                      class="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 mt-6 cursor-pointer">
                      <span>Continue to Alumni Details</span>
                      <lucide-icon [img]="arrowIcon" [size]="14"></lucide-icon>
                    </button>
                  </div>
                }

                <!-- STEP 2: Alumni details -->
                @if (step() === 2) {
                  <div class="space-y-4">
                    
                    <div class="p-3 bg-amber-50/40 border border-amber-200/50 rounded-xl text-xs text-amber-800 flex items-start gap-2 mb-2 leading-relaxed">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0"></span>
                      <p>Providing accurate course details helps us verify your account automatically against our alumni database.</p>
                    </div>

                    <!-- Phone Field -->
                    <div>
                      <label for="phone" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        <span class="inline-flex items-center gap-1.5">
                          <lucide-icon [img]="phoneIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Phone Number *
                        </span>
                      </label>
                      <input id="phone" type="text" formControlName="phone"
                        class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        [class.border-red-300]="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched"
                        placeholder="e.g. +91 9876543210" />
                      @if (registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched) {
                        <p class="mt-1 text-[11px] text-red-500 font-medium">Phone number is required</p>
                      }
                    </div>

                    <!-- Course Field -->
                    <div>
                      <label for="course" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        <span class="inline-flex items-center gap-1.5">
                          <lucide-icon [img]="graduationIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Course Completed *
                        </span>
                      </label>
                      <input id="course" type="text" formControlName="course"
                        class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        [class.border-red-300]="registerForm.get('course')?.invalid && registerForm.get('course')?.touched"
                        placeholder="e.g. Basic Mountaineering Course" />
                      @if (registerForm.get('course')?.invalid && registerForm.get('course')?.touched) {
                        <p class="mt-1 text-[11px] text-red-500 font-medium">Course name is required</p>
                      }
                    </div>

                    <!-- Batch Field -->
                    <div>
                      <label for="batch" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        <span class="inline-flex items-center gap-1.5">
                          <lucide-icon [img]="clockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Batch / Graduation Period *
                        </span>
                      </label>
                      <input id="batch" type="text" formControlName="batch"
                        class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        [class.border-red-300]="registerForm.get('batch')?.invalid && registerForm.get('batch')?.touched"
                        placeholder="e.g. 2024 or Batch 15 (2023)" />
                      @if (registerForm.get('batch')?.invalid && registerForm.get('batch')?.touched) {
                        <p class="mt-1 text-[11px] text-red-500 font-medium">Batch description is required</p>
                      }
                    </div>

                    <!-- Location Field -->
                    <div>
                      <label for="location" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        <span class="inline-flex items-center gap-1.5">
                          <lucide-icon [img]="mapPinIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Current Location (Optional)
                        </span>
                      </label>
                      <input id="location" type="text" formControlName="location"
                        class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                        placeholder="e.g. Gangtok, Sikkim" />
                    </div>

                    <!-- Bio Field -->
                    <div>
                      <label for="bio" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        <span class="inline-flex items-center gap-1.5">
                          <lucide-icon [img]="userIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          Short Bio (Optional)
                        </span>
                      </label>
                      <textarea id="bio" formControlName="bio" rows="2"
                        class="w-full px-4 py-2.5 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 resize-none"
                        placeholder="Introduce yourself to the community..."></textarea>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 mt-6">
                      <button type="button" (click)="prevStep()"
                        class="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-all duration-200 cursor-pointer">
                        <lucide-icon [img]="chevronLeftIcon" [size]="14"></lucide-icon>
                        <span>Back</span>
                      </button>
                      <button type="submit" [disabled]="registerForm.invalid || isLoading"
                        class="flex-2 w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                        @if (isLoading) {
                          <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        }
                        <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
                        @if (!isLoading) {
                          <lucide-icon [img]="checkIcon" [size]="14"></lucide-icon>
                        }
                      </button>
                    </div>
                  </div>
                }

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
  `,  styles: []
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
  readonly phoneIcon = Phone;
  readonly graduationIcon = GraduationCap;
  readonly mapPinIcon = MapPin;
  readonly chevronLeftIcon = ChevronLeft;
  readonly clockIcon = Clock;

  registerForm: FormGroup;
  isLoading = false;
  step = signal(1);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(50)]],
      course: ['', [Validators.required, Validators.maxLength(255)]],
      batch: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(255)]],
      bio: ['', [Validators.maxLength(1000)]]
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

  nextStep() {
    if (this.isStep1Valid()) {
      this.step.set(2);
    }
  }

  prevStep() {
    this.step.set(1);
  }

  isStep1Valid(): boolean {
    return (
      (this.registerForm.get('firstName')?.valid ?? false) &&
      (this.registerForm.get('lastName')?.valid ?? false) &&
      (this.registerForm.get('email')?.valid ?? false) &&
      (this.registerForm.get('password')?.valid ?? false) &&
      (this.registerForm.get('confirmPassword')?.valid ?? false) &&
      !this.registerForm.errors?.['mismatch']
    );
  }

  async onSubmit() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        this.authService.register({
          firstName: this.registerForm.value.firstName,
          lastName: this.registerForm.value.lastName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          phone: this.registerForm.value.phone,
          course: this.registerForm.value.course,
          batch: this.registerForm.value.batch,
          location: this.registerForm.value.location || undefined,
          bio: this.registerForm.value.bio || undefined
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
