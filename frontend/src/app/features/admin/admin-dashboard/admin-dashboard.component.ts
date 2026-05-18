import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
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
  AlertCircle
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TitleCasePipe],
  template: `
    <div class="p-4 sm:p-6 space-y-5">

      <!-- Page header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-neutral-900">Dashboard</h2>
          <p class="text-xs text-neutral-500">Overview of your alumni platform</p>
        </div>
        <button (click)="refreshData()" [disabled]="isLoading()"
          class="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50">
          <lucide-icon [img]="refreshIcon" [size]="16" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
            </span>
            <span class="text-xs font-medium text-neutral-500">Total Users</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().totalUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="clockIcon" [size]="16"></lucide-icon>
            </span>
            <span class="text-xs font-medium text-neutral-500">Pending</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().pendingUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="checkIcon" [size]="16"></lucide-icon>
            </span>
            <span class="text-xs font-medium text-neutral-500">Approved</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().approvedUsers }}</span>
        </div>
        <div class="bg-white rounded-lg border border-neutral-200 p-4">
          <div class="flex items-center gap-2.5 mb-2">
            <span class="w-8 h-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <lucide-icon [img]="trendingIcon" [size]="16"></lucide-icon>
            </span>
            <span class="text-xs font-medium text-neutral-500">Active Today</span>
          </div>
          <span class="block text-2xl font-bold text-neutral-900 leading-none">{{ stats().activeToday }}</span>
        </div>
      </div>

      <!-- User management panel -->
      <div class="bg-white rounded-lg border border-neutral-200 p-5">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-sm font-bold text-neutral-900">User Management</h3>
            <p class="text-xs text-neutral-400 mt-0.5">Approve, review and manage member accounts</p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            @for (f of ['all', 'pending', 'approved', 'rejected']; track f) {
              <button (click)="setFilter($any(f))"
                class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                [class.bg-neutral-900]="currentFilter() === f"
                [class.text-white]="currentFilter() === f"
                [class.border-neutral-900]="currentFilter() === f"
                [class.border-neutral-200]="currentFilter() !== f"
                [class.text-neutral-600]="currentFilter() !== f"
                [class.hover:border-neutral-400]="currentFilter() !== f">
                {{ f | titlecase }} ({{ getFilterCount($any(f)) }})
              </button>
            }
          </div>
        </div>

        @if (isLoadingUsers()) {
          <div class="py-10 text-center">
            <lucide-icon [img]="refreshIcon" [size]="20" class="animate-spin text-neutral-300 mx-auto mb-2"></lucide-icon>
            <p class="text-xs text-neutral-400">Loading users...</p>
          </div>
        }

        @if (!isLoadingUsers()) {
          <div class="overflow-x-auto -mx-5">
            @if (getFilteredUsers().length > 0) {
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-y border-neutral-100">
                    <th class="text-left py-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">User</th>
                    <th class="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hidden sm:table-cell">Email</th>
                    <th class="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Status</th>
                    <th class="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 hidden md:table-cell">Registered</th>
                    <th class="text-right py-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-50">
                  @for (user of getFilteredUsers(); track user) {
                    <tr class="hover:bg-neutral-50/50 transition-colors">
                      <td class="py-2.5 px-5">
                        <div class="flex items-center gap-2.5">
                          <div class="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                            <span class="text-[10px] font-semibold text-neutral-600">
                              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                            </span>
                          </div>
                          <div>
                            <p class="text-sm font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</p>
                            @if (user.emailVerified) {
                              <p class="text-[10px] text-green-600 flex items-center gap-0.5">
                                <lucide-icon [img]="checkIcon" [size]="10"></lucide-icon> Verified
                              </p>
                            }
                            @if (!user.emailVerified) {
                              <p class="text-[10px] text-amber-600 flex items-center gap-0.5">
                                <lucide-icon [img]="alertIcon" [size]="10"></lucide-icon> Unverified
                              </p>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="py-2.5 px-3 text-xs text-neutral-500 hidden sm:table-cell">{{ user.email }}</td>
                      <td class="py-2.5 px-3">
                        @if (user.status === 'Pending') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                        }
                        @if (user.status === 'Approved') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">Approved</span>
                        }
                        @if (user.status === 'Rejected') {
                          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">Rejected</span>
                        }
                      </td>
                      <td class="py-2.5 px-3 text-xs text-neutral-400 hidden md:table-cell">{{ formatDate(user.createdAt) }}</td>
                      <td class="py-2.5 px-5 text-right">
                        @if (user.status === 'Pending') {
                          <div class="flex items-center justify-end gap-1.5">
                            <button (click)="approveUser(user)" [disabled]="isProcessingUser(user.id)"
                              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                              @if (isProcessingUser(user.id)) {
                                <lucide-icon [img]="refreshIcon" [size]="12" class="animate-spin"></lucide-icon>
                              }
                              Approve
                            </button>
                            <button (click)="rejectUser(user)" [disabled]="isProcessingUser(user.id)"
                              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200 text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors">
                              Reject
                            </button>
                          </div>
                        }
                        @if (user.status !== 'Pending') {
                          <span class="text-xs text-neutral-300">—</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @if (getFilteredUsers().length === 0) {
              <div class="py-12 text-center">
                <lucide-icon [img]="usersIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
                <p class="text-sm font-medium text-neutral-500">
                  @if (currentFilter() === 'pending') { No pending users }
                  @if (currentFilter() === 'approved') { No approved users }
                  @if (currentFilter() === 'rejected') { No rejected users }
                  @if (currentFilter() === 'all') { No users found }
                </p>
              </div>
            }
          </div>
        }
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
              <h3 class="text-sm font-bold text-neutral-900">Approve User</h3>
              <p class="text-xs text-neutral-600 mt-0.5">
                Approve <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
              </p>
              <p class="text-[11px] text-neutral-400 mt-0.5">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button (click)="closeApprovalModal()" class="px-3.5 py-1.5 rounded-md text-xs border border-neutral-200 text-neutral-600 hover:border-neutral-300 transition-colors">Cancel</button>
            <button (click)="confirmApproval()" class="px-3.5 py-1.5 rounded-md text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">Approve</button>
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
              <h3 class="text-sm font-bold text-neutral-900">Reject User</h3>
              <p class="text-xs text-neutral-600 mt-0.5">
                Reject <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
              </p>
              <p class="text-[11px] text-neutral-400 mt-0.5">{{ selectedUser()?.email }}</p>
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-[11px] font-medium text-neutral-600 mb-1">Reason (optional)</label>
            <textarea [(ngModel)]="rejectionReason" rows="3"
              class="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
              placeholder="Provide a reason for rejection..."></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button (click)="closeRejectionModal()" class="px-3.5 py-1.5 rounded-md text-xs border border-neutral-200 text-neutral-600 hover:border-neutral-300 transition-colors">Cancel</button>
            <button (click)="confirmRejection()" class="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Reject</button>
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
  currentFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
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

  getFilteredUsers() {
    const users = this.allUsers();
    const filter = this.currentFilter();
    
    switch (filter) {
      case 'pending':
        return users.filter(user => user.status === 'Pending');
      case 'approved':
        return users.filter(user => user.status === 'Approved');
      case 'rejected':
        return users.filter(user => user.status === 'Rejected');
      default:
        return users;
    }
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.currentFilter.set(filter);
  }

  getFilterCount(filter: 'all' | 'pending' | 'approved' | 'rejected'): number {
    const users = this.allUsers();
    
    switch (filter) {
      case 'pending':
        return users.filter(user => user.status === 'Pending').length;
      case 'approved':
        return users.filter(user => user.status === 'Approved').length;
      case 'rejected':
        return users.filter(user => user.status === 'Rejected').length;
      default:
        return users.length;
    }
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
