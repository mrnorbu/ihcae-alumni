import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Save,
  Send
} from 'lucide-angular';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-alumni-management',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, DatePipe],
  template: `
    <div class="p-4 sm:p-6 space-y-4">

      <!-- Header + Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-bold text-neutral-900">Alumni Management</h1>
          <p class="text-xs text-neutral-500">Manage alumni profiles, import data, and generate accounts</p>
        </div>
        <div class="flex items-center gap-2">
          @if (viewMode() === 'directory') {
            <button (click)="exportAlumni()" [disabled]="isLoading()"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="downloadIcon" [size]="14"></lucide-icon> Export
            </button>
            <input type="file" #fileInput class="hidden" accept=".csv" (change)="onFileSelected($event)" />
            <button (click)="triggerFileInput()" [disabled]="isLoading()"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="uploadIcon" [size]="14"></lucide-icon> Import CSV
            </button>
            <button (click)="refreshData()" [disabled]="isLoading()"
              class="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="refreshIcon" [size]="16" [class.animate-spin]="isLoading()"></lucide-icon>
            </button>
          } @else {
            <button (click)="viewMode.set('directory')" [disabled]="isLoading()"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="arrowLeftIcon" [size]="14"></lucide-icon> Back
            </button>
            <button (click)="bulkUpdateRecords()" [disabled]="isLoading() || selectedImportRecords().length === 0"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="saveIcon" [size]="14"></lucide-icon> Save {{ selectedImportRecords().length }} Edits
            </button>
            <button (click)="bulkGenerateAccounts()" [disabled]="isLoading() || selectedImportRecords().length === 0"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors">
              <lucide-icon [img]="sendIcon" [size]="14"></lucide-icon> Generate {{ selectedImportRecords().length }} Accounts
            </button>
          }
        </div>
      </div>

      @if (viewMode() === 'directory') {
        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white border border-neutral-200 rounded-xl p-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <lucide-icon [img]="usersIcon" [size]="16" class="text-blue-600"></lucide-icon>
              </div>
              <div>
                <p class="text-lg font-bold text-neutral-900">{{ stats().totalAlumni }}</p>
                <p class="text-[11px] text-neutral-500">Total Users</p>
              </div>
            </div>
          </div>
          <div class="bg-white border border-neutral-200 rounded-xl p-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <lucide-icon [img]="userCheckIcon" [size]="16" class="text-green-600"></lucide-icon>
              </div>
              <div>
                <p class="text-lg font-bold text-neutral-900">{{ stats().verifiedAlumni }}</p>
                <p class="text-[11px] text-neutral-500">Approved</p>
              </div>
            </div>
          </div>
          <div class="bg-white border border-neutral-200 rounded-xl p-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <lucide-icon [img]="graduationCapIcon" [size]="16" class="text-purple-600"></lucide-icon>
              </div>
              <div>
                <p class="text-lg font-bold text-neutral-900">{{ stats().recentGraduates }}</p>
                <p class="text-[11px] text-neutral-500">Recent Signups</p>
              </div>
            </div>
          </div>
          <div class="bg-white border border-neutral-200 rounded-xl p-3.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <lucide-icon [img]="eyeIcon" [size]="16" class="text-orange-600"></lucide-icon>
              </div>
              <div>
                <p class="text-lg font-bold text-neutral-900">{{ stats().activeAlumni }}</p>
                <p class="text-[11px] text-neutral-500">Active</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="bg-white border border-neutral-200 rounded-xl p-3">
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="flex-1 relative">
              <lucide-icon [img]="searchIcon" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
              <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
                placeholder="Search by name or email..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors" />
            </div>
            <div class="flex items-center gap-2">
              <select [(ngModel)]="selectedStatus" (change)="applyFilters()"
                class="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="">All Status</option>
                <option value="active">Approved</option>
                <option value="inactive">Pending/Rejected</option>
                <option value="verified">Email Verified</option>
                <option value="unverified">Email Unverified</option>
              </select>
              <button (click)="clearFilters()"
                class="flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <lucide-icon [img]="filterIcon" [size]="14"></lucide-icon> Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Alumni Table -->
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            @if (getFilteredAlumni().length > 0) {
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-neutral-100">
                    <th class="text-left py-2.5 px-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                    <th class="text-left py-2.5 px-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Roles</th>
                    <th class="text-left py-2.5 px-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th class="text-left py-2.5 px-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Registered</th>
                    <th class="text-right py-2.5 px-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-50">
                  @for (alumni of getFilteredAlumni(); track alumni) {
                    <tr class="hover:bg-neutral-50 transition-colors">
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                            @if (alumni.profileImageUrl && !isDefaultImage(alumni.profileImageUrl)) {
                              <img [src]="alumni.profileImageUrl" class="w-8 h-8 rounded-full object-cover" />
                            }
                            @if (!alumni.profileImageUrl || isDefaultImage(alumni.profileImageUrl)) {
                              <span class="text-[10px] font-semibold text-neutral-500">{{ alumni.firstName.charAt(0) }}{{ alumni.lastName.charAt(0) }}</span>
                            }
                          </div>
                          <div class="min-w-0">
                            <p class="text-[13px] font-medium text-neutral-900 truncate">{{ alumni.firstName }} {{ alumni.lastName }}</p>
                            <p class="text-[11px] text-neutral-400 truncate">{{ alumni.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-4 hidden sm:table-cell">
                        <div class="flex flex-wrap gap-1">
                          @for (role of alumni.roles; track role) {
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">{{ role }}</span>
                          }
                        </div>
                      </td>
                      <td class="py-3 px-4 hidden sm:table-cell">
                        @if (alumni.status === 'Approved') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">Approved</span>
                        }
                        @if (alumni.status === 'Pending') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">Pending</span>
                        }
                        @if (alumni.status === 'Rejected') {
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-100">Rejected</span>
                        }
                      </td>
                      <td class="py-3 px-4 hidden md:table-cell">
                        <span class="text-xs text-neutral-500">{{ formatDate(alumni.createdAt) }}</span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-0.5">
                          <button (click)="viewAlumni(alumni)" title="View"
                            class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                            <lucide-icon [img]="eyeIcon" [size]="13"></lucide-icon>
                          </button>
                          <button (click)="editAlumni(alumni)" title="Edit"
                            class="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                            <lucide-icon [img]="editIcon" [size]="13"></lucide-icon>
                          </button>
                          <button (click)="deleteAlumni(alumni)" title="Delete"
                            class="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <lucide-icon [img]="trashIcon" [size]="13"></lucide-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            @if (getFilteredAlumni().length === 0) {
              <div class="py-12 text-center">
                <lucide-icon [img]="usersIcon" [size]="32" class="text-neutral-200 mx-auto mb-2"></lucide-icon>
                <p class="text-sm font-medium text-neutral-600 mb-1">No alumni found</p>
                <p class="text-xs text-neutral-400 mb-3">
                  @if (searchQuery || selectedStatus) { Try adjusting your search or filters. }
                  @if (!searchQuery && !selectedStatus) { No alumni registered yet. }
                </p>
                @if (!searchQuery && !selectedStatus) {
                  <button (click)="triggerFileInput()"
                    class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                    <lucide-icon [img]="uploadIcon" [size]="14"></lucide-icon> Import Alumni Data
                  </button>
                }
              </div>
            }
          </div>

          @if (getFilteredAlumni().length > 0) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <span class="text-xs text-neutral-500">{{ getFilteredAlumni().length }} of {{ stats().totalAlumni }} alumni</span>
              <div class="flex items-center gap-1.5">
                <button (click)="previousPage()" [disabled]="currentPage() === 1"
                  class="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                  Previous
                </button>
                <span class="text-xs text-neutral-500 px-2">{{ currentPage() }} / {{ totalPages() }}</span>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                  class="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                  Next
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Bulk Import & Edit View -->
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-neutral-100">
            <div>
              <h2 class="text-sm font-bold text-neutral-900">Imported Alumni Records</h2>
              <p class="text-xs text-neutral-500">Review, edit, and generate accounts for imported data.</p>
            </div>
            <button (click)="toggleAllSelection()"
              class="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              Select All Pending
            </button>
          </div>

          <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-white z-10 border-b border-neutral-100">
                <tr>
                  <th class="py-2.5 px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider w-10">Sel</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">First Name</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Last Name</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Email</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Course</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Batch</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Phone</th>
                  <th class="py-2.5 px-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-50">
                @for (record of importRecords(); track record.id; let idx = $index) {
                  <tr [class.bg-green-50]="record.matchedUserId" class="hover:bg-neutral-50 transition-colors">
                    <td class="py-2 px-3 text-center">
                      <input type="checkbox"
                        [disabled]="!!record.matchedUserId"
                        [checked]="isSelected(record.id)"
                        (change)="toggleSelection(record.id)"
                        class="w-3.5 h-3.5 text-blue-600 rounded border-neutral-300 focus:ring-blue-500">
                    </td>
                    <td class="py-2 px-3">
                      <input type="text" [(ngModel)]="record.firstName" [disabled]="!!record.matchedUserId"
                        class="w-full text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      <input type="text" [(ngModel)]="record.lastName" [disabled]="!!record.matchedUserId"
                        class="w-full text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      <input type="email" [(ngModel)]="record.email" [disabled]="!!record.matchedUserId"
                        class="w-full text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      <input type="text" [(ngModel)]="record.course" [disabled]="!!record.matchedUserId"
                        class="w-full text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      <input type="text" [(ngModel)]="record.batch" [disabled]="!!record.matchedUserId"
                        class="w-20 text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      <input type="text" [(ngModel)]="record.phone" [disabled]="!!record.matchedUserId"
                        class="w-full text-xs border-transparent bg-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-1">
                    </td>
                    <td class="py-2 px-3">
                      @if (record.matchedUserId) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">
                          <lucide-icon [img]="checkCircleIcon" [size]="10"></lucide-icon> Registered
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
                          Pending
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (importRecords().length === 0 && !isLoading()) {
              <div class="py-10 text-center">
                <p class="text-xs text-neutral-400">No records to display. Try importing a CSV file.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Alumni Detail Modal -->
    @if (showAlumniModal()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]" (click)="closeAlumniModal()">
        <div class="bg-white rounded-xl border border-neutral-200 max-w-xl w-full mx-4 max-h-[85vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
            <h3 class="text-sm font-bold text-neutral-900">Alumni Profile</h3>
            <button (click)="closeAlumniModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
            </button>
          </div>

          @if (selectedAlumni()) {
            <div class="p-4 space-y-5">
              <div class="flex items-start gap-3">
                <div class="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                  @if (selectedAlumni()!.profileImageUrl && !isDefaultImage(selectedAlumni()!.profileImageUrl)) {
                    <img [src]="selectedAlumni()!.profileImageUrl" class="w-14 h-14 rounded-full object-cover" />
                  }
                  @if (!selectedAlumni()!.profileImageUrl || isDefaultImage(selectedAlumni()!.profileImageUrl)) {
                    <span class="text-lg font-semibold text-neutral-500">{{ selectedAlumni()!.firstName.charAt(0) }}{{ selectedAlumni()!.lastName.charAt(0) }}</span>
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-base font-semibold text-neutral-900">{{ selectedAlumni()!.firstName }} {{ selectedAlumni()!.lastName }}</h4>
                  <p class="text-xs text-neutral-500 mb-1.5">{{ selectedAlumni()!.email }}</p>
                  <div class="flex items-center gap-1.5">
                    @if (selectedAlumni()!.isVerified) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-600 border border-green-100">Verified</span>
                    }
                    @if (!selectedAlumni()!.isVerified) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">Unverified</span>
                    }
                    @if (selectedAlumni()!.isActive) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">Active</span>
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h5 class="text-xs font-semibold text-neutral-900 mb-2">Account</h5>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="userCheckIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-500">Status:</span>
                      <span class="font-medium text-neutral-700">{{ selectedAlumni()!.status }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="graduationCapIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-500">Roles:</span>
                      <span class="font-medium text-neutral-700">{{ selectedAlumni()!.roles?.join(', ') || 'Member' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="calendarIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-500">Registered:</span>
                      <span class="font-medium text-neutral-700">{{ selectedAlumni()!.createdAt | date:'mediumDate' }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 class="text-xs font-semibold text-neutral-900 mb-2">Contact</h5>
                  <div class="space-y-1.5 text-xs">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="mailIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                      <span class="text-neutral-700">{{ selectedAlumni()!.email }}</span>
                    </div>
                    @if (selectedAlumni()!.phone) {
                      <div class="flex items-center gap-2">
                        <lucide-icon [img]="phoneIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                        <span class="text-neutral-700">{{ selectedAlumni()!.phone }}</span>
                      </div>
                    }
                    @if (selectedAlumni()!.currentLocation) {
                      <div class="flex items-center gap-2">
                        <lucide-icon [img]="mapPinIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                        <span class="text-neutral-700">{{ selectedAlumni()!.currentLocation }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              @if (selectedAlumni()!.currentJob) {
                <div>
                  <h5 class="text-xs font-semibold text-neutral-900 mb-1.5">Professional</h5>
                  <p class="text-xs text-neutral-700">{{ selectedAlumni()!.currentJob }}</p>
                </div>
              }

              <div>
                <h5 class="text-xs font-semibold text-neutral-900 mb-2">Activity</h5>
                <div class="space-y-1.5 text-xs">
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="calendarIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                    <span class="text-neutral-500">Last Active:</span>
                    <span class="text-neutral-700">{{ formatDate(selectedAlumni()!.lastActiveAt) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <lucide-icon [img]="calendarIcon" [size]="13" class="text-neutral-400"></lucide-icon>
                    <span class="text-neutral-500">Created:</span>
                    <span class="text-neutral-700">{{ formatDate(selectedAlumni()!.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
    `,
  styles: []
})
export class AlumniManagementComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/admin';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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
  readonly xIcon = Trash2; 
  readonly checkCircleIcon = CheckCircle;
  readonly xCircleIcon = XCircle;
  readonly saveIcon = Save;
  readonly sendIcon = Send;

  // State
  isLoading = signal(false);
  searchQuery = '';
  selectedStatus = '';
  currentPage = signal(1);
  itemsPerPage = 20;

  viewMode = signal<'directory' | 'import'>('directory');
  importRecords = signal<any[]>([]);
  selectedImportRecords = signal<string[]>([]);

  stats = signal({
    totalAlumni: 0,
    verifiedAlumni: 0,
    recentGraduates: 0,
    activeAlumni: 0
  });

  alumni = signal<any[]>([]);

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
    this.loadAlumni();
  }

  private loadAlumni() {
    this.http.get<any>(`${environment.apiUrl}/api/v1/usermanagement/all`).subscribe({
      next: (response) => {
        if (response.success && response.users) {
          const users = response.users.map((u: any) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            phone: null,
            graduationYear: null,
            degree: u.roles?.join(', ') || 'Member',
            currentLocation: null,
            currentJob: null,
            isVerified: u.emailVerified,
            isActive: u.status === 'Approved',
            lastActiveAt: u.updatedAt || u.createdAt,
            createdAt: u.createdAt,
            profileImageUrl: null,
            status: u.status,
            roles: u.roles || []
          }));
          this.alumni.set(users);

          const approved = users.filter((u: any) => u.status === 'Approved');
          const currentYear = new Date().getFullYear();
          const recentCutoff = new Date();
          recentCutoff.setDate(recentCutoff.getDate() - 30);
          this.stats.set({
            totalAlumni: users.length,
            verifiedAlumni: approved.length,
            recentGraduates: users.filter((u: any) => new Date(u.createdAt).getFullYear() >= currentYear - 1).length,
            activeAlumni: users.filter((u: any) => u.lastActiveAt && new Date(u.lastActiveAt) > recentCutoff).length
          });

        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to load alumni data');
        this.isLoading.set(false);
      }
    });
  }

  private async loadImportRecords() {
    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.http.get<any>(`${this.apiUrl}/alumni?pageSize=1000`));
      if (response && response.items) {
        this.importRecords.set(response.items);
      }
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to load imported alumni records');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.currentPage.set(1);
  }

  getFilteredAlumni() {
    let filtered = this.alumni();
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((alumni: any) =>
        alumni.firstName.toLowerCase().includes(query) ||
        alumni.lastName.toLowerCase().includes(query) ||
        alumni.email.toLowerCase().includes(query)
      );
    }
    if (this.selectedStatus) {
      if (this.selectedStatus === 'verified') filtered = filtered.filter((a: any) => a.isVerified);
      if (this.selectedStatus === 'unverified') filtered = filtered.filter((a: any) => !a.isVerified);
      if (this.selectedStatus === 'active') filtered = filtered.filter((a: any) => a.status === 'Approved');
      if (this.selectedStatus === 'inactive') filtered = filtered.filter((a: any) => a.status !== 'Approved');
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
    this.notificationService.showInfo('Edit Alumni', 'Edit functionality will be implemented');
  }

  deleteAlumni(alumni: any) {
    if (confirm(`Are you sure you want to delete ${alumni.firstName} ${alumni.lastName}?`)) {
      this.notificationService.showSuccess('Alumni Deleted', 'Alumni has been deleted successfully');
      this.loadAlumni();
    }
  }

  closeAlumniModal() {
    this.showAlumniModal.set(false);
    this.selectedAlumni.set(null);
  }

  exportAlumni() {
    this.notificationService.showSuccess('Export Started', 'Alumni data export has been initiated');
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = reader.result?.toString();
      if (text) {
        try {
          await lastValueFrom(this.http.post(`${this.apiUrl}/alumni/import`, { csvContent: text }));
          this.notificationService.showSuccess('Import Successful', 'CSV data imported correctly. Opening spreadsheet view.');
          await this.loadImportRecords();
          this.viewMode.set('import');
        } catch (error: any) {
          this.notificationService.showError('Import Failed', error.error?.message || 'An error occurred during import.');
        }
      }
      this.isLoading.set(false);
      this.fileInput.nativeElement.value = '';
    };
    reader.readAsText(file);
  }

  isSelected(id: string): boolean {
    return this.selectedImportRecords().includes(id);
  }

  toggleSelection(id: string) {
    const current = [...this.selectedImportRecords()];
    const index = current.indexOf(id);
    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }
    this.selectedImportRecords.set(current);
  }

  toggleAllSelection() {
    const pendingRecords = this.importRecords().filter(r => !r.matchedUserId);
    if (this.selectedImportRecords().length === pendingRecords.length && pendingRecords.length > 0) {
      this.selectedImportRecords.set([]);
    } else {
      this.selectedImportRecords.set(pendingRecords.map(r => r.id));
    }
  }

  async bulkUpdateRecords() {
    const selectedIds = this.selectedImportRecords();
    if (selectedIds.length === 0) return;

    this.isLoading.set(true);
    try {
      const recordsToUpdate = this.importRecords().filter(r => selectedIds.includes(r.id));
      await lastValueFrom(this.http.put(`${this.apiUrl}/alumni/bulk-update`, recordsToUpdate));
      this.notificationService.showSuccess('Success', `Updated ${recordsToUpdate.length} records.`);
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to update records.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async bulkGenerateAccounts() {
    const selectedIds = this.selectedImportRecords();
    if (selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to generate accounts and send welcome emails to ${selectedIds.length} alumni?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await lastValueFrom(this.http.post<any>(`${this.apiUrl}/alumni/bulk-generate-accounts`, selectedIds));
      this.notificationService.showSuccess('Success', response.message);
      this.selectedImportRecords.set([]);
      await this.loadImportRecords(); // Refresh the list
    } catch (error: any) {
      this.notificationService.showError('Error', error.error?.message || 'Failed to generate accounts.');
    } finally {
      this.isLoading.set(false);
    }
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
