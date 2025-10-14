import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule, ThumbsUp, Reply, Edit, Trash2 } from 'lucide-angular';
import type { PostDto } from '../../../../shared/models';
import { convertLinksToHtml } from '../../utils/link-parser';

/**
 * Reusable component to display a forum post with author info,
 * like button, reply button, and admin controls.
 * 
 * Features:
 * - Blue highlighting for liked posts (blue border, background, and indicator)
 * - Nested reply support with visual hierarchy
 * - Admin controls for editing/deleting posts
 * - Responsive design with different sizes for main posts vs replies
 */
@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      class="border rounded-lg mb-3 transition-all"
      [class.p-3]="!isNested"
      [class.p-2]="isNested"
      [class.ml-8]="isNested"
      [class.bg-blue-100]="isNested"
      [class.border-blue-300]="isNested"
      [class.border-l-4]="isNested"
      [class.border-l-blue-500]="isNested"
      [class.relative]="isNested"
      [class.bg-white]="!isNested"
      [class.border-neutral-200]="!isNested"
      [class.shadow-sm]="isNested"
      [class.border-blue-400]="!isNested && post.isLikedByCurrentUser"
      [class.bg-blue-50]="!isNested && post.isLikedByCurrentUser"
      [class.shadow-md]="!isNested && post.isLikedByCurrentUser"
    >
      <!-- Connection Line for Nested Replies -->
      <div *ngIf="isNested" class="absolute -left-4 top-0 bottom-0 w-0.5 bg-blue-400"></div>
      
      <!-- Reply Indicator for Nested Posts -->
      <div *ngIf="isNested" class="absolute -left-2 top-3 w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
      
      <!-- Liked Post Indicator -->
      <div *ngIf="!isNested && post.isLikedByCurrentUser" class="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full border border-white flex items-center justify-center">
        <i class="bi bi-hand-thumbs-up-fill text-white text-xs"></i>
      </div>
      
      <!-- Author Info -->
      <div class="flex items-start gap-3" [class.mb-3]="!isNested" [class.mb-2]="isNested">
        <!-- Avatar -->
        <div 
          class="rounded-full flex items-center justify-center flex-shrink-0"
          [class.w-10]="!isNested"
          [class.h-10]="!isNested"
          [class.w-8]="isNested"
          [class.h-8]="isNested"
          [class.bg-primary-600]="!isNested"
          [class.bg-blue-500]="isNested"
        >
          <img
            *ngIf="post.author.profileImageUrl && !imageLoadError && !isLucideIconUrl(post.author.profileImageUrl)"
            [src]="post.author.profileImageUrl"
            [alt]="authorName"
            class="rounded-full object-cover"
            [class.w-10]="!isNested"
            [class.h-10]="!isNested"
            [class.w-8]="isNested"
            [class.h-8]="isNested"
            (error)="onImageError()"
          />
          <span 
            *ngIf="!post.author.profileImageUrl || imageLoadError || isLucideIconUrl(post.author.profileImageUrl)"
            class="font-semibold text-white text-center"
            [class.text-sm]="!isNested"
            [class.text-xs]="isNested"
            [class.leading-none]="true"
          >
            {{ getAuthorInitials(post.author) }}
          </span>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <div>
              <h4 
                class="font-semibold text-gray-900"
                [class.text-sm]="!isNested"
                [class.text-xs]="isNested"
              >
                {{ authorName }}
              </h4>
              <p 
                class="text-gray-500"
                [class.text-sm]="!isNested"
                [class.text-xs]="isNested"
              >
                {{ post.createdAt | date: 'medium' }}
              </p>
              <p 
                *ngIf="post.updatedAt" 
                class="text-gray-400 italic"
                [class.text-sm]="!isNested"
                [class.text-xs]="isNested"
              >
                (edited: {{ post.updatedAt | date: 'medium' }})
              </p>
            </div>

            <!-- Admin Controls -->
            <div *ngIf="isAdmin" class="flex gap-2">
              <button
                (click)="onEdit()"
                class="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50"
                [class.text-sm]="!isNested"
                [class.text-xs]="isNested"
                title="Edit post"
              >
                <lucide-icon [img]="editIcon" [size]="12"></lucide-icon>
                <span>Edit</span>
              </button>
              <button
                (click)="onDelete()"
                class="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50"
                [class.text-sm]="!isNested"
                [class.text-xs]="isNested"
                title="Delete post"
              >
                <lucide-icon [img]="deleteIcon" [size]="12"></lucide-icon>
                <span>Delete</span>
              </button>
            </div>
          </div>

          <!-- Post Content -->
          <div 
            class="mt-3 text-gray-700 whitespace-pre-wrap" 
            [innerHTML]="contentHtml"
            [class.text-sm]="!isNested"
            [class.text-sm]="isNested"
          ></div>

          <!-- Actions -->
          <div 
            class="mt-3 flex items-center gap-4"
            [class.mt-2]="isNested"
          >
            <!-- Like Button -->
            <button
              (click)="onLike()"
              class="flex items-center gap-1 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
              [class.text-sm]="!isNested"
              [class.text-xs]="isNested"
              [class.text-blue-600]="post.isLikedByCurrentUser"
              [class.bg-blue-100]="post.isLikedByCurrentUser"
              [class.text-gray-600]="!post.isLikedByCurrentUser"
              [class.hover:bg-gray-50]="!post.isLikedByCurrentUser"
              title="Like this post"
            >
              <lucide-icon [img]="thumbsUpIcon" [size]="14" [class.fill-blue-600]="post.isLikedByCurrentUser"></lucide-icon>
              <span class="font-medium">{{ post.likeCount }}</span>
            </button>

            <!-- Reply Button (only for top-level posts, not locked) -->
            <button
              *ngIf="!isNested && !isLocked"
              (click)="onReply()"
              class="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors text-sm px-2 py-1 rounded-md hover:bg-blue-50"
            >
              <lucide-icon [img]="replyIcon" [size]="14"></lucide-icon>
              <span>Reply</span>
            </button>
            
            <!-- Disabled Reply Button for nested posts -->
            <span
              *ngIf="isNested"
              class="flex items-center gap-1 text-gray-400 text-sm cursor-not-allowed px-2 py-1 rounded-md"
              title="Cannot reply to replies"
            >
              <lucide-icon [img]="replyIcon" [size]="14"></lucide-icon>
              <span>Reply</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Nested Replies -->
      <div *ngIf="post.replies && post.replies.length > 0" class="mt-3">
        <app-post-card
          *ngFor="let replyPost of post.replies"
          [post]="replyPost"
          [isNested]="true"
          [isAdmin]="isAdmin"
          [isLocked]="isLocked"
          (like)="like.emit($event)"
          (reply)="reply.emit($event)"
          (edit)="edit.emit($event)"
          (delete)="delete.emit($event)"
        ></app-post-card>
      </div>
    </div>
  `,
  styles: [],
})
export class PostCardComponent {
  // Inputs
  @Input() post!: PostDto; // The post data to display
  @Input() isNested: boolean = false; // Whether this is a nested reply
  @Input() isAdmin: boolean = false; // Whether current user is admin
  @Input() isLocked: boolean = false; // Whether the topic is locked

  // Output events for parent component
  @Output() like = new EventEmitter<string>(); // Emits post ID when liked
  @Output() reply = new EventEmitter<string>(); // Emits post ID when reply clicked
  @Output() edit = new EventEmitter<string>(); // Emits post ID when edit clicked
  @Output() delete = new EventEmitter<string>(); // Emits post ID when delete clicked

  // Image loading state
  imageLoadError: boolean = false;

  // Lucide icons
  readonly thumbsUpIcon = ThumbsUp;
  readonly replyIcon = Reply;
  readonly editIcon = Edit;
  readonly deleteIcon = Trash2;

  constructor(private readonly sanitizer: DomSanitizer) {}

  /**
   * Gets the full name of the post author.
   */
  get authorName(): string {
    return `${this.post.author.firstName} ${this.post.author.lastName}`;
  }

  /**
   * Gets author initials for avatar fallback.
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
   * Checks if the URL is a Lucide icon URL (default placeholder)
   */
  isLucideIconUrl(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  /**
   * Converts plain text content to HTML with clickable links.
   */
  get contentHtml(): SafeHtml {
    const htmlText = convertLinksToHtml(this.post.content);
    return this.sanitizer.bypassSecurityTrustHtml(htmlText);
  }

  /**
   * Handles like button click.
   */
  onLike(): void {
    this.like.emit(this.post.id);
  }

  /**
   * Handles reply button click.
   */
  onReply(): void {
    this.reply.emit(this.post.id);
  }

  /**
   * Handles edit button click (admin only).
   */
  onEdit(): void {
    this.edit.emit(this.post.id);
  }

  /**
   * Handles delete button click (admin only).
   */
  onDelete(): void {
    this.delete.emit(this.post.id);
  }

  /**
   * Handles image loading error.
   */
  onImageError(): void {
    this.imageLoadError = true;
  }
}

