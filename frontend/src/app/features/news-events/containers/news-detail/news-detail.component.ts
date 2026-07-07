import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Calendar, User, Eye, Share2, Newspaper } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { NewsService } from '../../services/news.service';
import type { NewsArticle, NewsArticleSummary } from '../../models';
import { AppImageUrlPipe } from '../../../../shared/pipes/app-image-url.pipe';

/**
 * News Detail Component
 * 
 * Displays full news article with content, author, and metadata.
 * Handles loading states and 404 errors.
 */
@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [RouterModule, HeaderComponent, FooterComponent, LucideAngularModule, AppImageUrlPipe],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <app-header></app-header>
      
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 pt-20">
        <!-- Back Link -->
        <a 
          routerLink="/news-events"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary-700 transition-colors mb-4 cursor-pointer"
        >
          <lucide-icon [img]="arrowLeftIcon" [size]="12"></lucide-icon>
          Back to News & Events
        </a>

        @if (isLoading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        } @else if (error()) {
          <div class="bg-transparent border border-neutral-200/60 p-8 text-center rounded-lg max-w-md mx-auto">
            <div class="text-4xl mb-3">📰</div>
            <h2 class="text-lg font-bold text-neutral-900 mb-1">Article Not Found</h2>
            <p class="text-sm text-neutral-500 mb-4">The article you're looking for doesn't exist or has been removed.</p>
            <button routerLink="/news-events" class="btn-primary btn-sm">
              Go Back
            </button>
          </div>
        } @else if (article()) {
          <!-- Layout Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Main Content (8 cols) -->
            <article class="lg:col-span-8 bg-transparent">
              <!-- Featured Image -->
              @if (article()?.imageUrl) {
                <div class="w-full h-72 md:h-96 relative overflow-hidden bg-neutral-100 rounded-lg mb-5">
                  <img 
                    [src]="article()?.imageUrl | appImageUrl" 
                    [alt]="article()?.title"
                    class="w-full h-full object-cover"
                    (error)="onImageError($event)"
                  >
                  <div 
                    style="display: none;"
                    class="absolute inset-0 bg-primary-950 flex items-center justify-center"
                  >
                    <lucide-icon [img]="newspaperIcon" [size]="48" class="text-white opacity-80"></lucide-icon>
                  </div>
                </div>
              }

              <!-- Category Badge -->
              <div class="mb-2">
                <span class="badge badge-primary">
                  {{ article()!.category.name }}
                </span>
              </div>

              <!-- Title -->
              <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight leading-tight">
                {{ article()!.title }}
              </h1>

              <!-- Metadata -->
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500 mb-5 pb-4 border-b border-neutral-200/60">
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="userIcon" [size]="12"></lucide-icon>
                  <span class="font-medium text-neutral-700">{{ article()!.author.firstName }} {{ article()!.author.lastName }}</span>
                </div>
                <span class="text-neutral-300">•</span>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="calendarIcon" [size]="12"></lucide-icon>
                  <span>{{ formatDate(article()!.publishedAt) }}</span>
                </div>
                <span class="text-neutral-300">•</span>
                <div class="flex items-center gap-1">
                  <lucide-icon [img]="eyeIcon" [size]="12"></lucide-icon>
                  <span>{{ article()!.viewCount }} views</span>
                </div>
              </div>

              <!-- Article Content -->
              <div class="prose prose-sm md:prose max-w-none text-neutral-700 leading-relaxed font-sans">
                <div [innerHTML]="formatContent(article()!.content)"></div>
              </div>

              <!-- Share Section -->
              <div class="mt-8 pt-5 border-t border-neutral-200/60">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <h3 class="text-sm font-bold text-neutral-900 mb-0.5">Share this article</h3>
                    <p class="text-xs text-neutral-500">Help others discover this story</p>
                  </div>
                  <button class="btn-outline btn-sm inline-flex items-center gap-1.5">
                    <lucide-icon [img]="shareIcon" [size]="14"></lucide-icon>
                    Share
                  </button>
                </div>
              </div>
            </article>

            <!-- Sidebar (4 cols) -->
            <aside class="lg:col-span-4 space-y-6">
              <!-- Recent News Widget -->
              <div class="bg-neutral-50/30 border border-neutral-200/60 rounded-lg p-4">
                <h3 class="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-wider text-neutral-500">Recent Updates</h3>
                
                @if (recentArticles().length === 0) {
                  <p class="text-xs text-neutral-500">No other recent articles found.</p>
                } @else {
                  <div class="divide-y divide-neutral-200/60">
                    @for (recent of recentArticles(); track recent.id) {
                      <div 
                        [routerLink]="['/news', recent.slug]"
                        class="group cursor-pointer py-3 first:pt-0 last:pb-0 block transition-colors"
                      >
                        <div class="flex gap-3">
                          <!-- Small Image / Icon -->
                          <div class="w-14 h-14 rounded bg-neutral-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            @if (recent.thumbnailUrl) {
                              <img [src]="recent.thumbnailUrl | appImageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            } @else {
                              <div class="w-full h-full bg-primary-50 text-primary-700/80 flex items-center justify-center">
                                <lucide-icon [img]="newspaperIcon" [size]="16"></lucide-icon>
                              </div>
                            }
                          </div>
                          <!-- Text content -->
                          <div class="flex-1 min-w-0">
                            <span class="text-[10px] font-semibold uppercase tracking-wider text-primary-700 block mb-0.5">{{ recent.category.name }}</span>
                            <h4 class="text-xs font-bold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug line-clamp-2">{{ recent.title }}</h4>
                            <span class="text-[10px] text-neutral-400 block mt-1">{{ formatDate(recent.publishedAt) }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Back to main list CTA -->
              <div class="bg-neutral-50/30 border border-neutral-200/60 rounded-lg p-4 text-center">
                <h4 class="text-xs font-bold text-neutral-900 mb-1">Want more updates?</h4>
                <p class="text-[11px] text-neutral-500 mb-3">Browse all academic developments and event notifications.</p>
                <button routerLink="/news-events" class="btn-outline btn-sm w-full">
                  All News & Events
                </button>
              </div>
            </aside>
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
  recentArticles = signal<NewsArticleSummary[]>([]);
  isLoading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadArticle(id);
        this.loadRecentArticles(id);
      } else {
        this.error.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private loadArticle(slug: string): void {
    this.isLoading.set(true);
    this.newsService.getArticleBySlug(slug).subscribe({
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

  private loadRecentArticles(currentId: string): void {
    this.newsService.getPublishedArticles(1, 6).subscribe({
      next: (result) => {
        // Exclude the current article and show at most 3
        const filtered = result.items
          .filter(item => item.slug !== currentId)
          .slice(0, 3);
        this.recentArticles.set(filtered);
      },
      error: (err) => {
        console.error('Error loading recent articles:', err);
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
