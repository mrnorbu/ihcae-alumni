import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, Newspaper, CheckCircle, XCircle, Eye, Clock, User as UserIcon } from 'lucide-angular';
import { NewsService } from '../../news-events/services/news.service';
import { EventsService } from '../../news-events/services/events.service';
import type { NewsArticleSummary, EventSummary } from '../../news-events/models';

@Component({
  selector: 'app-content-review',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header -->
      <div>
        <h1 class="text-lg font-bold text-neutral-900">Content Review</h1>
        <p class="text-xs text-neutral-500">Review and approve pending news articles and events</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white border border-neutral-200 rounded-xl">
        <div class="border-b border-neutral-200">
          <nav class="flex gap-6 px-4">
            <button
              (click)="setActiveTab('news')"
              class="py-3 border-b-2 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
              [class.border-neutral-900]="activeTab() === 'news'"
              [class.text-neutral-900]="activeTab() === 'news'"
              [class.border-transparent]="activeTab() !== 'news'"
              [class.text-neutral-400]="activeTab() !== 'news'"
              [class.hover:text-neutral-600]="activeTab() !== 'news'">
              <lucide-icon [img]="newspaperIcon" [size]="14"></lucide-icon>
              News
              <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                [class.bg-neutral-900]="activeTab() === 'news'"
                [class.text-white]="activeTab() === 'news'"
                [class.bg-neutral-100]="activeTab() !== 'news'"
                [class.text-neutral-500]="activeTab() !== 'news'">
                {{ pendingNews().length }}
              </span>
            </button>
            <button
              (click)="setActiveTab('events')"
              class="py-3 border-b-2 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
              [class.border-neutral-900]="activeTab() === 'events'"
              [class.text-neutral-900]="activeTab() === 'events'"
              [class.border-transparent]="activeTab() !== 'events'"
              [class.text-neutral-400]="activeTab() !== 'events'"
              [class.hover:text-neutral-600]="activeTab() !== 'events'">
              <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
              Events
              <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                [class.bg-neutral-900]="activeTab() === 'events'"
                [class.text-white]="activeTab() === 'events'"
                [class.bg-neutral-100]="activeTab() !== 'events'"
                [class.text-neutral-500]="activeTab() !== 'events'">
                {{ pendingEvents().length }}
              </span>
            </button>
          </nav>
        </div>

        <!-- News Tab -->
        @if (activeTab() === 'news') {
          <div class="p-4">
            @if (isLoadingNews()) {
              <div class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
              </div>
            } @else if (pendingNews().length === 0) {
              <div class="text-center py-10">
                <lucide-icon [img]="checkCircleIcon" [size]="32" class="text-green-500 mx-auto mb-2"></lucide-icon>
                <p class="text-sm text-neutral-500">No pending news articles</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (article of pendingNews(); track article.id) {
                  <div class="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5">
                          <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ article.title }}</h3>
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                        </div>

                        <p class="text-xs text-neutral-500 mb-2 line-clamp-2">{{ article.excerpt }}</p>

                        <div class="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                          <span class="inline-flex items-center gap-1">
                            <lucide-icon [img]="userIconSmall" [size]="12"></lucide-icon>
                            {{ article.author.firstName }} {{ article.author.lastName }}
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <lucide-icon [img]="clockIcon" [size]="12"></lucide-icon>
                            {{ formatDate(article.createdAt) }}
                          </span>
                          <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-medium">{{ article.category.name }}</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button (click)="viewArticle(article.id)"
                          class="p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors" title="View">
                          <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="approveArticle(article.id)" [disabled]="isProcessing()"
                          class="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors" title="Approve">
                          <lucide-icon [img]="checkCircleIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="openRejectModal(article.id, 'news')" [disabled]="isProcessing()"
                          class="p-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors" title="Reject">
                          <lucide-icon [img]="xCircleIcon" [size]="14"></lucide-icon>
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
          <div class="p-4">
            @if (isLoadingEvents()) {
              <div class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
              </div>
            } @else if (pendingEvents().length === 0) {
              <div class="text-center py-10">
                <lucide-icon [img]="checkCircleIcon" [size]="32" class="text-green-500 mx-auto mb-2"></lucide-icon>
                <p class="text-sm text-neutral-500">No pending events</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (event of pendingEvents(); track event.id) {
                  <div class="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5">
                          <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ event.title }}</h3>
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                        </div>

                        <div class="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                          <span class="inline-flex items-center gap-1">
                            <lucide-icon [img]="calendarIcon" [size]="12"></lucide-icon>
                            {{ formatDate(event.eventDate) }}
                          </span>
                          <span>{{ event.location }}</span>
                          @if (event.category) {
                            <span class="px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-medium">{{ event.category.name }}</span>
                          }
                        </div>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button (click)="viewEvent(event.id)"
                          class="p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors" title="View">
                          <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="approveEvent(event.id)" [disabled]="isProcessing()"
                          class="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors" title="Approve">
                          <lucide-icon [img]="checkCircleIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="openRejectModal(event.id, 'event')" [disabled]="isProcessing()"
                          class="p-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors" title="Reject">
                          <lucide-icon [img]="xCircleIcon" [size]="14"></lucide-icon>
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

    <!-- Reject Modal -->
    @if (showRejectModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" (click)="closeRejectModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="p-5">
            <h3 class="text-base font-bold text-neutral-900 mb-1">Reject Content</h3>
            <p class="text-xs text-neutral-500 mb-4">Provide a reason for rejection:</p>

            <textarea
              [(ngModel)]="rejectReason"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white resize-none mb-4"
              rows="3"
              placeholder="Enter rejection reason..."
            ></textarea>

            <div class="flex gap-2">
              <button
                (click)="confirmReject()"
                [disabled]="!rejectReason.trim() || isProcessing()"
                class="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors">
                @if (isProcessing()) {
                  <span class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white"></div>
                    Rejecting...
                  </span>
                } @else {
                  Confirm Rejection
                }
              </button>
              <button
                (click)="closeRejectModal()"
                [disabled]="isProcessing()"
                class="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ContentReviewComponent implements OnInit {
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);

  readonly calendarIcon = Calendar;
  readonly newspaperIcon = Newspaper;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;
  readonly eyeIcon = Eye;
  readonly clockIcon = Clock;
  readonly userIconSmall = UserIcon;

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

}
