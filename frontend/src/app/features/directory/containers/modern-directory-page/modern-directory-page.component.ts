import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { ModernAlumniCardComponent } from '../../components/modern-alumni-card/modern-alumni-card.component';
import { DirectoryService, AlumniCard, DirectoryFilters } from '../../services/directory.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  LucideAngularModule,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-angular';

@Component({
  selector: 'app-modern-directory-page',
  standalone: true,
  imports: [
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ModernAlumniCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col page-fade-in">
      <app-header></app-header>

      <div class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-20 pb-10">

        <!-- ── Filter Bar ── -->
        <div class="bg-white border border-neutral-200 rounded-xl p-3 mb-4 space-y-2.5">

          <!-- Search -->
          <div class="relative">
            <lucide-icon [img]="searchIcon" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
            <input
              [(ngModel)]="filters.search"
              (ngModelChange)="onSearchChange($event)"
              type="text"
              placeholder="Search by name or role..."
              class="w-full pl-9 pr-9 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-colors"
            />
            @if (filters.search) {
              <button (click)="clearSearch()" class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <lucide-icon [img]="xIcon" [size]="13"></lucide-icon>
              </button>
            }
          </div>

          <!-- Filter row -->
          <div class="flex flex-wrap gap-2">
            <select [(ngModel)]="filters.course" (ngModelChange)="onFilterChange()"
              class="flex-1 min-w-[140px] px-3 py-2 text-sm border rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              [class.border-blue-400]="filters.course"
              [class.bg-blue-50]="filters.course"
              [class.text-blue-700]="filters.course"
              [class.border-neutral-200]="!filters.course"
              [class.text-neutral-600]="!filters.course">
              <option value="">All Programmes</option>
              @for (course of availableCourses(); track course) {
                <option [value]="course">{{ course }}</option>
              }
            </select>

            <select [(ngModel)]="filters.graduationYear" (ngModelChange)="onFilterChange()"
              class="w-36 px-3 py-2 text-sm border rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              [class.border-blue-400]="filters.graduationYear"
              [class.bg-blue-50]="filters.graduationYear"
              [class.text-blue-700]="filters.graduationYear"
              [class.border-neutral-200]="!filters.graduationYear"
              [class.text-neutral-600]="!filters.graduationYear">
              <option [ngValue]="undefined">All Years</option>
              @for (year of availableYears(); track year) {
                <option [ngValue]="year">{{ year }}</option>
              }
            </select>

            <select [(ngModel)]="sortBy"
              class="w-44 px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="name">Name A–Z</option>
              <option value="year-desc">Newest batch first</option>
              <option value="year-asc">Oldest batch first</option>
            </select>

            @if (hasActiveFilters()) {
              <button (click)="clearFilters()"
                class="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors whitespace-nowrap">
                <lucide-icon [img]="xIcon" [size]="13"></lucide-icon>
                Clear
              </button>
            }
          </div>

          <!-- Active filter chips -->
          @if (hasActiveFilters()) {
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              @if (filters.course) {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                  {{ filters.course }}
                  <button (click)="clearCourseFilter()"><lucide-icon [img]="xIcon" [size]="10"></lucide-icon></button>
                </span>
              }
              @if (filters.graduationYear) {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                  Batch {{ filters.graduationYear }}
                  <button (click)="clearYearFilter()"><lucide-icon [img]="xIcon" [size]="10"></lucide-icon></button>
                </span>
              }
              @if (filters.search) {
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                  "{{ filters.search }}"
                  <button (click)="clearSearch()"><lucide-icon [img]="xIcon" [size]="10"></lucide-icon></button>
                </span>
              }
            </div>
          }
        </div>

        <!-- Results count -->
        <div class="flex items-center gap-1.5 mb-3 px-1">
          <lucide-icon [img]="usersIcon" [size]="13" class="text-neutral-400"></lucide-icon>
          <span class="text-sm text-neutral-500">
            @if (isLoading()) { Loading… }
            @if (!isLoading()) {
              <strong class="text-neutral-700">{{ totalCount() }}</strong>
              {{ totalCount() === 1 ? 'member' : 'members' }}
              @if (hasActiveFilters()) { found }
            }
          </span>
        </div>

        <!-- Loading skeleton -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="bg-white border border-neutral-200 rounded-xl p-4 animate-pulse flex gap-4">
                <div class="w-14 h-14 bg-neutral-200 rounded-full shrink-0"></div>
                <div class="flex-1 space-y-2.5 pt-1">
                  <div class="h-3.5 bg-neutral-200 rounded w-1/2"></div>
                  <div class="h-3 bg-neutral-200 rounded w-2/3"></div>
                  <div class="h-3 bg-neutral-200 rounded w-1/3"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty state -->
        @if (!isLoading() && alumni().length === 0) {
          <div class="bg-white border border-neutral-200 rounded-xl text-center py-16">
            <lucide-icon [img]="usersIcon" [size]="40" class="text-neutral-200 mx-auto mb-3"></lucide-icon>
            <p class="text-sm font-medium text-neutral-600 mb-1">
              {{ hasActiveFilters() ? 'No alumni match your filters' : 'No alumni found' }}
            </p>
            <p class="text-xs text-neutral-400 mb-4">
              {{ hasActiveFilters() ? 'Try adjusting your filters.' : 'Check back later or contact an administrator.' }}
            </p>
            @if (hasActiveFilters()) {
              <button (click)="clearFilters()" class="px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                Clear Filters
              </button>
            }
          </div>
        }

        <!-- Alumni grid -->
        @if (!isLoading() && sortedAlumni().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            @for (alumnus of sortedAlumni(); track alumnus.id) {
              <app-modern-alumni-card [alumni]="alumnus"></app-modern-alumni-card>
            }
          </div>
        }

        <!-- Pagination -->
        @if (!isLoading() && totalPages() > 1) {
          <div class="flex justify-center items-center gap-1.5">
            <button (click)="previousPage()" [disabled]="currentPage() === 1"
              class="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <lucide-icon [img]="prevIcon" [size]="14"></lucide-icon>
            </button>
            @for (page of getPageNumbers(); track page) {
              <button (click)="goToPage(page)"
                class="px-3 py-1.5 text-sm border rounded-lg transition-colors"
                [class.bg-neutral-900]="page === currentPage()"
                [class.text-white]="page === currentPage()"
                [class.border-neutral-900]="page === currentPage()"
                [class.border-neutral-200]="page !== currentPage()"
                [class.hover:bg-neutral-50]="page !== currentPage()">
                {{ page }}
              </button>
            }
            <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
              class="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <lucide-icon [img]="nextIcon" [size]="14"></lucide-icon>
            </button>
          </div>
        }

      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class ModernDirectoryPageComponent implements OnInit, OnDestroy {
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  alumni = signal<AlumniCard[]>([]);
  isLoading = signal(true);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = 20;
  sortBy = 'name';

  availableCourses = signal<string[]>([]);
  availableYears = signal<number[]>([]);

  filters: DirectoryFilters = {
    search: '',
    course: '',
    graduationYear: undefined,
    page: 1,
    pageSize: this.pageSize
  };

  readonly searchIcon = Search;
  readonly usersIcon = Users;
  readonly filtersIcon = SlidersHorizontal;
  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly xIcon = X;

  sortedAlumni(): AlumniCard[] {
    const list = [...this.alumni()];
    switch (this.sortBy) {
      case 'name':       return list.sort((a, b) => a.firstName.localeCompare(b.firstName));
      case 'year-desc':  return list.sort((a, b) => (b.graduationYear ?? 0) - (a.graduationYear ?? 0));
      case 'year-asc':   return list.sort((a, b) => (a.graduationYear ?? 0) - (b.graduationYear ?? 0));
      default:           return list;
    }
  }

  ngOnInit(): void {
    this.loadDirectory();
    this.loadFilterOptions();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => { this.filters.search = term; this.onFilterChange(); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDirectory(): void {
    this.isLoading.set(true);
    this.filters.page = this.currentPage();
    this.filters.pageSize = this.pageSize;
    this.directoryService.getAlumniDirectory(this.filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => { this.alumni.set(result.items); this.totalCount.set(result.totalCount); this.isLoading.set(false); },
        error: () => { this.notificationService.showError('Error', 'Failed to load alumni directory'); this.isLoading.set(false); }
      });
  }

  loadFilterOptions(): void {
    this.directoryService.getAvailableCourses().pipe(takeUntil(this.destroy$))
      .subscribe({ next: (c) => this.availableCourses.set(c) });
    this.directoryService.getAvailableYears().pipe(takeUntil(this.destroy$))
      .subscribe({ next: (y) => this.availableYears.set(y) });
  }

  onSearchChange(term: string): void { this.searchSubject.next(term); }
  onFilterChange(): void { this.currentPage.set(1); this.loadDirectory(); }

  clearSearch(): void { this.filters.search = ''; this.onFilterChange(); }
  clearCourseFilter(): void { this.filters.course = ''; this.onFilterChange(); }
  clearYearFilter(): void { this.filters.graduationYear = undefined; this.onFilterChange(); }
  clearFilters(): void {
    this.filters.search = '';
    this.filters.course = '';
    this.filters.graduationYear = undefined;
    this.currentPage.set(1);
    this.loadDirectory();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.course || this.filters.graduationYear);
  }

  totalPages(): number { return Math.ceil(this.totalCount() / this.pageSize); }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page); this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1); this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1); this.loadDirectory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage() - 2);
    const end = Math.min(this.totalPages(), this.currentPage() + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
}
