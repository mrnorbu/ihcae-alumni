import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserAuthStore } from '../../../core/state/user-auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';
import { 
  LucideAngularModule, 
  UserCheck, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Users,
  GraduationCap,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ArrowLeft
} from 'lucide-angular';

/**
 * Alumni Directory Admin Component
 * 
 * Admin interface for managing alumni directory data.
 * Features:
 * - View and manage alumni profiles
 * - Search and filter alumni
 * - Import/export alumni data
 * - Alumni analytics and statistics
 * - Profile verification and management
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-alumni-management',
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
              <h1 class="text-xl font-semibold text-neutral-900">Alumni Management</h1>
            </div>
            <div class="flex items-center gap-3">
              <button 
                (click)="exportAlumni()"
                class="btn-outline"
                [disabled]="isLoading()"
              >
                <lucide-icon [img]="downloadIcon" [size]="16"></lucide-icon>
                <span>Export</span>
              </button>
              <button 
                (click)="importAlumni()"
                class="btn-outline"
                [disabled]="isLoading()"
              >
                <lucide-icon [img]="uploadIcon" [size]="16"></lucide-icon>
                <span>Import</span>
              </button>
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
          <!-- Total Alumni -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-blue-100">
                <lucide-icon [img]="usersIcon" [size]="20" class="text-blue-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Total Alumni</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().totalAlumni }}</p>
              </div>
            </div>
          </div>

          <!-- Verified Alumni -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-green-100">
                <lucide-icon [img]="userCheckIcon" [size]="20" class="text-green-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Verified</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().verifiedAlumni }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Graduates -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-purple-100">
                <lucide-icon [img]="graduationCapIcon" [size]="20" class="text-purple-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Recent (2023-2024)</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().recentGraduates }}</p>
              </div>
            </div>
          </div>

          <!-- Active Alumni -->
          <div class="stat-card">
            <div class="stat-card-horizontal">
              <div class="stat-icon bg-orange-100">
                <lucide-icon [img]="eyeIcon" [size]="20" class="text-orange-600"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium text-neutral-600">Active This Month</p>
                <p class="text-2xl font-bold text-neutral-900">{{ stats().activeAlumni }}</p>
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
                  placeholder="Search alumni by name, email, or graduation year..."
                  class="input-field pl-10"
                />
              </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-3">
              <select [(ngModel)]="selectedGraduationYear" (change)="applyFilters()" class="input-field">
                <option value="">All Years</option>
                <option *ngFor="let year of graduationYears()" [value]="year">{{ year }}</option>
              </select>

              <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="input-field">
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button (click)="clearFilters()" class="btn-outline">
                <lucide-icon [img]="filterIcon" [size]="16"></lucide-icon>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Alumni Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="table-compact" *ngIf="getFilteredAlumni().length > 0">
              <thead>
                <tr>
                  <th>Alumni</th>
                  <th>Graduation</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let alumni of getFilteredAlumni()">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <img
                          *ngIf="alumni.profileImageUrl && !isDefaultImage(alumni.profileImageUrl)"
                          [src]="alumni.profileImageUrl"
                          [alt]="alumni.firstName + ' ' + alumni.lastName"
                          class="w-10 h-10 rounded-full object-cover"
                        />
                        <span 
                          *ngIf="!alumni.profileImageUrl || isDefaultImage(alumni.profileImageUrl)"
                          class="text-sm font-medium text-neutral-600"
                        >
                          {{ alumni.firstName.charAt(0) }}{{ alumni.lastName.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <p class="font-medium text-neutral-900">{{ alumni.firstName }} {{ alumni.lastName }}</p>
                        <p class="text-sm text-neutral-500">{{ alumni.email }}</p>
                        <p *ngIf="alumni.phone" class="text-xs text-neutral-400">{{ alumni.phone }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      <p class="font-medium text-neutral-900">{{ alumni.graduationYear }}</p>
                      <p class="text-neutral-500">{{ alumni.degree }}</p>
                    </div>
                  </td>
                  <td>
                    <div class="text-sm">
                      <p *ngIf="alumni.currentLocation" class="text-neutral-900">{{ alumni.currentLocation }}</p>
                      <p *ngIf="alumni.currentJob" class="text-neutral-500">{{ alumni.currentJob }}</p>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-col gap-1">
                      <span *ngIf="alumni.isVerified" class="badge badge-success">Verified</span>
                      <span *ngIf="!alumni.isVerified" class="badge badge-warning">Unverified</span>
                      <span *ngIf="alumni.isActive" class="badge badge-info">Active</span>
                      <span *ngIf="!alumni.isActive" class="badge badge-neutral">Inactive</span>
                    </div>
                  </td>
                  <td class="text-sm text-neutral-600">
                    {{ formatDate(alumni.lastActiveAt) }}
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        (click)="viewAlumni(alumni)"
                        class="btn-ghost btn-sm"
                        title="View profile"
                      >
                        <lucide-icon [img]="eyeIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        (click)="editAlumni(alumni)"
                        class="btn-ghost btn-sm"
                        title="Edit profile"
                      >
                        <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                      </button>
                      <button
                        (click)="deleteAlumni(alumni)"
                        class="btn-ghost btn-sm text-red-600 hover:text-red-800"
                        title="Delete alumni"
                      >
                        <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div *ngIf="getFilteredAlumni().length === 0" class="py-12 text-center">
              <lucide-icon [img]="usersIcon" [size]="48" class="text-neutral-300 mx-auto mb-3"></lucide-icon>
              <h3 class="text-lg font-semibold text-neutral-900 mb-2">No alumni found</h3>
              <p class="text-neutral-600 mb-4">
                <span *ngIf="searchQuery || selectedGraduationYear || selectedStatus">
                  Try adjusting your search criteria or filters.
                </span>
                <span *ngIf="!searchQuery && !selectedGraduationYear && !selectedStatus">
                  No alumni are registered in the system yet.
                </span>
              </p>
              <button *ngIf="!searchQuery && !selectedGraduationYear && !selectedStatus" (click)="importAlumni()" class="btn-primary">
                <lucide-icon [img]="uploadIcon" [size]="16"></lucide-icon>
                <span>Import Alumni Data</span>
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="getFilteredAlumni().length > 0" class="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <div class="text-sm text-neutral-600">
              Showing {{ getFilteredAlumni().length }} of {{ stats().totalAlumni }} alumni
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

      <!-- Alumni Detail Modal -->
      <div *ngIf="showAlumniModal()" class="modal-overlay" (click)="closeAlumniModal()">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="modal-content max-w-2xl w-full p-6" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-neutral-900">Alumni Profile</h3>
              <button (click)="closeAlumniModal()" class="btn-ghost">
                <lucide-icon [img]="xIcon" [size]="18"></lucide-icon>
              </button>
            </div>

            <div *ngIf="selectedAlumni()" class="space-y-6">
              <!-- Profile Header -->
              <div class="flex items-start gap-4">
                <div class="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <img
                    *ngIf="selectedAlumni()!.profileImageUrl && !isDefaultImage(selectedAlumni()!.profileImageUrl)"
                    [src]="selectedAlumni()!.profileImageUrl"
                    [alt]="selectedAlumni()!.firstName + ' ' + selectedAlumni()!.lastName"
                    class="w-20 h-20 rounded-full object-cover"
                  />
                  <span 
                    *ngIf="!selectedAlumni()!.profileImageUrl || isDefaultImage(selectedAlumni()!.profileImageUrl)"
                    class="text-2xl font-medium text-neutral-600"
                  >
                    {{ selectedAlumni()!.firstName.charAt(0) }}{{ selectedAlumni()!.lastName.charAt(0) }}
                  </span>
                </div>
                <div class="flex-1">
                  <h4 class="text-xl font-semibold text-neutral-900 mb-1">
                    {{ selectedAlumni()!.firstName }} {{ selectedAlumni()!.lastName }}
                  </h4>
                  <p class="text-neutral-600 mb-2">{{ selectedAlumni()!.email }}</p>
                  <div class="flex items-center gap-2">
                    <span *ngIf="selectedAlumni()!.isVerified" class="badge badge-success">Verified</span>
                    <span *ngIf="!selectedAlumni()!.isVerified" class="badge badge-warning">Unverified</span>
                    <span *ngIf="selectedAlumni()!.isActive" class="badge badge-info">Active</span>
                    <span *ngIf="!selectedAlumni()!.isActive" class="badge badge-neutral">Inactive</span>
                  </div>
                </div>
              </div>

              <!-- Profile Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="font-semibold text-neutral-900 mb-3">Academic Information</h5>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="graduationCapIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-600">Graduation Year:</span>
                      <span class="font-medium">{{ selectedAlumni()!.graduationYear }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="graduationCapIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-600">Degree:</span>
                      <span class="font-medium">{{ selectedAlumni()!.degree }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 class="font-semibold text-neutral-900 mb-3">Contact Information</h5>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="mailIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-600">Email:</span>
                      <span class="font-medium">{{ selectedAlumni()!.email }}</span>
                    </div>
                    <div *ngIf="selectedAlumni()!.phone" class="flex items-center gap-2">
                      <lucide-icon [img]="phoneIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-600">Phone:</span>
                      <span class="font-medium">{{ selectedAlumni()!.phone }}</span>
                    </div>
                    <div *ngIf="selectedAlumni()!.currentLocation" class="flex items-center gap-2">
                      <lucide-icon [img]="mapPinIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-600">Location:</span>
                      <span class="font-medium">{{ selectedAlumni()!.currentLocation }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Professional Information -->
              <div *ngIf="selectedAlumni()!.currentJob">
                <h5 class="font-semibold text-neutral-900 mb-3">Professional Information</h5>
                <div class="text-sm">
                  <p class="text-neutral-600 mb-1">Current Position:</p>
                  <p class="font-medium">{{ selectedAlumni()!.currentJob }}</p>
                </div>
              </div>

              <!-- Activity Information -->
              <div>
                <h5 class="font-semibold text-neutral-900 mb-3">Activity Information</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="calendarIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                    <span class="text-neutral-600">Last Active:</span>
                    <span class="font-medium">{{ formatDate(selectedAlumni()!.lastActiveAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="calendarIcon" [size]="16" class="text-neutral-400"></lucide-icon>
                    <span class="text-neutral-600">Profile Created:</span>
                    <span class="font-medium">{{ formatDate(selectedAlumni()!.createdAt) }}</span>
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
export class AlumniManagementComponent implements OnInit {
  private authStore = inject(UserAuthStore);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  // Lucide icons
  readonly userCheckIcon = UserCheck;
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly downloadIcon = Download;
  readonly uploadIcon = Upload;
  readonly editIcon = Edit;
  readonly trashIcon = Trash2;
  readonly eyeIcon = Eye;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly graduationCapIcon = GraduationCap;
  readonly mapPinIcon = MapPin;
  readonly calendarIcon = Calendar;
  readonly mailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly arrowLeftIcon = ArrowLeft;
  readonly xIcon = Trash2; // Using trash as X for now

  // State
  isLoading = signal(false);
  searchQuery = '';
  selectedGraduationYear = '';
  selectedStatus = '';
  currentPage = signal(1);
  itemsPerPage = 20;
  
  stats = signal({
    totalAlumni: 0,
    verifiedAlumni: 0,
    recentGraduates: 0,
    activeAlumni: 0
  });

  alumni = signal<any[]>([]);
  graduationYears = signal<number[]>([]);

  // Modal
  showAlumniModal = signal(false);
  selectedAlumni = signal<any>(null);

  ngOnInit() {
    this.loadData();
  }

  refreshData() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);
    this.loadStats();
    this.loadAlumni();
    this.loadGraduationYears();
  }

  private loadStats() {
    // Mock data for now - replace with actual API call
    this.stats.set({
      totalAlumni: 1250,
      verifiedAlumni: 980,
      recentGraduates: 45,
      activeAlumni: 320
    });
  }

  private loadAlumni() {
    // Mock data for now - replace with actual API call
    const mockAlumni = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        graduationYear: 2020,
        degree: 'Bachelor of Science',
        currentLocation: 'New York, NY',
        currentJob: 'Software Engineer at Tech Corp',
        isVerified: true,
        isActive: true,
        lastActiveAt: new Date('2024-01-15'),
        createdAt: new Date('2020-06-15'),
        profileImageUrl: null
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0456',
        graduationYear: 2019,
        degree: 'Master of Arts',
        currentLocation: 'San Francisco, CA',
        currentJob: 'Marketing Manager at Startup Inc',
        isVerified: true,
        isActive: false,
        lastActiveAt: new Date('2023-12-20'),
        createdAt: new Date('2019-05-20'),
        profileImageUrl: null
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com',
        graduationYear: 2021,
        degree: 'Bachelor of Engineering',
        currentLocation: 'Chicago, IL',
        currentJob: 'Data Scientist at Analytics Co',
        isVerified: false,
        isActive: true,
        lastActiveAt: new Date('2024-01-10'),
        createdAt: new Date('2021-08-10'),
        profileImageUrl: null
      }
    ];
    this.alumni.set(mockAlumni);
  }

  private loadGraduationYears() {
    // Generate graduation years from 2010 to current year
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2010; year--) {
      years.push(year);
    }
    this.graduationYears.set(years);
  }

  onSearchChange() {
    // Debounce search if needed
    this.applyFilters();
  }

  applyFilters() {
    // Filtering logic is handled in getFilteredAlumni()
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedGraduationYear = '';
    this.selectedStatus = '';
    this.currentPage.set(1);
  }

  getFilteredAlumni() {
    let filtered = this.alumni();

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(alumni => 
        alumni.firstName.toLowerCase().includes(query) ||
        alumni.lastName.toLowerCase().includes(query) ||
        alumni.email.toLowerCase().includes(query) ||
        alumni.graduationYear.toString().includes(query)
      );
    }

    // Apply graduation year filter
    if (this.selectedGraduationYear) {
      filtered = filtered.filter(alumni => 
        alumni.graduationYear.toString() === this.selectedGraduationYear
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      switch (this.selectedStatus) {
        case 'verified':
          filtered = filtered.filter(alumni => alumni.isVerified);
          break;
        case 'unverified':
          filtered = filtered.filter(alumni => !alumni.isVerified);
          break;
        case 'active':
          filtered = filtered.filter(alumni => alumni.isActive);
          break;
        case 'inactive':
          filtered = filtered.filter(alumni => !alumni.isActive);
          break;
      }
    }

    return filtered;
  }

  totalPages() {
    return Math.ceil(this.getFilteredAlumni().length / this.itemsPerPage);
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

  viewAlumni(alumni: any) {
    this.selectedAlumni.set(alumni);
    this.showAlumniModal.set(true);
  }

  editAlumni(alumni: any) {
    // Navigate to edit page or open edit modal
    this.notificationService.showInfo('Edit Alumni', 'Edit functionality will be implemented');
  }

  deleteAlumni(alumni: any) {
    if (confirm(`Are you sure you want to delete ${alumni.firstName} ${alumni.lastName}?`)) {
      // Mock delete - replace with actual API call
      this.notificationService.showSuccess('Alumni Deleted', 'Alumni has been deleted successfully');
      this.loadAlumni();
      this.loadStats();
    }
  }

  closeAlumniModal() {
    this.showAlumniModal.set(false);
    this.selectedAlumni.set(null);
  }

  exportAlumni() {
    // Mock export - replace with actual API call
    this.notificationService.showSuccess('Export Started', 'Alumni data export has been initiated');
  }

  importAlumni() {
    // Mock import - replace with actual API call
    this.notificationService.showInfo('Import Alumni', 'Import functionality will be implemented');
  }

  isDefaultImage(url: string): boolean {
    return !url || url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  }
}
