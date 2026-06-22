import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { trapFocus, restoreFocusAfterClose } from '../ui/focus-trap';
import { ModalStateService } from '../../services/modal-state.service';
import { WindowRef } from '../../services/window-ref.service';

let appRef: AppComponent;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnDestroy, OnInit {
  @ViewChild('howToCloseButton') howToCloseButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('howToModal') howToModal?: ElementRef<HTMLDivElement>;

  title = 'app';
  window: Window;
  isDarkTheme: boolean;
  buttonClass: string;
  colorMode: string;
  isNavOpen: boolean;
  isHowToOpen: boolean;
  isReportModalOpen: boolean;
  private howToModalTrigger?: HTMLElement;
  private reportModalOpenSubscription?: Subscription;

  constructor(
    private _windowRef: WindowRef,
    private _router: Router,
    private _modalStateService: ModalStateService,
  ) {
    this.window = _windowRef.nativeWindow;
    this.isNavOpen = false;
    this.isHowToOpen = false;
    this.isReportModalOpen = false;
  }

  ngOnInit() {
    appRef = this;
    (window as any).appRef = this;
    this.buttonClass = 'fa fa-moon-o';
    if (localStorage.getItem('isDarkTheme')) {
      this.isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
    } else {
      localStorage.setItem('isDarkTheme', 'false');
    }
    this.onToggleTheme(false);
    this.setColorModeText();
    this.reportModalOpenSubscription = this._modalStateService.reportModalOpen$.subscribe((isOpen) => {
      this.isReportModalOpen = isOpen;
      this.syncModalScrollLock();
    });
  }

  ngOnDestroy() {
    this.reportModalOpenSubscription?.unsubscribe();
    this.setModalScrollLock(false);
  }

  openHowToModal() {
    this.howToModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.isHowToOpen = true;
    this.isNavOpen = false;
    this.syncModalScrollLock();
    setTimeout(() => this.howToCloseButton?.nativeElement.focus());
  }

  closeHowToModal() {
    this.isHowToOpen = false;
    this.syncModalScrollLock();
    restoreFocusAfterClose(this.howToModalTrigger);
    this.howToModalTrigger = undefined;
  }

  onHowToModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeHowToModal();
      return;
    }
    trapFocus(event, this.howToModal?.nativeElement);
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  onToggleTheme(toggle = true) {
    if (toggle) {
      this.isDarkTheme = !this.isDarkTheme;
    }
    if (this.isDarkTheme) {
      this.buttonClass = 'fa fa-moon-o';
      localStorage.setItem('isDarkTheme', 'true');
    } else {
      this.buttonClass = 'fa fa-sun-o';
      localStorage.setItem('isDarkTheme', 'false');
    }
    this.window.document.documentElement.dataset.theme = this.isDarkTheme ? 'dark' : 'light';
    this.setColorModeText();
  }

  setColorModeText() {
    if (this.isDarkTheme) {
      this.colorMode = 'Dark Theme';
    } else {
      this.colorMode = 'Light Theme';
    }
  }

  redirect(route: string) {
    this.isNavOpen = false;
    this._router.navigate(['/' + route]);
  }

  private syncModalScrollLock() {
    this.setModalScrollLock(this.isHowToOpen || this.isReportModalOpen);
  }

  private setModalScrollLock(isOpen: boolean) {
    const documentElement = this.window.document.documentElement;
    const body = this.window.document.body;
    documentElement.classList.toggle('app-dialog-open', isOpen);
    body.classList.toggle('app-dialog-open', isOpen);
  }
}
