import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import type { TopicSummaryDto, PaginatedResult, TagDto, TopicDetailDto, PostDto, CreatePostRequest } from '../../../../shared/models';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { TagFilterComponent } from '../../components/tag-filter/tag-filter.component';
import { TopicCardComponent } from '../../components/topic-card/topic-card.component';
import { ForumSidebarComponent } from '../../components/forum-sidebar/forum-sidebar.component';
import { UserAuthStore } from '../../../../core/state/user-auth.store';

/**
 * Container component for displaying a list of forum topics.
 * Includes pagination, search, and create topic functionality.
 */
@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, PostCardComponent, TagFilterComponent, TopicCardComponent, ForumSidebarComponent],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
      
      <!-- Main Content Container - flex-1 to push footer down -->
      <div class="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
        <div class="flex gap-3">
          
          <!-- Left Sidebar -->
          <app-forum-sidebar
            [topics]="topics"
            [popularTags]="popularTags"
            [totalCount]="totalCount"
            [activeFilter]="activeFilter"
            (filterChange)="setActiveFilter($event)"
            (topicClick)="onTopicClick($event)"
            (tagClick)="addTag($event)"
          ></app-forum-sidebar>
          
          <!-- Main Content Area -->
          <div class="flex-1 min-w-0 space-y-4">
        <!-- Header with Action Bar -->
        <div class="card-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 class="heading-page">Discussion Forums</h1>
            <p class="text-subtitle">Connect with fellow alumni and share your thoughts</p>
          </div>
          <button
            (click)="navigateToCreateTopic()"
            class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <i class="bi bi-plus-lg"></i>
            <span>New Topic</span>
          </button>
        </div>

        <!-- Tag Filter Section -->
        <app-tag-filter
          [selectedTags]="selectedTags"
          [popularTags]="popularTags"
          [tagSuggestions]="tagSuggestions"
          [showTagSuggestions]="showTagSuggestions"
          (tagAdded)="addTag($event)"
          (tagRemoved)="removeTag($event)"
          (allTagsCleared)="clearAllTags()"
          (tagSearchChanged)="onTagSearchChange($event)"
        ></app-tag-filter>

        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-3">
          <div *ngFor="let i of [1,2,3,4,5]" class="post-card animate-pulse">
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-neutral-200 rounded-full"></div>
              <div class="flex-1">
                <div class="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="card-elevated bg-error-50 border-error-200">
          <div class="flex items-center gap-2 text-error-800">
            <i class="bi bi-exclamation-triangle text-lg"></i>
            <p class="text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && topics.length === 0" class="card-elevated text-center py-12">
          <i class="bi bi-chat-left-text text-6xl text-neutral-300 mb-4"></i>
          <h3 class="heading-section">No topics yet</h3>
          <p class="text-body text-neutral-500 mb-4">Be the first to start a discussion!</p>
          <button
            (click)="navigateToCreateTopic()"
            class="btn-primary"
          >
            Create First Topic
          </button>
        </div>

        <!-- Topics List - Using Topic Card Component -->
        <div *ngIf="!loading && !error && topics.length > 0" class="space-y-1">
          <div *ngFor="let topic of topics; let i = index" class="space-y-1">
            <app-topic-card
              [topic]="topic"
              [isExpanded]="expandedTopics.has(topic.id)"
              [showAdminControls]="authStore.isAdmin()"
              (expansionToggled)="toggleTopicExpansion($event)"
              (pinToggled)="togglePinTopic($event)"
              (lockToggled)="toggleLockTopic($event)"
              (topicDeleted)="deleteTopic($event)"
            ></app-topic-card>

            <!-- Expanded Content -->
            <div *ngIf="expandedTopics.has(topic.id)" class="bg-blue-50 rounded-lg border border-blue-200 p-3 mt-1 border-t-2 border-t-blue-300 relative">
              <!-- Connection Indicator -->
              <div class="absolute -top-1 left-6 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
              <!-- Loading State for Topic Details -->
              <div *ngIf="topicDetailsLoading.has(topic.id)" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span class="ml-3 text-neutral-600 text-sm">Loading posts...</span>
              </div>

              <!-- Error State for Topic Details -->
              <div *ngIf="topicDetailsError.has(topic.id)" class="text-center py-8">
                <div class="text-error-600 mb-3">
                  <i class="bi bi-exclamation-triangle text-2xl"></i>
                </div>
                <p class="text-neutral-600 mb-3 text-sm">{{ topicDetailsError.get(topic.id) }}</p>
                <button 
                  (click)="loadTopicDetails(topic.id)" 
                  class="btn-primary btn-sm"
                >
                  Try Again
                </button>
              </div>

              <!-- Topic Posts -->
              <div *ngIf="topicDetails.has(topic.id) && !topicDetailsLoading.has(topic.id) && !topicDetailsError.has(topic.id)" class="space-y-4">
                <!-- Thread Container with Blue Background -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <!-- Thread Header -->
                  <div class="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 class="text-sm font-semibold text-blue-800">Discussion Thread</h3>
                    <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {{ topicDetails.get(topic.id)!.posts.length }} posts
                    </span>
                  </div>

                  <!-- Posts in Thread -->
                  <div class="space-y-3">
                    <div *ngFor="let post of topicDetails.get(topic.id)!.posts" class="space-y-3">
                      <!-- Main Post Card -->
                      <app-post-card
                        [post]="post"
                        [isNested]="false"
                        [isAdmin]="authStore.isAdmin()"
                        [isLocked]="topic.isLocked"
                        (like)="onPostLiked(post.id)"
                        (reply)="onReplyToPost(post.id, topic.id)"
                      ></app-post-card> Now you again reduce the reply size of the nested ones, the first reply of the post.

                      <!-- Reply Form for this specific post -->
                      <div *ngIf="activeReplyForm === post.id && !topic.isLocked" class="bg-white border border-blue-300 rounded-lg p-4 ml-8 shadow-sm">
                        <h4 class="text-lg font-semibold text-blue-800 mb-4">Reply to {{ getAuthorName(post.author) }}</h4>
                        <form (ngSubmit)="submitReplyToPost(post.id, topic.id)">
                          <textarea
                            [(ngModel)]="replyContent[post.id]"
                            [name]="'reply-' + post.id"
                            rows="4"
                            placeholder="Write your reply here..."
                            class="w-full px-4 py-3 text-base border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4 resize-none"
                            required
                          ></textarea>
                          <div class="flex gap-3">
                            <button 
                              type="submit" 
                              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 text-base rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" 
                              [disabled]="!replyContent[post.id] || !replyContent[post.id].trim() || replySubmitting.has(post.id)"
                            >
                              <i class="bi bi-send"></i>
                              <span *ngIf="!replySubmitting.has(post.id)">Post Reply</span>
                              <span *ngIf="replySubmitting.has(post.id)">Posting...</span>
                            </button>
                            <button 
                              type="button" 
                              (click)="cancelReply(post.id)" 
                              class="border border-blue-300 hover:bg-blue-50 text-blue-700 font-medium px-4 py-2.5 text-base rounded-lg transition-colors duration-200"
                              [disabled]="replySubmitting.has(post.id)"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Locked Topic Message -->
                <div *ngIf="topic.isLocked" class="card-elevated mt-4 bg-neutral-50">
                  <div class="flex items-center gap-3 text-neutral-600">
                    <i class="bi bi-lock text-lg"></i>
                    <div>
                      <h4 class="font-medium">Topic Locked</h4>
                      <p class="text-sm">This discussion has been locked by an administrator. No new replies can be posted.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="!loading && !error && totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
          <button
            (click)="previousPage()"
            [disabled]="currentPage === 1"
            class="btn-outline btn-sm inline-flex items-center gap-2"
            [class.opacity-50]="currentPage === 1"
            [class.cursor-not-allowed]="currentPage === 1"
          >
            <i class="bi bi-chevron-left"></i>
            <span>Previous</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              [class.bg-primary-600]="page === currentPage"
              [class.text-white]="page === currentPage"
              [class.hover:bg-neutral-50]="page !== currentPage"
              class="px-3 py-1.5 border border-neutral-300 rounded-lg transition-colors text-sm font-medium"
            >
              {{ page }}
            </button>
          </div>

          <button
            (click)="nextPage()"
            [disabled]="currentPage === totalPages"
            class="btn-outline btn-sm inline-flex items-center gap-2"
            [class.opacity-50]="currentPage === totalPages"
            [class.cursor-not-allowed]="currentPage === totalPages"
          >
            <span>Next</span>
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
          </div>
        </div>
      </div>
      
      <!-- Footer component - full width at bottom -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [],
})
export class ForumListComponent implements OnInit {
  // Topic data
  topics: TopicSummaryDto[] = []; // List of topics to display
  
