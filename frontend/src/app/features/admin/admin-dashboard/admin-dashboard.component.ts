import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  LayoutDashboard, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
  MessageSquare
} from 'lucide-angular';

/**
 * Admin Dashboard Component
 * 
 * Modern, compact admin dashboard with clean sidebar navigation and table-based user management.
 * Features:
 * - Compact sidebar (240px) with Lucide icons
 * - Horizontal stat cards
 * - Tab-based filtering
 * - Clean table view for user management
 * - Modern, professional appearance
 * 
 * @author IHCAE Development Team
 * @version 2.0.0
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <!-- Compact Sidebar -->
      <aside class="sidebar"
             [class.translate-x-0]="sidebarOpen()"
             [class.-translate-x-full]="!sidebarOpen()">
        
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between h-14 px-4 border-b border-neutral-200">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <lucide-icon [img]="checkIcon" [size]="18" [strokeWidth]="2.5" class="text-white"></lucide-icon>
            </div>
            <h1 class="text-base font-bold text-neutral-900">IHCAE Admin</h1>
          </div>
          <button 
            (click)="toggleSidebar()"
            class="p-1 rounded-md hover:bg-neutral-100 transition-colors lg:hidden"
          >
            <lucide-icon [img]="xIcon" [size]="18" class="text-neutral-500"></lucide-icon>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="p-3 space-y-6">
          <!-- Main Section -->
          <div>
            <a href="#" class="sidebar-item sidebar-item-active">
              <lucide-icon [img]="dashboardIcon" [size]="18" [strokeWidth]="2"></lucide-icon>
              <span>Dashboard</span>
            </a>
          </div>

          <!-- User Management Section -->
          <div>
            <h3 class="sidebar-section-title">User Management</h3>
            <div class="space-y-0.5">
              <a href="#" class="sidebar-item">
                <lucide-icon [img]="clockIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>User Approvals</span>
                <span *ngIf="stats().pendingUsers > 0" class="ml-auto badge badge-warning">
                  {{ stats().pendingUsers }}
                </span>
              </a>
              
              <a href="#" class="sidebar-item">
                <lucide-icon [img]="usersIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>All Users</span>
              </a>
            </div>
          </div>

          <!-- Content Management Section -->
          <div>
            <h3 class="sidebar-section-title">Content Management</h3>
            <div class="space-y-0.5">
              <a href="/admin/content" class="sidebar-item">
                <lucide-icon [img]="fileTextIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>News & Events</span>
              </a>
            </div>
          </div>

          <!-- Alumni Directory Section -->
          <div>
            <h3 class="sidebar-section-title">Alumni Directory</h3>
            <div class="space-y-0.5">
              <a href="/admin/alumni" class="sidebar-item">
                <lucide-icon [img]="userCheckIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>Alumni Management</span>
              </a>
            </div>
          </div>

          <!-- Forum Moderation Section -->
          <div>
            <h3 class="sidebar-section-title">Forum Moderation</h3>
            <div class="space-y-0.5">
              <a href="/admin/forums" class="sidebar-item">
                <lucide-icon [img]="messageSquareIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>Forum Management</span>
              </a>
            </div>
          </div>

          <!-- System Section -->
          <div>
            <h3 class="sidebar-section-title">System</h3>
            <div class="space-y-0.5">
              <a href="#" class="sidebar-item">
                <lucide-icon [img]="analyticsIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>Analytics</span>
              </a>
              
              <a href="#" class="sidebar-item">
                <lucide-icon [img]="settingsIcon" [size]="18" [strokeWidth]="2" class="text-neutral-400"></lucide-icon>
                <span>Settings</span>
              </a>
            </div>
          </div>
        </nav>

        <!-- User Profile (Bottom) -->
        <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-neutral-200 bg-white">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-semibold text-neutral-600">
                {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 truncate">
                {{ user()?.firstName }} {{ user()?.lastName }}
              </p>
              <p class="text-xs text-neutral-500 truncate">Administrator</p>
            </div>
            <button 
              (click)="logout()"
              class="p-1.5 rounded-md hover:bg-neutral-100 transition-colors flex-shrink-0"
              title="Logout"
            >
              <lucide-icon [img]="logoutIcon" [size]="16" class="text-neutral-500"></lucide-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile sidebar overlay -->
      <div *ngIf="sidebarOpen()" 
           class="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 transition-opacity lg:hidden"
           (click)="toggleSidebar()">
      </div>

      <!-- Main Content -->
      <div class="lg:pl-60">
        <!-- Top Bar -->
        <header class="sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div class="flex items-center justify-between h-14 px-4 sm:px-6">
            <div class="flex items-center gap-3">
              <button 
                (click)="toggleSidebar()"
                class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 lg:hidden"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <h1 class="text-lg font-semibold text-neutral-900">Dashboard</h1>
            </div>
            <button 
              (click)="refreshData()"
              class="btn-ghost"
              [disabled]="isLoading()"
            >
              <lucide-icon [img]="refreshIcon" [size]="18" 
                           [class.animate-spin]="isLoading()">
              </lucide-icon>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="p-4 sm:p-6 space-y-6">
          <!-- Stats Cards - Horizontal Layout -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Users -->
            <div class="stat-card">
              <div class="stat-card-horizontal">
                <div class="stat-icon bg-blue-100">
                  <lucide-icon [img]="usersIcon" [size]="20" class="text-blue-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium text-neutral-600">Total Users</p>
                  <p class="text-2xl font-bold text-neutral-900">{{ stats().totalUsers }}</p>
                </div>
              </div>
            </div>

            <!-- Pending -->
            <div class="stat-card">
              <div class="stat-card-horizontal">
                <div class="stat-icon bg-warning-100">
                  <lucide-icon [img]="clockIcon" [size]="20" class="text-warning-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium text-neutral-600">Pending</p>
                  <p class="text-2xl font-bold text-neutral-900">{{ stats().pendingUsers }}</p>
                </div>
              </div>
            </div>

            <!-- Approved -->
            <div class="stat-card">
              <div class="stat-card-horizontal">
                <div class="stat-icon bg-success-100">
                  <lucide-icon [img]="checkIcon" [size]="20" class="text-success-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium text-neutral-600">Approved</p>
                  <p class="text-2xl font-bold text-neutral-900">{{ stats().approvedUsers }}</p>
                </div>
              </div>
            </div>

            <!-- Active Today -->
            <div class="stat-card">
              <div class="stat-card-horizontal">
                <div class="stat-icon bg-purple-100">
                  <lucide-icon [img]="trendingIcon" [size]="20" class="text-purple-600"></lucide-icon>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-medium text-neutral-600">Active Today</p>
                  <p class="text-2xl font-bold text-neutral-900">{{ stats().activeToday }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- User Management Card -->
          <div class="card">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-semibold text-neutral-900">User Management</h2>
              <div class="flex items-center gap-2">
                <span class="badge badge-info">{{ getFilterCount('all') }} total</span>
                <span class="badge badge-warning">{{ getFilterCount('pending') }} pending</span>
              </div>
            </div>
            
            <!-- Tab Navigation -->
            <div class="tab-nav mb-4">
              <button
                (click)="setFilter('all')"
                [class.tab-item]="currentFilter() !== 'all'"
                [class.tab-item-active]="currentFilter() === 'all'"
              >
                All Users ({{ getFilterCount('all') }})
              </button>
              <button
                (click)="setFilter('pending')"
                [class.tab-item]="currentFilter() !== 'pending'"
                [class.tab-item-active]="currentFilter() === 'pending'"
              >
                Pending ({{ getFilterCount('pending') }})
              </button>
              <button
                (click)="setFilter('approved')"
                [class.tab-item]="currentFilter() !== 'approved'"
                [class.tab-item-active]="currentFilter() === 'approved'"
              >
                Approved ({{ getFilterCount('approved') }})
              </button>
              <button
                (click)="setFilter('rejected')"
                [class.tab-item]="currentFilter() !== 'rejected'"
                [class.tab-item-active]="currentFilter() === 'rejected'"
              >
                Rejected ({{ getFilterCount('rejected') }})
              </button>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoadingUsers()" class="py-12 text-center">
              <lucide-icon [img]="refreshIcon" [size]="24" class="animate-spin text-primary-600 mx-auto mb-2"></lucide-icon>
              <p class="text-sm text-neutral-600">Loading users...</p>
            </div>

            <!-- Table View -->
            <div *ngIf="!isLoadingUsers()" class="overflow-x-auto">
              <table class="table-compact" *ngIf="getFilteredUsers().length > 0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of getFilteredUsers()">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-xs font-medium text-neutral-600">
                            {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                          </span>
                        </div>
                        <div>
                          <p class="font-medium text-neutral-900">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-neutral-500" *ngIf="user.emailVerified">
                            <lucide-icon [img]="checkIcon" [size]="12" class="inline text-success-600"></lucide-icon> Verified
                          </p>
                          <p class="text-xs text-neutral-500" *ngIf="!user.emailVerified">
                            <lucide-icon [img]="alertIcon" [size]="12" class="inline text-warning-600"></lucide-icon> Unverified
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="text-neutral-600">{{ user.email }}</td>
                    <td>
                      <span *ngIf="user.status === 'Pending'" class="badge badge-warning">Pending</span>
                      <span *ngIf="user.status === 'Approved'" class="badge badge-success">Approved</span>
                      <span *ngIf="user.status === 'Rejected'" class="badge badge-error">Rejected</span>
                    </td>
                    <td class="text-neutral-600 text-xs">{{ formatDate(user.createdAt) }}</td>
                    <td class="text-right">
                      <div class="flex items-center justify-end gap-2" *ngIf="user.status === 'Pending'">
                        <button
                          (click)="approveUser(user)"
                          class="btn-primary btn-sm"
                          [disabled]="isProcessingUser(user.id)"
                        >
                          <lucide-icon *ngIf="!isProcessingUser(user.id)" [img]="checkIcon" [size]="14"></lucide-icon>
                          <lucide-icon *ngIf="isProcessingUser(user.id)" [img]="refreshIcon" [size]="14" class="animate-spin"></lucide-icon>
                          <span>Approve</span>
                        </button>
                        <button
                          (click)="rejectUser(user)"
                          class="btn-outline btn-sm"
                          [disabled]="isProcessingUser(user.id)"
                        >
                          <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
                          <span>Reject</span>
                        </button>
                      </div>
                      <span *ngIf="user.status !== 'Pending'" class="text-xs text-neutral-500">
                        No actions
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div *ngIf="getFilteredUsers().length === 0" class="py-12 text-center">
                <lucide-icon [img]="usersIcon" [size]="48" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
                <h3 class="text-sm font-medium text-neutral-900 mb-1">
                  <span *ngIf="currentFilter() === 'pending'">No pending users</span>
                  <span *ngIf="currentFilter() === 'approved'">No approved users</span>
                  <span *ngIf="currentFilter() === 'rejected'">No rejected users</span>
                  <span *ngIf="currentFilter() === 'all'">No users found</span>
                </h3>
                <p class="text-sm text-neutral-500">
                  <span *ngIf="currentFilter() === 'pending'">All users have been processed.</span>
                  <span *ngIf="currentFilter() === 'approved'">No users have been approved yet.</span>
                  <span *ngIf="currentFilter() === 'rejected'">No users have been rejected.</span>
                  <span *ngIf="currentFilter() === 'all'">No users are registered in the system.</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Approval Modal -->
      <div *ngIf="showApprovalModal()" class="modal-overlay" (click)="closeApprovalModal()">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="modal-content max-w-md w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="checkIcon" [size]="20" class="text-success-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-neutral-900 mb-1">Approve User</h3>
                <p class="text-sm text-neutral-600">
                  Are you sure you want to approve <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
                </p>
                <p class="text-xs text-neutral-500 mt-1">{{ selectedUser()?.email }}</p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2">
              <button (click)="closeApprovalModal()" class="btn-outline">Cancel</button>
              <button (click)="confirmApproval()" class="btn-primary">Approve User</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Rejection Modal -->
      <div *ngIf="showRejectionModal()" class="modal-overlay" (click)="closeRejectionModal()">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="modal-content max-w-md w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="xIcon" [size]="20" class="text-error-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-neutral-900 mb-1">Reject User</h3>
                <p class="text-sm text-neutral-600">
                  Are you sure you want to reject <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
                </p>
                <p class="text-xs text-neutral-500 mt-1">{{ selectedUser()?.email }}</p>
              </div>
            </div>
            <div class="mb-4">
              <label for="rejection-reason" class="input-label">Reason for rejection (optional)</label>
              <textarea
                id="rejection-reason"
                [(ngModel)]="rejectionReason"
                rows="3"
                class="input-field-lg"
                placeholder="Provide a reason for rejection..."
              ></textarea>
            </div>
            <div class="flex items-center justify-end gap-2">
              <button (click)="closeRejectionModal()" class="btn-outline">Cancel</button>
              <button (click)="confirmRejection()" class="btn-primary bg-error-600 hover:bg-error-700">Reject User</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  // Lucide icons
  readonly dashboardIcon = LayoutDashboard;
  readonly usersIcon = Users;
  readonly clockIcon = Clock;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;
  readonly analyticsIcon = BarChart3;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;
  readonly refreshIcon = RefreshCw;
  readonly trendingIcon = TrendingUp;
  readonly alertIcon = AlertCircle;
  readonly fileTextIcon = FileText;
  readonly userCheckIcon = UserCheck;
  readonly messageSquareIcon = MessageSquare;

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
