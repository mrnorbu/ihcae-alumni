import { Component, inject, OnInit, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomSelectComponent, SelectOption } from '../../../shared/components';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { exportToCSV } from '../../../shared/utils/csv-exporter';
import { environment } from '../../../../environments/environment';
import {
  LucideAngularModule,
  UserCheck,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Users,
  GraduationCap,
  CheckCircle,
  Save,
  Send,
  Database,
  Link2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  MailOpen,
  Mail,
  Clock
} from 'lucide-angular';
import { lastValueFrom } from 'rxjs';

interface AlumniRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  batch: string;
  phone: string;
  location?: string;
  matchedUserId: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

@Component({
  selector: 'app-alumni-management',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ConfirmationModalComponent, CustomSelectComponent],
  template: `
    <div class="p-1 sm:p-2 space-y-3">
 
       <!-- Compact Header & Actions Bar -->
       <div class="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
         <div class="flex items-center gap-3">
           <h2 class="text-base font-bold text-neutral-900">Legacy Database</h2>
            <!-- Compact Inline Stats Badge Row -->
            <div class="hidden md:flex items-center gap-1.5 text-[11px]">
              <span (click)="filterByStatus('all')"
                [class.ring-2]="filterStatus === 'all'" [class.ring-primary-600]="filterStatus === 'all'"
                class="inline-flex items-center gap-1 bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded-full font-semibold border border-secondary-100 cursor-pointer hover:bg-secondary-100 transition-all select-none">
                <div class="w-1.5 h-1.5 rounded-full bg-secondary-500"></div> {{ stats().total }} Total
              </span>
              <span (click)="filterByStatus('registered')"
                [class.ring-2]="filterStatus === 'registered'" [class.ring-primary-600]="filterStatus === 'registered'"
                class="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-semibold border border-primary-100 cursor-pointer hover:bg-primary-100 transition-all select-none">
                <div class="w-1.5 h-1.5 rounded-full bg-primary-500"></div> {{ stats().registered }} Registered
              </span>
               <span (click)="filterByStatus('invited')"
                 [class.ring-2]="filterStatus === 'invited'" [class.ring-primary-600]="filterStatus === 'invited'"
                 class="inline-flex items-center gap-1 bg-secondary-50/80 text-secondary-800 px-2 py-0.5 rounded-full font-semibold border border-secondary-200 cursor-pointer hover:bg-secondary-100/80 transition-all select-none">
                 <div class="w-1.5 h-1.5 rounded-full bg-secondary-400"></div> {{ stats().invitationSent }} Invited
               </span>
              <span (click)="filterByStatus('pending')"
                [class.ring-2]="filterStatus === 'pending'" [class.ring-amber-500]="filterStatus === 'pending'"
                class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-100 cursor-pointer hover:bg-amber-100 transition-all select-none">
                <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div> {{ stats().pendingInvitation }} Pending Invitation
              </span>
              <span
                class="inline-flex items-center gap-1 bg-neutral-50 text-neutral-700 px-2 py-0.5 rounded-full font-semibold border border-neutral-200 select-none">
                <div class="w-1.5 h-1.5 rounded-full bg-neutral-400"></div> {{ stats().courses }} Courses
              </span>
            </div>
         </div>
         <div class="flex items-center gap-1.5">
           <input type="file" #fileInput class="hidden" accept=".csv" (change)="onFileSelected($event)" />
           <button (click)="downloadTemplate()"
             class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
             <lucide-icon [img]="downloadIcon" [size]="12"></lucide-icon> Template
           </button>
           <button (click)="openAddModal()" [disabled]="isLoading()"
             class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
             <lucide-icon [img]="plusIcon" [size]="12"></lucide-icon> Add Record
           </button>
           <button (click)="triggerFileInput()" [disabled]="isLoading()"
             class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors">
             <lucide-icon [img]="uploadIcon" [size]="12"></lucide-icon> Import CSV
           </button>
           <button (click)="exportToExcel()" [disabled]="isLoading() || isExporting()"
             class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors">
             @if (isExporting()) {
               <div class="animate-spin w-3 h-3 border-2 border-neutral-300 border-t-white rounded-full"></div>
             } @else {
               <lucide-icon [img]="downloadIcon" [size]="12"></lucide-icon>
             }
             Export Excel
           </button>
           <button (click)="loadRecords()" [disabled]="isLoading()"
             class="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 transition-colors">
             <lucide-icon [img]="refreshIcon" [size]="13" [class.animate-spin]="isLoading()"></lucide-icon>
           </button>
         </div>
       </div>

       <!-- Mobile Stats Bar -->
       <div class="flex md:hidden items-center justify-between gap-1.5 text-[10px] bg-neutral-50 p-2 rounded-lg border border-neutral-100 overflow-x-auto">
         <span (click)="filterByStatus('all')" [class.font-bold]="filterStatus === 'all'" class="text-secondary-700 bg-secondary-50 px-1.5 py-0.5 rounded-full cursor-pointer select-none">Total: {{ stats().total }}</span>
         <span (click)="filterByStatus('registered')" [class.font-bold]="filterStatus === 'registered'" class="text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded-full cursor-pointer select-none">Reg: {{ stats().registered }}</span>
          <span (click)="filterByStatus('invited')" [class.font-bold]="filterStatus === 'invited'" class="text-secondary-800 bg-secondary-50/70 px-1.5 py-0.5 rounded-full cursor-pointer select-none font-medium">Inv: {{ stats().invitationSent }}</span>
         <span (click)="filterByStatus('pending')" [class.font-bold]="filterStatus === 'pending'" class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full cursor-pointer select-none">Pend: {{ stats().pendingInvitation }}</span>
       </div>

       <!-- Search & Filter & Bulk Actions Bar -->
       <div class="flex flex-col sm:flex-row gap-2">
         <div class="flex-1 relative">
           <lucide-icon [img]="searchIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
           <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
             placeholder="Search by name, email, or course..."
             class="w-full pl-10 pr-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent">
         </div>
          <div class="flex items-center gap-2">
            <div class="w-[180px]">
              <app-custom-select
                [options]="statusFilterOptions"
                [(ngModel)]="filterStatus"
                (ngModelChange)="onSearch()"
                customClass="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer bg-white flex items-center justify-between gap-1.5 text-left text-neutral-700"
              ></app-custom-select>
            </div>
           @if (selectedIds().length > 0 && selectedUnmatchedCount() > 0) {
             <button (click)="bulkGenerateAccounts()" [disabled]="isLoading() || isBulkProcessing()"
               class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors">
               @if (isBulkProcessing()) {
                 <div class="animate-spin w-3 h-3 border-2 border-neutral-300 border-t-white rounded-full"></div>
               } @else {
                 <lucide-icon [img]="sendIcon" [size]="12"></lucide-icon>
               }
               Generate {{ selectedUnmatchedCount() }} Accounts
             </button>
           }
           @if (selectedIds().length > 0 && selectedUnclaimedCount() > 0) {
             <button (click)="bulkResendInvitations()" [disabled]="isLoading() || isBulkProcessing()"
               class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-40 transition-colors">
               @if (isBulkProcessing()) {
                 <div class="animate-spin w-3 h-3 border-2 border-neutral-300 border-t-white rounded-full"></div>
               } @else {
                 <lucide-icon [img]="mailIcon" [size]="12"></lucide-icon>
               }
               Send {{ selectedUnclaimedCount() }} Reminders
             </button>
           }
         </div>
       </div>

      <!-- Records Table -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center">
            <div class="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p class="text-sm text-neutral-500 mt-3">Loading records...</p>
          </div>
        } @else if (filteredRecords().length === 0) {
          <div class="py-12 text-center">
            <lucide-icon [img]="databaseIcon" [size]="32" class="text-neutral-300 mx-auto"></lucide-icon>
            <p class="text-sm font-medium text-neutral-600 mt-3 mb-1">No records found</p>
            <p class="text-xs text-neutral-400 mb-4">
              @if (searchQuery || filterStatus !== 'all') {
                Try adjusting your search or filters.
              } @else {
                Import a CSV file to populate the alumni database.
              }
            </p>
            @if (!searchQuery && filterStatus === 'all') {
              <button (click)="triggerFileInput()"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                <lucide-icon [img]="uploadIcon" [size]="14"></lucide-icon> Import Alumni CSV
              </button>
            }
          </div>
        } @else {
          <!-- Select all bar -->
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 bg-neutral-50">
            <div class="flex items-center gap-3">
              <button (click)="toggleAllSelection()"
                class="px-2.5 py-1 text-xs font-medium border border-neutral-200 rounded hover:bg-white transition-colors">
                {{ selectedIds().length === filteredRecords().length && filteredRecords().length > 0 ? 'Deselect All' : 'Select All' }}
              </button>
              @if (unmatchedRecords().length > 0) {
                <button (click)="selectAllUnmatched()"
                  class="px-2.5 py-1 text-xs font-medium border border-neutral-200 text-neutral-600 rounded hover:bg-neutral-50 transition-colors">
                  Select Pending Invitation ({{ unmatchedRecords().length }})
                </button>
              }
              <span class="text-xs text-neutral-500">
                {{ totalCount() }} records total &middot; {{ allRecords().length }} on this page
                @if (selectedIds().length > 0) {
                  &middot; {{ selectedIds().length }} selected
                }
              </span>
            </div>
          </div>

          <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table class="w-full">
              <thead class="sticky top-0 bg-white z-10 border-b border-neutral-200">
                <tr>
                  <th class="py-2.5 px-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-10">Sel</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">First Name</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Name</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Course</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Batch</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Phone</th>
                  <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-40">Status</th>
                  <th class="py-2.5 px-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-50">
                @for (record of paginatedRecords(); track record.id) {
                  <tr [class.bg-primary-50/20]="record.matchedUserId" class="hover:bg-neutral-50 transition-colors">
                    <td class="py-2 px-3 text-center">
                      <input type="checkbox"
                        [checked]="isSelected(record.id)"
                        (change)="toggleSelection(record.id, $event)"
                        class="w-3.5 h-3.5 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900">
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-800 font-medium">
                      {{ record.firstName }}
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-800 font-medium">
                      {{ record.lastName }}
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-600">
                      {{ record.email }}
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-600">
                      {{ record.course || '-' }}
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-600">
                      {{ record.batch || '-' }}
                    </td>
                    <td class="py-3 px-3 text-sm text-neutral-600 whitespace-nowrap">
                      {{ record.phone || '-' }}
                    </td>
                    <td class="py-3 px-3">
                      @if (record.matchedUserId && record.lastLoginAt) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200 whitespace-nowrap">
                          <lucide-icon [img]="checkCircleIcon" [size]="10"></lucide-icon> Registered
                        </span>
                      } @else if (record.matchedUserId && !record.lastLoginAt) {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700 border border-secondary-200 whitespace-nowrap">
                          <lucide-icon [img]="mailOpenIcon" [size]="10"></lucide-icon> Invitation Sent
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500 border border-neutral-200 whitespace-nowrap">
                          <lucide-icon [img]="clockIcon" [size]="10"></lucide-icon> Pending Invitation
                        </span>
                      }
                    </td>
                    <td class="py-2 px-3 text-center">
                      <div class="inline-flex items-center justify-center gap-1">
                        @if (record.matchedUserId && !record.lastLoginAt) {
                          <button (click)="resendInvitation(record.id, record.email)" title="Resend invitation email"
                            [disabled]="resendingId() === record.id"
                            class="p-1 rounded text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40">
                            @if (resendingId() === record.id) {
                              <div class="animate-spin w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full"></div>
                            } @else {
                              <lucide-icon [img]="mailOpenIcon" [size]="14"></lucide-icon>
                            }
                          </button>
                        }
                        <button (click)="openEditModal(record)" title="Edit this alumnus record"
                          class="p-1 rounded text-secondary-600 hover:bg-secondary-50 transition-colors">
                          <lucide-icon [img]="pencilIcon" [size]="14"></lucide-icon>
                        </button>
                        <button (click)="deleteRecord(record.id, record.firstName + ' ' + record.lastName)" title="Delete this alumnus record"
                          class="p-1 rounded text-red-600 hover:bg-red-50 transition-colors">
                          <lucide-icon [img]="trashIcon" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <p class="text-xs text-neutral-500">
                Showing {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, totalCount()) }} of {{ totalCount() }}
              </p>
              <div class="flex items-center gap-1">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                  class="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <lucide-icon [img]="chevronLeftIcon" [size]="14"></lucide-icon>
                </button>
                <span class="px-3 py-1 text-xs text-neutral-600">Page {{ currentPage() }} of {{ totalPages() }}</span>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                  class="p-1.5 rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <lucide-icon [img]="chevronRightIcon" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Import result banner -->
      @if (importResult()) {
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
          <lucide-icon [img]="checkCircleIcon" [size]="18" class="text-primary-600 mt-0.5 shrink-0"></lucide-icon>
          <div>
            <p class="text-sm font-medium text-primary-800">Import Complete</p>
            <p class="text-xs text-primary-700 mt-0.5">{{ importResult() }}</p>
          </div>
          <button (click)="importResult.set(null)" class="ml-auto p-1 rounded text-primary-600 hover:bg-primary-100 transition-colors">
            <lucide-icon [img]="xIcon" [size]="14"></lucide-icon>
          </button>
        </div>
      }

      <!-- CSV Import Preview Modal -->
      @if (showPreviewModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <h2 class="text-base font-bold text-neutral-900 flex items-center gap-2">
                <lucide-icon [img]="uploadIcon" [size]="16"></lucide-icon> Import Preview — {{ pendingFileName() }}
              </h2>
              <button (click)="cancelImport()" class="text-neutral-400 hover:text-neutral-600 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="p-6 space-y-5">
              <!-- Stats Cards -->
              <div class="grid grid-cols-4 gap-3 text-center">
                <div class="bg-secondary-50 border border-secondary-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-secondary-700">{{ previewStats().total }}</p>
                  <p class="text-xs text-secondary-600 mt-0.5 font-medium">Total Rows</p>
                </div>
                <div class="bg-primary-50 border border-primary-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-primary-700">{{ previewStats().ready }}</p>
                  <p class="text-xs text-primary-600 mt-0.5 font-medium">Ready to Import</p>
                </div>
                <div class="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p class="text-2xl font-bold text-amber-700">{{ previewStats().duplicates }}</p>
                  <p class="text-xs text-amber-600 mt-0.5 font-medium">Duplicates (Auto-Skipped)</p>
                </div>
                <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                  <p class="text-2xl font-bold text-neutral-500">{{ previewStats().skipped }}</p>
                  <p class="text-xs text-neutral-400 mt-0.5 font-medium">Manually Skipped</p>
                </div>
              </div>

              <!-- Interactive Rows Table -->
              <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div class="overflow-x-auto max-h-[350px] overflow-y-auto">
                  <table class="w-full">
                    <thead class="sticky top-0 bg-neutral-50 z-10 border-b border-neutral-200">
                      <tr>
                        <th class="py-2.5 px-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-16">Skip</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-32">Status</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">First Name</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Name</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Course</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider w-20">Batch</th>
                        <th class="py-2.5 px-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Phone / Location</th>
                        <th class="py-2.5 px-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100">
                      @for (row of previewRows(); track $index) {
                        <tr [class.bg-neutral-50]="row.isSkipped"
                            [class.bg-amber-50/40]="!row.isSkipped && row.isDuplicate"
                            [class.bg-primary-50/10]="!row.isSkipped && !row.isDuplicate"
                            class="hover:bg-neutral-50/60 transition-colors">
                          
                          <!-- Skip Checkbox -->
                          <td class="py-2.5 px-3 text-center">
                            <input type="checkbox"
                              [checked]="row.isSkipped"
                              (change)="toggleSkipPreviewRow(row)"
                              class="w-3.5 h-3.5 text-neutral-900 rounded border-neutral-300 focus:ring-neutral-900">
                          </td>

                          <!-- Status Badge -->
                          <td class="py-2.5 px-3 whitespace-nowrap">
                            @if (row.isSkipped) {
                              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                                Skipped
                              </span>
                            } @else if (row.isDuplicate) {
                              <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                <lucide-icon [img]="alertIcon" [size]="9"></lucide-icon> Duplicate
                              </span>
                            } @else {
                              <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 text-primary-700 border border-primary-200">
                                <lucide-icon [img]="checkCircleIcon" [size]="9"></lucide-icon> Ready
                              </span>
                            }
                          </td>

                          <!-- First Name -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <input type="text" [(ngModel)]="row.firstName" 
                                class="w-full text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                            } @else {
                              <span [class.line-through]="row.isSkipped" class="text-neutral-800 font-medium">{{ row.firstName }}</span>
                            }
                          </td>

                          <!-- Last Name -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <input type="text" [(ngModel)]="row.lastName" 
                                class="w-full text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                            } @else {
                              <span [class.line-through]="row.isSkipped" class="text-neutral-800 font-medium">{{ row.lastName }}</span>
                            }
                          </td>

                          <!-- Email -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <input type="email" [(ngModel)]="row.email" 
                                class="w-full text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                            } @else {
                              <span [class.text-amber-700]="row.isDuplicate && !row.isSkipped" 
                                    [class.line-through]="row.isSkipped" 
                                    class="text-neutral-600 font-mono text-xs">{{ row.email }}</span>
                            }
                          </td>

                          <!-- Course -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <input type="text" [(ngModel)]="row.course" 
                                class="w-full text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                            } @else {
                              <span [class.line-through]="row.isSkipped" class="text-neutral-600 text-xs">{{ row.course || '-' }}</span>
                            }
                          </td>

                          <!-- Batch -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <input type="text" [(ngModel)]="row.batch" 
                                class="w-full text-xs border border-neutral-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                            } @else {
                              <span [class.line-through]="row.isSkipped" class="text-neutral-600 text-xs">{{ row.batch || '-' }}</span>
                            }
                          </td>

                          <!-- Phone / Location -->
                          <td class="py-2.5 px-3 text-sm">
                            @if (row.isEditing) {
                              <div class="space-y-1">
                                <input type="text" [(ngModel)]="row.phone" placeholder="Phone"
                                  class="w-full text-xs border border-neutral-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                                <input type="text" [(ngModel)]="row.location" placeholder="Location"
                                  class="w-full text-xs border border-neutral-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-neutral-900">
                              </div>
                            } @else {
                              <div [class.line-through]="row.isSkipped" class="text-[11px] text-neutral-500 leading-tight">
                                <div>{{ row.phone || '-' }}</div>
                                <div class="text-neutral-400">{{ row.location || '-' }}</div>
                              </div>
                            }
                          </td>

                          <!-- Inline Actions -->
                          <td class="py-2.5 px-3 text-center">
                            <div class="inline-flex items-center gap-1.5 font-medium">
                              @if (row.isEditing) {
                                <button (click)="savePreviewRow(row)" title="Save changes"
                                  class="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                                  <lucide-icon [img]="checkCircleIcon" [size]="13"></lucide-icon>
                                </button>
                                <button (click)="cancelEditPreviewRow(row)" title="Cancel editing"
                                  class="p-1 rounded bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
                                  <lucide-icon [img]="xIcon" [size]="13"></lucide-icon>
                                </button>
                              } @else {
                                <button (click)="editPreviewRow(row)" title="Edit row inline"
                                  class="p-1 rounded text-secondary-600 hover:bg-secondary-50 transition-colors">
                                  <lucide-icon [img]="pencilIcon" [size]="13"></lucide-icon>
                                </button>
                                <button (click)="toggleSkipPreviewRow(row)" [title]="row.isSkipped ? 'Include row' : 'Skip row'"
                                  [class.text-neutral-400]="row.isSkipped"
                                  [class.text-red-500]="!row.isSkipped"
                                  class="p-1 rounded hover:bg-red-50 transition-colors">
                                  <lucide-icon [img]="row.isSkipped ? plusIcon : trashIcon" [size]="13"></lucide-icon>
                                </button>
                              }
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              @if (previewStats().duplicates > 0) {
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
                  <lucide-icon [img]="alertIcon" [size]="16" class="text-amber-600 mt-0.5 shrink-0"></lucide-icon>
                  <p class="text-xs text-amber-700 leading-normal">
                    <strong>Notice:</strong> We detected <strong>{{ previewStats().duplicates }} duplicate records</strong>. 
                    Duplicate email addresses cannot be imported. You can <strong>edit</strong> the emails directly inline to fix conflicts, or they will be automatically skipped during import.
                  </p>
                </div>
              }
            </div>
            <div class="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50">
              <span class="text-xs text-neutral-500 font-medium">
                Only the <strong>{{ previewStats().ready }} Ready</strong> records will be imported.
              </span>
              <div class="flex items-center gap-2">
                <button (click)="cancelImport()"
                  class="px-4 py-2 text-sm font-medium border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
                  Cancel
                </button>
                <button (click)="confirmImport()" [disabled]="previewStats().ready === 0"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors">
                  <lucide-icon [img]="uploadIcon" [size]="14"></lucide-icon> Import {{ previewStats().ready }} Records
                </button>
              </div>
            </div>
          </div>
        </div>
      }


      <!-- Add/Edit Record Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <h2 class="text-base font-bold text-neutral-900 flex items-center gap-2">
                <lucide-icon [img]="isEditing() ? pencilIcon : plusIcon" [size]="16" [class.text-secondary-600]="isEditing()" [class.text-neutral-900]="!isEditing()"></lucide-icon>
                {{ isEditing() ? 'Edit Alumni Record' : 'Add Alumni Record Manually' }}
              </h2>
              <button (click)="closeAddModal()" class="text-neutral-400 hover:text-neutral-600 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>

            <!-- Modal Content -->
            <form (submit)="saveRecord(); $event.preventDefault()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">First Name *</label>
                  <input type="text" [(ngModel)]="newRecord.firstName" name="firstName" required
                    class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                  <input type="text" [(ngModel)]="newRecord.lastName" name="lastName" required
                    class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input type="email" [(ngModel)]="newRecord.email" name="email" required
                  class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Course Name</label>
                <input type="text" [(ngModel)]="newRecord.course" name="course" placeholder="e.g. Adventure Tourism Management"
                  class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Batch (e.g. May 2025)</label>
                  <input type="text" [(ngModel)]="newRecord.batch" name="batch" placeholder="e.g. May 2025"
                    class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input type="text" [(ngModel)]="newRecord.phone" name="phone" placeholder="e.g. +91-98765-43210"
                    class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Location</label>
                <input type="text" [(ngModel)]="newRecord.location" name="location" placeholder="e.g. Manali, Himachal Pradesh"
                  class="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100 mt-6">
                <button type="button" (click)="closeAddModal()"
                  class="px-4 py-2 text-sm font-medium border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" [disabled]="isLoading()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors">
                  <lucide-icon [img]="saveIcon" [size]="14"></lucide-icon> Save Record
                </button>
              </div>
            </form>
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
export class AlumniManagementComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/v1/admin';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Icons
  readonly userCheckIcon = UserCheck;
  readonly searchIcon = Search;
  readonly filterIcon = Filter;
  readonly downloadIcon = Download;
  readonly uploadIcon = Upload;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;
  readonly graduationCapIcon = GraduationCap;
  readonly checkCircleIcon = CheckCircle;
  readonly saveIcon = Save;
  readonly sendIcon = Send;
  readonly databaseIcon = Database;
  readonly linkIcon = Link2;
  readonly xIcon = X;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly alertIcon = AlertCircle;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly pencilIcon = Pencil;
  readonly mailOpenIcon = MailOpen;
  readonly mailIcon = Mail;
  readonly clockIcon = Clock;

  Math = Math;

  // State
  allRecords = signal<AlumniRecord[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);
  isBulkProcessing = signal(false);
  isExporting = signal(false);
  searchQuery = '';
  filterStatus = 'all';

  statusFilterOptions: SelectOption[] = [
    { label: 'All Records', value: 'all' },
    { label: 'Registered', value: 'registered' },
    { label: 'Pending Invitation', value: 'pending' },
    { label: 'Invitation Sent (Unclaimed)', value: 'invited' }
  ];
  currentPage = signal(1);
  pageSize = 50;
  selectedIds = signal<number[]>([]);
  importResult = signal<string | null>(null);

  resendingId = signal<number | null>(null);

  // Confirmation modal
  showConfirmModal = signal(false);
  confirmModalConfig = signal<{ title: string; message: string; confirmText: string; action: () => void }>({ title: '', message: '', confirmText: 'Confirm', action: () => {} });

  openConfirm(title: string, message: string, confirmText: string, action: () => void) {
    this.confirmModalConfig.set({ title, message, confirmText, action });
    this.showConfirmModal.set(true);
  }
  onConfirm() { this.confirmModalConfig().action(); this.showConfirmModal.set(false); }
  onCancelConfirm() { this.showConfirmModal.set(false); }

  // Import preview modal state
  showPreviewModal = signal(false);
  previewResult = signal<{ importedRecords: number; skippedRecords: number; totalRecords: number; errors: string[] } | null>(null);
  pendingCsvText = signal<string | null>(null);
  pendingFileName = signal<string>('');

  // Interactive preview signals
  previewRows = signal<any[]>([]);
  dbEmailsSet = new Set<string>();

  previewStats = computed(() => {
    const rows = this.previewRows();
    const total = rows.length;
    const skipped = rows.filter(r => r.isSkipped).length;
    const duplicates = rows.filter(r => !r.isSkipped && r.isDuplicate).length;
    const ready = rows.filter(r => !r.isSkipped && !r.isDuplicate).length;
    return { total, skipped, duplicates, ready };
  });

  // Manual Add/Edit Modal State
  showAddModal = signal(false);
  isEditing = signal(false);
  newRecord = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    course: '',
    batch: '',
    phone: '',
    location: ''
  };

  dbStats = signal<{
    total: number;
    registered: number;
    invitationSent: number;
    pendingInvitation: number;
    courses: number;
  }>({
    total: 0,
    registered: 0,
    invitationSent: 0,
    pendingInvitation: 0,
    courses: 0
  });

  async loadDbStats() {
    try {
      const response = await lastValueFrom(
        this.http.get<any>(`${this.apiUrl}/alumni/stats`)
      );
      if (response) {
        this.dbStats.set({
          total: response.total ?? 0,
          registered: response.registered ?? 0,
          invitationSent: response.invitationSent ?? 0,
          pendingInvitation: response.pendingInvitation ?? 0,
          courses: response.courses ?? 0
        });
      }
    } catch (error) {
      console.error('Failed to load db stats', error);
    }
  }

  stats = computed(() => {
    return this.dbStats();
  });

  filteredRecords = computed(() => {
    return this.allRecords();
  });

  unmatchedRecords = computed(() => this.allRecords().filter(r => !r.matchedUserId));

  unclaimedRecords = computed(() => this.allRecords().filter(r => r.matchedUserId && !r.lastLoginAt));

  selectedUnmatchedCount = computed(() => {
    const ids = this.selectedIds();
    return this.allRecords().filter(r => ids.includes(r.id) && !r.matchedUserId).length;
  });

  selectedUnmatchedIds = computed(() => {
    const ids = this.selectedIds();
    return this.allRecords()
      .filter(r => ids.includes(r.id) && !r.matchedUserId)
      .map(r => r.id);
  });

  selectedUnclaimedCount = computed(() => {
    const ids = this.selectedIds();
    return this.allRecords().filter(r => ids.includes(r.id) && r.matchedUserId && !r.lastLoginAt).length;
  });

  selectedUnclaimedIds = computed(() => {
    const ids = this.selectedIds();
    return this.allRecords()
      .filter(r => ids.includes(r.id) && r.matchedUserId && !r.lastLoginAt)
      .map(r => r.id);
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalCount() / this.pageSize));
  });

  paginatedRecords = computed(() => {
    return this.filteredRecords();
  });

  ngOnInit() {
    this.loadRecords();
  }

  async loadRecords(page = this.currentPage()) {
    this.isLoading.set(true);
    try {
      const statusParam = this.filterStatus !== 'all' ? this.filterStatus : '';
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(this.pageSize),
        ...(this.searchQuery.trim() ? { searchTerm: this.searchQuery.trim() } : {}),
        ...(statusParam ? { status: statusParam } : {})
      });
      const response = await lastValueFrom(
        this.http.get<any>(`${this.apiUrl}/alumni?${params}`)
      );
      if (response && response.items) {
        this.allRecords.set(response.items);
        this.totalCount.set(response.totalCount ?? response.items.length);
      } else if (Array.isArray(response)) {
        this.allRecords.set(response);
        this.totalCount.set(response.length);
      }
      
      // Load exact global database stats from the backend
      await this.loadDbStats();
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to load alumni database records');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadRecords(1);
  }

  filterByStatus(status: string) {
    this.filterStatus = status;
    this.onSearch();
  }

  prevPage() {
    if (this.currentPage() > 1) {
      const p = this.currentPage() - 1;
      this.currentPage.set(p);
      this.loadRecords(p);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      const p = this.currentPage() + 1;
      this.currentPage.set(p);
      this.loadRecords(p);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result?.toString();
      if (text) {
        try {
          // 1. Fetch all DB emails for local duplicate checking
          const dbEmails = await lastValueFrom(
            this.http.get<string[]>(`${this.apiUrl}/alumni/emails`)
          );
          this.dbEmailsSet = new Set(dbEmails.map(e => e.toLowerCase()));

          // 2. Parse CSV
          const parsed = this.parseCsv(text);

          // 3. Store filename and preview rows
          this.pendingFileName.set(file.name);
          this.previewRows.set(parsed);

          // 4. Run duplicate detection
          this.runDuplicateDetection();

          // 5. Open Modal
          this.showPreviewModal.set(true);
        } catch (error: any) {
          this.notificationService.showError('Preview Failed', error.message || 'An error occurred while reading the CSV');
        }
      }
      this.isLoading.set(false);
      this.fileInput.nativeElement.value = '';
    };
    reader.readAsText(file);
  }

  parseCsv(text: string): any[] {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this.parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
    const firstNameIndex = headers.indexOf('firstname');
    const lastNameIndex = headers.indexOf('lastname');
    const emailIndex = headers.indexOf('email');
    const courseIndex = headers.indexOf('course');
    const batchIndex = headers.indexOf('batch');
    const phoneIndex = headers.indexOf('phone');
    const locationIndex = headers.indexOf('location');

    if (firstNameIndex === -1 || lastNameIndex === -1 || emailIndex === -1) {
      throw new Error('CSV must contain FirstName, LastName, and Email columns.');
    }

    const parsedRows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length <= Math.max(firstNameIndex, Math.max(lastNameIndex, emailIndex))) {
        continue;
      }
      const email = values[emailIndex]?.trim() || '';
      if (!email) continue;

      parsedRows.push({
        firstName: values[firstNameIndex]?.trim() || '',
        lastName: values[lastNameIndex]?.trim() || '',
        email: email,
        course: courseIndex >= 0 && courseIndex < values.length ? values[courseIndex]?.trim() : '',
        batch: batchIndex >= 0 && batchIndex < values.length ? values[batchIndex]?.trim() : '',
        phone: phoneIndex >= 0 && phoneIndex < values.length ? values[phoneIndex]?.trim() : '',
        location: locationIndex >= 0 && locationIndex < values.length ? values[locationIndex]?.trim() : '',
        isDuplicate: false,
        isSkipped: false,
        isEditing: false
      });
    }
    return parsedRows;
  }

  parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current);
    return result;
  }

  runDuplicateDetection() {
    const csvEmailSet = new Set<string>();
    const rows = this.previewRows();
    
    for (const row of rows) {
      if (row.isSkipped) {
        row.isDuplicate = false;
        continue;
      }
      const emailLower = row.email.trim().toLowerCase();
      
      if (this.dbEmailsSet.has(emailLower) || csvEmailSet.has(emailLower)) {
        row.isDuplicate = true;
      } else {
        row.isDuplicate = false;
      }
      csvEmailSet.add(emailLower);
    }
    
    this.previewRows.set([...rows]);
  }

  editPreviewRow(row: any) {
    row.isEditing = true;
    row._backup = { ...row };
  }

  savePreviewRow(row: any) {
    if (!row.firstName.trim() || !row.lastName.trim() || !row.email.trim()) {
      this.notificationService.showError('Required Fields', 'First Name, Last Name, and Email are required.');
      return;
    }
    row.isEditing = false;
    delete row._backup;
    this.runDuplicateDetection();
  }

  cancelEditPreviewRow(row: any) {
    if (row._backup) {
      Object.assign(row, row._backup);
      delete row._backup;
    }
    row.isEditing = false;
  }

  toggleSkipPreviewRow(row: any) {
    row.isSkipped = !row.isSkipped;
    this.runDuplicateDetection();
  }

  async confirmImport() {
    const rowsToImport = this.previewRows().filter(r => !r.isSkipped && !r.isDuplicate);
    if (rowsToImport.length === 0) {
      this.notificationService.showError('Empty Import', 'No valid, unskipped records to import.');
      return;
    }
    
    this.showPreviewModal.set(false);
    this.isLoading.set(true);
    
    try {
      let csvContent = 'FirstName,LastName,Email,Course,Batch,Phone,Location\n';
      for (const row of rowsToImport) {
        const escape = (val: string) => {
          const escaped = (val || '').replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
        };
        csvContent += `${escape(row.firstName)},${escape(row.lastName)},${escape(row.email)},${escape(row.course)},${escape(row.batch)},${escape(row.phone)},${escape(row.location)}\n`;
      }
      
      const response = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/alumni/import`, { csvContent })
      );
      this.importResult.set(response?.message || `Successfully imported ${rowsToImport.length} records from ${this.pendingFileName()}`);
      this.notificationService.showSuccess('Import Successful', `${rowsToImport.length} alumni records imported.`);
      this.pendingCsvText.set(null);
      this.previewRows.set([]);
      await this.loadRecords();
    } catch (error: any) {
      this.notificationService.showError('Import Failed', error.error?.message || 'An error occurred during import');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelImport() {
    this.showPreviewModal.set(false);
    this.pendingCsvText.set(null);
    this.previewRows.set([]);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelection(id: number, event: Event) {
    const current = [...this.selectedIds()];
    const index = current.indexOf(id);
    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }
    this.selectedIds.set(current);
  }

  toggleAllSelection() {
    const records = this.filteredRecords();
    if (this.selectedIds().length === records.length && records.length > 0) {
      this.selectedIds.set([]);
    } else {
      this.selectedIds.set(records.map(r => r.id));
    }
  }

  async bulkUpdateRecords() {
    const ids = this.selectedIds();
    if (ids.length === 0) return;

    this.isLoading.set(true);
    try {
      const recordsToUpdate = this.allRecords().filter(r => ids.includes(r.id));
      await lastValueFrom(this.http.put(`${this.apiUrl}/alumni/bulk-update`, recordsToUpdate));
      this.notificationService.showSuccess('Updated', `Saved changes to ${recordsToUpdate.length} records`);
    } catch (error) {
      this.notificationService.showError('Error', 'Failed to update records');
    } finally {
      this.isLoading.set(false);
    }
  }

  async bulkGenerateAccounts() {
    const ids = this.selectedUnmatchedIds();
    if (ids.length === 0) return;

    this.openConfirm(
      'Send Invitations',
      `Send invitation emails to ${ids.length} alumni? New accounts will be created and each person will receive a link to set their password. Alumni who already have active accounts will be linked silently with no email.`,
      'Send Invitations',
      () => this.executeBulkGenerate(ids)
    );
  }

  async bulkResendInvitations() {
    const ids = this.selectedUnclaimedIds();
    if (ids.length === 0) return;

    this.openConfirm(
      'Resend Claim Reminders',
      `Resend invitation emails to ${ids.length} selected alumni? They will receive a fresh link to set up and claim their account.`,
      'Send Reminders',
      () => this.executeBulkResend(ids)
    );
  }

  private async executeBulkResend(ids: number[]) {
    this.isBulkProcessing.set(true);
    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/alumni/bulk-resend-invitation`, ids)
      );
      const successCount = response.successCount ?? 0;
      const errors = response.errors ?? [];

      if (successCount > 0) {
        this.notificationService.showSuccess(
          'Reminders Sent',
          `Successfully sent ${successCount} account setup reminder${successCount > 1 ? 's' : ''}.`
        );
      }
      if (errors.length > 0) {
        this.notificationService.showError('Some Failed', `${errors.length} reminder${errors.length > 1 ? 's' : ''} could not be sent.`);
      }

      this.selectedIds.set([]);
      await this.loadRecords();
    } catch (error: any) {
      this.notificationService.showError('Error', error.error?.message || 'Failed to send bulk reminders');
    } finally {
      this.isBulkProcessing.set(false);
    }
  }

  private async executeBulkGenerate(ids: number[]) {
    this.isBulkProcessing.set(true);
    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${this.apiUrl}/alumni/bulk-generate-accounts`, ids)
      );
      const generated: number = response.generatedCount ?? 0;
      const linked: number = response.linkedCount ?? 0;
      const errors: string[] = response.errors ?? [];

      if (generated > 0) {
        this.notificationService.showSuccess(
          'Invitations Sent',
          `${generated} invitation email${generated > 1 ? 's' : ''} sent. Alumni will receive a link to set their password.`
        );
      }
      if (linked > 0) {
        this.notificationService.showInfo(
          'Already Registered',
          `${linked} record${linked > 1 ? 's were' : ' was'} linked to an existing active account — no email needed.`
        );
      }
      if (errors.length > 0) {
        this.notificationService.showError('Some Failed', `${errors.length} record${errors.length > 1 ? 's' : ''} could not be processed. Check the backend logs.`);
      }
      if (generated === 0 && linked === 0 && errors.length === 0) {
        this.notificationService.showInfo('Nothing to Do', 'All selected records already have active accounts.');
      }

      this.selectedIds.set([]);
      await this.loadRecords();
    } catch (error: any) {
      this.notificationService.showError('Error', error.error?.message || 'Failed to generate accounts');
    } finally {
      this.isBulkProcessing.set(false);
    }
  }

  openAddModal() {
    this.isEditing.set(false);
    this.newRecord = {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      course: '',
      batch: '',
      phone: '',
      location: ''
    };
    this.showAddModal.set(true);
  }

  openEditModal(record: AlumniRecord) {
    this.isEditing.set(true);
    this.newRecord = {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      course: record.course || '',
      batch: record.batch || '',
      phone: record.phone || '',
      location: record.location || ''
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  async saveRecord() {
    if (!this.newRecord.firstName || !this.newRecord.lastName || !this.newRecord.email) {
      this.notificationService.showError('Required Fields', 'First Name, Last Name, and Email are required.');
      return;
    }

    this.isLoading.set(true);
    try {
      if (this.isEditing()) {
        await lastValueFrom(
          this.http.put(`${this.apiUrl}/alumni/bulk-update`, [this.newRecord])
        );
        this.notificationService.showSuccess('Updated', 'Alumni record updated successfully.');
      } else {
        const { id, ...postPayload } = this.newRecord;
        await lastValueFrom(
          this.http.post(`${this.apiUrl}/alumni`, postPayload)
        );
        this.notificationService.showSuccess('Success', 'Alumni record created successfully.');
      }
      this.showAddModal.set(false);
      await this.loadRecords();
    } catch (error: any) {
      let errorMsg = 'Failed to save alumni record.';
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error.errors) {
          const validationErrors = error.error.errors;
          errorMsg = Object.keys(validationErrors)
            .map(key => `${key}: ${validationErrors[key].join(', ')}`)
            .join(' | ');
        }
      }
      this.notificationService.showError('Error', errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectAllUnmatched() {
    this.selectedIds.set(this.unmatchedRecords().map(r => r.id));
  }

  async resendInvitation(id: number, email: string) {
    this.resendingId.set(id);
    try {
      await lastValueFrom(
        this.http.post(`${this.apiUrl}/alumni/${id}/resend-invitation`, {})
      );
      this.notificationService.showSuccess('Invitation Sent', `Invitation email resent to ${email}`);
    } catch (error: any) {
      this.notificationService.showError('Error', error.error?.message || 'Failed to resend invitation');
    } finally {
      this.resendingId.set(null);
    }
  }

  downloadTemplate() {
    const csv = 'FirstName,LastName,Email,Course,Batch,Phone,Location\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportToExcel() {
    this.isExporting.set(true);
    const statusParam = this.filterStatus !== 'all' ? this.filterStatus : '';
    const totalToFetch = Math.max(500, this.totalCount() || 5000);
    const params = new URLSearchParams({
      page: '1',
      pageSize: String(totalToFetch),
      ...(this.searchQuery.trim() ? { searchTerm: this.searchQuery.trim() } : {}),
      ...(statusParam ? { status: statusParam } : {})
    });

    this.http.get<any>(`${this.apiUrl}/alumni?${params}`).subscribe({
      next: (response: any) => {
        const records: AlumniRecord[] = response?.items || response || [];
        if (records.length === 0) {
          this.notificationService.showWarning('No Records', 'There are no alumni records matching the filters to export');
          this.isExporting.set(false);
          return;
        }

        const columns = [
          { key: 'firstName', label: 'First Name' },
          { key: 'lastName', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'course', label: 'Course' },
          { key: 'batch', label: 'Batch' },
          { key: 'phone', label: 'Phone' },
          { key: 'location', label: 'Location', transform: (val: any) => val || '—' },
          {
            key: 'status',
            label: 'Registration Status',
            transform: (_: any, r: AlumniRecord) => {
              if (r.matchedUserId && r.lastLoginAt) return 'Registered';
              if (r.matchedUserId && !r.lastLoginAt) return 'Invitation Sent';
              return 'Pending Invitation';
            }
          },
          { key: 'lastLoginAt', label: 'Last Login', transform: (val: any) => val ? new Date(val).toLocaleDateString() : '—' },
          { key: 'createdAt', label: 'Imported At', transform: (val: any) => val ? new Date(val).toLocaleDateString() : '—' }
        ];

        const dateStr = new Date().toISOString().slice(0, 10);
        exportToCSV(records, columns, `IHCAE_Alumni_Roster_${dateStr}.csv`);
        this.notificationService.showSuccess('Export Successful', `Exported ${records.length} records to Excel CSV`);
        this.isExporting.set(false);
      },
      error: () => {
        this.notificationService.showError('Error', 'Failed to fetch database records for export');
        this.isExporting.set(false);
      }
    });
  }

  deleteRecord(id: number, name: string) {
    this.openConfirm(
      'Delete Alumni Record',
      `Delete ${name} from the roster? This cannot be undone.`,
      'Delete',
      () => this.executeDelete(id)
    );
  }

  private async executeDelete(id: number) {
    this.isLoading.set(true);
    try {
      await lastValueFrom(
        this.http.delete(`${this.apiUrl}/alumni/${id}`)
      );
      this.notificationService.showSuccess('Deleted', 'Alumni record deleted successfully.');
      await this.loadRecords();
    } catch (error: any) {
      this.notificationService.showError('Error', error.error?.message || 'Failed to delete record.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
