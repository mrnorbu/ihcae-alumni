import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, Clock, Users, AlertCircle, CheckCircle, Calendar as CalendarIcon } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { EventsService } from '../../services/events.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import type { Event, EventSummary } from '../../models';

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
      
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 pt-20">
        <!-- Back Link -->
        <a 
          routerLink="/news-events"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-700 transition-colors mb-4 cursor-pointer"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="12"></lucide-icon>
          Back to News & Events
        </a>

        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        } @else if (error()) {
          <div class="bg-transparent border border-neutral-200/60 p-8 text-center rounded-lg max-w-md mx-auto">
            <div class="text-4xl mb-3">📅</div>
            <h2 class="text-lg font-bold text-neutral-900 mb-1">Event Not Found</h2>
            <p class="text-sm text-neutral-500 mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <button routerLink="/news-events" class="btn-primary btn-sm">
              Go Back
            </button>
          </div>
        } @else if (event()) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Main Content (8 cols) -->
            <div class="lg:col-span-8">
              <article class="bg-transparent">
                <!-- Category Badge -->
                @if (event()!.category) {
                  <div class="mb-2">
                    <span class="badge badge-success">
                      {{ event()!.category!.name }}
                    </span>
                  </div>
                }

                <!-- Title -->
                <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight leading-tight">
                  {{ event()!.title }}
                </h1>

                <!-- Event Details Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-neutral-200/60">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none mb-0.5">Date</p>
                      <p class="text-xs font-bold text-neutral-900">{{ formatEventDate(event()!.eventDate) }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none mb-0.5">Time</p>
                      <p class="text-xs font-bold text-neutral-900">{{ formatEventTime(event()!.eventDate) }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none mb-0.5">Location</p>
                      <p class="text-xs font-bold text-neutral-900">{{ event()!.location }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none mb-0.5">Attendees</p>
                      <p class="text-xs font-bold text-neutral-900">
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
                <div class="mb-6">
                  <h2 class="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-wider text-neutral-500">About This Event</h2>
                  <div class="prose prose-sm md:prose max-w-none text-neutral-700 leading-relaxed font-sans">
                    <div [innerHTML]="formatContent(event()!.description)"></div>
                  </div>
                </div>

                <!-- Organizer Info -->
                <div class="mt-8 pt-5 border-t border-neutral-200/60">
                  <h3 class="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-wider text-neutral-500">Organized By</h3>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {{ event()!.createdBy.firstName.charAt(0) }}{{ event()!.createdBy.lastName.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-neutral-900">
                        {{ event()!.createdBy.firstName }} {{ event()!.createdBy.lastName }}
                      </p>
                      <p class="text-xs text-neutral-500">Event Organizer</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- Registration & Extra Events Sidebar (4 cols) -->
            <div class="lg:col-span-4 space-y-5">
              <div class="sticky top-24 space-y-5">
                <!-- Registration Box -->
                <div class="bg-neutral-50/50 border border-neutral-200/60 rounded-lg p-5">
                  <h3 class="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-wider text-neutral-500">Registration</h3>

                  <!-- Registration Status -->
                  @if (isEventFull()) {
                    <div class="bg-error-50/60 border border-error-200/60 rounded-lg p-3.5 mb-4">
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="alertIcon" [size]="14" class="text-error-700 flex-shrink-0 mt-0.5"></lucide-icon>
                        <div>
                          <p class="text-xs font-bold text-error-900 mb-0.5 leading-none">Event Full</p>
                          <p class="text-[11px] text-error-700">This event has reached maximum capacity.</p>
                        </div>
                      </div>
                    </div>
                  } @else if (event()!.availableSpots !== null && event()!.availableSpots !== undefined) {
                    <div class="bg-success-50/60 border border-success-200/60 rounded-lg p-3.5 mb-4">
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="checkIcon" [size]="14" class="text-success-700 flex-shrink-0 mt-0.5"></lucide-icon>
                        <div>
                          <p class="text-xs font-bold text-success-900 mb-0.5 leading-none">Spots Available</p>
                          <p class="text-[11px] text-success-700">{{ event()!.availableSpots }} spots remaining</p>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Registration Deadline -->
                  @if (event()!.registrationDeadline) {
                    <div class="mb-4 text-xs">
                      <p class="text-neutral-500 mb-0.5 font-semibold">Registration Deadline</p>
                      <p class="font-bold text-neutral-900">{{ formatEventDate(event()!.registrationDeadline) }}</p>
                    </div>
                  }

                  <!-- Registration Button -->
                  <button 
                    (click)="openRegistrationForm()"
                    [disabled]="isEventFull()"
                    class="btn-primary btn-sm w-full mb-3"
                    [class.opacity-50]="isEventFull()"
                    [class.cursor-not-allowed]="isEventFull()"
                  >
                    @if (isEventFull()) {
                      Event Full
                    } @else {
                      Register Now
                    }
                  </button>

                  <p class="text-[10px] text-neutral-400 text-center">
                    Free event • No payment required
                  </p>
                </div>

                <!-- Upcoming Events Widget in Sidebar -->
                <div class="bg-neutral-50/30 border border-neutral-200/60 rounded-lg p-4">
                  <h3 class="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-wider text-neutral-500">More Events</h3>
                  
                  @if (upcomingEvents().length === 0) {
                    <p class="text-xs text-neutral-500">No other upcoming events found.</p>
                  } @else {
                    <div class="divide-y divide-neutral-200/60">
                      @for (upEvent of upcomingEvents(); track upEvent.id) {
                        <div 
                          [routerLink]="['/events', upEvent.id]"
                          class="group cursor-pointer py-3 first:pt-0 last:pb-0 block transition-colors"
                        >
                          <span class="text-[9px] font-semibold uppercase tracking-wider text-primary-700 block mb-0.5">
                            {{ upEvent.category?.name || 'Event' }}
                          </span>
                          <h4 class="text-xs font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug truncate">
                            {{ upEvent.title }}
                          </h4>
                          <div class="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                            <span class="flex items-center gap-0.5">
                              <lucide-icon [img]="calendarIcon" [size]="10"></lucide-icon>
                              {{ formatSidebarEventDate(upEvent.eventDate) }}
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
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
  upcomingEvents = signal<EventSummary[]>([]);
  isLoading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadEvent(id);
        this.loadUpcomingEvents(id);
      } else {
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
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

  private loadUpcomingEvents(currentId: string): void {
    this.eventsService.getUpcomingEvents(1, 6).subscribe({
      next: (result) => {
        // Exclude current event and show at most 3
        const filtered = result.items
          .filter(item => item.id !== currentId)
          .slice(0, 3);
        this.upcomingEvents.set(filtered);
      },
      error: (err) => {
        console.error('Error loading upcoming events:', err);
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

  formatSidebarEventDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
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
