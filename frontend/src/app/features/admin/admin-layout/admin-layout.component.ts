import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../shared/models';
import { environment } from '../../../../environments/environment';
import {
  LucideAngularModule,
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  AlertCircle,
  UserCheck,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Database,
  BookOpen,
  Newspaper
} from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <div class="flex min-h-screen bg-neutral-50">

      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-neutral-200 flex-col">

        <!-- Brand -->
        <div class="flex items-center gap-2.5 px-4 h-14 border-b border-neutral-200 shrink-0">
          <img src="images/logo.png" alt="IHCAE" class="w-10 h-10 object-contain shrink-0">
          <div class="leading-tight">
            <strong class="block text-sm font-bold tracking-wide text-neutral-900">IHCAE Console</strong>
            <small class="text-xs text-neutral-400">{{ isAdmin() ? 'Alumni Admin' : 'Content Creator' }}</small>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">

          <!-- Overview -->
          @if (isAdmin()) {
            <div>
              <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="dashboardIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Dashboard
              </a>
            </div>
          }

          <!-- Users -->
          @if (isAdmin()) {
            <div>
              <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Users</p>
              <div class="space-y-0.5">
                <a routerLink="/admin/users" [queryParams]="{tab: 'all'}" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                  class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                  <lucide-icon [img]="usersIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                  Alumni & User Management
                </a>
              </div>
            </div>
          }

          <!-- Content -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Content</p>
            <div class="space-y-0.5">
              <a routerLink="/admin/content" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="newspaperIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                News & Events
              </a>
              <a routerLink="/admin/content-review" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="bookOpenIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Content Review
              </a>
            </div>
          </div>


          <!-- Forums -->
          @if (isAdmin()) {
            <div>
              <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Forums</p>
              <a routerLink="/admin/forums" routerLinkActive="bg-primary-50 text-primary-700 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="messageSquareIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Forum Moderation
                @if (pendingFlagsCount() > 0) {
                  <span class="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                    {{ pendingFlagsCount() }}
                  </span>
                }
              </a>
            </div>
          }
        </nav>

        <!-- User footer -->
        <div class="px-2.5 py-2.5 border-t border-neutral-200 shrink-0">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
              <span class="text-xs font-semibold text-neutral-600">
                {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-neutral-900 truncate">{{ user()?.firstName }} {{ user()?.lastName }}</p>
              <p class="text-xs text-neutral-400">{{ isAdmin() ? 'Administrator' : 'Content Creator' }}</p>
            </div>
            <button (click)="logout()" title="Logout"
              class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0">
              <lucide-icon [img]="logoutIcon" [size]="14"></lucide-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Layout Container -->
      <div class="flex-1 lg:ml-56 flex flex-col min-h-screen pb-16 lg:pb-0">

        <!-- Mobile Header Bar (hidden on desktop) -->
        <header class="sticky top-0 z-40 bg-white border-b border-neutral-200 lg:hidden px-4 h-14 shrink-0 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="images/logo.png" alt="IHCAE" class="w-8 h-8 object-contain shrink-0">
            <div class="leading-tight">
              <strong class="block text-sm font-bold tracking-wide text-neutral-900">IHCAE Console</strong>
              <small class="text-[10px] text-neutral-400 block -mt-0.5">{{ isAdmin() ? 'Alumni Admin' : 'Content Creator' }}</small>
            </div>
          </div>
          
          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-1.5">
              <div class="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200">
                <span class="text-[10px] font-semibold text-neutral-600">
                  {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
                </span>
              </div>
              <span class="text-xs font-medium text-neutral-700 max-w-[80px] truncate hidden sm:inline-block">
                {{ user()?.firstName }}
              </span>
            </div>
            <button (click)="logout()" title="Logout"
              class="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
              <lucide-icon [img]="logoutIcon" [size]="16"></lucide-icon>
            </button>
          </div>
        </header>

        <!-- Child route content -->
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Navigation Bar (hidden on desktop) -->
      <nav class="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-neutral-200 flex items-center overflow-x-auto whitespace-nowrap hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden px-2 gap-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        
        <!-- Dashboard Link -->
        @if (isAdmin()) {
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="text-primary-600 font-semibold"
            class="flex flex-col items-center justify-center flex-1 shrink-0 min-w-[70px] py-1 text-neutral-500 hover:text-neutral-900 transition-colors">
            <lucide-icon [img]="dashboardIcon" [size]="20" [strokeWidth]="2" class="mb-0.5"></lucide-icon>
            <span class="text-[10px] tracking-tight">Dashboard</span>
          </a>
        }

        <!-- Alumni/User Management Link -->
        @if (isAdmin()) {
          <a routerLink="/admin/users" [queryParams]="{tab: 'all'}" routerLinkActive="text-primary-600 font-semibold"
            class="flex flex-col items-center justify-center flex-1 shrink-0 min-w-[70px] py-1 text-neutral-500 hover:text-neutral-900 transition-colors">
            <lucide-icon [img]="usersIcon" [size]="20" [strokeWidth]="2" class="mb-0.5"></lucide-icon>
            <span class="text-[10px] tracking-tight text-center truncate w-full max-w-[70px]">Users</span>
          </a>
        }

        <!-- News & Events Link -->
        <a routerLink="/admin/content" routerLinkActive="text-primary-600 font-semibold"
          class="flex flex-col items-center justify-center flex-1 shrink-0 min-w-[70px] py-1 text-neutral-500 hover:text-neutral-900 transition-colors">
          <lucide-icon [img]="newspaperIcon" [size]="20" [strokeWidth]="2" class="mb-0.5"></lucide-icon>
          <span class="text-[10px] tracking-tight">News</span>
        </a>

        <!-- Content Review Link -->
        <a routerLink="/admin/content-review" routerLinkActive="text-primary-600 font-semibold"
          class="flex flex-col items-center justify-center flex-1 shrink-0 min-w-[70px] py-1 text-neutral-500 hover:text-neutral-900 transition-colors">
          <lucide-icon [img]="bookOpenIcon" [size]="20" [strokeWidth]="2" class="mb-0.5"></lucide-icon>
          <span class="text-[10px] tracking-tight">Review</span>
        </a>

        <!-- Forum Moderation Link -->
        @if (isAdmin()) {
          <a routerLink="/admin/forums" routerLinkActive="text-primary-600 font-semibold"
            class="flex flex-col items-center justify-center flex-1 shrink-0 min-w-[70px] py-1 text-neutral-500 hover:text-neutral-900 transition-colors relative">
            <lucide-icon [img]="messageSquareIcon" [size]="20" [strokeWidth]="2" class="mb-0.5"></lucide-icon>
            <span class="text-[10px] tracking-tight">Forums</span>
            @if (pendingFlagsCount() > 0) {
              <span class="absolute top-1 right-[20%] flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white">
                {{ pendingFlagsCount() }}
              </span>
            }
          </a>
        }
      </nav>

    </div>
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly dashboardIcon = LayoutDashboard;
  readonly usersIcon = Users;
  readonly clockIcon = Clock;
  readonly fileTextIcon = FileText;
  readonly alertIcon = AlertCircle;
  readonly userCheckIcon = UserCheck;
  readonly messageSquareIcon = MessageSquare;
  readonly analyticsIcon = BarChart3;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;
  readonly menuIcon = Menu;
  readonly xIcon = X;
  readonly databaseIcon = Database;
  readonly bookOpenIcon = BookOpen;
  readonly newspaperIcon = Newspaper;

  user = signal<User | null>(null);
  sidebarOpen = signal(true);
  pendingCount = signal(0);
  pendingFlagsCount = signal(0);

  isAdmin(): boolean {
    return this.user()?.roles?.includes('Admin') || false;
  }

  ngOnInit() {
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
        
        if (authState.user.roles.includes('ContentCreator') && !authState.user.roles.includes('Admin')) {
          if (this.router.url === '/admin') {
            this.router.navigate(['/admin/content']);
          }
        }

        if (this.isAdmin()) {
          this.loadPendingCount();
          this.loadPendingFlagsCount();
        }
      }
    });
  }

  private loadPendingCount() {
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/stats`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.pendingCount.set(response.stats.pendingUsers);
        }
      }
    });
  }

  private loadPendingFlagsCount() {
    this.http.get(`${environment.apiUrl}/api/v1/admin/forums/flags?status=Pending&pageSize=1`).subscribe({
      next: (response: any) => {
        if (response && typeof response.totalCount === 'number') {
          this.pendingFlagsCount.set(response.totalCount);
        }
      },
      error: () => {
        // Silently ignore if not authorized
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
