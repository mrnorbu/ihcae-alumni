import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserStatus } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
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
  Upload
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="p-4 sm:p-6 space-y-5">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Dashboard</h2>
          <p class="text-sm text-neutral-500">Overview of your alumni platform</p>
        </div>
        <button (click)="refreshData()" [disabled]="isLoading()"
          class="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50">
          <lucide-icon [img]="refreshIcon" [size]="18" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="usersIcon" [size]="18"></lucide-icon>
            </span>
            <span class="text-sm font-medium text-neutral-500">Total Users</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().totalUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="clockIcon" [size]="18"></lucide-icon>
            </span>
            <span class="text-sm font-medium text-neutral-500">Pending</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().pendingUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="checkIcon" [size]="18"></lucide-icon>
            </span>
            <span class="text-sm font-medium text-neutral-500">Approved</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().approvedUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="trendingIcon" [size]="18"></lucide-icon>
            </span>
            <span class="text-sm font-medium text-neutral-500">Active Today</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().activeToday }}</span>
        </div>
      </div>

      <!-- Pending approvals queue -->
      <div class="bg-white rounded-lg border border-neutral-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-neutral-900">Pending Approvals</h3>
            <p class="text-sm text-neutral-400 mt-0.5">Users waiting for account approval</p>
          </div>
          @if (getPendingUsers().length > 5) {
            <a routerLink="/admin/alumni-hub" class="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
              View all ({{ getPendingUsers().length }})
              <lucide-icon [img]="arrowRightIcon" [size]="14"></lucide-icon>
            </a>
          }
        </div>

        @if (isLoadingUsers()) {
          <div class="py-10 text-center">
            <lucide-icon [img]="refreshIcon" [size]="20" class="animate-spin text-neutral-300 mx-auto mb-2"></lucide-icon>
            <p class="text-sm text-neutral-400">Loading...</p>
          </div>
        }

        @if (!isLoadingUsers()) {
          @if (getPendingUsers().length > 0) {
            <div class="space-y-2.5">
              @for (user of getPendingUsers().slice(0, 5); track user.id) {
                <div class="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <span class="text-xs font-semibold text-neutral-600">
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="text-xs text-neutral-400">{{ user.email }} · {{ formatDate(user.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button (click)="approveUser(user)" [disabled]="isProcessingUser(user.id)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                      @if (isProcessingUser(user.id)) {
                        <lucide-icon [img]="refreshIcon" [size]="14" class="animate-spin"></lucide-icon>
                      }
                      Approve
                    </button>
                    <button (click)="rejectUser(user)" [disabled]="isProcessingUser(user.id)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="py-10 text-center">
              <lucide-icon [img]="checkIcon" [size]="32" class="text-green-300 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-500">No pending approvals</p>
              <p class="text-xs text-neutral-400 mt-0.5">All caught up!</p>
            </div>
          }
        }
      </div>

      <!-- Quick links -->
      <div>
        <h3 class="text-base font-bold text-neutral-900 mb-3">Quick Actions</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <a routerLink="/admin/content" class="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors group">
            <lucide-icon [img]="newspaperIcon" [size]="20" class="text-blue-500 mb-2"></lucide-icon>
            <p class="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700">News & Events</p>
            <p class="text-xs text-neutral-400 mt-0.5">Create articles and events</p>
          </a>
          <a routerLink="/admin/content-review" class="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors group">
            <lucide-icon [img]="userCheckIcon" [size]="20" class="text-green-500 mb-2"></lucide-icon>
            <p class="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700">Story Review</p>
            <p class="text-xs text-neutral-400 mt-0.5">Review alumni success stories</p>
          </a>
          <a routerLink="/admin/forums" class="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors group">
            <lucide-icon [img]="messageSquareIcon" [size]="20" class="text-purple-500 mb-2"></lucide-icon>
            <p class="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700">Forum Moderation</p>
            <p class="text-xs text-neutral-400 mt-0.5">Manage topics and posts</p>
          </a>
          <a routerLink="/admin/alumni-hub" class="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors group">
            <lucide-icon [img]="uploadIcon" [size]="20" class="text-orange-500 mb-2"></lucide-icon>
            <p class="text-sm font-semibold text-neutral-900 group-hover:text-neutral-700">Alumni Hub</p>
            <p class="text-xs text-neutral-400 mt-0.5">Roster imports, verifications, and directory</p>
          </a>
        </div>
      </div>
    </div>

    <!-- Approval modal -->
    @if (showApprovalModal()) {
      <div class="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" (click)="closeApprovalModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <lucide-icon [img]="checkIcon" [size]="18" class="text-green-600"></lucide-icon>
            </div>
            <div>
              <h3 class="text-base font-bold text-neutral-900">Approve User</h3>
              <p class="text-sm text-neutral-600 mt-0.5">
                Approve <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
              </p>
              <p class="text-xs text-neutral-400 mt-0.5">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button (click)="closeApprovalModal()" class="px-4 py-2 rounded-md text-sm border border-neutral-200 text-neutral-600 hover:border-neutral-300 transition-colors">Cancel</button>
            <button (click)="confirmApproval()" class="px-4 py-2 rounded-md text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">Approve</button>
          </div>
        </div>
      </div>
    }

    <!-- Rejection modal -->
    @if (showRejectionModal()) {
      <div class="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" (click)="closeRejectionModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-sm w-full p-5" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <lucide-icon [img]="xIcon" [size]="18" class="text-red-600"></lucide-icon>
            </div>
            <div>
              <h3 class="text-base font-bold text-neutral-900">Reject User</h3>
              <p class="text-sm text-neutral-600 mt-0.5">
                Reject <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
              </p>
              <p class="text-xs text-neutral-400 mt-0.5">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-xs font-medium text-neutral-600 mb-1">Reason (optional)</label>
            <textarea [(ngModel)]="rejectionReason" rows="3"
              class="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
              placeholder="Provide a reason for rejection..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button (click)="closeRejectionModal()" class="px-4 py-2 rounded-md text-sm border border-neutral-200 text-neutral-600 hover:border-neutral-300 transition-colors">Cancel</button>
            <button (click)="confirmRejection()" class="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Reject</button>
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

  user = signal<User | null>(null);
  sidebarOpen = signal(true);
  isLoading = signal(false);
  stats = signal({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    activeToday: 0
  });
  allUsers = signal<any[]>([]);
  processingUsers = signal<Set<string>>(new Set());
  showApprovalModal = signal(false);
  showRejectionModal = signal(false);
  selectedUser = signal<any>(null);
  rejectionReason = '';
  isLoadingUsers = signal(false);

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

  private setProcessingUser(userId: string, isProcessing: boolean) {
    const current = new Set(this.processingUsers());
    if (isProcessing) {
      current.add(userId);
    } else {
      current.delete(userId);
    }
    this.processingUsers.set(current);
  }

  isProcessingUser(userId: string): boolean {
    return this.processingUsers().has(userId);
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
}
