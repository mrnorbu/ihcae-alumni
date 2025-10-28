import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Star, Calendar, MapPin, Award, Plus, Eye, Edit, Trash2, User } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { NewsService } from '../../../news-events/services/news.service';
import type { NewsArticleSummary } from '../../../news-events/models';

/**
 * Success Stories Component
 * 
 * Showcase page displaying alumni success stories and achievements.
 * Features story submissions, filtering, and detailed story views.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 mb-2">Alumni Success Stories</h1>
          <p class="text-neutral-600">Celebrating the achievements and journeys of our IHCAE alumni community</p>
        </div>

        <!-- Featured Story -->
        @if (getFeaturedStory()) {
          <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow p-8 mb-8 text-white">
            <div class="flex items-start gap-6">
              <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="starIcon" [size]="32" class="text-white"></lucide-icon>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2">Featured Story</h2>
                <h3 class="text-xl font-semibold mb-3">{{ getFeaturedStory()!.title }}</h3>
                <p class="text-primary-100 mb-4 line-clamp-3">{{ getFeaturedStory()!.excerpt }}</p>
                <div class="flex items-center gap-4 text-sm text-primary-100">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="userIcon" [size]="14"></lucide-icon>
                    {{ getAuthorName(getFeaturedStory()!) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="calendarIcon" [size]="14"></lucide-icon>
                    {{ formatFullDate(getFeaturedStory()!.publishedAt) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="awardIcon" [size]="14"></lucide-icon>
                    {{ getFeaturedStory()!.category.name }}
                  </div>
                </div>
              </div>
              <button class="btn-white" [routerLink]="['/news', getFeaturedStory()!.id]">
                Read Full Story
              </button>
            </div>
          </div>
        }

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="input-label">Search Stories</label>
              <input
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchChange($event)"
                type="text"
                class="input-field"
                placeholder="Search by title, author, or keywords..."
              />
            </div>

            <!-- Year Filter -->
            <div>
              <label class="input-label">Year</label>
              <select 
                [ngModel]="yearFilter()"
                (ngModelChange)="onYearChange($event)"
                class="input-field">
                <option value="">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        }

        <!-- Stories Grid -->
        @if (!isLoading() && getFilteredStories().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            @for (story of getFilteredStories(); track story.id; let i = $index) {
              <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer" [routerLink]="['/news', story.id]">
                <!-- Story Image -->
                <div class="h-48 relative overflow-hidden rounded-t-lg">
                  @if (story.thumbnailUrl) {
                    <img 
                      [src]="story.thumbnailUrl" 
                      [alt]="story.title" 
                      class="w-full h-full object-cover absolute inset-0"
                      (error)="onImageError($event)"
                    >
                  }
                  <!-- Fallback gradient -->
                  <div 
                    class="h-48 flex items-center justify-center absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500"
                    [style.display]="story.thumbnailUrl ? 'none' : 'flex'"
                  >
                    <lucide-icon [img]="awardIcon" [size]="48" class="text-white opacity-80"></lucide-icon>
                  </div>
                </div>
                
                <!-- Story Content -->
                <div class="p-6">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="badge badge-primary">{{ story.category.name }}</span>
                    <span class="text-xs text-neutral-500">{{ formatDate(story.publishedAt) }}</span>
                  </div>
                  
                  <h3 class="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{{ story.title }}</h3>
                  <p class="text-neutral-600 mb-4 line-clamp-3">{{ story.excerpt }}</p>
                  
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2 text-sm text-neutral-500">
                      <lucide-icon [img]="userIcon" [size]="14"></lucide-icon>
                      {{ getAuthorName(story) }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-neutral-500">
                      <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                      {{ story.viewCount }} views
                    </div>
                  </div>
                  
                  <button class="btn-outline w-full">
                    Read Story →
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex justify-center items-center gap-4 mb-8">
              <button 
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="btn-outline"
                [class.opacity-50]="currentPage() === 1"
                [class.cursor-not-allowed]="currentPage() === 1"
              >
                Previous
              </button>
              <span class="text-neutral-600">
                Page {{ currentPage() }} of {{ totalPages() }}
              </span>
              <button 
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline"
                [class.opacity-50]="currentPage() === totalPages()"
                [class.cursor-not-allowed]="currentPage() === totalPages()"
              >
                Next
              </button>
            </div>
          }
        }

        <!-- Empty State -->
        @if (!isLoading() && getFilteredStories().length === 0) {
          <div class="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <lucide-icon [img]="awardIcon" [size]="48" class="text-neutral-300 mx-auto mb-4"></lucide-icon>
            <h3 class="text-lg font-semibold text-neutral-900 mb-2">No stories found</h3>
            <p class="text-neutral-600 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria or check back later for new success stories.
            </p>
            <button (click)="clearFilters()" class="btn-primary">Clear All Filters</button>
          </div>
        }

        <!-- Submit Story CTA -->
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">Share Your Success Story</h3>
              <p class="text-neutral-600">Inspire others by sharing your achievements and journey</p>
            </div>
            <button class="btn-primary whitespace-nowrap" routerLink="/submit-success-story">
              <lucide-icon [img]="plusIcon" [size]="18"></lucide-icon>
              Submit Story
            </button>
          </div>
        </div>
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class SuccessStoriesComponent implements OnInit {
  private newsService = inject(NewsService);

  // Icons
  starIcon = Star;
  calendarIcon = Calendar;
  userIcon = User;
  awardIcon = Award;
  plusIcon = Plus;
  eyeIcon = Eye;

  // State
  stories = signal<NewsArticleSummary[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 12;

  // Filters
  searchTerm = signal('');
  yearFilter = signal('');

  ngOnInit() {
    this.loadSuccessStories();
  }

  private loadSuccessStories(): void {
    this.isLoading.set(true);
    this.newsService.getSuccessStories(this.currentPage(), this.pageSize).subscribe({
      next: (result) => {
        this.stories.set(result.items);
        this.totalPages.set(Math.ceil(result.totalCount / this.pageSize));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading success stories:', error);
        this.isLoading.set(false);
      }
    });
  }

  getFilteredStories(): NewsArticleSummary[] {
    let filteredStories = this.stories();

    const search = this.searchTerm();
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStories = filteredStories.filter(story => 
        story.title.toLowerCase().includes(searchLower) ||
        story.author.firstName.toLowerCase().includes(searchLower) ||
        story.author.lastName.toLowerCase().includes(searchLower) ||
        (story.excerpt && story.excerpt.toLowerCase().includes(searchLower))
      );
    }

    const year = this.yearFilter();
    if (year) {
      filteredStories = filteredStories.filter(story => {
        if (!story.publishedAt) return false;
        const storyYear = new Date(story.publishedAt).getFullYear().toString();
        return storyYear === year;
      });
    }

    return filteredStories;
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onYearChange(value: string): void {
    this.yearFilter.set(value);
  }

  getFeaturedStory(): NewsArticleSummary | null {
    const stories = this.stories();
    return stories.length > 0 ? stories[0] : null;
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.yearFilter.set('');
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatFullDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  getAuthorName(story: NewsArticleSummary): string {
    return `${story.author.firstName} ${story.author.lastName}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const fallbackDiv = imgElement.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadSuccessStories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadSuccessStories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
