import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, BookOpen, CheckCircle, XCircle, Eye, Clock, User as UserIcon, Calendar, MapPin, Users, X } from 'lucide-angular';
import { NewsService } from '../../news-events/services/news.service';
import { EventsService } from '../../news-events/services/events.service';
import { AppImageUrlPipe } from '../../../shared/pipes/app-image-url.pipe';
import type { NewsArticleSummary, NewsCategory, NewsArticle, EventSummary } from '../../news-events/models';
import { CustomSelectComponent, SelectOption } from '../../../shared/components';

@Component({
  selector: 'app-content-review',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CustomSelectComponent, RouterModule, AppImageUrlPipe],
  template: `
    <div class="p-4 sm:p-6 space-y-4 bg-neutral-50 min-h-screen">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Content Review Portal</h1>
          <p class="text-sm text-neutral-500">Approve or reject submissions from the alumni network</p>
        </div>
      </div>

      <div class="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div class="border-b border-neutral-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="bookOpenIcon" [size]="16" class="text-neutral-400"></lucide-icon>
            <span class="text-sm font-semibold text-neutral-700">Pending Articles & Success Stories</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/30">
              {{ getFilteredArticles().length }}
            </span>
          </div>

          <!-- Category Filter -->
          <div class="flex items-center gap-2">
            <label for="categoryFilter" class="text-xs text-neutral-500 font-medium whitespace-nowrap">Filter Category:</label>
            <div class="w-[160px]">
              <app-custom-select
                id="categoryFilter"
                [options]="categoryOptions()"
                [ngModel]="selectedCategory()"
                (ngModelChange)="selectedCategory.set($event)"
                customClass="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700 font-medium"
              ></app-custom-select>
            </div>
          </div>
        </div>

        <div class="p-4">
          @if (isLoading()) {
            <div class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
            </div>
          } @else if (getFilteredArticles().length === 0) {
            <div class="text-center py-10">
              <lucide-icon [img]="checkCircleIcon" [size]="32" class="text-green-600 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-500">No pending submissions</p>
              <p class="text-xs text-neutral-400 mt-0.5">All content has been reviewed or matches the current filter</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (article of getFilteredArticles(); track article.id) {
                <div class="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50/50 transition-colors bg-white">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ article.title }}</h3>
                        <span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/30">Pending Review</span>
                        @if (article.category) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {{ article.category.name }}
                          </span>
                        }
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
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5 shrink-0">
                      <button (click)="openReviewModal(article, 'article')"
                        class="p-2 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors flex items-center gap-1 text-xs font-semibold" title="View Details">
                        <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                        Review
                      </button>
                      <button (click)="approveArticle(article.id)" [disabled]="isProcessing()"
                        class="p-2 rounded-md bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40 transition-colors focus:outline-none" title="Approve">
                        <lucide-icon [img]="checkCircleIcon" [size]="14"></lucide-icon>
                      </button>
                      <button (click)="openRejectModal(article.id, 'article')" [disabled]="isProcessing()"
                        class="p-2 rounded-md border border-red-200/60 text-red-650 hover:bg-red-50 disabled:opacity-40 transition-colors" title="Reject">
                        <lucide-icon [img]="xCircleIcon" [size]="14"></lucide-icon>
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

    <!-- Unified Dedicated Review Modal -->
    @if (showReviewModal()) {
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" (click)="closeReviewModal()">
        <div class="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in duration-150" (click)="$event.stopPropagation()">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/30 uppercase tracking-wider">
                Reviewing {{ reviewType() === 'event' ? 'Event' : 'Article' }}
              </span>
              <h3 class="text-base font-bold text-neutral-950 mt-1">{{ activeReviewItem()?.title }}</h3>
            </div>
            <button (click)="closeReviewModal()" class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
              <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-neutral-700">
            @if (isLoadingDetails()) {
              <div class="flex flex-col items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-900 mb-2"></div>
                <span class="text-xs text-neutral-400 font-medium">Fetching full submission...</span>
              </div>
            } @else {
              <!-- Featured Image if exists -->
              @if (activeReviewItem()?.imageUrl) {
                <div class="rounded-xl overflow-hidden border border-neutral-100 aspect-video max-h-60 bg-neutral-50 shadow-sm shrink-0">
                  <img [src]="activeReviewItem()?.imageUrl | appImageUrl" class="w-full h-full object-cover" />
                </div>
              }

              <!-- Meta Data -->
              <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-450 border-b border-neutral-100 pb-3">
                @if (reviewType() === 'article') {
                  <span class="flex items-center gap-1">
                    <lucide-icon [img]="userIconSmall" [size]="14"></lucide-icon>
                    Author: {{ activeReviewItem()?.author?.firstName }} {{ activeReviewItem()?.author?.lastName }}
                  </span>
                  <span class="flex items-center gap-1">
                    <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                    Submitted: {{ formatDate(activeReviewItem()?.createdAt) }}
                  </span>
                  @if (activeReviewItem()?.category) {
                    <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px]">
                      Category: {{ activeReviewItem()?.category?.name }}
                    </span>
                  }
                } @else {
                  <span class="flex items-center gap-1">
                    <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                    Event Date: {{ formatDate(activeReviewItem()?.eventDate) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <lucide-icon [img]="mapPinIcon" [size]="14"></lucide-icon>
                    Location: {{ activeReviewItem()?.location }}
                  </span>
                  @if (activeReviewItem()?.category) {
                    <span class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-[10px]">
                      Category: {{ activeReviewItem()?.category?.name }}
                    </span>
                  }
                  @if (activeReviewItem()?.capacity) {
                    <span class="flex items-center gap-1">
                      <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                      Capacity: {{ activeReviewItem()?.capacity }} seats
                    </span>
                  }
                }
              </div>

              <!-- Main Text -->
              <div class="whitespace-pre-line leading-relaxed text-neutral-800 text-sm max-h-[300px] overflow-y-auto pr-2">
                {{ reviewType() === 'event' ? activeReviewItem()?.description : activeReviewItem()?.content }}
              </div>

              <!-- Rejection Reason Input inside Modal (when active) -->
              @if (modalRejectActive()) {
                <div class="border-t border-neutral-100 pt-4 mt-2 animate-in slide-in-from-bottom-2 duration-200">
                  <label class="block text-xs font-bold uppercase tracking-wider text-red-700 mb-1.5">Reason for Rejection</label>
                  <textarea [(ngModel)]="rejectReason" rows="3"
                    class="w-full text-sm border border-red-200 rounded-xl px-3 py-2 bg-red-50/20 focus:border-red-500 focus:bg-white outline-none transition-colors resize-none"
                    placeholder="Provide constructive feedback for the creator..."></textarea>
                  <div class="flex gap-2 justify-end mt-3">
                    <button (click)="modalRejectActive.set(false)" class="btn-outline btn-sm">Cancel</button>
                    <button (click)="confirmModalReject()" [disabled]="!rejectReason.trim() || isProcessing()"
                      class="btn-primary btn-sm bg-red-600 hover:bg-red-700 text-white border-transparent">
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Modal Footer -->
          @if (!modalRejectActive() && !isLoadingDetails()) {
            <div class="flex justify-between items-center px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 rounded-b-2xl shrink-0">
              <div class="flex gap-2">
                <button (click)="confirmModalApprove()" [disabled]="isProcessing()"
                  class="btn-primary flex items-center justify-center gap-1.5 px-5 py-2.5">
                  <lucide-icon [img]="checkCircleIcon" [size]="15"></lucide-icon>
                  Approve Submission
                </button>
                <button (click)="modalRejectActive.set(true)" [disabled]="isProcessing()"
                  class="btn-outline text-red-600 hover:text-red-700 border-neutral-200 hover:border-red-300 flex items-center justify-center gap-1.5 px-4 py-2.5">
                  <lucide-icon [img]="xCircleIcon" [size]="15"></lucide-icon>
                  Reject...
                </button>
              </div>
              <button (click)="closeReviewModal()" class="btn-outline px-4 py-2.5">Close</button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Reject Modal (Fallback for quick-reject button) -->
    @if (showRejectModal()) {
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" (click)="closeRejectModal()">
        <div class="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-150" (click)="$event.stopPropagation()">
          <div class="p-1">
            <h3 class="text-base font-bold text-neutral-900 mb-1">Reject Content</h3>
            <p class="text-xs text-neutral-500 mb-4">Provide a constructive reason for rejection. The user will be able to edit and resubmit.</p>

            <textarea
              [(ngModel)]="rejectReason"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-neutral-900 focus:bg-white resize-none mb-4"
              rows="3"
              placeholder="e.g. Please update the cover photo to be more relevant..."
            ></textarea>

            <div class="flex gap-2 justify-end">
              <button
                (click)="confirmReject()"
                [disabled]="!rejectReason.trim() || isProcessing()"
                class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors">
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
  private route = inject(ActivatedRoute);

  readonly bookOpenIcon = BookOpen;
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;
  readonly eyeIcon = Eye;
  readonly clockIcon = Clock;
  readonly userIconSmall = UserIcon;
  readonly calendarIcon = Calendar;
  readonly mapPinIcon = MapPin;
  readonly usersIcon = Users;
  readonly xIcon = X;

  // Tabs
  activeTab = signal<'articles' | 'events'>('articles');

  // Lists State
  pendingArticles = signal<NewsArticleSummary[]>([]);
  pendingEvents = signal<EventSummary[]>([]);
  categories = signal<NewsCategory[]>([]);
  isLoading = signal(true);
  isLoadingEvents = signal(true);
  isProcessing = signal(false);

  // Filters
  selectedCategory = signal<string>('');

  categoryOptions = computed<SelectOption[]>(() => {
    const list = this.categories().map(cat => ({
      label: cat.name,
      value: cat.slug
    }));
    return [
      { label: 'All Categories', value: '' },
      ...list
    ];
  });

  // Simple Reject modal (quick actions)
  showRejectModal = signal(false);
  rejectReason = '';
  rejectItemId: number | null = null;
  rejectItemType: 'article' | 'event' = 'article';

  // Dedicated Detailed Review Modal State
  showReviewModal = signal(false);
  isLoadingDetails = signal(false);
  activeReviewItem = signal<any>(null);
  reviewType = signal<'article' | 'event'>('article');
  modalRejectActive = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'events') {
        this.activeTab.set('events');
      } else {
        this.activeTab.set('articles');
      }

      if (params['categorySlug']) {
        this.selectedCategory.set(params['categorySlug']);
      } else {
        this.selectedCategory.set('');
      }
    });

    this.loadPendingArticles();
    this.loadPendingEvents();
    this.loadCategories();
  }

  private loadPendingArticles(): void {
    this.isLoading.set(true);
    this.newsService.getPendingArticles(1, 100).subscribe({
      next: (result) => {
        this.pendingArticles.set(result.items);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pending content:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadPendingEvents(): void {
    this.isLoadingEvents.set(true);
    this.eventsService.getPendingEvents(1, 100).subscribe({
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

  private loadCategories(): void {
    this.newsService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  getFilteredArticles(): NewsArticleSummary[] {
    const categoryFilter = this.selectedCategory();
    const articles = this.pendingArticles();
    if (!categoryFilter) return articles;
    return articles.filter(a => a.category?.slug === categoryFilter);
  }

  // --- Detailed Review Modal Actions ---

  openReviewModal(item: any, type: 'article' | 'event'): void {
    this.activeReviewItem.set(item);
    this.reviewType.set(type);
    this.isLoadingDetails.set(true);
    this.modalRejectActive.set(false);
    this.rejectReason = '';
    this.showReviewModal.set(true);

    if (type === 'article') {
      this.newsService.getArticleById(item.id).subscribe({
        next: (full) => {
          this.activeReviewItem.set(full);
          this.isLoadingDetails.set(false);
        },
        error: (err) => {
          console.error('Error loading full article:', err);
          this.isLoadingDetails.set(false);
        }
      });
    } else {
      this.eventsService.getEventById(item.id).subscribe({
        next: (full) => {
          this.activeReviewItem.set(full);
          this.isLoadingDetails.set(false);
        },
        error: (err) => {
          console.error('Error loading full event:', err);
          this.isLoadingDetails.set(false);
        }
      });
    }
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.activeReviewItem.set(null);
    this.modalRejectActive.set(false);
    this.rejectReason = '';
  }

  confirmModalApprove(): void {
    const item = this.activeReviewItem();
    if (!item) return;
    
    if (this.reviewType() === 'article') {
      this.approveArticle(item.id);
    } else {
      this.approveEvent(item.id);
    }
    this.closeReviewModal();
  }

  confirmModalReject(): void {
    const item = this.activeReviewItem();
    if (!item || !this.rejectReason.trim() || this.isProcessing()) return;

    this.isProcessing.set(true);

    if (this.reviewType() === 'article') {
      this.newsService.rejectArticle(item.id, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingArticles.set(this.pendingArticles().filter(a => a.id !== item.id));
          this.closeReviewModal();
        },
        error: (error) => {
          console.error('Error rejecting content:', error);
          this.isProcessing.set(false);
        }
      });
    } else {
      this.eventsService.rejectEvent(item.id, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingEvents.set(this.pendingEvents().filter(e => e.id !== item.id));
          this.closeReviewModal();
        },
        error: (error) => {
          console.error('Error rejecting event:', error);
          this.isProcessing.set(false);
        }
      });
    }
  }

  // --- Quick Review Actions ---

  approveArticle(id: number): void {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    this.newsService.approveArticle(id).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.pendingArticles.set(this.pendingArticles().filter(a => a.id !== id));
      },
      error: (error) => {
        console.error('Error approving content:', error);
        this.isProcessing.set(false);
      }
    });
  }

  approveEvent(id: number): void {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);
    this.eventsService.approveEvent(id).subscribe({
      next: () => {
        this.isProcessing.set(false);
        this.pendingEvents.set(this.pendingEvents().filter(e => e.id !== id));
      },
      error: (error) => {
        console.error('Error approving event:', error);
        this.isProcessing.set(false);
      }
    });
  }

  openRejectModal(id: number, type: 'article' | 'event'): void {
    this.rejectItemId = id;
    this.rejectItemType = type;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectReason = '';
    this.rejectItemId = null;
  }

  confirmReject(): void {
    if (!this.rejectReason.trim() || this.isProcessing()) return;

    this.isProcessing.set(true);
    if (this.rejectItemType === 'article') {
      this.newsService.rejectArticle(this.rejectItemId!, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingArticles.set(this.pendingArticles().filter(a => a.id !== this.rejectItemId));
          this.closeRejectModal();
        },
        error: (error) => {
          console.error('Error rejecting content:', error);
          this.isProcessing.set(false);
        }
      });
    } else {
      this.eventsService.rejectEvent(this.rejectItemId!, this.rejectReason).subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.pendingEvents.set(this.pendingEvents().filter(e => e.id !== this.rejectItemId));
          this.closeRejectModal();
        },
        error: (error) => {
          console.error('Error rejecting event:', error);
          this.isProcessing.set(false);
        }
      });
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
