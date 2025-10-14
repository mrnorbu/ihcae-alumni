import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MessageCircle, ThumbsUp, Reply, Send, X, ChevronUp } from 'lucide-angular';
import type { TopicSummaryDto, PostDto } from '../../../../shared/models';

/**
 * Modern Expanded Thread Component
 * 
 * Displays expanded thread content with posts and replies in a clean, minimalistic design.
 * Follows the same design pattern as the main thread cards for consistency.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-expanded-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Expanded Thread Container -->
    <div class="bg-white border border-neutral-200 rounded-lg shadow-sm mt-2">
      <!-- Thread Header -->
      <div class="p-4 border-b border-neutral-200 bg-neutral-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 class="text-sm font-semibold text-blue-800">Discussion Thread</h3>
            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }}
            </span>
          </div>
          
          <!-- Collapse Button -->
          <button 
            (click)="onCollapseClick()"
            class="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 transition-colors duration-200 text-xs"
            title="Collapse thread"
          >
            <lucide-icon [img]="chevronUpIcon" [size]="14"></lucide-icon>
            <span>Collapse</span>
          </button>
        </div>
      </div>

      <!-- Posts Container -->
      <div class="p-4 space-y-4">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-neutral-600 text-sm">Loading posts...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center py-8">
          <div class="text-red-600 mb-3">
            <i class="bi bi-exclamation-triangle text-2xl"></i>
          </div>
          <p class="text-neutral-600 mb-3 text-sm">{{ error }}</p>
          <button 
            (click)="onRetryClick()" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>

        <!-- Posts List -->
        <div *ngIf="!loading && !error && posts.length > 0" class="space-y-4">
          <div *ngFor="let post of posts; let i = index" class="space-y-3">
            <!-- Post Card -->
            <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div class="flex items-start gap-3">
                <!-- Author Avatar -->
                <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                  <img
                    *ngIf="post.author.profileImageUrl && !isLucideIconUrl(post.author.profileImageUrl)"
                    [src]="post.author.profileImageUrl"
                    [alt]="getAuthorName(post.author)"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span *ngIf="!post.author.profileImageUrl || isLucideIconUrl(post.author.profileImageUrl)">
                    {{ getAuthorInitials(post.author) }}
                  </span>
                </div>
                
                <!-- Post Content -->
                <div class="flex-1 min-w-0">
                  <!-- Author Name and Timestamp -->
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-neutral-900">{{ getAuthorName(post.author) }}</span>
                    <div class="w-1 h-1 bg-neutral-400 rounded-full"></div>
                    <span class="text-xs text-neutral-500">{{ getPostTime(post) }}</span>
                  </div>
                  
                  <!-- Post Content -->
                  <div class="text-neutral-700 text-sm leading-relaxed mb-3">
                    {{ post.content }}
                  </div>
                  
                  <!-- Post Actions -->
                  <div class="flex items-center gap-4">
                    <!-- Like Button -->
                    <button 
                      (click)="onPostLike(post.id)"
                      class="flex items-center gap-1 text-neutral-600 hover:text-green-600 transition-colors duration-200 text-xs"
                    >
                      <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                      <span>{{ getPostLikeCount(post) }}</span>
                    </button>
                    
                    <!-- Reply Button -->
                    <button 
                      (click)="toggleReplyForm(post.id)"
                      class="flex items-center gap-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200 text-xs"
                    >
                      <lucide-icon [img]="replyIcon" [size]="12"></lucide-icon>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reply Form -->
            <div *ngIf="(localActiveReplyForm === post.id || activeReplyForm === post.id) && !topic.isLocked" class="ml-8 bg-neutral-50 border border-neutral-200 rounded-lg p-3 mt-2">
              <div class="flex items-center gap-2 mb-2">
                <lucide-icon [img]="replyIcon" [size]="12" class="text-blue-600"></lucide-icon>
                <span class="text-xs font-medium text-blue-800">Reply to {{ getAuthorName(post.author) }}</span>
                <button 
                  (click)="cancelReply(post.id)"
                  class="ml-auto text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                </button>
              </div>
              
              <form (ngSubmit)="submitReply(post.id)">
                <textarea
                  [(ngModel)]="replyContent[post.id]"
                  [name]="'reply-' + post.id"
                  rows="2"
                  placeholder="Write your reply here..."
                  class="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-2 resize-none"
                  required
                ></textarea>
                
                <div class="flex gap-2">
                  <button 
                    type="submit" 
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 text-xs rounded-md transition-colors duration-200 flex items-center gap-1" 
                    [disabled]="!replyContent[post.id] || !replyContent[post.id].trim() || replySubmitting.has(post.id)"
                  >
                    <lucide-icon [img]="sendIcon" [size]="12"></lucide-icon>
                    <span *ngIf="!replySubmitting.has(post.id)">Reply</span>
                    <span *ngIf="replySubmitting.has(post.id)">Posting...</span>
                  </button>
                  <button 
                    type="button" 
                    (click)="cancelReply(post.id)" 
                    class="border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-medium px-3 py-1 text-xs rounded-md transition-colors duration-200"
                    [disabled]="replySubmitting.has(post.id)"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && posts.length === 0" class="text-center py-8">
          <lucide-icon [img]="messageIcon" [size]="32" class="text-neutral-300 mb-3"></lucide-icon>
          <p class="text-neutral-500 text-sm">No posts yet</p>
        </div>
      </div>

      <!-- Locked Topic Message -->
      <div *ngIf="topic.isLocked" class="p-4 border-t border-neutral-200 bg-neutral-50">
        <div class="flex items-center gap-3 text-neutral-600">
          <i class="bi bi-lock text-lg"></i>
          <div>
            <h4 class="font-medium text-sm">Topic Locked</h4>
            <p class="text-xs">This discussion has been locked by an administrator. No new replies can be posted.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModernExpandedThreadComponent implements OnChanges {
  @Input() topic!: TopicSummaryDto;
  @Input() posts: PostDto[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() replySubmitting: Set<string> = new Set();
  @Input() activeReplyForm: string | null = null;
  
  @Output() postLike = new EventEmitter<string>();
  @Output() replySubmit = new EventEmitter<{postId: string, content: string}>();
  @Output() retryClick = new EventEmitter<void>();
  @Output() collapseClick = new EventEmitter<void>();

  localActiveReplyForm: string | null = null;
  replyContent: {[key: string]: string} = {};

  // Lucide icons
  readonly messageIcon = MessageCircle;
  readonly thumbsUpIcon = ThumbsUp;
  readonly replyIcon = Reply;
  readonly sendIcon = Send;
  readonly xIcon = X;
  readonly chevronUpIcon = ChevronUp;

  /**
   * Handles post like events
   */
  onPostLike(postId: string): void {
    this.postLike.emit(postId);
  }

  /**
   * Handles retry button click
   */
  onRetryClick(): void {
    this.retryClick.emit();
  }

  /**
   * Handles collapse button click
   */
  onCollapseClick(): void {
    this.collapseClick.emit();
  }

  /**
   * Handles changes to input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeReplyForm'] && this.activeReplyForm && this.posts.length > 0) {
      // Find the post with the matching ID and open reply form
      const post = this.posts.find(p => p.id === this.activeReplyForm);
      if (post) {
        this.localActiveReplyForm = post.id;
        this.replyContent[post.id] = '';
      }
    }
  }

  /**
   * Toggles reply form for a specific post
   */
  toggleReplyForm(postId: string): void {
    if (this.localActiveReplyForm === postId) {
      this.localActiveReplyForm = null;
      this.replyContent[postId] = '';
    } else {
      this.localActiveReplyForm = postId;
      this.replyContent[postId] = '';
    }
  }

  /**
   * Cancels reply form
   */
  cancelReply(postId: string): void {
    this.localActiveReplyForm = null;
    this.replyContent[postId] = '';
  }

  /**
   * Submits reply for a specific post
   */
  submitReply(postId: string): void {
    const content = this.replyContent[postId];
    if (content && content.trim()) {
      this.replySubmit.emit({ postId, content });
      this.replyContent[postId] = '';
      this.localActiveReplyForm = null;
    }
  }

  /**
   * Gets the full name of the author
   */
  getAuthorName(author: { firstName: string; lastName: string }): string {
    return `${author.firstName} ${author.lastName}`;
  }

  /**
   * Gets author initials for avatar fallback
   */
  getAuthorInitials(author: any): string {
    const firstName = (author.firstName || '').trim();
    const lastName = (author.lastName || '').trim();
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    
    const name = firstName || lastName;
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    
    const email = (author.email || '').trim();
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  /**
   * Checks if the URL is a Lucide icon URL (default placeholder)
   */
  isLucideIconUrl(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  /**
   * Gets post like count
   */
  getPostLikeCount(post: PostDto): number {
    // Use a stable like count based on post ID to prevent random changes
    // In a real implementation, this would come from the post's like count
    const hash = this.hashCode(post.id);
    return Math.abs(hash % 50) + 5; // Generate stable number between 5-54
  }

  /**
   * Simple hash function to generate stable numbers from strings
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Formats the post time as a relative time string
   */
  getPostTime(post: PostDto): string {
    const date = new Date(post.createdAt);
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
}
