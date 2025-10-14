import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Forum Navigation Tabs Component
 * 
 * Provides forum-specific navigation tabs for Community, Profile, and My Answers.
 * Matches the clean, modern design from the target image.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-forum-navigation-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Forum Navigation Tabs -->
    <div class="bg-white border-b border-neutral-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Forum Navigation">
          <!-- Community Tab -->
          <button
            (click)="onTabChange('community')"
            [class.text-blue-600]="activeTab === 'community'"
            [class.border-blue-600]="activeTab === 'community'"
            [class.text-neutral-700]="activeTab !== 'community'"
            [class.border-transparent]="activeTab !== 'community'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 hover:text-blue-600 hover:border-blue-300"
          >
            Community
          </button>
          
          <!-- Profile Tab -->
          <button
            (click)="onTabChange('profile')"
            [class.text-blue-600]="activeTab === 'profile'"
            [class.border-blue-600]="activeTab === 'profile'"
            [class.text-neutral-700]="activeTab !== 'profile'"
            [class.border-transparent]="activeTab !== 'profile'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 hover:text-blue-600 hover:border-blue-300"
          >
            Profile
          </button>
          
          <!-- My Answers Tab -->
          <button
            (click)="onTabChange('my-answers')"
            [class.text-blue-600]="activeTab === 'my-answers'"
            [class.border-blue-600]="activeTab === 'my-answers'"
            [class.text-neutral-700]="activeTab !== 'my-answers'"
            [class.border-transparent]="activeTab !== 'my-answers'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 hover:text-blue-600 hover:border-blue-300"
          >
            My answers
          </button>
        </nav>
      </div>
    </div>
  `,
  styles: []
})
export class ForumNavigationTabsComponent {
  @Input() activeTab: string = 'community';
  
  @Output() tabChange = new EventEmitter<string>();

  /**
   * Handles tab change events
   */
  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
