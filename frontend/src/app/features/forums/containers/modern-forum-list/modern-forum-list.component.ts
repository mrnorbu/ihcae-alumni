import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, Plus, Search, ArrowLeft, ThumbsUp, Reply, Send, Lock, Pin, Trash2, X, MessageCircle, Hash, Users, ChevronRight } from 'lucide-angular';
import { HeaderComponent, FooterComponent } from '../../../../shared/components';
import { CreateTopicModalComponent } from '../../components/create-topic-modal/create-topic-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { UserAuthStore } from '../../../../core/state/user-auth.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { ForumService } from '../../services/forum.service';
import type { TopicSummaryDto, TagDto, CreateTopicRequest, TopUserDto, TopicDetailDto, PostDto } from '../../../../shared/models';

@Component({
  selector: 'app-modern-forum-list',
  standalone: true,
  imports: [
    FormsModule, NgTemplateOutlet,
    LucideAngularModule,
    HeaderComponent, FooterComponent,
    CreateTopicModalComponent, ConfirmationModalComponent
  ],
  template: `
    <div class="min-h-screen bg-neutral-50 flex flex-col page-fade-in">
      <app-header></app-header>

      <div class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pt-20">
        <div class="flex gap-5">

          <!-- ═══ LEFT SIDEBAR ═══ -->
          <aside class="w-48 flex-shrink-0 hidden lg:block">
            <div class="sticky top-6 space-y-3">

              <!-- New Thread -->
              <button (click)="showCreateTopicModal = true"
                class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                <lucide-icon [img]="plusIcon" [size]="15"></lucide-icon>
                New Thread
              </button>

              <!-- Navigation -->
              <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <button (click)="backToList(); clearAllFilters()"
                  class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors"
                  [class.bg-blue-50]="view === 'list' && !selectedTagFilter"
                  [class.text-blue-700]="view === 'list' && !selectedTagFilter"
                  [class.font-medium]="view === 'list' && !selectedTagFilter"
                  [class.text-neutral-600]="view !== 'list' || !!selectedTagFilter"
                  [class.hover:bg-neutral-50]="view !== 'list' || !!selectedTagFilter">
                  <lucide-icon [img]="messageIcon" [size]="14"></lucide-icon>
                  All Threads
                </button>
                <div class="border-t border-neutral-100 px-3 py-2">
                  <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">Sort</p>
                  @for (opt of sortOptions; track opt.value) {
                    <button (click)="onSortChange(opt.value); backToList()"
                      class="w-full text-left px-2 py-1.5 text-xs rounded transition-colors mb-0.5"
                      [class.bg-blue-50]="sortBy === opt.value"
                      [class.text-blue-700]="sortBy === opt.value"
                      [class.text-neutral-600]="sortBy !== opt.value"
                      [class.hover:bg-neutral-50]="sortBy !== opt.value">
                      {{ opt.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Tags -->
              <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div class="px-3 py-2 border-b border-neutral-100 flex items-center gap-2">
                  <lucide-icon [img]="hashIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                  <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Topics</span>
                </div>
                <div class="py-1">
                  @if (selectedTagFilter) {
                    <button (click)="clearTagFilter(); backToList()"
                      class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                      <lucide-icon [img]="xIcon" [size]="12"></lucide-icon>
                      Clear filter
                    </button>
                  }
                  @for (tag of popularTags.slice(0, 12); track tag) {
                    <button (click)="filterByTag(tag.name); backToList()"
                      class="w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors"
                      [class.bg-blue-50]="selectedTagFilter === tag.name"
                      [class.text-blue-700]="selectedTagFilter === tag.name"
                      [class.font-medium]="selectedTagFilter === tag.name"
                      [class.text-neutral-600]="selectedTagFilter !== tag.name"
                      [class.hover:bg-neutral-50]="selectedTagFilter !== tag.name">
                      <span>#{{ tag.name }}</span>
                      <span class="text-neutral-400">{{ tag.usageCount }}</span>
                    </button>
                  }
                </div>
              </div>

            </div>
          </aside>

          <!-- ═══ MAIN CONTENT ═══ -->
          <div class="flex-1 min-w-0">

            <!-- ── PERSISTENT TOP BAR (always visible) ── -->
            <div class="sticky top-20 z-20 bg-white rounded-lg border border-neutral-200 mb-3 px-4 py-3 flex items-center gap-3">
              @if (view === 'detail') {
                <button (click)="backToList()"
                  class="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 mr-1">
                  <lucide-icon [img]="arrowLeftIcon" [size]="16"></lucide-icon>
                  Forums
                </button>
                <span class="text-neutral-300">›</span>
                <span class="text-sm text-neutral-600 truncate flex-1">{{ selectedTopic?.title }}</span>
              }
              @if (view === 'list') {
                <div class="relative flex-1">
                  <lucide-icon [img]="searchIcon" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
                  <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()"
                    placeholder="Search discussions..."
                    class="w-full pl-11 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button (click)="onSearch()" class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                  Search
                </button>
                @if (selectedAuthorName) {
                  <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md flex-shrink-0">
                    by {{ selectedAuthorName }}
                    <button (click)="clearAuthorFilter()"><lucide-icon [img]="xIcon" [size]="11"></lucide-icon></button>
                  </span>
                }
              }
            </div>

            @if (view === 'list' && selectedTagFilter) {
              <div class="flex items-center gap-2 mb-3">
                <span class="text-sm text-neutral-500">Showing:</span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  #{{ selectedTagFilter }}
                  <button (click)="clearTagFilter()"><lucide-icon [img]="xIcon" [size]="12"></lucide-icon></button>
                </span>
              </div>
            }

            <!-- ── LIST VIEW ── -->
            @if (view === 'list') {

              <!-- Loading -->
              @if (loading) {
                <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  @for (i of [1,2,3,4,5]; track i) {
                    <div class="p-4 border-b border-neutral-100 last:border-b-0 animate-pulse">
                      <div class="flex gap-3">
                        <div class="w-9 h-9 bg-neutral-200 rounded-full flex-shrink-0"></div>
                        <div class="flex-1">
                          <div class="h-3.5 bg-neutral-200 rounded w-1/4 mb-2"></div>
                          <div class="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                          <div class="h-3 bg-neutral-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Error -->
              @if (error) {
                <div class="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">{{ error }}</div>
              }

              <!-- Empty -->
              @if (!loading && !error && topics.length === 0) {
                <div class="bg-white rounded-lg border border-neutral-200 text-center py-16">
                  <lucide-icon [img]="messageIcon" [size]="40" class="text-neutral-300 mb-4 mx-auto"></lucide-icon>
                  <h3 class="text-base font-semibold text-neutral-700 mb-1">No threads yet</h3>
                  <p class="text-sm text-neutral-400 mb-4">Be the first to start a discussion</p>
                  <button (click)="showCreateTopicModal = true" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    Start a Thread
                  </button>
                </div>
              }

              <!-- Thread list -->
              @if (!loading && !error && topics.length > 0) {
                <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  @for (topic of topics; track topic.id) {
                    <div class="flex items-start gap-3 px-4 py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors cursor-pointer group"
                      (click)="openThread(topic.id)">
                      <!-- Avatar -->
                      <div class="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600 mt-0.5">
                        @if (topic.createdBy.profileImageUrl && !isPlaceholder(topic.createdBy.profileImageUrl)) {
                          <img [src]="topic.createdBy.profileImageUrl" class="w-9 h-9 rounded-full object-cover" />
                        } @else {
                          {{ initials(topic.createdBy) }}
                        }
                      </div>
                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-1">
                          <button class="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors"
                            (click)="filterByAuthor(topic.createdBy.id, fullName(topic.createdBy)); $event.stopPropagation()">
                            {{ fullName(topic.createdBy) }}
                          </button>
                          <span class="text-neutral-300 text-xs">•</span>
                          <span class="text-xs text-neutral-400">{{ timeAgo(topic.lastReplyAt || topic.createdAt) }}</span>
                          @if (topic.isPinned) {
                            <lucide-icon [img]="pinIcon" [size]="12" class="text-amber-500"></lucide-icon>
                          }
                          @if (topic.isLocked) {
                            <lucide-icon [img]="lockIcon" [size]="12" class="text-neutral-400"></lucide-icon>
                          }
                        </div>
                        <h3 class="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors leading-snug mb-1">{{ topic.title }}</h3>
                        @if (topic.preview) {
                          <p class="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-1.5">{{ topic.preview }}</p>
                        }
                        @if (topic.tags.length) {
                          <div class="flex flex-wrap gap-1 mb-2">
                            @for (tag of topic.tags.slice(0, 3); track tag) {
                              <span class="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">#{{ tag.name }}</span>
                            }
                          </div>
                        }
                        <div class="flex items-center gap-3">
                          <span class="flex items-center gap-1 text-xs text-neutral-400">
                            <lucide-icon [img]="messageIcon" [size]="12"></lucide-icon>
                            {{ Math.max(0, (topic.postCount || 0) - 1) }}
                          </span>
                          <button class="flex items-center gap-1 text-xs transition-colors"
                            [class.text-blue-600]="topic.isMainPostLikedByCurrentUser"
                            [class.text-neutral-400]="!topic.isMainPostLikedByCurrentUser"
                            (click)="onThreadLike(topic.id); $event.stopPropagation()">
                            <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                            {{ topic.totalLikes }}
                          </button>
                        </div>
                      </div>
                      <lucide-icon [img]="chevronRightIcon" [size]="16" class="text-neutral-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-2"></lucide-icon>
                    </div>
                  }
                </div>

                <!-- Pagination -->
                @if (totalPages > 1) {
                  <div class="flex justify-center items-center gap-2 mt-4">
                    <button (click)="previousPage()" [disabled]="currentPage === 1"
                      class="px-3 py-1.5 text-xs border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    @for (page of pageNumbers; track page) {
                      <button (click)="goToPage(page)"
                        class="px-3 py-1.5 text-xs border border-neutral-300 rounded-md transition-colors"
                        [class.bg-blue-600]="page === currentPage"
                        [class.text-white]="page === currentPage">
                        {{ page }}
                      </button>
                    }
                    <button (click)="nextPage()" [disabled]="currentPage === totalPages"
                      class="px-3 py-1.5 text-xs border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                }
              }
            }

            <!-- ── DETAIL VIEW ── -->
            @if (view === 'detail') {

              @if (topicLoading) {
                <div class="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse space-y-4">
                  <div class="h-6 bg-neutral-200 rounded w-2/3"></div>
                  <div class="h-4 bg-neutral-200 rounded w-1/3"></div>
                  <div class="space-y-2 pt-4 border-t border-neutral-100">
                    <div class="h-4 bg-neutral-200 rounded w-full"></div>
                    <div class="h-4 bg-neutral-200 rounded w-5/6"></div>
                  </div>
                </div>
              }

              @if (topicError) {
                <div class="bg-white rounded-xl border border-red-200 p-6 text-center">
                  <p class="text-red-600 text-sm mb-3">{{ topicError }}</p>
                  <button (click)="retryLoadThread()" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Try Again</button>
                </div>
              }

              @if (!topicLoading && !topicError && selectedTopic && detailMainPost) {
                <div class="bg-white rounded-xl border border-neutral-200 overflow-hidden">

                  <!-- Thread header -->
                  <div class="px-6 pt-5 pb-4 border-b border-neutral-100">
                    <div class="flex items-start gap-2 mb-1.5">
                      @if (selectedTopic.isPinned) {
                        <lucide-icon [img]="pinIcon" [size]="14" class="text-amber-500 mt-1 flex-shrink-0"></lucide-icon>
                      }
                      @if (selectedTopic.isLocked) {
                        <lucide-icon [img]="lockIcon" [size]="14" class="text-neutral-400 mt-1 flex-shrink-0"></lucide-icon>
                      }
                      <h1 class="text-xl font-bold text-neutral-900 leading-tight">{{ selectedTopic.title }}</h1>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm text-neutral-500">by <span class="font-medium text-neutral-700">{{ fullName(selectedTopic.createdBy) }}</span></span>
                      <span class="text-neutral-300 text-xs">•</span>
                      <span class="text-sm text-neutral-400">{{ timeAgo(selectedTopic.createdAt) }}</span>
                      @for (tag of selectedTopic.tags; track tag) {
                        <span class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium">#{{ tag.name }}</span>
                      }
                    </div>
                  </div>

                  @if (selectedTopic.isLocked) {
                    <div class="flex items-center gap-2 px-6 py-2.5 bg-amber-50 border-b border-amber-100 text-xs text-amber-700">
                      <lucide-icon [img]="lockIcon" [size]="13"></lucide-icon>
                      This topic is locked. No new replies can be posted.
                    </div>
                  }

                  <!-- Original post -->
                  <div class="px-6 py-5">
                    <div class="flex items-start gap-3">
                      <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-700">
                        @if (detailMainPost.author.profileImageUrl && !isPlaceholder(detailMainPost.author.profileImageUrl)) {
                          <img [src]="detailMainPost.author.profileImageUrl" class="w-9 h-9 rounded-full object-cover" />
                        } @else {
                          {{ initials(detailMainPost.author) }}
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1.5">
                          <span class="font-semibold text-neutral-900 text-sm">{{ fullName(detailMainPost.author) }}</span>
                          <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Original Post</span>
                          <span class="text-xs text-neutral-400 ml-auto">{{ timeAgo(detailMainPost.createdAt) }}</span>
                        </div>
                        <div class="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap">{{ detailMainPost.content }}</div>
                        <div class="flex items-center gap-4 mt-3">
                          <button (click)="togglePostLike(detailMainPost)"
                            class="flex items-center gap-1.5 text-xs transition-colors"
                            [class.text-blue-600]="detailMainPost.isLikedByCurrentUser"
                            [class.text-neutral-500]="!detailMainPost.isLikedByCurrentUser">
                            <lucide-icon [img]="thumbsUpIcon" [size]="13"></lucide-icon>
                            <span>{{ detailMainPost.likeCount }}</span>
                          </button>
                          @if (!selectedTopic.isLocked) {
                            <button (click)="openReplyForm(detailMainPost.id)"
                              class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-600 transition-colors">
                              <lucide-icon [img]="replyIcon" [size]="13"></lucide-icon>
                              Reply
                            </button>
                          }
                          <span class="text-xs text-neutral-400 ml-auto">{{ detailAllReplies.length }} {{ detailAllReplies.length === 1 ? 'reply' : 'replies' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Inline reply form on original post -->
                  @if (activeReplyForm === detailMainPost.id && !selectedTopic.isLocked) {
                    <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                      <ng-container *ngTemplateOutlet="replyFormTpl; context: { postId: detailMainPost.id, name: fullName(detailMainPost.author) }"></ng-container>
                    </div>
                  }

                  <!-- Replies -->
                  @if (detailAllReplies.length > 0) {
                    <div class="border-t border-neutral-200">
                      <div class="px-6 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide bg-neutral-50 border-b border-neutral-100">
                        {{ detailAllReplies.length }} {{ detailAllReplies.length === 1 ? 'Reply' : 'Replies' }}
                      </div>

                      @for (reply of detailDirectReplies; track reply.id) {
                        <div class="border-b border-neutral-100 last:border-b-0">
                          <div class="px-6 py-4">
                            <div class="flex items-start gap-3">
                              <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                                @if (reply.author.profileImageUrl && !isPlaceholder(reply.author.profileImageUrl)) {
                                  <img [src]="reply.author.profileImageUrl" class="w-8 h-8 rounded-full object-cover" />
                                } @else {
                                  {{ initials(reply.author) }}
                                }
                              </div>
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                  <span class="font-medium text-neutral-900 text-sm">{{ fullName(reply.author) }}</span>
                                  <span class="text-xs text-neutral-400">{{ timeAgo(reply.createdAt) }}</span>
                                </div>
                                <div class="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap">{{ reply.content }}</div>
                                <div class="flex items-center gap-4 mt-2.5">
                                  <button (click)="togglePostLike(reply)"
                                    class="flex items-center gap-1.5 text-xs transition-colors"
                                    [class.text-blue-600]="reply.isLikedByCurrentUser"
                                    [class.text-neutral-500]="!reply.isLikedByCurrentUser">
                                    <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                                    <span>{{ reply.likeCount }}</span>
                                  </button>
                                  @if (!selectedTopic.isLocked) {
                                    <button (click)="openReplyForm(reply.id)"
                                      class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-blue-600 transition-colors">
                                      <lucide-icon [img]="replyIcon" [size]="12"></lucide-icon>
                                      Reply
                                    </button>
                                  }
                                  @if (isCurrentUser(reply.author.id)) {
                                    <button (click)="confirmDeleteReply(reply.id)"
                                      class="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 ml-auto">
                                      <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                                      Delete
                                    </button>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Reply form for this reply -->
                          @if (activeReplyForm === reply.id && !selectedTopic.isLocked) {
                            <div class="px-6 pb-4 pl-16 bg-neutral-50">
                              <ng-container *ngTemplateOutlet="replyFormTpl; context: { postId: reply.id, name: fullName(reply.author) }"></ng-container>
                            </div>
                          }

                          <!-- Nested replies (indented, right after parent) -->
                          @for (nested of getNestedReplies(reply.id); track nested.id) {
                            <div class="pl-16 pr-6 py-3 bg-neutral-50 border-t border-neutral-100">
                              <div class="flex items-start gap-2.5">
                                <div class="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-500">
                                  {{ initials(nested.author) }}
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="flex items-center gap-2 mb-0.5">
                                    <span class="font-medium text-neutral-900 text-xs">{{ fullName(nested.author) }}</span>
                                    @if (nested.parentAuthor) {
                                      <span class="text-xs text-blue-500">↩ {{ fullName(nested.parentAuthor) }}</span>
                                    }
                                    <span class="text-xs text-neutral-400 ml-auto">{{ timeAgo(nested.createdAt) }}</span>
                                  </div>
                                  <div class="text-neutral-700 text-sm leading-relaxed">{{ nested.content }}</div>
                                  <div class="flex items-center gap-3 mt-1.5">
                                    <button (click)="togglePostLike(nested)"
                                      class="flex items-center gap-1.5 text-xs transition-colors"
                                      [class.text-blue-600]="nested.isLikedByCurrentUser"
                                      [class.text-neutral-400]="!nested.isLikedByCurrentUser">
                                      <lucide-icon [img]="thumbsUpIcon" [size]="12"></lucide-icon>
                                      <span>{{ nested.likeCount }}</span>
                                    </button>
                                    @if (isCurrentUser(nested.author.id)) {
                                      <button (click)="confirmDeleteReply(nested.id)"
                                        class="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 ml-auto">
                                        <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                                        Delete
                                      </button>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }

                  <!-- Bottom reply box -->
                  @if (!selectedTopic.isLocked && activeReplyForm === null) {
                    <div class="px-6 py-5 border-t border-neutral-200 bg-neutral-50">
                      <textarea [(ngModel)]="replyText" rows="3" placeholder="Write a reply..."
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"></textarea>
                      <div class="flex justify-end mt-2">
                        <button (click)="submitReply(detailMainPost.id)"
                          [disabled]="!replyText.trim() || replySubmitting"
                          class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <lucide-icon [img]="sendIcon" [size]="14"></lucide-icon>
                          {{ replySubmitting ? 'Posting...' : 'Post Reply' }}
                        </button>
                      </div>
                    </div>
                  }

                </div>
              }
            }

          </div><!-- end main content -->

          <!-- ═══ RIGHT SIDEBAR ═══ -->
          <aside class="w-56 flex-shrink-0 hidden xl:block">
            <div class="sticky top-6 space-y-4">

              <!-- Top Users -->
              <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div class="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                  <lucide-icon [img]="usersIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                  <span class="text-sm font-semibold text-neutral-700">Top Users</span>
                </div>
                <div class="p-3 space-y-2">
                  @if (topUsers.length === 0) {
                    <p class="text-xs text-neutral-400 text-center py-2">No data yet</p>
                  }
                  @for (user of topUsers; track user.userId) {
                    <div class="flex items-center gap-2.5 py-1">
                      <div class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-neutral-600">
                        @if (user.profileImageUrl && !isPlaceholder(user.profileImageUrl)) {
                          <img [src]="user.profileImageUrl" class="w-8 h-8 rounded-full object-cover" />
                        } @else {
                          {{ user.firstName.charAt(0) + user.lastName.charAt(0) }}
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-neutral-800 truncate">{{ user.firstName }} {{ user.lastName }}</div>
                        <div class="text-xs text-neutral-400">{{ user.postCount }} posts · {{ user.totalLikes }} likes</div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Forum Stats -->
              <div class="bg-white rounded-lg border border-neutral-200 p-4">
                <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Forum Stats</p>
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-neutral-500">Total Threads</span>
                    <span class="font-medium text-neutral-800">{{ totalThreadCount }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-neutral-500">Active Tags</span>
                    <span class="font-medium text-neutral-800">{{ popularTags.length }}</span>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-neutral-500">Contributors</span>
                    <span class="font-medium text-neutral-800">{{ topUsers.length }}+</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>

      <app-footer></app-footer>

      <!-- Shared reply form template -->
      <ng-template #replyFormTpl let-postId="postId" let-name="name">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-neutral-500">Replying to {{ name }}</span>
          <button (click)="closeReplyForm()" class="text-neutral-400 hover:text-neutral-600">
            <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
          </button>
        </div>
        <textarea [(ngModel)]="replyText" rows="2" placeholder="Write your reply..."
          class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"></textarea>
        <div class="flex gap-2 mt-2">
          <button (click)="submitReply(postId)" [disabled]="!replyText.trim() || replySubmitting"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <lucide-icon [img]="sendIcon" [size]="12"></lucide-icon>
            {{ replySubmitting ? 'Posting...' : 'Reply' }}
          </button>
          <button (click)="closeReplyForm()" class="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg hover:bg-neutral-50 bg-white transition-colors">Cancel</button>
        </div>
      </ng-template>

      <app-create-topic-modal
        [isVisible]="showCreateTopicModal"
        (submit)="onCreateTopicSubmit($event)"
        (cancel)="showCreateTopicModal = false"
      ></app-create-topic-modal>

      <app-confirmation-modal
        [isVisible]="showDeleteModal"
        title="Delete Reply"
        message="Are you sure you want to delete this reply?"
        confirmText="Delete"
        (confirm)="deleteReply()"
        (cancel)="showDeleteModal = false"
      ></app-confirmation-modal>
    </div>
  `,
  styles: []
})
export class ModernForumListComponent implements OnInit, OnDestroy {
  // List state
  view: 'list' | 'detail' = 'list';
  loading = false;
  error: string | null = null;
  showCreateTopicModal = false;
  topics: TopicSummaryDto[] = [];
  popularTags: TagDto[] = [];
  topUsers: TopUserDto[] = [];
  totalThreadCount = 0;
  currentPage = 1;
  totalPages = 1;
  pageSize = 15;
  searchQuery = '';
  selectedAuthorId?: string;
  selectedAuthorName?: string;
  sortBy = 'recent';
  selectedTagFilter?: string;

