import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import type { TopicDetailDto, PostDto, CreatePostRequest } from '../../../../shared/models';
import { convertLinksToHtml } from '../../utils/link-parser';
import { TagPillComponent } from '../../../../shared/components';
import { PostCardComponent } from '../../components/post-card/post-card.component';

/**
 * Topic Detail Component
 * 
 * Displays a single forum topic with all its posts and replies.
 * Includes functionality for posting replies, liking posts, and admin controls.
 */
@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TagPillComponent, PostCardComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Back Button -->
      <button 
        (click)="goBack()" 
        class="mb-4 flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <i class="bi bi-arrow-left"></i>
        Back to Forums
      </button>

      <!-- Topic Header -->
      <div *ngIf="topic()" class="card-elevated mb-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full ring-2 ring-neutral-100 bg-neutral-200 flex items-center justify-center">
            <img
              *ngIf="topic()!.createdBy.profileImageUrl"
              [src]="topic()!.createdBy.profileImageUrl"
              [alt]="getAuthorName(topic()!.createdBy)"
              class="w-12 h-12 rounded-full object-cover"
            />
            <span
              *ngIf="!topic()!.createdBy.profileImageUrl"
              class="text-sm font-medium text-neutral-600"
            >
              {{ getAuthorInitials(topic()!.createdBy) }}
            </span>
          </div>
          <div class="flex-1">
            <h1 class="heading-page">{{ topic()!.title }}</h1>
            <p class="text-meta mb-3">
              By {{ getAuthorName(topic()!.createdBy) }} • {{ formatDate(topic()!.createdAt) }}
            </p>
            <div *ngIf="topic()!.tags.length > 0" class="flex gap-2 mb-4">
              <app-tag-pill
                *ngFor="let tag of topic()!.tags"
                [label]="tag.name"
                [usageCount]="tag.usageCount"
                variant="neutral"
              ></app-tag-pill>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts -->
      <div *ngIf="topic()" class="space-y-4">
        <app-post-card
          *ngFor="let post of topic()!.posts"
          [post]="post"
          (like)="onPostLiked($event)"
          (reply)="onReplyAdded($event)"
        ></app-post-card>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-meta mt-2">Loading topic...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="text-center py-8">
        <div class="text-error-600 mb-2">
          <i class="bi bi-exclamation-triangle text-2xl"></i>
        </div>
        <p class="text-meta">{{ error() }}</p>
        <button 
          (click)="loadTopic()" 
          class="btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class TopicDetailComponent implements OnInit {
  topicId: string = '';
  topic = signal<TopicDetailDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.topicId = params['id'];
      if (this.topicId) {
        this.loadTopic();
      }
    });
  }

  /**
   * Loads the topic details from the API
   */
  loadTopic(): void {
    this.loading.set(true);
    this.error.set(null);

    this.forumService.getTopicById(this.topicId).subscribe({
      next: (topic) => {
        this.topic.set(topic);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading topic:', err);
        this.error.set('Failed to load topic. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Handles post like/unlike events
   */
  onPostLiked(postId: string): void {
    // Refresh the topic to get updated like counts
    this.loadTopic();
  }

  /**
   * Handles new reply events
   */
  onReplyAdded(postId: string): void {
    // Refresh the topic to show the new reply
    this.loadTopic();
  }

  /**
   * Gets the full name of an author
   */
  getAuthorName(author: any): string {
    return `${author.firstName} ${author.lastName}`.trim();
  }

  /**
   * Gets author initials for avatar fallback
   */
  getAuthorInitials(author: any): string {
    const firstName = author.firstName || '';
    const lastName = author.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  /**
   * Formats a date for display
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  }

  /**
   * Navigates back to the forum list
   */
  goBack(): void {
    this.router.navigate(['/forums']);
  }
}
