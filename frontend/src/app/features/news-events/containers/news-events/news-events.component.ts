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
      <div class="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8 pt-20">
        <!-- Page Header -->
        <div class="mb-5">
          <h1 class="text-2xl md:text-3xl font-bold text-neutral-900 mb-1 tracking-tight">News & Events</h1>
          <p class="text-xs md:text-sm text-neutral-500">Stay updated with IHCAE news and upcoming events</p>
        </div>
    
        <!-- Featured Event -->
        @if (featuredEvent()) {
          <div class="py-4 border-b border-neutral-200/60 mb-5">
            <div class="flex flex-col md:flex-row md:items-center gap-4">
              <div class="w-12 h-12 bg-primary-50 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="calendarIcon" [size]="20" class="text-primary-700"></lucide-icon>
              </div>
              <div class="flex-1">
                <span class="text-xs font-semibold text-primary-700 uppercase tracking-wider block mb-0.5">Featured Event</span>
                <h3 class="text-lg font-bold text-neutral-900 leading-snug mb-1.5">{{ featuredEvent()!.title }}</h3>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="calendarDaysIcon" [size]="12"></lucide-icon>
                    <span>{{ formatEventDate(featuredEvent()!.eventDate) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                    <span>{{ featuredEvent()!.location }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="usersIcon" [size]="12"></lucide-icon>
                    <span>{{ featuredEvent()!.registrationCount }} registered</span>
                  </div>
                </div>
              </div>
              <button class="btn-primary btn-sm md:self-center" [routerLink]="['/events', featuredEvent()!.id]">
                Register Now
              </button>
            </div>
          </div>
        }
    
        <!-- Content Tabs -->
        <div class="mb-5">
          <div class="tab-nav">
            <button
              (click)="setActiveTab('news')"
              [class.tab-item-active]="activeTab() === 'news'"
              class="tab-item flex items-center">
              <lucide-icon [img]="newspaperIcon" [size]="16" class="mr-1.5"></lucide-icon>
              News ({{ news().length }})
            </button>
            <button
              (click)="setActiveTab('events')"
              [class.tab-item-active]="activeTab() === 'events'"
              class="tab-item flex items-center">
              <lucide-icon [img]="calendarIcon" [size]="16" class="mr-1.5"></lucide-icon>
              Events ({{ events().length }})
            </button>
          </div>
    
          <!-- News Tab Content -->
          @if (activeTab() === 'news') {
            <div class="py-3">
              @if (isLoadingNews()) {
                <div class="flex justify-center items-center py-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              } @else if (news().length === 0) {
                <div class="text-center py-10">
                  <p class="text-neutral-500">No news articles available at the moment.</p>
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  @for (article of news(); track article.id; let i = $index) {
                    <div class="group cursor-pointer py-3 border-b border-neutral-200/60 hover:bg-neutral-50/30 px-2 rounded-lg transition-colors" [routerLink]="['/news', article.id]">
                      <!-- Article Image -->
                      <div class="h-40 rounded overflow-hidden relative mb-2 relative bg-neutral-100 flex items-center justify-center">
                        @if (article.thumbnailUrl) {
                          <img
                            [src]="article.thumbnailUrl"
                            [alt]="article.title"
                            class="w-full h-full object-cover"
                            (error)="onImageError($event)"
                            >
                        }
                        <!-- Fallback green banner with icon -->
                        <div
                          class="w-full h-full bg-primary-50 text-primary-700/80 flex items-center justify-center"
                          [style.display]="article.thumbnailUrl ? 'none' : 'flex'"
                          >
                          <lucide-icon [img]="getNewsIcon(article.category.name)" [size]="36"></lucide-icon>
                        </div>
                      </div>
                      <!-- Article Content -->
                      <div class="space-y-0.5 py-1 px-0.5">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs font-semibold tracking-wider uppercase text-primary-700">{{ article.category.name }}</span>
                          <span class="text-xs text-neutral-300">•</span>
                          <span class="text-xs text-neutral-400">{{ formatDate(article.publishedAt) }}</span>
                        </div>
                        <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors mt-0.5 leading-snug line-clamp-2">{{ article.title }}</h3>
                        <p class="text-sm text-neutral-500 leading-relaxed line-clamp-3 mt-1">{{ article.excerpt }}</p>
                        <div class="flex items-center justify-between pt-2 text-xs text-neutral-400">
                          <div class="flex items-center gap-1.5">
                            <lucide-icon [img]="eyeIcon" [size]="12"></lucide-icon>
                            <span>{{ article.viewCount }} views</span>
                          </div>
                          <span class="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">
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
            <div class="py-3">
              @if (isLoadingEvents()) {
                <div class="flex justify-center items-center py-10">
                  <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              } @else if (events().length === 0) {
                <div class="text-center py-10">
                  <p class="text-neutral-500">No upcoming events at the moment.</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (event of events(); track event.id) {
                    <div class="group cursor-pointer py-3 border-b border-neutral-200/60 hover:bg-neutral-50/30 px-2 rounded-lg transition-colors">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0" [routerLink]="['/events', event.id]">
                          <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug truncate">{{ event.title }}</h3>
                            @if (event.category) {
                              <span class="badge badge-success py-0 px-1 text-[10px]">{{ event.category.name }}</span>
                            }
                          </div>
                          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mb-1.5">
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="calendarDaysIcon" [size]="12"></lucide-icon>
                              <span>{{ formatEventDate(event.eventDate) }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                              <span>{{ formatEventTime(event.eventDate) }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                              <span class="truncate max-w-xs">{{ event.location }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="usersIcon" [size]="12"></lucide-icon>
                              <span>
                                {{ event.registrationCount }} registered
                                @if (event.capacity) {
                                  / {{ event.capacity }}
                                }
                              </span>
                            </div>
                          </div>
                          @if (event.availableSpots !== null && event.availableSpots !== undefined) {
                            <div class="text-xs font-semibold">
                              @if (event.availableSpots > 0) {
                                <span class="text-emerald-700">{{ event.availableSpots }} spots available</span>
                              } @else {
                                <span class="text-red-600">Event Full</span>
                              }
                            </div>
                          }
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0 self-center">
                          <button class="btn-primary btn-sm" [routerLink]="['/events', event.id]">
                            Register
                          </button>
                          <button class="btn-outline btn-sm" [routerLink]="['/events', event.id]">
                            Details
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
        <div class="py-5 px-4 border-t border-b border-neutral-200/60 bg-neutral-50/30 flex flex-col md:flex-row items-center justify-between gap-4 mt-8 rounded-lg">
          <div>
            <h3 class="text-base font-bold text-neutral-900 mb-0.5">Stay Updated</h3>
            <p class="text-xs text-neutral-500">Subscribe to our newsletter for the latest news and events</p>
          </div>
          <div class="flex gap-2 w-full md:w-auto">
            <input type="email" class="input-field max-w-xs" placeholder="Enter your email">
            <button class="btn-primary">
              Subscribe
            </button>
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
