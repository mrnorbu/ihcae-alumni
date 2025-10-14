import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectoryService, AlumniCard, DirectoryFilters } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { AlumniCardComponent } from '../../components/alumni-card/alumni-card.component';
import { 
  LucideAngularModule, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Users
} from 'lucide-angular';

/**
 * Directory Page Component
 * 
 * Main alumni directory page with search, filters, grid display, and pagination.
 * This is the primary interface for browsing approved alumni members.
 * 
 * **Key Features:**
 * - Search alumni by name or email with real-time filtering
 * - Filter by course and graduation year with dropdowns
 * - Responsive grid layout (1→2→3→4 columns based on screen size)
 * - Pagination with Previous/Next controls and page info
 * - Empty state handling with contextual messages
 * - Results count display with "filtered" indicator
 * 
 * **Data Flow:**
 * 1. Load directory data on initialization with default filters
 * 2. Apply search/filters → Reset to page 1 → Reload data
 * 3. Navigate pages → Update current page → Reload data
 * 4. Clear filters → Reset all filters → Reload data
 * 
 * **API Integration:**
 * - GET /api/v1/alumni with query parameters
 * - Supports: search, course, graduationYear, page, pageSize
 * - Returns: PaginatedResult<AlumniCard> with metadata
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-directory-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    HeaderComponent, 
    FooterComponent, 
    AlumniCardComponent, 
    LucideAngularModule
  ],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
      
      <!-- Main Content Container -->
      <!-- max-w-7xl: Wide container for directory grid -->
      <!-- pt-24: Top padding to account for fixed header -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Alumni Directory</h1>
          <p class="text-neutral-600">Connect with fellow IHCAE alumni and professionals</p>
        </div>

        <!-- Search and Filters Card -->
        <!-- Contains search input and filter dropdowns -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <!-- Filter Grid: Search takes 2 columns, filters take 1 each -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search Input -->
            <!-- Two-way binding with ngModel for real-time search -->
            <div class="md:col-span-2">
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="searchIcon" [size]="16"></lucide-icon>
                Search Alumni
              </label>
              <div class="relative">
                <input
                  [(ngModel)]="filters.search"
                  (ngModelChange)="onFilterChange()"
                  type="text"
                  class="input-field pl-10"
                  placeholder="Search by name or email..."
                />
                <!-- Search icon positioned absolutely inside input -->
                <lucide-icon
                  [img]="searchIcon"
                  [size]="18"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                ></lucide-icon>
              </div>
            </div>

            <!-- Course Filter Dropdown -->
            <!-- Populated from availableCourses() signal -->
            <div>
              <label class="input-label">Course</label>
              <select
                [(ngModel)]="filters.course"
                (ngModelChange)="onFilterChange()"
                class="input-field"
              >
                <option value="">All Courses</option>
                <option *ngFor="let course of availableCourses()" [value]="course">
                  {{ course }}
                </option>
              </select>
            </div>

            <!-- Graduation Year Filter Dropdown -->
            <!-- Populated from availableYears() signal (sorted newest first) -->
            <div>
              <label class="input-label">Graduation Year</label>
              <select
                [(ngModel)]="filters.graduationYear"
                (ngModelChange)="onFilterChange()"
                class="input-field"
              >
                <option [ngValue]="undefined">All Years</option>
                <option *ngFor="let year of availableYears()" [ngValue]="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <!-- Results Count Display -->
          <!-- Shows total count and "filtered" indicator when filters applied -->
          <div *ngIf="!isLoading()" class="mt-4 pt-4 border-t border-neutral-200">
            <p class="text-sm text-neutral-600 flex items-center gap-2">
              <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
              Found {{ totalCount() }} alumni
              <span *ngIf="filters.search || filters.course || filters.graduationYear" class="text-primary-600">
                (filtered)
              </span>
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <!-- Shows spinner while fetching data from API -->
        <div *ngIf="isLoading()" class="py-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-neutral-600">Loading alumni directory...</p>
        </div>

        <!-- Alumni Grid -->
        <!-- Responsive grid: 1→2→3→4 columns based on screen size -->
        <!-- Only shows when not loading and has data -->
        <div *ngIf="!isLoading() && alumni().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <app-alumni-card
            *ngFor="let alumnus of alumni()"
            [alumni]="alumnus"
          ></app-alumni-card>
        </div>

        <!-- Empty State -->
        <!-- Shows when no results found (either filtered or no data) -->
        <div *ngIf="!isLoading() && alumni().length === 0" class="bg-white rounded-lg shadow p-12 text-center">
          <lucide-icon [img]="usersIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">No alumni found</h3>
          <p class="text-neutral-600 mb-4">
            <!-- Contextual message based on whether filters are applied -->
            <span *ngIf="filters.search || filters.course || filters.graduationYear">
              Try adjusting your filters to see more results.
            </span>
            <span *ngIf="!filters.search && !filters.course && !filters.graduationYear">
              There are no alumni in the directory yet.
            </span>
          </p>
          <!-- Clear Filters button only shows when filters are applied -->
          <button
            *ngIf="filters.search || filters.course || filters.graduationYear"
            (click)="clearFilters()"
            class="btn-primary"
          >
            Clear Filters
          </button>
        </div>

        <!-- Pagination Controls -->
        <!-- Only shows when there are multiple pages -->
        <div *ngIf="!isLoading() && totalPages() > 1" class="bg-white rounded-lg shadow p-4">
          <div class="flex items-center justify-between">
            <!-- Page Information -->
            <p class="text-sm text-neutral-600">
              Page {{ currentPage() }} of {{ totalPages() }}
            </p>

            <!-- Navigation Buttons -->
            <div class="flex items-center gap-2">
              <!-- Previous Page Button -->
              <!-- Disabled and styled when on first page -->
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="btn-outline btn-sm inline-flex items-center gap-2"
                [class.opacity-50]="currentPage() === 1"
                [class.cursor-not-allowed]="currentPage() === 1"
              >
                <lucide-icon [img]="prevIcon" [size]="16"></lucide-icon>
                <span>Previous</span>
              </button>
              <!-- Next Page Button -->
              <!-- Disabled and styled when on last page -->
              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline btn-sm inline-flex items-center gap-2"
                [class.opacity-50]="currentPage() === totalPages()"
                [class.cursor-not-allowed]="currentPage() === totalPages()"
              >
                <span>Next</span>
                <lucide-icon [img]="nextIcon" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class DirectoryPageComponent implements OnInit {
  // Dependency injection for services
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);

  // Reactive state using Angular signals
  alumni = signal<AlumniCard[]>([]);           // Current page alumni data
  isLoading = signal(true);                   // Loading state for API calls
  totalCount = signal(0);                     // Total alumni count across all pages
  currentPage = signal(1);                    // Current page number (1-based)
  pageSize = 20;                             // Items per page (constant)

  // Filter options populated from API data
  availableCourses = signal<string[]>([]);    // Unique courses for dropdown
  availableYears = signal<number[]>([]);      // Unique graduation years for dropdown

  // Lucide icons for UI elements
  searchIcon = Search;
  filterIcon = Filter;
  prevIcon = ChevronLeft;
  nextIcon = ChevronRight;
  usersIcon = Users;

  // Current filter state - sent to API as query parameters
  filters: DirectoryFilters = {
    search: '',                    // Text search for name/email
    course: '',                    // Course filter
    graduationYear: undefined,    // Graduation year filter
    page: 1,                      // Current page
    pageSize: this.pageSize       // Items per page
  };

  ngOnInit() {
    // Initialize component by loading data and filter options
    this.loadDirectory();
    this.loadFilterOptions();
  }

  /**
   * Loads alumni directory data from API with current filters
   * Updates loading state and handles errors
   */
  loadDirectory() {
    this.isLoading.set(true);
    // Update filters with current page before API call
    this.filters.page = this.currentPage();
    this.filters.pageSize = this.pageSize;

    this.directoryService.getAlumniDirectory(this.filters).subscribe({
      next: (result) => {
        // Update reactive state with API response
        this.alumni.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading directory:', error);
        this.notificationService.showError('Error', 'Failed to load alumni directory');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Loads filter options (courses and years) for dropdowns
   * These are extracted from existing directory data
   */
  loadFilterOptions() {
    // Load available courses from directory data
    this.directoryService.getAvailableCourses().subscribe({
      next: (courses) => {
        this.availableCourses.set(courses);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });

    // Load available graduation years from directory data
    this.directoryService.getAvailableYears().subscribe({
      next: (years) => {
        this.availableYears.set(years);
      },
      error: (error) => {
        console.error('Error loading years:', error);
      }
    });
  }

  /**
   * Called when any filter changes (search, course, year)
   * Resets to page 1 and reloads data
   */
  onFilterChange() {
    this.currentPage.set(1);  // Reset to first page when filtering
    this.loadDirectory();
  }

  /**
   * Clears all filters and resets to page 1
   * Called from empty state "Clear Filters" button
   */
  clearFilters() {
    this.filters.search = '';
    this.filters.course = '';
    this.filters.graduationYear = undefined;
    this.currentPage.set(1);
    this.loadDirectory();
  }

  /**
   * Navigate to previous page
   * Scrolls to top after navigation
   */
  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Navigate to next page
   * Scrolls to top after navigation
   */
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Calculate total number of pages based on total count and page size
   * @returns Total pages (rounded up)
   */
  totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }
}

