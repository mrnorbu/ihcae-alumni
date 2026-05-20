import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
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

      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200"
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()">

        <!-- Brand -->
        <div class="flex items-center gap-2.5 px-4 h-14 border-b border-neutral-200 shrink-0">
          <div class="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center shrink-0">
            <img src="images/logo.png" alt="IHCAE" class="w-4 h-4 object-contain brightness-200">
          </div>
          <div class="leading-tight">
            <strong class="block text-sm font-bold tracking-wide text-neutral-900">IHCAE Console</strong>
            <small class="text-xs text-neutral-400">Alumni Admin</small>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">

          <!-- Overview -->
          <div>
            <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
              <lucide-icon [img]="dashboardIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
              Dashboard
            </a>
          </div>

          <!-- User Management -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Users</p>
            <div class="space-y-0.5">
              <a routerLink="/admin/users" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="usersIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                User Management
              </a>
            </div>
          </div>

          <!-- Content -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Content</p>
            <div class="space-y-0.5">
              <a routerLink="/admin/content" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="newspaperIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                News & Events
              </a>
              <a routerLink="/admin/content-review" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="bookOpenIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Story Review
              </a>
            </div>
          </div>

          <!-- Alumni -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Alumni</p>
            <div class="space-y-0.5">
              <a routerLink="/admin/alumni-hub" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="databaseIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Alumni Hub
                @if (pendingCount() > 0) {
                  <span class="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    {{ pendingCount() }}
                  </span>
                }
              </a>
            </div>
          </div>

          <!-- Forums -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">Forums</p>
            <a routerLink="/admin/forums" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
              <lucide-icon [img]="messageSquareIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
              Forum Moderation
            </a>
          </div>

          <!-- System -->
          <div>
            <p class="px-2.5 mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">System</p>
            <div class="space-y-0.5">
              <a routerLink="/admin/analytics" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="analyticsIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Analytics
              </a>
              <a routerLink="/admin/settings" routerLinkActive="bg-neutral-100 text-neutral-900 font-semibold"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
                <lucide-icon [img]="settingsIcon" [size]="16" [strokeWidth]="2"></lucide-icon>
                Settings
              </a>
            </div>
          </div>
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
              <p class="text-xs text-neutral-400">Administrator</p>
            </div>
            <button (click)="logout()" title="Logout"
              class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0">
              <lucide-icon [img]="logoutIcon" [size]="14"></lucide-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 bg-black/30 lg:hidden" (click)="toggleSidebar()"></div>
      }

      <!-- Main -->
      <div class="flex-1 lg:ml-56 flex flex-col min-h-screen">

        <!-- Top bar -->
        <header class="sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div class="flex items-center h-14 px-4 sm:px-6">
            <button (click)="toggleSidebar()"
              class="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 lg:hidden transition-colors mr-3">
              <lucide-icon [img]="sidebarOpen() ? xIcon : menuIcon" [size]="18"></lucide-icon>
            </button>
            <div class="flex-1">
              <h1 class="text-base font-bold text-neutral-900">IHCAE Admin</h1>
              <p class="text-xs text-neutral-400 leading-none">
                @if (pendingCount() > 0) {
                  <span class="text-amber-600 font-medium">{{ pendingCount() }} pending approval</span>
                } @else {
                  All clear
                }
              </p>
            </div>
          </div>
        </header>

        <!-- Child route content -->
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

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

  ngOnInit() {
    this.authStore.state$.subscribe((authState: any) => {
      if (authState?.user) {
        this.user.set(authState.user);
        this.loadPendingCount();
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

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.showSuccess('Logged out', 'You have been logged out');
      },
      error: () => {
        this.notificationService.showError('Logout failed', 'An error occurred during logout');
      }
    });
  }
}
