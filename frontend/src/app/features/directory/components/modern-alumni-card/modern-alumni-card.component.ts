import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, User, MapPin, Briefcase, GraduationCap, ChevronRight } from 'lucide-angular';
import { AlumniCard } from '../../services/directory.service';

/**
 * Modern Alumni Card Component
 * 
 * Displays individual alumni members in the new modern design format.
 * Matches the forum design pattern but uses green color accents.
 * 
 * @author IHCAE Development Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-modern-alumni-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <a
      [routerLink]="['/alumni', alumni.id]"
      class="block bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md hover:bg-neutral-50 transition-all duration-200 overflow-hidden group h-full"
    >
      <div class="p-4">
        <!-- Profile Section -->
        <div class="flex items-start gap-3 mb-3">
          <!-- Profile Image -->
          <div class="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-neutral-600">
            <img
              *ngIf="alumni.profileImageUrl && !isLucideIconUrl(alumni.profileImageUrl)"
              [src]="alumni.profileImageUrl"
              [alt]="alumni.firstName + ' ' + alumni.lastName"
              class="w-12 h-12 rounded-full object-cover"
            />
            <span *ngIf="!alumni.profileImageUrl || isLucideIconUrl(alumni.profileImageUrl)">
              {{ getInitials(alumni.firstName, alumni.lastName) }}
            </span>
          </div>
          
          <!-- Alumni Info -->
          <div class="flex-1 min-w-0">
            <!-- Name with Badge -->
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-medium text-neutral-900 group-hover:text-green-600 transition-colors truncate">
                {{ alumni.firstName }} {{ alumni.lastName }}
              </h3>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            
            <!-- Job Title -->
            <p *ngIf="alumni.jobTitle" class="text-neutral-600 text-sm mb-2 line-clamp-1">
              {{ alumni.jobTitle }}
            </p>
            
            <!-- Course and Year -->
            <div *ngIf="alumni.course || alumni.graduationYear" class="flex items-center gap-1 mb-2">
              <lucide-icon [img]="graduationIcon" [size]="12" class="text-green-600"></lucide-icon>
              <span class="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md font-medium">
                {{ alumni.course }}
                <span *ngIf="alumni.course && alumni.graduationYear">•</span>
                {{ alumni.graduationYear }}
              </span>
            </div>
          </div>
          
          <!-- Action Indicator -->
          <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <lucide-icon [img]="chevronIcon" [size]="14" class="text-neutral-400"></lucide-icon>
          </div>
        </div>
        
        <!-- Additional Details -->
        <div class="space-y-2 text-xs text-neutral-500">
          <!-- Location -->
          <div *ngIf="alumni.location" class="flex items-center gap-2">
            <lucide-icon [img]="locationIcon" [size]="12" class="text-neutral-400"></lucide-icon>
            <span class="truncate">{{ alumni.location }}</span>
          </div>
        </div>
      </div>
    </a>
  `,
  styles: []
})
export class ModernAlumniCardComponent {
  @Input({ required: true }) alumni!: AlumniCard;

  // Lucide icons
  readonly graduationIcon = GraduationCap;
  readonly locationIcon = MapPin;
  readonly briefcaseIcon = Briefcase;
  readonly chevronIcon = ChevronRight;

  /**
   * Gets initials from first and last name
   */
  getInitials(firstName: string, lastName: string): string {
    const first = (firstName || '').trim().charAt(0).toUpperCase();
    const last = (lastName || '').trim().charAt(0).toUpperCase();
    return first + last;
  }

  /**
   * Checks if the URL is a Lucide icon URL (default placeholder)
   */
  isLucideIconUrl(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }
}
