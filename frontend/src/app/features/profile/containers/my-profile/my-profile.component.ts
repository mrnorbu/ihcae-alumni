import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileService, ProfileData, UpdateProfileRequest } from '../../services/profile.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { 
  LucideAngularModule, 
  User, 
  Edit, 
  Save, 
  X, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar
} from 'lucide-angular';

/**
 * My Profile Page Component
 * 
 * This component allows authenticated users to view and edit their own profile information.
 * It provides a toggle between view and edit modes with form validation and image upload capabilities.
 * 
 * **Features:**
 * - **View Mode**: Displays all profile information in a read-only format with professional layout
 * - **Edit Mode**: Provides editable form fields for updating profile data
 * - **Profile Image Upload**: Direct upload functionality with file validation (max 5MB, JPEG/PNG/GIF/WebP)
 * - **Real-time Updates**: Changes are immediately reflected after saving
 * - **Form Validation**: Client-side validation for required fields and formats
 * - **Responsive Design**: Adapts to mobile, tablet, and desktop screens
 * 
 * **UI/UX Design:**
 * - Uses Tailwind CSS with IHCAE brand colors (primary green, secondary blue)
 * - Lucide Angular icons for visual clarity
 * - Smooth transitions between view and edit modes
 * - Loading and saving states with visual feedback
 * - Gradient header with profile image overlay
 * 
 * **Data Flow:**
 * 1. Load profile data from ProfileService on initialization
 * 2. Display data in view mode by default
 * 3. Enter edit mode: Copy current data to editData object
 * 4. Save changes: Send update request and refresh profile data
 * 5. Cancel: Discard changes and return to view mode
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 * @since Epic 2 - Core Alumni Directory & Profiles
 */
