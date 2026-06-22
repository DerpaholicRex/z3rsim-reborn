import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../services/game.service';
import { ItemNamesService } from '../../services/item-names.service';
import { Items } from '../../models/items.model';
import { Config } from '../../models/config.model';


@Component({
    selector: 'app-end-stats',
    templateUrl: './end-stats.component.html',
    styleUrls: ['./end-stats.component.css'],
    imports: []
})
export class EndStatsComponent implements OnInit {
  @Input() items: Items;
  @Input() config: Config;

  totals: {
    easy: { containers: number; pieces: number; swords: number; mails: number; shields: number; aItems: number };
    normal: { containers: number; pieces: number; swords: number; mails: number; shields: number; aItems: number };
    hard: { containers: number; pieces: number; swords: number; mails: number; shields: number; aItems: number };
    expert: { containers: number; pieces: number; swords: number; mails: number; shields: number; aItems: number };
    insane: { containers: number; pieces: number; swords: number; mails: number; shields: number; aItems: number };
  };

  constructor(
    private _gameService: GameService,
    private _itemNamesService: ItemNamesService,
  ) {
    this.totals = {
      easy: { containers: 11, pieces: 24, swords: 4, mails: 3, shields: 3, aItems: 7 },
      normal: { containers: 11, pieces: 24, swords: 4, mails: 3, shields: 3, aItems: 6 },
      hard: { containers: 6, pieces: 20, swords: 3, mails: 2, shields: 2, aItems: 5 },
      expert: { containers: 1, pieces: 20, swords: 2, mails: 1, shields: 1, aItems: 5 },
      insane: { containers: 0, pieces: 0, swords: 2, mails: 1, shields: 0, aItems: 5 },
    };
  }

  ngOnInit() {}

  getQuestPerformanceTables() {
    var tables = [];
    tables.push(['Item Locations Checked', this.generateItemLocationsCheckedTable()]);
    tables.push(['Item Completion', this.generateItemCompletionTable()]);
    return tables;
  }

  generateItemLocationsCheckedTable() {
    var rows = [];
    rows.push(['Overworld', this.items.stats.overworldCount + '/100']);
    rows.push(['Dungeons', this.items.stats.dungeonCount + '/116']);
    rows.push(['Total', this.items.stats.totalCount + '/216']);
    return rows;
  }

  generateItemCompletionTable() {
    var rows = [];
    rows.push(['Y Items', this.getYItemCount() + '/27']);
    rows.push(['Swords', this.items.sword + '/' + this.totals.normal.swords]);
    rows.push(['Shields', this.items.shield + '/' + this.totals.normal.shields]);
    rows.push(['Mails', this.items.tunic + '/' + this.totals.normal.mails]);
    rows.push(['Heart Pieces', this.items.stats.heartPieces + '/' + this.totals.normal.pieces]);
    rows.push(['Heart Containers', this.items.stats.heartContainers + '/' + +this.totals.normal.containers]);
    rows.push(['Other Items', this.getOtherItemCount() + '/' + this.totals.normal.aItems]);
    return rows;
  }

  generateDungeonCompletionTable() {
    var rows = [];
    rows.push(['Maps', this.items.stats.maps + '/12']);
    rows.push(['Compasses', this.items.stats.compasses + '/11']);
    rows.push(['Small Keys', this.items.stats.sks + (this.config.isFullMap ? '/47' : '/44')]);
    rows.push(['Big Keys', this.items.stats.bks + '/11']);
    rows.push(['Big Chests', this.items.stats.bigChests + '/11']);
    rows.push(['Pendants', this.getPendantCount() + '/3']);
    rows.push(['Crystals', this.getCrystalCount() + '/7']);
    rows.push(['Bosses', this.items.stats.bosses + '/13']);
    return rows;
  }

