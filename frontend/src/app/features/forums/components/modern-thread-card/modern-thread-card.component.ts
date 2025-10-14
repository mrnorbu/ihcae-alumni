import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MessageCircle, ThumbsUp, Reply } from 'lucide-angular';
import type { TopicSummaryDto } from '../../../../shared/models';

/**
 * Modern Thread Card Component
 * 
 * Displays individual forum threads in the new modern design format.
 * Matches the target design with user info, thread content, and interaction buttons.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-thread-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white border-b border-neutral-200 py-4 px-6 hover:bg-neutral-50 transition-colors duration-200">
      <div class="flex items-start gap-4">
        <!-- User Avatar -->
        <div class="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-neutral-600">
          <img
            *ngIf="topic.createdBy.profileImageUrl && !isLucideIconUrl(topic.createdBy.profileImageUrl)"
            [src]="topic.createdBy.profileImageUrl"
            [alt]="getAuthorName(topic.createdBy)"
            class="w-10 h-10 rounded-full object-cover"
          />
          <span *ngIf="!topic.createdBy.profileImageUrl || isLucideIconUrl(topic.createdBy.profileImageUrl)">
            {{ getAuthorInitials(topic.createdBy) }}
          </span>
        </div>
        
        <!-- Thread Content -->
        <div class="flex-1 min-w-0">
          <!-- User Name with Badge -->
          <div class="flex items-center gap-2 mb-2">
            <span class="font-medium text-neutral-900">{{ getAuthorName(topic.createdBy) }}</span>
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          
          <!-- Thread Title -->
          <h3 class="text-lg font-semibold text-neutral-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
            {{ topic.title }}
          </h3>
          
          <!-- Thread Description -->
          <p class="text-neutral-600 text-sm mb-3 line-clamp-2">
            {{ getThreadDescription(topic) }}
          </p>
          
          <!-- Tags and Timestamp -->
          <div class="flex items-center gap-3 mb-3">
            <!-- Tags -->
            <div *ngIf="topic.tags && topic.tags.length > 0" class="flex flex-wrap gap-1">
              <span
                *ngFor="let tag of topic.tags.slice(0, 4)"
                class="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium"
              >
                #{{ tag.name }}
              </span>
            </div>
            
            <!-- Timestamp -->
            <span class="text-xs text-neutral-500">
              - {{ getLastActivityTime(topic) }}
            </span>
          </div>
          
          <!-- Interaction Buttons -->
          <div class="flex items-center gap-4">
            <!-- Comments Button -->
            <button 
              (click)="onCommentsClick()"
              class="flex items-center gap-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200"
            >
              <lucide-icon [img]="messageIcon" [size]="16"></lucide-icon>
              <span class="text-sm">{{ topic.postCount }}</span>
            </button>
            
            <!-- Like Button -->
            <button 
              (click)="onLikeClick()"
              class="flex items-center gap-1 text-neutral-600 hover:text-green-600 transition-colors duration-200"
            >
              <lucide-icon [img]="thumbsUpIcon" [size]="16"></lucide-icon>
              <span class="text-sm">{{ getLikeCount(topic) }}</span>
            </button>
            
            <!-- Reply Button -->
            <button 
              (click)="onReplyClick()"
              class="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 transform hover:scale-105"
            >
              <lucide-icon [img]="replyIcon" [size]="14"></lucide-icon>
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModernThreadCardComponent {
  @Input() topic!: TopicSummaryDto;
  
  @Output() commentsClick = new EventEmitter<string>();
  @Output() likeClick = new EventEmitter<string>();
  @Output() replyClick = new EventEmitter<string>();

  // Lucide icons
  readonly messageIcon = MessageCircle;
  readonly thumbsUpIcon = ThumbsUp;
  readonly replyIcon = Reply;

  /**
   * Handles comments button click
   */
  onCommentsClick(): void {
    this.commentsClick.emit(this.topic.id);
  }

  /**
   * Handles like button click
   */
  onLikeClick(): void {
    this.likeClick.emit(this.topic.id);
  }

  /**
   * Handles reply button click
   */
  onReplyClick(): void {
    this.replyClick.emit(this.topic.id);
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
   * Gets thread description from topic content
   */
  getThreadDescription(topic: TopicSummaryDto): string {
    // For now, we'll use a placeholder. In a real implementation,
    // this would come from the topic's first post content
    return "This is a sample thread description that would contain the main content or summary of the discussion...";
  }

  /**
   * Gets like count for the topic
   */
  getLikeCount(topic: TopicSummaryDto): number {
    // Use a stable like count based on topic ID to prevent random changes
    // In a real implementation, this would come from the topic's like count
    const hash = this.hashCode(topic.id);
    return Math.abs(hash % 200) + 50; // Generate stable number between 50-249
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
   * Formats the last activity time as a relative time string
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
}
