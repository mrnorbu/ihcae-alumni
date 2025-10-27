import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { ForumNavigationTabsComponent } from '../../components/forum-navigation-tabs/forum-navigation-tabs.component';
import { ModernThreadCardComponent } from '../../components/modern-thread-card/modern-thread-card.component';
import { ModernExpandedThreadComponent } from '../../components/modern-expanded-thread/modern-expanded-thread.component';
import { ModernForumSidebarComponent } from '../../components/modern-forum-sidebar/modern-forum-sidebar.component';
import { CreateTopicModalComponent } from '../../components/create-topic-modal/create-topic-modal.component';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import { ForumService } from '../../services/forum.service';
import type { TopicSummaryDto, TagDto, PostDto, CreateTopicRequest, TopUserDto } from '../../../../shared/models';

/**
 * Modern Forum List Component
 * 
 * Main container for the redesigned forum page with clean, minimalistic design.
 * Integrates all new components following the target design pattern.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-forum-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HeaderComponent, 
    FooterComponent,
    ForumNavigationTabsComponent,
    ModernThreadCardComponent,
    ModernExpandedThreadComponent,
    ModernForumSidebarComponent,
    CreateTopicModalComponent
  ],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
      
      <!-- Forum Navigation Tabs -->
      <app-forum-navigation-tabs
        [activeTab]="activeTab"
        (tabChange)="onTabChange($event)"
      ></app-forum-navigation-tabs>
      
      <!-- Main Content Container -->
      <div class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex gap-6">
          
          <!-- Main Content Area -->
          <div class="flex-1 min-w-0">
            <!-- Threads Header with Filter Bar -->
            <div class="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
              <div class="p-4 border-b border-neutral-200">
                <h1 class="text-xl font-bold text-neutral-900">Threads</h1>
              </div>
              
              <!-- Filter and Sort Bar -->
              <div class="p-4 space-y-3">
                <div class="flex items-center gap-4">
                  <!-- Topic Dropdown -->
                  <div class="relative">
                    <button
                      (click)="toggleTopicDropdown()"
                      class="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                      [class.bg-blue-50]="selectedTagFilter"
                      [class.border-blue-300]="selectedTagFilter"
                    >
                      <span>{{ selectedTagFilter || 'Topic' }}</span>
                      <i class="bi bi-chevron-down text-xs"></i>
                    </button>
                    
                    <!-- Topic Dropdown Menu -->
                    <div *ngIf="showTopicDropdown" class="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-md shadow-lg z-10">
                      <button
                        *ngIf="selectedTagFilter"
                        (click)="clearTagFilter(); toggleTopicDropdown()"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-b border-neutral-200"
                      >
                        <i class="bi bi-x-circle mr-2"></i>Clear Filter
                      </button>
                      <button
                        *ngFor="let tag of popularTags.slice(0, 8)"
                        (click)="filterByTag(tag.name); toggleTopicDropdown()"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        [class.bg-blue-50]="selectedTagFilter === tag.name"
                      >
                        {{ tag.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Sort Dropdown -->
                  <div class="relative">
                    <button
                      (click)="showSortDropdown = !showSortDropdown"
                      class="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      <i class="bi bi-list text-sm"></i>
                      <span>{{ getSortLabel() }}</span>
                      <i class="bi bi-chevron-down text-xs"></i>
                    </button>
                    
                    <!-- Sort Dropdown Menu -->
                    <div *ngIf="showSortDropdown" class="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-md shadow-lg z-10">
                      <button
                        (click)="onSortChange('recent'); showSortDropdown = false"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        [class.bg-blue-50]="sortBy === 'recent'"
                      >
                        Most Recent
                      </button>
                      <button
                        (click)="onSortChange('oldest'); showSortDropdown = false"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        [class.bg-blue-50]="sortBy === 'oldest'"
                      >
                        Oldest First
                      </button>
                      <button
                        (click)="onSortChange('popular'); showSortDropdown = false"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        [class.bg-blue-50]="sortBy === 'popular'"
                      >
                        Most Popular
                      </button>
                      <button
                        (click)="onSortChange('mostdiscussed'); showSortDropdown = false"
                        class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        [class.bg-blue-50]="sortBy === 'mostdiscussed'"
                      >
                        Most Discussed
                      </button>
                    </div>
                  </div>
                  
                  <!-- Search Bar -->
                  <div class="ml-auto flex items-center gap-2">
                    <div class="relative">
                      <input
                        type="text"
                        [(ngModel)]="searchQuery"
                        (keyup.enter)="onSearch()"
                        placeholder="Search discussions..."
                        class="pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                      <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>
                      <button
                        *ngIf="searchQuery"
                        (click)="clearSearch()"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        <i class="bi bi-x-circle"></i>
                      </button>
                    </div>
                    <button
                      (click)="onSearch()"
                      class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
                
                <!-- Active Filters Display -->
                <div *ngIf="selectedAuthorName || selectedTagFilter || searchQuery" class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm text-neutral-600">Active filters:</span>
                  
                  <span *ngIf="selectedAuthorName" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Author: {{ selectedAuthorName }}
                    <button (click)="clearAuthorFilter()" class="hover:text-blue-900">
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                  
                  <span *ngIf="selectedTagFilter" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Tag: {{ selectedTagFilter }}
                    <button (click)="clearTagFilter()" class="hover:text-blue-900">
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                  
                  <span *ngIf="searchQuery" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Search: "{{ searchQuery }}"
                    <button (click)="clearSearch()" class="hover:text-blue-900">
                      <i class="bi bi-x"></i>
                    </button>
                  </span>
                  
                  <button
                    (click)="clearAllFilters()"
                    class="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="space-y-3">
              <div *ngFor="let i of [1,2,3,4,5]" class="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse">
                <div class="flex gap-4">
                  <div class="w-10 h-10 bg-neutral-200 rounded-full"></div>
                  <div class="flex-1">
                    <div class="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                    <div class="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                    <div class="h-4 bg-neutral-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div *ngIf="error" class="bg-white border border-red-200 rounded-lg p-4">
              <div class="flex items-center gap-2 text-red-800">
                <i class="bi bi-exclamation-triangle text-lg"></i>
                <p class="text-sm">{{ error }}</p>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && !error && topics.length === 0" class="bg-white rounded-lg shadow-sm border border-neutral-200 text-center py-12">
              <i class="bi bi-chat-left-text text-6xl text-neutral-300 mb-4"></i>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">No threads yet</h3>
              <p class="text-neutral-500 mb-4">Be the first to start a discussion!</p>
              <button
                (click)="navigateToCreateTopic()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Create First Thread
              </button>
            </div>

            <!-- Threads List -->
            <div *ngIf="!loading && !error && topics.length > 0" class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              <div *ngFor="let topic of topics; let i = index">
                <!-- Thread Card -->
                <app-modern-thread-card
                  [topic]="topic"
                  (commentsClick)="toggleThreadExpansion($event)"
                  (likeClick)="onThreadLike($event)"
                  (replyClick)="onThreadReply($event)"
                  (authorClick)="filterByAuthor($event.userId, $event.userName)"
                ></app-modern-thread-card>

                <!-- Expanded Thread Content -->
                <app-modern-expanded-thread
                  *ngIf="expandedThreads.has(topic.id)"
                  [topic]="topic"
                  [posts]="threadPosts.get(topic.id) || []"
                  [loading]="threadLoading.has(topic.id)"
                  [error]="threadErrors.get(topic.id) || null"
                  [replySubmitting]="replySubmitting"
                  [activeReplyForm]="activeReplyForm"
                  [currentUserId]="getCurrentUserId()"
                  (postLike)="onPostLike($event)"
                  (replySubmit)="onReplySubmit($event)"
                  (postDelete)="onPostDelete($event)"
                  (retryClick)="loadThreadPosts(topic.id)"
                  (collapseClick)="onThreadCollapse(topic.id)"
                ></app-modern-expanded-thread>
              </div>
            </div>

            <!-- Pagination -->
            <div *ngIf="!loading && !error && totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
              <button
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div class="flex items-center gap-1">
                <button
                  *ngFor="let page of getPageNumbers()"
                  (click)="goToPage(page)"
                  [class.bg-blue-600]="page === currentPage"
                  [class.text-white]="page === currentPage"
                  [class.hover:bg-neutral-50]="page !== currentPage"
                  class="px-3 py-2 text-sm border border-neutral-300 rounded-md transition-colors"
                >
                  {{ page }}
                </button>
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
          
          <!-- Right Sidebar -->
          <app-modern-forum-sidebar
            [topics]="topics"
            [popularTags]="popularTags"
            [topUsers]="topUsers"
            (startThreadClick)="navigateToCreateTopic()"
            (topicClick)="onTopicClick($event)"
            (userClick)="filterByAuthor($event.userId, $event.userName)"
          ></app-modern-forum-sidebar>
        </div>
      </div>
      
      <!-- Footer component -->
      <app-footer></app-footer>
      
      <!-- Create Topic Modal -->
      <app-create-topic-modal
        [isVisible]="showCreateTopicModal"
        (submit)="onCreateTopicSubmit($event)"
        (cancel)="onCreateTopicCancel()"
      ></app-create-topic-modal>
    </div>
  `,
  styles: []
})
export class ModernForumListComponent implements OnInit, OnDestroy {
  // Component state
  activeTab: string = 'community';
  loading: boolean = false;
  error: string | null = null;
  showTopicDropdown: boolean = false;
  showSortDropdown: boolean = false;
  showCreateTopicModal: boolean = false;
  
  // Data
  topics: TopicSummaryDto[] = [];
  popularTags: TagDto[] = [];
  topUsers: TopUserDto[] = [];
  expandedThreads: Set<string> = new Set();
  threadPosts: Map<string, PostDto[]> = new Map();
  threadLoading: Set<string> = new Set();
  threadErrors: Map<string, string> = new Map();
  replySubmitting: Set<string> = new Set();
  activeReplyForm: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  
  // Filtering and Sorting
  searchQuery: string = '';
  selectedAuthorId?: string;
  selectedAuthorName?: string;
  sortBy: string = 'recent';
  selectedTagFilter?: string;
  
  // Services
  private authStore = inject(UserAuthStore);
  private forumService = inject(ForumService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadTopics();
    this.loadPopularTags();
    this.loadTopUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads topics from the API with current filters
   */
  loadTopics(): void {
    this.loading = true;
    this.error = null;
    
    const tags = this.selectedTagFilter ? [this.selectedTagFilter] : undefined;
    
    this.forumService.getTopics(
      this.currentPage, 
      this.pageSize, 
      tags, 
      this.searchQuery || undefined, 
      this.selectedAuthorId, 
      this.sortBy
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.topics = response.items;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load topics. Please try again.';
          this.loading = false;
        }
      });
  }

  /**
   * Loads popular tags
   */
  loadPopularTags(): void {
    this.forumService.getPopularTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => {
          this.popularTags = tags;
        },
        error: (error) => {
          console.error('Failed to load popular tags:', error);
        }
      });
  }

  /**
   * Loads top users
   */
  loadTopUsers(): void {
    this.forumService.getTopUsers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.topUsers = users;
        },
        error: (error) => {
          console.error('Failed to load top users:', error);
        }
      });
  }

  /**
   * Handles tab change events
   */
  onTabChange(tab: string): void {
    this.activeTab = tab;
    // Handle different tab logic here
  }

  /**
   * Toggles topic dropdown
   */
  toggleTopicDropdown(): void {
    this.showTopicDropdown = !this.showTopicDropdown;
  }

  /**
   * Selects a topic filter
   */
  selectTopic(topicName: string): void {
    this.showTopicDropdown = false;
    // Implement topic filtering logic
  }

  /**
   * Toggles thread expansion
   * Only expands if there are comments to show
   */
  toggleThreadExpansion(topicId: string): void {
    const topic = this.topics.find(t => t.id === topicId);
    
    if (this.expandedThreads.has(topicId)) {
      // Already expanded, collapse it
      this.expandedThreads.delete(topicId);
    } else {
      // Only expand if there are comments (postCount > 1, because main post counts as 1)
      if (topic && topic.postCount > 1) {
        this.expandedThreads.add(topicId);
        this.loadThreadPosts(topicId);
      }
      // If postCount is 0 or 1, don't expand (no replies to show)
    }
  }

  /**
   * Loads posts for a specific thread
   */
  loadThreadPosts(topicId: string): Promise<void> {
    console.log('📥 Loading thread posts for topicId:', topicId);
    this.threadLoading.add(topicId);
    this.threadErrors.delete(topicId);
    
    return new Promise((resolve, reject) => {
      this.forumService.getTopicPosts(topicId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (posts) => {
            console.log('📦 Loaded posts for topicId:', topicId);
            console.log('  Total posts:', posts.length);
            posts.forEach((post, index) => {
              console.log(`  Post ${index}:`, {
                id: post.id,
                author: `${post.author.firstName} ${post.author.lastName}`,
                repliesCount: post.replies?.length || 0,
                content: post.content.substring(0, 50) + '...'
              });
              if (post.replies && post.replies.length > 0) {
                console.log(`    Replies (${post.replies.length}):`);
                post.replies.forEach((reply, rIndex) => {
                  console.log(`      Reply ${rIndex}:`, {
                    id: reply.id,
                    author: `${reply.author.firstName} ${reply.author.lastName}`,
                    parentAuthor: reply.parentAuthor ? `${reply.parentAuthor.firstName} ${reply.parentAuthor.lastName}` : 'none',
                    content: reply.content.substring(0, 30) + '...'
                  });
                });
              }
            });
            this.threadPosts.set(topicId, posts);
            this.threadLoading.delete(topicId);
            resolve();
          },
          error: (error) => {
            console.error('❌ Error loading posts for topicId:', topicId, error);
            this.threadErrors.set(topicId, 'Failed to load posts');
            this.threadLoading.delete(topicId);
            reject(error);
          }
        });
    });
  }

  /**
   * Handles thread like events
   * Likes the main post of the thread
   */
  onThreadLike(topicId: string): void {
    console.log('👍 Liking thread:', topicId);
    
    // Find the topic
    const topic = this.topics.find(t => t.id === topicId);
    console.log('Found topic:', topic);
    console.log('Main post ID:', topic?.mainPostId);
    
    if (!topic || !topic.mainPostId || topic.mainPostId === '00000000-0000-0000-0000-000000000000') {
      console.error('❌ Cannot like: Topic has no main post yet');
      console.error('Topic details:', {
        id: topic?.id,
        title: topic?.title,
        mainPostId: topic?.mainPostId,
        postCount: topic?.postCount
      });
      return;
    }

    // Store original state for rollback on error
    const originalLikedState = topic.isMainPostLikedByCurrentUser;
    const originalLikeCount = topic.totalLikes;

    // Optimistically update UI immediately
    topic.isMainPostLikedByCurrentUser = !topic.isMainPostLikedByCurrentUser;
    topic.totalLikes = topic.isMainPostLikedByCurrentUser ? topic.totalLikes + 1 : topic.totalLikes - 1;

    // Toggle like based on original state
    if (originalLikedState) {
      // Unlike
      this.forumService.unlikePost(topic.mainPostId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Thread unliked');
            // UI already updated optimistically
          },
          error: (error) => {
            console.error('❌ Error unliking thread:', error);
            // Rollback optimistic update
            topic.isMainPostLikedByCurrentUser = originalLikedState;
            topic.totalLikes = originalLikeCount;
          }
        });
    } else {
      // Like
      this.forumService.likePost(topic.mainPostId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Thread liked');
            // UI already updated optimistically
          },
          error: (error) => {
            console.error('❌ Error liking thread:', error);
            // Rollback optimistic update
            topic.isMainPostLikedByCurrentUser = originalLikedState;
            topic.totalLikes = originalLikeCount;
          }
        });
    }
  }

  /**
   * Handles thread reply events
   * Always expands the thread and shows reply form
   */
  onThreadReply(topicId: string): void {
    if (this.expandedThreads.has(topicId)) {
      // If thread is already expanded, open reply form for first post
      this.loadThreadPosts(topicId).then(() => {
        const posts = this.threadPosts.get(topicId);
        if (posts && posts.length > 0) {
          // Open reply form for the first post (main post)
          this.openReplyFormForPost(posts[0].id);
        }
      });
    } else {
      // Expand thread and open reply form (even if 0 replies)
      this.expandedThreads.add(topicId);
      this.loadThreadPosts(topicId).then(() => {
        const posts = this.threadPosts.get(topicId);
        if (posts && posts.length > 0) {
          // Open reply form for the first post (main post)
          this.openReplyFormForPost(posts[0].id);
        }
      });
    }
  }

  /**
   * Opens reply form for a specific post
   */
  private openReplyFormForPost(postId: string): void {
    // This will be handled by the expanded thread component
    // We need to emit an event to the expanded thread component
    this.activeReplyForm = postId;
  }

  /**
   * Handles post like events
   */
  onPostLike(postId: string): void {
    console.log('👍 Liking post:', postId);
    
    // Find the topic this post belongs to
    const topicId = this.getTopicIdFromPostId(postId);
    if (!topicId) {
      console.error('Could not find topic for post:', postId);
      return;
    }

    const posts = this.threadPosts.get(topicId);
    if (!posts) return;

    // Find the post (could be main post or reply)
    let targetPost: PostDto | undefined;
    for (const post of posts) {
      if (post.id === postId) {
        targetPost = post;
        break;
      }
      if (post.replies) {
        targetPost = post.replies.find(r => r.id === postId);
        if (targetPost) break;
      }
    }

    if (!targetPost) {
      console.error('Post not found:', postId);
      return;
    }

    // Store original state for rollback on error
    const originalLikedState = targetPost.isLikedByCurrentUser;
    const originalLikeCount = targetPost.likeCount;

    // Optimistically update UI immediately
    targetPost.isLikedByCurrentUser = !targetPost.isLikedByCurrentUser;
    targetPost.likeCount = targetPost.isLikedByCurrentUser ? targetPost.likeCount + 1 : targetPost.likeCount - 1;

    // Toggle like based on original state
    if (originalLikedState) {
      // Unlike
      this.forumService.unlikePost(postId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Post unliked');
            // UI already updated optimistically
          },
          error: (error) => {
            console.error('❌ Error unliking post:', error);
            // Rollback optimistic update
            targetPost!.isLikedByCurrentUser = originalLikedState;
            targetPost!.likeCount = originalLikeCount;
          }
        });
    } else {
      // Like
      this.forumService.likePost(postId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Post liked');
            // UI already updated optimistically
          },
          error: (error) => {
            console.error('❌ Error liking post:', error);
            // Rollback optimistic update
            targetPost!.isLikedByCurrentUser = originalLikedState;
            targetPost!.likeCount = originalLikeCount;
          }
        });
    }
  }

  /**
   * Handles thread collapse
   */
  onThreadCollapse(topicId: string): void {
    this.expandedThreads.delete(topicId);
    this.activeReplyForm = null;
  }

  /**
   * Handles reply submission
   */
  onReplySubmit(event: {postId: string, content: string}): void {
    console.log('=== Reply Submit Event ===');
    console.log('Replying to postId:', event.postId);
    console.log('Content:', event.content);
    console.log('Current threadPosts:', this.threadPosts);
    
    this.replySubmitting.add(event.postId);
    
    // Get the topicId from the expanded threads
    const topicId = this.getTopicIdFromPostId(event.postId);
    console.log('Found topicId:', topicId);
    
    if (!topicId) {
      console.error('❌ Could not find topicId for postId:', event.postId);
      console.error('Available topics:', Array.from(this.threadPosts.keys()));
      this.replySubmitting.delete(event.postId);
      return;
    }
    
    console.log('✅ Creating reply in topic:', topicId);
    
    this.forumService.createReply(topicId, event.postId, event.content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reply) => {
          console.log('Reply created successfully:', reply);
          this.replySubmitting.delete(event.postId);
          // Close the reply form
          this.activeReplyForm = null;
          // Refresh thread posts
          this.loadThreadPosts(topicId);
        },
        error: (error) => {
          console.error('Error creating reply:', error);
          this.replySubmitting.delete(event.postId);
          // Handle error
        }
      });
  }

  /**
   * Handles topic click from sidebar
   */
  onTopicClick(topicName: string): void {
    this.filterByTag(topicName);
  }

  /**
   * Navigates to create topic page
   */
  navigateToCreateTopic(): void {
    this.showCreateTopicModal = true;
  }

  /**
   * Handles create topic modal submission
   */
  onCreateTopicSubmit(request: CreateTopicRequest): void {
    this.forumService.createTopic(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (topic) => {
          console.log('Topic created successfully:', topic);
          this.showCreateTopicModal = false;
          // Refresh topics list
          this.loadTopics();
        },
        error: (error) => {
          console.error('Error creating topic:', error);
          // Handle error - could show a toast notification
        }
      });
  }

  /**
   * Handles create topic modal cancellation
   */
  onCreateTopicCancel(): void {
    this.showCreateTopicModal = false;
  }

  /**
   * Gets the current user ID from auth store
   */
  getCurrentUserId(): string {
    const user = this.authStore.currentUser;
    return user?.id || '';
  }

  /**
   * Handles post deletion
   */
  onPostDelete(postId: string): void {
    this.forumService.deleteOwnPost(postId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('✅ Post deleted successfully');
          // Find which topic this post belongs to
          let topicId: string | null = null;
          for (const [tid, posts] of this.threadPosts.entries()) {
            const hasPost = posts.some(p => p.id === postId || p.replies?.some(r => r.id === postId));
            if (hasPost) {
              topicId = tid;
              break;
            }
          }
          
          if (topicId) {
            // Try to reload the thread
            this.loadThreadPosts(topicId).catch(() => {
              // If reload fails (e.g., main post was deleted), close the thread and reload topics
              console.log('Thread no longer valid, reloading topics list');
              this.expandedThreads.delete(topicId!);
              this.threadPosts.delete(topicId!);
              this.loadTopics();
            });
          }
        },
        error: (error) => {
          console.error('❌ Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
  }

  /**
   * Gets topic ID from post ID (helper method)
   * Searches both top-level posts and nested replies
   */
  private getTopicIdFromPostId(postId: string): string | null {
    console.log('🔍 Searching for postId:', postId);
    
    for (const [topicId, posts] of this.threadPosts.entries()) {
      console.log(`  Checking topic ${topicId} with ${posts.length} posts`);
      
      // Check top-level posts (main post)
      const mainPostMatch = posts.find(post => post.id === postId);
      if (mainPostMatch) {
        console.log('  ✅ Found in main posts');
        return topicId;
      }
      
      // Check nested replies (all replies are in the first post's replies array)
      for (const post of posts) {
        console.log(`    Post ${post.id} has ${post.replies?.length || 0} replies`);
        if (post.replies && post.replies.length > 0) {
          const replyMatch = post.replies.find(reply => reply.id === postId);
          if (replyMatch) {
            console.log('    ✅ Found in replies');
            return topicId;
          }
        }
      }
    }
    
    console.log('  ❌ Not found in any topic');
    return null;
  }

  /**
   * Gets page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Goes to a specific page
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.loadTopics();
  }

  /**
   * Goes to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Goes to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Handles search input
   */
  onSearch(): void {
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Clears search query
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Handles sort change
   */
  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Filters by author (when clicking on a user)
   */
  filterByAuthor(userId: string, userName: string): void {
    this.selectedAuthorId = userId;
    this.selectedAuthorName = userName;
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Clears author filter
   */
  clearAuthorFilter(): void {
    this.selectedAuthorId = undefined;
    this.selectedAuthorName = undefined;
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Filters by tag
   */
  filterByTag(tagName: string): void {
    this.selectedTagFilter = tagName;
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Clears tag filter
   */
  clearTagFilter(): void {
    this.selectedTagFilter = undefined;
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Clears all filters
   */
  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedAuthorId = undefined;
    this.selectedAuthorName = undefined;
    this.selectedTagFilter = undefined;
    this.sortBy = 'recent';
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Gets the label for the current sort option
   */
  getSortLabel(): string {
    switch (this.sortBy) {
      case 'oldest':
        return 'Oldest First';
      case 'popular':
        return 'Most Popular';
      case 'mostdiscussed':
        return 'Most Discussed';
      default:
        return 'Most Recent';
    }
  }
}
