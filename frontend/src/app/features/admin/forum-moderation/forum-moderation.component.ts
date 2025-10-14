import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';
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
  ArrowLeft,
  Calendar,
  TrendingUp
} from 'lucide-angular';

/**
 * Forum Moderation Admin Component
 * 
 * Admin interface for managing forum topics and posts.
 * Features:
 * - View and manage all forum topics
 * - Moderate posts and replies
 * - Pin/unpin topics
 * - Lock/unlock topics
 * - Delete inappropriate content
 * - Forum analytics and statistics
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-forum-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
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
              <h1 class="text-xl font-semibold text-neutral-900">Forum Moderation</h1>
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Topics -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-blue-100">
                <lucide-icon [img]="messageSquareIcon" [size]="20" class="text-blue-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Total Topics</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().totalTopics }}</p>
              </div>
            </div>
          </div>

          <!-- Total Posts -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-green-100">
                <lucide-icon [img]="messageCircleIcon" [size]="20" class="text-green-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Total Posts</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().totalPosts }}</p>
              </div>
            </div>
          </div>

          <!-- Active Users -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-purple-100">
                <lucide-icon [img]="usersIcon" [size]="20" class="text-purple-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Active Users</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().activeUsers }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-orange-100">
                <lucide-icon [img]="trendingIcon" [size]="20" class="text-orange-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Today's Posts</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().todayPosts }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="card mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
              <div class="relative">
                <lucide-icon [img]="searchIcon" [size]="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></lucide-icon>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (input)="onSearchChange()"
                  placeholder="Search topics by title or author..."
                  class="input-field pl-10"
                />
              </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-3">
              <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="input-field">
                <option value="">All Topics</option>
                <option value="pinned">Pinned</option>
                <option value="locked">Locked</option>
                <option value="recent">Recent (7 days)</option>
                <option value="popular">Popular</option>
              </select>

              <select [(ngModel)]="selectedSort" (change)="applyFilters()" class="input-field">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_posts">Most Posts</option>
                <option value="most_recent">Most Recent Activity</option>
              </select>

              <button (click)="clearFilters()" class="btn-outline">
                <lucide-icon [img]="filterIcon" [size]="16"></lucide-icon>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Topics Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="table-compact" *ngIf="getFilteredTopics().length > 0">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Author</th>
                  <th>Posts</th>
                  <th>Last Activity</th>
                  <th>Status</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let topic of getFilteredTopics()">
                  <td>
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <img
                          *ngIf="topic.createdBy.profileImageUrl && !isDefaultImage(topic.createdBy.profileImageUrl)"
                          [src]="topic.createdBy.profileImageUrl"
                          [alt]="topic.createdBy.firstName + ' ' + topic.createdBy.lastName"
                          class="w-10 h-10 rounded-full object-cover"
                        />
                        <span 
                          *ngIf="!topic.createdBy.profileImageUrl || isDefaultImage(topic.createdBy.profileImageUrl)"
                          class="text-sm font-medium text-neutral-600"
                        >
                          {{ topic.createdBy.firstName.charAt(0) }}{{ topic.createdBy.lastName.charAt(0) }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-medium text-neutral-900 truncate">{{ topic.title }}</h4>
                          <lucide-icon *ngIf="topic.isPinned" [img]="pinIcon" [size]="14" class="text-blue-600" title="Pinned"></lucide-icon>
                          <lucide-icon *ngIf="topic.isLocked" [img]="lockIcon" [size]="14" class="text-red-600" title="Locked"></lucide-icon>
                        </div>
                        <p class="text-sm text-neutral-500 line-clamp-2">{{ topic.description || 'No description available' }}</p>
                        <div class="flex items-center gap-2 mt-1">
                          <span *ngFor="let tag of topic.tags?.slice(0, 2)" class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {{ tag.name }}
                          </span>
                          <span *ngIf="topic.tags && topic.tags.length > 2" class="text-xs text-gray-500">
                            +{{ topic.tags.length - 2 }} more
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      <p class="font-medium text-neutral-900">{{ topic.createdBy.firstName }} {{ topic.createdBy.lastName }}</p>
                      <p class="text-neutral-500">{{ formatDate(topic.createdAt) }}</p>
                    </div>
                  </td>
                  <td>
                    <div class="text-center">
                      <p class="font-semibold text-neutral-900">{{ topic.postCount }}</p>
                      <p class="text-xs text-neutral-500">posts</p>
                    </div>
                  </td>
                  <td class="text-sm text-neutral-600">
                    {{ formatDate(topic.lastReplyAt || topic.createdAt) }}
                  </td>
                  <td>
                    <div class="flex flex-col gap-1">
                      <span *ngIf="topic.isPinned" class="badge badge-info">Pinned</span>
                      <span *ngIf="topic.isLocked" class="badge badge-error">Locked</span>
                      <span *ngIf="!topic.isPinned && !topic.isLocked" class="badge badge-neutral">Normal</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        (click)="viewTopic(topic)"
                        class="btn-ghost btn-sm"
                        title="View topic"
                      >
                        <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        (click)="togglePinTopic(topic)"
                        class="btn-ghost btn-sm"
                        [class.text-blue-600]="topic.isPinned"
                        [title]="topic.isPinned ? 'Unpin topic' : 'Pin topic'"
                      >
                        <lucide-icon [img]="topic.isPinned ? unpinIcon : pinIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        (click)="toggleLockTopic(topic)"
                        class="btn-ghost btn-sm"
                        [class.text-red-600]="topic.isLocked"
                        [title]="topic.isLocked ? 'Unlock topic' : 'Lock topic'"
                      >
                        <lucide-icon [img]="topic.isLocked ? unlockIcon : lockIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        (click)="deleteTopic(topic)"
                        class="btn-ghost btn-sm text-red-600 hover:text-red-800"
                        title="Delete topic"
                      >
                        <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="getFilteredTopics().length === 0" class="py-12 text-center">
              <lucide-icon [img]="messageSquareIcon" [size]="48" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">No topics found</h3>
              <p class="text-neutral-600 mb-4">
                <span *ngIf="searchQuery || selectedStatus">
                  Try adjusting your search criteria or filters.
                </span>
                <span *ngIf="!searchQuery && !selectedStatus">
                  No forum topics have been created yet.
                </span>
              </p>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="getFilteredTopics().length > 0" class="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <div class="text-sm text-neutral-600">
              Showing {{ getFilteredTopics().length }} of {{ stats().totalTopics }} topics
            </div>
            <div class="flex items-center gap-2">
              <button 
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="btn-outline btn-sm"
              >
                Previous
              </button>
              <span class="text-sm text-neutral-600 px-3">
                Page {{ currentPage() }} of {{ totalPages() }}
              </span>
              <button 
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Topic Detail Modal -->
      <div *ngIf="showTopicModal()" class="modal-overlay" (click)="closeTopicModal()">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="modal-content max-w-4xl w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-neutral-900">Topic Details</h3>
              <button (click)="closeTopicModal()" class="btn-ghost">
                <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
              </button>
            </div>

            <div *ngIf="selectedTopic()" class="space-y-6">
              <!-- Topic Header -->
              <div class="border-b border-neutral-200 pb-4">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img
                      *ngIf="selectedTopic()!.createdBy.profileImageUrl && !isDefaultImage(selectedTopic()!.createdBy.profileImageUrl)"
                      [src]="selectedTopic()!.createdBy.profileImageUrl"
                      [alt]="selectedTopic()!.createdBy.firstName + ' ' + selectedTopic()!.createdBy.lastName"
                      class="w-12 h-12 rounded-full object-cover"
                    />
                    <span 
                      *ngIf="!selectedTopic()!.createdBy.profileImageUrl || isDefaultImage(selectedTopic()!.createdBy.profileImageUrl)"
                      class="text-lg font-medium text-neutral-600"
                    >
                      {{ selectedTopic()!.createdBy.firstName.charAt(0) }}{{ selectedTopic()!.createdBy.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="text-xl font-semibold text-neutral-900">{{ selectedTopic()!.title }}</h4>
                      <lucide-icon *ngIf="selectedTopic()!.isPinned" [img]="pinIcon" [size]="16" class="text-blue-600" title="Pinned"></lucide-icon>
                      <lucide-icon *ngIf="selectedTopic()!.isLocked" [img]="lockIcon" [size]="16" class="text-red-600" title="Locked"></lucide-icon>
                    </div>
                    <p class="text-neutral-600 mb-2">{{ selectedTopic()!.description || 'No description available' }}</p>
                    <div class="flex items-center gap-4 text-sm text-neutral-500">
                      <span>By {{ selectedTopic()!.createdBy.firstName }} {{ selectedTopic()!.createdBy.lastName }}</span>
                      <span>•</span>
                      <span>{{ formatDate(selectedTopic()!.createdAt) }}</span>
                      <span>•</span>
                      <span>{{ selectedTopic()!.postCount }} posts</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Posts -->
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div *ngFor="let post of selectedTopic()!.posts" class="border border-neutral-200 rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <img
                        *ngIf="post.author.profileImageUrl && !isDefaultImage(post.author.profileImageUrl)"
                        [src]="post.author.profileImageUrl"
                        [alt]="post.author.firstName + ' ' + post.author.lastName"
                        class="w-8 h-8 rounded-full object-cover"
                      />
                      <span 
                        *ngIf="!post.author.profileImageUrl || isDefaultImage(post.author.profileImageUrl)"
                        class="text-xs font-medium text-neutral-600"
                      >
                        {{ post.author.firstName.charAt(0) }}{{ post.author.lastName.charAt(0) }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-2">
                        <div>
                          <p class="font-medium text-neutral-900">{{ post.author.firstName }} {{ post.author.lastName }}</p>
                          <p class="text-xs text-neutral-500">{{ formatDate(post.createdAt) }}</p>
                        </div>
                        <div class="flex items-center gap-1">
                          <button
                            (click)="editPost(post)"
                            class="btn-ghost btn-sm"
                            title="Edit post"
                          >
                            <lucide-icon [img]="editIcon" [size]="12"></lucide-icon>
                          </button>
                          <button
                            (click)="deletePost(post)"
                            class="btn-ghost btn-sm text-red-600 hover:text-red-800"
                            title="Delete post"
                          >
                            <lucide-icon [img]="trashIcon" [size]="12"></lucide-icon>
                          </button>
                        </div>
                      </div>
                      <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ post.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ForumModerationComponent implements OnInit {
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  // Lucide icons
  readonly messageSquareIcon = MessageSquare;
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly messageCircleIcon = MessageCircle;
  readonly pinIcon = Pin;
  readonly unpinIcon = Pin; // Same icon, different styling
  readonly lockIcon = Lock;
  readonly unlockIcon = Unlock;
  readonly trashIcon = Trash2;
  readonly editIcon = Edit;
  readonly eyeIcon = Eye;
  readonly alertTriangleIcon = AlertTriangle;
  readonly checkIcon = CheckCircle;
  readonly xIcon = XCircle;
  readonly arrowLeftIcon = ArrowLeft;
  readonly calendarIcon = Calendar;
  readonly trendingIcon = TrendingUp;

  // State
  isLoading = signal(false);
  searchQuery = '';
  selectedStatus = '';
  selectedSort = 'newest';
  currentPage = signal(1);
  itemsPerPage = 20;
  
  stats = signal({
    totalTopics: 0,
    totalPosts: 0,
    activeUsers: 0,
    todayPosts: 0
  });

  topics = signal<any[]>([]);

  // Modal
  showTopicModal = signal(false);
  selectedTopic = signal<any>(null);

  ngOnInit() {
    this.loadData();
  }

  refreshData() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);
    this.loadStats();
    this.loadTopics();
  }

  private loadStats() {
    // Mock data for now - replace with actual API call
    this.stats.set({
      totalTopics: 45,
      totalPosts: 320,
      activeUsers: 28,
      todayPosts: 12
    });
  }

  private loadTopics() {
    // Mock data for now - replace with actual API call
    const mockTopics = [
      {
        id: '1',
        title: 'Career Advice for Recent Graduates',
        description: 'Share your experiences and advice for new graduates entering the workforce',
        isPinned: true,
        isLocked: false,
        postCount: 15,
        createdAt: new Date('2024-01-10'),
        lastReplyAt: new Date('2024-01-15'),
        createdBy: {
          firstName: 'John',
          lastName: 'Doe',
          profileImageUrl: null
        },
        tags: [
          { name: 'career', usageCount: 5 },
          { name: 'advice', usageCount: 3 }
        ],
        posts: [
          {
            id: '1',
            content: 'Great topic! I graduated last year and here are some tips...',
            createdAt: new Date('2024-01-10'),
            author: {
              firstName: 'John',
              lastName: 'Doe',
              profileImageUrl: null
            }
          },
          {
            id: '2',
            content: 'Thanks for starting this discussion. I found networking to be crucial...',
            createdAt: new Date('2024-01-11'),
            author: {
              firstName: 'Jane',
              lastName: 'Smith',
              profileImageUrl: null
            }
          }
        ]
      },
      {
        id: '2',
        title: 'Alumni Reunion Planning',
        description: 'Let\'s plan our annual alumni reunion event',
        isPinned: false,
        isLocked: false,
        postCount: 8,
        createdAt: new Date('2024-01-12'),
        lastReplyAt: new Date('2024-01-14'),
        createdBy: {
          firstName: 'Mike',
          lastName: 'Johnson',
          profileImageUrl: null
        },
        tags: [
          { name: 'reunion', usageCount: 2 },
          { name: 'event', usageCount: 4 }
        ],
        posts: [
          {
            id: '3',
            content: 'I think we should consider a weekend in June...',
            createdAt: new Date('2024-01-12'),
            author: {
              firstName: 'Mike',
              lastName: 'Johnson',
              profileImageUrl: null
            }
          }
        ]
      },
      {
        id: '3',
        title: 'Job Opportunities in Tech',
        description: 'Share job openings and opportunities in the technology sector',
        isPinned: false,
        isLocked: true,
        postCount: 22,
        createdAt: new Date('2024-01-08'),
        lastReplyAt: new Date('2024-01-13'),
        createdBy: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          profileImageUrl: null
        },
        tags: [
          { name: 'jobs', usageCount: 8 },
          { name: 'tech', usageCount: 6 }
        ],
        posts: [
          {
            id: '4',
            content: 'Our company is hiring software engineers...',
            createdAt: new Date('2024-01-08'),
            author: {
              firstName: 'Sarah',
              lastName: 'Wilson',
              profileImageUrl: null
            }
          }
        ]
      }
    ];
    this.topics.set(mockTopics);
  }

  onSearchChange() {
    // Debounce search if needed
    this.applyFilters();
  }

  applyFilters() {
    // Filtering logic is handled in getFilteredTopics()
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedSort = 'newest';
    this.currentPage.set(1);
  }

  getFilteredTopics() {
    let filtered = this.topics();

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        topic.description?.toLowerCase().includes(query) ||
        `${topic.createdBy.firstName} ${topic.createdBy.lastName}`.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      switch (this.selectedStatus) {
        case 'pinned':
          filtered = filtered.filter(topic => topic.isPinned);
          break;
        case 'locked':
          filtered = filtered.filter(topic => topic.isLocked);
          break;
        case 'recent':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(topic => new Date(topic.createdAt) > weekAgo);
          break;
        case 'popular':
          filtered = filtered.filter(topic => topic.postCount > 10);
          break;
      }
    }

    // Apply sorting
    switch (this.selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most_posts':
        filtered.sort((a, b) => b.postCount - a.postCount);
        break;
      case 'most_recent':
        filtered.sort((a, b) => {
          const aDate = new Date(a.lastReplyAt || a.createdAt);
          const bDate = new Date(b.lastReplyAt || b.createdAt);
          return bDate.getTime() - aDate.getTime();
        });
        break;
    }

    return filtered;
  }

  totalPages() {
    return Math.ceil(this.getFilteredTopics().length / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  viewTopic(topic: any) {
    this.selectedTopic.set(topic);
    this.showTopicModal.set(true);
  }

  async togglePinTopic(topic: any) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      topic.isPinned = !topic.isPinned;
      this.notificationService.showSuccess(
        'Topic Updated', 
        topic.isPinned ? 'Topic pinned successfully' : 'Topic unpinned successfully'
      );
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to update topic');
    }
  }

  async toggleLockTopic(topic: any) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      topic.isLocked = !topic.isLocked;
      this.notificationService.showSuccess(
        'Topic Updated', 
        topic.isLocked ? 'Topic locked successfully' : 'Topic unlocked successfully'
      );
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to update topic');
    }
  }

  deleteTopic(topic: any) {
    if (confirm(`Are you sure you want to delete "${topic.title}"? This will also delete all posts in this topic.`)) {
      // Mock delete - replace with actual API call
      this.notificationService.showSuccess('Topic Deleted', 'Topic and all posts have been deleted successfully');
      this.loadTopics();
      this.loadStats();
    }
  }

  editPost(post: any) {
    // Mock edit - replace with actual implementation
    this.notificationService.showInfo('Edit Post', 'Post editing functionality will be implemented');
  }

  deletePost(post: any) {
    if (confirm('Are you sure you want to delete this post?')) {
      // Mock delete - replace with actual API call
      this.notificationService.showSuccess('Post Deleted', 'Post has been deleted successfully');
      this.loadTopics();
      this.loadStats();
    }
  }

  closeTopicModal() {
    this.showTopicModal.set(false);
    this.selectedTopic.set(null);
  }

  isDefaultImage(url: string): boolean {
    return !url || url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