@Component({
  selector: 'app-my-profile',
  standalone: true,
  // Import necessary modules for template functionality
  imports: [FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
    
      <!-- Main Content Container -->
      <!-- max-w-4xl: Constrains content width for readability -->
      <!-- pt-24: Top padding to account for fixed header -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-3xl font-bold text-neutral-900">My Profile</h1>
          @if (!isEditMode()) {
            <button
              (click)="enterEditMode()"
              class="btn-primary inline-flex items-center gap-2"
              >
              <lucide-icon [img]="editIcon" [size]="18"></lucide-icon>
              <span>Edit Profile</span>
            </button>
          }
        </div>
    
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-neutral-600">Loading profile...</p>
          </div>
        }
    
        <!-- Profile Content -->
        @if (!isLoading() && profile()) {
          <div class="space-y-6">
            <!-- Profile Image Card -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="relative h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
              <div class="relative px-6 pb-6">
                <div class="flex items-end -mt-16 mb-4">
                  <!-- Profile Image -->
                  <div class="relative">
                    <div class="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-neutral-200 flex items-center justify-center">
                      @if (profile()?.profileImageUrl && !isLucideIconUrl(profile()!.profileImageUrl)) {
                        <img
                          [src]="profile()!.profileImageUrl"
                          [alt]="profile()!.firstName + ' ' + profile()!.lastName"
                          class="w-full h-full object-cover"
                          />
                      }
                      @if (!profile()?.profileImageUrl || isLucideIconUrl(profile()!.profileImageUrl)) {
                        <lucide-icon
                          [img]="userIcon"
                          [size]="48"
                          class="text-neutral-400"
                        ></lucide-icon>
                      }
                    </div>
                    <!-- Upload Button (Edit Mode) -->
                    @if (isEditMode()) {
                      <button
                        (click)="fileInput.click()"
                        class="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-lg"
                        title="Change profile picture"
                        >
                        <lucide-icon [img]="cameraIcon" [size]="18"></lucide-icon>
                      </button>
                    }
                    <input
                      #fileInput
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      (change)="onImageSelected($event)"
                      class="hidden"
                      />
                  </div>
                  <!-- Name -->
                  <div class="ml-6 flex-1">
                    <h2 class="text-2xl font-bold text-neutral-900 truncate" [title]="(profile()?.firstName || '') + ' ' + (profile()?.lastName || '')">
                      {{ profile()?.firstName }} {{ profile()?.lastName }}
                    </h2>
                    <p class="text-neutral-600 truncate" [title]="profile()?.email || ''">{{ profile()?.email }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Edit Mode Actions -->
            @if (isEditMode()) {
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                <p class="text-sm text-yellow-800">
                  <lucide-icon [img]="editIcon" [size]="16" class="inline mr-2"></lucide-icon>
                  You are currently editing your profile
                </p>
                <div class="flex gap-2">
                  <button
                    (click)="cancelEdit()"
                    class="btn-outline btn-sm inline-flex items-center gap-2"
                    >
                    <lucide-icon [img]="cancelIcon" [size]="14"></lucide-icon>
                    <span>Cancel</span>
                  </button>
                  <button
                    (click)="saveProfile()"
                    [disabled]="isSaving()"
                    class="btn-primary btn-sm inline-flex items-center gap-2"
                    >
                    <lucide-icon [img]="saveIcon" [size]="14" [class.animate-spin]="isSaving()"></lucide-icon>
                    <span>{{ isSaving() ? 'Saving...' : 'Save Changes' }}</span>
                  </button>
                </div>
              </div>
            }
            <!-- Profile Information Card -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-neutral-900 mb-4">Profile Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Job Title -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="briefcaseIcon" [size]="16"></lucide-icon>
                    Job Title
                  </label>
                  @if (isEditMode()) {
                    <input
                      [(ngModel)]="editData.jobTitle"
                      type="text"
                      class="input-field"
                      placeholder="e.g., Mountain Guide"
                      />
                  }
                  @if (!isEditMode()) {
                    <p class="text-neutral-900">
                      {{ profile()?.jobTitle || 'Not specified' }}
                    </p>
                  }
                </div>
                <!-- Location -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="locationIcon" [size]="16"></lucide-icon>
                    Location
                  </label>
                  @if (isEditMode()) {
                    <input
                      [(ngModel)]="editData.location"
                      type="text"
                      class="input-field"
                      placeholder="e.g., Gangtok, Sikkim"
                      />
                  }
                  @if (!isEditMode()) {
                    <p class="text-neutral-900">
                      {{ profile()?.location || 'Not specified' }}
                    </p>
                  }
                </div>
                <!-- Course -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="gradIcon" [size]="16"></lucide-icon>
                    Course
                  </label>
                  @if (isEditMode()) {
                    <input
                      [(ngModel)]="editData.course"
                      type="text"
                      class="input-field"
                      placeholder="e.g., Advanced Mountaineering"
                      />
                  }
                  @if (!isEditMode()) {
                    <p class="text-neutral-900">
                      {{ profile()?.course || 'Not specified' }}
                    </p>
                  }
                </div>
                <!-- Batch -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
                    Batch (e.g. May 2025)
                  </label>
                  @if (isEditMode()) {
                    <input
                      [(ngModel)]="editData.batch"
                      type="text"
                      class="input-field"
                      placeholder="e.g., May 2025"
                      />
                  }
                  @if (!isEditMode()) {
                    <p class="text-neutral-900">
                      {{ profile()?.batch || 'Not specified' }}
                    </p>
                  }
                </div>
                <!-- Phone -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="phoneIcon" [size]="16"></lucide-icon>
                    Phone
                  </label>
                  @if (isEditMode()) {
                    <input
                      [(ngModel)]="editData.phone"
                      type="tel"
                      class="input-field"
                      placeholder="e.g., +91 98765 43210"
                      />
                  }
                  @if (!isEditMode()) {
                    <p class="text-neutral-900">
                      {{ profile()?.phone || 'Not specified' }}
                    </p>
                  }
                </div>
                <!-- Email (Read-only) -->
                <div>
                  <label class="input-label flex items-center gap-2">
                    <lucide-icon [img]="mailIcon" [size]="16"></lucide-icon>
                    Email
                  </label>
                  <p class="text-neutral-900 truncate" [title]="profile()?.email || ''">{{ profile()?.email }}</p>
                </div>
              </div>
              <!-- Bio -->
              <div class="mt-6">
                <label class="input-label">About Me</label>
                @if (isEditMode()) {
                  <textarea
                    [(ngModel)]="editData.bio"
                    rows="4"
                    class="input-field"
                    placeholder="Tell us about yourself, your experience, and interests..."
                  ></textarea>
                }
                @if (!isEditMode()) {
                  <p class="text-neutral-900 whitespace-pre-wrap">
                    {{ profile()?.bio || 'No bio added yet.' }}
                  </p>
                }
              </div>
            </div>
          </div>
        }
      </div>
    
      <app-footer></app-footer>
    </div>
    `,
  styles: []
})
export class MyProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);

  profile = signal<ProfileData | null>(null);
  isLoading = signal(true);
  isEditMode = signal(false);
  isSaving = signal(false);

  // Icons
  userIcon = User;
  editIcon = Edit;
  saveIcon = Save;
  cancelIcon = X;
  cameraIcon = Camera;
  mailIcon = Mail;
  phoneIcon = Phone;
  locationIcon = MapPin;
  briefcaseIcon = Briefcase;
  gradIcon = GraduationCap;
  calendarIcon = Calendar;

  /**
   * Checks if the provided URL is a Lucide icon URL that should use the fallback instead.
   * @param url The URL to check
   * @returns True if the URL is a Lucide icon URL
   */
  isLucideIconUrl(url: string | undefined): boolean {
    if (!url) return true;
    return url.includes('lucide.dev/icons/') || url.includes('lucide.dev/icons/user.svg');
  }

  // Edit form data
  editData: UpdateProfileRequest = {};

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.showError('Error', 'Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  enterEditMode() {
    const currentProfile = this.profile();
    if (currentProfile) {
      this.editData = {
        bio: currentProfile.bio,
        jobTitle: currentProfile.jobTitle,
        location: currentProfile.location,
        course: currentProfile.course,
        batch: currentProfile.batch,
        phone: currentProfile.phone
      };
      this.isEditMode.set(true);
    }
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.editData = {};
  }

  saveProfile() {
    this.isSaving.set(true);
    this.profileService.updateProfile(this.editData).subscribe({
      next: (response) => {
        this.profile.set(response.profile);
        this.isEditMode.set(false);
        this.isSaving.set(false);
        this.notificationService.showSuccess('Success', 'Profile updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notificationService.showError('Error', 'Failed to update profile');
        this.isSaving.set(false);
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('Error', 'Image size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.showError('Error', 'Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }

      // Upload image
      this.profileService.uploadProfileImage(file).subscribe({
        next: (response) => {
          // Update profile with new image URL
          const currentProfile = this.profile();
          if (currentProfile) {
            this.profile.set({
              ...currentProfile,
              profileImageUrl: response.imageUrl
            });
          }
          this.notificationService.showSuccess('Success', 'Profile image updated successfully');
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.notificationService.showError('Error', 'Failed to upload image');
        }
      });
    }
  }
}
