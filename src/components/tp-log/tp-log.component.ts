import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TpLogRedirectComponent } from '../tp-log-redirect/tp-log-redirect.component';

@Component({
    selector: 'app-tp-log',
    templateUrl: './tp-log.component.html',
    styleUrls: ['./tp-log.component.css'],
    imports: [TpLogRedirectComponent]
})
export class TpLogComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
