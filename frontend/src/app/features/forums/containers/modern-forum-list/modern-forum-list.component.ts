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
import type { TopicSummaryDto, TagDto, PostDto, CreateTopicRequest } from '../../../../shared/models';

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
              <div class="p-4 flex items-center gap-4">
                <!-- Topic Dropdown -->
                <div class="relative">
                  <button
                    (click)="toggleTopicDropdown()"
                    class="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    <span>Topic</span>
                    <i class="bi bi-chevron-down text-xs"></i>
                  </button>
                  
                  <!-- Topic Dropdown Menu -->
                  <div *ngIf="showTopicDropdown" class="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-md shadow-lg z-10">
                    <button
                      *ngFor="let tag of popularTags.slice(0, 8)"
                      (click)="selectTopic(tag.name)"
                      class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {{ tag.name }}
                    </button>
                  </div>
                </div>
                
                <!-- Sort Button -->
                <button class="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors">
                  <i class="bi bi-list text-sm"></i>
                  <span>Sort</span>
                </button>
                
                <!-- Bookmarks Button -->
                <button class="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors">
                  <i class="bi bi-bookmark text-sm"></i>
                  <span>Bookmarks</span>
                </button>
                
                <!-- Search Icon -->
                <div class="ml-auto">
                  <button class="p-2 text-neutral-600 hover:text-neutral-800 transition-colors">
                    <i class="bi bi-search text-lg"></i>
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
                  (postLike)="onPostLike($event)"
                  (replySubmit)="onReplySubmit($event)"
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
            (startThreadClick)="navigateToCreateTopic()"
            (topicClick)="onTopicClick($event)"
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
  showCreateTopicModal: boolean = false;
  
  // Data
  topics: TopicSummaryDto[] = [];
  popularTags: TagDto[] = [];
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
  
  // Services
  private authStore = inject(UserAuthStore);
  private forumService = inject(ForumService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadTopics();
    this.loadPopularTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads topics from the API
   */
  loadTopics(): void {
    this.loading = true;
    this.error = null;
    
    this.forumService.getTopics(this.currentPage, this.pageSize)
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
   */
  toggleThreadExpansion(topicId: string): void {
    if (this.expandedThreads.has(topicId)) {
      this.expandedThreads.delete(topicId);
    } else {
      this.expandedThreads.add(topicId);
      this.loadThreadPosts(topicId);
    }
  }

  /**
   * Loads posts for a specific thread
   */
  loadThreadPosts(topicId: string): Promise<void> {
    console.log('Loading thread posts for topicId:', topicId);
    this.threadLoading.add(topicId);
    this.threadErrors.delete(topicId);
    
    return new Promise((resolve, reject) => {
      this.forumService.getTopicPosts(topicId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (posts) => {
            console.log('Loaded posts for topicId:', topicId, 'Posts:', posts);
            this.threadPosts.set(topicId, posts);
            this.threadLoading.delete(topicId);
            resolve();
          },
          error: (error) => {
            console.error('Error loading posts for topicId:', topicId, error);
            this.threadErrors.set(topicId, 'Failed to load posts');
            this.threadLoading.delete(topicId);
            reject(error);
          }
        });
    });
  }

  /**
   * Handles thread like events
   */
  onThreadLike(topicId: string): void {
    // Implement thread like logic
  }

  /**
   * Handles thread reply events
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
      // Expand thread first, then open reply form
      this.expandedThreads.add(topicId);
      this.loadThreadPosts(topicId);
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
    // Implement post like logic
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
    console.log('Reply submit event:', event);
    this.replySubmitting.add(event.postId);
    
    // Get the topicId from the expanded threads
    const topicId = this.getTopicIdFromPostId(event.postId);
    console.log('Found topicId:', topicId);
    if (!topicId) {
      console.error('Could not find topicId for postId:', event.postId);
      this.replySubmitting.delete(event.postId);
      return;
    }
    
    this.forumService.createReply(topicId, event.postId, event.content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reply) => {
          console.log('Reply created successfully:', reply);
          this.replySubmitting.delete(event.postId);
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
    // Implement topic filtering
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
   * Gets topic ID from post ID (helper method)
   */
  private getTopicIdFromPostId(postId: string): string | null {
    for (const [topicId, posts] of this.threadPosts.entries()) {
      if (posts.some(post => post.id === postId)) {
        return topicId;
      }
    }
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
}
