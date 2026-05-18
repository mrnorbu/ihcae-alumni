import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock, Users, Plus, Eye, Edit, Trash2, Newspaper, CalendarDays, Sparkles, Award, Building, Users2, BookOpen, Mountain } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { NewsService } from '../../services/news.service';
import { EventsService } from '../../services/events.service';
import type { NewsArticleSummary, EventSummary } from '../../models';

/**
 * News & Events Component
 * 
 * Public news and events page displaying institute updates and upcoming events.
 * Features event registration and news article reading functionality.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-news-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
    
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">News & Events</h1>
          <p class="text-neutral-600">Stay updated with IHCAE news and upcoming events</p>
        </div>
    
        <!-- Featured Event -->
        @if (featuredEvent()) {
          <div class="bg-white rounded-lg shadow-lg border border-neutral-200 p-8 mb-8">
            <div class="flex items-start gap-6">
              <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="calendarIcon" [size]="32" class="text-primary-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2 text-neutral-900">Featured Event</h2>
                <h3 class="text-xl font-semibold mb-3 text-neutral-900">{{ featuredEvent()!.title }}</h3>
                <div class="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="calendarDaysIcon" [size]="14"></lucide-icon>
                    {{ formatEventDate(featuredEvent()!.eventDate) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                    {{ featuredEvent()!.location }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                    {{ featuredEvent()!.registrationCount }} registered
                  </div>
                </div>
              </div>
              <button class="btn-primary" [routerLink]="['/events', featuredEvent()!.id]">
                Register Now
              </button>
            </div>
          </div>
        }
    
        <!-- Content Tabs -->
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="border-b border-neutral-200">
            <nav class="flex space-x-8 px-6">
              <button
                (click)="setActiveTab('news')"
                [class.tab-active]="activeTab() === 'news'"
                [class.tab-inactive]="activeTab() !== 'news'"
                class="py-4 px-1 border-b-2 font-medium text-sm">
                <lucide-icon [img]="newspaperIcon" [size]="18" class="mr-2"></lucide-icon>
                News ({{ news().length }})
              </button>
              <button
                (click)="setActiveTab('events')"
                [class.tab-active]="activeTab() === 'events'"
                [class.tab-inactive]="activeTab() !== 'events'"
                class="py-4 px-1 border-b-2 font-medium text-sm">
                <lucide-icon [img]="calendarIcon" [size]="18" class="mr-2"></lucide-icon>
                Events ({{ events().length }})
              </button>
            </nav>
          </div>
    
          <!-- News Tab Content -->
          @if (activeTab() === 'news') {
            <div class="p-6">
              @if (isLoadingNews()) {
                <div class="flex justify-center items-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              } @else if (news().length === 0) {
                <div class="text-center py-12">
                  <p class="text-neutral-600">No news articles available at the moment.</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (article of news(); track article.id; let i = $index) {
                    <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/news', article.id]">
                      <!-- Article Image -->
                      <div class="h-48 relative overflow-hidden">
                        @if (article.thumbnailUrl) {
                          <img
                            [src]="article.thumbnailUrl"
                            [alt]="article.title"
                            class="w-full h-full object-cover absolute inset-0"
                            (error)="onImageError($event)"
                            >
                        }
                        <!-- Fallback gradient with icon (shown when no image or image fails) -->
                        <div
                          class="h-48 flex items-center justify-center absolute inset-0"
                          [ngClass]="getNewsGradient(i)"
                          [style.display]="article.thumbnailUrl ? 'none' : 'flex'"
                          >
                          <lucide-icon [img]="getNewsIcon(article.category.name)" [size]="48" class="text-white/80"></lucide-icon>
                        </div>
                      </div>
                      <!-- Article Content -->
                      <div class="p-6">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="badge badge-primary">{{ article.category.name }}</span>
                          <span class="text-xs text-neutral-500">{{ formatDate(article.publishedAt) }}</span>
                        </div>
                        <h3 class="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{{ article.title }}</h3>
                        <p class="text-neutral-600 mb-4 line-clamp-3">{{ article.excerpt }}</p>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2 text-sm text-neutral-500">
                            <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                            {{ article.viewCount }} views
                          </div>
                          <span class="btn-outline btn-sm">
                            Read More →
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
    
          <!-- Events Tab Content -->
          @if (activeTab() === 'events') {
            <div class="p-6">
              @if (isLoadingEvents()) {
                <div class="flex justify-center items-center py-12">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              } @else if (events().length === 0) {
                <div class="text-center py-12">
                  <p class="text-neutral-600">No upcoming events at the moment.</p>
                </div>
              } @else {
                <div class="space-y-6">
                  @for (event of events(); track event.id) {
                    <div class="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-lg font-semibold text-neutral-900">{{ event.title }}</h3>
                            @if (event.category) {
                              <span class="badge badge-success">{{ event.category.name }}</span>
                            }
                          </div>
                          <div class="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="calendarDaysIcon" [size]="14"></lucide-icon>
                              {{ formatEventDate(event.eventDate) }}
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                              {{ formatEventTime(event.eventDate) }}
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                              {{ event.location }}
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                              {{ event.registrationCount }} registered
                              @if (event.capacity) {
                                / {{ event.capacity }}
                              }
                            </div>
                          </div>
                          @if (event.availableSpots !== null && event.availableSpots !== undefined) {
                            <div class="mb-3">
                              @if (event.availableSpots > 0) {
                                <span class="text-sm text-success-600 font-medium">{{ event.availableSpots }} spots available</span>
                              } @else {
                                <span class="text-sm text-error-600 font-medium">Event Full</span>
                              }
                            </div>
                          }
                        </div>
                        <div class="flex flex-col gap-2 ml-6">
                          <button class="btn-primary btn-sm" [routerLink]="['/events', event.id]">
                            Register Now
                          </button>
                          <button class="btn-outline btn-sm" [routerLink]="['/events', event.id]">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
    
        <!-- Newsletter Signup -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Stay Updated</h3>
              <p class="text-neutral-600">Subscribe to our newsletter for the latest news and events</p>
            </div>
            <div class="flex gap-2">
              <input type="email" class="input-field" placeholder="Enter your email">
              <button class="btn-primary">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    
      <app-footer></app-footer>
    </div>
    `,
  styles: []
})
export class NewsEventsComponent implements OnInit {
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);

  // Icons
  calendarIcon = Calendar;
  mapPinIcon = MapPin;
  clockIcon = Clock;
  usersIcon = Users;
  plusIcon = Plus;
  eyeIcon = Eye;
  editIcon = Edit;
  trashIcon = Trash2;
  newspaperIcon = Newspaper;
  calendarDaysIcon = CalendarDays;
  sparklesIcon = Sparkles;
  awardIcon = Award;
  buildingIcon = Building;
  users2Icon = Users2;
  bookOpenIcon = BookOpen;
  mountainIcon = Mountain;

  // Active tab
  activeTab = signal('news');

  // Data signals
  news = signal<NewsArticleSummary[]>([]);
  events = signal<EventSummary[]>([]);
  featuredEvent = signal<EventSummary | null>(null);
  isLoadingNews = signal(true);
  isLoadingEvents = signal(true);

  ngOnInit() {
    this.loadNews();
    this.loadEvents();
  }

  private loadNews(): void {
    this.isLoadingNews.set(true);
    this.newsService.getPublishedArticles(1, 20).subscribe({
      next: (result) => {
        this.news.set(result.items);
        this.isLoadingNews.set(false);
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.isLoadingNews.set(false);
      }
    });
  }

  private loadEvents(): void {
    this.isLoadingEvents.set(true);
    this.eventsService.getUpcomingEvents(1, 20).subscribe({
      next: (result) => {
        this.events.set(result.items);
        // Set first event as featured
        if (result.items.length > 0) {
          this.featuredEvent.set(result.items[0]);
        }
        this.isLoadingEvents.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoadingEvents.set(false);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  getNewsGradient(index: number): string {
    const gradients = [
      'bg-gradient-to-br from-blue-400 to-purple-500',
      'bg-gradient-to-br from-emerald-400 to-cyan-500',
      'bg-gradient-to-br from-amber-400 to-orange-500',
      'bg-gradient-to-br from-pink-400 to-rose-500',
      'bg-gradient-to-br from-indigo-400 to-blue-500',
      'bg-gradient-to-br from-teal-400 to-green-500'
    ];
    return gradients[index % gradients.length];
  }

  getNewsIcon(category: string): any {
    const iconMap: { [key: string]: any } = {
      'Program Updates': this.sparklesIcon,
      'Alumni News': this.awardIcon,
      'Conservation': this.mountainIcon,
      'Facilities': this.buildingIcon,
      'Partnerships': this.users2Icon,
      'Training': this.bookOpenIcon,
      'default': this.newspaperIcon
    };
    return iconMap[category] || iconMap['default'];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
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

  estimateReadTime(content: string | undefined): number {
    if (!content) return 3;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    // Hide the broken image
    imgElement.style.display = 'none';
    // Show the fallback gradient with icon
    const fallbackDiv = imgElement.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
    }
  }
}
