import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, Newspaper, CheckCircle, Clock, X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-angular';
import { HeaderComponent, FooterComponent, CustomSelectComponent, SelectOption } from '../../shared/components';
import { NewsService } from '../news-events/services/news.service';
import { EventsService } from '../news-events/services/events.service';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { UserAuthStore } from '../../core/state/user-auth.store';
import { AppImageUrlPipe } from '../../shared/pipes/app-image-url.pipe';
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
  imports: [ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule, CustomSelectComponent, AppImageUrlPipe],
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
              @if (isAlumni()) {
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

                <!-- Rejection Feedback -->
                @if (editingItem()?.rejectionReason) {
                  <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
                    <lucide-icon [img]="alertIcon" [size]="20" class="text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <div>
                      <p class="font-semibold text-amber-900 mb-1">Feedback from Administrator</p>
                      <p class="text-sm text-amber-750 leading-normal">{{ editingItem().rejectionReason }}</p>
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
                      <input formControlName="title" type="text" class="input-field" placeholder="Enter title"
                             [class.border-red-300]="newsForm.get('title')?.invalid && newsForm.get('title')?.touched"
                             [class.ring-red-100]="newsForm.get('title')?.invalid && newsForm.get('title')?.touched">
                      @if (newsForm.get('title')?.invalid && newsForm.get('title')?.touched) {
                        <p class="mt-1.5 text-[11px] font-medium text-red-500">• Title is required (minimum 10 characters)</p>
                      }
                    </div>

                    <!-- Category (only for news, not success story) -->
                    @if (activeTab() === 'news') {
                      <div class="mb-6">
                        <label class="input-label">Category <span class="text-error-600">*</span></label>
                        <app-custom-select
                          formControlName="categoryId"
                          [options]="newsCategoryOptions()"
                          placeholder="Select category"
                        ></app-custom-select>
                      </div>
                    }

                    <div class="mb-6">
                      <label class="input-label">Content <span class="text-error-600">*</span></label>
                      <textarea formControlName="content" rows="20" class="input-field min-h-[500px]" placeholder="Write your content here..."
                                [class.border-red-300]="newsForm.get('content')?.invalid && newsForm.get('content')?.touched"
                                [class.ring-red-100]="newsForm.get('content')?.invalid && newsForm.get('content')?.touched"></textarea>
                      <div class="flex justify-between mt-1.5 text-[11px] text-neutral-400 font-medium tracking-wide">
                        @if (newsForm.get('content')?.invalid && newsForm.get('content')?.touched) {
                          <p class="text-red-500">Content is required (minimum 100 characters)</p>
                        } @else {
                          <p>Minimum 100 characters</p>
                        }
                        <p>{{ newsForm.get('content')?.value?.length || 0 }} characters</p>
                      </div>
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-6">
                      <label class="input-label">Image</label>
                      <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                        @if (imagePreview()) {
                          <div class="relative">
                            <img [src]="imagePreview() | appImageUrl" alt="Preview" class="max-h-64 mx-auto rounded-lg mb-4">
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
                            {{ editingItem() ? 'Resubmit for Review' : 'Submit for Review' }}
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
                      <input formControlName="title" type="text" class="input-field"
                             [class.border-red-300]="eventForm.get('title')?.invalid && eventForm.get('title')?.touched"
                             [class.ring-red-100]="eventForm.get('title')?.invalid && eventForm.get('title')?.touched">
                      @if (eventForm.get('title')?.invalid && eventForm.get('title')?.touched) {
                        <p class="mt-1.5 text-[11px] font-medium text-red-500">• Title is required</p>
                      }
                    </div>

                    <!-- Description -->
                    <div class="mb-6">
                      <label class="input-label">Description <span class="text-error-600">*</span></label>
                      <textarea formControlName="description" rows="6" class="input-field"
                                [class.border-red-300]="eventForm.get('description')?.invalid && eventForm.get('description')?.touched"
                                [class.ring-red-100]="eventForm.get('description')?.invalid && eventForm.get('description')?.touched"></textarea>
                      @if (eventForm.get('description')?.invalid && eventForm.get('description')?.touched) {
                        <p class="mt-1.5 text-[11px] font-medium text-red-500">• Description is required</p>
                      }
                    </div>

                    <!-- Date and Location Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label class="input-label">Event Date <span class="text-error-600">*</span></label>
                        <input formControlName="eventDate" type="datetime-local" class="input-field"
                               [class.border-red-300]="eventForm.get('eventDate')?.invalid && eventForm.get('eventDate')?.touched"
                               [class.ring-red-100]="eventForm.get('eventDate')?.invalid && eventForm.get('eventDate')?.touched">
                      </div>
                      <div>
                        <label class="input-label">Location <span class="text-error-600">*</span></label>
                        <input formControlName="location" type="text" class="input-field"
                               [class.border-red-300]="eventForm.get('location')?.invalid && eventForm.get('location')?.touched"
                               [class.ring-red-100]="eventForm.get('location')?.invalid && eventForm.get('location')?.touched">
                      </div>
                    </div>

                    <!-- Category and Capacity Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label class="input-label">Category</label>
                        <app-custom-select
                          formControlName="categoryId"
                          [options]="eventCategoryOptions()"
                          placeholder="Select category"
                        ></app-custom-select>
                      </div>
                      <div>
                        <label class="input-label">Capacity (optional)</label>
                        <input formControlName="capacity" type="number" class="input-field" placeholder="Leave empty for unlimited">
                      </div>
                    </div>

                    <!-- Image Upload -->
                    <div class="mb-6">
                      <label class="input-label">Image</label>
                      <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                        @if (imagePreview()) {
                          <div class="relative">
                            <img [src]="imagePreview() | appImageUrl" alt="Preview" class="max-h-64 mx-auto rounded-lg mb-4">
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
                      <div class="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                        <div class="flex items-start justify-between gap-6">
                          <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 class="text-lg font-semibold text-neutral-900">{{ item.title }}</h3>
                              @if ($any(item.status) === 'Draft' || $any(item.status) === 0) {
                                @if (item.rejectionReason) {
                                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100 flex items-center gap-1">
                                    <lucide-icon [img]="alertIcon" [size]="12"></lucide-icon>
                                    Rejected
                                  </span>
                                } @else {
                                  <span class="badge badge-secondary">Draft</span>
                                }
                              }
                              @if ($any(item.status) === 'PendingReview' || $any(item.status) === 1) {
                                <span class="badge badge-warning">Pending Review</span>
                              }
                              @if ($any(item.status) === 'Published' || $any(item.status) === 2) {
                                <span class="badge badge-success">Published</span>
                              }
                            </div>
                            <p class="text-neutral-600 mb-3 line-clamp-2">
                              {{ getItemDescription(item) }}
                            </p>
                            @if (($any(item.status) === 'Draft' || $any(item.status) === 0) && item.rejectionReason) {
                              <div class="mt-2.5 mb-3 text-xs text-red-750 bg-red-50/50 border border-red-100 rounded-lg p-3">
                                <strong class="block text-red-800 mb-0.5 font-bold uppercase tracking-wider text-[10px]">Feedback from Administrator</strong>
                                {{ item.rejectionReason }}
                              </div>
                            }
                            <div class="flex items-center gap-4 text-sm text-neutral-500">
                              <div class="flex items-center gap-1">
                                <lucide-icon [img]="clockIcon" [size]="14"></lucide-icon>
                                {{ formatDate(item.createdAt) }}
                              </div>
                            </div>
                          </div>
                          <div class="flex flex-col gap-2 shrink-0">
                            <button (click)="viewArticleDetail(item)" class="btn-outline btn-sm flex items-center justify-center gap-1">
                              <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                              View
                            </button>
                            <button (click)="editItem(item)" class="btn-outline btn-sm flex items-center justify-center gap-1">
                              <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                              Edit
                            </button>
                            <button (click)="deleteItem(item.id)" class="btn-outline btn-sm text-error-600 flex items-center justify-center gap-1">
                              <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
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
  private router = inject(Router);

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
  alertIcon = AlertCircle;

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

  newsCategoryOptions = computed<SelectOption[]>(() => {
    return [
      { label: 'Select category', value: '' },
      ...this.newsCategories().map(cat => ({ label: cat.name, value: cat.id }))
    ];
  });

  eventCategoryOptions = computed<SelectOption[]>(() => {
    return [
      { label: 'Select category', value: '' },
      ...this.eventCategories().map(cat => ({ label: cat.name, value: cat.id }))
    ];
  });
  
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

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const user = this.authStore.currentUser;
    if (!user) return;

    this.route.queryParams.subscribe(params => {
      const tabParam = params['tab'];
      if (tabParam === 'news' || tabParam === 'events' || tabParam === 'success-story') {
        this.activeTab.set(tabParam);
      } else {
        // Set initial tab based on role
        if (this.isAlumni() && !this.isAdmin() && !this.isContentCreator()) {
          this.activeTab.set('success-story');
        } else {
          this.activeTab.set('news');
        }
      }
      this.loadMyContent();
    });

    this.loadCategories();
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
    this.isLoading.set(true);
    
    this.newsService.getMyArticles().subscribe({
      next: (articles) => {
        if (this.activeTab() === 'success-story') {
          this.myNews.set(articles.filter(a => a.category?.slug === 'success-story'));
        } else {
          this.myNews.set(articles.filter(a => a.category?.slug !== 'success-story'));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading my articles:', err);
        this.isLoading.set(false);
      }
    });

    if (this.canManageEvents()) {
      this.isLoading.set(true);
      this.eventsService.getUpcomingEvents(1, 100).subscribe({
        next: (res) => {
          this.myEvents.set(res.items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.isLoading.set(false);
        }
      });
    }
  }

  setActiveTab(tab: 'news' | 'events' | 'success-story'): void {
    this.activeTab.set(tab);
    this.showForm.set(false);
    this.loadMyContent();
  }

  openForm(): void {
    if (this.activeTab() === 'success-story') {
      this.router.navigate(['/submit-content']);
      return;
    }
    this.resetForms();
    this.editingItem.set(null);
    this.submissionSuccess.set(false);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.resetForms();
    this.editingItem.set(null);
  }

  private resetForms(): void {
    this.newsForm.reset();
    this.eventForm.reset();
    this.imagePreview.set(null);
    this.selectedFile.set(null);
  }

  submitNews(): void {
    if (this.newsForm.invalid) return;

    if (this.activeTab() === 'success-story' && !this.selectedFile() && !this.editingItem()?.imageUrl) {
      alert('Please upload an image for your success story');
      return;
    }

    this.isSubmitting.set(true);

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
      this.submitNewsWithImages('', '');
    }
  }

  private submitNewsWithImages(imageUrl: string, thumbnailUrl: string): void {
    const formValue = this.newsForm.value;
    
    const finalImageUrl = this.imagePreview() ? (imageUrl || this.editingItem()?.imageUrl) : undefined;
    const finalThumbnailUrl = this.imagePreview() ? (thumbnailUrl || this.editingItem()?.thumbnailUrl) : undefined;

    const request = this.activeTab() === 'success-story' 
      ? {
          title: formValue.title,
          content: formValue.content,
          imageUrl: finalImageUrl,
          thumbnailUrl: finalThumbnailUrl,
          categorySlug: 'success-story'
        }
      : {
          title: formValue.title,
          content: formValue.content,
          categoryId: formValue.categoryId,
          imageUrl: finalImageUrl || undefined,
          thumbnailUrl: finalThumbnailUrl || undefined,
          publish: this.isAdmin()
        };

    const isEdit = this.editingItem() !== null;
    const apiCall = isEdit
      ? this.newsService.updateArticle(this.editingItem().id, request as any)
      : (this.activeTab() === 'success-story'
        ? this.newsService.submitContent(request as any)
        : this.newsService.createArticle(request as any));

    apiCall.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        setTimeout(() => {
          this.cancelForm();
          this.loadMyContent();
        }, 2000);
      },
      error: (err: any) => {
        console.error('Error submitting:', err);
        alert(`Error: ${err.error?.message || 'Failed to submit. Please try again.'}`);
        this.isSubmitting.set(false);
      }
    });
  }

  submitEvent(): void {
    if (this.eventForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const file = this.selectedFile();
    if (file) {
      this.fileUploadService.uploadContentImage(file, 'event').subscribe({
        next: (response) => {
          if (response.success) {
            this.submitEventWithImages(response.imageUrl, response.thumbnailUrl);
          } else {
            this.isSubmitting.set(false);
            alert('Image upload failed: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Image upload error:', err);
          this.isSubmitting.set(false);
          alert('Failed to upload image: ' + (err.error?.message || 'Please try again.'));
        }
      });
    } else {
      this.submitEventWithImages('', '');
    }
  }

  private submitEventWithImages(imageUrl: string, thumbnailUrl: string): void {
    const formValue = this.eventForm.value;
    const finalImageUrl = this.imagePreview() ? (imageUrl || this.editingItem()?.imageUrl) : undefined;
    const finalThumbnailUrl = this.imagePreview() ? (thumbnailUrl || this.editingItem()?.thumbnailUrl) : undefined;
    
    const request = {
      ...formValue,
      eventDate: new Date(formValue.eventDate),
      imageUrl: finalImageUrl,
      thumbnailUrl: finalThumbnailUrl,
      publish: this.isAdmin()
    };

    const isEdit = this.editingItem() !== null;
    const apiCall = isEdit
      ? this.eventsService.updateEvent(this.editingItem().id, request)
      : this.eventsService.createEvent(request);

    apiCall.subscribe({
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
        alert(`Error: ${err.error?.message || 'Failed to submit event. Please try again.'}`);
        this.isSubmitting.set(false);
      }
    });
  }

  saveAsDraft(): void {
    if (this.newsForm.invalid) return;
    this.isSubmitting.set(true);
    const formValue = this.newsForm.value;
    
    const request = {
      title: formValue.title,
      content: formValue.content,
      categoryId: formValue.categoryId,
      publish: false
    };

    const isEdit = this.editingItem() !== null;
    const apiCall = isEdit
      ? this.newsService.updateArticle(this.editingItem().id, request as any)
      : this.newsService.createArticle(request as any);

    apiCall.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        setTimeout(() => {
          this.cancelForm();
          this.loadMyContent();
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving draft:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  saveEventAsDraft(): void {
    if (this.eventForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const file = this.selectedFile();
    if (file) {
      this.fileUploadService.uploadContentImage(file, 'event').subscribe({
        next: (response) => {
          if (response.success) {
            this.saveEventDraftWithImages(response.imageUrl, response.thumbnailUrl);
          } else {
            this.isSubmitting.set(false);
            alert('Image upload failed: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Image upload error:', err);
          this.isSubmitting.set(false);
          alert('Failed to upload image: ' + (err.error?.message || 'Please try again.'));
        }
      });
    } else {
      this.saveEventDraftWithImages('', '');
    }
  }

  private saveEventDraftWithImages(imageUrl: string, thumbnailUrl: string): void {
    const formValue = this.eventForm.value;
    const finalImageUrl = this.imagePreview() ? (imageUrl || this.editingItem()?.imageUrl) : undefined;
    const finalThumbnailUrl = this.imagePreview() ? (thumbnailUrl || this.editingItem()?.thumbnailUrl) : undefined;
    
    const request = {
      ...formValue,
      eventDate: new Date(formValue.eventDate),
      imageUrl: finalImageUrl,
      thumbnailUrl: finalThumbnailUrl,
      publish: false
    };

    const isEdit = this.editingItem() !== null;
    const apiCall = isEdit
      ? this.eventsService.updateEvent(this.editingItem().id, request)
      : this.eventsService.createEvent(request);

    apiCall.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
        setTimeout(() => {
          this.cancelForm();
          this.loadMyContent();
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving event draft:', err);
        alert(`Error: ${err.error?.message || 'Failed to save event draft. Please try again.'}`);
        this.isSubmitting.set(false);
      }
    });
  }

  editItem(item: any): void {
    if (this.activeTab() === 'success-story') {
      this.router.navigate(['/submit-content'], { queryParams: { editId: item.id } });
      return;
    }

    this.submissionSuccess.set(false);
    this.isLoading.set(true);
    
    if (this.activeTab() === 'news') {
      this.newsService.getArticleById(item.id).subscribe({
        next: (full) => {
          this.editingItem.set(full);
          this.newsForm.patchValue({
            title: full.title,
            content: full.content || '',
            categoryId: full.category?.id || ''
          });
          if (full.imageUrl) {
            this.imagePreview.set(full.imageUrl);
          } else {
            this.imagePreview.set(null);
          }
          this.selectedFile.set(null);
          this.showForm.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading article for edit:', err);
          alert('Failed to load article details.');
          this.isLoading.set(false);
        }
      });
    } else if (this.activeTab() === 'events') {
      this.eventsService.getEventById(item.id).subscribe({
        next: (full) => {
          this.editingItem.set(full);
          this.eventForm.patchValue({
            title: full.title,
            description: full.description,
            eventDate: this.toDatetimeLocal(full.eventDate),
            location: full.location,
            categoryId: full.category?.id || '',
            capacity: full.capacity || null
          });
          this.showForm.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading event for edit:', err);
          alert('Failed to load event details.');
          this.isLoading.set(false);
        }
      });
    }
  }

  private toDatetimeLocal(dateStr: string | Date): string {
    const d = new Date(dateStr);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  deleteItem(id: number): void {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const apiCall = this.activeTab() === 'events'
      ? this.eventsService.deleteEvent(id)
      : this.newsService.deleteArticle(id);

    apiCall.subscribe({
      next: () => {
        this.loadMyContent();
      },
      error: (err) => {
        console.error('Error deleting item:', err);
        alert(err.error?.message || 'Failed to delete item.');
      }
    });
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

  viewArticleDetail(item: any): void {
    const path = this.activeTab() === 'events' ? `/events/${item.slug}` : `/news/${item.slug}`;
    this.router.navigate([path]);
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
