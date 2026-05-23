import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter, isDevMode } from '@angular/core';
import { Location } from '@angular/common';
import { GameService } from '../../services/game.service';
import { SeedService } from '../../services/seed.service';
import { ItemNamesService } from '../../services/item-names.service';
import { Items } from '../../models/items.model';
import { Config } from '../../models/config.model';
import { Dungeon } from '../../models/dungeon.model';
import { NodeStatus } from '../../models/node-status.enum';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    standalone: false
})
export class GameComponent implements OnInit {
  modeSelected: string;
  isDev: boolean;
  seedDescription: string;
  seedNum: string;
  errorMessage: string;
  currentMap: string;
  lastWorld: string;
  gameState: string;
  gameMode: string;
  sub: { unsubscribe: () => void };
  items: Items;
  config: Config;
  itemLog: { item: string; shortName: string; longName: string; location: string; region: string; type: string }[];
  dungeonsData: Dungeon[];
  preloadedImages: HTMLImageElement[];
  preloadedMaps: HTMLImageElement[];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private gameService: GameService,
    private _seedService: SeedService,
    private _itemNamesService: ItemNamesService,
    private _location: Location,
  ) {
    this.modeSelected = 'standard';
    this.isDev = false;
    this.seedDescription = '';
    this.seedNum = '';
    this.errorMessage = '';
    this.currentMap = 'light-world';
    this.lastWorld = 'light-world';
  }

  ngOnInit() {
    this.isDev = isDevMode();
    this.gameState = 'loading';
    this._seedService.ping();
    if (this._router.url.indexOf('open') > -1) {
      this.gameMode = 'open';
    } else if (this._router.url.indexOf('standard') > -1) {
      this.gameMode = 'standard';
    } else if (this._router.url.indexOf('inverted') > -1) {
      this.gameMode = 'inverted';
    } else if (this._router.url.indexOf('qual') > -1) {
      this.gameMode = 'quals';
    } else if (this._router.url.indexOf('mystery') > -1) {
      this.gameMode = 'mystery';
    }
    this.preloadIcons();
    this.sub = this._route.queryParams.subscribe((params) => {
      var seedConfig: { [key: string]: string } = {};
      params.seeddata;
      seedConfig.item_placement = params.item_placement ? params.item_placement : 'advanced';
      seedConfig.dungeon_items = params.dItems ? params.dItems : 'standard';
      seedConfig.accessibility = params.accessibility ? params.accessibility : 'items';
      seedConfig.weapons = params.swords ? params.swords : 'randomized';
      seedConfig.goal = params.goal ? params.goal : 'ganon';
      seedConfig.entry_crystals_tower = params.tower ? params.tower : '7';
      seedConfig.entry_crystals_ganon = params.ganon ? params.ganon : '7';
      seedConfig.enemizer = params.enemizer ? params.enemizer : 'none';
      seedConfig.hints = params.hints ? params.hints : 'off';
      if (params.seed) {
        seedConfig.seed = params.seed;
        seedConfig.mode = 'open';
      } else {
        seedConfig.mode = this.gameMode;
      }
      var isFullMap = false;
      if (params.fullMap) {
        isFullMap = true;
      }
      if (params.seeddata) {
        this.gameInit(params.seeddata, true, isFullMap, [], '', [], params.seeddata.charAt(24), params.seeddata.charAt(25), '');
      } else if (
        this._seedService.lastSeed &&
        Date.now() - this._seedService.lastSeedTimestamp < 2000 &&
        this._seedService.lastSeedParams
      ) {
        this.gameInit(
          this._seedService.lastSeed.data,
          true,
          isFullMap,
          this._seedService.lastSeed.hints,
          this._seedService.lastSeed.silversHint,
          this._seedService.lastSeed.bosses,
          this._seedService.lastSeed.reqTower,
          this._seedService.lastSeed.reqGanon,
          this._seedService.lastSeed.seed,
        );
      } else {
        this._seedService
          .getSeed(this.gameMode, seedConfig, false, this.gameMode === 'quals')
          .subscribe((seedResponse) => {
            this.gameInit(
              seedResponse.data,
              true,
              isFullMap,
              seedResponse.hints,
              seedResponse.silversHint,
              seedResponse.bosses,
              seedResponse.reqTower,
              seedResponse.reqGanon,
              seedResponse.seed,
            );
          });
      }
    });
  }

  onCreditWarp() {
    this.gameState = 'finished';
  }

  ngOnChanges() {
    if (this.currentMap === 'light-world' || this.currentMap === 'dark-world') {
      this.lastWorld = this.currentMap;
    }
  }

  gameInit(
    seedData: string,
    isLogic: boolean,
    isFullMap: boolean,
    hints: string[],
    silversHint: string,
    bosses: number[],
    towerCrystals: string,
    ganonCrystals: string,
    seed: string,
  ) {
    if (seed === undefined) {
      seed = '';
    }
    if (seedData) {
      this.gameService.loadSeed(seedData, seed, isLogic, isFullMap, bosses, hints);
      this.items = new Items();
      this.config = this.gameService.config;
      this.config.isFullMap = isFullMap;
      this.config.isMystery = this.gameMode === 'mystery';
      if (this.gameMode === 'quals') {
        this.config.ganonCrystals = 7;
        this.config.towerCrystals = 7;
      }
      this.config.silversHint = silversHint;
      var startingWorld = 'light-world';
      if (this.config.mode === 'inverted') {
        Dungeon.lwDungeons = ['Eastern Palace', 'Desert Palace', 'Tower of Hera'];
        this.config.isFullMap = false;
      }
      if (this.config.isFullMap) {
        if (this.config.mode.indexOf('standard') > -1) {
          this.currentMap = 'lw-linkshouse';
        } else if (this.config.mode === 'inverted') {
          this.config.isFullMap = false;
        } else {
          this.currentMap = 'lw-sq';
        }
      }
      if (!this.config.isFullMap) {
        startingWorld = this.config.mode === 'inverted' ? 'dark-world' : 'light-world';
        this.currentMap = startingWorld;
        this.lastWorld = startingWorld;
      }
      if (this.config.weapons === 'assured') {
        this.items.sword = 1;
      }
      this.config.towerCrystalsRequested = towerCrystals;
      this.config.ganonCrystalsRequested = ganonCrystals;
      this.items.setup(
        this.config.dungeonItems,
        this.config.isMystery,
        this.gameService.dungeonsData,
        this.config.isFullMap,
        this.config.bosses,
        this.config.mode === 'inverted',
      );
      if (this.config.mode.indexOf('standard') === -1 || !this.config.isFullMap) {
        this.items.gameState = 4;
      }
      this.itemLog = [];
      this.dungeonsData = this.gameService.dungeonsData;
      this.gameState = 'playing';
      if (this.config.isFullMap) {
        this.gameService.updateData(this.items, startingWorld, startingWorld);
      } else {
        this.gameService.updateData(this.items, startingWorld, 'ow');
      }
      setTimeout(() => {
        this.preloadMaps();
      }, 10000);
      if (this.config.isMystery) {
        this.seedDescription = 'Mystery Seed';
      } else {
        this.seedDescription = '(';
        switch (this.config.dungeonItems) {
          case 'mc':
            this.seedDescription += 'MC Shuffle ';
            break;
          case 'mcs':
            this.seedDescription += 'MCS Shuffle ';
            break;
          case 'full':
            this.seedDescription += 'Keysanity ';
        }
        switch (this.config.mode) {
          case 'open':
            this.seedDescription += 'Open ';
            break;
          case 'inverted':
            this.seedDescription += 'Inverted ';
            break;
          default:
            this.seedDescription += 'Standard ';
        }
        if (
          this.config.ganonCrystalsRequested !== '7' ||
          this.config.towerCrystalsRequested !== '7'
        ) {
          this.seedDescription +=
            this.config.towerCrystalsRequested +
            '/' +
            this.config.ganonCrystalsRequested +
            ' Crystals ';
        }
        switch (this.config.weapons) {
          case 'vanilla':
            this.seedDescription += 'Vanilla Swords ';
            break;
          case 'swordless':
            this.seedDescription += 'Swordless ';
        }
        if (this.config.isEnemizer) {
          this.seedDescription += 'Enemizer ';
        }
        switch (this.config.goal) {
          case 'pedestal':
            this.seedDescription += 'Pedestal ';
            break;
          case 'dungeons':
            this.seedDescription += 'All Dungeons ';
            break;
          case 'triforce':
            this.seedDescription += 'Triforce Hunt ';
        }
        this.seedDescription = this.seedDescription.slice(0, -1);
        this.seedDescription += ')';
      }
      if (this.config.vtSeedNumber) {
        this.seedDescription += ' Seed: ' + this.config.vtSeedNumber;
        this._route.queryParams.subscribe((params) => {
          if (!params.seed) {
            var updatedParams = JSON.parse(JSON.stringify(params));
            updatedParams.seed = this.config.vtSeedNumber;
            this._router.navigate([this._router.url.split('?')[0]], {
              queryParams: updatedParams,
            });
          }
        });
      }
    } else {
      this._router.navigate(['/']);
    }
  }

  onAddedItem(eventData: any[], eventType: string) {
    var node = eventData[0];
    var region = eventData[1];
    var currentRegion = eventData[2];
    node.prize.forEach((prizeId, prizeIndex) => {
      if (eventType !== 'view') {
        var itemInfo = this._itemNamesService.getItemById(prizeId);
        this.items.add(itemInfo.shortName, region);
      }
      var convertedName = this._itemNamesService.convertItemName(prizeId, eventType, this.items);
      this.itemLog.unshift({
        item: prizeId,
        shortName: convertedName[0],
        longName: convertedName[1],
        location: node.tooltip ? node.tooltip : node.id,
        region: region,
        type: eventType,
      });
    });
    if (this.items.triforcePieces >= 20) {
      this.onGameFinished();
    }
    this.gameService.updateData(this.items, region, currentRegion);
  }

  onCantItem(eventData: any[]) {
    var node = eventData[0];
    var region = eventData[1];
    var hasKey = eventData[2];
    var message = '';
    if (+node.status === NodeStatus.BK_LOCKED || +node.status === NodeStatus.BIG_CHEST) {
      if (!hasKey) {
        message = 'Missing Big Key';
      }
    } else if (+node.status === NodeStatus.SK_LOCKED) {
      if (!hasKey) {
        message = 'Missing Small Key';
      }
    }
    if (!message) {
      var prefix;
      prefix = +node.status < 10 ? 'Tried to go to ' : 'Tried to open ';
      message = prefix + node.tooltip + '. ' + node.originalNode.errorMessage;
    }
    this.itemLog.unshift({
      item: node.prize[0],
      shortName: 'cant-item',
      longName: message,
      location: node.tooltip,
      region: region,
      type: 'cant',
    });
  }

  onHintChecked(eventData: any[]) {
    var hintType = eventData[0];
    var hintRegion = eventData[1];
    var hintText = eventData[2];
    if (hintType === 'sign') {
      this.itemLog.unshift({
        item: 'sign',
        shortName: 'sign',
        longName: hintText,
        location: 'Crystal Requirement',
        region: hintRegion,
        type: 'sign',
      });
    } else {
      this.itemLog.unshift({
        item: 'hint',
        shortName: 'hintTile',
        longName: hintText,
        location: hintType,
        region: hintRegion.indexOf('-') === -1 ? hintRegion : hintType,
        type: 'hint',
      });
    }
  }

  onDungeonFinished(eventData: string[]) {
    var dungeonPrize = eventData[0];
    var dungeonName = eventData[1];
    if (dungeonPrize.indexOf('Agahnim') === -1) {
      this.items.add(this._itemNamesService.getItemById(dungeonPrize).shortName, dungeonName);
      var convertedName = this._itemNamesService.convertItemName(dungeonPrize, 'get', this.items);
      this.itemLog.unshift({
        item: dungeonPrize,
        shortName: convertedName[0],
        longName: convertedName[1],
        location: dungeonName + "'s Boss",
        region: dungeonName,
        type: 'get',
      });
    }
  }

  onGameFinished() {
    this.gameState = 'finished';
  }

  preloadIcons() {
    var iconUrls = [
      'assets/dungeon-tracker-icons/chest0.png',
      'assets/dungeon-tracker-icons/chest1.png',
      'assets/dungeon-tracker-icons/chest2.png',
      'assets/dungeon-tracker-icons/chest3.png',
      'assets/dungeon-tracker-icons/chest4.png',
      'assets/dungeon-tracker-icons/chest5.png',
      'assets/dungeon-tracker-icons/chest6.png',
    ];
    this.preloadedImages = [];
    iconUrls.forEach((url, index) => {
      this.preloadedImages[index] = new Image();
      this.preloadedImages[index].src = url;
    });
  }

  preloadMaps() {
    this.preloadedMaps = [];
    this.dungeonsData.forEach((dungeon, index) => {
      this.preloadedMaps[index] = new Image();
      this.preloadedMaps[index].src = 'assets/maps/' + dungeon.name + '/' + dungeon.startingMap.id + '.png';
    });
  }

  onContinuePlaying() {
    this.gameState = 'playing';
  }

  onBackMainMenu() {
    this._router.navigate(['/']);
  }
}
