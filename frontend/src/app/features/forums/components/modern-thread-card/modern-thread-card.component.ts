import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LucideAngularModule, MessageCircle, ThumbsUp, Pin, Lock } from 'lucide-angular';
import type { TopicSummaryDto } from '../../../../shared/models';

@Component({
  selector: 'app-modern-thread-card',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="bg-white border-b border-neutral-200 py-4 px-6 hover:bg-neutral-50 transition-colors duration-150 cursor-pointer" (click)="onCardClick()">
      <div class="flex items-start gap-4">
        <!-- Avatar -->
        <div class="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-neutral-600 mt-0.5">
          @if (topic.createdBy.profileImageUrl && !isPlaceholder(topic.createdBy.profileImageUrl)) {
            <img [src]="topic.createdBy.profileImageUrl" [alt]="authorName" class="w-9 h-9 rounded-full object-cover" />
          } @else {
            {{ authorInitials }}
          }
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Author + time -->
          <div class="flex items-center gap-1.5 mb-1">
            <button
              (click)="onAuthorClick($event)"
              class="text-sm font-medium text-neutral-700 hover:text-blue-600 transition-colors"
              >{{ authorName }}</button>
            <span class="text-neutral-300 text-xs">•</span>
            <span class="text-xs text-neutral-400">{{ lastActivity }}</span>
            @if (topic.isPinned) {
              <lucide-icon [img]="pinIcon" [size]="12" class="text-amber-500 ml-1"></lucide-icon>
            }
            @if (topic.isLocked) {
              <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400 ml-1"></lucide-icon>
            }
          </div>

          <!-- Title -->
          <h3 class="text-base font-semibold text-neutral-900 hover:text-blue-600 transition-colors leading-snug mb-2">
            {{ topic.title }}
          </h3>

          <!-- Tags -->
          @if (topic.tags && topic.tags.length > 0) {
            <div class="flex flex-wrap gap-1 mb-3">
              @for (tag of topic.tags.slice(0, 4); track tag) {
                <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">#{{ tag.name }}</span>
              }
            </div>
          }

          <!-- Stats row -->
          <div class="flex items-center gap-4">
            <button
              (click)="$event.stopPropagation()"
              class="flex items-center gap-1.5 text-xs text-neutral-500"
              >
              <lucide-icon [img]="messageIcon" [size]="14"></lucide-icon>
              <span>{{ replyCount }}</span>
            </button>

            <button
              (click)="onLikeClick($event)"
              class="flex items-center gap-1.5 text-xs transition-colors"
              [class.text-blue-600]="topic.isMainPostLikedByCurrentUser"
              [class.text-neutral-500]="!topic.isMainPostLikedByCurrentUser"
              [title]="topic.isMainPostLikedByCurrentUser ? 'Unlike' : 'Like'"
              >
              <lucide-icon [img]="thumbsUpIcon" [size]="14"></lucide-icon>
              <span>{{ topic.totalLikes }}</span>
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

  @Output() threadClick = new EventEmitter<string>();
  @Output() likeClick = new EventEmitter<string>();
  @Output() authorClick = new EventEmitter<{userId: string, userName: string}>();

  readonly messageIcon = MessageCircle;
  readonly thumbsUpIcon = ThumbsUp;
  readonly pinIcon = Pin;
  readonly lockIcon = Lock;

  get authorName(): string {
    return `${this.topic.createdBy.firstName} ${this.topic.createdBy.lastName}`;
  }

  get authorInitials(): string {
    return (this.topic.createdBy.firstName.charAt(0) + this.topic.createdBy.lastName.charAt(0)).toUpperCase();
  }

  get replyCount(): number {
    return Math.max(0, (this.topic.postCount || 0) - 1);
  }

  get lastActivity(): string {
    const date = this.topic.lastReplyAt ? new Date(this.topic.lastReplyAt) : new Date(this.topic.createdAt);
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

  isPlaceholder(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  onCardClick(): void {
    this.threadClick.emit(this.topic.id);
  }

  onLikeClick(event: Event): void {
    event.stopPropagation();
    if (this.topic.mainPostId && this.topic.mainPostId !== '00000000-0000-0000-0000-000000000000') {
      this.likeClick.emit(this.topic.id);
    }
  }

  onAuthorClick(event: Event): void {
    event.stopPropagation();
    this.authorClick.emit({ userId: this.topic.createdBy.id, userName: this.authorName });
  }
}
