import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { NewsService } from '../../services/news.service';
import { UserAuthStore } from '../../../../core/state/user-auth.store';

/**
 * Submit Success Story Component
 * 
 * Allows alumni to submit their success stories for admin review.
 * Stories are automatically categorized as "Success Story" and set to pending review.
 */
@Component({
  selector: 'app-submit-success-story',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <button 
          routerLink="/success-stories"
          class="btn-outline mb-6 inline-flex items-center gap-2"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="18"></lucide-icon>
          Back to Success Stories
        </button>

        @if (submissionSuccess()) {
          <!-- Success Message -->
          <div class="bg-white rounded-lg shadow-lg p-12 text-center">
            <div class="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [img]="checkIcon" [size]="40" class="text-success-600"></lucide-icon>
            </div>
            <h2 class="text-3xl font-bold text-neutral-900 mb-4">Story Submitted Successfully!</h2>
            <p class="text-lg text-neutral-600 mb-8">
              Thank you for sharing your success story! Your submission is now awaiting admin approval. 
              You'll receive an email notification once it's reviewed.
            </p>
            <div class="flex gap-4 justify-center">
              <button routerLink="/success-stories" class="btn-primary">
                View Success Stories
              </button>
              <button (click)="submitAnother()" class="btn-outline">
                Submit Another Story
              </button>
            </div>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <h1 class="text-2xl font-bold mb-2">Share Your Success Story</h1>
              <p class="text-amber-50">
                Inspire fellow alumni by sharing your achievements, challenges overcome, and lessons learned.
              </p>
            </div>

            <!-- Form -->
            <div class="p-8">
              @if (errorMessage()) {
                <div class="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
                  <div class="flex items-start gap-3">
                    <lucide-icon [img]="alertIcon" [size]="20" class="text-error-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <div>
                      <p class="font-semibold text-error-900 mb-1">Submission Failed</p>
                      <p class="text-sm text-error-700">{{ errorMessage() }}</p>
                    </div>
                  </div>
                </div>
              }

              <form [formGroup]="storyForm" (ngSubmit)="onSubmit()">
                <!-- Title Field -->
                <div class="mb-6">
                  <label for="title" class="block text-sm font-medium text-neutral-700 mb-2">
                    Story Title <span class="text-error-600">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    formControlName="title"
                    class="input-field"
                    placeholder="e.g., From Student to Mountain Guide: My Journey"
                    [class.border-error-500]="storyForm.get('title')?.invalid && storyForm.get('title')?.touched"
                  >
                  @if (storyForm.get('title')?.invalid && storyForm.get('title')?.touched) {
                    <p class="mt-1 text-sm text-error-600">Title is required (minimum 10 characters)</p>
                  }
                </div>

                <!-- Content Field -->
                <div class="mb-6">
                  <label for="content" class="block text-sm font-medium text-neutral-700 mb-2">
                    Your Story <span class="text-error-600">*</span>
                  </label>
                  <textarea
                    id="content"
                    formControlName="content"
                    rows="12"
                    class="input-field"
                    placeholder="Share your journey, achievements, challenges, and lessons learned. Be authentic and inspiring!"
                    [class.border-error-500]="storyForm.get('content')?.invalid && storyForm.get('content')?.touched"
                  ></textarea>
                  <div class="flex justify-between mt-1">
                    @if (storyForm.get('content')?.invalid && storyForm.get('content')?.touched) {
                      <p class="text-sm text-error-600">Story content is required (minimum 100 characters)</p>
                    } @else {
                      <p class="text-sm text-neutral-500">Minimum 100 characters</p>
                    }
                    <p class="text-sm text-neutral-500">{{ storyForm.get('content')?.value?.length || 0 }} characters</p>
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-neutral-700 mb-2">
                    Story Image <span class="text-error-600">*</span>
                  </label>
                  <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    @if (imagePreview()) {
                      <div class="relative">
                        <img [src]="imagePreview()" alt="Preview" class="max-h-64 mx-auto rounded-lg mb-4">
                        <button 
                          type="button"
                          (click)="removeImage()"
                          class="btn-outline btn-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    } @else {
                      <lucide-icon [img]="imageIcon" [size]="48" class="text-neutral-400 mx-auto mb-4"></lucide-icon>
                      <p class="text-neutral-600 mb-2">Upload a photo that represents your story</p>
                      <p class="text-sm text-neutral-500 mb-4">PNG, JPG, WebP up to 5MB</p>
                      <label class="btn-primary cursor-pointer inline-flex items-center gap-2">
                        <lucide-icon [img]="uploadIcon" [size]="18"></lucide-icon>
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
                    <p class="mt-1 text-sm text-error-600">{{ imageError() }}</p>
                  }
                </div>

                <!-- Guidelines -->
                <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 class="font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
                  <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Be authentic and share your genuine experiences</li>
                    <li>Include specific achievements and outcomes</li>
                    <li>Mention challenges you overcame</li>
                    <li>Share lessons learned that could help others</li>
                    <li>Keep it professional and inspiring</li>
                  </ul>
                </div>

                <!-- Review Notice -->
                <div class="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p class="text-sm text-amber-800">
                    <strong>Note:</strong> Your story will be reviewed by our admin team before publication. 
                    This typically takes 2-3 business days. You'll receive an email notification once your story is approved.
                  </p>
                </div>

                <!-- Submit Button -->
                <div class="flex gap-4">
                  <button
                    type="submit"
                    [disabled]="storyForm.invalid || !imagePreview() || isSubmitting()"
                    class="btn-primary flex-1"
                    [class.opacity-50]="storyForm.invalid || !imagePreview() || isSubmitting()"
                    [class.cursor-not-allowed]="storyForm.invalid || !imagePreview() || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="flex items-center justify-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </span>
                    } @else {
                      Submit Story for Review
                    }
                  </button>
                  <button
                    type="button"
                    routerLink="/success-stories"
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
export class SubmitSuccessStoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private newsService = inject(NewsService);
  private authStore = inject(UserAuthStore);

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

  // Form
  storyForm: FormGroup;

  constructor() {
    this.storyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(100)]]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated and has alumni role
    const user = this.authStore.currentUser;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
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
    if (this.storyForm.invalid || !this.selectedFile() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // TODO: Upload image first, then submit story with image URL
    // For now, we'll use a placeholder
    const formValue = this.storyForm.value;
    const request = {
      title: formValue.title,
      content: formValue.content,
      imageUrl: 'https://via.placeholder.com/800x600', // TODO: Replace with actual uploaded image URL
      thumbnailUrl: 'https://via.placeholder.com/400x300' // TODO: Replace with actual thumbnail URL
    };

    this.newsService.submitSuccessStory(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submissionSuccess.set(true);
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred while submitting your story. Please try again.');
      }
    });
  }

  submitAnother(): void {
    this.submissionSuccess.set(false);
    this.storyForm.reset();
    this.removeImage();
  }
}
