import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DirectoryService, AlumniDetail } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { 
  LucideAngularModule, 
  User, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageCircle,
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar
} from 'lucide-angular';

/**
 * Alumni Detail Page Component
 * 
 * Displays comprehensive information about a specific alumni member.
 * This is the detailed view accessed from the alumni directory cards.
 * 
 * **Key Features:**
 * - Full profile information display with professional layout
 * - Contact details (email, phone) with clickable links
 * - Quick action buttons (Email, Call, WhatsApp) for immediate contact
 * - Back navigation to directory
 * - Responsive design (mobile: column, desktop: row layout)
 * - Error state handling for missing profiles
 * 
 * **Contact Integration:**
 * - Email: Opens default email client with mailto: link
 * - Phone: Opens phone dialer with tel: link
 * - WhatsApp: Opens WhatsApp Web with wa.me link (cleans phone number)
 * 
 * **Data Flow:**
 * 1. Extract userId from route parameters
 * 2. Load detailed alumni data from API
 * 3. Display profile information in organized sections
 * 4. Handle loading and error states
 * 
 * **API Integration:**
 * - GET /api/v1/alumni/{userId} - Fetch detailed alumni information
 * - Returns: AlumniDetail with contact information
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-alumni-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
      
      <!-- Main Content Container -->
      <!-- max-w-4xl: Constrains content width for readability -->
      <!-- pt-24: Top padding to account for fixed header -->
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Navigation Button -->
        <!-- Ghost style button with arrow icon -->
        <button
          routerLink="/directory"
          class="btn-ghost mb-6 inline-flex items-center gap-2"
        >
          <lucide-icon [img]="backIcon" [size]="18"></lucide-icon>
          <span>Back to Directory</span>
        </button>

        <!-- Loading State -->
        <!-- Shows spinner while fetching alumni data -->
        <div *ngIf="isLoading()" class="bg-white rounded-lg shadow p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-neutral-600">Loading profile...</p>
        </div>

        <!-- Profile Content -->
        <!-- Only shows when not loading and alumni data exists -->
        <div *ngIf="!isLoading() && alumni()" class="space-y-6">
          <!-- Profile Header Card -->
          <!-- Contains gradient banner, profile image, name, and quick actions -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <!-- Gradient Banner -->
            <!-- Uses IHCAE brand colors for visual appeal -->
            <div class="relative h-32 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
            <div class="relative px-6 pb-6">
              <!-- Profile Image and Info Section -->
              <!-- Responsive: column on mobile, row on desktop -->
              <div class="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4 gap-4">
                <!-- Profile Image -->
                <!-- Large circular image with white border -->
                <div class="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0">
                  <img
                    *ngIf="alumni()?.profileImageUrl && !isLucideIconUrl(alumni()!.profileImageUrl)"
                    [src]="alumni()!.profileImageUrl"
                    [alt]="alumni()!.firstName + ' ' + alumni()!.lastName"
                    class="w-full h-full object-cover"
                  />
                  <!-- Fallback icon for missing profile image -->
                  <lucide-icon
                    *ngIf="!alumni()?.profileImageUrl || isLucideIconUrl(alumni()!.profileImageUrl)"
                    [img]="userIcon"
                    [size]="48"
                    class="text-neutral-400"
                  ></lucide-icon>
                </div>

                <!-- Name and Title Section -->
                <div class="flex-1">
                  <h1 class="text-2xl md:text-3xl font-bold text-neutral-900">
                    {{ alumni()?.firstName }} {{ alumni()?.lastName }}
                  </h1>
                  <!-- Job Title (if available) -->
                  <p *ngIf="alumni()?.jobTitle" class="text-lg text-neutral-600 mt-1">
                    {{ alumni()!.jobTitle }}
                  </p>
                  <!-- Location (if available) -->
                  <p *ngIf="alumni()?.location" class="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                    <lucide-icon [img]="locationIcon" [size]="14"></lucide-icon>
                    {{ alumni()!.location }}
                  </p>
                </div>

                <!-- Quick Contact Action Buttons -->
                <!-- Responsive: wraps on mobile, inline on desktop -->
                <div class="flex flex-wrap gap-2">
                  <!-- Email Button -->
                  <!-- Opens default email client -->
                  <a
                    *ngIf="alumni()?.email"
                    [href]="'mailto:' + alumni()!.email"
                    class="btn-outline btn-sm inline-flex items-center gap-2"
                    title="Send Email"
                  >
                    <lucide-icon [img]="mailIcon" [size]="16"></lucide-icon>
                    <span class="hidden sm:inline">Email</span>
                  </a>

                  <!-- Call Button -->
                  <!-- Opens phone dialer -->
                  <a
                    *ngIf="alumni()?.phone"
                    [href]="'tel:' + alumni()!.phone"
                    class="btn-outline btn-sm inline-flex items-center gap-2"
                    title="Call"
                  >
                    <lucide-icon [img]="phoneIcon" [size]="16"></lucide-icon>
                    <span class="hidden sm:inline">Call</span>
                  </a>

                  <!-- WhatsApp Button -->
                  <!-- Opens WhatsApp Web with cleaned phone number -->
                  <a
                    *ngIf="alumni()?.phone"
                    [href]="getWhatsAppLink()"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-primary btn-sm inline-flex items-center gap-2"
                    title="WhatsApp"
                  >
                    <lucide-icon [img]="whatsappIcon" [size]="16"></lucide-icon>
                    <span class="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Education & Professional Info Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-neutral-900 mb-4">Education & Professional Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Course -->
              <div *ngIf="alumni()?.course">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="gradIcon" [size]="16"></lucide-icon>
                  Course
                </label>
                <p class="text-neutral-900">{{ alumni()!.course }}</p>
              </div>

              <!-- Graduation Year -->
              <div *ngIf="alumni()?.graduationYear">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
                  Graduation Year
                </label>
                <p class="text-neutral-900">{{ alumni()!.graduationYear }}</p>
              </div>

              <!-- Job Title -->
              <div *ngIf="alumni()?.jobTitle">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="briefcaseIcon" [size]="16"></lucide-icon>
                  Current Position
                </label>
                <p class="text-neutral-900">{{ alumni()!.jobTitle }}</p>
              </div>

              <!-- Location -->
              <div *ngIf="alumni()?.location">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="locationIcon" [size]="16"></lucide-icon>
                  Location
                </label>
                <p class="text-neutral-900">{{ alumni()!.location }}</p>
              </div>
            </div>
          </div>

          <!-- About Section -->
          <div *ngIf="alumni()?.bio" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-neutral-900 mb-4">About</h2>
            <p class="text-neutral-700 whitespace-pre-wrap leading-relaxed">{{ alumni()!.bio }}</p>
          </div>

          <!-- Contact Information Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h2>
            
            <div class="space-y-4">
              <!-- Email -->
              <div *ngIf="alumni()?.email">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="mailIcon" [size]="16"></lucide-icon>
                  Email
                </label>
                <a
                  [href]="'mailto:' + alumni()!.email"
                  class="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {{ alumni()!.email }}
                </a>
              </div>

              <!-- Phone -->
              <div *ngIf="alumni()?.phone">
                <label class="text-sm font-medium text-neutral-600 flex items-center gap-2 mb-1">
                  <lucide-icon [img]="phoneIcon" [size]="16"></lucide-icon>
                  Phone
                </label>
                <a
                  [href]="'tel:' + alumni()!.phone"
                  class="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {{ alumni()!.phone }}
                </a>
              </div>
            </div>
          </div>

          <!-- Member Since -->
          <div *ngIf="alumni()?.createdAt" class="text-center text-sm text-neutral-500">
            Member since {{ formatDate(alumni()!.createdAt) }}
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!isLoading() && !alumni()" class="bg-white rounded-lg shadow p-12 text-center">
          <lucide-icon [img]="userIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">Alumni not found</h3>
          <p class="text-neutral-600 mb-4">The alumni profile you're looking for doesn't exist or has been removed.</p>
          <button
            routerLink="/directory"
            class="btn-primary"
          >
            Back to Directory
          </button>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class AlumniDetailPageComponent implements OnInit {
  // Dependency injection for services
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  // Reactive state using Angular signals
  alumni = signal<AlumniDetail | null>(null);  // Current alumni data
  isLoading = signal(true);                    // Loading state for API calls

  // Lucide icons for UI elements
  userIcon = User;           // Fallback icon for missing profile images
  backIcon = ArrowLeft;      // Back navigation button
  mailIcon = Mail;          // Email contact button
  phoneIcon = Phone;        // Phone contact button
  whatsappIcon = MessageCircle; // WhatsApp contact button
  locationIcon = MapPin;    // Location information
  briefcaseIcon = Briefcase; // Job title information
  gradIcon = GraduationCap; // Course and graduation information
  calendarIcon = Calendar;  // Graduation year information

  /**
   * Checks if the provided URL is a Lucide icon URL that should use the fallback instead.
   * @param url The URL to check
   * @returns True if the URL is a Lucide icon URL
   */
  isLucideIconUrl(url: string | undefined): boolean {
    if (!url) return true;
    return url.includes('lucide.dev/icons/') || url.includes('lucide.dev/icons/user.svg');
  }

  ngOnInit() {
    // Extract userId from route parameters
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadAlumniDetail(userId);
    } else {
      // No userId found in route, stop loading
      this.isLoading.set(false);
    }
  }

  /**
   * Loads detailed alumni information from API
   * Updates loading state and handles errors
   * @param userId The unique identifier of the alumnus
   */
  loadAlumniDetail(userId: string) {
    this.isLoading.set(true);
    this.directoryService.getAlumniDetail(userId).subscribe({
      next: (alumni) => {
        // Update reactive state with API response
        this.alumni.set(alumni);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading alumni detail:', error);
        this.notificationService.showError('Error', 'Failed to load alumni profile');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Generates WhatsApp Web link with cleaned phone number
   * Removes all non-numeric characters from phone number
   * @returns WhatsApp Web URL or '#' if no phone
   */
  getWhatsAppLink(): string {
    const phone = this.alumni()?.phone;
    if (!phone) return '#';
    
    // Remove all non-numeric characters (spaces, dashes, parentheses, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Generate WhatsApp Web link
    return `https://wa.me/${cleanPhone}`;
  }

  /**
   * Formats date string for display
   * Converts ISO date to readable format (e.g., "October 2025")
   * @param dateString ISO date string from API
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }
}

