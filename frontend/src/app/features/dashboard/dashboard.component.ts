import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
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
import { AppImageUrlPipe } from '../../shared/pipes/app-image-url.pipe';
import {
  LucideAngularModule,
  Users, Calendar, MessageSquare, Newspaper,
  ChevronRight, Shield, Star, Edit3, MapPin, Trash2
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule, AppImageUrlPipe],
  template: `
    <div class="min-h-screen bg-white">
      <app-header></app-header>

      <div class="max-w-4xl mx-auto px-2 sm:px-5 pt-20 pb-8 space-y-4">

        <!-- Profile strip with premium layered background and high contrast readable text -->
        <div class="bg-neutral-50/45 border border-neutral-200/50 rounded-lg p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 text-base font-bold text-primary-700 border border-primary-200/40">
            {{ getInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-base font-bold text-neutral-900">{{ user()?.firstName }} {{ user()?.lastName }}</h1>
              <span class="text-xs font-bold px-2 py-0.5 rounded border" [class]="getRoleBadgeClass()">{{ getPrimaryRole() }}</span>
            </div>
            <div class="flex items-center gap-3.5 mt-1 flex-wrap text-xs text-neutral-500">
              <span class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full inline-block" [class]="getStatusDotClass()"></span>
                {{ user()?.status || 'Pending' }}
              </span>
              <span class="text-neutral-300">|</span>
              <span>Member since {{ user()?.createdAt ? formatDate(user()!.createdAt.toString()) : '–' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto mt-3 sm:mt-0">
            @if (isAdmin()) {
              <a routerLink="/admin"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white rounded hover:bg-neutral-800 transition-colors w-full sm:w-auto justify-center shadow-sm">
                <lucide-icon [img]="shieldIcon" [size]="12"></lucide-icon>
                Admin Panel
              </a>
            }
            @if ((isAlumni() || isContentCreator()) && !isAdmin()) {
              <a routerLink="/submit-content"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white rounded hover:bg-neutral-800 transition-colors w-full sm:w-auto justify-center shadow-sm">
                <lucide-icon [img]="editIcon" [size]="12"></lucide-icon>
                Submit Content
              </a>
            }
          </div>
        </div>

        <!-- Stats row inside premium cardless layered containers -->
        <div class="bg-neutral-50/45 border border-neutral-200/50 rounded-lg p-2.5 flex gap-3 overflow-x-auto whitespace-nowrap hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0 min-w-[140px] sm:flex-1">
            <div class="w-9 h-9 bg-secondary-50 text-secondary-700 rounded flex items-center justify-center shrink-0 border border-secondary-200/40">
              <lucide-icon [img]="usersIcon" [size]="15"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900 leading-none">{{ alumniCount() !== null ? alumniCount() : '–' }}</p>
              <p class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">Alumni</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0 min-w-[140px] sm:flex-1">
            <div class="w-9 h-9 bg-primary-50 text-primary-700 rounded flex items-center justify-center shrink-0 border border-primary-200/40">
              <lucide-icon [img]="calendarIcon" [size]="15"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900 leading-none">{{ eventsCount() !== null ? eventsCount() : '–' }}</p>
              <p class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">Events</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0 min-w-[140px] sm:flex-1">
            <div class="w-9 h-9 bg-purple-50 text-purple-700 rounded flex items-center justify-center shrink-0 border border-purple-200/40">
              <lucide-icon [img]="forumIcon" [size]="15"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900 leading-none">{{ forumsCount() !== null ? forumsCount() : '–' }}</p>
              <p class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">Discussions</p>
            </div>
          </div>
        </div>

        <!-- Content grid with minimized gaps and layered shade backgrounds -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Upcoming Events -->
          <div class="flex flex-col bg-neutral-50/40 border border-neutral-200/50 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div class="flex items-center justify-between pb-2.5 border-b border-neutral-200/50 mb-3.5">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-950">Upcoming Events</h2>
              <a routerLink="/news-events" class="text-xs font-bold text-primary-700 hover:text-primary-950 flex items-center gap-0.5 transition-colors">
                View all <lucide-icon [img]="chevronIcon" [size]="11"></lucide-icon>
              </a>
            </div>
            @if (isLoading()) {
              <div class="space-y-3">
                @for (i of [1,2,3]; track i) {
                  <div class="animate-pulse flex gap-3.5 bg-white border border-neutral-200/30 rounded p-2.5">
                    <div class="w-10 h-10 bg-neutral-100 rounded shrink-0"></div>
                    <div class="flex-1 space-y-1.5 pt-1">
                      <div class="h-3 bg-neutral-100 rounded w-3/4"></div>
                      <div class="h-2.5 bg-neutral-100 rounded w-1/2"></div>
                    </div>
                  </div>
                }
              </div>
            }
            @if (!isLoading() && upcomingEvents().length === 0) {
              <div class="py-8 text-center bg-white border border-neutral-200/30 rounded">
                <p class="text-xs text-neutral-400">No upcoming events scheduled</p>
              </div>
            }
            @if (!isLoading() && upcomingEvents().length > 0) {
              <div class="space-y-2.5">
                @for (event of upcomingEvents(); track event.id) {
                  <a [routerLink]="['/events', event.slug]" class="flex items-center gap-3.5 p-2.5 bg-white border border-neutral-200/30 rounded hover:border-primary-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.015)] group transition-all">
                    <div class="w-10 h-10 bg-primary-50 rounded flex flex-col items-center justify-center shrink-0 border border-primary-200/40">
                      <span class="text-[9px] font-bold text-primary-700 uppercase tracking-wider leading-none">{{ formatEventMonth(event.eventDate) }}</span>
                      <span class="text-sm font-bold text-primary-950 leading-none mt-0.5">{{ formatEventDay(event.eventDate) }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 truncate transition-colors leading-snug">{{ event.title }}</p>
                      <p class="text-xs text-neutral-400 truncate mt-1 flex items-center gap-1">
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
          <div class="flex flex-col bg-neutral-50/40 border border-neutral-200/50 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div class="flex items-center justify-between pb-2.5 border-b border-neutral-200/50 mb-3.5">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-950">Forum Discussions</h2>
              <a routerLink="/forums" class="text-xs font-bold text-primary-700 hover:text-primary-950 flex items-center gap-0.5 transition-colors">
                View all <lucide-icon [img]="chevronIcon" [size]="11"></lucide-icon>
              </a>
            </div>
            @if (isLoading()) {
              <div class="space-y-3">
                @for (i of [1,2,3,4]; track i) {
                  <div class="animate-pulse space-y-2 p-2.5 bg-white border border-neutral-200/30 rounded">
                    <div class="h-3 bg-neutral-100 rounded w-4/5"></div>
                    <div class="h-2.5 bg-neutral-100 rounded w-2/5"></div>
                  </div>
                }
              </div>
            }
            @if (!isLoading() && recentTopics().length === 0) {
              <div class="py-8 text-center bg-white border border-neutral-200/30 rounded">
                <p class="text-xs text-neutral-400">No discussions yet</p>
              </div>
            }
            @if (!isLoading() && recentTopics().length > 0) {
              <div class="space-y-2.5">
                @for (topic of recentTopics(); track topic.id) {
                  <a routerLink="/forums" class="block p-2.5 bg-white border border-neutral-200/30 rounded hover:border-primary-200 hover:shadow-[0_1px_3px_rgba(0,0,0,0.015)] group transition-all">
                    <p class="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 truncate transition-colors leading-snug">{{ topic.title }}</p>
                    <p class="text-xs text-neutral-400 mt-1">
                      {{ topic.createdBy.firstName }} {{ topic.createdBy.lastName }} · {{ topic.postCount }} {{ topic.postCount === 1 ? 'reply' : 'replies' }}
                    </p>
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <!-- My Submissions (only for non-admin users) -->
        @if (!isAdmin()) {
          <div class="bg-neutral-50/40 border border-neutral-200/50 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mt-1">
            <div class="flex items-center justify-between pb-2.5 border-b border-neutral-200/50 mb-3.5">
              <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-950">My Submissions</h2>
              <a routerLink="/submit-content" class="text-xs font-bold text-primary-700 hover:text-primary-950 flex items-center gap-0.5 transition-colors">
                + Submit Content
              </a>
            </div>
            
            @if (isLoadingSubmissions()) {
              <div class="animate-pulse space-y-3">
                <div class="h-10 bg-white border border-neutral-200/30 rounded p-2.5"></div>
              </div>
            } @else if (mySubmissions().length === 0) {
              <div class="py-6 text-center bg-white border border-neutral-200/30 rounded">
                <p class="text-xs text-neutral-400">You haven't submitted any content yet.</p>
                <a routerLink="/submit-content" class="text-xs font-semibold text-primary-700 hover:underline mt-1 inline-block">
                  Submit your first post
                </a>
              </div>
            } @else {
              <div class="space-y-2.5">
                @for (item of mySubmissions(); track item.id) {
                  <div class="flex items-center justify-between p-2.5 bg-white border border-neutral-200/30 rounded hover:shadow-[0_1px_3px_rgba(0,0,0,0.015)] transition-all">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        @if ($any(item.status) === 2 || item.status === 'Published' || $any(item.status) === 1 || item.status === 'PendingReview') {
                          <a [routerLink]="['/news', item.slug]" class="text-sm font-semibold text-neutral-850 hover:text-primary-700 hover:underline truncate leading-snug">
                            {{ item.title }}
                          </a>
                        } @else {
                          <p class="text-sm font-semibold text-neutral-850 truncate leading-snug">{{ item.title }}</p>
                        }

                        @if ($any(item.status) === 0 || item.status === 'Draft') {
                          @if (item.rejectionReason) {
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100">Rejected</span>
                          } @else {
                            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-50 text-neutral-600 border border-neutral-200">Draft</span>
                          }
                        }
                        @if ($any(item.status) === 1 || item.status === 'PendingReview') {
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Review</span>
                        }
                        @if ($any(item.status) === 2 || item.status === 'Published') {
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200">Approved</span>
                        }
                      </div>
                      <p class="text-xs text-neutral-400">
                        {{ item.category.name }} · Submitted on {{ formatDate(item.createdAt.toString()) }}
                      </p>
                      @if (($any(item.status) === 0 || item.status === 'Draft') && item.rejectionReason) {
                        <p class="text-[11px] text-red-650 bg-red-50/50 rounded border border-red-100 p-2 mt-1.5 leading-normal">
                          <strong>Feedback:</strong> {{ item.rejectionReason }}
                        </p>
                      }
                    </div>
                    <div class="ml-3 shrink-0 flex items-center gap-1.5">
                      <a routerLink="/submit-content" [queryParams]="{ editId: item.id }" 
                        class="px-2.5 py-1 text-xs font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 rounded bg-white transition-colors">
                        Edit
                      </a>
                      <button (click)="deleteDraft(item.id)" 
                        class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-neutral-200 transition-colors flex items-center justify-center" title="Delete Submission">
                        <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Latest News inside premium cardless layered containers -->
        <div class="bg-neutral-50/40 border border-neutral-200/50 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] mt-1">
          <div class="flex items-center justify-between pb-2.5 border-b border-neutral-200/50 mb-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-neutral-950">Latest News</h2>
            <a routerLink="/news-events" class="text-xs font-bold text-primary-700 hover:text-primary-950 flex items-center gap-0.5 transition-colors">
              View all <lucide-icon [img]="chevronIcon" [size]="11"></lucide-icon>
            </a>
          </div>
          @if (isLoading()) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (i of [1,2,3]; track i) {
                <div class="animate-pulse bg-white border border-neutral-200/30 rounded p-3 space-y-3">
                  <div class="h-24 bg-neutral-100 rounded"></div>
                  <div class="h-3 bg-neutral-100 rounded w-full"></div>
                  <div class="h-2.5 bg-neutral-100 rounded w-1/2"></div>
                </div>
              }
            </div>
          }
          @if (!isLoading() && recentNews().length === 0) {
            <div class="py-8 text-center bg-white border border-neutral-200/30 rounded">
              <p class="text-xs text-neutral-400">No news articles published yet</p>
            </div>
          }
          @if (!isLoading() && recentNews().length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (article of recentNews(); track article.id) {
                <a [routerLink]="['/news', article.slug]" class="group bg-white border border-neutral-200/30 hover:border-primary-200 rounded p-3 hover:shadow-[0_1px_3px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between">
                  <div>
                    @if (article.thumbnailUrl) {
                      <div class="w-full h-24 rounded overflow-hidden mb-2.5 bg-neutral-50 border border-neutral-100/60 shrink-0">
                        <img [src]="article.thumbnailUrl | appImageUrl" [alt]="article.title" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      </div>
                    }
                    @if (!article.thumbnailUrl) {
                      <div class="w-full h-24 rounded bg-neutral-50 border border-neutral-100/60 flex items-center justify-center mb-2.5 shrink-0">
                        <lucide-icon [img]="newsIcon" [size]="18" class="text-neutral-300"></lucide-icon>
                      </div>
                    }
                    <p class="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 line-clamp-2 transition-colors leading-snug">{{ article.title }}</p>
                  </div>
                  <p class="text-xs text-neutral-400 mt-2.5 shrink-0 pt-2 border-t border-neutral-100/60">
                    {{ article.author.firstName }} {{ article.author.lastName }} · {{ formatShortDate(article.publishedAt || article.createdAt) }}
                  </p>
                </a>
              }
            </div>
          }
        </div>

      </div>
      
      @if (showOnboardingWizard()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-[2px] p-4">
          <div class="bg-white rounded border border-neutral-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="p-6 sm:p-8">
              <div class="w-10 h-10 bg-primary-50 border border-primary-200/40 rounded flex items-center justify-center mb-5 text-primary-700">
                <lucide-icon [img]="starIcon" [size]="20"></lucide-icon>
              </div>
              <h2 class="text-xl font-bold text-neutral-950 mb-1">Welcome to IHCAE Alumni!</h2>
              <p class="text-sm text-neutral-500 mb-6">Complete your profile details to connect with the network. This will only take a moment.</p>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Current Job Title</label>
                  <input type="text" #jobInput class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:border-primary-700 outline-none transition-colors" placeholder="e.g. Mountain Guide / Officer">
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Current Location</label>
                  <input type="text" #locationInput class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:border-primary-700 outline-none transition-colors" placeholder="e.g. Gangtok, Sikkim">
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Short Bio</label>
                  <textarea #bioInput class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:border-primary-700 outline-none transition-colors h-20 resize-none" placeholder="Brief intro about your journey..."></textarea>
                </div>
              </div>
            </div>
            <div class="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-neutral-200/60">
              <button (click)="skipOnboarding()" class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-950 transition-colors">Skip</button>
              <button (click)="saveOnboarding(jobInput.value, locationInput.value, bioInput.value)" class="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-primary-700 hover:bg-primary-800 text-white rounded transition-colors shadow-sm">Save Profile</button>
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
  private router = inject(Router);

  user = signal<User | null>(null);
  showOnboardingWizard = signal(false);
  profileData = signal<ProfileData | null>(null);
  isLoading = signal(true);
  isLoadingSubmissions = signal(false);
  upcomingEvents = signal<EventSummary[]>([]);
  recentNews = signal<NewsArticleSummary[]>([]);
  recentTopics = signal<TopicSummaryDto[]>([]);
  mySubmissions = signal<NewsArticleSummary[]>([]);
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
  readonly trashIcon = Trash2;

  deleteDraft(id: number): void {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    this.newsService.deleteArticle(id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Deleted', 'Draft deleted successfully.');
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error deleting draft:', err);
        this.notificationService.showError('Error', 'Failed to delete draft.');
      }
    });
  }

  ngOnInit() {
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
        
        // Redirect Admin and Content Creators to Admin Console
        const roles = authState.user.roles || [];
        if (roles.includes('Admin') || roles.includes('ContentCreator')) {
          this.router.navigate(['/admin']);
          return;
        }
      }
    });
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    const currentUser = this.authStore.currentUser;
    const isUserAdmin = currentUser?.roles?.includes('Admin') || false;

    if (currentUser && !isUserAdmin) {
      this.isLoadingSubmissions.set(true);
      this.newsService.getMyArticles().subscribe({
        next: (articles) => {
          this.mySubmissions.set(articles);
          this.isLoadingSubmissions.set(false);
        },
        error: (err) => {
          console.error('Error loading my submissions for dashboard:', err);
          this.isLoadingSubmissions.set(false);
        }
      });
    }

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
    const currentUser = this.authStore.currentUser;
    const isAlumni = currentUser?.roles?.includes('Alumni') || false;
    if (!isAlumni) return;

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
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  formatDate(dateString: any): string {
    if (!dateString) return '';
    let d = typeof dateString === 'string' ? new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z') : new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(d);
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
    if (roles.includes('Admin')) return 'bg-purple-50 text-purple-700 border-purple-200/40';
    if (roles.includes('ContentCreator')) return 'bg-secondary-50 text-secondary-700 border-secondary-200/40';
    return 'bg-primary-50 text-primary-700 border-primary-200/40';
  }

  getStatusDotClass(): string {
    const status = this.user()?.status;
    if (status === 'Approved') return 'bg-primary-600';
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

