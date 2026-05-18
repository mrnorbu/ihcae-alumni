import { Component, Input, Output, EventEmitter } from '@angular/core';


/**
 * Confirmation Modal Component
 * 
 * A reusable modal for confirming destructive actions.
 */
@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [],
  template: `
    @if (isVisible) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
          <!-- Icon -->
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <i class="bi bi-exclamation-triangle text-2xl text-red-600"></i>
          </div>
          <!-- Title -->
          <h3 class="text-lg font-semibold text-center text-neutral-900 mb-2">
            {{ title }}
          </h3>
          <!-- Message -->
          <p class="text-sm text-center text-neutral-600 mb-6">
            {{ message }}
          </p>
          <!-- Actions -->
          <div class="flex gap-3">
            <button
              (click)="onCancel()"
              class="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
              Cancel
            </button>
            <button
              (click)="onConfirm()"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
    `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
