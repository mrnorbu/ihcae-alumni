import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Search, Eye, RefreshCw, Users, MapPin, Briefcase, GraduationCap, Mail, Phone, Calendar, User as UserIcon, Edit2 } from 'lucide-angular';
import { DirectoryService, AlumniCard, AlumniDetail } from '../../directory/services/directory.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-alumni-directory',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-neutral-900">Alumni Directory</h1>
          <p class="text-sm text-neutral-500">Browse and view alumni profiles</p>
        </div>
        <button (click)="loadAlumni()" [disabled]="isLoading()"
          class="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors">
          <lucide-icon [img]="refreshIcon" [size]="18" [class.animate-spin]="isLoading()"></lucide-icon>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <lucide-icon [img]="usersIcon" [size]="18" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ totalCount() }}</p>
              <p class="text-xs text-neutral-500">Total Alumni</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <lucide-icon [img]="graduationCapIcon" [size]="18" class="text-green-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ courses().length }}</p>
              <p class="text-xs text-neutral-500">Courses</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-neutral-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <lucide-icon [img]="mapPinIcon" [size]="18" class="text-purple-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xl font-bold text-neutral-900">{{ getUniqueLocations() }}</p>
              <p class="text-xs text-neutral-500">Locations</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white border border-neutral-200 rounded-xl p-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1 relative">
            <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
            <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
              placeholder="Search by name..."
              class="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
          </div>
          <div class="flex items-center gap-2">
            <select [(ngModel)]="selectedCourse" (change)="loadAlumni()"
              class="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="">All Courses</option>
              @for (course of courses(); track course) {
                <option [value]="course">{{ course }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Alumni Table -->
      <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          @if (isLoading()) {
            <div class="py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600 mx-auto mb-2"></div>
              <p class="text-sm text-neutral-400">Loading alumni...</p>
            </div>
          } @else if (alumni().length === 0) {
            <div class="py-12 text-center">
              <lucide-icon [img]="usersIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
              <p class="text-sm font-medium text-neutral-500">No alumni found</p>
              <p class="text-xs text-neutral-400 mt-0.5">Try adjusting your search or filters</p>
            </div>
          } @else {
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-neutral-100">
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Alumni</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Course</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Job Title</th>
                  <th class="text-left py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th class="text-right py-2.5 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-50">
                @for (a of alumni(); track a.id) {
                  <tr class="hover:bg-neutral-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          @if (a.profileImageUrl && !isDefaultImage(a.profileImageUrl)) {
                            <img [src]="a.profileImageUrl" class="w-9 h-9 rounded-full object-cover" />
                          } @else {
                            <span class="text-xs font-semibold text-neutral-500">{{ a.firstName.charAt(0) }}{{ a.lastName.charAt(0) }}</span>
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-neutral-900 truncate">{{ a.firstName }} {{ a.lastName }}</p>
                          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            @if (a.batch || a.graduationYear) {
                              <span class="text-xs text-neutral-400">Batch {{ a.batch || a.graduationYear }}</span>
                            }
                            <span class="text-xs text-neutral-400 md:hidden">{{ a.email }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 hidden md:table-cell">
                      <a [href]="'mailto:' + a.email" class="text-sm text-neutral-600 hover:text-blue-600 transition-colors">{{ a.email }}</a>
                    </td>
                    <td class="py-3 px-4 hidden md:table-cell">
                      <span class="text-sm text-neutral-600">{{ a.course || '—' }}</span>
                    </td>
                    <td class="py-3 px-4 hidden sm:table-cell">
                      <span class="text-sm text-neutral-600">{{ a.jobTitle || '—' }}</span>
                    </td>
                    <td class="py-3 px-4 hidden lg:table-cell">
                      <span class="text-sm text-neutral-500">{{ a.location || '—' }}</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button (click)="viewAlumniDetail(a)" title="View Details"
                        class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                        <lucide-icon [img]="eyeIcon" [size]="16"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        @if (totalCount() > pageSize) {
          <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <span class="text-sm text-neutral-500">{{ alumni().length }} of {{ totalCount() }} alumni</span>
            <div class="flex items-center gap-1.5">
              <button (click)="previousPage()" [disabled]="currentPage() === 1"
                class="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                Previous
              </button>
              <span class="text-sm text-neutral-500 px-2">{{ currentPage() }} / {{ totalPages() }}</span>
              <button (click)="nextPage()" [disabled]="currentPage() >= totalPages()"
                class="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Detail Modal -->
    @if (showDetailModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" (click)="closeDetailModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          @if (isLoadingDetail()) {
            <div class="py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-neutral-600 mx-auto mb-2"></div>
              <p class="text-sm text-neutral-400">Loading profile...</p>
            </div>
          }

          @if (!isLoadingDetail() && selectedAlumni()) {
            <div class="p-5">
              @if (!isEditing()) {
                <!-- Profile header -->
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    @if (selectedAlumni()!.profileImageUrl && !isDefaultImage(selectedAlumni()!.profileImageUrl!)) {
                      <img [src]="selectedAlumni()!.profileImageUrl" class="w-14 h-14 rounded-full object-cover" />
                    } @else {
                      <span class="text-lg font-semibold text-neutral-500">{{ selectedAlumni()!.firstName.charAt(0) }}{{ selectedAlumni()!.lastName.charAt(0) }}</span>
                    }
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-neutral-900">{{ selectedAlumni()!.firstName }} {{ selectedAlumni()!.lastName }}</h3>
                    @if (selectedAlumni()!.jobTitle) {
                      <p class="text-sm text-neutral-500">{{ selectedAlumni()!.jobTitle }}</p>
                    }
                    @if (selectedAlumni()!.location) {
                      <p class="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                        <lucide-icon [img]="mapPinIcon" [size]="12"></lucide-icon>
                        {{ selectedAlumni()!.location }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Details grid -->
                <div class="space-y-4">
                  <!-- Contact -->
                  <div>
                    <h5 class="text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Contact</h5>
                    <div class="space-y-2 text-sm">
                      <div class="flex items-center gap-2.5">
                        <lucide-icon [img]="mailIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                        <span class="text-neutral-700">{{ selectedAlumni()!.email }}</span>
                      </div>
                      @if (selectedAlumni()!.phone) {
                        <div class="flex items-center gap-2.5">
                          <lucide-icon [img]="phoneIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                          <span class="text-neutral-700">{{ selectedAlumni()!.phone }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Academic -->
                  <div>
                    <h5 class="text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Academic</h5>
                    <div class="space-y-2 text-sm">
                      @if (selectedAlumni()!.course) {
                        <div class="flex items-center gap-2.5">
                          <lucide-icon [img]="graduationCapIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                          <span class="text-neutral-700">{{ selectedAlumni()!.course }}</span>
                        </div>
                      }
                      @if (selectedAlumni()!.batch || selectedAlumni()!.graduationYear) {
                        <div class="flex items-center gap-2.5">
                          <lucide-icon [img]="calendarIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                          <span class="text-neutral-700">Batch {{ selectedAlumni()!.batch || selectedAlumni()!.graduationYear }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Professional -->
                  @if (selectedAlumni()!.jobTitle || selectedAlumni()!.location) {
                    <div>
                      <h5 class="text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Professional</h5>
                      <div class="space-y-2 text-sm">
                        @if (selectedAlumni()!.jobTitle) {
                          <div class="flex items-center gap-2.5">
                            <lucide-icon [img]="briefcaseIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                            <span class="text-neutral-700">{{ selectedAlumni()!.jobTitle }}</span>
                          </div>
                        }
                        @if (selectedAlumni()!.location) {
                          <div class="flex items-center gap-2.5">
                            <lucide-icon [img]="mapPinIcon" [size]="14" class="text-neutral-400"></lucide-icon>
                            <span class="text-neutral-700">{{ selectedAlumni()!.location }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Bio -->
                  @if (selectedAlumni()!.bio) {
                    <div>
                      <h5 class="text-xs font-semibold text-neutral-900 mb-2 uppercase tracking-wider">Bio</h5>
                      <p class="text-sm text-neutral-600 leading-relaxed">{{ selectedAlumni()!.bio }}</p>
                    </div>
                  }

                  <!-- Meta -->
                  <div class="pt-2 border-t border-neutral-100">
                    <p class="text-xs text-neutral-400">Joined {{ formatDate(selectedAlumni()!.createdAt) }}</p>
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-5">
                  <button (click)="startEditing()" class="px-4 py-2 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 flex items-center gap-1.5 transition-colors">
                    <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                    Edit Profile
                  </button>
                  <button (click)="closeDetailModal()" class="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">Close</button>
                </div>
              @} @else {
                <!-- Editing Form -->
                <h3 class="text-base font-bold text-neutral-900 mb-4">Edit Profile: {{ selectedAlumni()!.firstName }} {{ selectedAlumni()!.lastName }}</h3>
                <div class="space-y-3.5 text-sm max-h-[60vh] overflow-y-auto pr-1">
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Phone</label>
                    <input type="text" [(ngModel)]="editPhone" placeholder="Phone number"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Course</label>
                    <input type="text" [(ngModel)]="editCourse" placeholder="Course name"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Graduation Year / Batch</label>
                    <input type="text" [(ngModel)]="editGraduationYear" placeholder="Graduation Year (e.g. 2024)"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Job Title</label>
                    <input type="text" [(ngModel)]="editJobTitle" placeholder="Current Position"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Location</label>
                    <input type="text" [(ngModel)]="editLocation" placeholder="City, Country"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Bio</label>
                    <textarea [(ngModel)]="editBio" placeholder="Brief biography..." rows="3"
                      class="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"></textarea>
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-5">
                  <button (click)="cancelEditing()" [disabled]="isSaving()" class="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button (click)="saveProfile()" [disabled]="isSaving()" class="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {{ isSaving() ? 'Saving...' : 'Save Profile' }}
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: []
})
export class AlumniDirectoryComponent implements OnInit {
  private directoryService = inject(DirectoryService);
  private notificationService = inject(NotificationService);

  readonly searchIcon = Search;
  readonly eyeIcon = Eye;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly mapPinIcon = MapPin;
  readonly briefcaseIcon = Briefcase;
  readonly graduationCapIcon = GraduationCap;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly calendarIcon = Calendar;
  readonly userIcon = UserIcon;
  readonly editIcon = Edit2;

  private http = inject(HttpClient);

  isLoading = signal(false);
  isLoadingDetail = signal(false);
  alumni = signal<AlumniCard[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = 20;
  courses = signal<string[]>([]);

  searchQuery = '';
  selectedCourse = '';

  showDetailModal = signal(false);
  selectedAlumni = signal<AlumniDetail | null>(null);

  // Edit states
  isEditing = signal(false);
  isSaving = signal(false);
  editPhone = '';
  editCourse = '';
  editGraduationYear = '';
  editJobTitle = '';
  editLocation = '';
  editBio = '';

  private searchTimeout: any;

  ngOnInit() {
    this.loadAlumni();
    this.loadCourses();
  }

  loadAlumni() {
    this.isLoading.set(true);
    this.directoryService.getAlumniDirectory({
      search: this.searchQuery.trim() || undefined,
      course: this.selectedCourse || undefined,
      page: this.currentPage(),
      pageSize: this.pageSize
    }).subscribe({
      next: (result) => {
        this.alumni.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load alumni directory');
        this.isLoading.set(false);
      }
    });
  }

  private loadCourses() {
    this.directoryService.getAvailableCourses().subscribe({
      next: (courses) => this.courses.set(courses),
      error: () => console.error('Failed to load courses')
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadAlumni();
    }, 300);
  }

  totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize);
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadAlumni();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadAlumni();
    }
  }

  viewAlumniDetail(a: AlumniCard) {
    this.showDetailModal.set(true);
    this.isLoadingDetail.set(true);
    this.selectedAlumni.set(null);

    this.directoryService.getAlumniDetail(a.id).subscribe({
      next: (detail) => {
        this.selectedAlumni.set(detail);
        this.isLoadingDetail.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load alumni details');
        this.isLoadingDetail.set(false);
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedAlumni.set(null);
    this.isEditing.set(false);
  }

  startEditing() {
    const detail = this.selectedAlumni();
    if (!detail) return;

    this.editPhone = detail.phone || '';
    this.editCourse = detail.course || '';
    this.editGraduationYear = detail.graduationYear?.toString() || '';
    this.editJobTitle = detail.jobTitle || '';
    this.editLocation = detail.location || '';
    this.editBio = detail.bio || '';
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
  }

  saveProfile() {
    const detail = this.selectedAlumni();
    if (!detail) return;

    this.isSaving.set(true);
    const body = {
      bio: this.editBio,
      jobTitle: this.editJobTitle,
      location: this.editLocation,
      course: this.editCourse,
      batch: this.editGraduationYear,
      phone: this.editPhone
    };

    this.http.put(`${environment.apiUrl}/api/v1/admin/users/${detail.id}/profile`, body).subscribe({
      next: () => {
        this.notificationService.showSuccess('Success', 'Profile updated successfully.');
        this.isSaving.set(false);
        this.isEditing.set(false);
        // Refresh detail modal content
        this.viewAlumniDetail({
          id: detail.id,
          firstName: detail.firstName,
          lastName: detail.lastName,
          email: detail.email,
          profileImageUrl: detail.profileImageUrl
        });
        // Refresh main listing
        this.loadAlumni();
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to update profile.');
        this.isSaving.set(false);
      }
    });
  }

  getUniqueLocations(): number {
    const locations = new Set(this.alumni().map(a => a.location).filter(Boolean));
    return locations.size;
  }

  isDefaultImage(url: string): boolean {
    return !url || url.includes('placeholder') || url.includes('default');
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
