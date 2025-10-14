import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MessageCircle } from 'lucide-angular';
import { SidebarWidgetComponent, TagPillComponent } from '../../../../shared/components';
import type { TopicSummaryDto, TagDto } from '../../../../shared/models';

/**
 * Forum Sidebar Component
 * 
 * Left sidebar containing widgets for trending topics, popular tags, and community stats.
 * Provides additional navigation and information for forum users.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-forum-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SidebarWidgetComponent, TagPillComponent],
  template: `
    <!-- Left Sidebar -->
    <aside class="hidden lg:block w-80 flex-shrink-0">
      <div class="sticky top-24 space-y-6">
        <!-- Browse Section -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
          <div class="p-3 border-b border-neutral-200">
            <h3 class="font-semibold text-base text-neutral-900">Browse</h3>
          </div>
          <nav class="p-2">
            <button
              (click)="onFilterChange('all')"
              [class.bg-primary-50]="activeFilter === 'all'"
              [class.text-primary-700]="activeFilter === 'all'"
              [class.font-medium]="activeFilter === 'all'"
              class="w-full flex items-center gap-3 px-3 py-2 text-base text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <i class="bi bi-grid text-base"></i>
              <span>All Topics</span>
            </button>
            <button
              (click)="onFilterChange('yours')"
              [class.bg-primary-50]="activeFilter === 'yours'"
              [class.text-primary-700]="activeFilter === 'yours'"
              [class.font-medium]="activeFilter === 'yours'"
              class="w-full flex items-center gap-3 px-3 py-2 text-base text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <i class="bi bi-pencil-square text-base"></i>
              <span>Your Threads</span>
            </button>
          </nav>
        </div>

        <!-- Top Discussions Widget -->
        <app-sidebar-widget [title]="'Top Discussions'">
          <div class="space-y-1">
            <div
              *ngFor="let topic of getTrendingTopics()"
              (click)="onTopicClick(topic.id)"
              class="p-1.5 hover:bg-neutral-50 rounded-md transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between gap-2">
                <h4 class="text-xs font-medium text-neutral-900 line-clamp-2 flex-1">
                  {{ topic.title }}
                </h4>
                <span class="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
                  <lucide-icon [img]="messageIcon" [size]="12" class="text-primary-600"></lucide-icon>
                  {{ topic.postCount }}
                </span>
              </div>
            </div>
            <div *ngIf="topics.length === 0" class="text-xs text-neutral-500 text-center py-3">
              No discussions yet
            </div>
          </div>
        </app-sidebar-widget>

        <!-- Popular Tags Widget -->
        <app-sidebar-widget [title]="'Popular Tags'">
          <div class="flex flex-wrap gap-1.5">
            <app-tag-pill
              *ngFor="let tag of popularTags.slice(0, 12)"
              [label]="tag.name"
              [usageCount]="tag.usageCount"
              [variant]="'neutral'"
              (tagClick)="onTagClick(tag.name)"
            ></app-tag-pill>
          </div>
        </app-sidebar-widget>

        <!-- Community Stats Widget -->
        <app-sidebar-widget [title]="'Community Stats'">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">Total Topics</span>
              <span class="text-sm font-semibold text-neutral-900">{{ totalCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">Active Tags</span>
              <span class="text-sm font-semibold text-neutral-900">{{ popularTags.length }}</span>
            </div>
          </div>
        </app-sidebar-widget>
      </div>
    </aside>
  `,
  styles: []
})
export class ForumSidebarComponent {
  @Input() topics: TopicSummaryDto[] = [];
  @Input() popularTags: TagDto[] = [];
  @Input() totalCount: number = 0;
  @Input() activeFilter: string = 'all';

  @Output() filterChange = new EventEmitter<string>();
  @Output() topicClick = new EventEmitter<string>();
  @Output() tagClick = new EventEmitter<string>();

  // Lucide icons
  readonly messageIcon = MessageCircle;

  /**
   * Gets trending topics for sidebar display
   * Returns top 5 topics sorted by post count
   */
  getTrendingTopics(): TopicSummaryDto[] {
    return [...this.topics]
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
  }

  /**
   * Handles filter change events
   */
  onFilterChange(filter: string): void {
    this.filterChange.emit(filter);
  }

  /**
   * Handles topic click events
   */
  onTopicClick(topicId: string): void {
    this.topicClick.emit(topicId);
  }

  /**
   * Handles tag click events
   */
  onTagClick(tagName: string): void {
    this.tagClick.emit(tagName);
  }
}
