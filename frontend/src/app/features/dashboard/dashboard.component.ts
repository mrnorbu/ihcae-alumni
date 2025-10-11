import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { UserAuthStore } from '../../core/state/user-auth.store';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../shared/models';
import { HeaderComponent, FooterComponent } from '../../shared/components';

/**
 * User Dashboard Component
 * 
 * Clean, minimal dashboard showing only implemented functionality from Epic 1.
 * Features:
 * - User profile information
 * - Account status (pending/approved)
 * - Email verification status
 * - Admin panel access (if admin)
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen bg-white">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Welcome Section -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-2xl font-display text-gray-900 mb-2">
              Welcome back, {{ user()?.firstName }}!
            </h2>
            <p class="text-gray-600">
              Manage your alumni profile and stay connected with the IHCAE community.
            </p>
          </div>
        </div>

        <!-- Account Status Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Account Status -->
              <div class="text-center p-4 rounded-lg border">
                <div class="text-2xl font-bold mb-2" 
                     [ngClass]="{
                       'text-green-600': user()?.status === 'Approved',
                       'text-yellow-600': user()?.status === 'Pending',
                       'text-red-600': user()?.status === 'Rejected'
                     }">
                  {{ user()?.status || 'Pending' }}
                </div>
                <div class="text-sm text-gray-500">Account Status</div>
                <div *ngIf="user()?.status === 'Pending'" class="text-xs text-yellow-600 mt-1">
                  Awaiting admin approval
                </div>
                <div *ngIf="user()?.status === 'Approved'" class="text-xs text-green-600 mt-1">
                  ✓ Account approved
                </div>
                <div *ngIf="user()?.status === 'Rejected'" class="text-xs text-red-600 mt-1">
                  Account rejected
                </div>
              </div>

              <!-- Email Verification -->
              <div class="text-center p-4 rounded-lg border">
                <div class="text-2xl font-bold mb-2" 
                     [ngClass]="{
                       'text-green-600': user()?.emailVerified,
                       'text-red-600': !user()?.emailVerified
                     }">
                  {{ user()?.emailVerified ? 'Verified' : 'Unverified' }}
                </div>
                <div class="text-sm text-gray-500">Email Status</div>
                <div *ngIf="!user()?.emailVerified" class="text-xs text-red-600 mt-1">
                  Please verify your email
                </div>
                <div *ngIf="user()?.emailVerified" class="text-xs text-green-600 mt-1">
                  ✓ Email verified
                </div>
              </div>

              <!-- Member Since -->
              <div class="text-center p-4 rounded-lg border">
                <div class="text-2xl font-bold text-primary-600 mb-2">
                  {{ user()?.createdAt ? formatDate(user()!.createdAt.toString()) : 'N/A' }}
                </div>
                <div class="text-sm text-gray-500">Member Since</div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ user()?.email }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Information Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p class="text-sm text-gray-900">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p class="text-sm text-gray-900">{{ user()?.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-green-100 text-green-800': user()?.status === 'Approved',
                        'bg-yellow-100 text-yellow-800': user()?.status === 'Pending',
                        'bg-red-100 text-red-800': user()?.status === 'Rejected'
                      }">
                  {{ user()?.status || 'Pending' }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Verification</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-green-100 text-green-800': user()?.emailVerified,
                        'bg-red-100 text-red-800': !user()?.emailVerified
                      }">
                  {{ user()?.emailVerified ? 'Verified' : 'Unverified' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Access Card (Only for Admins) -->
        <div *ngIf="isAdmin()" class="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900">Admin Panel</h3>
                <p class="text-sm text-gray-500">Access admin dashboard to manage users and system settings</p>
              </div>
            </div>
            <div class="mt-4">
              <a 
                routerLink="/admin"
                class="w-full btn-primary text-center inline-block"
              >
                Go to Admin Panel
              </a>
            </div>
          </div>
        </div>

        <!-- Next Steps Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
            <div class="space-y-3">
              <div *ngIf="user()?.status === 'Pending'" class="flex items-center p-3 bg-yellow-50 rounded-lg">
                <svg class="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-yellow-800">Account Pending Approval</p>
                  <p class="text-xs text-yellow-600">Your account is awaiting admin approval. You'll receive an email once approved.</p>
                </div>
              </div>
              
              <div *ngIf="!user()?.emailVerified" class="flex items-center p-3 bg-red-50 rounded-lg">
                <svg class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-red-800">Email Not Verified</p>
                  <p class="text-xs text-red-600">Please check your email and click the verification link.</p>
                </div>
              </div>

              <div *ngIf="user()?.status === 'Approved' && user()?.emailVerified" class="flex items-center p-3 bg-green-50 rounded-lg">
                <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-green-800">Account Ready</p>
                  <p class="text-xs text-green-600">Your account is fully set up and ready to use!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);

  user = signal<User | null>(null);

  ngOnInit() {
    // Get current user from auth store
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  isAdmin(): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.includes('Admin') || false;
  }
}