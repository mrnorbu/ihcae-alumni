import { Component, Input } from '@angular/core';

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
 * Alumni Card Component
 * 
 * Displays an alumni member in a card format for the directory grid.
 * This component is optimized for two-column grid layouts, showing alumni 
 * information in a vertical card with profile image, name, and details.
 * 
 * **Key Features:**
 * - Card-based layout optimized for grid display
 * - Click-to-navigate card with router link
 * - Profile image with initials fallback
 * - Hover effects (background color change, subtle shadow)
 * - Responsive design that adapts to different screen sizes
 * - Displays: profile image, name, job title, location, course & graduation year
 * 
 * **Design Elements:**
 * - Vertical card layout with profile image and name at top
 * - Details displayed in vertical list format below
 * - Initials fallback with gradient background using IHCAE brand colors
 * - Smooth transitions on hover (200ms)
 * - Truncated text for long content
 * - Icon + text layout for information display
 * - Equal height cards with `h-full` class
 * 
 * **Navigation:**
 * - Routes to `/alumni/{id}` for detailed view
 * - Uses Angular Router for SPA navigation
 * 
 * @author IHCAE Development Team
 * @version 1.1.0
 */
@Component({
  selector: 'app-alumni-row',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <!-- Clickable card wrapper with router navigation -->
    <!-- group class enables hover effects on child elements -->
    <a
      [routerLink]="['/alumni', alumni.id]"
      class="block bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all duration-200 overflow-hidden group border border-neutral-200 h-full"
      >
      <div class="p-4 sm:p-5">
        <!-- Profile Image and Name Section -->
        <div class="flex items-center gap-3 mb-3">
          <!-- Profile Image Section -->
          <!-- Fixed size for consistent card layout -->
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-100 rounded-lg relative overflow-hidden flex-shrink-0">
            <!-- Profile Image (if available and not a Lucide icon URL) -->
            @if (alumni.profileImageUrl && !isLucideIconUrl(alumni.profileImageUrl)) {
              <img
                [src]="alumni.profileImageUrl"
                [alt]="alumni.firstName + ' ' + alumni.lastName"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
            }
            <!-- Fallback Initials Display -->
            <!-- Uses IHCAE brand colors for consistent branding -->
            @if (!alumni.profileImageUrl || isLucideIconUrl(alumni.profileImageUrl)) {
              <div
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100"
                >
                <span class="text-sm sm:text-base font-semibold text-primary-600">
                  {{ getInitials(alumni.firstName, alumni.lastName) }}
                </span>
              </div>
            }
          </div>
    
          <!-- Alumni Name -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
              {{ alumni.firstName }} {{ alumni.lastName }}
            </h3>
          </div>
    
          <!-- Action indicator (chevron) -->
          <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <lucide-icon [img]="chevronIcon" [size]="16" class="text-neutral-400"></lucide-icon>
          </div>
        </div>
    
        <!-- Alumni Details in vertical layout -->
        <!-- Better suited for card format -->
        <div class="space-y-2 text-sm text-neutral-600">
          <!-- Job Title (if available) -->
          @if (alumni.jobTitle) {
            <div class="flex items-center gap-2">
              <lucide-icon [img]="briefcaseIcon" [size]="14" class="flex-shrink-0 text-neutral-400"></lucide-icon>
              <span class="truncate">{{ alumni.jobTitle }}</span>
            </div>
          }
    
          <!-- Location (if available) -->
          @if (alumni.location) {
            <div class="flex items-center gap-2">
              <lucide-icon [img]="locationIcon" [size]="14" class="flex-shrink-0 text-neutral-400"></lucide-icon>
              <span class="truncate">{{ alumni.location }}</span>
            </div>
          }
    
          <!-- Course & Graduation Year (if available) -->
          <!-- Shows course, year, or both with bullet separator -->
          @if (alumni.course || alumni.graduationYear) {
            <div class="flex items-center gap-2">
              <lucide-icon [img]="gradIcon" [size]="14" class="flex-shrink-0 text-neutral-400"></lucide-icon>
              <span class="truncate">
                {{ alumni.course }}
                @if (alumni.course && alumni.graduationYear) {
                  <span>•</span>
                }
                {{ alumni.graduationYear }}
              </span>
            </div>
          }
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
