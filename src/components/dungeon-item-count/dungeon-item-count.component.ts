import { Component, OnInit, Input } from '@angular/core';
import { DungeonPrize } from '../../models/dungeon-prize.enum';
import { Config } from '../../models/config.model';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-dungeon-items',
    templateUrl: './dungeon-item-count.component.html',
    styleUrls: ['./dungeon-item-count.component.css'],
    imports: [NgIf]
})
export class DungeonItemCountComponent implements OnInit {
  isChestCountShown: boolean;

  @Input() dungeonItems: DungeonPrize;
  @Input() config: Config;

  constructor() {}

  ngOnInit() {
    this.isChestCountShown =
      (this.dungeonItems.dungeonName !== 'Aga Tower' || this.config.dungeonItems === 'full') &&
      this.dungeonItems.dungeonName !== 'Ganons Tower' &&
      this.dungeonItems.dungeonName !== 'Hyrule Castle';
  }

  getDungeonChestCountBg() {
    var chestCount = this.dungeonItems.itemsLeft;
    if (this.dungeonItems.dungeonName === 'Aga Tower') {
      chestCount--;
      if (this.dungeonItems.isBossDefeated) {
        chestCount++;
      }
    }
    return chestCount;
  }
}
