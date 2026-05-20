import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import {
  LucideAngularModule,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Phone,
  GraduationCap,
  MapPin,
  User
} from 'lucide-angular';

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  emailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  course?: string;
  batch?: string;
  location?: string;
  bio?: string;
}

@Component({
  selector: 'app-alumni-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="space-y-4">
      <!-- Search & Refresh -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
            placeholder="Search pending registrations by name or email..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
        </div>
        <button (click)="loadPendingUsers()" class="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
          <lucide-icon [img]="refreshIcon" [size]="14"></lucide-icon>
          Refresh
        </button>
      </div>

      <!-- Info note -->
      <div class="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <lucide-icon [img]="alertTriangleIcon" [size]="15" class="shrink-0 mt-0.5"></lucide-icon>
        <p>These are self-registered users whose email was <strong>not found in the alumni roster</strong>. Click a row to see their registration details before approving.</p>
      </div>

      <!-- Cards list -->
      <div class="space-y-2">
        @if (isLoading()) {
          <div class="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <div class="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p class="text-sm text-neutral-500 mt-3">Loading pending registrations...</p>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <lucide-icon [img]="clockIcon" [size]="32" class="mx-auto text-neutral-300"></lucide-icon>
            <p class="text-sm font-medium text-neutral-600 mt-3">No pending registrations</p>
            <p class="text-xs text-neutral-400 mt-1">All self-registrations have been reviewed</p>
          </div>
        } @else {
          @for (user of paginatedUsers(); track user.id) {
            <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <!-- Row header — always visible -->
              <div class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors"
                   (click)="toggleExpand(user.id)">
                <!-- Avatar -->
                <div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <span class="text-xs font-bold text-amber-700">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
                </div>
                <!-- Name + email -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-neutral-900">{{ user.firstName }} {{ user.lastName }}</p>
                  <p class="text-xs text-neutral-500 truncate">{{ user.email }}</p>
                </div>
                <!-- Badges -->
                <div class="flex items-center gap-2 shrink-0">
                  @if (user.emailVerified) {
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Email Verified</span>
                  } @else {
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">Unverified</span>
                  }
                  <span class="text-xs text-neutral-400">{{ user.createdAt | date:'mediumDate' }}</span>
                </div>
                <!-- Actions -->
                <div class="flex items-center gap-1 shrink-0" (click)="$event.stopPropagation()">
                  <button (click)="approveUser(user)" title="Approve"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <lucide-icon [img]="checkIcon" [size]="12"></lucide-icon> Approve
                  </button>
                  <button (click)="openRejectModal(user)" title="Reject"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <lucide-icon [img]="xIcon" [size]="12"></lucide-icon> Reject
                  </button>
                </div>
                <!-- Expand chevron -->
                <lucide-icon [img]="chevronDownIcon" [size]="14" class="text-neutral-400 transition-transform"
                  [class.rotate-180]="expandedUserId() === user.id"></lucide-icon>
              </div>

              <!-- Expanded detail panel -->
              @if (expandedUserId() === user.id) {
                <div class="border-t border-neutral-100 bg-neutral-50 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="flex items-start gap-2">
                    <lucide-icon [img]="phoneIcon" [size]="13" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                    <div>
                      <p class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Phone</p>
                      <p class="text-sm text-neutral-700">{{ user.phone || '—' }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <lucide-icon [img]="graduationIcon" [size]="13" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                    <div>
                      <p class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Course</p>
                      <p class="text-sm text-neutral-700">{{ user.course || '—' }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <lucide-icon [img]="graduationIcon" [size]="13" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                    <div>
                      <p class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Batch</p>
                      <p class="text-sm text-neutral-700">{{ user.batch || '—' }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <lucide-icon [img]="mapPinIcon" [size]="13" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                    <div>
                      <p class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Location</p>
                      <p class="text-sm text-neutral-700">{{ user.location || '—' }}</p>
                    </div>
                  </div>
                  @if (user.bio) {
                    <div class="col-span-2 sm:col-span-4 flex items-start gap-2">
                      <lucide-icon [img]="userIcon" [size]="13" class="text-neutral-400 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Bio</p>
                        <p class="text-sm text-neutral-700">{{ user.bio }}</p>
                      </div>
                    </div>
                  }
                  <div class="col-span-2 sm:col-span-4">
                    <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      This email is not in the alumni roster — verify their identity before approving.
                    </p>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-1 py-2">
              <span class="text-xs text-neutral-500">{{ filteredUsers().length }} pending requests</span>
              <div class="flex items-center gap-1.5">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                  class="p-1.5 border border-neutral-200 rounded hover:bg-neutral-50 disabled:opacity-40">
                  <lucide-icon [img]="chevronLeftIcon" [size]="14"></lucide-icon>
                </button>
                <span class="text-xs text-neutral-500 px-1">{{ currentPage() }} / {{ totalPages() }}</span>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                  class="p-1.5 border border-neutral-200 rounded hover:bg-neutral-50 disabled:opacity-40">
                  <lucide-icon [img]="chevronRightIcon" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Reject Modal -->
      @if (showRejectModal()) {
        <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-xl border border-neutral-200 shadow-xl max-w-md w-full overflow-hidden">
            <div class="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 class="text-base font-bold text-neutral-900 flex items-center gap-2">
                <lucide-icon [img]="alertTriangleIcon" [size]="16" class="text-red-600"></lucide-icon>
                Reject Registration
              </h3>
              <button (click)="closeRejectModal()" class="text-neutral-400 hover:text-neutral-600">
                <lucide-icon [img]="closeIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-neutral-600">
                Are you sure you want to reject the registration request from <strong class="text-neutral-900">{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>?
              </p>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reason for Rejection (Optional)</label>
                <textarea [(ngModel)]="rejectReason" rows="3"
                  placeholder="Provide a brief explanation that will be emailed to the applicant..."
                  class="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"></textarea>
              </div>
            </div>
            <div class="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
              <button (click)="closeRejectModal()" class="px-3.5 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
                Cancel
              </button>
              <button (click)="confirmReject()"
                class="px-3.5 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Reject Account
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AlumniApprovalsComponent implements OnInit {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Signals
  allPendingUsers = signal<UserRecord[]>([]);
  isLoading = signal(false);
  showRejectModal = signal(false);
  selectedUser = signal<UserRecord | null>(null);

  // Search & Pagination
  searchQuery = '';
  rejectReason = '';
  currentPage = signal(1);
  pageSize = 10;

  // Icons
  searchIcon = Search;
  refreshIcon = RefreshCw;
  clockIcon = Clock;
  checkIcon = CheckCircle;
  xIcon = XCircle;
  chevronLeftIcon = ChevronLeft;
  chevronRightIcon = ChevronRight;
  chevronDownIcon = ChevronDown;
  alertTriangleIcon = AlertTriangle;
  closeIcon = X;
  phoneIcon = Phone;
  graduationIcon = GraduationCap;
  mapPinIcon = MapPin;
  userIcon = User;

  expandedUserId = signal<string | null>(null);

  toggleExpand(id: string) {
    this.expandedUserId.set(this.expandedUserId() === id ? null : id);
  }

  // Filtered pending users
  filteredUsers = computed(() => {
    let list = this.allPendingUsers();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return list;
  });

  // Paginated users
  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  // Total pages
  totalPages = computed(() => {
    return Math.ceil(this.filteredUsers().length / this.pageSize) || 1;
  });

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    this.isLoading.set(true);
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/all`).subscribe({
      next: (response: any) => {
        if (response.success) {
          const users: UserRecord[] = response.users || [];
          // Keep only users with Pending status
          this.allPendingUsers.set(users.filter(u => u.status === 'Pending'));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.showError('Error', 'Failed to load pending registrations');
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  approveUser(user: UserRecord) {
    this.http.post(`${environment.apiUrl}/api/v1/usermanagement/approve/${user.id}`, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Approved', `${user.firstName} ${user.lastName} has been approved`);
        this.loadPendingUsers();
      },
      error: () => this.notificationService.showError('Error', 'Failed to approve user')
    });
  }

  openRejectModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
    this.selectedUser.set(null);
  }

  confirmReject() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/api/v1/usermanagement/reject/${user.id}`, { reason: this.rejectReason }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Rejected', `${user.firstName} ${user.lastName} has been rejected`);
        this.closeRejectModal();
        this.loadPendingUsers();
      },
      error: () => this.notificationService.showError('Error', 'Failed to reject user')
    });
  }
}
