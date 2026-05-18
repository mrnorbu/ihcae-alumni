import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

/**
 * Stat Card Component
 * 
 * A reusable card component for displaying statistics with:
 * - Icon with background color
 * - Label and value
 * - Optional trend indicator
 * - Optional clickable action
 * 
 * @example
 * <app-stat-card
 *   [icon]="usersIcon"
 *   [iconBgClass]="'bg-blue-100'"
 *   [iconColorClass]="'text-blue-600'"
 *   [label]="'Total Users'"
 *   [value]="152"
 *   [trend]="+12%"
 *   [trendPositive]="true">
 * </app-stat-card>
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="stat-card">
      <div class="stat-card-horizontal">
        <!-- Icon -->
        <div
          class="stat-icon"
          [ngClass]="[iconBgClass]"
          >
          <lucide-icon
            [img]="icon"
            [size]="iconSize"
            [ngClass]="[iconColorClass]"
          ></lucide-icon>
        </div>
    
        <!-- Content -->
        <div class="flex-1">
          <p class="text-xs font-medium text-neutral-600">{{ label }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold text-neutral-900">{{ value }}</p>
            @if (trend) {
              <span
                class="text-xs font-medium"
                [class.text-success-600]="trendPositive"
                [class.text-error-600]="!trendPositive"
                >
                {{ trend }}
              </span>
            }
          </div>
        </div>
      </div>
    </div>
    `,
  styles: []
})
export class StatCardComponent {
  /**
   * The Lucide icon to display
   */
  @Input({ required: true }) icon!: LucideIconData;

  /**
   * Background color class for icon container (e.g., 'bg-blue-100')
   */
  @Input() iconBgClass: string = 'bg-neutral-100';

  /**
   * Icon color class (e.g., 'text-blue-600')
   */
  @Input() iconColorClass: string = 'text-neutral-600';

  /**
   * Size of the icon in pixels
   */
  @Input() iconSize: number = 20;

  /**
   * Label text (e.g., 'Total Users')
   */
  @Input({ required: true }) label!: string;

  /**
   * The stat value to display (can be number or string)
   */
  @Input({ required: true }) value!: string | number;

  /**
   * Optional trend indicator (e.g., '+12%', '-3%')
   */
  @Input() trend?: string;

  /**
   * Whether the trend is positive (green) or negative (red)
   */
  @Input() trendPositive: boolean = true;
}


