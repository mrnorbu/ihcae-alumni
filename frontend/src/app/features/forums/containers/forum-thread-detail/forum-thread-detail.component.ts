import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, ArrowLeft, ThumbsUp, Reply, Send, Lock, Pin, Trash2, X, Flag } from 'lucide-angular';
import { HeaderComponent, FooterComponent, CustomSelectComponent, SelectOption } from '../../../../shared/components';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ForumService } from '../../services/forum.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import { NotificationService } from '../../../../core/services/notification.service';
import type { TopicDetailDto, PostDto } from '../../../../shared/models';

@Component({
  selector: 'app-forum-thread-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, NgTemplateOutlet, LucideAngularModule, HeaderComponent, FooterComponent, ConfirmationModalComponent, CustomSelectComponent],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col page-fade-in">
      <app-header></app-header>

      <div class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 pt-20">

        <!-- Back link -->
        <a routerLink="/forums" class="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4">
          <lucide-icon [img]="arrowLeftIcon" [size]="15"></lucide-icon>
          Back to Forums
        </a>

        <!-- Loading -->
        @if (loading) {
          <div class="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse space-y-4">
            <div class="h-7 bg-neutral-200 rounded w-2/3"></div>
            <div class="h-4 bg-neutral-200 rounded w-1/3"></div>
            <div class="space-y-2 pt-4 border-t border-neutral-100">
              <div class="h-4 bg-neutral-200 rounded w-full"></div>
              <div class="h-4 bg-neutral-200 rounded w-5/6"></div>
              <div class="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
        }

        <!-- Error -->
        @if (error) {
          <div class="bg-white rounded-xl border border-red-200 p-8 text-center">
            <p class="text-red-600 mb-3">{{ error }}</p>
            <button (click)="loadTopic()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Try Again</button>
          </div>
        }

        @if (!loading && !error && topic && mainPost) {

          <!-- ONE BIG CARD -->
          <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">

            <!-- Thread header -->
            <div class="px-6 pt-5 pb-4 border-b border-neutral-100">
              <div class="flex items-start gap-2 mb-1.5">
                @if (topic.isPinned) {
                  <lucide-icon [img]="pinIcon" [size]="14" class="text-amber-500 mt-1 flex-shrink-0"></lucide-icon>
                }
                @if (topic.isLocked) {
                  <lucide-icon [img]="lockIcon" [size]="14" class="text-neutral-400 mt-1 flex-shrink-0"></lucide-icon>
                }
                <h1 class="text-xl font-bold text-neutral-900 leading-tight">{{ topic.title }}</h1>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm text-neutral-500">by <span class="font-medium text-neutral-700">{{ getAuthorName(topic.createdBy) }}</span></span>
                <span class="text-neutral-300 text-xs">•</span>
                <span class="text-sm text-neutral-400">{{ formatDate(topic.createdAt) }}</span>
                @for (tag of topic.tags; track tag) {
                  <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">#{{ tag.name }}</span>
                }
              </div>
            </div>

            @if (topic.isLocked) {
              <div class="flex items-center gap-2 px-6 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
                <lucide-icon [img]="lockIcon" [size]="13"></lucide-icon>
                This topic is locked. No new replies can be posted.
              </div>
            }

            <!-- Original post -->
            <div class="px-6 py-5">
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-700">
                  @if (mainPost.author.profileImageUrl && !isPlaceholder(mainPost.author.profileImageUrl)) {
                    <img [src]="mainPost.author.profileImageUrl" [alt]="getAuthorName(mainPost.author)" class="w-9 h-9 rounded-full object-cover" />
                  } @else {
                    {{ getInitials(mainPost.author) }}
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="font-semibold text-neutral-900 text-sm">{{ getAuthorName(mainPost.author) }}</span>
                    <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Original Post</span>
                    <span class="text-xs text-neutral-400 ml-auto">{{ formatDate(mainPost.createdAt) }}</span>
                  </div>
                  <div class="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap">{{ mainPost.content }}</div>
                  <div class="flex items-center gap-4 mt-3">
                    <button (click)="toggleLike(mainPost)"
                      class="flex items-center gap-1.5 text-xs transition-colors"
                      [class.text-blue-600]="mainPost.isLikedByCurrentUser"
                      [class.text-neutral-500]="!mainPost.isLikedByCurrentUser">
                      <lucide-icon [img]="thumbsUpIcon" [size]="13"></lucide-icon>
                      <span>{{ mainPost.likeCount }}</span>
                    </button>
                    @if (!topic.isLocked) {
                      <button (click)="openReplyForm(mainPost.id)"
                        class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-600 transition-colors">
                        <lucide-icon [img]="replyIcon" [size]="13"></lucide-icon>
                        Reply
                      </button>
                    }
                    @if (!isCurrentUser(mainPost.author.id)) {
                      <button (click)="openFlagModal(mainPost.id)"
                        class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors">
                        <lucide-icon [img]="flagIcon" [size]="13"></lucide-icon>
                        Flag
                      </button>
                    }
                    <span class="text-xs text-neutral-400 ml-auto">{{ allReplies.length }} {{ allReplies.length === 1 ? 'reply' : 'replies' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reply form for original post (inline) -->
            @if (activeReplyForm === mainPost.id && !topic.isLocked) {
              <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                <ng-container *ngTemplateOutlet="replyFormTpl; context: { postId: mainPost.id, authorName: getAuthorName(mainPost.author) }"></ng-container>
              </div>
            }

            <!-- Replies section -->
            @if (allReplies.length > 0) {
              <div class="border-t border-neutral-200">
                <div class="px-6 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide bg-neutral-50 border-b border-neutral-100">
                  {{ allReplies.length }} {{ allReplies.length === 1 ? 'Reply' : 'Replies' }}
                </div>

                @for (reply of directReplies; track reply.id) {
                  <!-- Direct reply -->
                  <div class="border-b border-neutral-100 last:border-b-0">
                    <div class="px-6 py-4">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                          @if (reply.author.profileImageUrl && !isPlaceholder(reply.author.profileImageUrl)) {
                            <img [src]="reply.author.profileImageUrl" [alt]="getAuthorName(reply.author)" class="w-8 h-8 rounded-full object-cover" />
                          } @else {
                            {{ getInitials(reply.author) }}
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-neutral-900 text-sm">{{ getAuthorName(reply.author) }}</span>
                            <span class="text-xs text-neutral-400">{{ formatDate(reply.createdAt) }}</span>
                          </div>
                          <div class="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap">{{ reply.content }}</div>
                          <div class="flex items-center gap-4 mt-2.5">
                            <button (click)="toggleLike(reply)"
                              class="flex items-center gap-1.5 text-xs transition-colors"
                              [class.text-blue-600]="reply.isLikedByCurrentUser"
                              [class.text-neutral-500]="!reply.isLikedByCurrentUser">
                              <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                              <span>{{ reply.likeCount }}</span>
                            </button>
                            @if (!topic.isLocked) {
                              <button (click)="openReplyForm(reply.id)"
                                class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-600 transition-colors">
                                <lucide-icon [img]="replyIcon" [size]="12"></lucide-icon>
                                Reply
                              </button>
                            }
                            @if (!isCurrentUser(reply.author.id)) {
                              <button (click)="openFlagModal(reply.id)"
                                class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors">
                                <lucide-icon [img]="flagIcon" [size]="12"></lucide-icon>
                                Flag
                              </button>
                            }
                            @if (isCurrentUser(reply.author.id)) {
                              <button (click)="confirmDeletePost(reply.id)"
                                class="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors ml-auto">
                                <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                                Delete
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Inline reply form for this reply -->
                    @if (activeReplyForm === reply.id && !topic.isLocked) {
                      <div class="px-6 pb-4 pl-16 bg-neutral-50">
                        <ng-container *ngTemplateOutlet="replyFormTpl; context: { postId: reply.id, authorName: getAuthorName(reply.author) }"></ng-container>
                      </div>
                    }

                    <!-- Nested replies (indented) — appear immediately after parent -->
                    @for (nested of getNestedReplies(reply.id); track nested.id) {
                      <div class="pl-16 pr-6 py-3 bg-neutral-50 border-t border-neutral-100">
                        <div class="flex items-start gap-2.5">
                          <div class="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-500">
                            @if (nested.author.profileImageUrl && !isPlaceholder(nested.author.profileImageUrl)) {
                              <img [src]="nested.author.profileImageUrl" [alt]="getAuthorName(nested.author)" class="w-7 h-7 rounded-full object-cover" />
                            } @else {
                              {{ getInitials(nested.author) }}
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-0.5">
                              <span class="font-medium text-neutral-900 text-xs">{{ getAuthorName(nested.author) }}</span>
                              @if (nested.parentAuthor) {
                                <span class="text-xs text-blue-500">↩ {{ getAuthorName(nested.parentAuthor) }}</span>
                              }
                              <span class="text-xs text-neutral-400 ml-auto">{{ formatDate(nested.createdAt) }}</span>
                            </div>
                            <div class="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap">{{ nested.content }}</div>
                            <div class="flex items-center gap-3 mt-1.5">
                              <button (click)="toggleLike(nested)"
                                class="flex items-center gap-1.5 text-xs transition-colors"
                                [class.text-blue-600]="nested.isLikedByCurrentUser"
                                [class.text-neutral-400]="!nested.isLikedByCurrentUser">
                                <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                                <span>{{ nested.likeCount }}</span>
                              </button>
                              @if (!isCurrentUser(nested.author.id)) {
                                <button (click)="openFlagModal(nested.id)"
                                  class="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-600 transition-colors">
                                  <lucide-icon [img]="flagIcon" [size]="12"></lucide-icon>
                                  Flag
                                </button>
                              }
                              @if (isCurrentUser(nested.author.id)) {
                                <button (click)="confirmDeletePost(nested.id)"
                                  class="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 ml-auto">
                                  <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                                  Delete
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Bottom reply box -->
            @if (!topic.isLocked && activeReplyForm === null) {
              <div class="px-6 py-5 border-t border-neutral-200 bg-neutral-50">
                <textarea
                  [(ngModel)]="replyText"
                  rows="3"
                  placeholder="Write a reply..."
                  class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                ></textarea>
                <div class="flex justify-end mt-2">
                  <button
                    (click)="submitReply(mainPost.id)"
                    [disabled]="!replyText.trim() || submitting"
                    class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <lucide-icon [img]="sendIcon" [size]="14"></lucide-icon>
                    {{ submitting ? 'Posting...' : 'Post Reply' }}
                  </button>
                </div>
              </div>
            }

          </div><!-- end big card -->

        }

      </div>

      <app-footer></app-footer>

      <!-- Shared reply form template -->
      <ng-template #replyFormTpl let-postId="postId" let-authorName="authorName">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-neutral-500">Replying to {{ authorName }}</span>
          <button (click)="closeReplyForm()" class="text-neutral-400 hover:text-neutral-600">
            <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
          </button>
        </div>
        <textarea
          [(ngModel)]="replyText"
          rows="2"
          placeholder="Write your reply..."
          class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
        ></textarea>
        <div class="flex gap-2 mt-2">
          <button
            (click)="submitReply(postId)"
            [disabled]="!replyText.trim() || submitting"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <lucide-icon [img]="sendIcon" [size]="12"></lucide-icon>
            {{ submitting ? 'Posting...' : 'Post Reply' }}
          </button>
          <button (click)="closeReplyForm()" class="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg hover:bg-neutral-50 bg-white transition-colors">Cancel</button>
        </div>
      </ng-template>

      <app-confirmation-modal
        [isVisible]="showDeleteModal"
        title="Delete Reply"
        message="Are you sure you want to delete this reply? This action cannot be undone."
        confirmText="Delete"
        (confirm)="deletePost()"
        (cancel)="showDeleteModal = false"
      ></app-confirmation-modal>

      <!-- Flag Modal -->
      @if (showFlagModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in text-left overflow-visible">
            <div class="flex justify-between items-center mb-4 border-b border-neutral-100 pb-2">
              <h3 class="text-sm font-semibold text-neutral-900 flex items-center gap-2 m-0">
                <lucide-icon [img]="flagIcon" [size]="15" class="text-red-500"></lucide-icon>
                Flag Post for Review
              </h3>
              <button (click)="closeFlagModal()" class="text-neutral-400 hover:text-neutral-600 focus:outline-none bg-transparent border-0 cursor-pointer">
                <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
              </button>
            </div>
            
            <p class="text-xs text-neutral-500 mb-4">
              Please choose a reason for flagging this post. Flagged content is sent directly to the moderators for review.
            </p>

            <div class="space-y-3 mb-5 overflow-visible">
              <div class="overflow-visible">
                <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Reason *</label>
                <app-custom-select
                  [(ngModel)]="flagReason"
                  [options]="flagReasonOptions"
                  placeholder="Select a reason..."
                ></app-custom-select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Additional Details</label>
                <textarea
                  [(ngModel)]="flagDetails"
                  rows="3"
                  placeholder="Provide context or specific details..."
                  class="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                ></textarea>
              </div>
            </div>

            <div class="flex gap-3 justify-end pt-2 border-t border-neutral-100">
              <button
                (click)="closeFlagModal()"
                class="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none cursor-pointer"
                >
                Cancel
              </button>
              <button
                (click)="submitFlag()"
                [disabled]="!flagReason || flagSubmitting"
                class="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none cursor-pointer"
                >
                {{ flagSubmitting ? 'Submitting...' : 'Flag Post' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `]
})
export class ForumThreadDetailComponent implements OnInit, OnDestroy {
  topic: TopicDetailDto | null = null;
  mainPost: PostDto | null = null;
  loading = true;
  error: string | null = null;
  activeReplyForm: string | null = null;
  replyText = '';
  submitting = false;
  showDeleteModal = false;
  postToDelete: string | null = null;

  // Flagging variables
  showFlagModal = false;
  postToFlag: string | null = null;
  flagReason = '';
  flagDetails = '';
  flagSubmitting = false;

  readonly arrowLeftIcon = ArrowLeft;
  readonly thumbsUpIcon = ThumbsUp;
  readonly replyIcon = Reply;
  readonly sendIcon = Send;
  readonly lockIcon = Lock;
  readonly pinIcon = Pin;
  readonly trashIcon = Trash2;
  readonly xIcon = X;
  readonly flagIcon = Flag;

  readonly flagReasonOptions: SelectOption[] = [
    { label: 'Spam (unsolicited advertisement, links)', value: 'Spam' },
    { label: 'Harassment / Hate speech', value: 'Harassment' },
    { label: 'Inappropriate content', value: 'Inappropriate' },
    { label: 'Off-topic', value: 'OffTopic' },
    { label: 'Other', value: 'Other' }
  ];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private forumService = inject(ForumService);
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  /** All replies collected from mainPost.replies (flat) and any nested reply.replies */
  get allReplies(): PostDto[] {
    if (!this.mainPost) return [];
    const flat: PostDto[] = [];
    for (const r of this.mainPost.replies) {
      flat.push(r);
      if (r.replies?.length) flat.push(...r.replies);
    }
    return flat;
  }

  /** Direct replies to the main post (not replies-to-replies) */
  get directReplies(): PostDto[] {
    if (!this.mainPost) return [];
    const mainId = this.mainPost.id;
    // A reply is "direct" if its parentPostId points to the main post, is null, or it's in mainPost.replies but not nested elsewhere
    const nestedIds = new Set(
      this.mainPost.replies.flatMap(r => (r.replies ?? []).map(n => n.id))
    );
    return this.mainPost.replies.filter(r => !nestedIds.has(r.id));
  }

  /** Replies that are nested under a specific parent reply */
  getNestedReplies(parentId: string): PostDto[] {
    if (!this.mainPost) return [];
    // Check both mainPost.replies (flat structure from backend) and the parent's own .replies
    const parent = this.mainPost.replies.find(r => r.id === parentId);
    const fromParentReplies = parent?.replies ?? [];
    // Also check if backend returned them flat at the mainPost level with parentPostId set
    const fromFlat = this.mainPost.replies.filter(r => r.parentPostId === parentId);
    // Merge deduplicated
    const seen = new Set(fromParentReplies.map(r => r.id));
    return [...fromParentReplies, ...fromFlat.filter(r => !seen.has(r.id))];
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadTopic(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  loadTopic(id?: string): void {
    const topicId = id || this.route.snapshot.params['id'];
    if (!topicId) return;

    this.loading = true;
    this.error = null;

    this.forumService.getTopicById(topicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topic) => {
          this.topic = topic;
          this.mainPost = topic.posts.length > 0 ? topic.posts[0] : null;
          this.loading = false;
        },
        error: () => {
          this.error = 'Could not load this thread. It may have been deleted.';
          this.loading = false;
        }
      });
  }

  openReplyForm(postId: string): void {
    this.activeReplyForm = postId;
    this.replyText = '';
  }

  closeReplyForm(): void {
    this.activeReplyForm = null;
    this.replyText = '';
  }

  submitReply(postId: string): void {
    if (!this.replyText.trim() || !this.topic || !this.mainPost) return;
    this.submitting = true;

    this.forumService.createReply(this.topic.id, postId, this.replyText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newPost) => {
          this.submitting = false;
          this.replyText = '';
          this.activeReplyForm = null;
          // Insert locally — no full reload
          if (postId === this.mainPost!.id) {
            this.mainPost!.replies.push(newPost);
          } else {
            const parent = this.mainPost!.replies.find(r => r.id === postId);
            if (parent) {
              parent.replies = parent.replies ?? [];
              parent.replies.push(newPost);
            } else {
              // Flat fallback: append to mainPost replies
              this.mainPost!.replies.push(newPost);
            }
          }
        },
        error: () => {
          this.submitting = false;
          this.notificationService.showError('Error', 'Failed to post reply. Please try again.');
        }
      });
  }

  toggleLike(post: PostDto): void {
    const wasLiked = post.isLikedByCurrentUser;
    post.isLikedByCurrentUser = !wasLiked;
    post.likeCount += wasLiked ? -1 : 1;

    const action$ = wasLiked
      ? this.forumService.unlikePost(post.id)
      : this.forumService.likePost(post.id);

    action$.pipe(takeUntil(this.destroy$)).subscribe({
      error: () => {
        post.isLikedByCurrentUser = wasLiked;
        post.likeCount += wasLiked ? 1 : -1;
      }
    });
  }

  confirmDeletePost(postId: string): void {
    this.postToDelete = postId;
    this.showDeleteModal = true;
  }

  deletePost(): void {
    if (!this.postToDelete || !this.mainPost) return;
    const idToDelete = this.postToDelete;
    this.forumService.deleteOwnPost(idToDelete)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.postToDelete = null;
          // Remove locally — no full reload
          this.mainPost!.replies = this.mainPost!.replies.filter(r => r.id !== idToDelete);
          for (const reply of this.mainPost!.replies) {
            if (reply.replies?.length) {
              reply.replies = reply.replies.filter(n => n.id !== idToDelete);
            }
          }
        },
        error: () => {
          this.showDeleteModal = false;
          this.notificationService.showError('Error', 'Failed to delete reply.');
        }
      });
  }

  getAuthorName(author: { firstName: string; lastName: string }): string {
    return `${author.firstName} ${author.lastName}`;
  }

  getInitials(author: { firstName: string; lastName: string }): string {
    return (author.firstName.charAt(0) + author.lastName.charAt(0)).toUpperCase();
  }

  isPlaceholder(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  isCurrentUser(userId: string): boolean {
    return this.authStore.currentUser?.id === userId;
  }

  openFlagModal(postId: string): void {
    this.postToFlag = postId;
    this.flagReason = '';
    this.flagDetails = '';
    this.showFlagModal = true;
    if (typeof document !== 'undefined') {
      document.body.classList.add('overflow-hidden');
    }
  }

  closeFlagModal(): void {
    this.showFlagModal = false;
    this.postToFlag = null;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  submitFlag(): void {
    if (!this.postToFlag || !this.flagReason) return;
    this.flagSubmitting = true;

    this.forumService.flagPost(this.postToFlag, this.flagReason, this.flagDetails)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.flagSubmitting = false;
          this.showFlagModal = false;
          this.postToFlag = null;
          if (typeof document !== 'undefined') {
            document.body.classList.remove('overflow-hidden');
          }
          this.notificationService.showSuccess('Report Submitted', 'Thank you. The post has been flagged for moderation.');
        },
        error: (err: any) => {
          this.flagSubmitting = false;
          let errMsg = 'Failed to flag post. Please try again.';
          if (err?.status === 409 || err?.error?.message?.includes('already flagged')) {
            errMsg = 'You have already flagged this post for review.';
          }
          this.notificationService.showError('Error', errMsg);
        }
      });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }
}