  generateSeedDataTable() {
    var rows = [];
    rows.push(['Item Placement', this.config.advancedItems ? 'Advanced' : 'Basic']);
    var dungeonItemShuffle;
    switch (this.config.dungeonItems) {
      case 'standard':
        dungeonItemShuffle = 'Standard';
        break;
      case 'mc':
        dungeonItemShuffle = 'Maps/Compasses';
        break;
      case 'mcs':
        dungeonItemShuffle = 'Maps/Compasses/Small Keys';
        break;
      case 'full':
        dungeonItemShuffle = 'Keysanity';
    }
    rows.push(['Dungeon Item Shuffle', dungeonItemShuffle]);
    var accessibilityLabel;
    switch (this.config.accessibility) {
      case 'items':
        accessibilityLabel = '100% Inventory';
        break;
      case 'locations':
        accessibilityLabel = '100% Locations';
        break;
      case 'none':
        accessibilityLabel = 'Beatable';
    }
    rows.push(['Accessibility', accessibilityLabel]);
    var goalLabel;
    switch (this.config.goal) {
      case 'ganon':
        goalLabel = 'Defeat Ganon';
        break;
      case 'fast_ganon':
        goalLabel = 'Fast Ganon';
        break;
      case 'dungeons':
        goalLabel = 'All Dungeons';
        break;
      case 'pedestal':
        goalLabel = 'Master Sword Pedestal';
        break;
      case 'triforce':
        goalLabel = 'Triforce Hunt';
    }
    rows.push(['Goal', goalLabel]);
    rows.push(['Open Tower', this.config.towerCrystals]);
    rows.push(['Ganon Vulnerable', this.config.ganonCrystals]);
    var worldStateLabel;
    switch (this.config.mode) {
      case 'standard':
        worldStateLabel = 'Standard';
        break;
      case 'open':
        worldStateLabel = 'Open';
        break;
      case 'inverted':
        worldStateLabel = 'Inverted';
    }
    rows.push(['World State', worldStateLabel]);
    rows.push(['Enemizer', this.config.isEnemizer ? 'On' : 'Off']);
    rows.push(['Hints', this.config.hintsEnabled ? 'On' : 'Off']);
    var weaponsLabel;
    switch (this.config.weapons) {
      case 'randomized':
        weaponsLabel = 'Randomized';
        break;
      case 'assured':
        weaponsLabel = 'Assured';
        break;
      case 'vanilla':
        weaponsLabel = 'Vanilla';
        break;
      case 'swordless':
        weaponsLabel = 'Swordless';
    }
    rows.push(['Swords', weaponsLabel]);
    return rows;
  }

  getDungeonInfoTables() {
    var tables = [];
    tables.push(['General Dungeon Data', this.generateDungeonCompletionTable()]);
    tables.push(['Dungeon Completion', this.generateDungeonDataTable()]);
    tables.push(['Boss Kill Stats', this.generateBossSwordsTable()]);
    return tables;
  }

  getItemInfoTables() {
    var tables = [];
    tables.push(['Locations Pre Items', this.generateItemProgressTable()]);
    return tables;
  }

  getSeedDataTables() {
    var tables = [];
    tables.push(['Seed Information', this.generateSeedDataTable()]);
    return tables;
  }

  generateDungeonDataTable() {
    var rows = [];
    var fullClears = 0;
    var bossKilledLeftItems = 0;
    var cleanedItems = 0;
    var abandonedDungeons = 0;
    var untouchedDungeons = 0;
    this.items.dungeonItemsArray.forEach((dungeonItem, index) => {
      if (index !== 0 && index !== 4 && index !== 12) {
        if (dungeonItem.itemsLeft === 0 && dungeonItem.isBossDefeated) {
          fullClears++;
        } else if (dungeonItem.isBossDefeated) {
          bossKilledLeftItems++;
        } else if (dungeonItem.itemsLeft !== 0 || dungeonItem.isBossDefeated) {
          if (
            dungeonItem.itemsLeft !== this.items.startingItemCount[index] ||
            dungeonItem.isBossDefeated ||
            dungeonItem.hasCompass ||
            dungeonItem.hasMap ||
            dungeonItem.hasBigKey ||
            dungeonItem.smallKeys !== 0
          ) {
            abandonedDungeons++;
          } else {
            untouchedDungeons++;
          }
        } else {
          cleanedItems++;
        }
      }
    });
    rows.push(['Full Clears', fullClears]);
    rows.push(['Killed Boss, left Items', bossKilledLeftItems]);
    rows.push(['Cleaned Items', cleanedItems]);
    rows.push(['Abandoned Dungeons', abandonedDungeons]);
    rows.push(['Untouched Dungeons', untouchedDungeons]);
    return rows;
  }

  generateBossSwordsTable() {
    var rows = [];
    rows.push(['Swordless Kills', this.items.stats.sword0B + '/' + this.items.stats.bosses]);
    rows.push(['Fighter Sword Kills', this.items.stats.sword1B + '/' + this.items.stats.bosses]);
    rows.push(['Master Sword Kills', this.items.stats.sword2B + '/' + this.items.stats.bosses]);
    rows.push(['Tempered Sword Kills', this.items.stats.sword3B + '/' + this.items.stats.bosses]);
    rows.push(['Gold Sword Kills', this.items.stats.sword4B + '/' + this.items.stats.bosses]);
    return rows;
  }

