import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, CheckCircle, AlertCircle, Calendar, MapPin, Clock } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { EventsService } from '../../services/events.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import type { Event } from '../../models';

/**
 * Event Registration Component
 * 
 * Handles event registration with form validation.
 * Pre-fills user data if authenticated.
 */
@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <button 
          (click)="goBack()"
          class="btn-outline mb-6 inline-flex items-center gap-2"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="18"></lucide-icon>
          Back to Event
        </button>

        @if (isLoadingEvent()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        } @else if (registrationSuccess()) {
          <!-- Success Message -->
          <div class="bg-white rounded-lg shadow-lg p-12 text-center">
            <div class="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [img]="checkIcon" [size]="40" class="text-success-600"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-neutral-900 mb-4">Registration Successful!</h2>
            <p class="text-lg text-neutral-600 mb-8">
              You've successfully registered for this event. A confirmation email has been sent to your email address.
            </p>
            <div class="flex gap-4 justify-center">
              <button (click)="goToEvent()" class="btn-primary">
                View Event Details
              </button>
              <button routerLink="/news-events" class="btn-outline">
                Browse More Events
              </button>
            </div>
          </div>
        } @else if (event()) {
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Event Summary Header -->
            <div class="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
              <h1 class="text-2xl font-bold mb-4">Register for Event</h1>
              <h2 class="text-xl mb-4">{{ event()!.title }}</h2>
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
                  <span>{{ formatEventDate(event()!.eventDate) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="clockIcon" [size]="16"></lucide-icon>
                  <span>{{ formatEventTime(event()!.eventDate) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="mapPinIcon" [size]="16"></lucide-icon>
                  <span>{{ event()!.location }}</span>
                </div>
              </div>
            </div>

            <!-- Registration Form -->
            <div class="p-8">
              @if (errorMessage()) {
                <div class="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
                  <div class="flex items-start gap-3">
                    <lucide-icon [img]="alertIcon" [size]="20" class="text-error-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <div>
                      <p class="font-semibold text-error-900 mb-1">Registration Failed</p>
                      <p class="text-sm text-error-700">{{ errorMessage() }}</p>
                    </div>
                  </div>
                </div>
              }

              <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
                <!-- Name Field -->
                <div class="mb-6">
                  <label for="name" class="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name <span class="text-error-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="input-field"
                    placeholder="Enter your full name"
                    [class.border-error-500]="registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched"
                  >
                  @if (registrationForm.get('name')?.invalid && registrationForm.get('name')?.touched) {
                    <p class="mt-1 text-sm text-error-600">Name is required</p>
                  }
                </div>

                <!-- Email Field -->
                <div class="mb-6">
                  <label for="email" class="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address <span class="text-error-600">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="input-field"
                    placeholder="Enter your email address"
                    [class.border-error-500]="registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched"
                  >
                  @if (registrationForm.get('email')?.invalid && registrationForm.get('email')?.touched) {
                    <p class="mt-1 text-sm text-error-600">
                      @if (registrationForm.get('email')?.errors?.['required']) {
                        Email is required
                      } @else if (registrationForm.get('email')?.errors?.['email']) {
                        Please enter a valid email address
                      }
                    </p>
                  }
                </div>

                <!-- Phone Field -->
                <div class="mb-6">
                  <label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number <span class="text-neutral-500">(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    formControlName="phone"
                    class="input-field"
                    placeholder="Enter your phone number"
                  >
                </div>

                <!-- Terms -->
                <div class="mb-6 p-4 bg-neutral-50 rounded-lg">
                  <p class="text-sm text-neutral-600">
                    By registering for this event, you agree to receive event-related communications and updates.
                  </p>
                </div>

                <!-- Submit Button -->
                <div class="flex gap-4">
                  <button
                    type="submit"
                    [disabled]="registrationForm.invalid || isSubmitting()"
                    class="btn-primary flex-1"
                    [class.opacity-50]="registrationForm.invalid || isSubmitting()"
                    [class.cursor-not-allowed]="registrationForm.invalid || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="flex items-center justify-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Registering...
                      </span>
                    } @else {
                      Complete Registration
                    }
                  </button>
                  <button
                    type="button"
                    (click)="goBack()"
                    class="btn-outline"
                    [disabled]="isSubmitting()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class EventRegistrationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private eventsService = inject(EventsService);
  private authStore = inject(UserAuthStore);

  // Icons
  arrowLeftIcon = ArrowLeft;
  checkIcon = CheckCircle;
  alertIcon = AlertCircle;
  calendarIcon = Calendar;
  mapPinIcon = MapPin;
  clockIcon = Clock;

  // State
  event = signal<Event | null>(null);
  isLoadingEvent = signal(true);
  isSubmitting = signal(false);
  registrationSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  eventId: string = '';

  // Form
  registrationForm: FormGroup;

  constructor() {
    this.registrationForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = id;
      this.loadEvent(id);
      this.prefillUserData();
    } else {
      this.router.navigate(['/news-events']);
    }
  }

  private loadEvent(id: string): void {
    this.isLoadingEvent.set(true);
    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoadingEvent.set(false);
        
        // Check if event is full
        if (event.availableSpots !== null && event.availableSpots !== undefined && event.availableSpots <= 0) {
          this.errorMessage.set('This event is full. Registration is no longer available.');
        }
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.router.navigate(['/news-events']);
      }
    });
  }

  private prefillUserData(): void {
    const user = this.authStore.currentUser;
    if (user) {
      this.registrationForm.patchValue({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      });
    }
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.registrationForm.value;
    this.eventsService.registerForEvent(this.eventId, formValue).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.registrationSuccess.set(true);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.isSubmitting.set(false);
        
        if (err.status === 400) {
          this.errorMessage.set(err.error?.message || 'You are already registered for this event or the event is full.');
        } else {
          this.errorMessage.set('An error occurred during registration. Please try again.');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events', this.eventId]);
  }

  goToEvent(): void {
    this.router.navigate(['/events', this.eventId]);
  }

  formatEventDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatEventTime(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  }
}
