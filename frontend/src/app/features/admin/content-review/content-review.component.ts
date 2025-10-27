import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, LayoutDashboard, Users, FileText, MessageSquare, Calendar, Newspaper, CheckCircle, XCircle, Eye, Clock, User as UserIcon, LogOut } from 'lucide-angular';
import { NewsService } from '../../news-events/services/news.service';
import { EventsService } from '../../news-events/services/events.service';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { AuthService } from '../../auth/services/auth.service';
import type { NewsArticleSummary, EventSummary } from '../../news-events/models';

/**
 * Admin Content Review Component
 * 
 * Allows admins to review and approve/reject pending news articles and events.
 */
@Component({
  selector: 'app-content-review',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <!-- Compact Sidebar -->
      <aside class="sidebar">
        <div class="p-6 border-b border-neutral-200">
          <h2 class="text-xl font-bold text-neutral-900">Admin Panel</h2>
        </div>
        
        <nav class="p-4 space-y-1">
          <a routerLink="/admin" routerLinkActive="nav-item-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <lucide-icon [img]="dashboardIcon" [size]="18"></lucide-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="nav-item-active" class="nav-item">
            <lucide-icon [img]="usersIcon" [size]="18"></lucide-icon>
            <span>User Management</span>
          </a>
          <a routerLink="/admin/content-review" routerLinkActive="nav-item-active" class="nav-item">
            <lucide-icon [img]="fileTextIcon" [size]="18"></lucide-icon>
            <span>Content Review</span>
          </a>
          <a routerLink="/admin/forums" routerLinkActive="nav-item-active" class="nav-item">
            <lucide-icon [img]="messageSquareIcon" [size]="18"></lucide-icon>
            <span>Forum Moderation</span>
          </a>
        </nav>

        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          <button (click)="logout()" class="nav-item w-full text-error-600 hover:bg-error-50">
            <lucide-icon [img]="logoutIcon" [size]="18"></lucide-icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="p-8">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-neutral-900 mb-2">Content Review</h1>
            <p class="text-neutral-600">Review and approve pending news articles and events</p>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="border-b border-neutral-200">
              <nav class="flex space-x-8 px-6">
                <button 
                  (click)="setActiveTab('news')"
                  [class.tab-active]="activeTab() === 'news'"
                  [class.tab-inactive]="activeTab() !== 'news'"
                  class="py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2">
                  <lucide-icon [img]="newspaperIcon" [size]="18"></lucide-icon>
                  Pending News ({{ pendingNews().length }})
                </button>
                <button 
                  (click)="setActiveTab('events')"
                  [class.tab-active]="activeTab() === 'events'"
                  [class.tab-inactive]="activeTab() !== 'events'"
                  class="py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2">
                  <lucide-icon [img]="calendarIcon" [size]="18"></lucide-icon>
                  Pending Events ({{ pendingEvents().length }})
                </button>
              </nav>
            </div>

            <!-- News Tab -->
            @if (activeTab() === 'news') {
              <div class="p-6">
                @if (isLoadingNews()) {
                  <div class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                } @else if (pendingNews().length === 0) {
                  <div class="text-center py-12">
                    <lucide-icon [img]="checkCircleIcon" [size]="48" class="text-success-600 mx-auto mb-4"></lucide-icon>
                    <p class="text-neutral-600">No pending news articles to review</p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (article of pendingNews(); track article.id) {
                      <div class="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between gap-6">
                          <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                              <h3 class="text-lg font-semibold text-neutral-900">{{ article.title }}</h3>
                              <span class="badge badge-warning">Pending Review</span>
                            </div>
                            
                            <p class="text-neutral-600 mb-4 line-clamp-2">{{ article.excerpt }}</p>
                            
                            <div class="flex items-center gap-4 text-sm text-neutral-500">
                              <div class="flex items-center gap-1">
                                <lucide-icon [img]="userIconSmall" [size]="14"></lucide-icon>
                                <span>{{ article.author.firstName }} {{ article.author.lastName }}</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                                <span>{{ formatDate(article.createdAt) }}</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <span class="badge badge-primary text-xs">{{ article.category.name }}</span>
                              </div>
                            </div>
                          </div>

                          <div class="flex flex-col gap-2">
                            <button 
                              (click)="viewArticle(article.id)"
                              class="btn-outline btn-sm inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                              View
                            </button>
                            <button 
                              (click)="approveArticle(article.id)"
                              [disabled]="isProcessing()"
                              class="btn-primary btn-sm inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="checkCircleIcon" [size]="16"></lucide-icon>
                              Approve
                            </button>
                            <button 
                              (click)="openRejectModal(article.id, 'news')"
                              [disabled]="isProcessing()"
                              class="btn-outline btn-sm text-error-600 border-error-300 hover:bg-error-50 inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="xCircleIcon" [size]="16"></lucide-icon>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Events Tab -->
            @if (activeTab() === 'events') {
              <div class="p-6">
                @if (isLoadingEvents()) {
                  <div class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                } @else if (pendingEvents().length === 0) {
                  <div class="text-center py-12">
                    <lucide-icon [img]="checkCircleIcon" [size]="48" class="text-success-600 mx-auto mb-4"></lucide-icon>
                    <p class="text-neutral-600">No pending events to review</p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    @for (event of pendingEvents(); track event.id) {
                      <div class="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between gap-6">
                          <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                              <h3 class="text-lg font-semibold text-neutral-900">{{ event.title }}</h3>
                              <span class="badge badge-warning">Pending Review</span>
                            </div>
                            
                            <div class="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                              <div class="flex items-center gap-1">
                                <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                                <span>{{ formatDate(event.eventDate) }}</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <span>{{ event.location }}</span>
                              </div>
                              @if (event.category) {
                                <span class="badge badge-success text-xs">{{ event.category.name }}</span>
                              }
                            </div>
                          </div>

                          <div class="flex flex-col gap-2">
                            <button 
                              (click)="viewEvent(event.id)"
                              class="btn-outline btn-sm inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                              View
                            </button>
                            <button 
                              (click)="approveEvent(event.id)"
                              [disabled]="isProcessing()"
                              class="btn-primary btn-sm inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="checkCircleIcon" [size]="16"></lucide-icon>
                              Approve
                            </button>
                            <button 
                              (click)="openRejectModal(event.id, 'event')"
                              [disabled]="isProcessing()"
                              class="btn-outline btn-sm text-error-600 border-error-300 hover:bg-error-50 inline-flex items-center gap-2"
                            >
                              <lucide-icon [img]="xCircleIcon" [size]="16"></lucide-icon>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </main>

      <!-- Reject Modal -->
      @if (showRejectModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="closeRejectModal()">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
            <div class="p-6">
              <h3 class="text-xl font-bold text-neutral-900 mb-4">Reject Content</h3>
              <p class="text-neutral-600 mb-4">Please provide a reason for rejection:</p>
              
              <textarea
                [(ngModel)]="rejectReason"
                class="input-field mb-4"
                rows="4"
                placeholder="Enter rejection reason..."
              ></textarea>

              <div class="flex gap-3">
                <button 
                  (click)="confirmReject()"
                  [disabled]="!rejectReason.trim() || isProcessing()"
                  class="btn-primary flex-1"
                >
                  @if (isProcessing()) {
                    <span class="flex items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rejecting...
                    </span>
                  } @else {
                    Confirm Rejection
                  }
                </button>
                <button 
                  (click)="closeRejectModal()"
                  [disabled]="isProcessing()"
                  class="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sidebar {
      @apply fixed left-0 top-0 h-screen w-60 bg-white border-r border-neutral-200 overflow-y-auto;
    }
    .main-content {
      @apply ml-60 min-h-screen;
    }
    .nav-item {
      @apply flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors;
    }
    .nav-item-active {
      @apply bg-primary-50 text-primary-700 font-medium;
    }
    .tab-active {
      @apply border-primary-600 text-primary-600;
    }
    .tab-inactive {
      @apply border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300;
    }
  `]
})
export class ContentReviewComponent implements OnInit {
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);
  private authStore = inject(UserAuthStore);
  private authService = inject(AuthService);

  // Icons
  dashboardIcon = LayoutDashboard;
  usersIcon = Users;
  fileTextIcon = FileText;
  messageSquareIcon = MessageSquare;
  calendarIcon = Calendar;
  newspaperIcon = Newspaper;
  checkCircleIcon = CheckCircle;
  xCircleIcon = XCircle;
  eyeIcon = Eye;
  clockIcon = Clock;
  userIconSmall = UserIcon;
  logoutIcon = LogOut;

  // State
  activeTab = signal<'news' | 'events'>('news');
  pendingNews = signal<NewsArticleSummary[]>([]);
  pendingEvents = signal<EventSummary[]>([]);
  isLoadingNews = signal(true);
  isLoadingEvents = signal(true);
  isProcessing = signal(false);
  
  // Reject modal
  showRejectModal = signal(false);
  rejectReason = '';
  rejectItemId = '';
  rejectItemType: 'news' | 'event' = 'news';

  ngOnInit(): void {
    this.loadPendingNews();
    this.loadPendingEvents();
  }

  private loadPendingNews(): void {
    this.isLoadingNews.set(true);
    this.newsService.getPendingArticles(1, 50).subscribe({
      next: (result) => {
        this.pendingNews.set(result.items);
        this.isLoadingNews.set(false);
      },
      error: (error) => {
        console.error('Error loading pending news:', error);
        this.isLoadingNews.set(false);
      }
    });
  }

  private loadPendingEvents(): void {
    this.isLoadingEvents.set(true);
    this.eventsService.getPendingEvents(1, 50).subscribe({
      next: (result) => {
        this.pendingEvents.set(result.items);
        this.isLoadingEvents.set(false);
      },
      error: (error) => {
        console.error('Error loading pending events:', error);
        this.isLoadingEvents.set(false);
      }
    });
  }

  setActiveTab(tab: 'news' | 'events'): void {
    this.activeTab.set(tab);
  }

  viewArticle(id: string): void {
    window.open(`/news/${id}`, '_blank');
  }

  viewEvent(id: string): void {
    window.open(`/events/${id}`, '_blank');
  }

  approveArticle(id: string): void {
    if (this.isProcessing()) return;
    
    this.isProcessing.set(true);
    this.newsService.approveArticle(id).subscribe({
      next: () => {
        this.isProcessing.set(false);
        // Remove from list
        this.pendingNews.set(this.pendingNews().filter(a => a.id !== id));
      },
      error: (error) => {
        console.error('Error approving article:', error);
        this.isProcessing.set(false);
        alert('Failed to approve article. Please try again.');
      }
    });
  }

  approveEvent(id: string): void {
    if (this.isProcessing()) return;
    
    this.isProcessing.set(true);
    this.eventsService.approveEvent(id).subscribe({
      next: () => {
        this.isProcessing.set(false);
        // Remove from list
        this.pendingEvents.set(this.pendingEvents().filter(e => e.id !== id));
      },
      error: (error) => {
        console.error('Error approving event:', error);
        this.isProcessing.set(false);
        alert('Failed to approve event. Please try again.');
      }
    });
  }

  openRejectModal(id: string, type: 'news' | 'event'): void {
    this.rejectItemId = id;
    this.rejectItemType = type;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectReason = '';
    this.rejectItemId = '';
  }

  confirmReject(): void {
    if (!this.rejectReason.trim() || this.isProcessing()) return;

    this.isProcessing.set(true);

    if (this.rejectItemType === 'news') {
      this.newsService.rejectArticle(this.rejectItemId, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingNews.set(this.pendingNews().filter(a => a.id !== this.rejectItemId));
          this.closeRejectModal();
        },
        error: (error) => {
          console.error('Error rejecting article:', error);
          this.isProcessing.set(false);
          alert('Failed to reject article. Please try again.');
        }
      });
    } else {
      this.eventsService.rejectEvent(this.rejectItemId, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingEvents.set(this.pendingEvents().filter(e => e.id !== this.rejectItemId));
          this.closeRejectModal();
        },
        error: (error) => {
          console.error('Error rejecting event:', error);
          this.isProcessing.set(false);
          alert('Failed to reject event. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
