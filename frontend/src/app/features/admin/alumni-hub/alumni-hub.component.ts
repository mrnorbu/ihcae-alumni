import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Users, Clock, Database } from 'lucide-angular';
import { environment } from '../../../../environments/environment';

// Import child components
import { AlumniDirectoryComponent } from '../alumni-directory/alumni-directory.component';
import { AlumniApprovalsComponent } from '../alumni-approvals/alumni-approvals.component';
import { AlumniManagementComponent } from '../alumni-management/alumni-management.component';

@Component({
  selector: 'app-alumni-hub',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AlumniDirectoryComponent,
    AlumniApprovalsComponent,
    AlumniManagementComponent
  ],
  template: `
    <div class="p-2 sm:p-3 space-y-3">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-neutral-100 pb-2">
        <div>
          <h1 class="text-lg font-bold text-neutral-900 tracking-tight">Alumni Hub</h1>
          <p class="text-xs text-neutral-500 mt-0.5">Manage the entire alumni lifecycle: roster imports, verification queue, and directory profiles</p>
        </div>
      </div>

      <!-- Horizontal Elegant Tab Bar -->
      <div class="flex border-b border-neutral-200">
        <button (click)="setActiveTab('directory')"
          class="flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-xs transition-all duration-200"
          [class]="activeTab() === 'directory' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'">
          <lucide-icon [img]="usersIcon" [size]="14" [strokeWidth]="activeTab() === 'directory' ? 2.5 : 2"></lucide-icon>
          Alumni Directory
        </button>

        <button (click)="setActiveTab('approvals')"
          class="flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-xs transition-all duration-200"
          [class]="activeTab() === 'approvals' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'">
          <lucide-icon [img]="clockIcon" [size]="14" [strokeWidth]="activeTab() === 'approvals' ? 2.5 : 2"></lucide-icon>
          Pending Approvals
          @if (pendingCount() > 0) {
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
              {{ pendingCount() }}
            </span>
          }
        </button>

        <button (click)="setActiveTab('roster')"
          class="flex items-center gap-1.5 px-4 py-2 border-b-2 font-semibold text-xs transition-all duration-200"
          [class]="activeTab() === 'roster' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-900'">
          <lucide-icon [img]="databaseIcon" [size]="14" [strokeWidth]="activeTab() === 'roster' ? 2.5 : 2"></lucide-icon>
          Legacy Roster
        </button>
      </div>

      <!-- Tab Content Area with Smooth Fade-in -->
      <div class="mt-2 animate-fade-in">
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
    </div>
  `
})
export class AlumniHubComponent implements OnInit {
  private http = inject(HttpClient);

  // Active Tab Signal
  activeTab = signal<'directory' | 'approvals' | 'roster'>('directory');
  pendingCount = signal(0);

  // Icons
  usersIcon = Users;
  clockIcon = Clock;
  databaseIcon = Database;

  ngOnInit() {
    this.loadStats();
  }

  setActiveTab(tab: 'directory' | 'approvals' | 'roster') {
    this.activeTab.set(tab);
    // Reload pending stats to keep badges perfectly synchronized
    this.loadStats();
  }

  loadStats() {
    this.http.get(`${environment.apiUrl}/api/v1/usermanagement/stats`).subscribe({
      next: (response: any) => {
        if (response.success && response.stats) {
          this.pendingCount.set(response.stats.pendingUsers || 0);
        }
      }
    });
  }
}
