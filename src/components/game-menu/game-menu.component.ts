import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Items } from '../../models/items.model';

@Component({
    selector: 'app-game-menu',
    templateUrl: './game-menu.component.html',
    styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent implements OnInit {
  @Input() items: Items;
  @Input() currentMap: string;

  @Output() onClickedWarpButton = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}

  onWarp() {
    this.onClickedWarpButton.emit('');
  }
}
