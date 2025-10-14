import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MessageCircle } from 'lucide-angular';
import type { TopicSummaryDto } from '../../../../shared/models';

/**
 * Topic Card Component
 * 
 * Displays individual forum topics in a compact, modern card format.
 * Includes author info, tags, reply count, and admin controls.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-topic-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
      [class.border-l-4]="topic.isPinned"
      [class.!border-l-primary-500]="topic.isPinned"
      [class.bg-primary-50]="isExpanded"
      (click)="toggleExpansion()"
    >
      <!-- Compact Topic Header -->
      <div class="p-2">
        <div class="flex items-start gap-3">
          <!-- Author Avatar (Smaller) -->
          <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
            <img
              *ngIf="topic.createdBy.profileImageUrl"
              [src]="topic.createdBy.profileImageUrl"
              [alt]="getAuthorName(topic.createdBy)"
              class="w-8 h-8 rounded-full object-cover"
            />
            <span *ngIf="!topic.createdBy.profileImageUrl">
              {{ getAuthorInitials(topic.createdBy) }}
            </span>
          </div>
          
          <!-- Topic Content (Compact) -->
          <div class="flex-1 min-w-0">
            <!-- Title Row -->
            <div class="flex items-start gap-2 mb-2">
              <i *ngIf="topic.isPinned" class="bi bi-pin-fill text-primary-600 text-xs mt-0.5 flex-shrink-0" title="Pinned"></i>
              <i *ngIf="topic.isLocked" class="bi bi-lock-fill text-neutral-400 text-xs mt-0.5 flex-shrink-0" title="Locked"></i>
              <h3 class="text-base font-semibold text-neutral-900 hover:text-primary-600 transition-colors flex-1 line-clamp-2">
                {{ topic.title }}
              </h3>
            </div>
            
            <!-- Meta Info Row -->
            <div class="flex items-center gap-3 text-sm text-neutral-500 mb-2">
              <span class="font-medium text-neutral-700">{{ getAuthorName(topic.createdBy) }}</span>
              <span>•</span>
              <span>{{ getLastActivityTime(topic) }}</span>
            </div>
            
            <!-- Reply Count -->
            <div class="flex items-center gap-1 text-sm text-neutral-600 mb-2">
              <lucide-icon [img]="messageIcon" [size]="14" class="text-primary-600"></lucide-icon>
              <span>{{ topic.postCount }} {{ topic.postCount === 1 ? 'reply' : 'replies' }}</span>
            </div>
            
            <!-- Tags (Compact) -->
            <div *ngIf="topic.tags && topic.tags.length > 0" class="flex flex-wrap gap-1.5 mt-2">
              <span
                *ngFor="let tag of topic.tags.slice(0, 3)"
                class="text-sm px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md font-medium"
              >
                {{ tag.name }}
              </span>
              <span
                *ngIf="topic.tags.length > 3"
                class="text-sm px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-medium"
              >
                +{{ topic.tags.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Controls (Outside main click area) -->
      <div *ngIf="showAdminControls" class="px-2 pb-1">
        <div class="relative">
          <button
            (click)="toggleAdminMenu($event)"
            class="p-1 text-neutral-400 hover:text-neutral-600 transition-colors text-xs"
            [attr.aria-label]="'Admin actions for ' + topic.title"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          
          <!-- Admin Dropdown Menu -->
          <div 
            *ngIf="showAdminMenu"
            class="absolute right-0 top-6 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-32"
          >
            <button
              (click)="togglePinTopic($event)"
              class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
            >
              <i class="bi" [class.bi-pin]="!topic.isPinned" [class.bi-pin-fill]="topic.isPinned"></i>
              {{ topic.isPinned ? 'Unpin' : 'Pin' }}
            </button>
            <button
              (click)="toggleLockTopic($event)"
              class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
            >
              <i class="bi" [class.bi-unlock]="topic.isLocked" [class.bi-lock]="!topic.isLocked"></i>
              {{ topic.isLocked ? 'Unlock' : 'Lock' }}
            </button>
            <hr class="my-1">
            <button
              (click)="deleteTopic($event)"
              class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <i class="bi bi-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TopicCardComponent {
  @Input() topic!: TopicSummaryDto;
  @Input() isExpanded: boolean = false;
  @Input() showAdminControls: boolean = false;
  
  @Output() expansionToggled = new EventEmitter<string>();
  @Output() pinToggled = new EventEmitter<string>();
  @Output() lockToggled = new EventEmitter<string>();
  @Output() topicDeleted = new EventEmitter<string>();

  showAdminMenu: boolean = false;
  
  // Lucide icons
  readonly messageIcon = MessageCircle;

  /**
   * Toggles the expansion state of the topic
   */
  toggleExpansion(): void {
    this.expansionToggled.emit(this.topic.id);
  }

  /**
   * Toggles the admin menu
   */
  toggleAdminMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAdminMenu = !this.showAdminMenu;
  }

  /**
   * Toggles pin status for the topic
   */
  togglePinTopic(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAdminMenu = false;
    this.pinToggled.emit(this.topic.id);
  }

  /**
   * Toggles lock status for the topic
   */
  toggleLockTopic(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAdminMenu = false;
    this.lockToggled.emit(this.topic.id);
  }

  /**
   * Deletes the topic
   */
  deleteTopic(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAdminMenu = false;
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      this.topicDeleted.emit(this.topic.id);
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
    
    // If both names exist, use first character of each
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
    
    // If only one name exists, use first two characters
    const name = firstName || lastName;
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    
    // Fallback to email or default
    const email = (author.email || '').trim();
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
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
