import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Rocket } from 'lucide-angular';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <lucide-icon [img]="rocketIcon" [size]="24" class="text-neutral-400"></lucide-icon>
        </div>
        <h2 class="text-lg font-bold text-neutral-900 mb-1">{{ featureName }}</h2>
        <p class="text-sm text-neutral-500 mb-6">This feature is under development and will be available soon.</p>
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          Coming Soon
        </span>
      </div>
    </div>
  `,
  styles: []
})
export class ComingSoonComponent {
  private route = inject(ActivatedRoute);

  readonly rocketIcon = Rocket;
  featureName = 'Feature';

  constructor() {
    this.route.data.subscribe(data => {
      this.featureName = data['feature'] || 'Feature';
    });
  }
}
