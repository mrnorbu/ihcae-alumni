import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative inline-block w-full select-none" [class.opacity-50]="disabled">
      <!-- Trigger Button -->
      <button
        #triggerBtn
        type="button"
        (click)="toggleDropdown(triggerBtn)"
        [disabled]="disabled"
        [class]="customClass || 'w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center justify-between gap-1.5 text-left text-neutral-700'"
      >
        <span class="truncate">{{ getSelectedLabel() }}</span>
        <lucide-icon [img]="chevronDownIcon" [size]="16" class="text-neutral-400 shrink-0"></lucide-icon>
      </button>

      <!-- Dropdown Menu -->
      @if (isOpen) {
        <div 
          [class.bottom-full]="dropUp"
          [class.mb-1]="dropUp"
          [class.top-full]="!dropUp"
          [class.mt-1]="!dropUp"
          class="absolute left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-[100] py-1 max-h-60 overflow-y-auto"
        >
          @for (option of options; track option.value) {
            <button
              type="button"
              (click)="selectOption(option)"
              class="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 text-neutral-700 transition-colors flex items-center justify-between font-normal"
            >
              <span class="truncate">{{ option.label }}</span>
              @if (value === option.value) {
                <lucide-icon [img]="checkIcon" [size]="14" class="text-blue-600 shrink-0"></lucide-icon>
              }
            </button>
          }
        </div>
      }
    </div>
  `
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select option';
  @Input() customClass = '';

  value: any = null;
  isOpen = false;
  disabled = false;
  dropUp = false;

  readonly chevronDownIcon = ChevronDown;
  readonly checkIcon = Check;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(triggerBtn: HTMLElement) {
    if (this.disabled) return;
    
    if (!this.isOpen) {
      const rect = triggerBtn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Drop up if there's less than 240px below and more space above
      this.dropUp = spaceBelow < 240 && rect.top > spaceBelow;
    }
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : this.placeholder;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
