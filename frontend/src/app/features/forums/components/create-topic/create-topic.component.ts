import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule, X, Eye, EyeOff, Send, Tag, Hash } from 'lucide-angular';
import type { CreateTopicRequest, TagDto } from '../../../../shared/models';
import { convertLinksToHtml } from '../../utils/link-parser';
import { ForumService } from '../../services/forum.service';

/**
 * Component for creating a new discussion topic.
 * Includes form validation and preview mode.
 */
@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Create New Topic</h2>
        <button
          (click)="onCancel()"
          class="text-gray-500 hover:text-gray-700"
          type="button"
        >
          <i class="bi bi-x-lg text-xl"></i>
        </button>
      </div>

      <form [formGroup]="topicForm" (ngSubmit)="onSubmit()">
        <!-- Title Field -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Topic Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Enter a descriptive title for your topic"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            [class.border-red-500]="topicForm.get('title')?.invalid && topicForm.get('title')?.touched"
          />
          <div
            *ngIf="topicForm.get('title')?.invalid && topicForm.get('title')?.touched"
            class="text-red-500 text-sm mt-1"
          >
            <p *ngIf="topicForm.get('title')?.errors?.['required']">Title is required</p>
            <p *ngIf="topicForm.get('title')?.errors?.['minlength']">
              Title must be at least 5 characters
            </p>
            <p *ngIf="topicForm.get('title')?.errors?.['maxlength']">
              Title cannot exceed 255 characters
            </p>
          </div>
        </div>

        <!-- Content Field -->
        <div class="mb-4">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Content <span class="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            formControlName="content"
            rows="8"
            placeholder="Write your post content here. URLs will be automatically converted to clickable links."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            [class.border-red-500]="topicForm.get('content')?.invalid && topicForm.get('content')?.touched"
          ></textarea>
          <div
            *ngIf="topicForm.get('content')?.invalid && topicForm.get('content')?.touched"
            class="text-red-500 text-sm mt-1"
          >
            <p *ngIf="topicForm.get('content')?.errors?.['required']">Content is required</p>
            <p *ngIf="topicForm.get('content')?.errors?.['minlength']">
              Content must be at least 10 characters
            </p>
          </div>
        </div>

        <!-- Tags Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
            <span class="text-gray-500 text-xs">- Maximum 5 tags</span>
          </label>
          
          <!-- Selected Tags -->
          <div *ngIf="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-3">
            <span
              *ngFor="let tag of selectedTags"
              class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ tag }}
              <button
                (click)="removeTag(tag)"
                type="button"
                class="text-blue-600 hover:text-blue-800"
              >
                <i class="bi bi-x"></i>
              </button>
            </span>
          </div>

          <!-- Tag Search Input -->
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="tagSearchQuery"
              (input)="onTagSearchChange()"
              (blur)="onTagSearchBlur()"
              placeholder="Search or add tags..."
              [disabled]="selectedTags.length >= 5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <!-- Tag Suggestions Dropdown -->
            <div
              *ngIf="showTagSuggestions"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <button
                *ngFor="let tag of tagSuggestions"
                (click)="addTag(tag.name)"
                type="button"
                class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
              >
                <span>{{ tag.name }}</span>
                <span class="text-sm text-gray-500">{{ tag.usageCount }} uses</span>
              </button>
            </div>
          </div>

          <!-- Popular Tags -->
          <div *ngIf="popularTags.length > 0" class="mt-3">
            <p class="text-sm text-gray-600 mb-2">Popular tags:</p>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let tag of popularTags.slice(0, 10)"
                (click)="addTag(tag.name)"
                type="button"
                [disabled]="selectedTags.includes(tag.name) || selectedTags.length >= 5"
                class="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ tag.name }} ({{ tag.usageCount }})
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Toggle -->
        <div class="mb-4">
          <button
            type="button"
            (click)="togglePreview()"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <i class="bi" [class.bi-eye]="!showPreview" [class.bi-eye-slash]="showPreview"></i>
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </button>
        </div>

        <!-- Preview Section -->
        <div *ngIf="showPreview" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
          <div class="border-b border-gray-300 mb-3 pb-2">
            <h4 class="text-xl font-bold text-gray-900">{{ topicForm.get('title')?.value || '(No title)' }}</h4>
          </div>
          <div class="text-gray-700 whitespace-pre-wrap" [innerHTML]="previewHtml"></div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="topicForm.invalid || isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <span *ngIf="!isSubmitting">Create Topic</span>
            <span *ngIf="isSubmitting">
              <i class="bi bi-hourglass-split animate-spin"></i> Creating...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class CreateTopicComponent {
  // Output events
  @Output() submit = new EventEmitter<CreateTopicRequest>(); // Emits when form is submitted
  @Output() cancel = new EventEmitter<void>(); // Emits when user cancels

  // Form state
  topicForm: FormGroup; // Reactive form for topic creation
  showPreview: boolean = false; // Toggle for preview mode
  isSubmitting: boolean = false; // Flag to prevent double submission

  // Tag selection state
  selectedTags: string[] = []; // Currently selected tags (max 5)
  tagSearchQuery: string = ''; // Tag search input
  tagSuggestions: TagDto[] = []; // Tag suggestions from search
  showTagSuggestions: boolean = false; // Whether to show tag suggestions dropdown
  popularTags: TagDto[] = []; // Popular tags for quick selection

  constructor(
    private readonly fb: FormBuilder,
    private readonly sanitizer: DomSanitizer,
    private readonly forumService: ForumService
  ) {
    // Initialize form with validation rules
    this.topicForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
    });

    // Load popular tags for quick selection
    this.loadPopularTags();
  }

  /**
   * Gets the preview HTML with auto-linked URLs.
   */
  get previewHtml(): SafeHtml {
    const content = this.topicForm.get('content')?.value || '(No content)';
    return convertLinksToHtml(content);
  }

  /**
   * Toggles the preview mode on/off.
   */
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  /**
   * Handles form submission.
   * Includes selected tags in the request.
   */
  onSubmit(): void {
    if (this.topicForm.invalid) {
      this.topicForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    
    // Create request with tags
    const request: CreateTopicRequest = {
      ...this.topicForm.value,
      tags: this.selectedTags.length > 0 ? this.selectedTags : undefined
    };
    
    this.submit.emit(request);
  }

  /**
   * Handles cancel button click.
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Resets the form to initial state.
   * Used after successful submission.
   */
  resetForm(): void {
    this.topicForm.reset();
    this.showPreview = false;
    this.isSubmitting = false;
    this.selectedTags = [];
    this.tagSearchQuery = '';
    this.showTagSuggestions = false;
  }

  /**
   * Loads popular tags for quick selection.
   */
  loadPopularTags(): void {
    this.forumService.getPopularTags(15).subscribe({
      next: (tags: TagDto[]) => {
        this.popularTags = tags;
      },
      error: (error) => {
        console.error('Error loading popular tags:', error);
        // Don't show error to user as this is not critical functionality
      }
    });
  }

  /**
   * Searches for tag suggestions based on user input.
   * Used for autocomplete when adding tags.
   */
  searchTagSuggestions(query: string): void {
    if (!query || query.length < 2) {
      this.tagSuggestions = [];
      this.showTagSuggestions = false;
      return;
    }

    this.forumService.searchTags(query, 10).subscribe({
      next: (tags: TagDto[]) => {
        // Filter out tags that are already selected
        this.tagSuggestions = tags.filter(tag => 
          !this.selectedTags.includes(tag.name)
        );
        this.showTagSuggestions = this.tagSuggestions.length > 0;
      },
      error: (error) => {
        console.error('Error searching tags:', error);
        this.tagSuggestions = [];
        this.showTagSuggestions = false;
      }
    });
  }

  /**
   * Adds a tag to the selected tags list.
   * Enforces maximum of 5 tags.
   */
  addTag(tagName: string): void {
    if (!this.selectedTags.includes(tagName) && this.selectedTags.length < 5) {
      this.selectedTags.push(tagName);
      this.tagSearchQuery = '';
      this.showTagSuggestions = false;
    }
  }

  /**
   * Removes a tag from the selected tags list.
   */
  removeTag(tagName: string): void {
    this.selectedTags = this.selectedTags.filter(tag => tag !== tagName);
  }

  /**
   * Handles tag search input changes with debouncing.
   */
  onTagSearchChange(): void {
    setTimeout(() => {
      this.searchTagSuggestions(this.tagSearchQuery);
    }, 300);
  }

  /**
   * Handles clicking outside tag suggestions to close dropdown.
   */
  onTagSearchBlur(): void {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => {
      this.showTagSuggestions = false;
    }, 200);
  }
}

