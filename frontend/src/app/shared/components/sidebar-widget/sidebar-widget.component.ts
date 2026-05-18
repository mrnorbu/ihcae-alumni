import { Component, Input } from '@angular/core';


/**
 * Sidebar Widget Component
 * 
 * A reusable widget container for sidebars with:
 * - Card styling
 * - Optional header
 * - Content projection for flexible content
 * 
 * @example
 * <app-sidebar-widget [title]="'Top Discussions'">
 *   <div class="space-y-3">
 *     <!-- Widget content -->
 *   </div>
 * </app-sidebar-widget>
 */
@Component({
  selector: 'app-sidebar-widget',
  standalone: true,
  imports: [],
  template: `
    <div class="sidebar-card mb-6">
      @if (title) {
        <h3 class="heading-section">{{ title }}</h3>
      }
      <ng-content></ng-content>
    </div>
    `,
  styles: []
})
export class SidebarWidgetComponent {
  /**
   * Optional title for the widget
   */
  @Input() title?: string;
}
