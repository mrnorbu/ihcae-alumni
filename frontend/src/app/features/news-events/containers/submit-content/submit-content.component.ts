import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-angular';
import { HeaderComponent, FooterComponent, SelectOption } from '../../../../shared/components';
import { NewsService } from '../../services/news.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import { NewsCategory, SubmitContentRequest } from '../../models';
import { FileUploadService } from '../../../../shared/services/file-upload.service';

/**
 * Submit Content Component
 * 
 * Allows alumni to submit success stories or news articles for admin review.
 * Supports both creating new content and editing/resubmitting rejected drafts.
 */
@Component({
  selector: 'app-submit-content',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white page-fade-in">
      <app-header></app-header>
      
      <div class="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
        <!-- Back Button -->
        <button 
          routerLink="/dashboard"
          class="btn-outline mb-4 inline-flex items-center gap-1.5"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="14"></lucide-icon>
          Back to Dashboard
        </button>

        @if (submissionSuccess()) {
          <!-- Success Message -->
          <div class="py-8 text-center max-w-lg mx-auto">
            <div class="w-12 h-12 bg-success-50 text-success-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <lucide-icon [img]="checkIcon" [size]="24" class="text-success-600"></lucide-icon>
            </div>
            <h2 class="text-lg font-bold text-neutral-900 mb-1.5">
              {{ editId() ? 'Content Updated & Resubmitted!' : 'Content Submitted!' }}
            </h2>
            <p class="text-xs text-neutral-500 mb-5 leading-relaxed">
              Thank you for sharing! Your submission is now awaiting admin approval. 
              You'll receive an email notification once it's reviewed.
            </p>
            <div class="flex gap-2 justify-center">
              <button routerLink="/dashboard" class="btn-primary">
                View My Dashboard
              </button>
              @if (!editId()) {
                <button (click)="submitAnother()" class="btn-outline">
                  Submit Another
                </button>
              }
            </div>
          </div>
        } @else {
          <div>
            <!-- Header -->
            <div class="mb-8 border-b border-neutral-200/60 pb-5">
              <h1 class="text-3xl font-bold text-neutral-900 mb-2">
                {{ editId() ? 'Edit Submission' : 'Submit Content' }}
              </h1>
              <p class="text-sm text-neutral-500 font-normal">
                Share achievements, general news updates, or announcements with the alumni network.
              </p>
            </div>

            <!-- Rejection Feedback -->
            @if (editingItem()?.rejectionReason) {
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                <lucide-icon [img]="alertIcon" [size]="20" class="text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                <div>
                  <p class="font-bold text-sm text-amber-900 mb-1">Feedback from Administrator</p>
                  <p class="text-xs text-amber-750 leading-normal">{{ editingItem()?.rejectionReason }}</p>
                </div>
              </div>
            }

            <!-- Form -->
            <div>
              @if (errorMessage()) {
                <div class="bg-error-50/60 border border-error-200/60 rounded-lg p-3.5 mb-4">
                  <div class="flex items-start gap-2">
                     <lucide-icon [img]="alertIcon" [size]="14" class="text-error-700 flex-shrink-0 mt-0.5"></lucide-icon>
                     <div>
                       <p class="text-xs font-bold text-error-900 mb-0.5 leading-none">Submission Failed</p>
                       <p class="text-[11px] text-error-700">{{ errorMessage() }}</p>
                     </div>
                  </div>
                </div>
              }

              <form [formGroup]="contentForm" (ngSubmit)="onSubmit()">
                <!-- Category Field -->
                <div class="mb-5">
                  <label for="categorySlug" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Content Category <span class="text-error-600">*</span>
                  </label>
                  <select
                    id="categorySlug"
                    formControlName="categorySlug"
                    class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    [class.border-red-300]="contentForm.get('categorySlug')?.invalid && contentForm.get('categorySlug')?.touched"
                    [class.ring-red-100]="contentForm.get('categorySlug')?.invalid && contentForm.get('categorySlug')?.touched"
                  >
                    @for (option of categoryOptions(); track option.value) {
                      <option [value]="option.value">{{ option.label }}</option>
                    }
                  </select>
                </div>

                <!-- Title Field -->
                <div class="mb-5">
                  <label for="title" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Title <span class="text-error-600">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200"
                    placeholder="e.g., General News Announcement or Story Title"
                    [class.border-red-300]="contentForm.get('title')?.invalid && contentForm.get('title')?.touched"
                    [class.ring-red-100]="contentForm.get('title')?.invalid && contentForm.get('title')?.touched"
                  >
                  @if (contentForm.get('title')?.invalid && contentForm.get('title')?.touched) {
                    <p class="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <span>•</span> Title is required (minimum 10 characters)
                    </p>
                  }
                </div>

                <!-- Content Field -->
                <div class="mb-5">
                  <label for="content" class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Content / Body <span class="text-error-600">*</span>
                  </label>
                  <textarea
                    id="content"
                    formControlName="content"
                    rows="6"
                    class="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all duration-200 resize-none animate-in fade-in"
                    placeholder="Provide detailed description or story here..."
                    [class.border-red-300]="contentForm.get('content')?.invalid && contentForm.get('content')?.touched"
                    [class.ring-red-100]="contentForm.get('content')?.invalid && contentForm.get('content')?.touched"
                  ></textarea>
                  <div class="flex justify-between mt-1.5 text-[11px] text-neutral-400 font-medium tracking-wide">
                    @if (contentForm.get('content')?.invalid && contentForm.get('content')?.touched) {
                      <p class="text-red-500">Content is required (minimum 100 characters)</p>
                    } @else {
                      <p>Minimum 100 characters</p>
                    }
                    <p>{{ contentForm.get('content')?.value?.length || 0 }} characters</p>
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="mb-6">
                  <label class="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                    Featured Image 
                    @if (contentForm.get('categorySlug')?.value === 'success-story') {
                      <span class="text-error-600">* (Required for Success Stories)</span>
                    } @else {
                      <span class="text-neutral-400 normal-case tracking-normal">(Optional)</span>
                    }
                  </label>
                  <div class="border-2 border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    @if (imagePreview()) {
                      <div class="relative">
                        <img [src]="imagePreview()" alt="Preview" class="max-h-48 mx-auto rounded-lg mb-4 shadow-sm border border-neutral-200">
                        <button 
                          type="button"
                          (click)="removeImage()"
                          class="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                          Remove Image
                        </button>
                      </div>
                    } @else {
                      <div class="w-12 h-12 bg-white border border-neutral-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <lucide-icon [img]="imageIcon" [size]="20" class="text-neutral-400"></lucide-icon>
                      </div>
                      <p class="text-sm font-medium text-neutral-700 mb-1">Upload a photo for your submission</p>
                      <p class="text-xs text-neutral-500 mb-4">PNG, JPG, WebP up to 5MB</p>
                      <label class="cursor-pointer inline-flex items-center justify-center gap-2 btn-outline shadow-sm">
                        <lucide-icon [img]="uploadIcon" [size]="14"></lucide-icon>
                        Choose Image
                        <input 
                          type="file" 
                          class="hidden" 
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          (change)="onImageSelected($event)"
                        >
                      </label>
                    }
                  </div>
                  @if (imageError()) {
                    <p class="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                      <span>•</span> {{ imageError() }}
                    </p>
                  }
                </div>

                <div class="space-y-4 mb-8">
                  <!-- Guidelines -->
                  <div class="p-4 bg-primary-50/50 border border-primary-100/50 rounded-xl">
                    <h3 class="font-bold text-sm text-primary-900 mb-2 flex items-center gap-2">
                      <lucide-icon [img]="checkIcon" [size]="14" class="text-primary-600"></lucide-icon>
                      Submission Guidelines
                    </h3>
                    <ul class="text-xs text-primary-800/80 space-y-1.5 list-disc list-inside ml-1">
                      <li>Be accurate, genuine, and respectful of guidelines</li>
                      <li>Ensure content matches selected category appropriately</li>
                      <li>Include high quality descriptive media if possible</li>
                      <li>Verify details before submitting for official review</li>
                    </ul>
                  </div>

                  <!-- Review Notice -->
                  <div class="p-4 bg-neutral-50 border border-neutral-200/60 rounded-xl">
                    <p class="text-xs text-neutral-600 leading-relaxed flex items-start gap-2">
                      <lucide-icon [img]="alertIcon" [size]="14" class="text-neutral-400 shrink-0 mt-0.5"></lucide-icon>
                      <span>
                        <strong>Note:</strong> Your content will be reviewed by our admin team before publication. 
                        This typically takes 2-3 business days. You'll receive an email notification once it is approved.
                      </span>
                    </p>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="flex gap-3 pt-2">
                  <button
                    type="submit"
                    [disabled]="contentForm.invalid || (contentForm.get('categorySlug')?.value === 'success-story' && !imagePreview()) || isSubmitting()"
                    class="btn-primary flex-1 flex items-center justify-center gap-2"
                    [class.opacity-50]="contentForm.invalid || (contentForm.get('categorySlug')?.value === 'success-story' && !imagePreview()) || isSubmitting()"
                    [class.cursor-not-allowed]="contentForm.invalid || (contentForm.get('categorySlug')?.value === 'success-story' && !imagePreview()) || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      <span>{{ editId() ? 'Resubmitting...' : 'Submitting...' }}</span>
                    } @else {
                      <span>{{ editId() ? 'Resubmit for Review' : 'Submit Content for Review' }}</span>
                      <lucide-icon [img]="checkIcon" [size]="14"></lucide-icon>
                    }
                  </button>
                  <button
                    type="button"
                    routerLink="/dashboard"
                    class="btn-outline"
                    [disabled]="isSubmitting()"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class SubmitContentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private newsService = inject(NewsService);
  private authStore = inject(UserAuthStore);
  private fileUploadService = inject(FileUploadService);

  // Icons
  arrowLeftIcon = ArrowLeft;
  uploadIcon = Upload;
  checkIcon = CheckCircle;
  alertIcon = AlertCircle;
  imageIcon = ImageIcon;

  // State
  isSubmitting = signal(false);
  submissionSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  imageError = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  categories = signal<NewsCategory[]>([]);
  categoryOptions = computed<SelectOption[]>(() => {
    return this.categories().map(cat => ({
      label: cat.name,
      value: cat.slug
    }));
  });

  // Edit Mode State
  editId = signal<string | null>(null);
  editingItem = signal<any | null>(null);

  // Form
  contentForm: FormGroup;

  constructor() {
    this.contentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(100)]],
      categorySlug: ['success-story', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    const user = this.authStore.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Load available categories and check for editId in query params
    this.newsService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        
        // Check query parameters for edit mode
        this.route.queryParams.subscribe(params => {
          const id = params['editId'];
          if (id) {
            this.editId.set(id);
            this.loadArticleForEdit(id);
          }
        });
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  private loadArticleForEdit(id: string): void {
    this.isSubmitting.set(true);
    this.newsService.getArticleById(id).subscribe({
      next: (article) => {
        this.editingItem.set(article);
        this.contentForm.patchValue({
          title: article.title,
          content: article.content,
          categorySlug: article.category.slug
        });
        if (article.imageUrl) {
          this.imagePreview.set(article.imageUrl);
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error loading article for edit:', err);
        this.errorMessage.set('Failed to load article details.');
        this.isSubmitting.set(false);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.imageError.set('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageError.set('Image size must be less than 5MB');
      return;
    }

    this.imageError.set(null);
    this.selectedFile.set(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.selectedFile.set(null);
    this.imageError.set(null);
  }

  onSubmit(): void {
    if (this.contentForm.invalid || this.isSubmitting()) {
      return;
    }

    const formValue = this.contentForm.value;
    if (formValue.categorySlug === 'success-story' && !this.selectedFile() && !this.imagePreview()) {
      this.imageError.set('Image is required for success stories');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const file = this.selectedFile();
    if (file) {
      this.fileUploadService.uploadContentImage(file, formValue.categorySlug === 'success-story' ? 'story' : 'news').subscribe({
        next: (response) => {
          if (response.success) {
            this.submitWithImages(formValue, response.imageUrl, response.thumbnailUrl);
          } else {
            this.isSubmitting.set(false);
            this.errorMessage.set(response.message || 'Image upload failed.');
          }
        },
        error: (err) => {
          console.error('Image upload error:', err);
          this.isSubmitting.set(false);
          this.errorMessage.set('Failed to upload image. Please try again.');
        }
      });
    } else {
      this.submitWithImages(formValue);
    }
  }

  private submitWithImages(formValue: any, imageUrl?: string, thumbnailUrl?: string): void {
    const finalImageUrl = imageUrl || this.editingItem()?.imageUrl;
    const finalThumbnailUrl = thumbnailUrl || this.editingItem()?.thumbnailUrl;

    if (this.editId()) {
      // Find the corresponding category object to get the Category ID
      const selectedCategory = this.categories().find(c => c.slug === formValue.categorySlug);
      const categoryId = selectedCategory?.id || '';

      const updateRequest = {
        title: formValue.title,
        content: formValue.content,
        categoryId: categoryId,
        imageUrl: finalImageUrl,
        thumbnailUrl: finalThumbnailUrl,
        publish: false
      };

      this.newsService.updateArticle(this.editId()!, updateRequest as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submissionSuccess.set(true);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred while updating. Please try again.');
        }
      });
    } else {
      const request: SubmitContentRequest = {
        title: formValue.title,
        content: formValue.content,
        categorySlug: formValue.categorySlug,
        imageUrl: finalImageUrl,
        thumbnailUrl: finalThumbnailUrl
      };

      this.newsService.submitContent(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submissionSuccess.set(true);
        },
        error: (err) => {
          console.error('Submission error:', err);
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'An error occurred while submitting. Please try again.');
        }
      });
    }
  }

  submitAnother(): void {
    this.submissionSuccess.set(false);
    this.contentForm.reset({ categorySlug: 'success-story' });
    this.removeImage();
    this.editId.set(null);
    this.editingItem.set(null);
  }
}
