import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, ThumbsUp } from 'lucide-angular';
import type { TopicSummaryDto, TagDto } from '../../../../shared/models';

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
  imports: [CommonModule, LucideAngularModule],
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
            <div
              *ngFor="let user of getTopUsers()"
              class="flex items-center gap-3"
            >
              <!-- User Avatar -->
              <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                <img
                  *ngIf="user.profileImageUrl && !isLucideIconUrl(user.profileImageUrl)"
                  [src]="user.profileImageUrl"
                  [alt]="user.name"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span *ngIf="!user.profileImageUrl || isLucideIconUrl(user.profileImageUrl)">
                  {{ getUserInitials(user.name) }}
                </span>
              </div>
              
              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="text-sm font-medium text-neutral-900 truncate">{{ user.name }}</span>
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                </div>
              </div>
              
              <!-- Like Count -->
              <div class="flex items-center gap-1 text-green-600">
                <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                <span class="text-xs font-medium">{{ user.likeCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Topics Section -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div class="p-4 border-b border-neutral-200">
            <h3 class="font-semibold text-base text-neutral-900">Active Topics</h3>
          </div>
          <div class="p-4 space-y-2">
            <div
              *ngFor="let topic of getActiveTopics()"
              (click)="onTopicClick(topic.name)"
              class="flex items-center justify-between cursor-pointer hover:bg-neutral-50 rounded-md p-2 transition-colors"
            >
              <span class="text-sm text-blue-600 font-medium">#{{ topic.name }}</span>
              <span class="text-xs text-neutral-500">{{ topic.threadCount }} threads</span>
            </div>
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
  
  @Output() startThreadClick = new EventEmitter<void>();
  @Output() topicClick = new EventEmitter<string>();

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
   * Gets top users for sidebar display
   * Returns mock data for now - in real implementation, this would come from API
   */
  getTopUsers(): Array<{name: string, profileImageUrl?: string, likeCount: string}> {
    // Use stable like counts based on user names to prevent random changes
    const users = [
      { name: 'Milad Irani' },
      { name: 'James Brown' },
      { name: 'TheMMD' },
      { name: 'Eli Williams' },
      { name: 'Michel Polat' }
    ];

    return users.map(user => ({
      ...user,
      likeCount: this.getStableLikeCount(user.name)
    }));
  }

  /**
   * Gets stable like count based on user name
   */
  private getStableLikeCount(name: string): string {
    const hash = this.hashCode(name);
    const count = Math.abs(hash % 2000) + 100; // Generate stable number between 100-2099
    
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
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
   * Gets active topics for sidebar display
   * Uses popular tags and adds thread counts
   */
  getActiveTopics(): Array<{name: string, threadCount: number}> {
    const mockTopics = [
      { name: 'sidebar', threadCount: 24 },
      { name: 'questions', threadCount: 22 },
      { name: 'jobs', threadCount: 20 },
      { name: 'ideas', threadCount: 18 },
      { name: 'time-tracker', threadCount: 15 },
      { name: 'connection', threadCount: 12 }
    ];

    // Merge with actual popular tags if available
    if (this.popularTags.length > 0) {
      return this.popularTags.slice(0, 6).map((tag, index) => ({
        name: tag.name,
        threadCount: tag.usageCount || (20 - index * 2)
      }));
    }

    return mockTopics;
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
