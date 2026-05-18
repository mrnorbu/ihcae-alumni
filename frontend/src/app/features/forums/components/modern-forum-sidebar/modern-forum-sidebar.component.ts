import { Component, Input, Output, EventEmitter } from '@angular/core';

import { LucideAngularModule, Plus, ThumbsUp } from 'lucide-angular';
import type { TopicSummaryDto, TagDto, TopUserDto } from '../../../../shared/models';

/**
 * Modern Forum Right Sidebar Component
 * 
 * Right sidebar containing "Start a New Thread" button, "Top Users", and "Active Topics".
 * Matches the clean, modern design from the target image.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-forum-sidebar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <!-- Right Sidebar -->
    <aside class="w-80 flex-shrink-0">
      <div class="sticky top-24 space-y-6">
        <!-- Start a New Thread Button -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <button
            (click)="onStartThreadClick()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
            <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon>
            <span>Start a New Thread</span>
          </button>
        </div>
    
        <!-- Top Users Section -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div class="p-4 border-b border-neutral-200">
            <h3 class="font-semibold text-base text-neutral-900">Top Users</h3>
          </div>
          <div class="p-4 space-y-3">
            @for (user of getTopUsers(); track user) {
              <div
                (click)="onUserClick(user.userId, user.name)"
                class="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 rounded-md p-2 -m-2 transition-colors"
                >
                <!-- User Avatar -->
                <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                  @if (user.profileImageUrl && !isLucideIconUrl(user.profileImageUrl)) {
                    <img
                      [src]="user.profileImageUrl"
                      [alt]="user.name"
                      class="w-8 h-8 rounded-full object-cover"
                      />
                  }
                  @if (!user.profileImageUrl || isLucideIconUrl(user.profileImageUrl)) {
                    <span>
                      {{ getUserInitials(user.name) }}
                    </span>
                  }
                </div>
                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1 mb-0.5">
                    <span class="text-sm font-medium text-neutral-900 truncate hover:text-blue-600">{{ user.name }}</span>
                    <div class="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{{ user.topicCount }} topics</span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      <lucide-icon [img]="thumbsUpIcon" [size]="10"></lucide-icon>
                      {{ user.likeCount }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
    
        <!-- Active Topics Section -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div class="p-4 border-b border-neutral-200">
            <h3 class="font-semibold text-base text-neutral-900">Active Topics</h3>
          </div>
          <div class="p-4 space-y-2">
            @for (topic of getActiveTopics(); track topic) {
              <div
                (click)="onTopicClick(topic.name)"
                class="flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded-md p-2 transition-colors group"
                >
                <span class="text-sm text-blue-600 font-medium group-hover:text-blue-700">#{{ topic.name }}</span>
                <span class="text-xs text-neutral-500 group-hover:text-neutral-600">{{ topic.threadCount }} threads</span>
              </div>
            }
          </div>
        </div>
      </div>
    </aside>
    `,
  styles: []
})
export class ModernForumSidebarComponent {
  @Input() topics: TopicSummaryDto[] = [];
  @Input() popularTags: TagDto[] = [];
  @Input() topUsers: TopUserDto[] = [];
  
  @Output() startThreadClick = new EventEmitter<void>();
  @Output() topicClick = new EventEmitter<string>();
  @Output() userClick = new EventEmitter<{userId: string, userName: string}>();

  // Lucide icons
  readonly plusIcon = Plus;
  readonly thumbsUpIcon = ThumbsUp;

  /**
   * Handles start thread button click
   */
  onStartThreadClick(): void {
    this.startThreadClick.emit();
  }

  /**
   * Handles topic click events
   */
  onTopicClick(topicName: string): void {
    this.topicClick.emit(topicName);
  }

  /**
   * Handles user click events
   */
  onUserClick(userId: string, userName: string): void {
    this.userClick.emit({ userId, userName });
  }

  /**
   * Gets top users for sidebar display from real data
   */
  getTopUsers(): Array<{userId: string, name: string, profileImageUrl?: string, likeCount: string, topicCount: number}> {
    if (this.topUsers && this.topUsers.length > 0) {
      return this.topUsers.map(user => ({
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        profileImageUrl: user.profileImageUrl,
        likeCount: this.formatLikeCount(user.totalLikes),
        topicCount: user.postCount
      }));
    }
    
    // Return empty array if no data
    return [];
  }

  /**
   * Formats like count for display (e.g., 1500 -> "1.5k")
   */
  private formatLikeCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  /**
   * Gets active topics for sidebar display
   * Uses popular tags and adds thread counts
   */
  getActiveTopics(): Array<{name: string, threadCount: number}> {
    return this.popularTags.slice(0, 6).map(tag => ({
      name: tag.name,
      threadCount: tag.usageCount || 0
    }));
  }

  /**
   * Gets user initials for avatar fallback
   */
  getUserInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Checks if the URL is a Lucide icon URL (default placeholder)
   */
  isLucideIconUrl(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }
}
