import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { User, UserStatus } from '../../../shared/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation Header -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <a routerLink="/admin" class="text-gray-600 hover:text-gray-900 transition-colors mr-4">
                ← Back to Admin Dashboard
              </a>
              <h1 class="text-xl font-display text-primary-800">User Management</h1>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-700">
                {{ user()?.firstName }} {{ user()?.lastName }}
              </div>
              <button 
                (click)="logout()"
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-display text-gray-900 mb-2">
                  User Management
                </h2>
                <p class="text-gray-600">
                  Manage user accounts, approve registrations, and update user roles.
                </p>
              </div>
              <div class="flex space-x-3">
                <button 
                  (click)="refreshUsers()"
                  class="btn-secondary"
                  [disabled]="isLoading()"
                >
                  <svg *ngIf="isLoading()" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="filterUsers()"
                  placeholder="Search by name or email..."
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  [(ngModel)]="statusFilter"
                  (ngModelChange)="filterUsers()"
                  class="input-field"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  [(ngModel)]="roleFilter"
                  (ngModelChange)="filterUsers()"
                  class="input-field"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Alumnus">Alumnus</option>
                  <option value="Trainee">Trainee</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  [(ngModel)]="sortBy"
                  (ngModelChange)="sortUsers()"
                  class="input-field"
                >
                  <option value="createdAt">Registration Date</option>
                  <option value="lastLoginAt">Last Login</option>
                  <option value="firstName">Name</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let user of filteredUsers()" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span class="text-sm font-medium text-primary-600">
                              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.firstName }} {{ user.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getStatusClass(user.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ user.roles.join(', ') }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="user.emailVerified ? 'text-green-600' : 'text-red-600'" class="text-sm">
                        {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button
                          *ngIf="user.status === 'Pending'"
                          (click)="approveUser(user)"
                          class="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          *ngIf="user.status === 'Approved'"
                          (click)="suspendUser(user)"
                          class="text-yellow-600 hover:text-yellow-900 transition-colors"
                        >
                          Suspend
                        </button>
                        <button
                          (click)="rejectUser(user)"
                          class="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          (click)="editUser(user)"
                          class="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div *ngIf="filteredUsers().length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">{{ filteredUsers().length }}</span> of <span class="font-medium">{{ filteredUsers().length }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UserManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);

  user = signal<User | null>(null);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(false);

  searchTerm = '';
  statusFilter = '';
  roleFilter = '';
  sortBy = 'createdAt';

  ngOnInit() {
    // Get current user from auth store
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
        this.loadUsers();
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

  loadUsers() {
    this.isLoading.set(true);
    // TODO: Implement API call to get users
    // For now, using mock data
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@ihcae.edu',
        status: UserStatus.Approved,
        emailVerified: true,
        createdAt: new Date('2025-10-10T09:54:54.780127'),
        lastLoginAt: new Date(),
        roles: ['Admin']
      },
      {
        id: '2',
        firstName: 'Frontend',
        lastName: 'Test',
        email: 'frontendtest@example.com',
        status: UserStatus.Pending,
        emailVerified: false,
        createdAt: new Date('2025-10-10T10:15:00.000000'),
        lastLoginAt: undefined,
        roles: ['Alumnus']
      },
      {
        id: '3',
        firstName: 'Email',
        lastName: 'Test',
        email: 'testemail@example.com',
        status: UserStatus.Pending,
        emailVerified: false,
        createdAt: new Date('2025-10-10T10:05:00.000000'),
        lastLoginAt: undefined,
        roles: ['Trainee']
      }
    ];
    
    this.users.set(mockUsers);
    this.filteredUsers.set(mockUsers);
    this.isLoading.set(false);
  }

  refreshUsers() {
    this.loadUsers();
  }

  filterUsers() {
    let filtered = this.users();

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }

    if (this.roleFilter) {
      filtered = filtered.filter(user => user.roles.includes(this.roleFilter));
    }

    this.filteredUsers.set(filtered);
  }

  sortUsers() {
    const users = [...this.filteredUsers()];
    users.sort((a, b) => {
      switch (this.sortBy) {
        case 'firstName':
          return a.firstName.localeCompare(b.firstName);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'lastLoginAt':
          if (!a.lastLoginAt && !b.lastLoginAt) return 0;
          if (!a.lastLoginAt) return 1;
          if (!b.lastLoginAt) return -1;
          return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
        default:
          return 0;
      }
    });
    this.filteredUsers.set(users);
  }

  getStatusClass(status: UserStatus): string {
    switch (status) {
      case UserStatus.Approved:
        return 'bg-green-100 text-green-800';
      case UserStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case UserStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case UserStatus.Suspended:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  approveUser(user: User) {
    // TODO: Implement API call to approve user
    this.notificationService.showSuccess('User Approved', `${user.firstName} ${user.lastName} has been approved`);
    this.loadUsers();
  }

  suspendUser(user: User) {
    // TODO: Implement API call to suspend user
    this.notificationService.showSuccess('User Suspended', `${user.firstName} ${user.lastName} has been suspended`);
    this.loadUsers();
  }

  rejectUser(user: User) {
    // TODO: Implement API call to reject user
    this.notificationService.showSuccess('User Rejected', `${user.firstName} ${user.lastName} has been rejected`);
    this.loadUsers();
  }

  editUser(user: User) {
    // TODO: Implement user editing functionality
    this.notificationService.showInfo('Edit User', `Editing ${user.firstName} ${user.lastName}`);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
