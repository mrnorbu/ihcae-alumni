import { Component, inject, OnInit, signal } from '@angular/core';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, User, Eye, Share2, Newspaper } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { NewsService } from '../../services/news.service';
import type { NewsArticle } from '../../models';

/**
 * News Detail Component
 * 
 * Displays full news article with content, author, and metadata.
 * Handles loading states and 404 errors.
 */
@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
        <!-- Back Button -->
        <button 
          (click)="goBack()"
          class="btn-outline mb-6 inline-flex items-center gap-2"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="18"></lucide-icon>
          Back
        </button>

        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        } @else if (error()) {
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <div class="text-6xl mb-4">📰</div>
            <h2 class="text-2xl font-bold text-neutral-900 mb-2">Article Not Found</h2>
            <p class="text-neutral-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <button (click)="goBack()" class="btn-primary">
              Go Back
            </button>
          </div>
        } @else if (article()) {
          <!-- Article Content -->
          <article class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Featured Image -->
            @if (article()!.imageUrl) {
              <div class="w-full h-96 relative overflow-hidden bg-neutral-100">
                <img 
                  [src]="article()!.imageUrl" 
                  [alt]="article()!.title"
                  class="w-full h-full object-cover"
                  (error)="onImageError($event)"
                >
                <div 
                  style="display: none;"
                  class="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center"
                >
                  <lucide-icon [img]="newspaperIcon" [size]="64" class="text-white opacity-80"></lucide-icon>
                </div>
              </div>
            }

            <div class="p-8 md:p-12">
              <!-- Category Badge -->
              <div class="mb-4">
                <span class="badge badge-primary text-sm">
                  {{ article()!.category.name }}
                </span>
              </div>

              <!-- Title -->
              <h1 class="text-4xl font-bold text-neutral-900 mb-6 leading-tight">
                {{ article()!.title }}
              </h1>

              <!-- Metadata -->
              <div class="flex flex-wrap items-center gap-6 text-sm text-neutral-600 mb-8 pb-8 border-b border-neutral-200">
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="userIcon" [size]="16"></lucide-icon>
                  <span>{{ article()!.author.firstName }} {{ article()!.author.lastName }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
                  <span>{{ formatDate(article()!.publishedAt) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                  <span>{{ article()!.viewCount }} views</span>
                </div>
              </div>

              <!-- Article Content -->
              <div class="prose prose-lg max-w-none">
                <div [innerHTML]="formatContent(article()!.content)"></div>
              </div>

              <!-- Share Section -->
              <div class="mt-12 pt-8 border-t border-neutral-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-semibold text-neutral-900 mb-2">Share this article</h3>
                    <p class="text-sm text-neutral-600">Help others discover this story</p>
                  </div>
                  <button class="btn-outline inline-flex items-center gap-2">
                    <lucide-icon [img]="shareIcon" [size]="18"></lucide-icon>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </article>

          <!-- Related Articles -->
          <div class="mt-12">
            <h2 class="text-2xl font-bold text-neutral-900 mb-6">More Articles</h2>
            <div class="text-center py-8">
              <button 
                routerLink="/news-events"
                class="btn-primary inline-flex items-center gap-2"
              >
                View All Articles
              </button>
            </div>
          </div>
        }
      </div>
      
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host ::ng-deep .prose {
      color: #404040;
      line-height: 1.75;
    }
    :host ::ng-deep .prose p {
      margin-bottom: 1.25rem;
    }
    :host ::ng-deep .prose h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #171717;
    }
    :host ::ng-deep .prose h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #171717;
    }
    :host ::ng-deep .prose ul, :host ::ng-deep .prose ol {
      margin-bottom: 1.25rem;
      padding-left: 1.5rem;
    }
    :host ::ng-deep .prose li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class NewsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private newsService = inject(NewsService);

  // Icons
  arrowLeftIcon = ArrowLeft;
  calendarIcon = Calendar;
  userIcon = User;
  eyeIcon = Eye;
  shareIcon = Share2;
  newspaperIcon = Newspaper;

  // State
  article = signal<NewsArticle | null>(null);
  isLoading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
    } else {
      this.error.set(true);
      this.isLoading.set(false);
    }
  }

  private loadArticle(id: string): void {
    this.isLoading.set(true);
    this.newsService.getArticleById(id).subscribe({
      next: (article) => {
        this.article.set(article);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/news-events']);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  formatContent(content: string): string {
    // Convert line breaks to paragraphs
    return content
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const fallbackDiv = imgElement.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'flex';
    }
  }
}
