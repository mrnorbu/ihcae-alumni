import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { ModernAlumniCardComponent } from '../../components/modern-alumni-card/modern-alumni-card.component';
import { DirectoryService, AlumniCard, DirectoryFilters } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { 
  LucideAngularModule, 
  Search, 
  Filter, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-angular';

/**
 * Modern Directory Page Component
 * 
 * Main container for the redesigned alumni directory with clean, minimalistic design.
 * Uses green color accents to differentiate from the forum while maintaining consistency.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-directory-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HeaderComponent, 
    FooterComponent,
    ModernAlumniCardComponent,
    LucideAngularModule
  ],
  template: `
    <!-- Main container with full height and neutral background -->
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <!-- Header component with navigation and user menu -->
      <app-header></app-header>
      
      <!-- Main Content Container -->
      <div class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-neutral-900 mb-2">Alumni Directory</h1>
          <p class="text-neutral-600 text-sm">Connect with fellow IHCAE alumni and professionals</p>
        </div>

        <!-- Search and Filters Card -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
          <div class="p-4 border-b border-neutral-200">
            <h2 class="text-lg font-semibold text-neutral-900">Search & Filter</h2>
          </div>
          
          <!-- Filter Controls -->
          <div class="p-4 flex items-center gap-4">
            <!-- Search Input -->
            <div class="flex-1 relative">
              <input
                [(ngModel)]="filters.search"
                (ngModelChange)="onSearchChange($event)"
                type="text"
                placeholder="Search by name or email..."
                class="w-full px-3 py-2 pl-10 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <lucide-icon
                [img]="searchIcon"
                [size]="16"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              ></lucide-icon>
              <button
                *ngIf="filters.search"
                (click)="clearSearch()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                title="Clear search"
              >
                <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
              </button>
            </div>
            
            <!-- Course Filter -->
            <div class="relative">
              <select
                [(ngModel)]="filters.course"
                (ngModelChange)="onFilterChange()"
                class="px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                [class.border-green-500]="filters.course"
              >
                <option value="">All Courses</option>
                <option *ngFor="let course of availableCourses()" [value]="course">
                  {{ course }}
                </option>
              </select>
            </div>
            
            <!-- Year Filter -->
            <div class="relative">
              <select
                [(ngModel)]="filters.graduationYear"
                (ngModelChange)="onFilterChange()"
                class="px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                [class.border-green-500]="filters.graduationYear"
              >
                <option [ngValue]="undefined">All Years</option>
                <option *ngFor="let year of availableYears()" [ngValue]="year">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <!-- Active Filters -->
          <div *ngIf="hasActiveFilters()" class="px-4 pb-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-neutral-600">Active filters:</span>
              
              <!-- Search Filter -->
              <span *ngIf="filters.search" class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                Search: "{{ filters.search }}"
                <button
                  (click)="clearSearch()"
                  class="text-green-600 hover:text-green-800 transition-colors"
                >
                  <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                </button>
              </span>
              
              <!-- Course Filter -->
              <span *ngIf="filters.course" class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                Course: {{ filters.course }}
                <button
                  (click)="clearCourseFilter()"
                  class="text-green-600 hover:text-green-800 transition-colors"
                >
                  <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                </button>
              </span>
              
              <!-- Year Filter -->
              <span *ngIf="filters.graduationYear" class="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                Year: {{ filters.graduationYear }}
                <button
                  (click)="clearYearFilter()"
                  class="text-green-600 hover:text-green-800 transition-colors"
                >
                  <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                </button>
              </span>
              
              <!-- Clear All -->
              <button
                (click)="clearFilters()"
                class="text-xs text-green-600 hover:text-green-700 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>

        <!-- Results Header -->
        <div class="bg-white rounded-lg shadow-sm border border-neutral-200 mb-4">
          <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 class="text-sm font-semibold text-green-800">Alumni Members</h3>
              <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {{ totalCount() }} {{ totalCount() === 1 ? 'member' : 'members' }}
              </span>
            </div>
            
            <!-- Results Count -->
            <p *ngIf="!isLoading()" class="text-sm text-neutral-600 flex items-center gap-2">
              <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
              {{ filteredCount() }} results
              <span *ngIf="hasActiveFilters()" class="text-green-600">(filtered)</span>
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="space-y-3">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white border border-neutral-200 rounded-lg p-4 animate-pulse">
            <div class="flex gap-4">
              <div class="w-12 h-12 bg-neutral-200 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                <div class="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-neutral-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="false" class="bg-white border border-red-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800">
            <i class="bi bi-exclamation-triangle text-lg"></i>
            <p class="text-sm">Error loading directory</p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && alumni().length === 0" class="bg-white rounded-lg shadow-sm border border-neutral-200 text-center py-12">
          <lucide-icon [img]="usersIcon" [size]="48" class="text-neutral-300 mb-4"></lucide-icon>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            <span *ngIf="hasActiveFilters()">No alumni match your search</span>
            <span *ngIf="!hasActiveFilters()">No alumni found</span>
          </h3>
          <p class="text-neutral-500 mb-6 max-w-md mx-auto">
            <span *ngIf="hasActiveFilters()">
              Try adjusting your search criteria or filters to find more results.
            </span>
            <span *ngIf="!hasActiveFilters()">
              There are no alumni in the directory yet. Check back later or contact an administrator.
            </span>
          </p>
          
          <div *ngIf="hasActiveFilters()" class="flex justify-center">
            <button
              (click)="clearFilters()"
              class="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Alumni Grid -->
        <div *ngIf="!isLoading() && alumni().length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <app-modern-alumni-card
            *ngFor="let alumnus of alumni()"
            [alumni]="alumnus"
          ></app-modern-alumni-card>
        </div>

        <!-- Pagination -->
        <div *ngIf="!isLoading() && totalPages() > 1" class="flex justify-center items-center gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1"
            class="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <lucide-icon [img]="prevIcon" [size]="14"></lucide-icon>
          </button>

          <div class="flex items-center gap-1">
            <button
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              [class.bg-green-600]="page === currentPage()"
              [class.text-white]="page === currentPage()"
              [class.hover:bg-neutral-50]="page !== currentPage()"
              class="px-3 py-2 text-sm border border-neutral-300 rounded-md transition-colors"
            >
              {{ page }}
            </button>
          </div>

          <button
            (click)="nextPage()"
            [disabled]="currentPage() === totalPages()"
            class="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <lucide-icon [img]="nextIcon" [size]="14"></lucide-icon>
          </button>
        </div>
      </div>
      
      <!-- Footer component -->
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class ModernDirectoryPageComponent implements OnInit, OnDestroy {
  // Services
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Debounced search functionality
  private searchSubject = new Subject<string>();

  // Reactive state using Angular signals
  alumni = signal<AlumniCard[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  // Filter options populated from API data
  availableCourses = signal<string[]>([]);
  availableYears = signal<number[]>([]);

  // Current filter state
  filters: DirectoryFilters = {
    search: '',
    course: '',
    graduationYear: undefined,
    page: 1,
    pageSize: this.pageSize
  };

  // Lucide icons
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly usersIcon = Users;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly xIcon = X;

  ngOnInit(): void {
    this.loadDirectory();
    this.loadFilterOptions();
    
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filters.search = searchTerm;
        this.onFilterChange();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads alumni directory data from API with current filters
   */
  loadDirectory(): void {
    this.isLoading.set(true);
    this.filters.page = this.currentPage();
    this.filters.pageSize = this.pageSize;

    this.directoryService.getAlumniDirectory(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
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
   */
  loadFilterOptions(): void {
    this.directoryService.getAvailableCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.availableCourses.set(courses);
        },
        error: (error) => {
          console.error('Error loading courses:', error);
        }
      });

    this.directoryService.getAvailableYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (years) => {
          this.availableYears.set(years);
        },
        error: (error) => {
          console.error('Error loading years:', error);
        }
      });
  }

  /**
   * Handles search input changes
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Handles filter changes
   */
  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadDirectory();
  }

  /**
   * Clears search filter
   */
  clearSearch(): void {
    this.filters.search = '';
    this.onFilterChange();
  }

  /**
   * Clears course filter
   */
  clearCourseFilter(): void {
    this.filters.course = '';
    this.onFilterChange();
  }

  /**
   * Clears year filter
   */
  clearYearFilter(): void {
    this.filters.graduationYear = undefined;
    this.onFilterChange();
  }

  /**
   * Clears all filters
   */
  clearFilters(): void {
    this.filters.search = '';
    this.filters.course = '';
    this.filters.graduationYear = undefined;
    this.currentPage.set(1);
    this.loadDirectory();
  }

  /**
   * Checks if any filters are active
   */
  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.course || this.filters.graduationYear);
  }

  /**
   * Gets filtered count (same as total count for now)
   */
  filteredCount(): number {
    return this.totalCount();
  }

  /**
   * Calculates total pages
   */
  totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }

  /**
   * Goes to a specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Goes to previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Goes to next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Gets page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage() - 2);
    const end = Math.min(this.totalPages(), this.currentPage() + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
