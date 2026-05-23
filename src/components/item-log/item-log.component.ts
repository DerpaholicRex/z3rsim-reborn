import { Component, OnInit, Input, IterableDiffers, IterableDiffer } from '@angular/core';
import { Items } from '../../models/items.model';
import { ButtonCheckboxDirective } from 'ngx-bootstrap/buttons';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ItemLineComponent } from '../item-line/item-line.component';
import { ItemLogFilterPipe } from '../../pipes/item-log-filter.pipe';

@Component({
    selector: 'app-item-log',
    templateUrl: './item-log.component.html',
    styleUrls: ['./item-log.component.css'],
    imports: [ButtonCheckboxDirective, TooltipDirective, FormsModule, NgIf, NgFor, ItemLineComponent, ItemLogFilterPipe]
})
export class ItemLogComponent implements OnInit {
  filterArgs: { onlyImportantShown: boolean; searchQuery: string };
  iterableDiffer: IterableDiffer<any>;

  @Input() itemLogList: { item: string; shortName: string; longName: string; location: string; region: string; type: string }[];
  @Input() items: Items;

  constructor(private _iterableDiffers: IterableDiffers) {
    this.filterArgs = {
      onlyImportantShown: false,
      searchQuery: '',
    };
    this.iterableDiffer = this._iterableDiffers.find([]).create(null);
  }

  ngOnInit() {}

  ngDoCheck() {
    this.iterableDiffer.diff(this.itemLogList);
  }

  onToggleImportant() {
    this.filterArgs.onlyImportantShown = !this.filterArgs.onlyImportantShown;
  }

  onCleanText() {
    this.filterArgs.searchQuery = '';
  }
}
