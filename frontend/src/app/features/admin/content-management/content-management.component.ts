import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { environment } from '../../../../environments/environment';
import { 
  LucideAngularModule, 
  FileText, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-angular';

/**
 * Content Management Admin Component
 * 
 * Admin interface for managing news articles and events.
 * Features:
 * - Create, edit, delete news articles
 * - Create, edit, delete events
 * - Draft/publish content management
 * - Content preview and status management
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-content-management',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ConfirmationModalComponent],
  template: `
    <div class="min-h-screen bg-neutral-50">
      <!-- Header -->
      <header class="bg-white border-b border-neutral-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <a href="/admin" class="text-neutral-600 hover:text-neutral-900">
                <lucide-icon [img]="arrowLeftIcon" [size]="20"></lucide-icon>
              </a>
              <h1 class="text-xl font-semibold text-neutral-900">Content Management</h1>
            </div>
            <div class="flex items-center gap-3">
              <button
                (click)="refreshData()"
                class="btn-ghost"
                [disabled]="isLoading()"
                >
                <lucide-icon [img]="refreshIcon" [size]="18"
                  [class.animate-spin]="isLoading()">
                </lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </header>
    
      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Cards -->
        <div class="flex gap-4 overflow-x-auto pb-2 mb-6 whitespace-nowrap hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <!-- Total Articles -->
          <div class="stat-card shrink-0 min-w-[200px] sm:flex-1">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-secondary-50 text-secondary-700 border border-secondary-200/30">
                <lucide-icon [img]="fileTextIcon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Articles</p>
                <p class="text-2xl font-bold text-neutral-900 leading-none">{{ stats().totalArticles }}</p>
              </div>
            </div>
          </div>
    
          <!-- Published Articles -->
          <div class="stat-card shrink-0 min-w-[200px] sm:flex-1">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-primary-50 text-primary-700 border border-primary-200/30">
                <lucide-icon [img]="eyeIcon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Published</p>
                <p class="text-2xl font-bold text-neutral-900 leading-none">{{ stats().publishedArticles }}</p>
              </div>
            </div>
          </div>
    
          <!-- Draft Articles -->
          <div class="stat-card shrink-0 min-w-[200px] sm:flex-1">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-amber-50 text-amber-700 border border-amber-200/30">
                <lucide-icon [img]="eyeOffIcon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Drafts</p>
                <p class="text-2xl font-bold text-neutral-900 leading-none">{{ stats().draftArticles }}</p>
              </div>
            </div>
          </div>
    
          <!-- Total Events -->
          <div class="stat-card shrink-0 min-w-[200px] sm:flex-1">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-secondary-50 text-secondary-700 border border-secondary-200/30">
                <lucide-icon [img]="calendarIcon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Events</p>
                <p class="text-2xl font-bold text-neutral-900 leading-none">{{ stats().totalEvents }}</p>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Action Bar -->
        <div class="card mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-neutral-900">Content Library</h2>
              <p class="text-sm text-neutral-600">Manage news articles and events</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                (click)="createArticle()"
                class="btn-primary"
                >
                <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon>
                <span>New Article</span>
              </button>
              <button
                (click)="createEvent()"
                class="btn-outline"
                >
                <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
                <span>New Event</span>
              </button>
            </div>
          </div>
        </div>
    
        <!-- Tab Navigation -->
        <div class="tab-nav mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            (click)="setActiveTab('articles')"
            [class.tab-item]="activeTab() !== 'articles'"
            [class.tab-item-active]="activeTab() === 'articles'"
            >
            Articles ({{ getFilteredArticles().length }})
          </button>
          <button
            (click)="setActiveTab('events')"
            [class.tab-item]="activeTab() !== 'events'"
            [class.tab-item-active]="activeTab() === 'events'"
            >
            Events ({{ getFilteredEvents().length }})
          </button>
        </div>
    
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="py-12 text-center">
            <lucide-icon [img]="refreshIcon" [size]="24" class="animate-spin text-primary-600 mx-auto mb-2"></lucide-icon>
            <p class="text-sm text-neutral-600">Loading content...</p>
          </div>
        }
    
        <!-- Articles Tab -->
        @if (!isLoading() && activeTab() === 'articles') {
          <div class="space-y-4">
            @for (article of getFilteredArticles(); track article) {
              <div class="card">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="fileTextIcon" [size]="24" class="text-neutral-400"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ article.title }}</h3>
                        <p class="text-sm text-neutral-600 mb-2 line-clamp-2">{{ article.excerpt }}</p>
                        <div class="flex items-center gap-4 text-xs text-neutral-500">
                          <span>Created: {{ formatDate(article.createdAt) }}</span>
                          @if (article.updatedAt) {
                            <span>Updated: {{ formatDate(article.updatedAt) }}</span>
                          }
                          <span>By: {{ article.authorName }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        @if (article.isPublished) {
                          <span class="badge badge-success">Published</span>
                        }
                        @if (!article.isPublished) {
                          <span class="badge badge-warning">Draft</span>
                        }
                        <div class="flex items-center gap-1">
                          <button
                            (click)="editArticle(article)"
                            class="btn-ghost btn-sm"
                            title="Edit article"
                            >
                            <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                          </button>
                          <button
                            (click)="deleteArticle(article)"
                            class="btn-ghost btn-sm text-red-600 hover:text-red-800"
                            title="Delete article"
                            >
                            <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            <!-- Empty State for Articles -->
            @if (getFilteredArticles().length === 0) {
              <div class="card text-center py-12">
                <lucide-icon [img]="fileTextIcon" [size]="48" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
                <h3 class="text-lg font-semibold text-neutral-900 mb-2">No articles yet</h3>
                <p class="text-neutral-600 mb-4">Create your first news article to get started.</p>
                <button (click)="createArticle()" class="btn-primary">
                  <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon>
                  <span>Create Article</span>
                </button>
              </div>
            }
          </div>
        }
    
        <!-- Events Tab -->
        @if (!isLoading() && activeTab() === 'events') {
          <div class="space-y-4">
            @for (event of getFilteredEvents(); track event) {
              <div class="card">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="calendarIcon" [size]="24" class="text-neutral-400"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ event.title }}</h3>
                        <p class="text-sm text-neutral-600 mb-2 line-clamp-2">{{ event.description }}</p>
                        <div class="flex items-center gap-4 text-xs text-neutral-500">
                          <span>Date: {{ formatDate(event.eventDate) }}</span>
                          @if (event.location) {
                            <span>Location: {{ event.location }}</span>
                          }
                          <span>Created: {{ formatDate(event.createdAt) }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        @if (event.isPublished) {
                          <span class="badge badge-success">Published</span>
                        }
                        @if (!event.isPublished) {
                          <span class="badge badge-warning">Draft</span>
                        }
                        <div class="flex items-center gap-1">
                          <button
                            (click)="editEvent(event)"
                            class="btn-ghost btn-sm"
                            title="Edit event"
                            >
                            <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                          </button>
                          <button
                            (click)="deleteEvent(event)"
                            class="btn-ghost btn-sm text-red-600 hover:text-red-800"
                            title="Delete event"
                            >
                            <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            <!-- Empty State for Events -->
            @if (getFilteredEvents().length === 0) {
              <div class="card text-center py-12">
                <lucide-icon [img]="calendarIcon" [size]="48" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
                <h3 class="text-lg font-semibold text-neutral-900 mb-2">No events yet</h3>
                <p class="text-neutral-600 mb-4">Create your first event to get started.</p>
                <button (click)="createEvent()" class="btn-primary">
                  <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon>
                  <span>Create Event</span>
                </button>
              </div>
            }
          </div>
        }
      </main>
    
      <!-- Create/Edit Article Modal -->
      @if (showArticleModal()) {
        <div class="modal-overlay" (click)="closeArticleModal()">
          <div class="flex items-center justify-center min-h-screen p-4">
            <div class="modal-content max-w-2xl w-full p-6" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-neutral-900">
                  {{ editingArticle() ? 'Edit Article' : 'Create Article' }}
                </h3>
                <button (click)="closeArticleModal()" class="btn-ghost">
                  <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
                </button>
              </div>
              <form (ngSubmit)="saveArticle()" class="space-y-4">
                <div>
                  <label for="article-title" class="input-label">Title</label>
                  <input
                    id="article-title"
                    type="text"
                    [(ngModel)]="articleForm.title"
                    name="title"
                    class="input-field"
                    placeholder="Enter article title..."
                    required
                    />
                </div>
                <div>
                  <label for="article-excerpt" class="input-label">Excerpt</label>
                  <textarea
                    id="article-excerpt"
                    [(ngModel)]="articleForm.excerpt"
                    name="excerpt"
                    rows="3"
                    class="input-field"
                    placeholder="Enter article excerpt..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label for="article-content" class="input-label">Content</label>
                  <textarea
                    id="article-content"
                    [(ngModel)]="articleForm.content"
                    name="content"
                    rows="8"
                    class="input-field"
                    placeholder="Enter article content..."
                    required
                  ></textarea>
                </div>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      [(ngModel)]="articleForm.isPublished"
                      name="isPublished"
                      class="rounded border-neutral-300"
                      />
                    <span class="text-sm text-neutral-700">Publish immediately</span>
                  </label>
                </div>
                <div class="flex items-center justify-end gap-3">
                  <button type="button" (click)="closeArticleModal()" class="btn-outline">Cancel</button>
                  <button type="submit" class="btn-primary" [disabled]="isSaving()">
                    @if (!isSaving()) {
                      <lucide-icon [img]="saveIcon" [size]="16"></lucide-icon>
                    }
                    @if (isSaving()) {
                      <lucide-icon [img]="refreshIcon" [size]="16" class="animate-spin"></lucide-icon>
                    }
                    <span>{{ editingArticle() ? 'Update Article' : 'Create Article' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    
      <!-- Create/Edit Event Modal -->
      @if (showEventModal()) {
        <div class="modal-overlay" (click)="closeEventModal()">
          <div class="flex items-center justify-center min-h-screen p-4">
            <div class="modal-content max-w-2xl w-full p-6" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-neutral-900">
                  {{ editingEvent() ? 'Edit Event' : 'Create Event' }}
                </h3>
                <button (click)="closeEventModal()" class="btn-ghost">
                  <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
                </button>
              </div>
              <form (ngSubmit)="saveEvent()" class="space-y-4">
                <div>
                  <label for="event-title" class="input-label">Title</label>
                  <input
                    id="event-title"
                    type="text"
                    [(ngModel)]="eventForm.title"
                    name="title"
                    class="input-field"
                    placeholder="Enter event title..."
                    required
                    />
                </div>
                <div>
                  <label for="event-description" class="input-label">Description</label>
                  <textarea
                    id="event-description"
                    [(ngModel)]="eventForm.description"
                    name="description"
                    rows="4"
                    class="input-field"
                    placeholder="Enter event description..."
                    required
                  ></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="event-date" class="input-label">Event Date</label>
                    <input
                      id="event-date"
                      type="datetime-local"
                      [(ngModel)]="eventForm.eventDate"
                      [min]="minEventDate"
                      name="eventDate"
                      class="input-field"
                      required
                      />
                  </div>
                  <div>
                    <label for="event-location" class="input-label">Location</label>
                    <input
                      id="event-location"
                      type="text"
                      [(ngModel)]="eventForm.location"
                      name="location"
                      class="input-field"
                      placeholder="Enter event location..."
                      />
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      [(ngModel)]="eventForm.isPublished"
                      name="isPublished"
                      class="rounded border-neutral-300"
                      />
                    <span class="text-sm text-neutral-700">Publish immediately</span>
                  </label>
                </div>
                <div class="flex items-center justify-end gap-3">
                  <button type="button" (click)="closeEventModal()" class="btn-outline">Cancel</button>
                  <button type="submit" class="btn-primary" [disabled]="isSaving()">
                    @if (!isSaving()) {
                      <lucide-icon [img]="saveIcon" [size]="16"></lucide-icon>
                    }
                    @if (isSaving()) {
                      <lucide-icon [img]="refreshIcon" [size]="16" class="animate-spin"></lucide-icon>
                    }
                    <span>{{ editingEvent() ? 'Update Event' : 'Create Event' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>

    <app-confirmation-modal
      [isVisible]="showConfirmModal()"
      [title]="confirmModalConfig().title"
      [message]="confirmModalConfig().message"
      [confirmText]="confirmModalConfig().confirmText"
      (confirm)="onConfirm()"
      (cancel)="onCancelConfirm()" />
    `,
  styles: []
})
export class ContentManagementComponent implements OnInit {
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  // Lucide icons
  readonly fileTextIcon = FileText;
  readonly calendarIcon = Calendar;
  readonly plusIcon = Plus;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly saveIcon = Save;
  readonly xIcon = X;
  readonly refreshIcon = RefreshCw;
  readonly alertIcon = AlertCircle;
  readonly arrowLeftIcon = X; // Using X as back arrow for now

  // Confirmation modal
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{ title: string; message: string; confirmText: string; action: () => void }>({ title: '', message: '', confirmText: 'Confirm', action: () => {} });

  openConfirm(title: string, message: string, confirmText: string, action: () => void) {
    this.confirmModalConfig.set({ title, message, confirmText, action });
    this.showConfirmModal.set(true);
  }
  onConfirm() { this.confirmModalConfig().action(); this.showConfirmModal.set(false); }
  onCancelConfirm() { this.showConfirmModal.set(false); }

  // State
  isLoading = signal(false);
  isSaving = signal(false);
  activeTab = signal<'articles' | 'events'>('articles');
  
  stats = signal({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalEvents: 0
  });

  articles = signal<any[]>([]);
  events = signal<any[]>([]);

  // Modals
  showArticleModal = signal(false);
  showEventModal = signal(false);
  editingArticle = signal<any>(null);
  editingEvent = signal<any>(null);

  // Forms
  articleForm = {
    title: '',
    excerpt: '',
    content: '',
    isPublished: false
  };

  eventForm = {
    title: '',
    description: '',
    eventDate: '',
    location: '',
    isPublished: false
  };

  get minEventDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
  }

  ngOnInit() {
    this.loadData();
  }

  refreshData() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);
    this.loadStats();
    this.loadArticles();
    this.loadEvents();
  }

  private loadStats() {
    // Mock data for now - replace with actual API call
    this.stats.set({
      totalArticles: 12,
      publishedArticles: 8,
      draftArticles: 4,
      totalEvents: 6
    });
  }

  private loadArticles() {
    // Mock data for now - replace with actual API call
    const mockArticles = [
      {
        id: '1',
        title: 'IHCAE Alumni Reunion 2024',
        excerpt: 'Join us for the annual alumni reunion...',
        content: 'Full article content...',
        isPublished: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
        authorName: 'Admin User'
      },
      {
        id: '2',
        title: 'New Scholarship Program',
        excerpt: 'We are excited to announce...',
        content: 'Full article content...',
        isPublished: false,
        createdAt: new Date('2024-01-20'),
        authorName: 'Admin User'
      }
    ];
    this.articles.set(mockArticles);
  }

  private loadEvents() {
    // Mock data for now - replace with actual API call
    const mockEvents = [
      {
        id: '1',
        title: 'Career Development Workshop',
        description: 'Learn about career advancement...',
        eventDate: new Date('2024-02-15'),
        location: 'IHCAE Campus',
        isPublished: true,
        createdAt: new Date('2024-01-10'),
        authorName: 'Admin User'
      },
      {
        id: '2',
        title: 'Networking Event',
        description: 'Connect with fellow alumni...',
        eventDate: new Date('2024-03-20'),
        location: 'Downtown Conference Center',
        isPublished: false,
        createdAt: new Date('2024-01-25'),
        authorName: 'Admin User'
      }
    ];
    this.events.set(mockEvents);
  }

  setActiveTab(tab: 'articles' | 'events') {
    this.activeTab.set(tab);
  }

  getFilteredArticles() {
    return this.articles();
  }

  getFilteredEvents() {
    return this.events();
  }

  createArticle() {
    this.articleForm = {
      title: '',
      excerpt: '',
      content: '',
      isPublished: false
    };
    this.editingArticle.set(null);
    this.showArticleModal.set(true);
  }

  editArticle(article: any) {
    this.articleForm = {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      isPublished: article.isPublished
    };
    this.editingArticle.set(article);
    this.showArticleModal.set(true);
  }

  async saveArticle() {
    this.isSaving.set(true);
    
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.notificationService.showSuccess(
        'Article Saved', 
        this.editingArticle() ? 'Article updated successfully' : 'Article created successfully'
      );
      
      this.closeArticleModal();
      this.loadArticles();
      this.loadStats();
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to save article');
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteArticle(article: any) {
    this.openConfirm(
      'Delete Article',
      `Delete "${article.title}"? This cannot be undone.`,
      'Delete',
      () => {
        // Mock delete - replace with actual API call
        this.notificationService.showSuccess('Article Deleted', 'Article has been deleted successfully');
        this.loadArticles();
        this.loadStats();
      }
    );
  }

  closeArticleModal() {
    this.showArticleModal.set(false);
    this.editingArticle.set(null);
  }

  createEvent() {
    this.eventForm = {
      title: '',
      description: '',
      eventDate: '',
      location: '',
      isPublished: false
    };
    this.editingEvent.set(null);
    this.showEventModal.set(true);
  }

  editEvent(event: any) {
    this.eventForm = {
      title: event.title,
      description: event.description,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      isPublished: event.isPublished
    };
    this.editingEvent.set(event);
    this.showEventModal.set(true);
  }

  async saveEvent() {
    this.isSaving.set(true);
    
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.notificationService.showSuccess(
        'Event Saved', 
        this.editingEvent() ? 'Event updated successfully' : 'Event created successfully'
      );
      
      this.closeEventModal();
      this.loadEvents();
      this.loadStats();
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to save event');
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteEvent(event: any) {
    this.openConfirm(
      'Delete Event',
      `Delete "${event.title}"? This cannot be undone.`,
      'Delete',
      () => {
        // Mock delete - replace with actual API call
        this.notificationService.showSuccess('Event Deleted', 'Event has been deleted successfully');
        this.loadEvents();
        this.loadStats();
      }
    );
  }

  closeEventModal() {
    this.showEventModal.set(false);
    this.editingEvent.set(null);
  }

  formatDate(date: any): string {
    if (!date) return '';
    let d = typeof date === 'string' ? new Date(date.endsWith('Z') ? date : date + 'Z') : new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(d);
  }
}
