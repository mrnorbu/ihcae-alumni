import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, GraduationCap, ArrowRight } from 'lucide-angular';
import { AlumniCard } from '../../services/directory.service';

@Component({
  selector: 'app-modern-alumni-card',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  template: `
    <a [routerLink]="['/alumni', alumni.id]"
      class="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group h-full">

      <!-- Avatar -->
      <div class="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-base font-bold text-neutral-500 overflow-hidden ring-2 ring-neutral-100 group-hover:ring-blue-100 transition-all">
        @if (alumni.profileImageUrl && !isPlaceholder(alumni.profileImageUrl)) {
          <img [src]="alumni.profileImageUrl" [alt]="alumni.firstName + ' ' + alumni.lastName" class="w-full h-full object-cover" />
        } @else {
          <span>{{ getInitials(alumni.firstName, alumni.lastName) }}</span>
        }
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col">
        <h3 class="text-sm font-semibold text-neutral-900 group-hover:text-blue-700 transition-colors leading-tight truncate mb-0.5">
          {{ alumni.firstName }} {{ alumni.lastName }}
        </h3>
        @if (alumni.jobTitle) {
          <p class="text-xs text-neutral-500 truncate mb-2 leading-tight">{{ alumni.jobTitle }}</p>
        }
        <div class="space-y-1 mt-auto">
          @if (alumni.course || alumni.graduationYear) {
            <div class="flex items-center gap-1.5">
              <lucide-icon [img]="graduationIcon" [size]="11" class="text-green-600 shrink-0"></lucide-icon>
              <span class="text-xs text-green-700 font-medium truncate">
                {{ alumni.course }}@if (alumni.course && alumni.graduationYear) { · }{{ alumni.graduationYear }}
              </span>
            </div>
          }
          @if (alumni.location) {
            <div class="flex items-center gap-1.5">
              <lucide-icon [img]="locationIcon" [size]="11" class="text-neutral-400 shrink-0"></lucide-icon>
              <span class="text-xs text-neutral-400 truncate">{{ alumni.location }}</span>
            </div>
          }
        </div>
        <div class="mt-2.5 flex justify-end">
          <span class="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            View Profile
            <lucide-icon [img]="arrowRightIcon" [size]="11"></lucide-icon>
          </span>
        </div>
      </div>
    </a>
  `,
  styles: []
})
export class ModernAlumniCardComponent {
  @Input({ required: true }) alumni!: AlumniCard;

  readonly graduationIcon = GraduationCap;
  readonly locationIcon = MapPin;
  readonly arrowRightIcon = ArrowRight;

  getInitials(firstName: string, lastName: string): string {
    return (firstName || '').trim().charAt(0).toUpperCase() + (lastName || '').trim().charAt(0).toUpperCase();
  }

  isPlaceholder(url: string): boolean {
    return url.includes('lucide') || url.includes('placeholder') || url.includes('default');
  }
}
