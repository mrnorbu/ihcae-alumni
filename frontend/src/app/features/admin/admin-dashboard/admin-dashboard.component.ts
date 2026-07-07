import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import { NewsService } from '../../news-events/services/news.service';
import { EventsService } from '../../news-events/services/events.service';
import { ForumService } from '../../forums/services/forum.service';
import {
  LucideAngularModule,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Newspaper,
  MessageSquare,
  UserCheck,
  Upload,
  ChevronDown,
  Phone,
  GraduationCap,
  MapPin
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="p-4 sm:p-5 space-y-5 bg-white min-h-screen">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-neutral-950 uppercase tracking-wider">Dashboard</h2>
          <p class="text-xs text-neutral-400 mt-0.5">Overview of the IHCAE alumni platform</p>
        </div>
        <button (click)="refreshData()" [disabled]="isLoading()"
          class="p-2 rounded text-neutral-400 hover:text-neutral-950 hover:bg-neutral-50 transition-colors disabled:opacity-50 border border-neutral-200/60">
          <lucide-icon [img]="refreshIcon" [size]="14" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Summary stats with layered off-white background and premium white stat blocks -->
      <div class="bg-neutral-50/45 border border-neutral-100 rounded-lg p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all">
          <span class="w-9 h-9 rounded bg-secondary-50 text-secondary-700 flex items-center justify-center shrink-0 border border-secondary-200/30">
            <lucide-icon [img]="usersIcon" [size]="15"></lucide-icon>
          </span>
          <div>
            <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().totalUsers }}</span>
            <span class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider block">Total Users</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all">
          <span class="w-9 h-9 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/30">
            <lucide-icon [img]="clockIcon" [size]="15"></lucide-icon>
          </span>
          <div>
            <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().pendingUsers }}</span>
            <span class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider block">Pending</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all">
          <span class="w-9 h-9 rounded bg-primary-50 text-primary-700 flex items-center justify-center shrink-0 border border-primary-200/30">
            <lucide-icon [img]="checkIcon" [size]="15"></lucide-icon>
          </span>
          <div>
            <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().approvedUsers }}</span>
            <span class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider block">Approved</span>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 bg-white border border-neutral-200/30 rounded hover:border-neutral-350 transition-all">
          <span class="w-9 h-9 rounded bg-secondary-50 text-secondary-700 flex items-center justify-center shrink-0 border border-secondary-200/30">
            <lucide-icon [img]="trendingIcon" [size]="15"></lucide-icon>
          </span>
          <div>
            <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().activeToday }}</span>
            <span class="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-wider block">Active Today</span>
          </div>
        </div>
      </div>

      <!-- Pending approvals queue (Layered container panel with crisp white rows inside) -->
      <div class="pb-2">
        <div class="flex items-center justify-between pb-2 border-b border-neutral-100 mb-3">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-950">Pending Approvals</h3>
            <p class="text-xs text-neutral-400">Alumni accounts awaiting validation</p>
          </div>
          @if (getPendingUsers().length > 5) {
            <a routerLink="/admin/alumni-hub" class="inline-flex items-center gap-0.5 text-xs font-bold text-primary-700 hover:text-primary-950 transition-colors">
              View all ({{ getPendingUsers().length }})
              <lucide-icon [img]="arrowRightIcon" [size]="12"></lucide-icon>
            </a>
          }
        </div>

        @if (isLoadingUsers()) {
          <div class="py-6 text-center bg-neutral-50/30 rounded border border-neutral-100">
            <lucide-icon [img]="refreshIcon" [size]="16" class="animate-spin text-neutral-300 mx-auto mb-1"></lucide-icon>
            <p class="text-xs text-neutral-400">Loading directory...</p>
          </div>
        }

        @if (!isLoadingUsers()) {
          @if (getPendingUsers().length > 0) {
            <div class="bg-neutral-50/50 border border-neutral-100 rounded-lg p-2.5 space-y-1.5">
              @for (user of getPendingUsers().slice(0, 5); track user.id) {
                <div class="border border-neutral-200/40 rounded-lg bg-white overflow-hidden transition-all duration-200 hover:border-neutral-400/60 hover:shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <!-- Row header — click to expand details -->
                  <div class="flex items-center justify-between p-3 cursor-pointer" (click)="toggleExpand(user.id)">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-200/40">
                        <span class="text-xs font-bold text-neutral-600">
                          {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-neutral-900 leading-none mb-1">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-xs text-neutral-400">{{ user.email }} · {{ formatDate(user.createdAt) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- Actions -->
                      <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
                        <button (click)="approveUser(user)" [disabled]="isProcessingUser(user.id)"
                          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors">
                          @if (isProcessingUser(user.id)) {
                            <lucide-icon [img]="refreshIcon" [size]="10" class="animate-spin"></lucide-icon>
                          }
                          Approve
                        </button>
                        <button (click)="rejectUser(user)" [disabled]="isProcessingUser(user.id)"
                          class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-neutral-200 text-neutral-600 hover:border-red-600 hover:text-red-700 disabled:opacity-50 transition-colors rounded">
                          Reject
                        </button>
                      </div>
                      <!-- Expand chevron -->
                      <lucide-icon [img]="chevronDownIcon" [size]="14" class="text-neutral-400 transition-transform ml-1"
                        [class.rotate-180]="expandedUserId() === user.id"></lucide-icon>
                    </div>
                  </div>

                  <!-- Expanded Details -->
                  @if (expandedUserId() === user.id) {
                    <div class="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="phoneIcon" [size]="12" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Phone</p>
                          <p class="text-xs font-medium text-neutral-700">{{ user.phone || '—' }}</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="graduationIcon" [size]="12" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Course</p>
                          <p class="text-xs font-medium text-neutral-700 leading-tight">{{ user.course || '—' }}</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="graduationIcon" [size]="12" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Batch</p>
                          <p class="text-xs font-medium text-neutral-700 leading-tight">{{ user.batch || '—' }}</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-2">
                        <lucide-icon [img]="mapPinIcon" [size]="12" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Location</p>
                          <p class="text-xs font-medium text-neutral-700 leading-tight">{{ user.location || '—' }}</p>
                        </div>
                      </div>
                      @if (user.bio) {
                        <div class="col-span-2 sm:col-span-4 flex items-start gap-2">
                          <lucide-icon [img]="usersIcon" [size]="12" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                          <div>
                            <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-0.5">Bio</p>
                            <p class="text-xs font-medium text-neutral-700 leading-relaxed">{{ user.bio }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="py-8 text-center bg-neutral-50/30 rounded border border-dashed border-neutral-200/60">
              <lucide-icon [img]="checkIcon" [size]="24" class="text-primary-700 bg-primary-50 border border-primary-200/40 p-1 rounded-full mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-bold text-neutral-800">No pending approvals</p>
              <p class="text-xs text-neutral-400 mt-0.5">All accounts are fully verified!</p>
            </div>
          }
        }
      </div>

      <!-- Quick Actions (With real-time pending workloads and state-aware border separation) -->
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-950 mb-3 pb-2 border-b border-neutral-100">Quick Actions</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- News & Events Card -->
          <a [routerLink]="pendingNewsCount() + pendingEventsCount() > 0 ? '/admin/content-review' : '/admin/content'"
            [queryParams]="pendingNewsCount() + pendingEventsCount() > 0 ? { tab: pendingEventsCount() > 0 ? 'events' : 'articles' } : null"
            class="relative group flex flex-col p-4 border rounded-lg transition-all"
            [class.border-neutral-200/60]="pendingNewsCount() + pendingEventsCount() === 0"
            [class.bg-neutral-50/40]="pendingNewsCount() + pendingEventsCount() === 0"
            [class.hover:bg-neutral-100/50]="pendingNewsCount() + pendingEventsCount() === 0"
            [class.border-amber-200]="pendingNewsCount() + pendingEventsCount() > 0"
            [class.bg-amber-50/10]="pendingNewsCount() + pendingEventsCount() > 0"
            [class.hover:bg-amber-50/20]="pendingNewsCount() + pendingEventsCount() > 0">
            @if (pendingNewsCount() + pendingEventsCount() > 0) {
              <span class="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 rounded flex items-center gap-1 shrink-0">
                <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                {{ pendingNewsCount() + pendingEventsCount() }} pending
              </span>
            }
            <lucide-icon [img]="newspaperIcon" [size]="16" class="text-secondary-700 mb-2"></lucide-icon>
            <p class="text-sm font-bold text-neutral-950 group-hover:text-primary-700 transition-colors">News & Events</p>
            <p class="text-xs text-neutral-400 mt-1 leading-snug">Create articles and events</p>
          </a>

          <!-- Story Review Card -->
          <a routerLink="/admin/content-review" [queryParams]="{ tab: 'articles', categorySlug: 'success-story' }"
            class="relative group flex flex-col p-4 border rounded-lg transition-all"
            [class.border-neutral-200/60]="pendingStoriesCount() === 0"
            [class.bg-neutral-50/40]="pendingStoriesCount() === 0"
            [class.hover:bg-neutral-100/50]="pendingStoriesCount() === 0"
            [class.border-amber-200]="pendingStoriesCount() > 0"
            [class.bg-amber-50/10]="pendingStoriesCount() > 0"
            [class.hover:bg-amber-50/20]="pendingStoriesCount() > 0">
            @if (pendingStoriesCount() > 0) {
              <span class="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 rounded flex items-center gap-1 shrink-0">
                <span class="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                {{ pendingStoriesCount() }} pending
              </span>
            }
            <lucide-icon [img]="userCheckIcon" [size]="16" class="text-primary-700 mb-2"></lucide-icon>
            <p class="text-sm font-bold text-neutral-950 group-hover:text-primary-700 transition-colors">Story Review</p>
            <p class="text-xs text-neutral-400 mt-1 leading-snug">Review alumni success stories</p>
          </a>

          <!-- Forum Moderation Card -->
          <a routerLink="/admin/forums" class="relative group flex flex-col p-4 border rounded-lg transition-all"
            [class.border-neutral-200/60]="pendingForumFlagsCount() === 0"
            [class.bg-neutral-50/40]="pendingForumFlagsCount() === 0"
            [class.hover:bg-neutral-100/50]="pendingForumFlagsCount() === 0"
            [class.border-red-200]="pendingForumFlagsCount() > 0"
            [class.bg-red-50/10]="pendingForumFlagsCount() > 0"
            [class.hover:bg-red-50/20]="pendingForumFlagsCount() > 0">
            @if (pendingForumFlagsCount() > 0) {
              <span class="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/50 rounded flex items-center gap-1 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                {{ pendingForumFlagsCount() }} flag{{ pendingForumFlagsCount() > 1 ? 's' : '' }}
              </span>
            }
            <lucide-icon [img]="messageSquareIcon" [size]="16" class="text-secondary-700 mb-2"></lucide-icon>
            <p class="text-sm font-bold text-neutral-950 group-hover:text-primary-700 transition-colors">Forum Moderation</p>
            <p class="text-xs text-neutral-400 mt-1 leading-snug">Manage flagged topics and posts</p>
          </a>

          <!-- Pending Approvals Card -->
          <a routerLink="/admin/users" [queryParams]="{tab: 'approvals'}" class="relative group flex flex-col p-4 border rounded-lg transition-all"
            [class.border-neutral-200/60]="stats().pendingUsers === 0"
            [class.bg-neutral-50/40]="stats().pendingUsers === 0"
            [class.hover:bg-neutral-100/50]="stats().pendingUsers === 0"
            [class.border-amber-200]="stats().pendingUsers > 0"
            [class.bg-amber-50/10]="stats().pendingUsers > 0"
            [class.hover:bg-amber-50/20]="stats().pendingUsers > 0">
            @if (stats().pendingUsers > 0) {
              <span class="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 rounded flex items-center gap-1 shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {{ stats().pendingUsers }} pending
              </span>
            }
            <lucide-icon [img]="userCheckIcon" [size]="16" class="text-primary-700 mb-2"></lucide-icon>
            <p class="text-sm font-bold text-neutral-950 group-hover:text-primary-700 transition-colors">Pending Approvals (Users)</p>
            <p class="text-xs text-neutral-400 mt-1 leading-snug">Alumni accounts awaiting validation</p>
          </a>

        </div>
      </div>
    </div>

    <!-- Approval modal -->
    @if (showApprovalModal()) {
      <div class="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center p-4" (click)="closeApprovalModal()">
        <div class="bg-white rounded border border-neutral-200 max-w-sm w-full p-6 shadow-xl animate-in fade-in duration-150" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3.5 mb-5">
            <div class="w-9 h-9 rounded bg-primary-50 border border-primary-200/40 flex items-center justify-center shrink-0 text-primary-700">
              <lucide-icon [img]="checkIcon" [size]="18"></lucide-icon>
            </div>
            <div>
              <h3 class="text-base font-bold text-neutral-950">Approve Account</h3>
              <p class="text-xs text-neutral-500 mt-1 leading-snug">
                Approve <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong> for platform access?
              </p>
              <p class="text-[10px] font-bold text-neutral-400 mt-1">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <button (click)="closeApprovalModal()" class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-900 transition-colors">Cancel</button>
            <button (click)="confirmApproval()" class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white hover:bg-neutral-800 transition-colors">Approve</button>
          </div>
        </div>
      </div>
    }

    <!-- Rejection modal -->
    @if (showRejectionModal()) {
      <div class="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center p-4" (click)="closeRejectionModal()">
        <div class="bg-white rounded border border-neutral-200 max-w-sm w-full p-6 shadow-xl animate-in fade-in duration-150" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3.5 mb-4">
            <div class="w-9 h-9 rounded bg-red-50 border border-red-200/40 flex items-center justify-center shrink-0 text-red-600">
              <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
            </div>
            <div>
              <h3 class="text-base font-bold text-neutral-950">Reject Account</h3>
              <p class="text-xs text-neutral-500 mt-1 leading-snug">
                Reject <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>'s registration?
              </p>
              <p class="text-[10px] font-bold text-neutral-400 mt-1">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="mb-5">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Reason for Rejection</label>
            <textarea [(ngModel)]="rejectionReason" rows="3"
              class="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:border-red-500 outline-none transition-colors resize-none"
              placeholder="e.g. Profile details do not match official registry roster..."></textarea>
          </div>
          <div class="flex justify-end gap-2 border-t border-neutral-100 pt-4">
            <button (click)="closeRejectionModal()" class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-900 transition-colors">Cancel</button>
            <button (click)="confirmRejection()" class="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded transition-colors">Reject Account</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Injected services to count pending workload
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);
  private forumService = inject(ForumService);

  readonly usersIcon = Users;
  readonly clockIcon = Clock;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;
  readonly refreshIcon = RefreshCw;
  readonly trendingIcon = TrendingUp;
  readonly alertIcon = AlertCircle;
  readonly arrowRightIcon = ArrowRight;
  readonly newspaperIcon = Newspaper;
  readonly messageSquareIcon = MessageSquare;
  readonly userCheckIcon = UserCheck;
  readonly uploadIcon = Upload;
  readonly chevronDownIcon = ChevronDown;
  readonly phoneIcon = Phone;
  readonly graduationIcon = GraduationCap;
  readonly mapPinIcon = MapPin;

  user = signal<User | null>(null);
  sidebarOpen = signal(true);
  isLoading = signal(false);
  expandedUserId = signal<number | null>(null);
  stats = signal({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    activeToday: 0
  });
  allUsers = signal<any[]>([]);
  processingUsers = signal<Set<number>>(new Set());
  showApprovalModal = signal(false);
  showRejectionModal = signal(false);
  selectedUser = signal<any>(null);
  rejectionReason = '';
  isLoadingUsers = signal(false);

  // signals for pending workloads per module card
  pendingNewsCount = signal(0);
  pendingEventsCount = signal(0);
  pendingStoriesCount = signal(0);
  pendingForumFlagsCount = signal(0);

  ngOnInit() {
    // Get current user from auth store
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
        this.loadData();
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  refreshData() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);
    this.loadAdminStats();
    this.loadAllUsers();
    this.loadPendingCounts();
  }

  private loadAdminStats() {
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/stats`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats.set(response.stats);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading admin stats:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadAllUsers() {
    this.isLoadingUsers.set(true);
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/all`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.allUsers.set(response.users);
        }
        this.isLoadingUsers.set(false);
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.notificationService.showError('Error', 'Failed to load users');
        this.isLoadingUsers.set(false);
      }
    });
  }

  private loadPendingCounts() {
    // 1. Fetch pending success stories and news articles
    this.newsService.getPendingArticles(1, 100).subscribe({
      next: (result) => {
        const stories = result.items.filter((a: any) =>
          a.category?.name?.toLowerCase().includes('success') ||
          a.category?.slug?.toLowerCase().includes('success')
        );
        const news = result.items.filter((a: any) =>
          !a.category?.name?.toLowerCase().includes('success') &&
          !a.category?.slug?.toLowerCase().includes('success')
        );
        this.pendingStoriesCount.set(stories.length);
        this.pendingNewsCount.set(news.length);
      },
      error: (error) => {
        console.error('Error loading pending articles for stats:', error);
      }
    });

    // 2. Fetch pending events
    this.eventsService.getPendingEvents(1, 100).subscribe({
      next: (result) => {
        this.pendingEventsCount.set(result.items.length);
      },
      error: (error) => {
        console.error('Error loading pending events for stats:', error);
      }
    });

    // 3. Fetch pending forum moderation flags
    this.forumService.getFlags('Pending', 1, 100).subscribe({
      next: (result) => {
        this.pendingForumFlagsCount.set(result.items.length);
      },
      error: (error) => {
        console.error('Error loading pending forum flags for stats:', error);
      }
    });
  }

  toggleExpand(userId: number) {
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
    } else {
      this.expandedUserId.set(userId);
    }
  }

  getPendingUsers() {
    return this.allUsers().filter(user => user.status === 'Pending');
  }

  approveUser(user: any) {
    this.selectedUser.set(user);
    this.showApprovalModal.set(true);
  }

  async confirmApproval() {
    const userId = this.selectedUser()?.id;
    if (!userId) return;

    this.setProcessingUser(userId, true);
    this.closeApprovalModal();
    
    try {
      const response = await this.http.post(`${environment.apiUrl}/api/v1/usermanagement/approve/${userId}`, {}).toPromise();
      
      if ((response as any)?.success) {
        this.notificationService.showSuccess('User Approved', 'User has been approved successfully');
        this.loadAdminStats();
        this.loadAllUsers();
        this.loadPendingCounts();
      } else {
        this.notificationService.showError('Approval Failed', (response as any)?.message || 'Failed to approve user');
      }
    } catch (error: any) {
      console.error('Error approving user:', error);
      this.notificationService.showError('Approval Failed', 'An error occurred while approving the user');
    } finally {
      this.setProcessingUser(userId, false);
    }
  }

  rejectUser(user: any) {
    this.selectedUser.set(user);
    this.rejectionReason = '';
    this.showRejectionModal.set(true);
  }

  async confirmRejection() {
    const userId = this.selectedUser()?.id;
    if (!userId) return;

    this.setProcessingUser(userId, true);
    this.closeRejectionModal();
    
    try {
      const response = await this.http.post(`${environment.apiUrl}/api/v1/usermanagement/reject/${userId}`, {
        reason: this.rejectionReason
      }).toPromise();
      
      if ((response as any)?.success) {
        this.notificationService.showSuccess('User Rejected', 'User has been rejected successfully');
        this.loadAdminStats();
        this.loadAllUsers();
        this.loadPendingCounts();
      } else {
        this.notificationService.showError('Rejection Failed', (response as any)?.message || 'Failed to reject user');
      }
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      this.notificationService.showError('Rejection Failed', 'An error occurred while rejecting the user');
    } finally {
      this.setProcessingUser(userId, false);
    }
  }

  closeApprovalModal() {
    this.showApprovalModal.set(false);
    this.selectedUser.set(null);
  }

  closeRejectionModal() {
    this.showRejectionModal.set(false);
    this.selectedUser.set(null);
    this.rejectionReason = '';
  }

  private setProcessingUser(userId: number, isProcessing: boolean) {
    const current = new Set(this.processingUsers());
    if (isProcessing) {
      current.add(userId);
    } else {
      current.delete(userId);
    }
    this.processingUsers.set(current);
  }

  isProcessingUser(userId: number): boolean {
    return this.processingUsers().has(userId);
  }

  formatDate(date: any): string {
    if (!date) return '';
    let d = typeof date === 'string' ? new Date(date.endsWith('Z') ? date : date + 'Z') : new Date(date);
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
}
