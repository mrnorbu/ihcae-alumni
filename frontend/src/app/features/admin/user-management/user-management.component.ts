import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import {
  LucideAngularModule,
  Users,
  CheckCircle,
  Ban,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  UserCog,
  Mail,
  MailCheck,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-angular';

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  emailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

interface UserStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  bannedUsers: number;
  emailVerifiedUsers: number;
  activeToday: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TitleCasePipe, DatePipe],
  template: `
    <div class="p-4 sm:p-6 space-y-6">

      <!-- Header -->
      <div>
        <h2 class="text-xl font-bold text-neutral-900">User Management</h2>
        <p class="text-sm text-neutral-500 mt-1">Manage platform accounts, security roles, password resets, and bans</p>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        @for (stat of statsCards(); track stat.label) {
          <button (click)="setFilter(stat.filter)"
            class="text-left px-3 py-2.5 rounded-lg border transition-colors"
            [class]="currentFilter() === stat.filter ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 hover:border-neutral-300'">
            <p class="text-lg font-bold" [class]="currentFilter() === stat.filter ? 'text-white' : 'text-neutral-900'">{{ stat.value }}</p>
            <p class="text-xs" [class]="currentFilter() === stat.filter ? 'text-neutral-300' : 'text-neutral-500'">{{ stat.label }}</p>
          </button>
        }
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); onSearch()"
            placeholder="Search by name or email..."
            class="w-full pl-11 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors">
        </div>
        <button (click)="loadUsers()" class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
          <lucide-icon [img]="refreshIcon" [size]="14"></lucide-icon>
          Refresh
        </button>
      </div>

      <!-- Users table -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center">
            <div class="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p class="text-sm text-neutral-500 mt-3">Loading users...</p>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="p-12 text-center">
            <lucide-icon [img]="usersIcon" [size]="32" class="mx-auto text-neutral-300"></lucide-icon>
            <p class="text-sm text-neutral-500 mt-3">No users found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50">
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Verified</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Roles</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Registered</th>
                  <th class="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                @for (user of paginatedUsers(); track user.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <!-- User info -->
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          [class]="user.isBanned ? 'bg-red-100' : 'bg-neutral-100'">
                          <span class="text-xs font-semibold" [class]="user.isBanned ? 'text-red-600' : 'text-neutral-600'">
                            {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                          </span>
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-neutral-900 truncate">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-neutral-500 truncate">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                     <!-- Status -->
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-primary-100 text-primary-700': user.status === 'Approved' && !user.isBanned,
                          'bg-red-100 text-red-700': user.status === 'Rejected' || user.isBanned,
                          'bg-neutral-100 text-neutral-600': !['Approved','Rejected'].includes(user.status)
                        }">
                        {{ user.isBanned ? 'Banned' : (user.status | titlecase) }}
                      </span>
                    </td>
                    <!-- Email verified -->
                    <td class="px-4 py-3">
                      @if (user.emailVerified) {
                        <lucide-icon [img]="mailCheckIcon" [size]="16" class="text-primary-600"></lucide-icon>
                      } @else {
                        <lucide-icon [img]="mailIcon" [size]="16" class="text-neutral-300"></lucide-icon>
                      }
                    </td>
                    <!-- Roles -->
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        @for (role of user.roles; track role) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                            [ngClass]="{
                              'bg-purple-100 text-purple-700': role === 'Admin',
                              'bg-secondary-100 text-secondary-700': role === 'Alumni',
                              'bg-neutral-100 text-neutral-600': role !== 'Admin' && role !== 'Alumni'
                            }">
                            {{ role }}
                          </span>
                        }
                      </div>
                    </td>
                    <!-- Registered -->
                    <td class="px-4 py-3">
                      <span class="text-xs text-neutral-500">{{ user.createdAt | date:'mediumDate' }}</span>
                    </td>
                    <!-- Actions -->
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        @if (user.status === 'Approved') {
                          @if (!user.isBanned) {
                            <button (click)="openBanModal(user)" title="Ban user"
                              class="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors">
                              <lucide-icon [img]="banIcon" [size]="14"></lucide-icon>
                            </button>
                          } @else {
                            <button (click)="unbanUser(user)" title="Unban user"
                              class="p-1.5 rounded text-primary-600 hover:bg-primary-50 transition-colors">
                              <lucide-icon [img]="checkIcon" [size]="14"></lucide-icon>
                            </button>
                          }
                        }
                        <button (click)="triggerPasswordReset(user)" title="Send password reset"
                          class="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="keyIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="openRoleModal(user)" title="Manage roles"
                          class="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="userCogIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="openDetailModal(user)" title="View details"
                          class="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <p class="text-xs text-neutral-500">
                Showing {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, filteredUsers().length) }} of {{ filteredUsers().length }}
              </p>
              <div class="flex items-center gap-1">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                  class="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <lucide-icon [img]="chevronLeftIcon" [size]="14"></lucide-icon>
                </button>
                <span class="px-3 py-1 text-xs text-neutral-600">Page {{ currentPage() }} of {{ totalPages() }}</span>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                  class="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <lucide-icon [img]="chevronRightIcon" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Ban Modal -->
      @if (showBanModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div class="bg-white rounded-lg w-full max-w-md border border-neutral-200">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div class="flex items-center gap-2">
                <lucide-icon [img]="alertTriangleIcon" [size]="18" class="text-red-500"></lucide-icon>
                <h3 class="text-sm font-bold text-neutral-900">Ban User</h3>
              </div>
              <button (click)="closeBanModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="px-5 py-4 space-y-3">
              <p class="text-sm text-neutral-600">
                Ban <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>? They will be unable to log in.
              </p>
              <div>
                <label class="block text-xs font-medium text-neutral-600 mb-1">Reason for ban (optional)</label>
                <textarea [(ngModel)]="banReason" rows="3" placeholder="Provide a reason..."
                  class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
              <button (click)="closeBanModal()" class="px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Cancel</button>
              <button (click)="confirmBan()"
                class="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Ban User</button>
            </div>
          </div>
        </div>
      }

      <!-- Role Modal -->
      @if (showRoleModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div class="bg-white rounded-lg w-full max-w-md border border-neutral-200">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 class="text-sm font-bold text-neutral-900">Manage Roles</h3>
              <button (click)="closeRoleModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="px-5 py-4 space-y-3">
              <p class="text-sm text-neutral-600">
                Roles for <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>
              </p>
              <div class="space-y-2">
                @for (role of availableRoles; track role) {
                  <label class="flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors"
                    [class]="editRoles.includes(role) ? 'border-primary-600 bg-primary-50/20' : 'border-neutral-200 hover:border-neutral-300'">
                    <input type="checkbox" [checked]="editRoles.includes(role)" (change)="toggleRole(role)"
                      class="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500">
                    <div>
                      <span class="text-sm font-medium text-neutral-900">{{ role }}</span>
                      <p class="text-xs text-neutral-500">
                        @if (role === 'Admin') { Full administrative access }
                        @else if (role === 'Alumni') { Alumni network access }
                        @else if (role === 'ContentCreator') { Can create content }
                        @else { Standard user }
                      </p>
                    </div>
                  </label>
                }
              </div>
            </div>
            <div class="flex justify-end gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
              <button (click)="closeRoleModal()" class="px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Cancel</button>
              <button (click)="saveRoles()"
                class="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">Save Roles</button>
            </div>
          </div>
        </div>
      }

      <!-- Detail Modal -->
      @if (showDetailModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div class="bg-white rounded-lg w-full max-w-lg border border-neutral-200">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 class="text-sm font-bold text-neutral-900">User Details</h3>
              <button (click)="closeDetailModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="px-5 py-4 space-y-4">
              @if (selectedUser(); as u) {
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    [class]="u.isBanned ? 'bg-red-100' : 'bg-neutral-100'">
                    <span class="text-lg font-semibold" [class]="u.isBanned ? 'text-red-600' : 'text-neutral-600'">
                      {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-neutral-900">{{ u.firstName }} {{ u.lastName }}</p>
                    <p class="text-xs text-neutral-500">{{ u.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Status</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.isBanned ? 'Banned' : (u.status | titlecase) }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Email Verified</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.emailVerified ? 'Yes' : 'No' }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Registered</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Last Updated</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.updatedAt | date:'mediumDate' }}</p>
                  </div>
                </div>
                <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                  <p class="text-xs text-neutral-500 mb-1">Roles</p>
                  <div class="flex flex-wrap gap-1">
                    @for (role of u.roles; track role) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        [ngClass]="{
                          'bg-purple-100 text-purple-700': role === 'Admin',
                          'bg-secondary-100 text-secondary-700': role === 'Alumni',
                          'bg-neutral-200 text-neutral-600': role !== 'Admin' && role !== 'Alumni'
                        }">
                        {{ role }}
                      </span>
                    }
                    @if (u.roles.length === 0) {
                      <span class="text-xs text-neutral-400">No roles assigned</span>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-end px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
              <button (click)="closeDetailModal()" class="px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  readonly usersIcon = Users;
  readonly checkIcon = CheckCircle;
  readonly banIcon = Ban;
  readonly shieldIcon = Shield;
  readonly searchIcon = Search;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly eyeIcon = Eye;
  readonly keyIcon = KeyRound;
  readonly userCogIcon = UserCog;
  readonly mailIcon = Mail;
  readonly mailCheckIcon = MailCheck;
  readonly xIcon = X;
  readonly alertTriangleIcon = AlertTriangle;
  readonly refreshIcon = RefreshCw;

  Math = Math;

  allUsers = signal<UserRecord[]>([]);
  stats = signal<UserStats>({ totalUsers: 0, pendingUsers: 0, approvedUsers: 0, rejectedUsers: 0, bannedUsers: 0, emailVerifiedUsers: 0, activeToday: 0 });
  isLoading = signal(true);
  currentFilter = signal('all');
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 20;

  selectedUser = signal<UserRecord | null>(null);
  showBanModal = signal(false);
  showRoleModal = signal(false);
  showDetailModal = signal(false);
  banReason = '';
  editRoles: string[] = [];
  availableRoles = ['Admin', 'Alumni', 'ContentCreator'];

  statsCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Total Accounts', value: s.totalUsers, filter: 'all' },
      { label: 'Approved/Active', value: s.approvedUsers, filter: 'Approved' },
      { label: 'Banned Accounts', value: s.bannedUsers, filter: 'Banned' },
      { label: 'Email Verified', value: s.emailVerifiedUsers, filter: 'Verified' },
      { label: 'Active Today', value: s.activeToday, filter: 'all' }
    ];
  });

  filteredUsers = computed(() => {
    // Filter out users with Pending status entirely on this IT security screen
    let users = this.allUsers().filter(u => u.status !== 'Pending');
    const filter = this.currentFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (filter === 'Approved') users = users.filter(u => u.status === 'Approved' && !u.isBanned);
    else if (filter === 'Banned') users = users.filter(u => u.isBanned);
    else if (filter === 'Verified') users = users.filter(u => u.emailVerified);

    if (query) {
      users = users.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    return users;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/all`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.allUsers.set(response.users || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.showError('Error', 'Failed to load users');
      }
    });
  }

  loadStats() {
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/stats`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats.set(response.stats);
        }
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearch() {
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1);
  }

  openBanModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.banReason = '';
    this.showBanModal.set(true);
  }

  closeBanModal() {
    this.showBanModal.set(false);
    this.selectedUser.set(null);
  }

  confirmBan() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/ban`, { reason: this.banReason }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Banned', `${user.firstName} ${user.lastName} has been banned`);
        this.closeBanModal();
        this.loadUsers();
        this.loadStats();
      },
      error: () => this.notificationService.showError('Error', 'Failed to ban user')
    });
  }

  unbanUser(user: UserRecord) {
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/unban`, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Unbanned', `${user.firstName} ${user.lastName} has been unbanned`);
        this.loadUsers();
        this.loadStats();
      },
      error: () => this.notificationService.showError('Error', 'Failed to unban user')
    });
  }

  triggerPasswordReset(user: UserRecord) {
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/trigger-password-reset`, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password Reset', `Password reset email sent to ${user.email}`);
      },
      error: () => this.notificationService.showError('Error', 'Failed to send password reset email')
    });
  }

  openRoleModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.editRoles = [...(user.roles || [])];
    this.showRoleModal.set(true);
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedUser.set(null);
  }

  toggleRole(role: string) {
    const idx = this.editRoles.indexOf(role);
    if (idx >= 0) {
      this.editRoles.splice(idx, 1);
    } else {
      this.editRoles.push(role);
    }
  }

  saveRoles() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.put(`${environment.apiUrl}/api/v1/admin/users/${user.id}/roles`, { roles: this.editRoles }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Roles Updated', `Roles updated for ${user.firstName} ${user.lastName}`);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: () => this.notificationService.showError('Error', 'Failed to update roles')
    });
  }

  openDetailModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedUser.set(null);
  }
}
