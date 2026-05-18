import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DirectoryService, AlumniCard, DirectoryFilters } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { AlumniRowComponent } from '../../components/alumni-row/alumni-row.component';
import { AlumniRowSkeletonComponent } from '../../components/alumni-row-skeleton/alumni-row-skeleton.component';
import { 
  LucideAngularModule, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Users,
  X
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
 * - Compact row layout for efficient space utilization
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
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    AlumniRowComponent,
    AlumniRowSkeletonComponent,
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
                  (ngModelChange)="onSearchChange($event)"
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
                <!-- Clear search button -->
                @if (filters.search) {
                  <button
                    (click)="clearSearch()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Clear search"
                    >
                    <lucide-icon [img]="closeIcon" [size]="16"></lucide-icon>
                  </button>
                }
              </div>
            </div>
    
            <!-- Course Filter Dropdown -->
            <!-- Populated from availableCourses() signal -->
            <div>
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon>
                Course
                @if (filters.course) {
                  <span class="badge badge-primary text-xs">Active</span>
                }
              </label>
              <select
                [(ngModel)]="filters.course"
                (ngModelChange)="onFilterChange()"
                class="input-field"
                [class.border-primary-500]="filters.course"
                >
                <option value="">All Courses</option>
                @for (course of availableCourses(); track course) {
                  <option [value]="course">
                    {{ course }}
                  </option>
                }
              </select>
            </div>
    
            <!-- Graduation Year Filter Dropdown -->
            <!-- Populated from availableYears() signal (sorted newest first) -->
            <div>
              <label class="input-label flex items-center gap-2">
                <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon>
                Graduation Year
                @if (filters.graduationYear) {
                  <span class="badge badge-primary text-xs">Active</span>
                }
              </label>
              <select
                [(ngModel)]="filters.graduationYear"
                (ngModelChange)="onFilterChange()"
                class="input-field"
                [class.border-primary-500]="filters.graduationYear"
                >
                <option [ngValue]="undefined">All Years</option>
                @for (year of availableYears(); track year) {
                  <option [ngValue]="year">
                    {{ year }}
                  </option>
                }
              </select>
            </div>
          </div>
    
          <!-- Active Filters Display -->
          <!-- Shows applied filters as removable pills -->
          @if (hasActiveFilters()) {
            <div class="mt-4 pt-4 border-t border-neutral-200">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm text-neutral-600">Active filters:</span>
                <!-- Search Filter Pill -->
                @if (filters.search) {
                  <span class="badge badge-primary inline-flex items-center gap-1">
                    Search: "{{ filters.search }}"
                    <button
                      (click)="clearSearch()"
                      class="ml-1 hover:text-primary-900 transition-colors"
                      title="Remove search filter"
                      >
                      <lucide-icon [img]="closeIcon" [size]="12"></lucide-icon>
                    </button>
                  </span>
                }
                <!-- Course Filter Pill -->
                @if (filters.course) {
                  <span class="badge badge-primary inline-flex items-center gap-1">
                    Course: {{ filters.course }}
                    <button
                      (click)="clearCourseFilter()"
                      class="ml-1 hover:text-primary-900 transition-colors"
                      title="Remove course filter"
                      >
                      <lucide-icon [img]="closeIcon" [size]="12"></lucide-icon>
                    </button>
                  </span>
                }
                <!-- Year Filter Pill -->
                @if (filters.graduationYear) {
                  <span class="badge badge-primary inline-flex items-center gap-1">
                    Year: {{ filters.graduationYear }}
                    <button
                      (click)="clearYearFilter()"
                      class="ml-1 hover:text-primary-900 transition-colors"
                      title="Remove year filter"
                      >
                      <lucide-icon [img]="closeIcon" [size]="12"></lucide-icon>
                    </button>
                  </span>
                }
                <!-- Clear All Button -->
                <button
                  (click)="clearFilters()"
                  class="text-xs text-primary-600 hover:text-primary-700 underline"
                  >
                  Clear all
                </button>
              </div>
            </div>
          }
    
          <!-- Results Count Display -->
          <!-- Shows total count and "filtered" indicator when filters applied -->
          @if (!isLoading()) {
            <div class="mt-4 pt-4 border-t border-neutral-200">
              <p class="text-sm text-neutral-600 flex items-center gap-2">
                <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
                Found {{ totalCount() }} alumni
                @if (filters.search || filters.course || filters.graduationYear) {
                  <span class="text-primary-600">
                    (filtered)
                  </span>
                }
              </p>
            </div>
          }
        </div>
    
        <!-- Loading State with Skeleton -->
        <!-- Shows skeleton rows while fetching data from API -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            @for (item of [1,2,3,4,5,6]; track item) {
              <app-alumni-row-skeleton></app-alumni-row-skeleton>
            }
          </div>
        }
    
        <!-- Alumni List -->
        <!-- Two-column grid layout with proper spacing -->
        <!-- Only shows when not loading and has data -->
        @if (!isLoading() && alumni().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            @for (alumnus of alumni(); track alumnus) {
              <app-alumni-row
                [alumni]="alumnus"
              ></app-alumni-row>
            }
          </div>
        }
    
        <!-- Enhanced Empty State -->
        <!-- Shows when no results found (either filtered or no data) -->
        @if (!isLoading() && alumni().length === 0) {
          <div class="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <lucide-icon [img]="usersIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
            <!-- Different messages based on context -->
            <h3 class="text-lg font-semibold text-neutral-900 mb-2">
              @if (filters.search || filters.course || filters.graduationYear) {
                <span>
                  No alumni match your search
                </span>
              }
              @if (!filters.search && !filters.course && !filters.graduationYear) {
                <span>
                  No alumni found
                </span>
              }
            </h3>
            <p class="text-neutral-600 mb-6 max-w-md mx-auto">
              @if (filters.search || filters.course || filters.graduationYear) {
                <span>
                  Try adjusting your search criteria or filters to find more results.
                </span>
              }
              @if (!filters.search && !filters.course && !filters.graduationYear) {
                <span>
                  There are no alumni in the directory yet. Check back later or contact an administrator.
                </span>
              }
            </p>
            <!-- Helpful suggestions -->
            @if (filters.search || filters.course || filters.graduationYear) {
              <div class="space-y-3 mb-6">
                <div class="text-sm text-neutral-500">
                  <p class="font-medium mb-2">Try these suggestions:</p>
                  <ul class="text-left max-w-sm mx-auto space-y-1">
                    @if (filters.search) {
                      <li class="flex items-center gap-2">
                        <lucide-icon [img]="searchIcon" [size]="14"></lucide-icon>
                        Check spelling in your search
                      </li>
                    }
                    @if (filters.course) {
                      <li class="flex items-center gap-2">
                        <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon>
                        Try a different course filter
                      </li>
                    }
                    @if (filters.graduationYear) {
                      <li class="flex items-center gap-2">
                        <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon>
                        Try a different graduation year
                      </li>
                    }
                    <li class="flex items-center gap-2">
                      <lucide-icon [img]="usersIcon" [size]="14"></lucide-icon>
                      Remove some filters to see more results
                    </li>
                  </ul>
                </div>
              </div>
            }
            <!-- Action buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              @if (filters.search || filters.course || filters.graduationYear) {
                <button
                  (click)="clearFilters()"
                  class="btn-primary"
                  >
                  Clear All Filters
                </button>
              }
              @if (!filters.search && !filters.course && !filters.graduationYear) {
                <button
                  (click)="loadDirectory()"
                  class="btn-outline"
                  >
                  Refresh Directory
                </button>
              }
            </div>
          </div>
        }
    
        <!-- Enhanced Pagination Controls -->
        <!-- Only shows when there are multiple pages -->
        @if (!isLoading() && totalPages() > 1) {
          <div class="bg-white rounded-lg shadow p-4">
            <div class="flex items-center justify-between">
              <!-- Page Information -->
              <p class="text-sm text-neutral-600">
                Showing {{ getStartItem() }} to {{ getEndItem() }} of {{ totalCount() }} alumni
              </p>
              <!-- Navigation Controls -->
              <div class="flex items-center gap-2">
                <!-- Previous Page Button -->
                <button
                  (click)="previousPage()"
                  [disabled]="currentPage() === 1"
                  class="btn-outline btn-sm inline-flex items-center gap-2"
                  [class.opacity-50]="currentPage() === 1"
                  [class.cursor-not-allowed]="currentPage() === 1"
                  >
                  <lucide-icon [img]="prevIcon" [size]="16"></lucide-icon>
                  <span class="hidden sm:inline">Previous</span>
                </button>
                <!-- Page Numbers -->
                <div class="flex items-center gap-1">
                  <!-- First page -->
                  @if (shouldShowFirstPage()) {
                    <button
                      (click)="goToPage(1)"
                      class="btn-outline btn-sm px-3 py-1.5 text-sm"
                      [class.bg-primary-600]="currentPage() === 1"
                      [class.text-white]="currentPage() === 1"
                      [class.border-primary-600]="currentPage() === 1"
                      >
                      1
                    </button>
                  }
                  <!-- Ellipsis -->
                  @if (shouldShowFirstEllipsis()) {
                    <span class="px-2 text-neutral-500">...</span>
                  }
                  <!-- Page range -->
                  @for (page of getPageRange(); track page) {
                    <button
                      (click)="goToPage(page)"
                      class="btn-outline btn-sm px-3 py-1.5 text-sm"
                      [class.bg-primary-600]="currentPage() === page"
                      [class.text-white]="currentPage() === page"
                      [class.border-primary-600]="currentPage() === page"
                      >
                      {{ page }}
                    </button>
                  }
                  <!-- Ellipsis -->
                  @if (shouldShowLastEllipsis()) {
                    <span class="px-2 text-neutral-500">...</span>
                  }
                  <!-- Last page -->
                  @if (shouldShowLastPage()) {
                    <button
                      (click)="goToPage(totalPages())"
                      class="btn-outline btn-sm px-3 py-1.5 text-sm"
                      [class.bg-primary-600]="currentPage() === totalPages()"
                      [class.text-white]="currentPage() === totalPages()"
                      [class.border-primary-600]="currentPage() === totalPages()"
                      >
                      {{ totalPages() }}
                    </button>
                  }
                </div>
                <!-- Next Page Button -->
                <button
                  (click)="nextPage()"
                  [disabled]="currentPage() === totalPages()"
                  class="btn-outline btn-sm inline-flex items-center gap-2"
                  [class.opacity-50]="currentPage() === totalPages()"
                  [class.cursor-not-allowed]="currentPage() === totalPages()"
                  >
                  <span class="hidden sm:inline">Next</span>
                  <lucide-icon [img]="nextIcon" [size]="16"></lucide-icon>
                </button>
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
export class DirectoryPageComponent implements OnInit, OnDestroy {
  // Dependency injection for services
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);

  // Debounced search functionality
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

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
  closeIcon = X;

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
    
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value has changed
        takeUntil(this.destroy$) // Unsubscribe when component is destroyed
      )
      .subscribe(searchTerm => {
        this.filters.search = searchTerm;
        this.onFilterChange();
      });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
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
   * Called when search input changes - triggers debounced search
   * @param searchTerm The search term entered by user
   */
  onSearchChange(searchTerm: string) {
    this.searchSubject.next(searchTerm);
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

  /**
   * Check if any filters are currently active
   * @returns True if any filter is applied
   */
  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.course || this.filters.graduationYear);
  }

  /**
   * Clear only the search filter
   */
  clearSearch() {
    this.filters.search = '';
    this.onFilterChange();
  }

  /**
   * Clear only the course filter
   */
  clearCourseFilter() {
    this.filters.course = '';
    this.onFilterChange();
  }

  /**
   * Clear only the graduation year filter
   */
  clearYearFilter() {
    this.filters.graduationYear = undefined;
    this.onFilterChange();
  }

  /**
   * Get the starting item number for current page
   */
  getStartItem(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  /**
   * Get the ending item number for current page
   */
  getEndItem(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalCount());
  }

  /**
   * Navigate to a specific page
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Get the range of page numbers to display
   */
  getPageRange(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const range: number[] = [];
    
    // Show 2 pages before and after current page
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  }

  /**
   * Check if first page should be shown
   */
  shouldShowFirstPage(): boolean {
    return this.currentPage() > 3;
  }

  /**
   * Check if last page should be shown
   */
  shouldShowLastPage(): boolean {
    return this.currentPage() < this.totalPages() - 2;
  }

  /**
   * Check if first ellipsis should be shown
   */
  shouldShowFirstEllipsis(): boolean {
    return this.currentPage() > 4;
  }

  /**
   * Check if last ellipsis should be shown
   */
  shouldShowLastEllipsis(): boolean {
    return this.currentPage() < this.totalPages() - 3;
  }
}

