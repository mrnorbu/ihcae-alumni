import { Component } from '@angular/core';


/**
 * Alumni Card Skeleton Component
 * 
 * Displays a skeleton loading state for alumni cards while data is being fetched.
 * This provides better perceived performance by showing the expected layout
 * structure instead of a generic spinner.
 * 
 * **Key Features:**
 * - Matches the exact layout of AlumniRowComponent (now card-based)
 * - Animated shimmer effect for visual appeal
 * - Responsive design that adapts to different screen sizes
 * - Configurable number of skeleton items to display
 * 
 * **Design Elements:**
 * - Profile image placeholder with shimmer
 * - Name placeholder with shimmer
 * - Details placeholders with shimmer in vertical layout
 * - Smooth animation using CSS keyframes
 * - Equal height cards with `h-full` class
 * 
 * @author IHCAE Development Team
 * @version 1.1.0
 */
@Component({
  selector: 'app-alumni-row-skeleton',
  standalone: true,
  imports: [],
  template: `
    <!-- Skeleton card matching AlumniRowComponent layout -->
    <div class="bg-white rounded-lg shadow-sm border border-neutral-200 animate-pulse h-full">
      <div class="p-4 sm:p-5">
        <!-- Profile Image and Name Section -->
        <div class="flex items-center gap-3 mb-3">
          <!-- Profile Image Skeleton -->
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-200 rounded-lg flex-shrink-0"></div>

          <!-- Name Skeleton -->
          <div class="flex-1 min-w-0">
            <div class="h-5 bg-neutral-200 rounded w-3/4"></div>
          </div>

          <!-- Action Indicator Skeleton -->
          <div class="w-4 h-4 bg-neutral-200 rounded flex-shrink-0"></div>
        </div>

        <!-- Details Skeleton in vertical layout -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-neutral-200 rounded flex-shrink-0"></div>
            <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-neutral-200 rounded flex-shrink-0"></div>
            <div class="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3.5 h-3.5 bg-neutral-200 rounded flex-shrink-0"></div>
            <div class="h-4 bg-neutral-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% {
        background-position: -200px 0;
      }
      100% {
        background-position: calc(200px + 100%) 0;
      }
    }

    .animate-pulse {
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .animate-pulse > * {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200px 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
  `]
})
export class AlumniRowSkeletonComponent {
  // This component doesn't need any inputs or logic
  // It's purely presentational for loading states
}
