import { Component, ElementRef, HostListener, Input } from '@angular/core';

let nextPopoverId = 0;

@Component({
    selector: 'app-help-popover',
    templateUrl: './help-popover.component.html',
    styleUrls: ['./help-popover.component.css']
})
export class HelpPopoverComponent {
  @Input() text: string;
  @Input() label = 'Show help';

  isOpen = false;
  popoverId = 'help-popover-' + nextPopoverId++;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
