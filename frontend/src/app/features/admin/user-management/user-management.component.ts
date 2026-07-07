import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import {
  LucideAngularModule,
  Users,
  CheckCircle,
  Ban,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  UserCog,
  Mail,
  MailCheck,
  X,
  AlertTriangle,
  RefreshCw,
  Clock,
  Database,
  Edit
} from 'lucide-angular';

import { AlumniDirectoryComponent } from '../alumni-directory/alumni-directory.component';
import { AlumniApprovalsComponent } from '../alumni-approvals/alumni-approvals.component';
import { AlumniManagementComponent } from '../alumni-management/alumni-management.component';
import { ActivatedRoute } from '@angular/router';
import { CustomSelectComponent, SelectOption } from '../../../shared/components';

interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  emailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  course?: string;
  batch?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  bio?: string;
}

interface UserStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  rejectedUsers: number;
  bannedUsers: number;
  emailVerifiedUsers: number;
  activeToday: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TitleCasePipe, DatePipe, AlumniDirectoryComponent, AlumniApprovalsComponent, AlumniManagementComponent, CustomSelectComponent],
  template: `
    <div class="p-4 sm:p-6 space-y-6">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Alumni & User Management</h2>
          <p class="text-sm text-neutral-500 mt-1">Manage platform accounts, security roles, alumni approvals, and IHCAE records</p>
        </div>
        <button (click)="openCreateUserModal()" class="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm">
          <lucide-icon [img]="usersIcon" [size]="16"></lucide-icon>
          Create User
        </button>
      </div>

      <!-- Horizontal Elegant Tab Bar -->
      <div class="flex border-b border-neutral-200 flex-wrap sm:flex-nowrap sm:overflow-x-auto hide-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button (click)="setActiveTab('all')"
          class="flex items-center gap-1.5 px-4 py-3 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap"
          [class]="activeTab() === 'all' ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-primary-900'">
          <lucide-icon [img]="usersIcon" [size]="16" [strokeWidth]="activeTab() === 'all' ? 2.5 : 2"></lucide-icon>
          All Users
        </button>

        <button (click)="setActiveTab('directory')"
          class="flex items-center gap-1.5 px-4 py-3 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap"
          [class]="activeTab() === 'directory' ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-primary-900'">
          <lucide-icon [img]="usersIcon" [size]="16" [strokeWidth]="activeTab() === 'directory' ? 2.5 : 2"></lucide-icon>
          Alumni Directory
        </button>

        <button (click)="setActiveTab('approvals')"
          class="flex items-center gap-1.5 px-4 py-3 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap"
          [class]="activeTab() === 'approvals' ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-primary-900'">
          <lucide-icon [img]="clockIcon" [size]="16" [strokeWidth]="activeTab() === 'approvals' ? 2.5 : 2"></lucide-icon>
          Pending Approvals
        </button>

        <button (click)="setActiveTab('roster')"
          class="flex items-center gap-1.5 px-4 py-3 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap"
          [class]="activeTab() === 'roster' ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-primary-900'">
          <lucide-icon [img]="databaseIcon" [size]="16" [strokeWidth]="activeTab() === 'roster' ? 2.5 : 2"></lucide-icon>
          IHCAE Records
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="mt-4">
        @if (activeTab() === 'all') {
          <div class="space-y-4">
            <!-- Stats row -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pb-1">
              @for (stat of statsCards(); track stat.label) {
                <button (click)="setFilter(stat.filter)"
                  class="text-left px-4 py-3 rounded-lg border transition-colors focus:outline-none w-full"
                  [class]="currentFilter() === stat.filter ? 'bg-primary-50 border-primary-300 text-primary-950 shadow-sm' : 'bg-white border-neutral-200 hover:border-neutral-300'">
                  <p class="text-lg font-extrabold transition-colors" [class]="currentFilter() === stat.filter ? 'text-primary-700' : 'text-neutral-900'">{{ stat.value }}</p>
                  <p class="text-xs font-semibold mt-0.5 transition-colors" [class]="currentFilter() === stat.filter ? 'text-primary-600' : 'text-neutral-500'">{{ stat.label }}</p>
                </button>
              }
            </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <lucide-icon [img]="searchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></lucide-icon>
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); onSearch()"
            placeholder="Search by name or email..."
            class="w-full pl-11 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors">
        </div>
        <div class="w-full sm:w-[180px]">
          <app-custom-select
            [options]="roleFilterOptions"
            [ngModel]="selectedRoleFilter()"
            (ngModelChange)="selectedRoleFilter.set($event)"
            customClass="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700 font-normal"
          ></app-custom-select>
        </div>
        <button (click)="loadUsers()" class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shrink-0">
          <lucide-icon [img]="refreshIcon" [size]="14"></lucide-icon>
          Refresh
        </button>
      </div>

      <!-- Users table -->
      <div class="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        @if (isLoading()) {
          <div class="p-12 text-center">
            <div class="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p class="text-sm text-neutral-500 mt-3">Loading users...</p>
          </div>
        } @else if (filteredUsers().length === 0) {
          <div class="p-12 text-center">
            <lucide-icon [img]="usersIcon" [size]="32" class="mx-auto text-neutral-300"></lucide-icon>
            <p class="text-sm text-neutral-500 mt-3">No users found</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50 whitespace-nowrap">
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Verified</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Roles</th>
                  <th class="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Registered</th>
                  <th class="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100">
                @for (user of paginatedUsers(); track user.id) {
                  <tr class="hover:bg-neutral-50 transition-colors whitespace-nowrap">
                    <!-- User info -->
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          [class]="user.isBanned ? 'bg-red-100' : 'bg-neutral-100'">
                          <span class="text-xs font-semibold" [class]="user.isBanned ? 'text-red-600' : 'text-neutral-600'">
                            {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                          </span>
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-neutral-900 truncate">{{ user.firstName }} {{ user.lastName }}</p>
                          <p class="text-xs text-neutral-500 truncate">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                     <!-- Status -->
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-primary-100 text-primary-700': user.status === 'Approved' && !user.isBanned,
                          'bg-red-100 text-red-700': user.status === 'Rejected' || user.isBanned,
                          'bg-neutral-100 text-neutral-600': !['Approved','Rejected'].includes(user.status)
                        }">
                        {{ user.isBanned ? 'Blocked' : (user.status | titlecase) }}
                      </span>
                    </td>
                    <!-- Email verified -->
                    <td class="px-4 py-3">
                      @if (user.emailVerified) {
                        <lucide-icon [img]="mailCheckIcon" [size]="16" class="text-primary-600"></lucide-icon>
                      } @else {
                        <lucide-icon [img]="mailIcon" [size]="16" class="text-neutral-300"></lucide-icon>
                      }
                    </td>
                    <!-- Roles -->
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        @for (role of user.roles; track role) {
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                            [ngClass]="{
                              'bg-purple-100 text-purple-700': role === 'Admin',
                              'bg-secondary-100 text-secondary-700': role === 'Alumni',
                              'bg-neutral-100 text-neutral-600': role !== 'Admin' && role !== 'Alumni'
                            }">
                            {{ role }}
                          </span>
                        }
                      </div>
                    </td>
                    <!-- Registered -->
                    <td class="px-4 py-3">
                      <span class="text-xs text-neutral-500">{{ user.createdAt | date:'mediumDate' }}</span>
                    </td>
                    <!-- Actions -->
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        @if (user.status === 'Approved') {
                          @if (!user.isBanned) {
                            <button (click)="openBanModal(user)" title="Block user"
                              class="p-1.5 rounded text-red-600 hover:bg-red-50 transition-colors">
                              <lucide-icon [img]="banIcon" [size]="14"></lucide-icon>
                            </button>
                          } @else {
                            <button (click)="unbanUser(user)" title="Unblock user"
                              class="p-1.5 rounded text-primary-600 hover:bg-primary-50 transition-colors">
                              <lucide-icon [img]="checkIcon" [size]="14"></lucide-icon>
                            </button>
                          }
                        }

                        <button (click)="openEditDetailsModal(user)" title="Edit details"
                          class="p-1.5 rounded text-neutral-500 hover:bg-neutral-100 transition-colors">
                          <lucide-icon [img]="editIcon" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200">
              <p class="text-xs text-neutral-500">
                Showing {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, filteredUsers().length) }} of {{ filteredUsers().length }}
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
        </div>
        </div>
      }
        @if (activeTab() === 'directory') {
          <app-alumni-directory></app-alumni-directory>
        }
        @if (activeTab() === 'approvals') {
          <app-alumni-approvals></app-alumni-approvals>
        }
        @if (activeTab() === 'roster') {
          <app-alumni-management></app-alumni-management>
        }
      </div>

      <!-- Ban Modal -->
      @if (showBanModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div class="bg-white rounded-lg w-full max-w-md border border-neutral-200">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div class="flex items-center gap-2">
                <lucide-icon [img]="alertTriangleIcon" [size]="18" class="text-red-500"></lucide-icon>
                <h3 class="text-sm font-bold text-neutral-900">Block User</h3>
              </div>
              <button (click)="closeBanModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="px-5 py-4 space-y-3">
              <p class="text-sm text-neutral-600">
                Block <strong>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</strong>? They will be unable to log in.
              </p>
              <div>
                <label class="block text-xs font-medium text-neutral-600 mb-1">Reason for block (optional)</label>
                <textarea [(ngModel)]="banReason" rows="3" placeholder="Provide a reason..."
                  class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-2 px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
              <button (click)="closeBanModal()" class="px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Cancel</button>
              <button (click)="confirmBan()"
                class="px-3 py-1.5 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Block User</button>
            </div>
          </div>
        </div>
      }



      <!-- Detail Modal -->
      @if (showDetailModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div class="bg-white rounded-lg w-full max-w-lg border border-neutral-200">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 class="text-sm font-bold text-neutral-900">User Details</h3>
              <button (click)="closeDetailModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="px-5 py-4 space-y-4">
              @if (selectedUser(); as u) {
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    [class]="u.isBanned ? 'bg-red-100' : 'bg-neutral-100'">
                    <span class="text-lg font-semibold" [class]="u.isBanned ? 'text-red-600' : 'text-neutral-600'">
                      {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-neutral-900">{{ u.firstName }} {{ u.lastName }}</p>
                    <p class="text-xs text-neutral-500">{{ u.email }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Status</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.isBanned ? 'Blocked' : (u.status | titlecase) }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Email Verified</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.emailVerified ? 'Yes' : 'No' }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Registered</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.createdAt | date:'mediumDate' }}</p>
                  </div>
                  <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                    <p class="text-xs text-neutral-500">Last Updated</p>
                    <p class="text-sm font-medium text-neutral-900">{{ u.updatedAt | date:'mediumDate' }}</p>
                  </div>
                </div>
                <div class="px-3 py-2 bg-neutral-50 rounded-lg">
                  <p class="text-xs text-neutral-500 mb-1">Roles</p>
                  <div class="flex flex-wrap gap-1">
                    @for (role of u.roles; track role) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        [ngClass]="{
                          'bg-purple-100 text-purple-700': role === 'Admin',
                          'bg-secondary-100 text-secondary-700': role === 'Alumni',
                          'bg-neutral-200 text-neutral-600': role !== 'Admin' && role !== 'Alumni'
                        }">
                        {{ role }}
                      </span>
                    }
                    @if (u.roles.length === 0) {
                      <span class="text-xs text-neutral-400">No roles assigned</span>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-end px-5 py-3 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
              <button (click)="closeDetailModal()" class="px-3 py-1.5 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Create User Modal -->
      @if (showCreateUserModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div class="bg-white rounded-xl w-full max-w-lg border border-neutral-200 shadow-xl">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 class="text-sm font-bold text-neutral-900">Create User</h3>
              <button (click)="closeCreateUserModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>

            <!-- Step Indicator -->
            @if (createUserForm.roles.includes('Alumni')) {
              <div class="flex items-center justify-between px-5 pt-3.5 text-[11px] font-bold text-neutral-500 border-b border-neutral-100 pb-2.5 bg-neutral-50/50">
                <span [class.text-primary-700]="createUserStep === 1" class="uppercase tracking-wider">Step 1: Account Info</span>
                <lucide-icon [img]="chevronRightIcon" [size]="12" class="text-neutral-450"></lucide-icon>
                <span [class.text-primary-700]="createUserStep === 2" class="uppercase tracking-wider">Step 2: Alumni Profile</span>
              </div>
            }

            <form (ngSubmit)="submitCreateUser()" class="p-5 space-y-4">
              <!-- Step 1 fields -->
              @if (createUserStep === 1) {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">First Name *</label>
                      <input type="text" [(ngModel)]="createUserForm.firstName" name="firstName" required
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Last Name *</label>
                      <input type="text" [(ngModel)]="createUserForm.lastName" name="lastName" required
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Email *</label>
                    <input type="email" [(ngModel)]="createUserForm.email" name="email" required
                      class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Password *</label>
                    <div class="relative">
                      <input [type]="showCreatePassword ? 'text' : 'password'" [(ngModel)]="createUserForm.password" name="password" required
                        class="w-full px-3 py-2 pr-10 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <button type="button" (click)="showCreatePassword = !showCreatePassword"
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none rounded">
                        <lucide-icon [img]="showCreatePassword ? eyeIcon : eyeIcon" [size]="16"></lucide-icon>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Roles (Select multiple)</label>
                    <div class="flex flex-wrap gap-2 mt-1">
                      @for (role of availableRoles; track role) {
                        <label class="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs cursor-pointer hover:bg-neutral-50 transition-colors select-none"
                          [class]="createUserForm.roles.includes(role) ? 'border-primary-350 bg-primary-50/20 text-primary-750 font-semibold' : 'border-neutral-200 text-neutral-600'">
                          <input type="checkbox" [checked]="createUserForm.roles.includes(role)" (change)="toggleCreateUserRole(role)" class="rounded text-primary-600 focus:ring-primary-500">
                          {{ role }}
                        </label>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Step 2: Alumni Profile Fields -->
              @if (createUserStep === 2 && createUserForm.roles.includes('Alumni')) {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Course Type *</label>
                      <input type="text" [(ngModel)]="createUserForm.course" name="course" required placeholder="e.g. B.Tech"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Batch (e.g. May 2025) *</label>
                      <input type="text" [(ngModel)]="createUserForm.batch" name="batch" required placeholder="e.g. May 2025"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Phone Number *</label>
                    <input type="text" [(ngModel)]="createUserForm.phone" name="phone" required placeholder="e.g. +91 9999999999"
                      class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Location</label>
                      <input type="text" [(ngModel)]="createUserForm.location" name="location" placeholder="e.g. New York, USA"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Job Title</label>
                      <input type="text" [(ngModel)]="createUserForm.jobTitle" name="jobTitle" placeholder="e.g. Trekking Guide"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                  </div>
                </div>
              }

              <!-- Buttons in Footer -->
              <div class="flex justify-end gap-2 border-t border-neutral-200 pt-4 mt-4">
                @if (createUserStep === 1) {
                  <button type="button" (click)="closeCreateUserModal()" class="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Cancel</button>
                  @if (createUserForm.roles.includes('Alumni')) {
                    <button type="button" (click)="createUserStep = 2" [disabled]="!createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password"
                      class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Next: Alumni Profile
                    </button>
                  } @else {
                    <button type="submit" [disabled]="!createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password"
                      class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Create User
                    </button>
                  }
                } @else {
                  <button type="button" (click)="createUserStep = 1" class="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Back</button>
                  <button type="submit" [disabled]="!createUserForm.course || !createUserForm.batch || !createUserForm.phone"
                    class="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Create User
                  </button>
                }
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit Details Modal -->
      @if (showEditDetailsModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div class="bg-white rounded-xl w-full max-w-lg border border-neutral-200 shadow-xl">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 class="text-sm font-bold text-neutral-900">Edit User Details</h3>
              <button (click)="closeEditDetailsModal()" class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <lucide-icon [img]="xIcon" [size]="16"></lucide-icon>
              </button>
            </div>

            <!-- Tab bar -->
            <div class="flex border-b border-neutral-200 bg-neutral-50">
              <button type="button" (click)="activeModalTab = 'profile'"
                [class]="activeModalTab === 'profile' ? 'flex-1 py-2.5 text-center text-xs font-semibold border-b-2 border-primary-600 text-primary-700 bg-white' : 'flex-1 py-2.5 text-center text-xs font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50 transition-colors'">
                General Info
              </button>
              @if (editDetailsForm.roles.includes('Alumni')) {
                <button type="button" (click)="activeModalTab = 'alumni'"
                  [class]="activeModalTab === 'alumni' ? 'flex-1 py-2.5 text-center text-xs font-semibold border-b-2 border-primary-600 text-primary-700 bg-white' : 'flex-1 py-2.5 text-center text-xs font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50 transition-colors'">
                  Alumni Profile
                </button>
              }
              <button type="button" (click)="activeModalTab = 'security'"
                [class]="activeModalTab === 'security' ? 'flex-1 py-2.5 text-center text-xs font-semibold border-b-2 border-primary-600 text-primary-700 bg-white' : 'flex-1 py-2.5 text-center text-xs font-semibold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50 transition-colors'">
                Security & Password
              </button>
            </div>

            <form (ngSubmit)="submitEditDetails()" class="p-5 space-y-4">
              <!-- Tab 1: Profile Details -->
              @if (activeModalTab === 'profile') {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">First Name *</label>
                      <input type="text" [(ngModel)]="editDetailsForm.firstName" name="firstName" required
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Last Name *</label>
                      <input type="text" [(ngModel)]="editDetailsForm.lastName" name="lastName" required
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    </div>
                  </div>

                  <!-- Roles Selection -->
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Roles</label>
                    <div class="flex flex-wrap gap-2 mt-1">
                      @for (role of availableRoles; track role) {
                        <button type="button" (click)="toggleEditDetailsRole(role)"
                          [class]="editDetailsForm.roles.includes(role) 
                            ? 'px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 rounded-lg transition-colors' 
                            : 'px-3 py-1.5 text-xs font-semibold bg-white text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors'">
                          {{ role }}
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Tab 2: Alumni Profile (Dynamic) -->
              @if (activeModalTab === 'alumni' && editDetailsForm.roles.includes('Alumni')) {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Course Type *</label>
                      <input type="text" [(ngModel)]="editDetailsForm.course" name="course" placeholder="e.g. B.Tech"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Batch (e.g. May 2025) *</label>
                      <input type="text" [(ngModel)]="editDetailsForm.batch" name="batch" placeholder="e.g. May 2025"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-700 mb-1">Phone Number *</label>
                    <input type="text" [(ngModel)]="editDetailsForm.phone" name="phone" placeholder="e.g. +91 9999999999"
                      class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Location</label>
                      <input type="text" [(ngModel)]="editDetailsForm.location" name="location" placeholder="e.g. New York, USA"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-neutral-700 mb-1">Job Title</label>
                      <input type="text" [(ngModel)]="editDetailsForm.jobTitle" name="jobTitle" placeholder="e.g. Trekking Guide"
                        class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-normal">
                    </div>
                  </div>
                </div>
              }

              <!-- Tab 3: Security & Password Reset -->
              @if (activeModalTab === 'security') {
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <button type="button" (click)="triggerPasswordReset(selectedUser()!)" 
                      class="flex-1 px-3 py-2 text-xs font-semibold text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5">
                      <lucide-icon [img]="mailIcon" [size]="14"></lucide-icon> Send Reset Link Email
                    </button>
                    <button type="button" (click)="toggleInlinePasswordEdit()" 
                      class="flex-1 px-3 py-2 text-xs font-semibold text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5">
                      <lucide-icon [img]="keyIcon" [size]="14"></lucide-icon> Change Password Directly
                    </button>
                  </div>
                  @if (showInlinePasswordInput()) {
                    <div class="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2.5">
                      <label class="block text-xs font-semibold text-neutral-700">Enter New Password directly</label>
                      <div class="flex gap-2">
                        <div class="relative flex-1">
                          <input [type]="showInlinePassword ? 'text' : 'password'" [(ngModel)]="inlineNewPassword" name="inlineNewPassword" placeholder="Minimum 6 characters"
                            class="w-full px-3 py-1.5 pr-10 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <button type="button" (click)="showInlinePassword = !showInlinePassword"
                            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none rounded">
                            <lucide-icon [img]="showInlinePassword ? eyeIcon : eyeIcon" [size]="16"></lucide-icon>
                          </button>
                        </div>
                        <button type="button" (click)="saveInlinePassword()" [disabled]="!inlineNewPassword || inlineNewPassword.length < 6"
                          class="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Footer with dirty detection and indicator -->
              <div class="flex items-center justify-between border-t border-neutral-200 pt-4 mt-4 w-full">
                <div>
                  @if (isEditDetailsDirty()) {
                    <span class="text-xs font-medium text-amber-600 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Unsaved changes
                    </span>
                  }
                </div>
                <div class="flex gap-2">
                  <button type="button" (click)="closeEditDetailsModal()" class="px-4 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">Cancel</button>
                  <button type="submit" [disabled]="!isEditDetailsDirty()" 
                    [class]="isEditDetailsDirty() 
                      ? 'px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm' 
                      : 'px-4 py-2 text-sm font-semibold text-neutral-400 bg-neutral-100 border border-neutral-200 rounded-lg cursor-not-allowed'">
                    Save Details
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  readonly usersIcon = Users;
  readonly checkIcon = CheckCircle;
  readonly banIcon = Ban;
  readonly shieldIcon = Shield;
  readonly searchIcon = Search;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly eyeIcon = Eye;
  readonly keyIcon = KeyRound;
  readonly userCogIcon = UserCog;
  readonly mailIcon = Mail;
  readonly mailCheckIcon = MailCheck;
  readonly xIcon = X;
  readonly alertTriangleIcon = AlertTriangle;
  readonly refreshIcon = RefreshCw;
  readonly clockIcon = Clock;
  readonly databaseIcon = Database;
  readonly editIcon = Edit;

  Math = Math;

  allUsers = signal<UserRecord[]>([]);
  stats = signal<UserStats>({ totalUsers: 0, pendingUsers: 0, approvedUsers: 0, rejectedUsers: 0, bannedUsers: 0, emailVerifiedUsers: 0, activeToday: 0 });
  isLoading = signal(true);
  currentFilter = signal('all');
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 20;

  activeTab = signal<'all' | 'directory' | 'approvals' | 'roster'>('all');

  selectedUser = signal<UserRecord | null>(null);
  showBanModal = signal(false);
  showRoleModal = signal(false);
  showDetailModal = signal(false);
  
  // New Modals
  showCreateUserModal = signal(false);
  showEditDetailsModal = signal(false);
  showChangePasswordModal = signal(false);
  showInlinePasswordInput = signal<boolean>(false);
  inlineNewPassword = '';

  showCreatePassword = false;
  showInlinePassword = false;

  activeModalTab: 'profile' | 'alumni' | 'security' = 'profile';
  createUserStep = 1;
  
  selectedRoleFilter = signal('');
  roleFilterOptions: SelectOption[] = [
    { label: 'All Roles', value: '' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Alumni', value: 'Alumni' },
    { label: 'Content Creator', value: 'ContentCreator' }
  ];

  // Forms data
  createUserForm = {
    firstName: '', lastName: '', email: '', password: '', roles: [] as string[],
    course: '', batch: '', phone: '', location: '', jobTitle: ''
  };
  editDetailsForm = {
    firstName: '', lastName: '', phone: '', location: '', jobTitle: '', course: '', batch: '', roles: [] as string[]
  };

  isEditDetailsDirty(): boolean {
    const user = this.selectedUser();
    if (!user) return false;
    
    // Compare basic fields
    const hasBaseChanges = 
      this.editDetailsForm.firstName !== user.firstName ||
      this.editDetailsForm.lastName !== user.lastName ||
      this.editDetailsForm.phone !== (user.phone || '') ||
      this.editDetailsForm.location !== (user.location || '') ||
      this.editDetailsForm.jobTitle !== (user.jobTitle || '') ||
      this.editDetailsForm.course !== (user.course || '') ||
      this.editDetailsForm.batch !== (user.batch || '');

    // Compare roles list
    const originalRoles = user.roles || [];
    const currentRoles = this.editDetailsForm.roles;
    const hasRoleChanges = 
      originalRoles.length !== currentRoles.length ||
      originalRoles.some(r => !currentRoles.includes(r));

    return hasBaseChanges || hasRoleChanges;
  }
  changePasswordForm = { newPassword: '' };
  
  banReason = '';
  editRoles: string[] = [];
  availableRoles = ['Admin', 'Alumni', 'ContentCreator'];

  setActiveTab(tab: 'all' | 'directory' | 'approvals' | 'roster') {
    this.activeTab.set(tab);
  }

  statsCards = computed(() => {
    const s = this.stats();
    return [
      { label: 'Total Accounts', value: s.totalUsers, filter: 'all' },
      { label: 'Approved/Active', value: s.approvedUsers, filter: 'Approved' },
      { label: 'Blocked Accounts', value: s.bannedUsers, filter: 'Banned' },
      { label: 'Email Verified', value: s.emailVerifiedUsers, filter: 'Verified' },
      { label: 'Active Today', value: s.activeToday, filter: 'all' }
    ];
  });

  filteredUsers = computed(() => {
    // Filter out users with Pending status entirely on this IT security screen
    let users = this.allUsers().filter(u => u.status !== 'Pending');
    const filter = this.currentFilter();
    const query = this.searchQuery().toLowerCase().trim();
    const roleFilter = this.selectedRoleFilter();

    if (filter === 'Approved') users = users.filter(u => u.status === 'Approved' && !u.isBanned);
    else if (filter === 'Banned') users = users.filter(u => u.isBanned);
    else if (filter === 'Verified') users = users.filter(u => u.emailVerified);

    if (roleFilter) {
      users = users.filter(u => u.roles && u.roles.includes(roleFilter));
    }

    if (query) {
      users = users.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    return users;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadUsers();
    this.loadStats();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'directory') {
        this.setActiveTab('directory');
      } else if (params['tab'] === 'approvals') {
        this.setActiveTab('approvals');
      } else if (params['tab'] === 'roster') {
        this.setActiveTab('roster');
      }
    });
  }

  loadUsers() {
    this.isLoading.set(true);
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/all`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.allUsers.set(response.users || []);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.showError('Error', 'Failed to load users');
      }
    });
  }

  loadStats() {
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/stats`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats.set(response.stats);
        }
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearch() {
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.set(this.currentPage() - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.set(this.currentPage() + 1);
  }

  openBanModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.banReason = '';
    this.showBanModal.set(true);
  }

  closeBanModal() {
    this.showBanModal.set(false);
    this.selectedUser.set(null);
  }

  confirmBan() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/ban`, { reason: this.banReason }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Blocked', `${user.firstName} ${user.lastName} has been blocked`);
        this.closeBanModal();
        this.loadUsers();
        this.loadStats();
      },
      error: () => this.notificationService.showError('Error', 'Failed to block user')
    });
  }

  unbanUser(user: UserRecord) {
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/unban`, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Unblocked', `${user.firstName} ${user.lastName} has been unblocked`);
        this.loadUsers();
        this.loadStats();
      },
      error: () => this.notificationService.showError('Error', 'Failed to unblock user')
    });
  }

  triggerPasswordReset(user: UserRecord) {
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/trigger-password-reset`, {}).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password Reset', `Password reset email sent to ${user.email}`);
      },
      error: () => this.notificationService.showError('Error', 'Failed to send password reset email')
    });
  }

  openRoleModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.editRoles = [...(user.roles || [])];
    this.showRoleModal.set(true);
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedUser.set(null);
  }

  toggleRole(role: string) {
    const idx = this.editRoles.indexOf(role);
    if (idx >= 0) {
      this.editRoles.splice(idx, 1);
    } else {
      this.editRoles.push(role);
    }
  }

  saveRoles() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.put(`${environment.apiUrl}/api/v1/admin/users/${user.id}/roles`, { roles: this.editRoles }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Roles Updated', `Roles updated for ${user.firstName} ${user.lastName}`);
        this.closeRoleModal();
        this.loadUsers();
      },
      error: () => this.notificationService.showError('Error', 'Failed to update roles')
    });
  }

  openDetailModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedUser.set(null);
  }

  // Inject route to handle query parameters
  private route = inject(ActivatedRoute);

  openCreateUserModal() {
    this.createUserForm = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: [],
      course: '',
      batch: '',
      phone: '',
      location: '',
      jobTitle: ''
    };
    this.createUserStep = 1;
    this.showCreateUserModal.set(true);
  }

  closeCreateUserModal() {
    this.showCreateUserModal.set(false);
  }

  toggleCreateUserRole(role: string) {
    const idx = this.createUserForm.roles.indexOf(role);
    if (idx >= 0) {
      this.createUserForm.roles = [];
    } else {
      this.createUserForm.roles = [role];
    }
  }

  submitCreateUser() {
    this.http.post(`${environment.apiUrl}/api/v1/admin/users`, this.createUserForm).subscribe({
      next: () => {
        this.notificationService.showSuccess('User Created', 'Successfully created user');
        this.closeCreateUserModal();
        this.loadUsers();
      },
      error: (err: any) => this.notificationService.showError('Error', err.error?.message || 'Failed to create user')
    });
  }

  openEditDetailsModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.editDetailsForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      location: user.location || '',
      jobTitle: user.jobTitle || '',
      course: user.course || '',
      batch: user.batch || '',
      roles: [...(user.roles || [])]
    };
    this.showInlinePasswordInput.set(false);
    this.inlineNewPassword = '';
    this.activeModalTab = 'profile';
    this.showEditDetailsModal.set(true);
  }

  closeEditDetailsModal() {
    this.showEditDetailsModal.set(false);
    this.selectedUser.set(null);
  }

  toggleEditDetailsRole(role: string) {
    const idx = this.editDetailsForm.roles.indexOf(role);
    if (idx >= 0) {
      this.editDetailsForm.roles = [];
      if (role === 'Alumni' && this.activeModalTab === 'alumni') {
        this.activeModalTab = 'profile';
      }
    } else {
      this.editDetailsForm.roles = [role];
    }
  }

  toggleInlinePasswordEdit() {
    this.showInlinePasswordInput.update(v => !v);
    this.inlineNewPassword = '';
  }

  saveInlinePassword() {
    const user = this.selectedUser();
    if (!user || !this.inlineNewPassword || this.inlineNewPassword.length < 6) return;
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/change-password`, { newPassword: this.inlineNewPassword }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password Changed', 'Successfully changed user password directly');
        this.showInlinePasswordInput.set(false);
        this.inlineNewPassword = '';
      },
      error: (err: any) => this.notificationService.showError('Error', err.error?.message || 'Failed to change password')
    });
  }

  submitEditDetails() {
    const user = this.selectedUser();
    if (!user) return;
    
    // First, update profile details
    this.http.put(`${environment.apiUrl}/api/v1/admin/users/${user.id}/profile`, this.editDetailsForm).subscribe({
      next: () => {
        // Next, update roles
        this.http.put(`${environment.apiUrl}/api/v1/admin/users/${user.id}/roles`, { roles: this.editDetailsForm.roles }).subscribe({
          next: () => {
            this.notificationService.showSuccess('Details Saved', 'Successfully updated user details and roles');
            this.closeEditDetailsModal();
            this.loadUsers();
            this.loadStats();
          },
          error: (err: any) => this.notificationService.showError('Error', err.error?.message || 'Failed to update roles')
        });
      },
      error: (err: any) => this.notificationService.showError('Error', err.error?.message || 'Failed to update details')
    });
  }

  openChangePasswordModal(user: UserRecord) {
    this.selectedUser.set(user);
    this.changePasswordForm.newPassword = '';
    this.showChangePasswordModal.set(true);
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal.set(false);
    this.selectedUser.set(null);
  }

  submitChangePassword() {
    const user = this.selectedUser();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/api/v1/admin/users/${user.id}/change-password`, this.changePasswordForm).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password Changed', 'Successfully updated user password');
        this.closeChangePasswordModal();
      },
      error: (err: any) => this.notificationService.showError('Error', err.error?.message || 'Failed to change password')
    });
  }
}