  generateItemProgressTable() {
    var rows = [];
    var usedMedallions = [];
    rows.push(['boots', 'Boots', this.items.stats.preBoots]);
    rows.push(['mirror', 'Mirror', this.items.stats.preMirror]);
    rows.push(['flute', 'Flute', this.items.stats.preFlute]);
    rows.push(['glove2', 'Titan Mitts', this.items.stats.preMitts]);
    rows.push(['glove1', 'Power Gloves', this.items.stats.preGlove]);
    rows.push(['bow', 'Bow', this.items.stats.preBow]);
    rows.push(['bow2', 'Silver Arrows', this.items.stats.preSilvers]);
    rows.push(['hammer', 'Hammer', this.items.stats.preHammer]);
    rows.push(['sword2', 'Master Sword', this.items.stats.preMS]);
    rows.push(['fireRod', 'Fire Rod', this.items.stats.preFireRod]);
    rows.push(['iceRod', 'Ice Rod', this.items.stats.preIceRod]);
    rows.push(['flippers', 'Flippers', this.items.stats.preFlippers]);
    rows.push(['somaria', 'Cane of Somaria', this.items.stats.preSomaria]);
    rows.push(['hookshot', 'Hookshot', this.items.stats.preHook]);
    rows.push(['lamp', 'Lamp', this.items.stats.preLamp]);
    rows.push(['moonPearl', 'Moon Pearl', this.items.stats.prePearl]);
    rows.push(['agahnim', 'Dark World Access', this.items.stats.preDW]);
    if (this.config.goal === 'pedestal' || this.config.goal === 'dungeons') {
      var prizes = this._gameService.getDungeonPrizes();
      Object.keys(prizes).forEach((dungeonName) => {
        if (prizes[dungeonName].indexOf('Pendant') > -1) {
          var pendantItem = this._itemNamesService.getItemByLongName(prizes[dungeonName]).shortName;
          rows.push([pendantItem, dungeonName, this.items.preEachPendant[pendantItem]]);
          var medallionItem = undefined;
          if (dungeonName !== 'Misery Mire' || usedMedallions.includes(this.config.mmMedallion)) {
            if (dungeonName === 'Turtle Rock' && !usedMedallions.includes(this.config.trMedallion)) {
              medallionItem = this._itemNamesService.getItemByShortName(this.config.trMedallion);
            }
          } else {
            medallionItem = this._itemNamesService.getItemByShortName(this.config.mmMedallion);
          }
          if (medallionItem) {
            usedMedallions.push(medallionItem.shortName);
            rows.push([medallionItem.shortName, medallionItem.longName, this.items.preEachMedallion[medallionItem.shortName]]);
          }
        }
      });
      rows.push(['triforce', 'Master Sword Pedestal', this.items.stats.totalCount]);
    }
    if (this.config.goal === 'ganon' || this.config.goal === 'dungeons') {
      var prizes = this._gameService.getDungeonPrizes();
      Object.keys(prizes).forEach((dungeonName) => {
        if (
          prizes[dungeonName].indexOf('Crystal') > -1 &&
          (rows.push(['crystal', dungeonName, this.items.preEachDun[+prizes[dungeonName].charAt(8) - 1]]),
          (dungeonName === 'Misery Mire' && !usedMedallions.includes(this.config.mmMedallion)) ||
            (dungeonName === 'Turtle Rock' && !usedMedallions.includes(this.config.trMedallion)))
        ) {
          var medallionItem = this._itemNamesService.getItemByShortName(this.config.mmMedallion);
          usedMedallions.push(medallionItem.shortName);
          rows.push([medallionItem.shortName, medallionItem.longName, this.items.preEachMedallion[medallionItem.shortName]]);
        }
      });
      rows.push(['bigKey', 'Ganons Tower Big Key', this.items.stats.totalItemsPreGTBK]);
      rows.push(['Ganon', 'Ganon', this.items.stats.preGanon]);
    }
    rows.sort((a, b) => {
      if (a[2] === 0) {
        return 1;
      } else if (b[2] === 0) {
        return -1;
      } else {
        return a[2] - b[2];
      }
    });
    return rows.map((row) => {
      if (row[2] === 0) {
        return [row[0], row[1], 'Not Found'];
      } else {
        return row;
      }
    });
  }

  getYItemCount() {
    var count = 0;
    [
      'hookshot', 'bombs', 'shovel', 'mushroom', 'powder', 'fireRod', 'iceRod',
      'bombos', 'ether', 'quake', 'lamp', 'hammer', 'flute', 'net', 'book',
      'somaria', 'byrna', 'cape', 'mirror',
    ].forEach((itemName) => {
      if (this.items[itemName]) {
        count++;
      }
    });
    count += this.items.bottle;
    count += this.items.boomerang;
    if (this.items.hasBow()) {
      count++;
    }
    return count;
  }

  getOtherItemCount() {
    var count = 0;
    ['moonPearl', 'flippers', 'boots'].forEach((itemName) => {
      if (this.items[itemName]) {
        count++;
      }
    });
    count += this.items.halfMagic;
    return (count += this.items.glove);
  }

  getPendantCount() {
    var count = 0;
    ['pendantCourage', 'pendantPower', 'pendantWisdom'].forEach((pendantName) => {
      if (this.items[pendantName]) {
        count++;
      }
    });
    return count;
  }

  getCrystalCount() {
    var count = 0;
    ['crystal1', 'crystal2', 'crystal3', 'crystal4', 'crystal5', 'crystal6', 'crystal7'].forEach((crystalName) => {
      if (this.items[crystalName]) {
        count++;
      }
    });
    return count;
  }
}
