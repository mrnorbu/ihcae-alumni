import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Newspaper, Calendar, Plus, Edit, Trash2, Eye, RefreshCw, Users, Download, CheckCircle, XCircle } from 'lucide-angular';
import { NewsService } from '../../news-events/services/news.service';
import { EventsService } from '../../news-events/services/events.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { CustomSelectComponent, SelectOption } from '../../../shared/components';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { AppImageUrlPipe } from '../../../shared/pipes/app-image-url.pipe';
import type { NewsArticleSummary, NewsCategory, CreateNewsArticleRequest, UpdateNewsArticleRequest } from '../../news-events/models';
import type { EventSummary, EventCategory, CreateEventRequest, UpdateEventRequest, EventRegistration } from '../../news-events/models';

@Component({
  selector: 'app-news-events-management',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ConfirmationModalComponent, CustomSelectComponent, AppImageUrlPipe],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">News & Events</h1>
          <p class="text-sm text-neutral-500">Create and manage news articles and events</p>
        </div>
        <button (click)="refreshData()" [disabled]="isLoading()"
          class="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors">
          <lucide-icon [img]="refreshIcon" [size]="18" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white border border-neutral-200 rounded-xl">
        <div class="border-b border-neutral-200">
          <nav class="flex gap-6 px-4">
            <button (click)="activeTab.set('news')"
              class="py-3 border-b-2 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              [class.border-neutral-900]="activeTab() === 'news'"
              [class.text-neutral-900]="activeTab() === 'news'"
              [class.border-transparent]="activeTab() !== 'news'"
              [class.text-neutral-400]="activeTab() !== 'news'">
              <lucide-icon [img]="newspaperIcon" [size]="16"></lucide-icon>
              News Articles
              <span class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                [class.bg-neutral-900]="activeTab() === 'news'" [class.text-white]="activeTab() === 'news'"
                [class.bg-neutral-100]="activeTab() !== 'news'" [class.text-neutral-500]="activeTab() !== 'news'">
                {{ articles().length }}
              </span>
            </button>
            <button (click)="activeTab.set('events')"
              class="py-3 border-b-2 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              [class.border-neutral-900]="activeTab() === 'events'"
              [class.text-neutral-900]="activeTab() === 'events'"
              [class.border-transparent]="activeTab() !== 'events'"
              [class.text-neutral-400]="activeTab() !== 'events'">
              <lucide-icon [img]="calendarIcon" [size]="16"></lucide-icon>
              Events
              <span class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                [class.bg-neutral-900]="activeTab() === 'events'" [class.text-white]="activeTab() === 'events'"
                [class.bg-neutral-100]="activeTab() !== 'events'" [class.text-neutral-500]="activeTab() !== 'events'">
                {{ events().length }}
              </span>
            </button>
          </nav>
        </div>

        <!-- News Tab -->
        @if (activeTab() === 'news') {
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-neutral-500">{{ articles().length }} articles</p>
              <button (click)="openArticleModal()" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon> New Article
              </button>
            </div>

            @if (isLoading()) {
              <div class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
              </div>
            } @else if (articles().length === 0) {
              <div class="text-center py-10">
                <lucide-icon [img]="newspaperIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
                <p class="text-sm font-medium text-neutral-500">No articles yet</p>
                <p class="text-xs text-neutral-400 mt-0.5">Create your first news article</p>
              </div>
            } @else {
              <div class="space-y-2.5">
                @for (article of articles(); track article.id) {
                  <div class="flex items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ article.title }}</h3>
                        @if ($any(article.status) === 'Published' || $any(article.status) === 2) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Published</span>
                        }
                        @if ($any(article.status) === 'PendingReview' || $any(article.status) === 1) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                        }
                        @if ($any(article.status) === 'Draft' || $any(article.status) === 0) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">Draft</span>
                        }
                      </div>
                      <div class="flex items-center gap-3 text-xs text-neutral-400">
                        <span>{{ article.author.firstName }} {{ article.author.lastName }}</span>
                        <span>{{ formatDate(article.createdAt) }}</span>
                        @if (article.category) {
                          <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-medium">{{ article.category.name }}</span>
                        }
                        <span>{{ article.viewCount }} views</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-3">
                      <button (click)="viewArticle(article.slug)" title="View" class="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors">
                        <lucide-icon [img]="eyeIcon" [size]="15"></lucide-icon>
                      </button>
                      <button (click)="openEditArticleModal(article)" title="Edit" class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                        <lucide-icon [img]="editIcon" [size]="15"></lucide-icon>
                      </button>
                      <button (click)="deleteArticle(article)" title="Delete" class="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <lucide-icon [img]="trashIcon" [size]="15"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Events Tab -->
        @if (activeTab() === 'events') {
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <p class="text-sm text-neutral-500">{{ events().length }} events</p>
              <button (click)="openEventModal()" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                <lucide-icon [img]="plusIcon" [size]="16"></lucide-icon> New Event
              </button>
            </div>

            @if (isLoadingEvents()) {
              <div class="flex justify-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600"></div>
              </div>
            } @else if (events().length === 0) {
              <div class="text-center py-10">
                <lucide-icon [img]="calendarIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
                <p class="text-sm font-medium text-neutral-500">No events yet</p>
                <p class="text-xs text-neutral-400 mt-0.5">Create your first event</p>
              </div>
            } @else {
              <div class="space-y-2.5">
                @for (event of events(); track event.id) {
                  <div class="flex items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-sm font-semibold text-neutral-900 truncate">{{ event.title }}</h3>
                        @if ($any(event.status) === 'Published' || $any(event.status) === 2) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Published</span>
                        }
                        @if ($any(event.status) === 'PendingReview' || $any(event.status) === 1) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                        }
                        @if ($any(event.status) === 'Draft' || $any(event.status) === 0) {
                          <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">Draft</span>
                        }
                      </div>
                      <div class="flex items-center gap-3 text-xs text-neutral-400">
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="calendarIcon" [size]="12"></lucide-icon>
                          {{ formatDate(event.eventDate) }}
                        </span>
                        <span>{{ event.location }}</span>
                        @if (event.category) {
                          <span class="px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 text-xs font-medium">{{ event.category.name }}</span>
                        }
                        <span class="inline-flex items-center gap-1">
                          <lucide-icon [img]="usersIcon" [size]="12"></lucide-icon>
                          {{ event.registrationCount }} registered
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 ml-3">
                      @if (event.registrationCount > 0) {
                        <button (click)="viewRegistrations(event)" title="Registrations" class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="usersIcon" [size]="15"></lucide-icon>
                        </button>
                      }
                      <button (click)="viewEvent(event.slug)" title="View" class="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors">
                        <lucide-icon [img]="eyeIcon" [size]="15"></lucide-icon>
                      </button>
                      <button (click)="openEditEventModal(event)" title="Edit" class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                        <lucide-icon [img]="editIcon" [size]="15"></lucide-icon>
                      </button>
                      <button (click)="deleteEvent(event)" title="Delete" class="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <lucide-icon [img]="trashIcon" [size]="15"></lucide-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Article Create/Edit Modal -->
    @if (showArticleModal()) {
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[60]" (click)="closeArticleModal()">
        <div class="bg-white rounded-2xl border border-neutral-100 max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl transition-all" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <h3 class="text-base font-bold text-neutral-900">{{ editingArticleId ? 'Edit Article' : 'New Article' }}</h3>
            <button (click)="closeArticleModal()" class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Title</label>
              <input type="text" [(ngModel)]="articleForm.title" 
                class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                placeholder="Article title" />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Content</label>
              <textarea [(ngModel)]="articleForm.content" rows="6" 
                class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400 resize-none" 
                placeholder="Write your article..."></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Category</label>
              <app-custom-select
                [options]="newsCategoryOptions()"
                [(ngModel)]="articleForm.categoryId"
                placeholder="Select category"
                customClass="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white transition-all text-left text-neutral-700 flex items-center justify-between gap-1.5"
              ></app-custom-select>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Cover Image</label>
              
              @if (articleForm.imageUrl) {
                <div class="relative rounded-xl overflow-hidden border border-neutral-100 aspect-video bg-neutral-50 shadow-sm group">
                  <img [src]="articleForm.imageUrl | appImageUrl" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                    <button type="button" (click)="articleForm.imageUrl = ''" 
                      class="px-4 py-2 text-xs font-semibold bg-white text-red-600 rounded-lg shadow-md hover:bg-neutral-50 transition-all active:scale-[0.95]">
                      Remove Image
                    </button>
                    <span class="text-[10px] text-white/80 font-medium truncate max-w-[80%] px-2">{{ articleForm.imageUrl }}</span>
                  </div>
                </div>
              } @else {
                <div class="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-neutral-300 transition-colors cursor-pointer relative bg-neutral-50/50 group">
                  @if (isUploadingArticleImage()) {
                    <div class="py-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-2"></div>
                      <span class="block text-xs font-semibold text-neutral-600">Uploading image...</span>
                    </div>
                  } @else {
                    <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" (change)="onArticleImageSelected($event)" />
                    <svg class="w-8 h-8 text-neutral-400 mx-auto mb-2 group-hover:text-neutral-500 transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H2.25A1.5 1.5 0 00.75 6v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span class="block text-xs font-semibold text-neutral-700">Upload cover image</span>
                    <span class="block text-[10px] text-neutral-400 mt-1">Click or drag and drop PNG, JPG, or WebP</span>
                  }
                </div>
              }
              
              <!-- Text URL Input Fallback -->
              <div class="mt-2">
                <details class="group">
                  <summary class="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 cursor-pointer list-none flex items-center gap-1 focus:outline-none">
                    <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    Or enter image URL directly
                  </summary>
                  <div class="mt-2">
                    <input type="text" [(ngModel)]="articleForm.imageUrl" 
                      class="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                      placeholder="https://example.com/image.jpg" />
                  </div>
                </details>
              </div>
            </div>

            <!-- Publish switch toggler -->
            <div class="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <div class="flex flex-col pr-4">
                <span class="text-sm font-semibold text-neutral-900">Publish immediately</span>
                <span class="text-xs text-neutral-500 mt-0.5">Make this article visible to all alumni right away</span>
              </div>
              <button type="button" (click)="articleForm.publish = !articleForm.publish"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                [class.bg-neutral-900]="articleForm.publish"
                [class.bg-neutral-200]="!articleForm.publish">
                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="articleForm.publish"
                  [class.translate-x-0]="!articleForm.publish"></span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 rounded-b-2xl shrink-0">
            <button (click)="closeArticleModal()" 
              class="px-4 py-2.5 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98]">Cancel</button>
            <button (click)="saveArticle()" [disabled]="!articleForm.title.trim() || !articleForm.content.trim() || !articleForm.categoryId || isSaving()"
              class="px-5 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-all duration-200 hover:shadow-md active:scale-[0.98] inline-flex items-center justify-center">
              @if (isSaving()) {
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white inline-block mr-2"></div>
              }
              {{ editingArticleId ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Event Create/Edit Modal -->
    @if (showEventModal()) {
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[60]" (click)="closeEventModal()">
        <div class="bg-white rounded-2xl border border-neutral-100 max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl transition-all" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <h3 class="text-base font-bold text-neutral-900">{{ editingEventId ? 'Edit Event' : 'New Event' }}</h3>
            <button (click)="closeEventModal()" class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form Body -->
          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Title</label>
              <input type="text" [(ngModel)]="eventForm.title" 
                class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                placeholder="Event title" />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Description</label>
              <textarea [(ngModel)]="eventForm.description" rows="4" 
                class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400 resize-none" 
                placeholder="Event description..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Event Date</label>
                <input type="datetime-local" [(ngModel)]="eventForm.eventDate" [min]="minEventDate"
                  class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">End Date (optional)</label>
                <input type="datetime-local" [(ngModel)]="eventForm.eventEndDate" [min]="eventForm.eventDate || minEventDate"
                  class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all bg-white" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Location</label>
              <input type="text" [(ngModel)]="eventForm.location" 
                class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                placeholder="Event location" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Category</label>
                <app-custom-select
                  [options]="eventCategoryOptions()"
                  [(ngModel)]="eventForm.categoryId"
                  placeholder="Select category"
                  customClass="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white transition-all text-left text-neutral-700 flex items-center justify-between gap-1.5"
                ></app-custom-select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Capacity</label>
                <input type="number" [(ngModel)]="eventForm.capacity" 
                  class="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                  placeholder="0 = unlimited" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Cover Image</label>
              
              @if (eventForm.imageUrl) {
                <div class="relative rounded-xl overflow-hidden border border-neutral-100 aspect-video bg-neutral-50 shadow-sm group">
                  <img [src]="eventForm.imageUrl | appImageUrl" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                    <button type="button" (click)="eventForm.imageUrl = ''" 
                      class="px-4 py-2 text-xs font-semibold bg-white text-red-600 rounded-lg shadow-md hover:bg-neutral-50 transition-all active:scale-[0.95]">
                      Remove Image
                    </button>
                    <span class="text-[10px] text-white/80 font-medium truncate max-w-[80%] px-2">{{ eventForm.imageUrl }}</span>
                  </div>
                </div>
              } @else {
                <div class="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center hover:border-neutral-300 transition-colors cursor-pointer relative bg-neutral-50/50 group">
                  @if (isUploadingEventImage()) {
                    <div class="py-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-2"></div>
                      <span class="block text-xs font-semibold text-neutral-600">Uploading image...</span>
                    </div>
                  } @else {
                    <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" (change)="onEventImageSelected($event)" />
                    <svg class="w-8 h-8 text-neutral-400 mx-auto mb-2 group-hover:text-neutral-500 transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H2.25A1.5 1.5 0 00.75 6v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span class="block text-xs font-semibold text-neutral-700">Upload cover image</span>
                    <span class="block text-[10px] text-neutral-400 mt-1">Click or drag and drop PNG, JPG, or WebP</span>
                  }
                </div>
              }
              
              <!-- Text URL Input Fallback -->
              <div class="mt-2">
                <details class="group">
                  <summary class="text-[11px] font-medium text-neutral-400 hover:text-neutral-600 cursor-pointer list-none flex items-center gap-1 focus:outline-none">
                    <svg class="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    Or enter image URL directly
                  </summary>
                  <div class="mt-2">
                    <input type="text" [(ngModel)]="eventForm.imageUrl" 
                      class="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder-neutral-400" 
                      placeholder="https://example.com/image.jpg" />
                  </div>
                </details>
              </div>
            </div>

            <!-- Publish switch toggler -->
            <div class="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <div class="flex flex-col pr-4">
                <span class="text-sm font-semibold text-neutral-900">Publish immediately</span>
                <span class="text-xs text-neutral-500 mt-0.5">Make this event visible to all alumni right away</span>
              </div>
              <button type="button" (click)="eventForm.publish = !eventForm.publish"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                [class.bg-neutral-900]="eventForm.publish"
                [class.bg-neutral-200]="!eventForm.publish">
                <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="eventForm.publish"
                  [class.translate-x-0]="!eventForm.publish"></span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 rounded-b-2xl shrink-0">
            <button (click)="closeEventModal()" 
              class="px-4 py-2.5 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 active:scale-[0.98]">Cancel</button>
            <button (click)="saveEvent()" [disabled]="!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.location.trim() || !eventForm.eventDate || isSaving()"
              class="px-5 py-2.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-all duration-200 hover:shadow-md active:scale-[0.98] inline-flex items-center justify-center">
              @if (isSaving()) {
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white inline-block mr-2"></div>
              }
              {{ editingEventId ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Registrations Modal -->
    @if (showRegistrationsModal()) {
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center z-[60]" (click)="closeRegistrationsModal()">
        <div class="bg-white rounded-2xl border border-neutral-100 max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col shadow-2xl transition-all" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <div>
              <h3 class="text-base font-bold text-neutral-900">Event Registrations</h3>
              <p class="text-xs text-neutral-400 mt-0.5">{{ registrations().length }} registered</p>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="exportRegistrations()" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-all active:scale-[0.98]">
                <lucide-icon [img]="downloadIcon" [size]="13"></lucide-icon> Export CSV
              </button>
              <button (click)="closeRegistrationsModal()" class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-1.5 rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1 p-6 space-y-3">
            @if (registrations().length === 0) {
              <div class="text-center py-10">
                <lucide-icon [img]="usersIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
                <p class="text-sm font-medium text-neutral-500">No registrations yet</p>
              </div>
            } @else {
              <div class="grid gap-3 sm:grid-cols-2">
                @for (reg of registrations(); track reg.id) {
                  <div class="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <div class="min-w-0 pr-2">
                      <p class="text-sm font-semibold text-neutral-900 truncate">{{ reg.name }}</p>
                      <p class="text-xs text-neutral-400 truncate mt-0.5">{{ reg.email }}</p>
                      @if (reg.phone) {
                        <p class="text-xs text-neutral-400 truncate mt-0.5">{{ reg.phone }}</p>
                      }
                    </div>
                    <div class="text-right shrink-0">
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block border"
                        [class.bg-green-50]="reg.status === 'Confirmed'" [class.text-green-700]="reg.status === 'Confirmed'" [class.border-green-200]="reg.status === 'Confirmed'"
                        [class.bg-amber-50]="reg.status === 'Waitlist'" [class.text-amber-700]="reg.status === 'Waitlist'" [class.border-amber-200]="reg.status === 'Waitlist'">
                        {{ reg.status }}
                      </span>
                      <p class="text-[10px] text-neutral-400 mt-1.5">{{ formatDate(reg.registrationDate) }}</p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }

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
export class NewsEventsManagementComponent implements OnInit {
  private newsService = inject(NewsService);
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private notificationService = inject(NotificationService);
  private fileUploadService = inject(FileUploadService);

  readonly newspaperIcon = Newspaper;
  readonly calendarIcon = Calendar;
  readonly plusIcon = Plus;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly eyeIcon = Eye;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly downloadIcon = Download;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;

  // Confirmation modal
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{ title: string; message: string; confirmText: string; action: () => void }>({ title: '', message: '', confirmText: 'Confirm', action: () => {} });

  openConfirm(title: string, message: string, confirmText: string, action: () => void) {
    this.confirmModalConfig.set({ title, message, confirmText, action });
    this.showConfirmModal.set(true);
  }
  onConfirm() { this.confirmModalConfig().action(); this.showConfirmModal.set(false); }
  onCancelConfirm() { this.showConfirmModal.set(false); }

  activeTab = signal<'news' | 'events'>('news');
  isLoading = signal(false);
  isLoadingEvents = signal(false);
  isSaving = signal(false);
  isUploadingArticleImage = signal(false);
  isUploadingEventImage = signal(false);

  articles = signal<NewsArticleSummary[]>([]);
  events = signal<EventSummary[]>([]);
  newsCategories = signal<NewsCategory[]>([]);
  eventCategories = signal<EventCategory[]>([]);

  newsCategoryOptions = computed<SelectOption[]>(() => {
    return [
      { label: 'Select category', value: '' },
      ...this.newsCategories().map(cat => ({ label: cat.name, value: cat.id }))
    ];
  });

  eventCategoryOptions = computed<SelectOption[]>(() => {
    return [
      { label: 'Select category', value: '' },
      ...this.eventCategories().map(cat => ({ label: cat.name, value: cat.id }))
    ];
  });

  // Article modal
  showArticleModal = signal(false);
  editingArticleId: number | null = null;
  articleForm = { title: '', content: '', categoryId: 0, imageUrl: '', publish: true };

  // Event modal
  showEventModal = signal(false);
  editingEventId: number | null = null;
  eventForm = { title: '', description: '', location: '', eventDate: '', eventEndDate: '', categoryId: 0, capacity: 0, imageUrl: '', publish: true };

  // Registrations modal
  showRegistrationsModal = signal(false);
  registrations = signal<EventRegistration[]>([]);
  registrationEventId: number | null = null;

  ngOnInit() {
    this.loadArticles();
    this.loadEvents();
    this.loadCategories();
  }

  refreshData() {
    this.loadArticles();
    this.loadEvents();
  }

  private loadArticles() {
    this.isLoading.set(true);
    this.newsService.getManagementArticles().subscribe({
      next: (result) => {
        this.articles.set(result);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load articles');
        this.isLoading.set(false);
      }
    });
  }

  private loadEvents() {
    this.isLoadingEvents.set(true);
    this.eventsService.getManagementEvents().subscribe({
      next: (result) => {
        this.events.set(result);
        this.isLoadingEvents.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load events');
        this.isLoadingEvents.set(false);
      }
    });
  }

  private loadCategories() {
    this.newsService.getCategories().subscribe({
      next: (cats) => this.newsCategories.set(cats),
      error: () => console.error('Failed to load news categories')
    });
    this.eventsService.getCategories().subscribe({
      next: (cats) => this.eventCategories.set(cats),
      error: () => console.error('Failed to load event categories')
    });
  }

  // === Article CRUD ===

  openArticleModal() {
    this.editingArticleId = null;
    this.articleForm = { title: '', content: '', categoryId: 0, imageUrl: '', publish: true };
    this.showArticleModal.set(true);
  }

  openEditArticleModal(article: NewsArticleSummary) {
    this.editingArticleId = article.id;
    this.newsService.getArticleById(article.id).subscribe({
      next: (full) => {
        this.articleForm = {
          title: full.title,
          content: full.content,
          categoryId: full.category?.id || 0,
          imageUrl: full.imageUrl || '',
          publish: full.status === 'Published'
        };
        this.showArticleModal.set(true);
      },
      error: () => this.notificationService.showError('Error', 'Failed to load article details')
    });
  }

  closeArticleModal() {
    this.showArticleModal.set(false);
    this.editingArticleId = null;
  }

  saveArticle() {
    if (!this.articleForm.title.trim() || !this.articleForm.content.trim() || !this.articleForm.categoryId) return;

    this.isSaving.set(true);
    const request: CreateNewsArticleRequest = {
      title: this.articleForm.title.trim(),
      content: this.articleForm.content.trim(),
      categoryId: this.articleForm.categoryId,
      imageUrl: this.articleForm.imageUrl.trim() || undefined,
      publish: this.articleForm.publish
    };

    if (this.editingArticleId) {
      this.newsService.updateArticle(this.editingArticleId, request as UpdateNewsArticleRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Updated', 'Article updated successfully');
          this.closeArticleModal();
          this.loadArticles();
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.showError('Error', 'Failed to update article');
        }
      });
    } else {
      this.newsService.createArticle(request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Created', 'Article created successfully');
          this.closeArticleModal();
          this.loadArticles();
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.showError('Error', 'Failed to create article');
        }
      });
    }
  }

  viewArticle(slug: string) {
    this.router.navigate([`/news/${slug}`]);
  }

  deleteArticle(article: NewsArticleSummary) {
    this.openConfirm(
      'Delete Article',
      `Delete "${article.title}"? This cannot be undone.`,
      'Delete',
      () => this.newsService.deleteArticle(article.id).subscribe({
        next: () => { this.notificationService.showSuccess('Deleted', 'Article deleted'); this.loadArticles(); },
        error: () => this.notificationService.showError('Error', 'Failed to delete article')
      })
    );
  }

  // === Event CRUD ===

  openEventModal() {
    this.editingEventId = null;
    this.eventForm = { title: '', description: '', location: '', eventDate: '', eventEndDate: '', categoryId: 0, capacity: 0, imageUrl: '', publish: true };
    this.showEventModal.set(true);
  }

  openEditEventModal(event: EventSummary) {
    this.editingEventId = event.id;
    this.eventsService.getEventById(event.id).subscribe({
      next: (full) => {
        this.eventForm = {
          title: full.title,
          description: full.description,
          location: full.location,
          eventDate: this.toDatetimeLocal(full.eventDate),
          eventEndDate: full.eventEndDate ? this.toDatetimeLocal(full.eventEndDate) : '',
          categoryId: full.category?.id || 0,
          capacity: full.capacity || 0,
          imageUrl: full.imageUrl || '',
          publish: full.status === 'Published'
        };
        this.showEventModal.set(true);
      },
      error: () => this.notificationService.showError('Error', 'Failed to load event details')
    });
  }

  closeEventModal() {
    this.showEventModal.set(false);
    this.editingEventId = null;
  }

  saveEvent() {
    if (!this.eventForm.title.trim() || !this.eventForm.description.trim() || !this.eventForm.location.trim() || !this.eventForm.eventDate) return;

    this.isSaving.set(true);
    const request: CreateEventRequest = {
      title: this.eventForm.title.trim(),
      description: this.eventForm.description.trim(),
      location: this.eventForm.location.trim(),
      eventDate: new Date(this.eventForm.eventDate),
      eventEndDate: this.eventForm.eventEndDate ? new Date(this.eventForm.eventEndDate) : undefined,
      categoryId: this.eventForm.categoryId || undefined,
      capacity: this.eventForm.capacity || undefined,
      imageUrl: this.eventForm.imageUrl.trim() || undefined,
      publish: this.eventForm.publish
    };

    if (this.editingEventId) {
      this.eventsService.updateEvent(this.editingEventId, request as UpdateEventRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Updated', 'Event updated successfully');
          this.closeEventModal();
          this.loadEvents();
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.showError('Error', 'Failed to update event');
        }
      });
    } else {
      this.eventsService.createEvent(request).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Created', 'Event created successfully');
          this.closeEventModal();
          this.loadEvents();
        },
        error: () => {
          this.isSaving.set(false);
          this.notificationService.showError('Error', 'Failed to create event');
        }
      });
    }
  }

  viewEvent(slug: string) {
    this.router.navigate([`/events/${slug}`]);
  }

  deleteEvent(event: EventSummary) {
    this.openConfirm(
      'Delete Event',
      `Delete "${event.title}"? This cannot be undone.`,
      'Delete',
      () => this.eventsService.deleteEvent(event.id).subscribe({
        next: () => { this.notificationService.showSuccess('Deleted', 'Event deleted'); this.loadEvents(); },
        error: () => this.notificationService.showError('Error', 'Failed to delete event')
      })
    );
  }

  // === Registrations ===

  viewRegistrations(event: EventSummary) {
    this.registrationEventId = event.id;
    this.registrations.set([]);
    this.showRegistrationsModal.set(true);

    this.eventsService.getEventRegistrations(event.id).subscribe({
      next: (result) => this.registrations.set(result.items),
      error: () => this.notificationService.showError('Error', 'Failed to load registrations')
    });
  }

  closeRegistrationsModal() {
    this.showRegistrationsModal.set(false);
    this.registrations.set([]);
  }

  exportRegistrations() {
    this.eventsService.exportRegistrationsCsv(this.registrationEventId!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${this.registrationEventId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.showError('Error', 'Failed to export registrations')
    });
  }

  // === Helpers ===

  get minEventDate(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
  }

  private toDatetimeLocal(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  // === Image Upload Handlers ===

  onArticleImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploadingArticleImage.set(true);
      this.fileUploadService.uploadContentImage(file, 'news').subscribe({
        next: (res) => {
          if (res.success && res.imageUrl) {
            this.articleForm.imageUrl = res.imageUrl;
            this.notificationService.showSuccess('Uploaded', 'Cover image uploaded successfully');
          } else {
            this.notificationService.showError('Upload Failed', res.message || 'Could not upload image');
          }
          this.isUploadingArticleImage.set(false);
        },
        error: () => {
          this.notificationService.showError('Error', 'An error occurred during file upload');
          this.isUploadingArticleImage.set(false);
        }
      });
    }
  }

  onEventImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.isUploadingEventImage.set(true);
      this.fileUploadService.uploadContentImage(file, 'event').subscribe({
        next: (res) => {
          if (res.success && res.imageUrl) {
            this.eventForm.imageUrl = res.imageUrl;
            this.notificationService.showSuccess('Uploaded', 'Cover image uploaded successfully');
          } else {
            this.notificationService.showError('Upload Failed', res.message || 'Could not upload image');
          }
          this.isUploadingEventImage.set(false);
        },
        error: () => {
          this.notificationService.showError('Error', 'An error occurred during file upload');
          this.isUploadingEventImage.set(false);
        }
      });
    }
  }
}
