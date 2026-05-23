import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AccordionComponent, AccordionPanelComponent } from 'ngx-bootstrap/accordion';

@Component({
    selector: 'app-changelog',
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.css'],
    imports: [AccordionComponent, AccordionPanelComponent]
})
export class ChangelogComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
