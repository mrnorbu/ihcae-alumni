import { Component, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, Clock, Users, AlertCircle, CheckCircle, Calendar as CalendarIcon } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { EventsService } from '../../services/events.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import type { Event } from '../../models';

/**
 * Event Detail Component
 * 
 * Displays full event details with registration functionality.
 * Shows available spots, registration status, and event information.
 */
@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <button 
          (click)="goBack()"
          class="btn-outline mb-6 inline-flex items-center gap-2"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="18"></lucide-icon>
          Back to Events
        </button>

        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        } @else if (error()) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <div class="text-6xl mb-4">📅</div>
            <h2 class="text-2xl font-bold text-neutral-900 mb-2">Event Not Found</h2>
            <p class="text-neutral-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <button (click)="goBack()" class="btn-primary">
              Go Back
            </button>
          </div>
        } @else if (event()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2">
              <article class="bg-white rounded-lg shadow-lg overflow-hidden">
                <!-- Featured Image -->
                @if (event()!.imageUrl) {
                  <div class="w-full h-80 relative overflow-hidden bg-neutral-100">
                    <img 
                      [src]="event()!.imageUrl" 
                      [alt]="event()!.title"
                      class="w-full h-full object-cover"
                      (error)="onImageError($event)"
                    >
                    <div 
                      style="display: none;"
                      class="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                    >
                      <lucide-icon [img]="calendarIconLarge" [size]="64" class="text-white opacity-80"></lucide-icon>
                    </div>
                  </div>
                }

                <div class="p-8">
                  <!-- Category Badge -->
                  @if (event()!.category) {
                    <div class="mb-4">
                      <span class="badge badge-success text-sm">
                        {{ event()!.category!.name }}
                      </span>
                    </div>
                  }

                  <!-- Title -->
                  <h1 class="text-3xl font-bold text-neutral-900 mb-6 leading-tight">
                    {{ event()!.title }}
                  </h1>

                  <!-- Event Details Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-neutral-200">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="calendarIcon" [size]="20" class="text-primary-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm text-neutral-500">Date</p>
                        <p class="font-semibold text-neutral-900">{{ formatEventDate(event()!.eventDate) }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="clockIcon" [size]="20" class="text-primary-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm text-neutral-500">Time</p>
                        <p class="font-semibold text-neutral-900">{{ formatEventTime(event()!.eventDate) }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="mapPinIcon" [size]="20" class="text-primary-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm text-neutral-500">Location</p>
                        <p class="font-semibold text-neutral-900">{{ event()!.location }}</p>
                      </div>
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <lucide-icon [img]="usersIcon" [size]="20" class="text-primary-600"></lucide-icon>
                      </div>
                      <div>
                        <p class="text-sm text-neutral-500">Attendees</p>
                        <p class="font-semibold text-neutral-900">
                          {{ event()!.registrationCount }}
                          @if (event()!.capacity) {
                            / {{ event()!.capacity }}
                          }
                          registered
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <div>
                    <h2 class="text-xl font-bold text-neutral-900 mb-4">About This Event</h2>
                    <div class="prose prose-lg max-w-none text-neutral-700 leading-relaxed">
                      <div [innerHTML]="formatContent(event()!.description)"></div>
                    </div>
                  </div>

                  <!-- Organizer Info -->
                  <div class="mt-8 pt-8 border-t border-neutral-200">
                    <h3 class="text-lg font-semibold text-neutral-900 mb-3">Organized By</h3>
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-primary-600 font-semibold">
                          {{ event()!.createdBy.firstName.charAt(0) }}{{ event()!.createdBy.lastName.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <p class="font-semibold text-neutral-900">
                          {{ event()!.createdBy.firstName }} {{ event()!.createdBy.lastName }}
                        </p>
                        <p class="text-sm text-neutral-600">Event Organizer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- Registration Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h3 class="text-xl font-bold text-neutral-900 mb-4">Event Registration</h3>

                <!-- Registration Status -->
                @if (isEventFull()) {
                  <div class="bg-error-50 border border-error-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start gap-3">
                      <lucide-icon [img]="alertIcon" [size]="20" class="text-error-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <div>
                        <p class="font-semibold text-error-900 mb-1">Event Full</p>
                        <p class="text-sm text-error-700">This event has reached maximum capacity.</p>
                      </div>
                    </div>
                  </div>
                } @else if (event()!.availableSpots !== null && event()!.availableSpots !== undefined) {
                  <div class="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start gap-3">
                      <lucide-icon [img]="checkIcon" [size]="20" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <div>
                        <p class="font-semibold text-success-900 mb-1">Spots Available</p>
                        <p class="text-sm text-success-700">{{ event()!.availableSpots }} spots remaining</p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Registration Deadline -->
                @if (event()!.registrationDeadline) {
                  <div class="mb-4">
                    <p class="text-sm text-neutral-600 mb-1">Registration Deadline</p>
                    <p class="font-semibold text-neutral-900">{{ formatEventDate(event()!.registrationDeadline) }}</p>
                  </div>
                }

                <!-- Registration Button -->
                <button 
                  (click)="openRegistrationForm()"
                  [disabled]="isEventFull()"
                  class="btn-primary w-full mb-4"
                  [class.opacity-50]="isEventFull()"
                  [class.cursor-not-allowed]="isEventFull()"
                >
                  @if (isEventFull()) {
                    Event Full
                  } @else {
                    Register Now
                  }
                </button>

                <p class="text-xs text-neutral-500 text-center">
                  Free event • No payment required
                </p>
              </div>
            </div>
          </div>
        }
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host ::ng-deep .prose p {
      margin-bottom: 1rem;
    }
  `]
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private authStore = inject(UserAuthStore);

  // Icons
  arrowLeftIcon = ArrowLeft;
  calendarIcon = Calendar;
  mapPinIcon = MapPin;
  clockIcon = Clock;
  usersIcon = Users;
  alertIcon = AlertCircle;
  checkIcon = CheckCircle;
  calendarIconLarge = CalendarIcon;

  // State
  event = signal<Event | null>(null);
  isLoading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    } else {
      this.error.set(true);
      this.isLoading.set(false);
    }
  }

  private loadEvent(id: string): void {
    this.isLoading.set(true);
    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/news-events']);
  }

  isEventFull(): boolean {
    const evt = this.event();
    if (!evt) return false;
    return evt.availableSpots !== null && evt.availableSpots !== undefined && evt.availableSpots <= 0;
  }

  openRegistrationForm(): void {
    if (this.isEventFull()) return;
    // Navigate to registration (will implement in next task)
    this.router.navigate(['/events', this.event()!.id, 'register']);
  }

  formatEventDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
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

  formatContent(content: string): string {
    return content
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  onImageError(evt: any): void {
    const imgElement = evt.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const fallbackDiv = imgElement.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
    }
  }
}
