import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService, UploadImageResponse } from '../../services/profile.service';

/**
 * Component for uploading and previewing profile images.
 * Provides drag-and-drop functionality, file validation, and image preview.
 * Handles image upload with progress indication and error handling.
 * 
 * Features:
 * - Drag and drop file upload
 * - Image preview before upload
 * - File validation (type, size)
 * - Upload progress indication
 * - Error handling and user feedback
 * - Responsive design for mobile and desktop
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-profile-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Profile Image Upload Component -->
    <div class="max-w-md mx-auto" [class.opacity-60]="disabled" [class.pointer-events-none]="disabled">
      
      <!-- Upload Area -->
      <div 
        class="upload-area relative border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center bg-neutral-50 transition-all duration-300 cursor-pointer min-h-[200px] flex items-center justify-center hover:border-primary-500 hover:bg-primary-50"
        [class.drag-over]="isDragOver"
        [class.has-preview]="hasPreview"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="!disabled && !hasPreview && fileInput.click()">
        
        <!-- Image Preview -->
        <div class="image-preview relative w-full h-full rounded-xl overflow-hidden" *ngIf="hasPreview">
          <img 
            [src]="previewUrl" 
            [alt]="'Profile image preview'"
            class="preview-image w-full h-full object-cover rounded-xl">
          
          <!-- Upload Overlay -->
          <div class="upload-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl" *ngIf="!disabled">
            <div class="upload-actions flex gap-2">
              <button 
                type="button" 
                class="btn-secondary btn-sm"
                (click)="$event.stopPropagation(); fileInput.click()">
                <i class="fas fa-camera"></i>
                Change Photo
              </button>
              <button 
                type="button" 
                class="btn-outline btn-sm border-error-500 text-error-500 hover:bg-error-500 hover:text-white"
                (click)="$event.stopPropagation(); removeImage()">
                <i class="fas fa-trash"></i>
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Placeholder -->
        <div class="upload-placeholder flex flex-col items-center gap-4" *ngIf="!hasPreview">
          <div class="upload-icon text-5xl text-neutral-500">
            <i class="fas fa-cloud-upload-alt"></i>
          </div>
          <div class="upload-text">
            <h4 class="text-xl font-semibold text-neutral-700 m-0">Upload Profile Photo</h4>
            <p class="text-neutral-500 my-2">Drag and drop an image here, or click to browse</p>
            <small class="text-sm text-neutral-400">
              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
            </small>
          </div>
        </div>

        <!-- Upload Progress -->
        <div class="upload-progress absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 text-center" *ngIf="isUploading">
          <div class="progress-bar w-full h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
            <div 
              class="progress-fill h-full bg-primary-500 rounded-full"
              [style.width.%]="uploadProgress">
            </div>
          </div>
          <p class="progress-text text-sm text-neutral-700 m-0">Uploading... {{ uploadProgress }}%</p>
        </div>
      </div>

      <!-- File Input (Hidden) -->
      <input 
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        (change)="onFileSelected($event)"
        class="hidden">

      <!-- Selected File Info -->
      <div class="file-info mt-4 p-4 bg-neutral-50 rounded-lg flex justify-between items-center" *ngIf="selectedFile && !isUploading">
        <div class="file-details flex items-center gap-2 flex-1">
          <i class="fas fa-image text-primary-500"></i>
          <span class="file-name font-medium text-neutral-700">{{ selectedFile.name }}</span>
          <span class="file-size text-sm text-neutral-500">{{ getFileSizeText(selectedFile.size) }}</span>
        </div>
        
        <div class="file-actions flex gap-2">
          <button 
            type="button" 
            class="btn-primary btn-sm"
            [disabled]="!canUpload"
            (click)="uploadImage()">
            <i class="fas fa-upload"></i>
            Upload
          </button>
          <button 
            type="button" 
            class="btn-outline btn-sm"
            (click)="cancelUpload()">
            <i class="fas fa-times"></i>
            Cancel
          </button>
        </div>
      </div>

      <!-- Error Message -->
      <div class="error-message mt-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-center gap-2" *ngIf="errorMessage">
        <i class="fas fa-exclamation-triangle text-error-500"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Help Text -->
      <div class="help-text mt-4 text-center" *ngIf="!hasPreview && !selectedFile">
        <small class="text-sm text-muted">
          <i class="fas fa-info-circle mr-1"></i>
          A profile photo helps other alumni recognize you in the directory.
        </small>
      </div>
    </div>
  `,
  styles: [`
    /* Custom styles for drag and drop states */
    .upload-area.drag-over {
      border-color: rgb(34 197 94);
      background-color: rgb(240 253 244);
      transform: scale(1.05);
    }

    .upload-area.has-preview {
      padding: 0;
      border: none;
      background-color: transparent;
      min-height: 300px;
    }

    .upload-overlay {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .image-preview:hover .upload-overlay {
      opacity: 1;
    }

    /* Progress bar animation */
    .progress-fill {
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class ProfileImageUploadComponent implements OnInit, OnDestroy {
  @Input() 
  /** Current profile image URL to display as default */
  currentImageUrl?: string;
  
  @Input() 
  /** Whether the component is disabled */
  disabled = false;
  
  @Output() 
  /** Emitted when image upload is successful */
  imageUploaded = new EventEmitter<string>();
  
  @Output() 
  /** Emitted when upload fails */
  uploadError = new EventEmitter<string>();

  // Component state
  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  
  // File validation constants
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  private destroy$ = new Subject<void>();

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    // Initialize with current image if available
    if (this.currentImageUrl) {
      this.previewUrl = this.currentImageUrl;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles drag over event for drag-and-drop functionality
   */
  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Handles drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Handles file drop event
   */
  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  /**
   * Handles file input change event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  /**
   * Handles file selection and validation
   */
  private handleFileSelection(file: File): void {
    this.clearError();
    
    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.showError('File size must be less than 5MB');
      return;
    }

    this.selectedFile = file;
    this.createPreview(file);
  }

  /**
   * Creates image preview from selected file
   */
  private createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Uploads the selected image file
   */
  uploadImage(): void {
    if (!this.selectedFile || this.disabled) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.clearError();

    // Simulate progress (in real implementation, you might use HttpEventType.UploadProgress)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 100);

    this.profileService.uploadProfileImage(this.selectedFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: UploadImageResponse) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;
          
          // Update preview with new image URL
          this.previewUrl = response.profileImageUrl;
          
          // Emit success event
          this.imageUploaded.emit(response.profileImageUrl);
          
          // Reset state
          setTimeout(() => {
            this.isUploading = false;
            this.uploadProgress = 0;
            this.selectedFile = null;
          }, 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 0;
          
          const errorMessage = error.error?.message || 'Failed to upload image. Please try again.';
          this.showError(errorMessage);
          this.uploadError.emit(errorMessage);
        }
      });
  }

  /**
   * Cancels the upload and resets the component state
   */
  cancelUpload(): void {
    this.selectedFile = null;
    this.previewUrl = this.currentImageUrl || null;
    this.clearError();
    this.isUploading = false;
    this.uploadProgress = 0;
  }

  /**
   * Removes the current image
   */
  removeImage(): void {
    this.previewUrl = null;
    this.selectedFile = null;
    this.clearError();
    this.imageUploaded.emit('');
  }

  /**
   * Shows error message to user
   */
  private showError(message: string): void {
    this.errorMessage = message;
  }

  /**
   * Clears error message
   */
  private clearError(): void {
    this.errorMessage = '';
  }

  /**
   * Gets the display text for file size
   */
  getFileSizeText(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  /**
   * Checks if a file is selected and ready for upload
   */
  get canUpload(): boolean {
    return !!(this.selectedFile && !this.isUploading && !this.disabled);
  }

  /**
   * Checks if there's a preview image to show
   */
  get hasPreview(): boolean {
    return !!(this.previewUrl);
  }
}
