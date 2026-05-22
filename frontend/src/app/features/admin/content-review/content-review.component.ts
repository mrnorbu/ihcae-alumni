import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LucideAngularModule, BookOpen, CheckCircle, XCircle, Eye, Clock, User as UserIcon } from 'lucide-angular';
import { NewsService } from '../../news-events/services/news.service';
import type { NewsArticleSummary } from '../../news-events/models';

@Component({
  selector: 'app-content-review',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header -->
      <div>
        <h1 class="text-xl font-bold text-neutral-900">Story Review</h1>
        <p class="text-sm text-neutral-500">Review and approve alumni-submitted success stories</p>
      </div>

      <!-- Stories list -->
      <div class="bg-white border border-neutral-200 rounded-xl">
        <div class="border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="bookOpenIcon" [size]="16" class="text-neutral-400"></lucide-icon>
            <span class="text-sm font-semibold text-neutral-700">Pending Stories</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/30">
              {{ pendingStories().length }}
            </span>
          </div>
        </div>

        <div class="p-4">
          @if (isLoading()) {
            <div class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
            </div>
          } @else if (pendingStories().length === 0) {
            <div class="text-center py-10">
              <lucide-icon [img]="checkCircleIcon" [size]="32" class="text-primary-600 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-500">No pending success stories</p>
              <p class="text-xs text-neutral-400 mt-0.5">All stories have been reviewed</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (article of pendingStories(); track article.id) {
                <div class="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50/50 transition-colors">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5">
                        <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ article.title }}</h3>
                        <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/30">Pending</span>
                      </div>

                      <p class="text-sm text-neutral-500 mb-2 line-clamp-2">{{ article.excerpt }}</p>

                      <div class="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="userIconSmall" [size]="13"></lucide-icon>
                          {{ article.author.firstName }} {{ article.author.lastName }}
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="clockIcon" [size]="13"></lucide-icon>
                          {{ formatDate(article.createdAt) }}
                        </span>
                        @if (article.category) {
                          <span class="px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200/30 text-xs font-medium">{{ article.category.name }}</span>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button (click)="viewArticle(article.id)"
                        class="p-2 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors" title="View">
                        <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                      </button>
                      <button (click)="approveArticle(article.id)" [disabled]="isProcessing()"
                        class="p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20" title="Approve">
                        <lucide-icon [img]="checkCircleIcon" [size]="16"></lucide-icon>
                      </button>
                      <button (click)="openRejectModal(article.id)" [disabled]="isProcessing()"
                        class="p-2 rounded-md border border-red-200/60 text-red-650 hover:bg-red-50 disabled:opacity-40 transition-colors" title="Reject">
                        <lucide-icon [img]="xCircleIcon" [size]="16"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    @if (showRejectModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" (click)="closeRejectModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="p-5">
            <h3 class="text-base font-bold text-neutral-900 mb-1">Reject Story</h3>
            <p class="text-sm text-neutral-500 mb-4">Provide a reason for rejection:</p>

            <textarea
              [(ngModel)]="rejectReason"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white resize-none mb-4"
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

  readonly bookOpenIcon = BookOpen;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;
  readonly eyeIcon = Eye;
  readonly clockIcon = Clock;
  readonly userIconSmall = UserIcon;

  // State
  pendingStories = signal<NewsArticleSummary[]>([]);
  isLoading = signal(true);
  isProcessing = signal(false);

  // Reject modal
  showRejectModal = signal(false);
  rejectReason = '';
  rejectItemId = '';

  ngOnInit(): void {
    this.loadPendingStories();
  }

  private loadPendingStories(): void {
    this.isLoading.set(true);
    this.newsService.getPendingArticles(1, 50).subscribe({
      next: (result) => {
        // Filter to only show success stories
        const stories = result.items.filter((a: any) =>
          a.category?.name?.toLowerCase().includes('success') ||
          a.category?.slug?.toLowerCase().includes('success')
        );
        this.pendingStories.set(stories);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pending stories:', error);
        this.isLoading.set(false);
      }
    });
  }

  viewArticle(id: string): void {
    window.open(`/news/${id}`, '_blank');
  }

  approveArticle(id: string): void {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    this.newsService.approveArticle(id).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.pendingStories.set(this.pendingStories().filter(a => a.id !== id));
      },
      error: (error) => {
        console.error('Error approving story:', error);
        this.isProcessing.set(false);
      }
    });
  }

  openRejectModal(id: string): void {
    this.rejectItemId = id;
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
    this.newsService.rejectArticle(this.rejectItemId, this.rejectReason).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.pendingStories.set(this.pendingStories().filter(a => a.id !== this.rejectItemId));
        this.closeRejectModal();
      },
      error: (error) => {
        console.error('Error rejecting story:', error);
        this.isProcessing.set(false);
      }
    });
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