  // Detail state
  selectedTopicId: string | null = null;
  selectedTopic: TopicDetailDto | null = null;
  detailMainPost: PostDto | null = null;
  topicLoading = false;
  topicError: string | null = null;
  activeReplyForm: string | null = null;
  replyText = '';
  replySubmitting = false;
  showDeleteModal = false;
  replyToDelete: string | null = null;

  readonly Math = Math;
  readonly plusIcon = Plus;
  readonly searchIcon = Search;
  readonly arrowLeftIcon = ArrowLeft;
  readonly thumbsUpIcon = ThumbsUp;
  readonly replyIcon = Reply;
  readonly sendIcon = Send;
  readonly lockIcon = Lock;
  readonly pinIcon = Pin;
  readonly trashIcon = Trash2;
  readonly xIcon = X;
  readonly messageIcon = MessageCircle;
  readonly hashIcon = Hash;
  readonly usersIcon = Users;
  readonly chevronRightIcon = ChevronRight;

  readonly sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'mostdiscussed', label: 'Most Discussed' },
  ];

  private authStore = inject(UserAuthStore);
  private forumService = inject(ForumService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadTopics();
    this.loadPopularTags();
    this.loadTopUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Computed ──────────────────────────────────────────────

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get detailAllReplies(): PostDto[] {
    if (!this.detailMainPost) return [];
    const flat: PostDto[] = [];
    for (const r of this.detailMainPost.replies) {
      flat.push(r);
      if (r.replies?.length) flat.push(...r.replies);
    }
    return flat;
  }

  get detailDirectReplies(): PostDto[] {
    if (!this.detailMainPost) return [];
    const nestedIds = new Set(
      this.detailMainPost.replies.flatMap(r => (r.replies ?? []).map(n => n.id))
    );
    return this.detailMainPost.replies.filter(r => !nestedIds.has(r.id));
  }

  getNestedReplies(parentId: string): PostDto[] {
    if (!this.detailMainPost) return [];
    const parent = this.detailMainPost.replies.find(r => r.id === parentId);
    const fromParent = parent?.replies ?? [];
    const fromFlat = this.detailMainPost.replies.filter(r => r.parentPostId === parentId);
    const seen = new Set(fromParent.map(r => r.id));
    return [...fromParent, ...fromFlat.filter(r => !seen.has(r.id))];
  }

  // ── List actions ──────────────────────────────────────────

  loadTopics(): void {
    this.loading = true;
    this.error = null;
    const tags = this.selectedTagFilter ? [this.selectedTagFilter] : undefined;
    this.forumService.getTopics(this.currentPage, this.pageSize, tags, this.searchQuery || undefined, this.selectedAuthorId, this.sortBy)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.topics = res.items; this.totalPages = res.totalPages; this.totalThreadCount = res.totalCount; this.loading = false; },
        error: () => { this.error = 'Failed to load topics.'; this.loading = false; }
      });
  }

  loadPopularTags(): void {
    this.forumService.getPopularTags(20).pipe(takeUntil(this.destroy$))
      .subscribe({ next: (tags) => { this.popularTags = tags; } });
  }

  loadTopUsers(): void {
    this.forumService.getTopUsers(5).pipe(takeUntil(this.destroy$))
      .subscribe({ next: (users) => { this.topUsers = users; } });
  }

  onSearch(): void { this.currentPage = 1; this.loadTopics(); }
  clearSearch(): void { this.searchQuery = ''; this.currentPage = 1; this.loadTopics(); }
  onSortChange(s: string): void { this.sortBy = s; this.currentPage = 1; this.loadTopics(); }
  filterByTag(tag: string): void { this.selectedTagFilter = tag; this.currentPage = 1; this.loadTopics(); }
  clearTagFilter(): void { this.selectedTagFilter = undefined; this.currentPage = 1; this.loadTopics(); }
  filterByAuthor(userId: string, name: string): void { this.selectedAuthorId = userId; this.selectedAuthorName = name; this.currentPage = 1; this.loadTopics(); }
  clearAuthorFilter(): void { this.selectedAuthorId = undefined; this.selectedAuthorName = undefined; this.currentPage = 1; this.loadTopics(); }
  clearAllFilters(): void { this.searchQuery = ''; this.selectedAuthorId = undefined; this.selectedAuthorName = undefined; this.selectedTagFilter = undefined; this.sortBy = 'recent'; this.currentPage = 1; this.loadTopics(); }
  goToPage(page: number): void { this.currentPage = page; this.loadTopics(); }
  previousPage(): void { if (this.currentPage > 1) this.goToPage(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); }

  onThreadLike(topicId: string): void {
    const topic = this.topics.find(t => t.id === topicId);
    if (!topic || !topic.mainPostId || topic.mainPostId === '00000000-0000-0000-0000-000000000000') return;
    const wasLiked = topic.isMainPostLikedByCurrentUser;
    topic.isMainPostLikedByCurrentUser = !wasLiked;
    topic.totalLikes += wasLiked ? -1 : 1;
    const action$ = wasLiked ? this.forumService.unlikePost(topic.mainPostId) : this.forumService.likePost(topic.mainPostId);
    action$.pipe(takeUntil(this.destroy$)).subscribe({
      error: () => { topic.isMainPostLikedByCurrentUser = wasLiked; topic.totalLikes += wasLiked ? 1 : -1; }
    });
  }

  onCreateTopicSubmit(request: CreateTopicRequest): void {
    this.forumService.createTopic(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (created) => {
        this.showCreateTopicModal = false;
        this.notificationService.showSuccess('Created', 'Your thread has been posted');
        this.openThread(created.id);
      },
      error: () => {
        this.showCreateTopicModal = false;
        this.notificationService.showError('Error', 'Failed to create topic.');
      }
    });
  }

  // ── Detail actions ────────────────────────────────────────

  openThread(topicId: string): void {
    this.view = 'detail';
    this.selectedTopicId = topicId;
    this.topicLoading = true;
    this.topicError = null;
    this.selectedTopic = null;
    this.detailMainPost = null;
    this.activeReplyForm = null;
    this.replyText = '';
    this.forumService.getTopicById(topicId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (topic) => {
        this.selectedTopic = topic;
        this.detailMainPost = topic.posts[0] ?? null;
        this.topicLoading = false;
      },
      error: () => { this.topicError = 'Could not load this thread.'; this.topicLoading = false; }
    });
  }

  retryLoadThread(): void {
    if (this.selectedTopicId) this.openThread(this.selectedTopicId);
  }

  backToList(): void {
    this.view = 'list';
    this.selectedTopic = null;
    this.detailMainPost = null;
    this.selectedTopicId = null;
    this.activeReplyForm = null;
    this.replyText = '';
  }

  openReplyForm(postId: string): void { this.activeReplyForm = postId; this.replyText = ''; }
  closeReplyForm(): void { this.activeReplyForm = null; this.replyText = ''; }

  submitReply(postId: string): void {
    if (!this.replyText.trim() || !this.selectedTopic || !this.detailMainPost) return;
    this.replySubmitting = true;
    this.forumService.createReply(this.selectedTopic.id, postId, this.replyText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newPost) => {
          this.replySubmitting = false;
          this.replyText = '';
          this.activeReplyForm = null;
          if (postId === this.detailMainPost!.id) {
            this.detailMainPost!.replies.push(newPost);
          } else {
            const parent = this.detailMainPost!.replies.find(r => r.id === postId);
            if (parent) { parent.replies = parent.replies ?? []; parent.replies.push(newPost); }
            else { this.detailMainPost!.replies.push(newPost); }
          }
        },
        error: () => { this.replySubmitting = false; this.notificationService.showError('Error', 'Failed to post reply.'); }
      });
  }

  togglePostLike(post: PostDto): void {
    const wasLiked = post.isLikedByCurrentUser;
    post.isLikedByCurrentUser = !wasLiked;
    post.likeCount += wasLiked ? -1 : 1;
    const action$ = wasLiked ? this.forumService.unlikePost(post.id) : this.forumService.likePost(post.id);
    action$.pipe(takeUntil(this.destroy$)).subscribe({
      error: () => { post.isLikedByCurrentUser = wasLiked; post.likeCount += wasLiked ? 1 : -1; }
    });
  }

  confirmDeleteReply(postId: string): void { this.replyToDelete = postId; this.showDeleteModal = true; }

  deleteReply(): void {
    if (!this.replyToDelete || !this.detailMainPost) return;
    const id = this.replyToDelete;
    this.forumService.deleteOwnPost(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.replyToDelete = null;
        this.detailMainPost!.replies = this.detailMainPost!.replies.filter(r => r.id !== id);
        for (const r of this.detailMainPost!.replies) {
          if (r.replies?.length) r.replies = r.replies.filter(n => n.id !== id);
        }
      },
      error: () => { this.showDeleteModal = false; this.notificationService.showError('Error', 'Failed to delete reply.'); }
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  fullName(a: { firstName: string; lastName: string }): string {
    return `${a.firstName} ${a.lastName}`;
  }

  initials(a: { firstName: string; lastName: string }): string {
    return (a.firstName.charAt(0) + a.lastName.charAt(0)).toUpperCase();
  }

  isPlaceholder(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  isCurrentUser(userId: string): boolean {
    return this.authStore.currentUser?.id === userId;
  }

  timeAgo(date: Date | string): string {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(m / 60);
    const days = Math.floor(h / 24);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  }
}
