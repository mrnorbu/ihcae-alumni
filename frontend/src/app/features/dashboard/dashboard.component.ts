import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { UserAuthStore } from '../../core/state/user-auth.store';
import { NotificationService } from '../../core/services/notification.service';
import { EventsService } from '../news-events/services/events.service';
import { NewsService } from '../news-events/services/news.service';
import { ForumService } from '../forums/services/forum.service';
import { DirectoryService } from '../directory/services/directory.service';
import { ProfileService, ProfileData } from '../profile/services/profile.service';
import { User, TopicSummaryDto } from '../../shared/models';
import type { EventSummary, NewsArticleSummary } from '../news-events/models';
import { HeaderComponent, FooterComponent } from '../../shared/components';
import {
  LucideAngularModule,
  Users, Calendar, MessageSquare, Newspaper,
  ChevronRight, Shield, Star, Edit3, MapPin
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-header></app-header>

      <div class="max-w-4xl mx-auto px-4 sm:px-5 pt-20 pb-10">

        <!-- Profile strip -->
        <div class="bg-white border border-slate-100 rounded-xl p-4 mb-3 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-base font-bold text-green-700">
            {{ getInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-base font-bold text-slate-900">{{ user()?.firstName }} {{ user()?.lastName }}</h1>
              <span class="text-sm font-medium px-2 py-0.5 rounded-full" [class]="getRoleBadgeClass()">{{ getPrimaryRole() }}</span>
            </div>
            <div class="flex items-center gap-3 mt-0.5 flex-wrap">
              <span class="text-sm text-slate-500 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full inline-block" [class]="getStatusDotClass()"></span>
                {{ user()?.status || 'Pending' }}
              </span>
              <span class="text-sm text-slate-400">Member since {{ user()?.createdAt ? formatDate(user()!.createdAt.toString()) : '–' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            @if (isAdmin()) {
              <a routerLink="/admin"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
                <lucide-icon [img]="shieldIcon" [size]="12"></lucide-icon>
                Admin Panel
              </a>
            }
            @if (isAlumni() && !isAdmin()) {
              <a routerLink="/content-management"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-800 transition-colors">
                <lucide-icon [img]="starIcon" [size]="12"></lucide-icon>
                Share Story
              </a>
            }
            @if (isContentCreator() && !isAdmin()) {
              <a routerLink="/content-management"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-slate-200 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-800 transition-colors">
                <lucide-icon [img]="editIcon" [size]="12"></lucide-icon>
                Manage Content
              </a>
            }
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <lucide-icon [img]="usersIcon" [size]="16" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-slate-900 leading-none">{{ alumniCount() !== null ? alumniCount() : '–' }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Alumni Members</p>
            </div>
          </div>
          <div class="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <lucide-icon [img]="calendarIcon" [size]="16" class="text-amber-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-slate-900 leading-none">{{ eventsCount() !== null ? eventsCount() : '–' }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Upcoming Events</p>
            </div>
          </div>
          <div class="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
              <lucide-icon [img]="forumIcon" [size]="16" class="text-violet-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-slate-900 leading-none">{{ forumsCount() !== null ? forumsCount() : '–' }}</p>
              <p class="text-sm text-slate-500 mt-0.5">Forum Discussions</p>
            </div>
          </div>
        </div>

        <!-- Content grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

          <!-- Upcoming Events -->
          <div class="bg-white border border-slate-100 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-semibold text-slate-900">Upcoming Events</h2>
              <a routerLink="/news-events" class="text-sm text-green-700 hover:underline flex items-center gap-0.5">
                View all <lucide-icon [img]="chevronIcon" [size]="12"></lucide-icon>
              </a>
            </div>
            @if (isLoading()) {
              <div class="space-y-3">
                @for (i of [1,2,3]; track i) {
                  <div class="animate-pulse flex gap-2.5">
                    <div class="w-10 h-10 bg-slate-100 rounded-lg shrink-0"></div>
                    <div class="flex-1 space-y-1.5 pt-0.5">
                      <div class="h-3 bg-slate-100 rounded w-3/4"></div>
                      <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                }
              </div>
            }
            @if (!isLoading() && upcomingEvents().length === 0) {
              <p class="text-sm text-slate-400 py-4 text-center">No upcoming events</p>
            }
            @if (!isLoading() && upcomingEvents().length > 0) {
              <div class="space-y-2.5">
                @for (event of upcomingEvents(); track event.id) {
                  <a [routerLink]="['/events', event.id]" class="flex items-start gap-2.5 group">
                    <div class="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex flex-col items-center justify-center shrink-0">
                      <span class="text-base font-semibold text-amber-600 uppercase leading-none">{{ formatEventMonth(event.eventDate) }}</span>
                      <span class="text-base font-bold text-amber-700 leading-none">{{ formatEventDay(event.eventDate) }}</span>
                    </div>
                    <div class="flex-1 min-w-0 pt-0.5">
                      <p class="text-sm font-semibold text-slate-800 group-hover:text-green-700 truncate transition-colors">{{ event.title }}</p>
                      <p class="text-sm text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <lucide-icon [img]="mapPinIcon" [size]="11"></lucide-icon>
                        {{ event.location }}
                      </p>
                    </div>
                  </a>
                }
              </div>
            }
          </div>

          <!-- Forum Discussions -->
          <div class="bg-white border border-slate-100 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-semibold text-slate-900">Forum Discussions</h2>
              <a routerLink="/forums" class="text-sm text-green-700 hover:underline flex items-center gap-0.5">
                View all <lucide-icon [img]="chevronIcon" [size]="12"></lucide-icon>
              </a>
            </div>
            @if (isLoading()) {
              <div class="space-y-3">
                @for (i of [1,2,3,4]; track i) {
                  <div class="animate-pulse space-y-1.5">
                    <div class="h-3 bg-slate-100 rounded w-4/5"></div>
                    <div class="h-3 bg-slate-100 rounded w-2/5"></div>
                  </div>
                }
              </div>
            }
            @if (!isLoading() && recentTopics().length === 0) {
              <p class="text-sm text-slate-400 py-4 text-center">No discussions yet</p>
            }
            @if (!isLoading() && recentTopics().length > 0) {
              <div class="space-y-3">
                @for (topic of recentTopics(); track topic.id) {
                  <a routerLink="/forums" class="block group">
                    <p class="text-sm font-semibold text-slate-800 group-hover:text-green-700 line-clamp-1 transition-colors">{{ topic.title }}</p>
                    <p class="text-sm text-slate-400 mt-0.5">
                      {{ topic.createdBy.firstName }} {{ topic.createdBy.lastName }} · {{ topic.postCount }} {{ topic.postCount === 1 ? 'reply' : 'replies' }}
                    </p>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <!-- Recent News -->
        <div class="bg-white border border-slate-100 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-semibold text-slate-900">Latest News</h2>
            <a routerLink="/news-events" class="text-sm text-green-700 hover:underline flex items-center gap-0.5">
              View all <lucide-icon [img]="chevronIcon" [size]="12"></lucide-icon>
            </a>
          </div>
          @if (isLoading()) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              @for (i of [1,2,3]; track i) {
                <div class="animate-pulse space-y-2">
                  <div class="h-20 bg-slate-100 rounded-lg"></div>
                  <div class="h-3 bg-slate-100 rounded w-full"></div>
                  <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              }
            </div>
          }
          @if (!isLoading() && recentNews().length === 0) {
            <p class="text-sm text-slate-400 py-4 text-center">No news articles yet</p>
          }
          @if (!isLoading() && recentNews().length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              @for (article of recentNews(); track article.id) {
                <a [routerLink]="['/news', article.id]" class="group block">
                  @if (article.thumbnailUrl) {
                    <div class="w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-100">
                      <img [src]="article.thumbnailUrl" [alt]="article.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  }
                  @if (!article.thumbnailUrl) {
                    <div class="w-full h-24 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
                      <lucide-icon [img]="newsIcon" [size]="20" class="text-slate-300"></lucide-icon>
                    </div>
                  }
                  <p class="text-sm font-semibold text-slate-800 group-hover:text-green-700 line-clamp-2 transition-colors leading-snug">{{ article.title }}</p>
                  <p class="text-sm text-slate-400 mt-0.5">
                    {{ article.author.firstName }} {{ article.author.lastName }} · {{ formatShortDate(article.publishedAt || article.createdAt) }}
                  </p>
                </a>
              }
            </div>
          }
        </div>

      </div>
      
      @if (showOnboardingWizard()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div class="p-6 sm:p-8">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <lucide-icon [img]="starIcon" [size]="24" class="text-green-600"></lucide-icon>
              </div>
              <h2 class="text-2xl font-bold text-slate-900 mb-2">Welcome to IHCAE Alumni!</h2>
              <p class="text-slate-600 mb-6">Let's complete your profile so fellow alumni can connect with you. This will only take a moment.</p>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Current Job Title</label>
                  <input type="text" #jobInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="e.g. Software Engineer at Tech Corp">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                  <input type="text" #locationInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all" placeholder="e.g. Sikkim, India">
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Short Bio</label>
                  <textarea #bioInput class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all h-24 resize-none" placeholder="Tell us a bit about what you're doing now..."></textarea>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button (click)="skipOnboarding()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Skip for now</button>
              <button (click)="saveOnboarding(jobInput.value, locationInput.value, bioInput.value)" class="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">Save Profile</button>
            </div>
          </div>
        </div>
      }

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private eventsService = inject(EventsService);
  private newsService = inject(NewsService);
  private forumService = inject(ForumService);
  private directoryService = inject(DirectoryService);
  private profileService = inject(ProfileService);

  user = signal<User | null>(null);
  showOnboardingWizard = signal(false);
  profileData = signal<ProfileData | null>(null);
  isLoading = signal(true);
  upcomingEvents = signal<EventSummary[]>([]);
  recentNews = signal<NewsArticleSummary[]>([]);
  recentTopics = signal<TopicSummaryDto[]>([]);
  alumniCount = signal<number | null>(null);
  eventsCount = signal<number | null>(null);
  forumsCount = signal<number | null>(null);

  readonly shieldIcon = Shield;
  readonly starIcon = Star;
  readonly editIcon = Edit3;
  readonly usersIcon = Users;
  readonly calendarIcon = Calendar;
  readonly forumIcon = MessageSquare;
  readonly newsIcon = Newspaper;
  readonly chevronIcon = ChevronRight;
  readonly mapPinIcon = MapPin;

  ngOnInit() {
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
      }
    });
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    forkJoin({
      events: this.eventsService.getUpcomingEvents(1, 3).pipe(catchError(() => of({ items: [], totalCount: 0 } as any))),
      news: this.newsService.getPublishedArticles(1, 3).pipe(catchError(() => of({ items: [], totalCount: 0 } as any))),
      topics: this.forumService.getTopics(1, 4).pipe(catchError(() => of({ items: [], totalCount: 0 } as any))),
      alumni: this.directoryService.getAlumniDirectory({ pageSize: 1 }).pipe(catchError(() => of({ items: [], totalCount: 0 } as any)))
    }).subscribe({
      next: (results) => {
        this.upcomingEvents.set(results.events.items);
        this.eventsCount.set(results.events.totalCount);
        this.recentNews.set(results.news.items);
        this.recentTopics.set(results.topics.items);
        this.forumsCount.set(results.topics.totalCount);
        this.alumniCount.set(results.alumni.totalCount);
        this.isLoading.set(false);
        this.checkOnboarding();
      },
      error: () => {
        this.isLoading.set(false);
        this.checkOnboarding();
      }
    });
  }

  
  checkOnboarding() {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileData.set(profile);
        if (!profile.jobTitle || !profile.location) {
          this.showOnboardingWizard.set(true);
        }
      }
    });
  }

  skipOnboarding() {
    this.showOnboardingWizard.set(false);
  }

  saveOnboarding(jobTitle: string, location: string, bio: string) {
    if (!jobTitle && !location) {
      this.skipOnboarding();
      return;
    }
    
    this.isLoading.set(true);
    this.profileService.updateProfile({ jobTitle, location, bio }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Profile Updated', 'Your profile is now complete!');
        this.showOnboardingWizard.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to update profile.');
        this.isLoading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.showSuccess('Logged out successfully', 'You have been logged out');
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.notificationService.showError('Logout failed', 'An error occurred during logout');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  formatShortDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatEventMonth(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }

  formatEventDay(date: Date | string): string {
    return new Date(date).getDate().toString();
  }

  getInitials(): string {
    const u = this.user();
    return ((u?.firstName || '').charAt(0) + (u?.lastName || '').charAt(0)).toUpperCase();
  }

  getPrimaryRole(): string {
    const roles = this.user()?.roles || [];
    if (roles.includes('Admin')) return 'Admin';
    if (roles.includes('ContentCreator')) return 'Content Creator';
    return 'Alumni';
  }

  getRoleBadgeClass(): string {
    const roles = this.user()?.roles || [];
    if (roles.includes('Admin')) return 'bg-violet-100 text-violet-700';
    if (roles.includes('ContentCreator')) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  }

  getStatusDotClass(): string {
    const status = this.user()?.status;
    if (status === 'Approved') return 'bg-green-500';
    if (status === 'Rejected') return 'bg-red-500';
    return 'bg-amber-400';
  }

  isAdmin(): boolean {
    return this.user()?.roles?.includes('Admin') || false;
  }

  isAlumni(): boolean {
    return this.user()?.roles?.includes('Alumni') || false;
  }

  isContentCreator(): boolean {
    return this.user()?.roles?.includes('ContentCreator') || false;
  }
}
