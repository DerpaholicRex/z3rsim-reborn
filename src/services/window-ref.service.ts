import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowRef {
  constructor() {}

  get nativeWindow(): Window {
    return window;
  }
}
