import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Star, Calendar, MapPin, Award, Plus, Eye, Edit, Trash2, User, Search } from 'lucide-angular';
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
  imports: [FormsModule, RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-white page-fade-in">
      <app-header></app-header>
      
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <!-- Page Header -->
        <div class="mb-6 pb-4 border-b border-neutral-200/60">
          <h1 class="text-2xl font-bold text-neutral-900 mb-1">Alumni Success Stories</h1>
          <p class="text-sm text-neutral-500">Celebrating the achievements and journeys of our IHCAE alumni community</p>
        </div>

        <!-- Featured Story -->
        @if (getFeaturedStory()) {
          <div class="bg-primary-950 p-6 rounded-lg mb-8 text-white">
            <div class="flex flex-col md:flex-row items-start gap-5">
              <div class="w-12 h-12 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="starIcon" [size]="24" class="text-primary-200"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-semibold uppercase tracking-wider text-primary-200">Featured Story</span>
                <h3 class="text-lg font-bold mt-1 mb-2 leading-snug">{{ getFeaturedStory()!.title }}</h3>
                <p class="text-sm text-primary-100/80 mb-3.5 line-clamp-2 leading-relaxed">{{ getFeaturedStory()!.excerpt }}</p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-primary-200/70">
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="userIcon" [size]="12"></lucide-icon>
                    <span>{{ getAuthorName(getFeaturedStory()!) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="calendarIcon" [size]="12"></lucide-icon>
                    <span>{{ formatFullDate(getFeaturedStory()!.publishedAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [img]="awardIcon" [size]="12"></lucide-icon>
                    <span>{{ getFeaturedStory()!.category.name }}</span>
                  </div>
                </div>
              </div>
              <button class="btn-primary bg-white hover:bg-neutral-100 text-primary-950 font-medium btn-sm px-4 py-2 transition-colors self-start md:self-center" [routerLink]="['/news', getFeaturedStory()!.id]">
                Read Full Story
              </button>
            </div>
          </div>
        }

        <!-- Filters -->
        <div class="border-b border-neutral-200/60 pb-5 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Search -->
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-neutral-600 mb-1">Search Stories</label>
              <div class="relative">
                <input
                  [ngModel]="searchTerm()"
                  (ngModelChange)="onSearchChange($event)"
                  type="text"
                  class="input-field pl-11"
                  placeholder="Search by title, author, or keywords..."
                />
                <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
              </div>
            </div>

            <!-- Year Filter -->
            <div>
              <label class="block text-xs font-semibold text-neutral-600 mb-1">Year</label>
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
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        }

        <!-- Stories Grid -->
        @if (!isLoading() && getFilteredStories().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            @for (story of getFilteredStories(); track story.id; let i = $index) {
              <div class="group cursor-pointer pb-4 border-b border-neutral-200/60 transition-colors" [routerLink]="['/news', story.id]">
                <!-- Story Image -->
                <div class="aspect-video w-full rounded overflow-hidden mb-2 relative bg-neutral-100 flex items-center justify-center">
                  @if (story.thumbnailUrl) {
                    <img 
                      [src]="story.thumbnailUrl" 
                      [alt]="story.title" 
                      class="w-full h-full object-cover"
                      (error)="onImageError($event)"
                    >
                  }
                  <!-- Fallback solid color -->
                  <div 
                    class="w-full h-full bg-amber-700/10 text-amber-800 flex items-center justify-center"
                    [style.display]="story.thumbnailUrl ? 'none' : 'flex'"
                  >
                    <lucide-icon [img]="awardIcon" [size]="32" class="opacity-75"></lucide-icon>
                  </div>
                </div>
                
                <!-- Story Content -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold tracking-wider uppercase text-amber-700">{{ story.category.name }}</span>
                    <span class="text-xs text-neutral-300">•</span>
                    <span class="text-xs text-neutral-400">{{ formatDate(story.publishedAt) }}</span>
                  </div>
                  
                  <h3 class="text-base font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug">{{ story.title }}</h3>
                  <p class="text-xs text-neutral-500 leading-relaxed line-clamp-3">{{ story.excerpt }}</p>
                  
                  <div class="flex items-center justify-between pt-2">
                    <div class="flex items-center gap-1.5 text-xs text-neutral-400">
                      <lucide-icon [img]="userIcon" [size]="12"></lucide-icon>
                      <span>{{ getAuthorName(story) }}</span>
                    </div>
                    <span class="text-xs font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">
                      Read Story →
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex justify-center items-center gap-3 mb-8">
              <button 
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="btn-outline btn-sm"
                [class.opacity-50]="currentPage() === 1"
                [class.cursor-not-allowed]="currentPage() === 1"
              >
                Previous
              </button>
              <span class="text-xs text-neutral-600">
                Page {{ currentPage() }} of {{ totalPages() }}
              </span>
              <button 
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline btn-sm"
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
          <div class="py-12 text-center">
            <lucide-icon [img]="awardIcon" [size]="36" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
            <h3 class="text-base font-bold text-neutral-900 mb-1">No stories found</h3>
            <p class="text-xs text-neutral-500 mb-4 max-w-xs mx-auto">
              Try adjusting your search criteria or check back later for new success stories.
            </p>
            <button (click)="clearFilters()" class="btn-outline btn-sm">Clear All Filters</button>
          </div>
        }

        <!-- Submit Story CTA -->
        <div class="border-t border-neutral-200/60 pt-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold text-neutral-900">Share Your Success Story</h3>
              <p class="text-xs text-neutral-500 mt-0.5">Inspire others by sharing your achievements and journey</p>
            </div>
            <button class="btn-primary btn-sm whitespace-nowrap inline-flex items-center gap-1.5" routerLink="/submit-success-story">
              <lucide-icon [img]="plusIcon" [size]="14"></lucide-icon>
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
  searchIcon = Search;

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