  // UI state
  loading: boolean = false; // Loading indicator
  error: string | null = null; // Error message
  
  // Pagination state
  currentPage: number = 1; // Current page number
  pageSize: number = 20; // Items per page
  totalPages: number = 1; // Total number of pages
  totalCount: number = 0; // Total number of topics
  
  // Search state
  searchQuery: string = ''; // Search query text
  searchTimeout: any; // Debounce timer for search
  
  // Expandable topics state
  expandedTopics = new Set<string>(); // Set of expanded topic IDs
  topicDetails = new Map<string, TopicDetailDto>(); // Cached topic details
  topicDetailsLoading = new Set<string>(); // Set of topics currently loading
  topicDetailsError = new Map<string, string>(); // Error messages for topics
  
  // Reply form state (per post)
  replyContent: { [postId: string]: string } = {}; // Reply content per post
  replySubmitting = new Set<string>(); // Set of posts with submitting replies
  activeReplyForm: string | null = null; // Currently active reply form
  
  // Admin state
  activeAdminMenu = signal<string | null>(null);

  // Navigation filter state
  activeFilter: string = 'all'; // Current active filter (all, yours, participated, trending, saved)

  // Tag filtering state
  selectedTags: string[] = []; // Currently selected tags for filtering
  popularTags: TagDto[] = []; // Popular tags for display
  tagSearchQuery: string = ''; // Tag search query for autocomplete
  tagSuggestions: TagDto[] = []; // Tag suggestions from search
  showTagSuggestions: boolean = false; // Whether to show tag suggestions dropdown

