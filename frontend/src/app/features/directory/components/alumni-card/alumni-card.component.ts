import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
 * - Profile image with gradient fallback
 * - Hover effects (shadow, zoom, color change)
 * - Responsive design with proper aspect ratio
 * - Displays: name, job title, location, course & graduation year
 * 
 * **Design Elements:**
 * - Square aspect ratio for consistent grid layout
 * - Gradient fallback using IHCAE brand colors
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
  imports: [CommonModule, RouterModule, LucideAngularModule],
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
        <img
          *ngIf="alumni.profileImageUrl && !isLucideIconUrl(alumni.profileImageUrl)"
          [src]="alumni.profileImageUrl"
          [alt]="alumni.firstName + ' ' + alumni.lastName"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <!-- Fallback Gradient Background -->
        <!-- Uses IHCAE brand colors for consistent branding -->
        <div
          *ngIf="!alumni.profileImageUrl || isLucideIconUrl(alumni.profileImageUrl)"
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100"
        >
          <lucide-icon [img]="userIcon" [size]="64" class="text-primary-600"></lucide-icon>
        </div>
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
          <div *ngIf="alumni.jobTitle" class="flex items-center gap-2 text-sm text-neutral-600">
            <lucide-icon [img]="briefcaseIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
            <span class="truncate">{{ alumni.jobTitle }}</span>
          </div>

          <!-- Location (if available) -->
          <div *ngIf="alumni.location" class="flex items-center gap-2 text-sm text-neutral-600">
            <lucide-icon [img]="locationIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
            <span class="truncate">{{ alumni.location }}</span>
          </div>

          <!-- Course & Graduation Year (if available) -->
          <!-- Shows course, year, or both with bullet separator -->
          <div *ngIf="alumni.course || alumni.graduationYear" class="flex items-center gap-2 text-sm text-neutral-600">
            <lucide-icon [img]="gradIcon" [size]="14" class="flex-shrink-0"></lucide-icon>
            <span class="truncate">
              {{ alumni.course }}
              <span *ngIf="alumni.course && alumni.graduationYear">•</span>
              {{ alumni.graduationYear }}
            </span>
          </div>
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
}

