import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Forum Navigation Component
 * 
 * Left sidebar navigation for forum filtering and community stats.
 * Provides filtering options like "All Topics", "Your Threads", etc.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-forum-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Left Sidebar - Navigation -->
    <aside class="hidden lg:block w-64 flex-shrink-0">
      <div class="sticky top-24 space-y-3">
        <!-- Navigation Menu -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div class="p-3 border-b border-neutral-200">
            <h3 class="font-semibold text-sm text-neutral-900">Browse</h3>
          </div>
          <nav class="p-2">
            <button
              (click)="setActiveFilter('all')"
              [class.bg-primary-50]="activeFilter === 'all'"
              [class.text-primary-700]="activeFilter === 'all'"
              [class.font-medium]="activeFilter === 'all'"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <i class="bi bi-grid text-base"></i>
              <span>All Topics</span>
            </button>
            <button
              (click)="setActiveFilter('yours')"
              [class.bg-primary-50]="activeFilter === 'yours'"
              [class.text-primary-700]="activeFilter === 'yours'"
              [class.font-medium]="activeFilter === 'yours'"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <i class="bi bi-pencil-square text-base"></i>
              <span>Your Threads</span>
            </button>
          </nav>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <h3 class="font-semibold text-sm text-neutral-900 mb-3">Community Stats</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-neutral-600">Total Topics</span>
              <span class="text-xs font-semibold text-neutral-900">{{ totalCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-neutral-600">Active Today</span>
              <span class="text-xs font-semibold text-primary-600">{{ activeToday }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: []
})
export class ForumNavigationComponent {
  @Input() activeFilter: string = 'all';
  @Input() totalCount: number = 0;
  @Input() activeToday: number = 0;
  
  @Output() filterChange = new EventEmitter<string>();

  /**
   * Sets the active filter and emits the change
   */
  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterChange.emit(filter);
  }
}
