import { Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Newspaper, CheckCircle, Clock, X, Upload, Image as ImageIcon } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../shared/components';
import { NewsService } from '../news-events/services/news.service';
import { EventsService } from '../news-events/services/events.service';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { UserAuthStore } from '../../core/state/user-auth.store';
import type { NewsArticleSummary, EventSummary, NewsCategory, EventCategory } from '../news-events/models';

/**
 * Unified Content Management Component
 * 
 * Provides content creation and management for:
 * - Admin: Full access to create/edit news and events (can publish directly)
 * - Content Creator: Create news and events (goes to pending review)
 * - Alumni: Submit success stories (goes to pending review)
 */
@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Content Management</h1>
          <p class="text-neutral-600">
            @if (isAdmin()) {
              Create and manage news articles and events
            } @else if (isContentCreator()) {
              Create news articles and events for admin review
            } @else {
              Submit your success story for admin review
            }
          </p>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow mb-6">
          <div class="border-b border-neutral-200">
            <nav class="flex space-x-8 px-6">
              @if (canManageNews()) {
                <button 
                  (click)="setActiveTab('news')"
                  [class.tab-active]="activeTab() === 'news'"
                  [class.tab-inactive]="activeTab() !== 'news'"
                  class="py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2">
                  <lucide-icon [img]="newspaperIcon" [size]="18"></lucide-icon>
                  News Articles
                </button>
              }
              @if (canManageEvents()) {
                <button 
                  (click)="setActiveTab('events')"
                  [class.tab-active]="activeTab() === 'events'"
                  [class.tab-inactive]="activeTab() !== 'events'"
                  class="py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2">
                  <lucide-icon [img]="calendarIcon" [size]="18"></lucide-icon>
                  Events
                </button>
              }
              @if (isAlumni() && !isAdmin() && !isContentCreator()) {
                <button 
                  (click)="setActiveTab('success-story')"
                  [class.tab-active]="activeTab() === 'success-story'"
                  [class.tab-inactive]="activeTab() !== 'success-story'"
                  class="py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2">
                  <lucide-icon [img]="newspaperIcon" [size]="18"></lucide-icon>
                  Success Story
                </button>
              }
            </nav>
          </div>

          <!-- Content Area -->
          <div class="p-6">
            @if (showForm()) {
              <!-- Form View -->
              <div class="max-w-3xl">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-bold text-neutral-900">
                    {{ editingItem() ? 'Edit' : 'Create' }}
                    @if (activeTab() === 'news') { News Article }
                    @if (activeTab() === 'events') { Event }
                    @if (activeTab() === 'success-story') { Success Story }
                  </h2>
                  <button (click)="cancelForm()" class="btn-outline btn-sm">
                    <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
                    Cancel
                  </button>
                </div>

                <!-- Success Message -->
                @if (submissionSuccess()) {
                  <div class="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start gap-3">
                      <lucide-icon [img]="checkIcon" [size]="20" class="text-success-600 flex-shrink-0 mt-0.5"></lucide-icon>
                      <div>
                        <p class="font-semibold text-success-900 mb-1">Success!</p>
                        <p class="text-sm text-success-700">
                          @if (isAdmin()) {
                            Content has been published successfully.
                          } @else {
                            Content submitted for review. You'll be notified once it's approved.
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Form based on active tab -->
                @if (activeTab() === 'news' || activeTab() === 'success-story') {
                  <!-- News/Success Story Form -->
                  <form [formGroup]="newsForm" (ngSubmit)="submitNews()">
                    <!-- Title -->
                    <div class="mb-6">
                      <label class="input-label">Title <span class="text-error-600">*</span></label>
                      <input formControlName="title" type="text" class="input-field" placeholder="Enter title">
                    </div>

                    <!-- Category (only for news, not success story) -->
                    @if (activeTab() === 'news') {
                      <div class="mb-6">
                        <label class="input-label">Category <span class="text-error-600">*</span></label>
                        <select formControlName="categoryId" class="input-field">
                          <option value="">Select category</option>
                          @for (category of newsCategories(); track category.id) {
                            <option [value]="category.id">{{ category.name }}</option>
                          }
                        </select>
                      </div>
                    }

                    <!-- Content -->
                    <div class="mb-6">
                      <label class="input-label">Content <span class="text-error-600">*</span></label>
                      <textarea formControlName="content" rows="20" class="input-field min-h-[500px]" placeholder="Write your content here..."></textarea>
                      <p class="text-xs text-neutral-500 mt-1">{{ newsForm.get('content')?.value?.length || 0 }} characters</p>
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-6">
                      <label class="input-label">Image</label>
                      <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                        @if (imagePreview()) {
                          <div class="relative">
                            <img [src]="imagePreview()" alt="Preview" class="max-h-64 mx-auto rounded-lg mb-4">
                            <button type="button" (click)="removeImage()" class="btn-outline btn-sm">Remove</button>
                          </div>
                        } @else {
                          <lucide-icon [img]="imageIconLucide" [size]="48" class="text-neutral-400 mx-auto mb-4"></lucide-icon>
                          <label class="btn-primary cursor-pointer inline-flex items-center gap-2">
                            <lucide-icon [img]="uploadIcon" [size]="18"></lucide-icon>
                            Choose Image
                            <input type="file" class="hidden" accept="image/*" (change)="onImageSelected($event)">
                          </label>
                        }
                      </div>
                    </div>

                    <!-- Submit Buttons -->
                    <div class="flex gap-4">
                      @if (isAdmin()) {
                        <button type="submit" [disabled]="newsForm.invalid || isSubmitting()" class="btn-primary flex-1">
                          @if (isSubmitting()) {
                            <span class="flex items-center justify-center gap-2">
                              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Publishing...
                            </span>
                          } @else {
                            Publish Now
                          }
                        </button>
                        <button type="button" (click)="saveAsDraft()" [disabled]="newsForm.invalid || isSubmitting()" class="btn-outline flex-1">
                          Save as Draft
                        </button>
                      } @else {
                        <button type="submit" [disabled]="newsForm.invalid || isSubmitting()" class="btn-primary flex-1">
                          @if (isSubmitting()) {
                            <span class="flex items-center justify-center gap-2">
                              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Submitting...
                            </span>
                          } @else {
                            Submit for Review
                          }
                        </button>
                      }
                      <button type="button" (click)="cancelForm()" class="btn-outline">Cancel</button>
                    </div>
                  </form>
                }

                @if (activeTab() === 'events') {
                  <!-- Events Form -->
                  <form [formGroup]="eventForm" (ngSubmit)="submitEvent()">
                    <!-- Title -->
                    <div class="mb-6">
                      <label class="input-label">Event Title <span class="text-error-600">*</span></label>
                      <input formControlName="title" type="text" class="input-field">
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                      <label class="input-label">Description <span class="text-error-600">*</span></label>
                      <textarea formControlName="description" rows="6" class="input-field"></textarea>
                    </div>

                    <!-- Date and Location Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label class="input-label">Event Date <span class="text-error-600">*</span></label>
                        <input formControlName="eventDate" type="datetime-local" class="input-field">
                      </div>
                      <div>
                        <label class="input-label">Location <span class="text-error-600">*</span></label>
                        <input formControlName="location" type="text" class="input-field">
                      </div>
                    </div>

                    <!-- Category and Capacity Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label class="input-label">Category</label>
                        <select formControlName="categoryId" class="input-field">
                          <option value="">Select category</option>
                          @for (category of eventCategories(); track category.id) {
                            <option [value]="category.id">{{ category.name }}</option>
                          }
                        </select>
                      </div>
                      <div>
                        <label class="input-label">Capacity (optional)</label>
                        <input formControlName="capacity" type="number" class="input-field" placeholder="Leave empty for unlimited">
                      </div>
                    </div>

                    <!-- Submit Buttons -->
                    <div class="flex gap-4">
                      @if (isAdmin()) {
                        <button type="submit" [disabled]="eventForm.invalid || isSubmitting()" class="btn-primary flex-1">
                          Publish Event
                        </button>
                        <button type="button" (click)="saveEventAsDraft()" [disabled]="eventForm.invalid || isSubmitting()" class="btn-outline flex-1">
                          Save as Draft
                        </button>
                      } @else {
                        <button type="submit" [disabled]="eventForm.invalid || isSubmitting()" class="btn-primary flex-1">
                          Submit for Review
                        </button>
                      }
                      <button type="button" (click)="cancelForm()" class="btn-outline">Cancel</button>
                    </div>
                  </form>
                }
              </div>
            } @else {
              <!-- List View -->
              <div>
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-bold text-neutral-900">
                    @if (activeTab() === 'news') { My News Articles }
                    @if (activeTab() === 'events') { My Events }
                    @if (activeTab() === 'success-story') { Submit Your Success Story }
                  </h2>
                  <button (click)="openForm()" class="btn-primary">
                    <lucide-icon [img]="plusIcon" [size]="18"></lucide-icon>
                    @if (activeTab() === 'news') { Create Article }
                    @if (activeTab() === 'events') { Create Event }
                    @if (activeTab() === 'success-story') { Submit Story }
                  </button>
                </div>

                <!-- Loading State -->
                @if (isLoading()) {
                  <div class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                }

                <!-- Empty State -->
                @if (!isLoading() && getItems().length === 0) {
                  <div class="text-center py-12">
                    <lucide-icon [img]="newspaperIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
                    <p class="text-neutral-600">No content yet. Create your first one!</p>
                  </div>
                }

                <!-- Items List -->
                @if (!isLoading() && getItems().length > 0) {
                  <div class="space-y-4">
                    @for (item of getItems(); track item.id) {
                      <div class="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between gap-6">
                          <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                              <h3 class="text-lg font-semibold text-neutral-900">{{ item.title }}</h3>
                              @if (item.status === 'Draft') {
                                <span class="badge badge-secondary">Draft</span>
                              }
                              @if (item.status === 'PendingReview') {
                                <span class="badge badge-warning">Pending Review</span>
                              }
                              @if (item.status === 'Published') {
                                <span class="badge badge-success">Published</span>
                              }
                            </div>
                            <p class="text-neutral-600 mb-3 line-clamp-2">
                              {{ getItemDescription(item) }}
                            </p>
                            <div class="flex items-center gap-4 text-sm text-neutral-500">
                              <div class="flex items-center gap-1">
                                <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                                {{ formatDate(item.createdAt) }}
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col gap-2">
                            <button class="btn-outline btn-sm">
                              <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                              View
                            </button>
                            <button (click)="editItem(item)" class="btn-outline btn-sm">
                              <lucide-icon [img]="editIcon" [size]="16"></lucide-icon>
                              Edit
                            </button>
                            <button (click)="deleteItem(item.id)" class="btn-outline btn-sm text-error-600">
                              <lucide-icon [img]="trashIcon" [size]="16"></lucide-icon>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .tab-active {
      @apply border-primary-600 text-primary-600;
    }
    .tab-inactive {
      @apply border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300;
    }
  `]
})
export class ContentManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private newsService = inject(NewsService);
  private eventsService = inject(EventsService);
  private fileUploadService = inject(FileUploadService);
  private authStore = inject(UserAuthStore);

  // Icons
  plusIcon = Plus;
  editIcon = Edit;
  trashIcon = Trash2;
  eyeIcon = Eye;
  calendarIcon = Calendar;
  mapPinIcon = MapPin;
  usersIcon = Users;
  newspaperIcon = Newspaper;
  checkIcon = CheckCircle;
  clockIcon = Clock;
  xIcon = X;
  uploadIcon = Upload;
  imageIconLucide = ImageIcon;

  // State
  activeTab = signal<'news' | 'events' | 'success-story'>('news');
  showForm = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  submissionSuccess = signal(false);
  editingItem = signal<any>(null);
  
  // Data
  myNews = signal<NewsArticleSummary[]>([]);
  myEvents = signal<EventSummary[]>([]);
  newsCategories = signal<NewsCategory[]>([]);
  eventCategories = signal<EventCategory[]>([]);
  
  // Image
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  // Forms
  newsForm: FormGroup;
  eventForm: FormGroup;

  constructor() {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      categoryId: ['', Validators.required]
    });

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      eventDate: ['', Validators.required],
      location: ['', Validators.required],
      categoryId: [''],
      capacity: [null]
    });
  }

  ngOnInit(): void {
    const user = this.authStore.currentUser;
    if (!user) return;

    // Set initial tab based on role
    if (this.isAlumni() && !this.isAdmin() && !this.isContentCreator()) {
      this.activeTab.set('success-story');
    }

    this.loadCategories();
    this.loadMyContent();
  }

  private loadCategories(): void {
    this.newsService.getCategories().subscribe({
      next: (categories) => this.newsCategories.set(categories),
      error: (err) => console.error('Error loading news categories:', err)
    });

    this.eventsService.getCategories().subscribe({
      next: (categories) => this.eventCategories.set(categories),
      error: (err) => console.error('Error loading event categories:', err)
    });
  }

  private loadMyContent(): void {
    // TODO: Implement API to get user's own content
    // For now, we'll show empty state
  }

  setActiveTab(tab: 'news' | 'events' | 'success-story'): void {
    this.activeTab.set(tab);
    this.showForm.set(false);
  }

  openForm(): void {
    this.showForm.set(true);
    this.editingItem.set(null);
    this.submissionSuccess.set(false);
    this.resetForms();
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.resetForms();
  }

  private resetForms(): void {
    this.newsForm.reset();
    this.eventForm.reset();
    this.imagePreview.set(null);
    this.selectedFile.set(null);
  }

  submitNews(): void {
    if (this.newsForm.invalid) return;

    // For success stories, image is required
    if (this.activeTab() === 'success-story' && !this.selectedFile()) {
      alert('Please upload an image for your success story');
      return;
    }

    this.isSubmitting.set(true);

    // If there's a file, upload it first
    if (this.selectedFile()) {
      const contentType = this.activeTab() === 'success-story' ? 'story' : 'news';
      this.fileUploadService.uploadContentImage(this.selectedFile()!, contentType).subscribe({
        next: (uploadResponse) => {
          this.submitNewsWithImages(uploadResponse.imageUrl, uploadResponse.thumbnailUrl);
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          alert(`Error uploading image: ${err.error?.message || 'Please try again.'}`);
          this.isSubmitting.set(false);
        }
      });
    } else {
      // No image, submit without
      this.submitNewsWithImages('', '');
    }
  }

  private submitNewsWithImages(imageUrl: string, thumbnailUrl: string): void {
    const formValue = this.newsForm.value;
    
    // For success stories, use the success story category
    const request = this.activeTab() === 'success-story' 
      ? {
          title: formValue.title,
          content: formValue.content,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl
        }
      : {
          title: formValue.title,
          content: formValue.content,
          categoryId: formValue.categoryId,
          imageUrl: imageUrl || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          publish: this.isAdmin()
        };

    const apiCall = this.activeTab() === 'success-story'
      ? this.newsService.submitSuccessStory(request as any)
      : this.newsService.createArticle(request as any);

    apiCall.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        setTimeout(() => {
          this.cancelForm();
          this.loadMyContent();
        }, 3000);
      },
      error: (err) => {
        console.error('Error submitting:', err);
        alert(`Error: ${err.error?.message || 'Failed to submit. Please try again.'}`);
        this.isSubmitting.set(false);
      }
    });
  }

  submitEvent(): void {
    if (this.eventForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.eventForm.value;
    
    const request = {
      ...formValue,
      eventDate: new Date(formValue.eventDate),
      publish: this.isAdmin()
    };

    this.eventsService.createEvent(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        setTimeout(() => {
          this.cancelForm();
          this.loadMyContent();
        }, 2000);
      },
      error: (err) => {
        console.error('Error submitting event:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  saveAsDraft(): void {
    // TODO: Implement save as draft
  }

  saveEventAsDraft(): void {
    // TODO: Implement save event as draft
  }

  editItem(item: any): void {
    this.editingItem.set(item);
    this.showForm.set(true);
    // TODO: Populate form with item data
  }

  deleteItem(id: string): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    // TODO: Implement delete
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.selectedFile.set(null);
  }

  getItems(): any[] {
    if (this.activeTab() === 'news' || this.activeTab() === 'success-story') {
      return this.myNews();
    }
    return this.myEvents();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  isAdmin(): boolean {
    return this.authStore.currentUser?.roles?.includes('Admin') || false;
  }

  isContentCreator(): boolean {
    return this.authStore.currentUser?.roles?.includes('ContentCreator') || false;
  }

  isAlumni(): boolean {
    return this.authStore.currentUser?.roles?.includes('Alumni') || false;
  }

  canManageNews(): boolean {
    return this.isAdmin() || this.isContentCreator();
  }

  canManageEvents(): boolean {
    return this.isAdmin() || this.isContentCreator();
  }

  getItemDescription(item: any): string {
    if (this.activeTab() === 'news' || this.activeTab() === 'success-story') {
      return item.excerpt || '';
    }
    return item.location || '';
  }
}
