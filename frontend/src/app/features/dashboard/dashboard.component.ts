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
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Welcome Section - Compact -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {{ user()?.firstName }}!
          </h2>
          <p class="text-gray-600">
            {{ user()?.email }}
          </p>
        </div>

        <!-- Compact Status Bar -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <!-- Account Status -->
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" 
                   [ngClass]="{
                     'bg-green-500': user()?.status === 'Approved',
                     'bg-yellow-500': user()?.status === 'Pending',
                     'bg-red-500': user()?.status === 'Rejected'
                   }"></div>
              <span class="text-sm font-medium text-gray-700">Account:</span>
              <span class="text-sm font-semibold"
                    [ngClass]="{
                      'text-green-600': user()?.status === 'Approved',
                      'text-yellow-600': user()?.status === 'Pending',
                      'text-red-600': user()?.status === 'Rejected'
                    }">
                {{ user()?.status || 'Pending' }}
              </span>
            </div>

            <!-- Email Verification -->
            <div class="flex items-center gap-2">
              <svg *ngIf="user()?.emailVerified" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg *ngIf="!user()?.emailVerified" class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Email:</span>
              <span class="text-sm font-semibold"
                    [ngClass]="{
                      'text-green-600': user()?.emailVerified,
                      'text-red-600': !user()?.emailVerified
                    }">
                {{ user()?.emailVerified ? 'Verified' : 'Unverified' }}
              </span>
            </div>

            <!-- Member Since -->
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="text-sm font-medium text-gray-700">Member since:</span>
              <span class="text-sm font-semibold text-gray-900">
                {{ user()?.createdAt ? formatDate(user()!.createdAt.toString()) : 'N/A' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Admin Access Card (Only for Admins) - Compact -->
        <div *ngIf="isAdmin()" class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold">Admin Panel</h3>
                <p class="text-sm text-purple-100">Manage users and system settings</p>
              </div>
            </div>
            <a routerLink="/admin" class="bg-white text-purple-600 hover:bg-purple-50 font-medium py-2 px-6 rounded-lg transition-colors">
              Open
            </a>
          </div>
        </div>

        <!-- Quick Actions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Share Your Story Card (Alumni) -->
          <div *ngIf="isAlumni() && !isAdmin() && !isContentCreator()" class="bg-gradient-to-br from-amber-500 to-orange-600 overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6 text-white">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium">Share Your Success Story</h3>
                  <p class="text-sm text-amber-100">Inspire others with your achievements</p>
                </div>
              </div>
              <a 
                routerLink="/content-management"
                class="w-full bg-white text-amber-600 hover:bg-amber-50 font-medium py-2 px-4 rounded-lg text-center inline-block transition-colors"
              >
                Submit Your Story
              </a>
            </div>
          </div>

          <!-- Content Management Card (Admin/Content Creator) -->
          <div *ngIf="isContentCreator() || isAdmin()" class="bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6 text-white">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium">Content Management</h3>
                  <p class="text-sm text-blue-100">Create news articles and events</p>
                </div>
              </div>
              <a 
                routerLink="/content-management"
                class="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg text-center inline-block transition-colors"
              >
                Manage Content
              </a>
            </div>
          </div>

          <!-- Community Forums Widget -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Community Forums</h3>
                  <p class="text-sm text-gray-500">Connect with fellow alumni</p>
                </div>
              </div>
              <div class="flex gap-2">
                <a 
                  routerLink="/forums"
                  class="flex-1 btn-primary text-center inline-block"
                >
                  Browse Forums
                </a>
                <a 
                  routerLink="/forums/create"
                  class="flex-1 btn-outline text-center inline-block"
                >
                  Start Discussion
                </a>
              </div>
            </div>
          </div>

          <!-- News & Events Widget -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">News & Events</h3>
                  <p class="text-sm text-gray-500">Stay updated with IHCAE</p>
                </div>
              </div>
              <div class="flex gap-2">
                <a 
                  routerLink="/news-events"
                  class="flex-1 btn-primary text-center inline-block"
                >
                  View All
                </a>
                <a 
                  routerLink="/success-stories"
                  class="flex-1 btn-outline text-center inline-block"
                >
                  Success Stories
                </a>
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

  isAlumni(): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.includes('Alumni') || false;
  }

  isContentCreator(): boolean {
    const currentUser = this.user();
    return currentUser?.roles?.includes('ContentCreator') || false;
  }
}