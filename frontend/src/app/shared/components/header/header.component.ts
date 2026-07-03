import { Component, inject, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, User, LogOut, Users, UserCircle, Settings, MessageCircle, Briefcase, Newspaper, FileText } from 'lucide-angular';
import { UserAuthStore, UserAuthState } from '../../../core/state/user-auth.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <!-- Sticky Navigation - Compact -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-200"
      [class.shadow-md]="scrolled">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 flex-shrink-0">
            <img class="h-12 w-auto py-0 my-0" src="images/logo.png" alt="IHCAE Sikkim Logo">
            <div class="hidden md:block">
              <h1 class="text-lg font-bold text-neutral-900 leading-tight">IHCAE Alumni</h1>
              <p class="text-xs text-neutral-600">Sikkim, India</p>
            </div>
          </a>
    
          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-6">
            <!-- Public Navigation (when not authenticated) -->
            @if (!authState.isAuthenticated) {
              <a routerLink="/news-events" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                <lucide-icon [img]="newspaperIcon" [size]="14"></lucide-icon>
                News & Events
              </a>
              <a routerLink="/contact" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">Contact</a>
            }
    
            <!-- Authenticated User Navigation -->
            @if (authState.isAuthenticated) {
              <!-- Common features for all authenticated users -->
              @if (!isAdmin() && !isContentCreator()) {
                <a routerLink="/news-events" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="newspaperIcon" [size]="14"></lucide-icon>
                  News & Events
                </a>
              }
              <!-- Applicant-specific features -->
              @if (isApplicant()) {
                <a routerLink="/resume-builder" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="fileTextIcon" [size]="14"></lucide-icon>
                  Resume Builder
                </a>
              }
              <!-- Alumni-specific features -->
              @if (isAlumni()) {
                <a routerLink="/directory" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
                  Directory
                </a>
                <a routerLink="/forums" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="forumIcon" [size]="16"></lucide-icon>
                  Forums
                </a>
              }
              @if (isAdmin() || isContentCreator()) {
                <a routerLink="/admin" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="settingsIcon" [size]="16"></lucide-icon>
                  Dashboard
                </a>
              } @else {
                <a routerLink="/dashboard" class="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                  <lucide-icon [img]="settingsIcon" [size]="16"></lucide-icon>
                  Dashboard
                </a>
              }
            }
          </div>
    
          <!-- Right Side Actions -->
          <div class="hidden lg:flex items-center gap-2">
            <!-- Public CTA Buttons (when not authenticated) -->
            @if (!authState.isAuthenticated) {
              <a
                routerLink="/login"
                class="btn-ghost text-sm"
                >
                Sign In
              </a>
              <a
                routerLink="/register"
                class="btn-primary btn-sm"
                >
                Join Network
              </a>
            }
    
            <!-- Authenticated User Menu -->
            @if (authState.isAuthenticated) {
              <!-- User Dropdown Menu -->
              <div class="relative" #userMenu>
                <button
                  (click)="toggleUserMenu()"
                  class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors rounded-md hover:bg-neutral-50"
                  >
                  <lucide-icon [img]="userCircleIcon" [size]="18"></lucide-icon>
                  <span class="hidden md:inline">{{ authState.user?.firstName }}</span>
                  <lucide-icon [img]="menuIcon" [size]="14" class="ml-1"></lucide-icon>
                </button>
                <!-- Dropdown Menu -->
                @if (userMenuOpen) {
                  <div
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <div class="px-3 py-2 border-b border-neutral-100">
                      <p class="text-sm font-medium text-neutral-900">{{ authState.user?.firstName }} {{ authState.user?.lastName }}</p>
                      <p class="text-xs text-neutral-500">{{ authState.user?.email }}</p>
                    </div>
                    @if (isAlumni()) {
                      <a routerLink="/profile" (click)="closeUserMenu()" class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <lucide-icon [img]="userIcon" [size]="16"></lucide-icon>
                        My Profile
                      </a>
                    }
                    <a [routerLink]="(isAdmin() || isContentCreator()) ? '/admin' : '/dashboard'" (click)="closeUserMenu()" class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                      <lucide-icon [img]="settingsIcon" [size]="16"></lucide-icon>
                      Dashboard
                    </a>
                    <div class="border-t border-neutral-100 my-1"></div>
                    <button (click)="logout()" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                      <lucide-icon [img]="logoutIcon" [size]="16"></lucide-icon>
                      Sign Out
                    </button>
                  </div>
                }
              </div>
            }
          </div>
    
          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMobileMenu()"
            class="lg:hidden p-2 rounded-md hover:bg-neutral-100 transition-colors"
            >
            <lucide-icon [img]="mobileMenuOpen ? xIcon : menuIcon" [size]="20" class="text-neutral-700"></lucide-icon>
          </button>
        </div>
      </div>
    
      <!-- Mobile Menu -->
      @if (mobileMenuOpen) {
        <div class="lg:hidden border-t border-neutral-200 bg-white">
          <div class="px-4 py-3 space-y-1">
            <!-- Public Mobile Menu (when not authenticated) -->
            @if (!authState.isAuthenticated) {
              <a routerLink="/news-events" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                <lucide-icon [img]="newspaperIcon" [size]="14"></lucide-icon>
                News & Events
              </a>
              <a routerLink="/contact" (click)="toggleMobileMenu()" class="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">Contact</a>
              <div class="pt-3 space-y-2">
                <a routerLink="/login" (click)="toggleMobileMenu()" class="block btn-outline w-full text-center">Sign In</a>
                <a routerLink="/register" (click)="toggleMobileMenu()" class="block btn-primary w-full text-center">Join Network</a>
              </div>
            }
            <!-- Authenticated Mobile Menu -->
            @if (authState.isAuthenticated) {
              <div class="px-3 py-2 border-b border-neutral-100 mb-2">
                <p class="text-sm font-medium text-neutral-900">{{ authState.user?.firstName }} {{ authState.user?.lastName }}</p>
                <p class="text-xs text-neutral-500">{{ authState.user?.email }}</p>
                <p class="text-xs text-primary-600 font-medium">{{ getUserRole() }}</p>
              </div>
              <!-- Common features for all authenticated users -->
              @if (!isAdmin() && !isContentCreator()) {
                <a routerLink="/news-events" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="newspaperIcon" [size]="14"></lucide-icon>
                  News & Events
                </a>
              }
              <!-- Applicant-specific features -->
              @if (isApplicant()) {
                <a routerLink="/resume-builder" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="fileTextIcon" [size]="14"></lucide-icon>
                  Resume Builder
                </a>
              }
              <!-- Alumni-specific features -->
              @if (isAlumni()) {
                <a routerLink="/profile" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="userIcon" [size]="16"></lucide-icon>
                  My Profile
                </a>
                <a routerLink="/directory" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
                  Alumni Directory
                </a>
                <a routerLink="/forums" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="forumIcon" [size]="16"></lucide-icon>
                  Community Forums
                </a>
              }
              @if (isAdmin() || isContentCreator()) {
                <a routerLink="/admin" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="settingsIcon" [size]="16"></lucide-icon>
                  Dashboard
                </a>
              } @else {
                <a routerLink="/dashboard" (click)="toggleMobileMenu()" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors">
                  <lucide-icon [img]="settingsIcon" [size]="16"></lucide-icon>
                  Dashboard
                </a>
              }
              <div class="pt-3">
                <button (click)="logout()" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left rounded-md">
                  <lucide-icon [img]="logoutIcon" [size]="16"></lucide-icon>
                  Sign Out
                </button>
              </div>
            }
          </div>
        </div>
      }
    </nav>
    `,
  styles: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Dependency injection
  private authStore = inject(UserAuthStore);
  
  // Component state
  scrolled = false;
  mobileMenuOpen = false;
  userMenuOpen = false;
  
  // Authentication state
  authState: UserAuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false
  };
  
  // Subscription for auth state changes
  private authSubscription?: Subscription;
  
  // Lucide icons
  readonly menuIcon = Menu;
  readonly xIcon = X;
  readonly userIcon = User;
  readonly userCircleIcon = UserCircle;
  readonly usersIcon = Users;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;
  readonly forumIcon = MessageCircle;
  readonly briefcaseIcon = Briefcase;
  readonly newspaperIcon = Newspaper;
  readonly fileTextIcon = FileText;

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.authStore.state$.subscribe(state => {
      this.authState = state;
    });
    
    // Listen for scroll events to add shadow to header
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.scrolled = window.scrollY > 10;
      });
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  /**
   * Toggle mobile menu visibility
   */
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    // Close user menu when opening mobile menu
    if (this.mobileMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  /**
   * Toggle user dropdown menu visibility
   */
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    // Close mobile menu when opening user menu
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Close user dropdown menu
   */
  closeUserMenu() {
    this.userMenuOpen = false;
  }

  /**
   * Logout user and redirect to home
   */
  logout() {
    this.authStore.clearAuthState();
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    // Navigate to home page after logout
    window.location.href = '/';
  }

  /**
   * Check if user is an applicant
   */
  isApplicant(): boolean {
    return this.authState.user?.roles?.includes('Applicant') || false;
  }

  /**
   * Check if user is an alumni
   */
  isAlumni(): boolean {
    return this.authState.user?.roles?.includes('Alumni') || false;
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.authState.user?.roles?.includes('Admin') || false;
  }

  /**
   * Check if user is a content creator
   */
  isContentCreator(): boolean {
    return this.authState.user?.roles?.includes('ContentCreator') || false;
  }

  /**
   * Get user role display name
   */
  getUserRole(): string {
    if (this.isAdmin()) return 'Administrator';
    if (this.isContentCreator()) return 'Content Creator';
    if (this.isAlumni()) return 'Alumni';
    if (this.isApplicant()) return 'Job Applicant';
    return 'User';
  }
}
