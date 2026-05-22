import { Component, inject, OnInit, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { UserAuthStore } from '../../core/state/user-auth.store';
import { HeaderComponent, FooterComponent } from '../../shared/components';
import { NewsService } from '../news-events/services/news.service';
import { EventsService } from '../news-events/services/events.service';
import type { NewsArticleSummary, EventSummary } from '../news-events/models';
import { 
  LucideAngularModule, 
  Mountain, 
  Heart, 
  Globe, 
  ArrowRight, 
  Newspaper, 
  Briefcase, 
  ChevronDown,
  Sparkles,
  Users,
  Award,
  Calendar,
  MapPin,
  Clock
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white page-fade-in">
      <app-header></app-header>

      <!-- Hero Section - Compact -->
      <section class="relative py-12 md:py-16 flex items-center justify-center overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0">
          <img src="images/home.jpg" alt="Mountain Climbing Expedition" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/45"></div>
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-4">
          <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl md:text-5xl text-white font-bold mb-3 leading-tight tracking-tight">
              IHCAE Alumni Network
            </h1>
            <p class="text-base md:text-lg text-white/90 mb-5 leading-relaxed font-light">
              Where Adventure Meets Purpose. Connect, Explore, and Lead the Future of Sustainable Tourism.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a 
                routerLink="/register" 
                class="btn-primary inline-flex items-center gap-2 hover:bg-primary-700 transition-colors"
              >
                <span>Join Our Community</span>
                <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
              </a>
              <a 
                href="#about" 
                class="btn-outline text-white border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm inline-flex items-center gap-2"
              >
                <span>Explore Our Mission</span>
                <lucide-icon [img]="chevronIcon" [size]="16"></lucide-icon>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- News Section - Compact -->
      <section id="news" class="py-6 md:py-8 bg-white border-b border-neutral-100">
        <div class="container-compact">
          <div class="text-center mb-4">
            <div class="inline-flex items-center gap-1.5 mb-1.5">
              <lucide-icon [img]="newsIcon" [size]="20" class="text-primary-600"></lucide-icon>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                Latest News & Stories
              </h2>
            </div>
            <p class="text-sm text-neutral-500 max-w-2xl mx-auto font-normal">
              Stay updated with achievements, conservation efforts, and adventures from our global alumni community.
            </p>
          </div>

          @if (isLoadingNews()) {
            <div class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          } @else if (latestNews().length === 0) {
            <div class="text-center py-8">
              <p class="text-neutral-500">No news articles available at the moment.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              @for (article of latestNews(); track article.id) {
                <article class="group cursor-pointer p-1.5 rounded-lg hover:bg-neutral-50/50 transition-colors" [routerLink]="['/news', article.id]">
                  <div class="aspect-video w-full rounded overflow-hidden mb-2 relative bg-neutral-100 flex items-center justify-center">
                    @if (article.thumbnailUrl) {
                      <img 
                        [src]="article.thumbnailUrl" 
                        [alt]="article.title" 
                        class="w-full h-full object-cover"
                        (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling.style.display='flex'"
                      >
                    }
                    <div 
                      [style.display]="article.thumbnailUrl ? 'none' : 'flex'"
                      class="w-full h-full bg-primary-50 text-primary-700/80 flex items-center justify-center"
                    >
                      <lucide-icon [img]="newsIcon" [size]="36"></lucide-icon>
                    </div>
                  </div>
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-xs font-semibold tracking-wider uppercase text-primary-700">
                        {{ article.category.name || 'News' }}
                      </span>
                      <span class="text-xs text-neutral-300">•</span>
                      <span class="text-xs text-neutral-400">{{ formatDate(article.publishedAt) }}</span>
                    </div>
                    <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors mt-1 leading-snug">
                      {{ article.title }}
                    </h3>
                    <p class="text-sm text-neutral-500 leading-relaxed line-clamp-3 mt-1">
                      {{ article.excerpt }}
                    </p>
                  </div>
                </article>
              }
            </div>
          }

          <div class="text-center mt-4">
            <a 
              routerLink="/news-events" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>Read All News & Events</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Events Section - Compact -->
      <section id="events" class="py-6 md:py-8 bg-neutral-50/30 border-b border-neutral-100">
        <div class="container-compact">
          <div class="text-center mb-4">
            <div class="inline-flex items-center gap-1.5 mb-1.5">
              <lucide-icon [img]="calendarIcon" [size]="20" class="text-primary-600"></lucide-icon>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                Upcoming Events
              </h2>
            </div>
            <p class="text-sm text-neutral-500 max-w-2xl mx-auto font-normal">
              Join our upcoming events and connect with the IHCAE community.
            </p>
          </div>

          @if (isLoadingEvents()) {
            <div class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          } @else if (upcomingEvents().length === 0) {
            <div class="text-center py-8">
              <p class="text-neutral-500">No upcoming events at the moment.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              @for (event of upcomingEvents(); track event.id) {
                <div class="group cursor-pointer py-2.5 border-b border-neutral-200/60 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors" [routerLink]="['/events', event.id]">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-secondary-50 text-secondary-700 rounded flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-secondary-100">
                      <lucide-icon [img]="calendarIcon" [size]="18"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm md:text-base font-bold text-neutral-900 group-hover:text-primary-700 transition-colors mb-0.5 line-clamp-2 leading-snug">{{ event.title }}</h3>
                      <div class="flex flex-col gap-0.5 mt-1 text-xs text-neutral-500">
                        <div class="flex items-center gap-1.5">
                          <lucide-icon [img]="clockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          <span>{{ formatEventDate(event.eventDate) }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <lucide-icon [img]="mapPinIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          <span class="truncate">{{ event.location }}</span>
                        </div>
                      </div>
                      <div class="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100">
                        <span class="text-xs text-neutral-400">
                          @if (event.capacity) {
                            {{ event.registrationCount }} / {{ event.capacity }} registered
                          } @else {
                            {{ event.registrationCount }} registered
                          }
                        </span>
                        <span class="text-xs font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">Register →</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <div class="text-center mt-4">
            <a 
              routerLink="/news-events" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Events</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Jobs Section - Compact -->
      <section id="jobs" class="py-6 md:py-8 bg-white border-b border-neutral-100">
        <div class="container-compact">
          <div class="text-center mb-4">
            <div class="inline-flex items-center gap-1.5 mb-1.5">
              <lucide-icon [img]="briefcaseIcon" [size]="20" class="text-primary-600"></lucide-icon>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                Explore Jobs
              </h2>
            </div>
            <p class="text-sm text-neutral-500 max-w-2xl mx-auto font-normal">
              Discover exciting opportunities in adventure tourism, mountain guiding, and conservation across the Himalayas.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            <!-- Job Card 1 -->
            <div class="py-2.5 border-b border-neutral-200/60 hover:bg-neutral-50/50 px-2 rounded-lg transition-all group">
              <div class="flex items-start justify-between gap-3 mb-1.5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-50 text-primary-700 rounded flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary-100">
                    <lucide-icon [img]="mountainIcon" [size]="18" class="text-primary-700"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug">Senior Mountain Guide</h3>
                    <p class="text-sm text-neutral-500 mt-0.5">Sikkim Adventure Tours</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">Full-time</span>
              </div>
              <p class="text-sm text-neutral-500 mb-2 leading-relaxed">
                Lead high-altitude expeditions in the Eastern Himalayas. Requires advanced certification and 5+ years of guiding experience.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                  Gangtok, Sikkim
                </span>
                <a 
                  routerLink="/jobs" 
                  class="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>

            <!-- Job Card 2 -->
            <div class="py-2.5 border-b border-neutral-200/60 hover:bg-neutral-50/50 px-2 rounded-lg transition-all group">
              <div class="flex items-start justify-between gap-3 mb-1.5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-amber-50 text-amber-700 rounded flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-amber-100">
                    <lucide-icon [img]="heartIcon" [size]="18" class="text-amber-700"></lucide-icon>
                  </div>
                  <div>
                    <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug">Eco-Tourism Coordinator</h3>
                    <p class="text-sm text-neutral-500 mt-0.5">Sikkim Conservation Foundation</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700">Contract</span>
              </div>
              <p class="text-sm text-neutral-500 mb-2 leading-relaxed">
                Develop sustainable tourism programs that benefit local communities while protecting Sikkim's mountain ecosystems.
              </p>
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                  Gangtok, Sikkim
                </span>
                <a 
                  routerLink="/jobs" 
                  class="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </div>

          <div class="text-center mt-4">
            <a 
              routerLink="/jobs" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Opportunities</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Success Stories Section - Compact -->
      <section id="success-stories" class="py-6 md:py-8 bg-neutral-50/30 border-b border-neutral-100">
        <div class="container-compact">
          <div class="text-center mb-4">
            <div class="inline-flex items-center gap-1.5 mb-1.5">
              <lucide-icon [img]="awardIcon" [size]="20" class="text-primary-600"></lucide-icon>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                Alumni Success Stories
              </h2>
            </div>
            <p class="text-sm text-neutral-500 max-w-2xl mx-auto font-normal">
              Discover inspiring journeys and achievements of our alumni community.
            </p>
          </div>

          @if (isLoadingStories()) {
            <div class="flex justify-center items-center py-8">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          } @else if (successStories().length === 0) {
            <div class="text-center py-8">
              <p class="text-neutral-500">No success stories available at the moment.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
              @for (story of successStories(); track story.id) {
                <div class="group cursor-pointer py-2.5 border-b border-neutral-200/60 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors" [routerLink]="['/news', story.id]">
                  <div class="flex items-start gap-4">
                    <div class="w-16 h-16 bg-primary-50 text-primary-700 rounded overflow-hidden flex items-center justify-center flex-shrink-0 relative transition-colors group-hover:bg-primary-100">
                      @if (story.thumbnailUrl) {
                        <img 
                          [src]="story.thumbnailUrl" 
                          [alt]="story.title" 
                          class="w-full h-full object-cover"
                          (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling.style.display='flex'"
                        >
                        <div style="display: none;" class="absolute inset-0 bg-primary-50 flex items-center justify-center text-primary-700">
                          <lucide-icon [img]="awardIcon" [size]="24"></lucide-icon>
                        </div>
                      } @else {
                        <lucide-icon [img]="awardIcon" [size]="24" class="text-primary-700"></lucide-icon>
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="text-xs font-semibold tracking-wider uppercase text-amber-700 mb-0.5 block">
                        {{ story.category.name || 'Success Story' }}
                      </span>
                      <h3 class="text-base md:text-lg font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug mb-0.5">{{ story.title }}</h3>
                      <p class="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-1.5">
                        {{ story.excerpt }}
                      </p>
                      <span class="text-xs font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">
                        Read Story →
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <div class="text-center mt-4">
            <a 
              routerLink="/success-stories" 
              class="btn-primary inline-flex items-center gap-2"
            >
              <span>View All Success Stories</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- CTA Section - Compact -->
      <section class="py-8 md:py-10 bg-primary-950 relative overflow-hidden">
        <div class="absolute inset-0 bg-black/15"></div>
        <div class="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Ready to Start Your Adventure Tourism Career?
          </h2>
          <p class="text-base text-white/80 mb-5 max-w-2xl mx-auto font-light leading-relaxed">
            Join hundreds of alumni making a difference in adventure tourism, mountain guiding, and conservation across Sikkim and the Eastern Himalayas.
          </p>
          <div class="flex flex-col sm:flex-row gap-2.5 justify-center items-center">
            <a 
              routerLink="/register" 
              class="btn-primary bg-white hover:bg-neutral-100 text-primary-950 inline-flex items-center gap-2 px-5 py-2 transition-colors"
            >
              <span>Join the Network</span>
              <lucide-icon [img]="arrowIcon" [size]="16"></lucide-icon>
            </a>
            <a 
              routerLink="/login" 
              class="btn-outline text-white border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm px-5 py-2 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private authStore = inject(UserAuthStore);
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);

  // Data signals
  latestNews = signal<NewsArticleSummary[]>([]);
  upcomingEvents = signal<EventSummary[]>([]);
  successStories = signal<NewsArticleSummary[]>([]);
  isLoadingNews = signal(true);
  isLoadingEvents = signal(true);
  isLoadingStories = signal(true);

  // Lucide icons
  readonly mountainIcon = Mountain;
  readonly heartIcon = Heart;
  readonly globeIcon = Globe;
  readonly arrowIcon = ArrowRight;
  readonly newsIcon = Newspaper;
  readonly briefcaseIcon = Briefcase;
  readonly chevronIcon = ChevronDown;
  readonly sparklesIcon = Sparkles;
  readonly usersIcon = Users;
  readonly awardIcon = Award;
  readonly calendarIcon = Calendar;
  readonly mapPinIcon = MapPin;
  readonly clockIcon = Clock;

  ngOnInit(): void {
    this.loadLatestNews();
    this.loadUpcomingEvents();
    this.loadSuccessStories();
  }

  private loadLatestNews(): void {
    this.isLoadingNews.set(true);
    this.newsService.getPublishedArticles(1, 3).subscribe({
      next: (result) => {
        this.latestNews.set(result.items);
        this.isLoadingNews.set(false);
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.isLoadingNews.set(false);
      }
    });
  }

  private loadUpcomingEvents(): void {
    this.isLoadingEvents.set(true);
    this.eventsService.getUpcomingEvents(1, 6).subscribe({
      next: (result) => {
        this.upcomingEvents.set(result.items);
        this.isLoadingEvents.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoadingEvents.set(false);
      }
    });
  }

  private loadSuccessStories(): void {
    this.isLoadingStories.set(true);
    this.newsService.getSuccessStories(1, 2).subscribe({
      next: (result) => {
        this.successStories.set(result.items);
        this.isLoadingStories.set(false);
      },
      error: (error) => {
        console.error('Error loading success stories:', error);
        this.isLoadingStories.set(false);
      }
    });
  }

  getCategoryBadgeClass(categorySlug?: string): string {
    const categoryMap: Record<string, string> = {
      'conservation': 'badge-primary',
      'community': 'badge-success',
      'achievement': 'badge-warning',
      'announcement': 'badge-info',
    };
    return categoryMap[categorySlug || ''] || 'badge-primary';
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
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  onImageError(event: Event, fallbackSrc: string): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = fallbackSrc;
    imgElement.onerror = null; // Prevent infinite loop
  }
}
