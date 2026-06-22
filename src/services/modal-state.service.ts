import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalStateService {
  private reportModalOpenSubject = new BehaviorSubject(false);
  reportModalOpen$ = this.reportModalOpenSubject.asObservable();

  setReportModalOpen(isOpen: boolean) {
    this.reportModalOpenSubject.next(isOpen);
  }
}
