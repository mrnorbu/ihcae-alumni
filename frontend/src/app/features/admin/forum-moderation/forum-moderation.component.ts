import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, forkJoin, catchError, of, switchMap, Observable } from 'rxjs';
import { ForumService } from '../../forums/services/forum.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomSelectComponent, SelectOption } from '../../../shared/components';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { TopicSummaryDto, TopicDetailDto, PostDto } from '../../../shared/models';
import {
  LucideAngularModule,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Users,
  MessageCircle,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  CornerDownRight,
  ChevronDown
} from 'lucide-angular';

@Component({
  selector: 'app-forum-moderation',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ConfirmationModalComponent, CustomSelectComponent],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Forum Moderation</h1>
          <p class="text-sm text-neutral-500">Manage topics, posts, and community discussions</p>
        </div>
        <button (click)="refreshData()" [disabled]="isLoading()"
          class="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors">
          <lucide-icon [img]="refreshIcon" [size]="18" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <lucide-icon [img]="messageSquareIcon" [size]="18" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ stats().totalTopics }}</p>
              <p class="text-xs text-neutral-500">Topics</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <lucide-icon [img]="messageCircleIcon" [size]="18" class="text-green-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ stats().totalPosts }}</p>
              <p class="text-xs text-neutral-500">Posts</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <lucide-icon [img]="usersIcon" [size]="18" class="text-purple-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ stats().activeUsers }}</p>
              <p class="text-xs text-neutral-500">Contributors</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <lucide-icon [img]="trendingIcon" [size]="18" class="text-orange-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ stats().pinnedTopics }}</p>
              <p class="text-xs text-neutral-500">Pinned</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 border-b border-neutral-200">
        <button (click)="activeTab.set('topics')" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          [class]="activeTab() === 'topics' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
          Topics
        </button>
        <button (click)="activeTab.set('flags'); loadFlags()" class="px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5"
          [class]="activeTab() === 'flags' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'">
          Flagged Content
          @if (flagCount() > 0) {
            <span class="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">{{ flagCount() }}</span>
          }
        </button>
      </div>

      @if (activeTab() === 'topics') {
      <!-- Search & Filters -->
      <div class="bg-white border border-neutral-200 rounded-xl p-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1 relative">
            <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
              placeholder="Search topics..."
              class="w-full pl-11 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          </div>
          <div class="flex items-center gap-2">
            <div class="w-[140px]">
              <app-custom-select
                [options]="topicStatusOptions"
                [(ngModel)]="selectedStatus"
                (ngModelChange)="applyFilters()"
                customClass="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700"
              ></app-custom-select>
            </div>
            <div class="w-[150px]">
              <app-custom-select
                [options]="topicSortOptions"
                [(ngModel)]="selectedSort"
                (ngModelChange)="applyFilters()"
                customClass="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700"
              ></app-custom-select>
            </div>
            <button (click)="clearFilters()"
              class="flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon>
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Topics Table -->
      <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          @if (getFilteredTopics().length > 0) {
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-neutral-100">
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Topic</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                  <th class="text-center py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Posts</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Last Activity</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th class="text-right py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-50">
                @for (topic of getFilteredTopics(); track topic.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                          @if (topic.createdBy.profileImageUrl && !isDefaultImage(topic.createdBy.profileImageUrl)) {
                            <img [src]="topic.createdBy.profileImageUrl" class="w-8 h-8 rounded-full object-cover" />
                          }
                          @if (!topic.createdBy.profileImageUrl || isDefaultImage(topic.createdBy.profileImageUrl)) {
                            <span class="text-xs font-semibold text-neutral-500">{{ topic.createdBy.firstName.charAt(0) }}{{ topic.createdBy.lastName.charAt(0) }}</span>
                          }
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5">
                            <span class="text-sm font-medium text-neutral-900 truncate">{{ topic.title }}</span>
                            @if (topic.isPinned) { <lucide-icon [img]="pinIcon" [size]="13" class="text-blue-500 shrink-0"></lucide-icon> }
                            @if (topic.isLocked) { <lucide-icon [img]="lockIcon" [size]="13" class="text-red-500 shrink-0"></lucide-icon> }
                          </div>
                          <div class="flex items-center gap-1.5 mt-0.5">
                            @for (tag of topic.tags.slice(0, 2); track tag.id) {
                              <span class="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded text-xs">{{ tag.name }}</span>
                            }
                            @if (topic.tags && topic.tags.length > 2) {
                              <span class="text-xs text-neutral-400">+{{ topic.tags.length - 2 }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 hidden md:table-cell">
                      <p class="text-sm font-medium text-neutral-700">{{ topic.createdBy.firstName }} {{ topic.createdBy.lastName }}</p>
                      <p class="text-xs text-neutral-400">{{ formatDate(topic.createdAt) }}</p>
                    </td>
                    <td class="py-3 px-4 text-center hidden sm:table-cell">
                      <span class="text-sm font-semibold text-neutral-700">{{ topic.postCount }}</span>
                    </td>
                    <td class="py-3 px-4 hidden lg:table-cell">
                      <span class="text-sm text-neutral-500">{{ formatDate(topic.lastReplyAt || topic.createdAt) }}</span>
                    </td>
                    <td class="py-3 px-4 hidden sm:table-cell">
                      @if (topic.isPinned) {
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">Pinned</span>
                      }
                      @if (topic.isLocked) {
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">Locked</span>
                      }
                      @if (!topic.isPinned && !topic.isLocked) {
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">Normal</span>
                      }
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-0.5">
                        <button (click)="viewTopic(topic)" title="View"
                          class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="eyeIcon" [size]="15"></lucide-icon>
                        </button>
                        <button (click)="togglePinTopic(topic)" [title]="topic.isPinned ? 'Unpin' : 'Pin'"
                          class="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                          [class.text-blue-500]="topic.isPinned"
                          [class.text-neutral-400]="!topic.isPinned">
                          <lucide-icon [img]="topic.isPinned ? unpinIcon : pinIcon" [size]="15"></lucide-icon>
                        </button>
                        <button (click)="toggleLockTopic(topic)" [title]="topic.isLocked ? 'Unlock' : 'Lock'"
                          class="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                          [class.text-red-500]="topic.isLocked"
                          [class.text-neutral-400]="!topic.isLocked">
                          <lucide-icon [img]="topic.isLocked ? unlockIcon : lockIcon" [size]="15"></lucide-icon>
                        </button>
                        <button (click)="deleteTopic(topic)" title="Delete"
                          class="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <lucide-icon [img]="trashIcon" [size]="15"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          @if (getFilteredTopics().length === 0 && !isLoading()) {
            <div class="py-12 text-center">
              <lucide-icon [img]="messageSquareIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-600 mb-1">No topics found</p>
              <p class="text-sm text-neutral-400">
                @if (searchQuery || selectedStatus) { Try adjusting your search or filters. }
                @if (!searchQuery && !selectedStatus) { No forum topics yet. }
              </p>
            </div>
          }

          @if (isLoading()) {
            <div class="py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600 mx-auto mb-2"></div>
              <p class="text-sm text-neutral-400">Loading topics...</p>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <span class="text-sm text-neutral-500">{{ getFilteredTopics().length }} of {{ totalCount() }} topics</span>
            <div class="flex items-center gap-1.5">
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                class="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                Previous
              </button>
              <span class="text-sm text-neutral-500 px-2">{{ currentPage() }} / {{ totalPages() }}</span>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                class="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        }
      </div>
      } <!-- end topics tab -->

      @if (activeTab() === 'flags') {
      <!-- Flagged Content -->
      <div class="bg-white border border-neutral-200 rounded-xl">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 flex-wrap">
          <div class="w-[130px]">
            <app-custom-select
              [options]="flagStatusOptions"
              [(ngModel)]="flagFilter"
              (ngModelChange)="loadFlags()"
              customClass="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700"
            ></app-custom-select>
          </div>
          <div class="w-[140px]">
            <app-custom-select
              [options]="flagReasonOptions"
              [(ngModel)]="flagReasonFilter"
              customClass="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700"
            ></app-custom-select>
          </div>
        </div>

        <div class="rounded-b-xl overflow-hidden">
          @if (isLoadingFlags()) {
            <div class="py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600 mx-auto mb-2"></div>
              <p class="text-sm text-neutral-400">Loading flags...</p>
            </div>
          } @else if (getFilteredFlags().length === 0) {
            <div class="py-12 text-center">
              <lucide-icon [img]="alertTriangleIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-600 mb-1">No flagged content</p>
              <p class="text-sm text-neutral-400">No flags match the current filter.</p>
            </div>
          } @else {
            <div class="divide-y divide-neutral-50">
              @for (flag of getFilteredFlags(); track flag.id) {
                <div class="p-4 hover:bg-neutral-50 transition-colors">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          [class]="flag.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                   flag.status === 'ActionTaken' ? 'bg-red-50 text-red-600 border border-red-100' :
                                   flag.status === 'Dismissed' ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' :
                                   'bg-blue-50 text-blue-600 border border-blue-100'">
                          {{ flag.status }}
                        </span>
                        <span class="text-xs text-neutral-400">{{ flag.reason }}</span>
                        <span class="text-xs text-neutral-300">·</span>
                        <span class="text-xs text-neutral-400">{{ formatDate(flag.createdAt) }}</span>
                      </div>
                      <p class="text-sm text-neutral-700 line-clamp-2 mb-1">{{ flag.postContent }}</p>
                      <div class="flex items-center gap-3 text-xs text-neutral-400">
                        <span>Post by <strong class="text-neutral-600">{{ flag.postAuthorName }}</strong></span>
                        <span>in <strong class="text-neutral-600">{{ flag.topicTitle }}</strong></span>
                        <span>Flagged by {{ flag.flaggedByName }}</span>
                      </div>
                      @if (flag.details) {
                        <p class="text-xs text-neutral-500 mt-1 italic">"{{ flag.details }}"</p>
                      }
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button (click)="viewTopicById(flag.topicId, flag.topicTitle)" title="View Full Thread Context"
                        class="p-1.5 rounded-md text-neutral-450 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                        <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                      </button>
                      @if (flag.status === 'Pending') {
                        <button (click)="resolveFlag(flag.id, 'Dismissed')" title="Dismiss"
                          class="px-2.5 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                          Dismiss
                        </button>
                        <button (click)="openActionModal(flag)" title="Take Action"
                          class="px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Action
                        </button>
                      } @else {
                        <div class="flex items-center gap-1">
                          @if (flag.status === 'ActionTaken') {
                            <button (click)="restorePost(flag)" title="Restore Post & Re-open Flag"
                              class="px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                              Restore Post
                            </button>
                          }
                          <button (click)="reopenFlag(flag)" title="Re-open flag for review"
                            class="px-2.5 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 transition-colors">
                            Re-open
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
      } <!-- end flags tab -->
    </div>

    <!-- Topic Detail Modal -->
    @if (showTopicModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" (click)="closeTopicModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
            <h3 class="text-base font-bold text-neutral-900">Topic Details</h3>
            <button (click)="closeTopicModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          @if (isLoadingTopic()) {
            <div class="py-10 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600 mx-auto mb-2"></div>
              <p class="text-sm text-neutral-400">Loading posts...</p>
            </div>
          }

          @if (!isLoadingTopic() && selectedTopic()) {
            <div class="p-4 overflow-y-auto flex-1 space-y-4">
              <div class="border-b border-neutral-100 pb-3">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                    @if (selectedTopic()!.createdBy.profileImageUrl && !isDefaultImage(selectedTopic()!.createdBy.profileImageUrl ?? '')) {
                      <img [src]="selectedTopic()!.createdBy.profileImageUrl" class="w-10 h-10 rounded-full object-cover" />
                    }
                    @if (!selectedTopic()!.createdBy.profileImageUrl || isDefaultImage(selectedTopic()!.createdBy.profileImageUrl ?? '')) {
                      <span class="text-sm font-semibold text-neutral-500">{{ selectedTopic()!.createdBy.firstName.charAt(0) }}{{ selectedTopic()!.createdBy.lastName.charAt(0) }}</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-1">
                      <h4 class="text-base font-semibold text-neutral-900 truncate">{{ selectedTopic()!.title }}</h4>
                      @if (selectedTopic()!.isPinned) { <lucide-icon [img]="pinIcon" [size]="14" class="text-blue-500 shrink-0"></lucide-icon> }
                      @if (selectedTopic()!.isLocked) { <lucide-icon [img]="lockIcon" [size]="14" class="text-red-500 shrink-0"></lucide-icon> }
                    </div>
                    <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                      <span>{{ selectedTopic()!.createdBy.firstName }} {{ selectedTopic()!.createdBy.lastName }}</span>
                      <span class="text-neutral-300">·</span>
                      <span>{{ formatDate(selectedTopic()!.createdAt) }}</span>
                      <span class="text-neutral-300">·</span>
                      <span>{{ countAllPosts(selectedTopic()!.posts) }} posts</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Posts with nested replies -->
              <div class="space-y-2.5">
                @for (post of selectedTopic()!.posts; track post.id) {
                  <!-- Main post -->
                  <div class="border border-neutral-100 rounded-lg p-3">
                    <div class="flex items-start gap-2.5">
                      <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                        @if (post.author.profileImageUrl && !isDefaultImage(post.author.profileImageUrl)) {
                          <img [src]="post.author.profileImageUrl" class="w-8 h-8 rounded-full object-cover" />
                        }
                        @if (!post.author.profileImageUrl || isDefaultImage(post.author.profileImageUrl)) {
                          <span class="text-xs font-semibold text-neutral-500">{{ post.author.firstName.charAt(0) }}{{ post.author.lastName.charAt(0) }}</span>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <div>
                            <span class="text-sm font-medium text-neutral-800">{{ post.author.firstName }} {{ post.author.lastName }}</span>
                            <span class="text-xs text-neutral-400 ml-2">{{ formatDate(post.createdAt) }}</span>
                          </div>
                          <div class="flex items-center gap-0.5">
                            <button (click)="openEditModal(post)" title="Edit"
                              class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                              <lucide-icon [img]="editIcon" [size]="13"></lucide-icon>
                            </button>
                            <button (click)="deletePost(post)" title="Delete"
                              class="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <lucide-icon [img]="trashIcon" [size]="13"></lucide-icon>
                            </button>
                          </div>
                        </div>
                        <p class="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{{ post.content }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Nested replies -->
                  @if (post.replies && post.replies.length > 0) {
                    @for (reply of post.replies; track reply.id) {
                      <div class="ml-8 border border-neutral-100 rounded-lg p-3 bg-neutral-50/50">
                        <div class="flex items-start gap-2.5">
                          <div class="flex items-center gap-1 shrink-0">
                            <lucide-icon [img]="replyIcon" [size]="12" class="text-neutral-300"></lucide-icon>
                            <div class="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center">
                              @if (reply.author.profileImageUrl && !isDefaultImage(reply.author.profileImageUrl)) {
                                <img [src]="reply.author.profileImageUrl" class="w-7 h-7 rounded-full object-cover" />
                              }
                              @if (!reply.author.profileImageUrl || isDefaultImage(reply.author.profileImageUrl)) {
                                <span class="text-xs font-semibold text-neutral-500">{{ reply.author.firstName.charAt(0) }}{{ reply.author.lastName.charAt(0) }}</span>
                              }
                            </div>
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                              <div>
                                <span class="text-sm font-medium text-neutral-700">{{ reply.author.firstName }} {{ reply.author.lastName }}</span>
                                <span class="text-xs text-neutral-400 ml-2">{{ formatDate(reply.createdAt) }}</span>
                              </div>
                              <div class="flex items-center gap-0.5">
                                <button (click)="openEditModal(reply)" title="Edit"
                                  class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                                  <lucide-icon [img]="editIcon" [size]="12"></lucide-icon>
                                </button>
                                <button (click)="deletePost(reply)" title="Delete"
                                  class="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                  <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                                </button>
                              </div>
                            </div>
                            <p class="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{{ reply.content }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Edit Post Modal -->
    @if (showEditModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" (click)="closeEditModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
          <div class="p-5">
            <h3 class="text-base font-bold text-neutral-900 mb-1">Edit Post</h3>
            <p class="text-sm text-neutral-500 mb-4">Modify the post content as an admin:</p>

            <textarea
              [(ngModel)]="editContent"
              class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white resize-none mb-4"
              rows="6"
              placeholder="Post content..."
            ></textarea>

            <div class="flex justify-end gap-2">
              <button
                (click)="closeEditModal()"
                class="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                Cancel
              </button>
              <button
                (click)="confirmEdit()"
                [disabled]="!editContent.trim()"
                class="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Action Taken Moderation Modal -->
    @if (showActionModal()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" (click)="closeActionModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-xl w-full mx-4 max-h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-4 border-b border-neutral-100 shrink-0">
            <h3 class="text-base font-bold text-neutral-900">Moderate Flagged Content</h3>
            <button (click)="closeActionModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="p-4 overflow-y-auto flex-1 space-y-4 text-left">
            <!-- Simplified Flag Summary Info -->
            <div class="space-y-2 text-sm">
              <div class="flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-2">
                <span>By <strong class="text-neutral-700">{{ selectedFlag()?.postAuthorName }}</strong> · Flagged by {{ selectedFlag()?.flaggedByName }}</span>
                <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold">{{ selectedFlag()?.reason }}</span>
              </div>
              @if (selectedFlag()?.details) {
                <p class="text-xs text-neutral-500 italic bg-neutral-50 px-2 py-1 rounded">Flagger note: "{{ selectedFlag()?.details }}"</p>
              }
              <div class="border border-neutral-200 bg-neutral-50 rounded p-2.5 text-sm text-neutral-700 whitespace-pre-wrap max-h-24 overflow-y-auto italic">
                "{{ selectedFlag()?.postContent }}"
              </div>
            </div>

            <!-- Friendly Moderation Action Radios -->
             <div class="space-y-2">
               <label class="block text-sm font-semibold text-neutral-800">Select Moderation Action:</label>
               <div class="flex flex-col gap-1.5 pl-1">
                 <label class="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                   <input type="radio" name="modAction" value="delete_post"
                     [checked]="moderationAction() === 'delete_post'"
                     (change)="moderationAction.set('delete_post')"
                     class="h-4 w-4 text-red-600 focus:ring-red-500 border-neutral-300" />
                   <span>Hide comment</span>
                 </label>
                 <label class="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                   <input type="radio" name="modAction" value="ban_user"
                     [checked]="moderationAction() === 'ban_user'"
                     (change)="moderationAction.set('ban_user')"
                     class="h-4 w-4 text-red-600 focus:ring-red-500 border-neutral-300" />
                   <span>Block user</span>
                 </label>
                 <label class="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                   <input type="radio" name="modAction" value="delete_and_ban"
                     [checked]="moderationAction() === 'delete_and_ban'"
                     (change)="moderationAction.set('delete_and_ban')"
                     class="h-4 w-4 text-red-600 focus:ring-red-500 border-neutral-300" />
                   <span>Hide comment & block user</span>
                 </label>
                 <label class="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                   <input type="radio" name="modAction" value="no_action"
                     [checked]="moderationAction() === 'no_action'"
                     (change)="moderationAction.set('no_action')"
                     class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300" />
                   <span>Dismiss report (no action)</span>
                 </label>
               </div>
             </div>

            <!-- Resolution Notes -->
            <div class="space-y-1">
              <label class="block text-sm font-semibold text-neutral-800">Resolution Notes (required/recommended):</label>
              <textarea
                [(ngModel)]="resolutionNotes"
                class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:bg-white resize-none"
                rows="3"
                placeholder="Enter details for the audit log..."
              ></textarea>
            </div>
          </div>

          <div class="p-4 border-t border-neutral-100 flex justify-end gap-2 shrink-0 bg-neutral-50 rounded-b-xl">
            <button
              (click)="closeActionModal()"
              [disabled]="isResolving()"
              class="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors">
              Cancel
            </button>
            <button
              (click)="confirmAction()"
              [disabled]="isResolving()"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-40 transition-colors"
              [class]="moderationAction() === 'no_action' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'">
              {{ isResolving() ? 'Executing...' : 'Confirm Action' }}
            </button>
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
export class ForumModerationComponent implements OnInit, OnDestroy {
  private forumService = inject(ForumService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  readonly messageSquareIcon = MessageSquare;
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly messageCircleIcon = MessageCircle;
  readonly pinIcon = Pin;
  readonly unpinIcon = Pin;
  readonly lockIcon = Lock;
  readonly unlockIcon = Unlock;
  readonly trashIcon = Trash2;
  readonly editIcon = Edit;
  readonly eyeIcon = Eye;
  readonly alertTriangleIcon = AlertTriangle;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;
  readonly calendarIcon = Calendar;
  readonly trendingIcon = TrendingUp;
  readonly replyIcon = CornerDownRight;
  readonly chevronDownIcon = ChevronDown;

  // Dropdown Options
  topicStatusOptions: SelectOption[] = [
    { label: 'All Topics', value: '' },
    { label: 'Pinned', value: 'pinned' },
    { label: 'Locked', value: 'locked' },
    { label: 'Recent (7 days)', value: 'recent' },
    { label: 'Popular', value: 'popular' }
  ];

  topicSortOptions: SelectOption[] = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Posts', value: 'most_posts' },
    { label: 'Most Recent', value: 'most_recent' }
  ];

  flagStatusOptions: SelectOption[] = [
    { label: 'All Flags', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Reviewed', value: 'Reviewed' },
    { label: 'Dismissed', value: 'Dismissed' },
    { label: 'Action Taken', value: 'ActionTaken' }
  ];

  flagReasonOptions: SelectOption[] = [
    { label: 'All Reasons', value: '' },
    { label: 'Spam', value: 'Spam' },
    { label: 'Harassment', value: 'Harassment' },
    { label: 'Inappropriate', value: 'Inappropriate' },
    { label: 'Off-topic', value: 'OffTopic' },
    { label: 'Other', value: 'Other' }
  ];

  // Confirmation modal
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{ title: string; message: string; confirmText: string; action: () => void }>({ title: '', message: '', confirmText: 'Confirm', action: () => {} });

  openConfirm(title: string, message: string, confirmText: string, action: () => void) {
    this.confirmModalConfig.set({ title, message, confirmText, action });
    this.showConfirmModal.set(true);
  }
  onConfirm() { this.confirmModalConfig().action(); this.showConfirmModal.set(false); }
  onCancelConfirm() { this.showConfirmModal.set(false); }

  isLoading = signal(false);
  isLoadingTopic = signal(false);
  searchQuery = '';
  selectedStatus = '';
  selectedSort = 'newest';
  currentPage = signal(1);
  totalCount = signal(0);
  itemsPerPage = 20;

  activeTab = signal<'topics' | 'flags'>('topics');

  // Flags
  flags = signal<any[]>([]);
  flagCount = signal(0);
  isLoadingFlags = signal(false);
  flagFilter = '';
  flagReasonFilter = '';

  stats = signal({ totalTopics: 0, totalPosts: 0, activeUsers: 0, pinnedTopics: 0 });
  topics = signal<TopicSummaryDto[]>([]);

  showTopicModal = signal(false);
  selectedTopic = signal<TopicDetailDto | null>(null);

  // Edit modal
  showEditModal = signal(false);
  editPostId = '';
  editContent = '';

  // Interactive Moderation Actions Modal
  showActionModal = signal(false);
  selectedFlag = signal<any | null>(null);
  moderationAction = signal<'delete_post' | 'ban_user' | 'delete_and_ban' | 'no_action'>('delete_post');
  resolutionNotes = signal('');
  isResolving = signal(false);

  openActionModal(flag: any) {
    this.selectedFlag.set(flag);
    this.moderationAction.set('delete_post');
    this.resolutionNotes.set('');
    this.isResolving.set(false);
    this.showActionModal.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeActionModal() {
    this.showActionModal.set(false);
    this.selectedFlag.set(null);
    document.body.classList.remove('overflow-hidden');
  }

  confirmAction() {
    const flag = this.selectedFlag();
    if (!flag) return;

    this.isResolving.set(true);
    const action = this.moderationAction();
    const notes = this.resolutionNotes().trim() || 'No notes provided.';

    // Create tasks
    const operations: Observable<any>[] = [];

    if (action === 'delete_post' || action === 'delete_and_ban') {
      operations.push(this.forumService.deletePost(flag.postId, notes));
    }
    if (action === 'ban_user' || action === 'delete_and_ban') {
      operations.push(this.forumService.banUser(flag.postAuthorId, notes));
    }

    // Resolve status mapping
    const status = action === 'no_action' ? 'Dismissed' : 'ActionTaken';

    if (operations.length > 0) {
      forkJoin(operations).pipe(
        switchMap(() => this.forumService.resolveFlag(flag.id, status, notes)),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Moderation Complete', 'Corrective action taken and flag resolved.');
          this.closeActionModal();
          this.loadFlags();
          this.loadFlagCount();
        },
        error: (err) => {
          this.notificationService.showError('Moderation Failed', err?.error?.message || 'An error occurred during moderation.');
          this.isResolving.set(false);
        }
      });
    } else {
      this.forumService.resolveFlag(flag.id, status, notes).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.notificationService.showSuccess('Resolved', 'Flag resolved successfully.');
          this.closeActionModal();
          this.loadFlags();
          this.loadFlagCount();
        },
        error: (err) => {
          this.notificationService.showError('Error', err?.error?.message || 'Failed to resolve flag.');
          this.isResolving.set(false);
        }
      });
    }
  }

  reopenFlag(flag: any) {
    this.openConfirm(
      'Re-open Flag',
      'Are you sure you want to re-open this flag for review?',
      'Re-open Flag',
      () => {
        this.forumService.resolveFlag(flag.id, 'Pending', 'Re-opened flag for re-evaluation.').pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.notificationService.showSuccess('Re-opened', 'Flag status set back to Pending.');
            this.loadFlags();
            this.loadFlagCount();
          },
          error: (err) => this.notificationService.showError('Error', err?.error?.message || 'Failed to re-open flag.')
        });
      }
    );
  }

  restorePost(flag: any) {
    this.openConfirm(
      'Restore Post & Re-open Flag',
      'This will restore the soft-deleted post (making it visible again to all alumni) and re-open the flag. Proceed?',
      'Restore & Re-open',
      () => {
        this.forumService.restorePost(flag.postId).pipe(
          switchMap(() => this.forumService.resolveFlag(flag.id, 'Pending', 'Restored post and re-opened flag.')),
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.notificationService.showSuccess('Restored', 'Post restored and flag re-opened.');
            this.loadFlags();
            this.loadFlagCount();
          },
          error: (err) => this.notificationService.showError('Error', err?.error?.message || 'Failed to restore post.')
        });
      }
    );
  }

  ngOnInit() {
    this.loadTopics();
    this.loadFlagCount();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadTopics();
    });
  }

  loadFlagCount() {
    this.forumService.getFlags('Pending', 1, 1).pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ totalCount: 0, items: [] } as any))
    ).subscribe(result => this.flagCount.set(result.totalCount));
  }

  loadFlags() {
    this.isLoadingFlags.set(true);
    this.forumService.getFlags(this.flagFilter || undefined, 1, 100).pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ totalCount: 0, items: [] } as any))
    ).subscribe(result => {
      this.flags.set(result.items);
      this.isLoadingFlags.set(false);
    });
  }

  resolveFlag(flagId: string, status: string, notes?: string) {
    this.forumService.resolveFlag(flagId, status, notes).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Resolved', `Flag ${status === 'Dismissed' ? 'dismissed' : 'action taken'}`);
        this.loadFlags();
        this.loadFlagCount();
      },
      error: () => this.notificationService.showError('Error', 'Failed to resolve flag')
    });
  }

  getFilteredFlags(): any[] {
    let items = this.flags();
    if (this.flagReasonFilter) {
      items = items.filter(f => f.reason === this.flagReasonFilter);
    }
    return items;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData() {
    this.loadTopics();
  }

  loadTopics() {
    this.isLoading.set(true);
    const sortBy = this.mapSort(this.selectedSort);

    forkJoin({
      topics: this.forumService.getTopics(
        this.currentPage(), this.itemsPerPage, undefined,
        this.searchQuery.trim() || undefined, undefined, sortBy
      ).pipe(catchError(() => of({ items: [], totalCount: 0 } as any))),
      topUsers: this.forumService.getTopUsers(50).pipe(catchError(() => of([])))
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ topics, topUsers }) => {
        this.topics.set(topics.items);
        this.totalCount.set(topics.totalCount);
        const pinnedCount = (topics.items as TopicSummaryDto[]).filter(t => t.isPinned).length;
        const totalPosts = (topics.items as TopicSummaryDto[]).reduce((sum, t) => sum + t.postCount, 0);
        this.stats.set({
          totalTopics: topics.totalCount,
          totalPosts,
          activeUsers: topUsers.length,
          pinnedTopics: pinnedCount
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load forum data');
        this.isLoading.set(false);
      }
    });
  }

  private mapSort(sort: string): string {
    switch (sort) {
      case 'oldest': return 'oldest';
      case 'most_posts': return 'mostdiscussed';
      default: return 'recent';
    }
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadTopics();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedSort = 'newest';
    this.currentPage.set(1);
    this.loadTopics();
  }

  getFilteredTopics(): TopicSummaryDto[] {
    let items = this.topics();
    if (this.selectedStatus === 'pinned') return items.filter(t => t.isPinned);
    if (this.selectedStatus === 'locked') return items.filter(t => t.isLocked);
    if (this.selectedStatus === 'popular') return items.filter(t => t.postCount > 10);
    if (this.selectedStatus === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return items.filter(t => new Date(t.createdAt) > weekAgo);
    }
    return items;
  }

  totalPages(): number {
    return Math.ceil(this.totalCount() / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadTopics();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadTopics();
    }
  }

  viewTopic(topic: TopicSummaryDto) {
    this.showTopicModal.set(true);
    this.isLoadingTopic.set(true);
    this.selectedTopic.set(null);

    this.forumService.getTopicById(topic.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (detail) => {
        this.selectedTopic.set(detail);
        this.isLoadingTopic.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load topic');
        this.isLoadingTopic.set(false);
      }
    });
  }

  viewTopicById(topicId: string, topicTitle: string = 'Topic Details') {
    const fakeTopic: any = { id: topicId, title: topicTitle };
    this.viewTopic(fakeTopic);
  }

  togglePinTopic(topic: TopicSummaryDto) {
    this.forumService.togglePinTopic(topic.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.topics.update(ts => ts.map(t => t.id === topic.id ? { ...t, isPinned: !t.isPinned } : t));
        this.notificationService.showSuccess('Updated', topic.isPinned ? 'Topic unpinned' : 'Topic pinned');
      },
      error: () => this.notificationService.showError('Error', 'Failed to update topic')
    });
  }

  toggleLockTopic(topic: TopicSummaryDto) {
    this.forumService.toggleLockTopic(topic.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.topics.update(ts => ts.map(t => t.id === topic.id ? { ...t, isLocked: !t.isLocked } : t));
        this.notificationService.showSuccess('Updated', topic.isLocked ? 'Topic unlocked' : 'Topic locked');
      },
      error: () => this.notificationService.showError('Error', 'Failed to update topic')
    });
  }

  deleteTopic(topic: TopicSummaryDto) {
    this.openConfirm(
      'Delete Topic',
      `Delete "${topic.title}"? This will also delete all posts and cannot be undone.`,
      'Delete Topic',
      () => this.forumService.deleteTopic(topic.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.notificationService.showSuccess('Deleted', 'Topic deleted successfully'); this.loadTopics(); },
        error: () => this.notificationService.showError('Error', 'Failed to delete topic')
      })
    );
  }

  openEditModal(post: PostDto) {
    this.editPostId = post.id;
    this.editContent = post.content;
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editPostId = '';
    this.editContent = '';
  }

  confirmEdit() {
    if (!this.editContent.trim() || !this.editPostId) return;

    this.forumService.updatePost(this.editPostId, { content: this.editContent.trim() }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Updated', 'Post updated');
        this.closeEditModal();
        if (this.selectedTopic()) this.reloadTopicDetail(this.selectedTopic()!.id);
      },
      error: () => this.notificationService.showError('Error', 'Failed to update post')
    });
  }

  deletePost(post: PostDto) {
    this.openConfirm(
      'Delete Post',
      'Delete this post? This cannot be undone.',
      'Delete Post',
      () => this.forumService.deletePost(post.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { this.notificationService.showSuccess('Deleted', 'Post deleted'); if (this.selectedTopic()) this.reloadTopicDetail(this.selectedTopic()!.id); },
        error: () => this.notificationService.showError('Error', 'Failed to delete post')
      })
    );
  }

  private reloadTopicDetail(topicId: string) {
    this.forumService.getTopicById(topicId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({ next: (detail) => this.selectedTopic.set(detail) });
  }

  closeTopicModal() {
    this.showTopicModal.set(false);
    this.selectedTopic.set(null);
  }

  countAllPosts(posts: PostDto[]): number {
    let count = posts.length;
    for (const post of posts) {
      if (post.replies) {
        count += post.replies.length;
      }
    }
    return count;
  }

  isDefaultImage(url: string): boolean {
    return !url || url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
