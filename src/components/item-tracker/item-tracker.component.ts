import { GameService } from '../../services/game.service';
import { Component, OnInit, Input, isDevMode } from '@angular/core';
import { Items } from '../../models/items.model';
import { Config } from '../../models/config.model';
import { Dungeon } from '../../models/dungeon.model';
import { NgFor, NgClass } from '@angular/common';
import { TrackerNodeComponent } from '../tracker-node/tracker-node.component';

@Component({
    selector: 'app-item-tracker',
    templateUrl: './item-tracker.component.html',
    styleUrls: ['./item-tracker.component.css'],
    imports: [NgFor, TrackerNodeComponent, NgClass]
})
export class ItemTrackerComponent implements OnInit {
  itemsToTrack: string[];

  @Input() items: Items;
  @Input() config: Config;
  @Input() dungeonsData: Dungeon[];

  constructor(private _gameService: GameService) {}

  ngOnInit() {
    this.itemsToTrack = [
      'tunic',
      'sword',
      'shield',
      'moonPearl',
      'health',
      'bow',
      'boomerang',
      'hookshot',
      'mushroom',
      'powder',
      'fireRod',
      'iceRod',
      'bombos',
      'ether',
      'quake',
      'lamp',
      'hammer',
      'fluteShovel',
      'net',
      'book',
      'bottle',
      'somaria',
      'byrna',
      'cape',
      'mirror',
      'boots',
      'glove',
      'flippers',
      'halfMagic',
      'agahnim',
    ];
    if (this.config.goal === 'triforce') {
      this.itemsToTrack[8] = 'powderMush';
      this.itemsToTrack[9] = 'triforcePieces';
    }
  }

  getDungeons() {
    var excludedDungeons;
    excludedDungeons =
      this.config.isMystery ||
      (this.config.dungeonItems !== 'standard' && this.config.dungeonItems !== 'mc')
        ? ['Light World', 'Dark World', 'Hyrule Castle']
        : ['Aga Tower', 'Ganons Tower', 'Light World', 'Dark World', 'Hyrule Castle'];
    return this.dungeonsData.filter(function (dungeon) {
      return excludedDungeons.indexOf(dungeon.name) === -1;
    });
  }

  onItemClicked(itemName: string) {
    if (itemName === 'boots') {
      this.config.noLogic = !this.config.noLogic;
    }
    if (isDevMode()) {
      if (typeof this.items[itemName] == 'boolean') {
        if (this.items[itemName]) {
          this.items[itemName] = false;
        } else {
          this.items[itemName] = true;
        }
      } else if (++this.items[itemName] > 2) {
        this.items[itemName] = 0;
      }
      this._gameService.updateData(this.items, 'light-world');
      this._gameService.updateData(this.items, 'dark-world');
    }
  }
}
