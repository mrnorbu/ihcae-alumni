import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlumniCard } from '../../services/directory.service';
import { 
  LucideAngularModule, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  ChevronRight
} from 'lucide-angular';

/**
 * Alumni Row Component
 * 
 * Displays an alumni member in a compact row format for the directory list.
 * This component provides a more space-efficient alternative to the card layout,
 * showing alumni information in a horizontal row with profile image, name, and details.
 * 
 * **Key Features:**
 * - Compact horizontal layout for better space utilization
 * - Click-to-navigate row with router link
 * - Profile image with initials fallback
 * - Hover effects (background color change, subtle shadow)
 * - Responsive design that adapts to different screen sizes
 * - Displays: profile image, name, job title, location, course & graduation year
 * 
 * **Design Elements:**
 * - Horizontal layout with profile image on the left
 * - Initials fallback with gradient background using IHCAE brand colors
 * - Smooth transitions on hover (200ms)
 * - Truncated text for long content
 * - Icon + text layout for information display
 * - Compact spacing for better density
 * 
 * **Navigation:**
 * - Routes to `/alumni/{id}` for detailed view
 * - Uses Angular Router for SPA navigation
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-alumni-row',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Clickable row wrapper with router navigation -->
    <!-- group class enables hover effects on child elements -->
    <a
      [routerLink]="['/alumni', alumni.id]"
      class="block bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all duration-200 overflow-hidden group border border-neutral-200"
    >
      <div class="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
        <!-- Profile Image Section -->
        <!-- Fixed size for consistent row height -->
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-100 rounded-lg relative overflow-hidden flex-shrink-0">
          <!-- Profile Image (if available and not a Lucide icon URL) -->
          <img
            *ngIf="alumni.profileImageUrl && !isLucideIconUrl(alumni.profileImageUrl)"
            [src]="alumni.profileImageUrl"
            [alt]="alumni.firstName + ' ' + alumni.lastName"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <!-- Fallback Initials Display -->
          <!-- Uses IHCAE brand colors for consistent branding -->
          <div
            *ngIf="!alumni.profileImageUrl || isLucideIconUrl(alumni.profileImageUrl)"
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100"
          >
            <span class="text-sm sm:text-lg font-semibold text-primary-600">
              {{ getInitials(alumni.firstName, alumni.lastName) }}
            </span>
          </div>
        </div>

        <!-- Alumni Information Section -->
        <div class="flex-1 min-w-0">
          <!-- Alumni Name -->
          <!-- Consistent color scheme for all names -->
          <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
            {{ alumni.firstName }} {{ alumni.lastName }}
          </h3>

          <!-- Alumni Details in horizontal layout -->
          <!-- Responsive: stacks on mobile, horizontal on desktop -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600">
            <!-- Job Title (if available) -->
            <div *ngIf="alumni.jobTitle" class="flex items-center gap-1.5">
              <lucide-icon [img]="briefcaseIcon" [size]="12" class="flex-shrink-0"></lucide-icon>
              <span class="truncate">{{ alumni.jobTitle }}</span>
            </div>

            <!-- Location (if available) -->
            <div *ngIf="alumni.location" class="flex items-center gap-1.5">
              <lucide-icon [img]="locationIcon" [size]="12" class="flex-shrink-0"></lucide-icon>
              <span class="truncate">{{ alumni.location }}</span>
            </div>

            <!-- Course & Graduation Year (if available) -->
            <!-- Shows course, year, or both with bullet separator -->
            <div *ngIf="alumni.course || alumni.graduationYear" class="flex items-center gap-1.5">
              <lucide-icon [img]="gradIcon" [size]="12" class="flex-shrink-0"></lucide-icon>
              <span class="truncate">
                {{ alumni.course }}
                <span *ngIf="alumni.course && alumni.graduationYear">•</span>
                {{ alumni.graduationYear }}
              </span>
            </div>
          </div>
        </div>

        <!-- Optional: Action indicator (chevron) -->
        <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <lucide-icon [img]="chevronIcon" [size]="16" class="text-neutral-400"></lucide-icon>
        </div>
      </div>
    </a>
  `,
  styles: []
})
export class AlumniRowComponent {
  // Required input: Alumni data to display in the row
  @Input({ required: true }) alumni!: AlumniCard;

  // Lucide icons for different information types
  userIcon = User;           // Fallback icon for missing profile images
  locationIcon = MapPin;    // Location information
  briefcaseIcon = Briefcase; // Job title information
  gradIcon = GraduationCap; // Course and graduation year information
  chevronIcon = ChevronRight; // Action indicator

  /**
   * Checks if the provided URL is a Lucide icon URL that should use the fallback instead.
   * @param url The URL to check
   * @returns True if the URL is a Lucide icon URL
   */
  isLucideIconUrl(url: string | undefined): boolean {
    if (!url) return true;
    return url.includes('lucide.dev/icons/') || url.includes('lucide.dev/icons/user.svg');
  }

  /**
   * Generates initials from first and last name
   * @param firstName The first name
   * @param lastName The last name
   * @returns Initials string (e.g., "JD" for John Doe)
   */
  getInitials(firstName: string | undefined, lastName: string | undefined): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }
}
