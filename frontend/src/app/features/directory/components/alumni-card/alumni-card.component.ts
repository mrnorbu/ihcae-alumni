import { Component, Input } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AlumniCard } from '../../services/directory.service';
import { 
  LucideAngularModule, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap 
} from 'lucide-angular';

/**
 * Alumni Card Component
 * 
 * Displays an alumni member in a card format for the directory grid.
 * This is a reusable component that shows essential alumni information
 * and provides navigation to the detailed profile page.
 * 
 * **Key Features:**
 * - Click-to-navigate card with router link
 * - Profile image with initials fallback
 * - Hover effects (shadow, zoom, color change)
 * - Responsive design with proper aspect ratio
 * - Displays: name, job title, location, course & graduation year
 * 
 * **Design Elements:**
 * - Square aspect ratio for consistent grid layout
 * - Initials fallback with gradient background using IHCAE brand colors
 * - Smooth transitions on hover (300ms)
 * - Truncated text for long content
 * - Icon + text layout for information display
 * 
 * **Navigation:**
 * - Routes to `/alumni/{id}` for detailed view
 * - Uses Angular Router for SPA navigation
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-alumni-card',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <!-- Clickable card wrapper with router navigation -->
    <!-- group class enables hover effects on child elements -->
    <a
      [routerLink]="['/alumni', alumni.id]"
      class="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
      >
      <!-- Profile Image Section -->
      <!-- aspect-square: Maintains 1:1 ratio for consistent grid -->
      <div class="aspect-square bg-neutral-100 relative overflow-hidden">
        <!-- Profile Image (if available and not a Lucide icon URL) -->
        @if (alumni.profileImageUrl && !isLucideIconUrl(alumni.profileImageUrl)) {
          <img
            [src]="alumni.profileImageUrl"
            [alt]="alumni.firstName + ' ' + alumni.lastName"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        }
        <!-- Fallback Initials Display -->
        <!-- Uses IHCAE brand colors for consistent branding -->
        @if (!alumni.profileImageUrl || isLucideIconUrl(alumni.profileImageUrl)) {
          <div
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100"
            >
            <span class="text-3xl font-bold text-primary-600">
              {{ getInitials(alumni.firstName, alumni.lastName) }}
            </span>
          </div>
        }
      </div>
    
      <!-- Card Content Section -->
      <div class="p-4">
        <!-- Alumni Name -->
        <!-- Changes color on hover for visual feedback -->
        <h3 class="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-2">
          {{ alumni.firstName }} {{ alumni.lastName }}
        </h3>
    
        <!-- Alumni Details -->
        <!-- Vertical spacing between detail items -->
        <div class="space-y-1.5">
          <!-- Job Title (if available) -->
          @if (alumni.jobTitle) {
            <div class="flex items-center gap-2 text-sm text-neutral-600">
              <lucide-icon [img]="briefcaseIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
              <span class="truncate">{{ alumni.jobTitle }}</span>
            </div>
          }
    
          <!-- Location (if available) -->
          @if (alumni.location) {
            <div class="flex items-center gap-2 text-sm text-neutral-600">
              <lucide-icon [img]="locationIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
              <span class="truncate">{{ alumni.location }}</span>
            </div>
          }
    
          <!-- Course & Graduation Year (if available) -->
          <!-- Shows course, year, or both with bullet separator -->
          @if (alumni.course || alumni.graduationYear) {
            <div class="flex items-center gap-2 text-sm text-neutral-600">
              <lucide-icon [img]="gradIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
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
export class AlumniCardComponent {
  // Required input: Alumni data to display in the card
  @Input({ required: true }) alumni!: AlumniCard;

  // Lucide icons for different information types
  userIcon = User;           // Fallback icon for missing profile images
  locationIcon = MapPin;    // Location information
  briefcaseIcon = Briefcase; // Job title information
  gradIcon = GraduationCap; // Course and graduation year information

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

