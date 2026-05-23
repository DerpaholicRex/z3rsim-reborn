import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { WindowRef } from '../../services/window-ref.service';
import { SeedService } from '../../services/seed.service';

let appRef: AppComponent;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'app';
  window: Window;
  isDarkTheme: boolean;
  buttonClass: string;
  colorMode: string;
  modalRef: { hide: () => void };

  constructor(
    private _windowRef: WindowRef,
    private _modalService: BsModalService,
    private _router: Router,
  ) {
    this.window = _windowRef.nativeWindow;
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
  }

  openModal(template: any) {
    this.modalRef = this._modalService.show(template);
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
    this._router.navigate(['/' + route]);
  }
}