  constructor(
    private readonly forumService: ForumService,
    private readonly router: Router
  ) {}
  
  readonly authStore = inject(UserAuthStore);

  ngOnInit(): void {
    // Load topics and popular tags on component initialization
    this.loadTopics();
    this.loadPopularTags();
  }

  /**
   * Sets the active filter for navigation
   */
  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    // TODO: Implement filtering logic based on the selected filter
    console.log('Active filter set to:', filter);
  }

  /**
   * Loads topics from the API with current pagination settings.
   * Includes tag filtering if tags are selected.
   */
  loadTopics(): void {
    this.loading = true;
    this.error = null;

    // Pass selected tags to the API call
    const tagsToFilter = this.selectedTags.length > 0 ? this.selectedTags : undefined;

    this.forumService.getTopics(this.currentPage, this.pageSize, tagsToFilter).subscribe({
      next: (result: PaginatedResult<TopicSummaryDto>) => {
        this.topics = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = Math.ceil(result.totalCount / result.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load topics. Please try again later.';
        this.loading = false;
        console.error('Error loading topics:', err);
      },
    });
  }

  /**
   * Handles search input changes with debouncing.
   */
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      // Filter topics locally (or implement backend search)
      this.loadTopics();
    }, 500);
  }

  /**
   * Navigates to the topic detail page.
   */
  navigateToTopic(topicId: string): void {
    this.router.navigate(['/forums/topics', topicId]);
  }

  /**
   * Navigates to the create topic page.
   */
  navigateToCreateTopic(): void {
    this.router.navigate(['/forums/create']);
  }

  /**
   * Handles topic click events from sidebar
   */
  onTopicClick(topicId: string): void {
    // Navigate to topic or expand it
    this.toggleTopicExpansion(topicId);
  }

  /**
   * Gets the full name of the author.
   */
  getAuthorName(author: { firstName: string; lastName: string }): string {
    return `${author.firstName} ${author.lastName}`;
  }

  /**
   * Formats the last activity time as a relative time string.
   */
  getLastActivityTime(topic: TopicSummaryDto): string {
    const date = topic.lastReplyAt ? new Date(topic.lastReplyAt) : new Date(topic.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Navigates to the previous page.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTopics();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Navigates to the next page.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTopics();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Navigates to a specific page.
   */
  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTopics();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Generates an array of page numbers to display in pagination.
   * Shows a maximum of 5 pages centered around current page.
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  /**
   * Loads popular tags for display and filtering.
   */
  loadPopularTags(): void {
    this.forumService.getPopularTags(20).subscribe({
      next: (tags: TagDto[]) => {
        this.popularTags = tags;
      },
      error: (error) => {
        console.error('Error loading popular tags:', error);
        // Don't show error to user as this is not critical functionality
      }
    });
  }

  /**
   * Searches for tag suggestions based on user input.
   * Used for autocomplete when adding tags.
   */
  searchTagSuggestions(query: string): void {
    if (!query || query.length < 2) {
      this.tagSuggestions = [];
      this.showTagSuggestions = false;
      return;
    }

    this.forumService.searchTags(query, 10).subscribe({
      next: (tags: TagDto[]) => {
        // Filter out tags that are already selected
        this.tagSuggestions = tags.filter(tag => 
          !this.selectedTags.includes(tag.name)
        );
        this.showTagSuggestions = this.tagSuggestions.length > 0;
      },
      error: (error) => {
        console.error('Error searching tags:', error);
        this.tagSuggestions = [];
        this.showTagSuggestions = false;
      }
    });
  }

  /**
   * Adds a tag to the selected tags list.
   * Triggers a new search with the updated filter.
   */
  addTag(tagName: string): void {
    if (!this.selectedTags.includes(tagName) && this.selectedTags.length < 5) {
      this.selectedTags.push(tagName);
      this.tagSearchQuery = '';
      this.showTagSuggestions = false;
      this.currentPage = 1; // Reset to first page when filtering
      this.loadTopics();
    }
  }

  /**
   * Removes a tag from the selected tags list.
   * Triggers a new search with the updated filter.
   */
  removeTag(tagName: string): void {
    this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
    this.currentPage = 1; // Reset to first page when filtering
    this.loadTopics();
  }

  /**
   * Clears all selected tags and reloads topics.
   */
  clearAllTags(): void {
    this.selectedTags = [];
    this.currentPage = 1;
    this.loadTopics();
  }

  /**
   * Handles tag search input changes with debouncing.
   */
  onTagSearchChange(query: string): void {
    this.tagSearchQuery = query;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.searchTagSuggestions(query);
    }, 300);
  }

  /**
   * Handles clicking outside tag suggestions to close dropdown.
   */
  onTagSearchBlur(): void {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => {
      this.showTagSuggestions = false;
    }, 200);
  }

  /**
   * Gets trending topics for sidebar display.
   * Returns top 5 topics sorted by post count.
   */
  getTrendingTopics(): TopicSummaryDto[] {
    return [...this.topics]
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
  }

  /**
   * Gets author initials for avatar fallback.
   * Handles edge cases where names might be missing or empty.
   */
  getAuthorInitials(author: any): string {
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    
    // If both names are empty, use email or a default
    if (!firstName && !lastName) {
      const email = author.email || '';
      if (email) {
        return email.charAt(0).toUpperCase();
      }
      return 'U'; // Default for unknown user
    }
    
    // If only first name exists, use first two characters
    if (firstName && !lastName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    
    // If only last name exists, use first two characters
    if (!firstName && lastName) {
      return lastName.substring(0, 2).toUpperCase();
    }
    
    // Both names exist, use first character of each
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  /**
   * Formats a date for display
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  }

  /**
   * Toggles the expansion state of a topic.
   */
  toggleTopicExpansion(topicId: string): void {
    if (this.expandedTopics.has(topicId)) {
      // Collapse topic
      this.expandedTopics.delete(topicId);
    } else {
      // Expand topic
      this.expandedTopics.add(topicId);
      this.loadTopicDetails(topicId);
    }
  }

  /**
   * Loads topic details for a specific topic.
   */
  loadTopicDetails(topicId: string): void {
    // If already loaded, don't reload
    if (this.topicDetails.has(topicId)) {
      return;
    }

    this.topicDetailsLoading.add(topicId);
    this.topicDetailsError.delete(topicId);
    
    this.forumService.getTopicById(topicId).subscribe({
      next: (topic: TopicDetailDto) => {
        this.topicDetails.set(topicId, topic);
        this.topicDetailsLoading.delete(topicId);
      },
      error: (error) => {
        console.error('Error loading topic:', error);
        this.topicDetailsError.set(topicId, 'Failed to load topic details');
        this.topicDetailsLoading.delete(topicId);
      }
    });
  }

  /**
   * Handles reply button click for a specific post
   */
  onReplyToPost(postId: string, topicId: string): void {
    // Close any other active reply form
    this.activeReplyForm = this.activeReplyForm === postId ? null : postId;
  }

  /**
   * Submits a new reply to a specific post
   */
  submitReplyToPost(postId: string, topicId: string): void {
    const content = this.replyContent[postId];
    if (!content?.trim() || this.replySubmitting.has(postId)) {
      return;
    }

    this.replySubmitting.add(postId);

    const request: CreatePostRequest = {
      content: content.trim(),
      parentPostId: postId
    };

    this.forumService.createPost(topicId, request).subscribe({
      next: () => {
        this.replyContent[postId] = '';
        this.replySubmitting.delete(postId);
        this.activeReplyForm = null;
        // Reload topic details to show new reply
        this.topicDetails.delete(topicId);
        this.loadTopicDetails(topicId);
        // Also refresh the main topics list to update post count
        this.loadTopics();
      },
      error: (err) => {
        console.error('Error posting reply:', err);
        this.replySubmitting.delete(postId);
      }
    });
  }

  /**
   * Cancels the reply form for a specific post
   */
  cancelReply(postId: string): void {
    this.activeReplyForm = null;
    this.replyContent[postId] = '';
  }

  /**
   * Handles post like events from topic detail
   */
  onPostLiked(postId: string): void {
    // Find the post to determine if it's currently liked
    let postToLike: any = null;
    let topicId: string = '';
    
    for (const [tid, topic] of this.topicDetails) {
      const post = topic.posts.find(p => p.id === postId);
      if (post) {
        postToLike = post;
        topicId = tid;
        break;
      }
    }
    
    if (postToLike) {
      // Call the appropriate service method based on current like status
      const likeAction = postToLike.isLikedByCurrentUser 
        ? this.forumService.unlikePost(postId)
        : this.forumService.likePost(postId);
      
      likeAction.subscribe({
        next: () => {
          // Refresh the topic details to get updated like counts
          this.topicDetails.delete(topicId);
          this.loadTopicDetails(topicId);
        },
        error: (err) => {
          console.error('Error liking/unliking post:', err);
          // You could show a toast notification here
        }
      });
    }
  }

  /**
   * Handles new reply events from topic detail
   */
  onReplyAdded(topicId: string): void {
    // Refresh the topic to show the new reply
    this.topicDetails.delete(topicId);
    this.loadTopicDetails(topicId);
  }

  /**
   * Toggles the admin menu for a specific topic
   */
  toggleAdminMenu(topicId: string): void {
    if (this.activeAdminMenu() === topicId) {
      this.activeAdminMenu.set(null);
    } else {
      this.activeAdminMenu.set(topicId);
    }
  }

  /**
   * Toggles pin status for a topic (admin only)
   */
  togglePinTopic(topicId: string): void {
    this.activeAdminMenu.set(null);
    // TODO: Call admin API to toggle pin status
    console.log('Toggle pin for topic:', topicId);
  }

  /**
   * Toggles lock status for a topic (admin only)
   */
  toggleLockTopic(topicId: string): void {
    this.activeAdminMenu.set(null);
    // TODO: Call admin API to toggle lock status
    console.log('Toggle lock for topic:', topicId);
  }

  /**
   * Deletes a topic (admin only)
   */
  deleteTopic(topicId: string): void {
    this.activeAdminMenu.set(null);
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      // TODO: Call admin API to delete topic
      console.log('Delete topic:', topicId);
    }
  }
}

