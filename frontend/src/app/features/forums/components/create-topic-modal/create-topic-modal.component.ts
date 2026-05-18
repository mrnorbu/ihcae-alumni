import { Component, Output, EventEmitter, Input } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule, X, Eye, EyeOff, Send, Tag, Hash } from 'lucide-angular';
import type { CreateTopicRequest, TagDto } from '../../../../shared/models';
import { convertLinksToHtml } from '../../utils/link-parser';
import { ForumService } from '../../services/forum.service';

/**
 * Compact Modal Component for creating a new discussion topic.
 * Follows the same modern design patterns as the forum components.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-create-topic-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Modal Overlay -->
    @if (isVisible) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-lg border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="p-4 border-b border-neutral-200 bg-neutral-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h2 class="text-lg font-semibold text-blue-800">Create New Topic</h2>
              </div>
              <button
                (click)="onCancel()"
                class="text-neutral-500 hover:text-neutral-700 transition-colors"
                type="button"
                >
                <lucide-icon [img]="xIcon" [size]="20"></lucide-icon>
              </button>
            </div>
          </div>
          <!-- Modal Content -->
          <div class="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form [formGroup]="topicForm" (ngSubmit)="onSubmit()">
              <!-- Title Field -->
              <div class="mb-4">
                <label for="title" class="block text-sm font-medium text-neutral-700 mb-2">
                  Topic Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  formControlName="title"
                  placeholder="Enter a descriptive title for your topic"
                  class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  [class.border-red-500]="topicForm.get('title')?.invalid && topicForm.get('title')?.touched"
                  />
                @if (topicForm.get('title')?.invalid && topicForm.get('title')?.touched) {
                  <div
                    class="text-red-500 text-xs mt-1"
                    >
                    @if (topicForm.get('title')?.errors?.['required']) {
                      <p>Title is required</p>
                    }
                    @if (topicForm.get('title')?.errors?.['minlength']) {
                      <p>
                        Title must be at least 5 characters
                      </p>
                    }
                    @if (topicForm.get('title')?.errors?.['maxlength']) {
                      <p>
                        Title cannot exceed 255 characters
                      </p>
                    }
                  </div>
                }
              </div>
              <!-- Content Field -->
              <div class="mb-4">
                <label for="content" class="block text-sm font-medium text-neutral-700 mb-2">
                  Content <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  formControlName="content"
                  rows="4"
                  placeholder="Write your post content here. URLs will be automatically converted to clickable links."
                  class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  [class.border-red-500]="topicForm.get('content')?.invalid && topicForm.get('content')?.touched"
                ></textarea>
                @if (topicForm.get('content')?.invalid && topicForm.get('content')?.touched) {
                  <div
                    class="text-red-500 text-xs mt-1"
                    >
                    @if (topicForm.get('content')?.errors?.['required']) {
                      <p>Content is required</p>
                    }
                    @if (topicForm.get('content')?.errors?.['minlength']) {
                      <p>
                        Content must be at least 10 characters
                      </p>
                    }
                  </div>
                }
              </div>
              <!-- Tags Selection -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-neutral-700 mb-2">
                  Tags (Optional)
                  <span class="text-neutral-500 text-xs">- Maximum 5 tags</span>
                </label>
                <!-- Selected Tags -->
                @if (selectedTags.length > 0) {
                  <div class="flex flex-wrap gap-1 mb-2">
                    @for (tag of selectedTags; track tag) {
                      <span
                        class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                        #{{ tag }}
                        <button
                          (click)="removeTag(tag)"
                          type="button"
                          class="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                          <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                        </button>
                      </span>
                    }
                  </div>
                }
                <!-- Tag Search Input -->
                <div class="relative">
                  <input
                    type="text"
                    [(ngModel)]="tagSearchQuery"
                    (input)="onTagSearchChange()"
                    (blur)="onTagSearchBlur()"
                    placeholder="Search or add tags..."
                    [disabled]="selectedTags.length >= 5"
                    class="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  <!-- Tag Suggestions Dropdown -->
                  @if (showTagSuggestions) {
                    <div
                      class="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-32 overflow-y-auto"
                      >
                      @for (tag of tagSuggestions; track tag) {
                        <button
                          (click)="addTag(tag.name)"
                          type="button"
                          class="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-between"
                          >
                          <span>#{{ tag.name }}</span>
                          <span class="text-xs text-neutral-500">{{ tag.usageCount }} uses</span>
                        </button>
                      }
                    </div>
                  }
                </div>
                <!-- Popular Tags -->
                @if (popularTags.length > 0) {
                  <div class="mt-2">
                    <p class="text-xs text-neutral-600 mb-1">Popular tags:</p>
                    <div class="flex flex-wrap gap-1">
                      @for (tag of popularTags.slice(0, 8); track tag) {
                        <button
                          (click)="addTag(tag.name)"
                          type="button"
                          [disabled]="selectedTags.includes(tag.name) || selectedTags.length >= 5"
                          class="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                          #{{ tag.name }} ({{ tag.usageCount }})
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
              <!-- Preview Toggle -->
              <div class="mb-3">
                <button
                  type="button"
                  (click)="togglePreview()"
                  class="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                  >
                  <lucide-icon [img]="showPreview ? eyeOffIcon : eyeIcon" [size]="14"></lucide-icon>
                  {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
                </button>
              </div>
              <!-- Preview Section -->
              @if (showPreview) {
                <div class="mb-4 p-3 bg-neutral-50 rounded-md border border-neutral-200">
                  <h3 class="text-sm font-semibold text-neutral-900 mb-2">Preview</h3>
                  <div class="border-b border-neutral-300 mb-2 pb-2">
                    <h4 class="text-base font-bold text-neutral-900">{{ topicForm.get('title')?.value || '(No title)' }}</h4>
                  </div>
                  <div class="text-neutral-700 text-sm whitespace-pre-wrap" [innerHTML]="previewHtml"></div>
                </div>
              }
            </form>
          </div>
          <!-- Modal Footer -->
          <div class="p-4 border-t border-neutral-200 bg-neutral-50">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 text-sm border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                Cancel
              </button>
              <button
                type="button"
                (click)="onSubmit()"
                [disabled]="topicForm.invalid || isSubmitting"
                class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                <lucide-icon [img]="sendIcon" [size]="14"></lucide-icon>
                @if (!isSubmitting) {
                  <span>Create Topic</span>
                }
                @if (isSubmitting) {
                  <span>Creating...</span>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
    `,
  styles: []
})
export class CreateTopicModalComponent {
  // Input properties
  @Input() isVisible: boolean = false;
  
  // Output events
  @Output() submit = new EventEmitter<CreateTopicRequest>();
  @Output() cancel = new EventEmitter<void>();

  // Form state
  topicForm: FormGroup;
  showPreview: boolean = false;
  isSubmitting: boolean = false;

  // Tag selection state
  selectedTags: string[] = [];
  tagSearchQuery: string = '';
  tagSuggestions: TagDto[] = [];
  showTagSuggestions: boolean = false;
  popularTags: TagDto[] = [];

  // Lucide icons
  readonly xIcon = X;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly sendIcon = Send;
  readonly tagIcon = Tag;
  readonly hashIcon = Hash;

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
    return this.sanitizer.bypassSecurityTrustHtml(convertLinksToHtml(content));
  }

  /**
   * Loads popular tags for quick selection.
   */
  private loadPopularTags(): void {
    this.forumService.getPopularTags().subscribe({
      next: (tags) => {
        this.popularTags = tags;
      },
      error: (error) => {
        console.error('Failed to load popular tags:', error);
        this.popularTags = [];
      }
    });
  }

  /**
   * Handles tag search input changes.
   */
  onTagSearchChange(): void {
    if (!this.tagSearchQuery.trim()) {
      this.showTagSuggestions = false;
      this.tagSuggestions = [];
      return;
    }

    // Filter popular tags based on search query
    this.tagSuggestions = this.popularTags.filter(tag =>
      tag.name.toLowerCase().includes(this.tagSearchQuery.toLowerCase()) &&
      !this.selectedTags.includes(tag.name)
    );

    this.showTagSuggestions = this.tagSuggestions.length > 0;
  }

  /**
   * Handles tag search input blur.
   */
  onTagSearchBlur(): void {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showTagSuggestions = false;
    }, 200);
  }

  /**
   * Adds a tag to the selected tags list.
   */
  addTag(tagName: string): void {
    if (this.selectedTags.length >= 5) {
      return;
    }

    if (!this.selectedTags.includes(tagName)) {
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
    this.resetForm();
    this.cancel.emit();
  }

  /**
   * Resets the form and component state.
   */
  private resetForm(): void {
    this.topicForm.reset();
    this.selectedTags = [];
    this.tagSearchQuery = '';
    this.showTagSuggestions = false;
    this.showPreview = false;
    this.isSubmitting = false;
  }

  /**
   * Resets the form when modal is closed.
   */
  ngOnDestroy(): void {
    this.resetForm();
  }
}
