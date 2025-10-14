import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable Tag Pill Component
 * 
 * A versatile tag component with support for:
 * - Display-only tags
 * - Removable tags (with X button)
 * - Usage count display
 * - Click events
 * - Different color variants
 * 
 * @example
 * <!-- Display-only tag -->
 * <app-tag-pill [label]="'technology'" [usageCount]="42"></app-tag-pill>
 * 
 * <!-- Removable tag -->
 * <app-tag-pill [label]="'career'" [removable]="true" (remove)="onRemove('career')"></app-tag-pill>
 * 
 * <!-- Clickable tag -->
 * <app-tag-pill [label]="'alumni'" (click)="onTagClick('alumni')"></app-tag-pill>
 */
@Component({
  selector: 'app-tag-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="getTagClasses()"
      (click)="handleClick()"
    >
      <span class="text-xs">{{ label }}</span>
      <span *ngIf="usageCount !== undefined" class="text-xs opacity-75 ml-1">({{ usageCount }})</span>
      <button
        *ngIf="removable"
        type="button"
        (click)="handleRemove($event)"
        class="ml-1 hover:text-blue-900 transition-colors"
        [attr.aria-label]="'Remove ' + label + ' tag'"
      >
        <i class="bi bi-x text-xs"></i>
      </button>
    </span>
  `,
  styles: []
})
export class TagPillComponent {
  /**
   * The text to display on the tag
   */
  @Input() label: string = '';

  /**
   * Optional usage count to display
   */
  @Input() usageCount?: number;

  /**
   * Whether the tag can be removed (shows X button)
   */
  @Input() removable: boolean = false;

  /**
   * Color variant of the tag
   */
  @Input() variant: 'default' | 'neutral' = 'default';

  /**
   * Emitted when the tag is clicked
   */
  @Output() tagClick = new EventEmitter<string>();

  /**
   * Emitted when the remove button is clicked
   */
  @Output() remove = new EventEmitter<string>();

  /**
   * Handle tag click (not the remove button)
   */
  handleClick(): void {
    if (!this.removable) {
      this.tagClick.emit(this.label);
    }
  }

  /**
   * Handle remove button click
   */
  handleRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.label);
  }

  /**
   * Get the appropriate CSS classes for the tag based on variant and removable state
   */
  getTagClasses(): string {
    if (this.variant === 'neutral') {
      return this.removable ? 'tag-pill-neutral pr-2' : 'tag-pill-neutral';
    }
    return this.removable ? 'tag-pill-removable' : 'tag-pill';
  }
}

