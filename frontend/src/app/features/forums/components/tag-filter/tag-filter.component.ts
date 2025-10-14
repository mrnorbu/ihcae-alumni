import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { TagDto } from '../../../../shared/models';

/**
 * Tag Filter Component
 * 
 * Handles tag filtering functionality for forums.
 * Includes tag search, suggestions, and popular tags display.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-tag-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Tag Filter Section -->
    <div class="card-elevated">
      <div class="flex items-center justify-between mb-2">
        <h3 class="heading-section mb-0">Filter by Tags</h3>
        <button
          *ngIf="selectedTags.length > 0"
          (click)="clearAllTags()"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <!-- Selected Tags -->
      <div *ngIf="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-3">
        <span
          *ngFor="let tag of selectedTags"
          class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
        >
          {{ tag }}
          <button
            (click)="removeTag(tag)"
            class="ml-1 hover:text-primary-900"
          >
            <i class="bi bi-x text-xs"></i>
          </button>
        </span>
      </div>

      <!-- Tag Search Input -->
      <div class="relative mb-3">
        <input
          type="text"
          [(ngModel)]="tagSearchQuery"
          (input)="onTagSearchChange()"
          (blur)="onTagSearchBlur()"
          placeholder="Search or add tags..."
          class="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        
        <!-- Tag Suggestions Dropdown -->
        <div
          *ngIf="showTagSuggestions && tagSuggestions.length > 0"
          class="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          <button
            *ngFor="let tag of tagSuggestions"
            (click)="addTag(tag.name)"
            class="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center justify-between text-sm transition-colors"
          >
            <span class="text-neutral-900">{{ tag.name }}</span>
            <span class="text-xs text-neutral-500">{{ tag.usageCount }} uses</span>
          </button>
        </div>
      </div>

      <!-- Popular Tags -->
      <div *ngIf="popularTags.length > 0">
        <p class="text-sm text-neutral-600 mb-2">Popular tags:</p>
        <div class="flex flex-wrap gap-2">
          <button
            *ngFor="let tag of popularTags.slice(0, 10)"
            (click)="addTag(tag.name)"
            [class.bg-primary-100]="selectedTags.includes(tag.name)"
            [class.text-primary-700]="selectedTags.includes(tag.name)"
            [class.bg-neutral-100]="!selectedTags.includes(tag.name)"
            [class.text-neutral-700]="!selectedTags.includes(tag.name)"
            class="px-3 py-1 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            {{ tag.name }} ({{ tag.usageCount }})
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TagFilterComponent {
  @Input() selectedTags: string[] = [];
  @Input() popularTags: TagDto[] = [];
  @Input() tagSuggestions: TagDto[] = [];
  @Input() showTagSuggestions: boolean = false;
  
  @Output() tagAdded = new EventEmitter<string>();
  @Output() tagRemoved = new EventEmitter<string>();
  @Output() allTagsCleared = new EventEmitter<void>();
  @Output() tagSearchChanged = new EventEmitter<string>();

  tagSearchQuery: string = '';

  /**
   * Adds a tag to the selected tags list
   */
  addTag(tagName: string): void {
    if (!this.selectedTags.includes(tagName) && this.selectedTags.length < 5) {
      this.tagAdded.emit(tagName);
      this.tagSearchQuery = '';
      this.showTagSuggestions = false;
    }
  }

  /**
   * Removes a tag from the selected tags list
   */
  removeTag(tagName: string): void {
    this.tagRemoved.emit(tagName);
  }

  /**
   * Clears all selected tags
   */
  clearAllTags(): void {
    this.allTagsCleared.emit();
  }

  /**
   * Handles tag search input changes
   */
  onTagSearchChange(): void {
    this.tagSearchChanged.emit(this.tagSearchQuery);
  }

  /**
   * Handles clicking outside tag suggestions to close dropdown
   */
  onTagSearchBlur(): void {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => {
      this.showTagSuggestions = false;
    }, 200);
  }
}
