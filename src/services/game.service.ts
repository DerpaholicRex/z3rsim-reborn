import { ItemNamesService } from '../services/item-names.service';
import { Injectable } from '@angular/core';
import { SeedParser } from '../services/seed-parser.service';
import { Config } from '../models/config.model';
import { Items } from '../models/items.model';
import { NodeStatus } from '../models/node-status.enum';
import { DungeonNode } from '../models/dungeon-node.model';
import { OverworldData } from '../models/overworld-data.model';
import { Dungeon } from '../models/dungeon.model';
import { EasternPalaceSetup } from '../dungeons/eastern-palace.setup';
import { DesertPalaceSetup } from '../dungeons/desert-palace.setup';
import { TowerOfHeraSetup } from '../dungeons/tower-of-hera.setup';
import { AgaTowerSetup } from '../dungeons/aga-tower.setup';
import { PalaceOfDarknessSetup } from '../dungeons/palace-of-darkness.setup';
import { SwampPalaceSetup } from '../dungeons/swamp-palace.setup';
import { SkullWoodsSetup } from '../dungeons/skull-woods.setup';
import { ThievesTownSetup } from '../dungeons/thieves-town.setup';
import { IcePalaceSetup } from '../dungeons/ice-palace.setup';
import { MiseryMireSetup } from '../dungeons/misery-mire.setup';
import { TurtleRockSetup } from '../dungeons/turtle-rock.setup';
import { GanonsTowerSetup } from '../dungeons/ganons-tower.setup';
import { LightWorldSetup } from '../dungeons/light-world.setup';
import { DarkWorldSetup } from '../dungeons/dark-world.setup';
import { HyruleCastleSetup } from '../dungeons/hyrule-castle.setup';

@Injectable({ providedIn: 'root' })
export class GameService {
  dungeonAbbrevs: string[];
  lwDuns: string[];
  dwDuns: string[];
  prizesToReplace: { [key: string]: string };
  config: Config;
  dungeonsData: Dungeon[];
  overworldData: OverworldData;

  constructor(private _itemNamesService: ItemNamesService) {
    this.dungeonAbbrevs = [
      'ep',
      'dp',
      'toh',
      'ct',
      'pod',
      'sp',
      'sw',
      'tt',
      'ip',
      'mm',
      'tr',
      'gt',
      'lw',
      'dw',
      'hc',
    ];
    this.lwDuns = ['Eastern Palace', 'Desert Palace', 'Tower of Hera', 'Aga Tower'];
    this.dwDuns = [
      'Palace of Darkness',
      'Swamp Palace',
      'Skull Woods',
      'Thieves Town',
      'Ice Palace',
      'Misery Mire',
      'Turtle Rock',
      'Ganons Tower',
    ];
    this.prizesToReplace = {};
  }

  loadSeed(seedData: string, seedNumber: string, isLogic: boolean, isFullMap: boolean, bosses: number[], hints: string[]) {
    var seedMetadata = SeedParser.collectSeedMetadata(seedData);
    this.config = new Config(seedNumber, seedMetadata, bosses, isLogic, isFullMap);
    if (hints && hints.length > 0) {
      this.config.hints = this.shuffleArray(hints);
      this.config.hintsEnabled = true;
    }
    if (seedMetadata.mode === 'inverted') {
      this.config.isFullMap = false;
      this.lwDuns = ['Eastern Palace', 'Desert Palace', 'Tower of Hera', 'Ganons Tower'];
      this.dwDuns = [
        'Palace of Darkness',
        'Swamp Palace',
        'Skull Woods',
        'Thieves Town',
        'Ice Palace',
        'Misery Mire',
        'Turtle Rock',
        'Aga Tower',
      ];
    } else {
      this.lwDuns = ['Eastern Palace', 'Desert Palace', 'Tower of Hera', 'Aga Tower'];
      this.dwDuns = [
        'Palace of Darkness',
        'Swamp Palace',
        'Skull Woods',
        'Thieves Town',
        'Ice Palace',
        'Misery Mire',
        'Turtle Rock',
        'Ganons Tower',
      ];
    }
    var seedPayload = seedData.substr(40);
    var itemCodes = [];
    for (var idx = 0; idx < seedPayload.length / 3; idx++) {
      itemCodes.push((+seedPayload.substr(idx * 3, 3)).toString());
    }
    var itemData = itemCodes;
    this.dungeonsData = [];
    this.dungeonsData.push(EasternPalaceSetup.setup(itemData, this.config));
    this.dungeonsData.push(DesertPalaceSetup.setup(itemData, this.config));
    this.dungeonsData.push(TowerOfHeraSetup.setup(itemData, this.config));
    this.dungeonsData.push(AgaTowerSetup.setup(itemData, this.config));
    this.dungeonsData.push(PalaceOfDarknessSetup.setup(itemData, this.config));
    this.dungeonsData.push(SwampPalaceSetup.setup(itemData, this.config));
    this.dungeonsData.push(SkullWoodsSetup.setup(itemData, this.config));
    this.dungeonsData.push(ThievesTownSetup.setup(itemData, this.config));
    this.dungeonsData.push(IcePalaceSetup.setup(itemData, this.config));
    this.dungeonsData.push(MiseryMireSetup.setup(itemData, this.config));
    this.dungeonsData.push(TurtleRockSetup.setup(itemData, this.config));
    this.dungeonsData.push(GanonsTowerSetup.setup(itemData, this.config));
    if (this.config.isEnemizer) {
      this.dungeonsData.forEach(function (dungeon, dungeonIndex) {
        if (dungeonIndex !== 3 && dungeonIndex !== 11) {
          dungeon.dungeonMaps[dungeon.dungeonMaps.length - 1].nodes.forEach(function (node) {
            if (node.status === NodeStatus.BOSS) {
              var bossIndex = dungeonIndex;
              if (bossIndex > 3) {
                bossIndex--;
              }
              node.canOpen = DungeonNode.bossReqs[bosses[bossIndex]];
              node.canGlitch = DungeonNode.glitchedBossReqs[bosses[bossIndex]];
            }
          });
        }
        if (dungeonIndex === 11) {
          var bossIndex = 10;
          dungeon.dungeonMaps.forEach(function (floor) {
            floor.nodes.forEach(function (node) {
              if (node.status === NodeStatus.BOSS && bossIndex <= 12) {
                node.canOpen = DungeonNode.bossReqs[bosses[bossIndex]];
                node.canGlitch = DungeonNode.glitchedBossReqs[bosses[bossIndex]];
                bossIndex++;
              }
            });
          });
        }
      });
    }
    if (this.config.isFullMap) {
      this.dungeonsData.push(LightWorldSetup.setup(itemData, this.config));
      this.dungeonsData.push(DarkWorldSetup.setup(itemData, this.config));
      this.dungeonsData.push(HyruleCastleSetup.setup(itemData, this.config));
    } else {
      this.overworldData = new OverworldData(itemData, this.config);
    }
    this.config.data = seedData;
    this.setupData(this.config.isFullMap);
  }

  setupData(isFullMap: boolean) {
    if (!isFullMap) {
      this.overworldData.lwLocations.forEach(function (location) {
        var statusClass = '';
        statusClass =
          location.item[0] === 'warp'
            ? 'invisible'
            : location.item[0] === 'tr-ledge'
              ? 'tr-ledge'
              : location.canView
                ? 'viewable'
                : location.canGet
                  ? 'unavailable'
                  : 'getable';
        if (location.item[0].charAt(0) === '=') {
          statusClass += ' hint';
        } else if (location.item[0].includes('requirement')) {
          statusClass += ' sign';
        }
        location.mapNode = {
          x: location.x * 2,
          y: location.y,
          tooltip: location.location,
          id: location.location,
          status: statusClass,
          prize: location.item,
          originalNode: location,
          isFaded: false,
        };
      });
      this.overworldData.dwLocations.forEach(function (location) {
        var statusClass = '';
        statusClass =
          location.item[0] === 'warp'
            ? 'invisible'
            : location.canView
              ? 'viewable'
              : location.canGet
                ? 'unavailable'
                : 'getable';
        if (location.item[0].charAt(0) === '=') {
          statusClass += ' hint';
        } else if (location.item[0].includes('requirement')) {
          statusClass += ' sign';
        }
        location.mapNode = {
          x: (location.x - 50) * 2,
          y: location.y,
          tooltip: location.location,
          id: location.location,
          status: statusClass,
          prize: location.item,
          originalNode: location,
          isFaded: false,
        };
      });
    }
    var doorStatuses = [
      NodeStatus.OPEN_DOOR,
      NodeStatus.SK_LOCKED,
      NodeStatus.BK_LOCKED,
      NodeStatus.WATER_WARP,
      NodeStatus.HOLE,
    ];
    this.dungeonsData.forEach((dungeon) => {
      dungeon.dungeonMaps.forEach((floor) => {
        floor.nodes.forEach((node, nodeIndex) => {
          if (node.name === '' && doorStatuses.indexOf(+node.status) > -1) {
            var targetId = node.content;
            var found = false;
            dungeon.dungeonMaps.forEach(function (searchFloor) {
              if (searchFloor.id === targetId) {
                node.name = searchFloor.name;
                found = true;
              }
            });
            if (!found) {
              this.dungeonsData.forEach(function (searchDungeon) {
                if (!found) {
                  searchDungeon.dungeonMaps.forEach(function (searchFloor) {
                    if (searchFloor.id === targetId) {
                      node.name = searchFloor.name;
                      found = true;
                    }
                  });
                }
              });
            }
          }
          node.mapNode = {
            x: node.x ? node.x : nodeIndex * 10 + 15,
            y: node.y ? node.y : node.status === NodeStatus.MIRROR ? 30 : 15,
            tooltip: node.name,
            id: node.content,
            status: node.status.toString(),
            prize: [node.content],
            originalNode: node,
            isFaded: false,
          };
        });
      });
      dungeon.mapNode = {
        x: dungeon.x,
        y: dungeon.y,
        tooltip: dungeon.name,
        id: dungeon.startingMap.id,
        status: 'unavailable',
        prize: [],
        originalNode: dungeon,
        isFaded: false,
      };
    });
  }

  updateData(items: Items, mapName: string, viewType?: string) {
    if (viewType === undefined) {
      viewType = '';
    }
    if (this.overworldData) {
      this.overworldData.lwLocations.forEach((location) => {
        if (location.item[0] === 'tr-ledge') {
          if (
            location.canGet(items, this.config) ||
            (this.config.canGlitch && location.canGlitch && location.canGlitch(items, this.config))
          ) {
            location.mapNode.status = 'tr-ledge';
          } else {
            location.mapNode.status = 'invisible';
          }
        } else if (location.item[0] === 'warp') {
          if (
            location.canGet(items, this.config) ||
            (this.config.canGlitch && location.canGlitch && location.canGlitch(items, this.config))
          ) {
            location.mapNode.status = 'warp';
          } else {
            location.mapNode.status = 'invisible';
          }
        } else if (
          location.location !== 'Ether Tablet' &&
          location.location !== 'Bombos Tablet' &&
          (location.mapNode.status === 'now-getable' ||
            ((location.mapNode.status === 'viewable' ||
              location.mapNode.status === 'g-viewable' ||
              (location.mapNode.status === 'g-getable' && location.canView) ||
              location.mapNode.status === 'now-g-getable') &&
              location.canGet(items, this.config)) ||
            (location.canView && location.canGet(items, this.config) && location.mapNode.status === 'unavailable'))
        ) {
          if (location.mapNode.isFaded || location.mapNode.status === 'g-getable') {
            location.mapNode.status = 'getable';
          } else {
            location.mapNode.status = 'now-getable';
          }
        } else if (!location.canGet || location.canGet(items, this.config)) {
          location.mapNode.status = 'getable';
        } else if (
          location.location !== 'Ether Tablet' &&
          location.location !== 'Bombos Tablet' &&
          (location.mapNode.status === 'now-g-getable' ||
            ((location.mapNode.status === 'viewable' || location.mapNode.status === 'g-viewable') &&
              this.config.canGlitch &&
              location.canGlitch &&
              location.canGlitch(items, this.config)) ||
            (this.config.canGlitch &&
              location.canViewGlitch &&
              this.config.canGlitch &&
              location.canGlitch &&
              location.canGlitch(items, this.config) &&
              location.mapNode.status === 'unavailable'))
        ) {
          if (location.mapNode.isFaded) {
            location.mapNode.status = 'g-getable';
          } else {
            location.mapNode.status = 'now-g-getable';
          }
        } else if (this.config.canGlitch && location.canGlitch && location.canGlitch(items, this.config)) {
          location.mapNode.status = 'g-getable';
        } else if (location.canView && location.canView(items, this.config)) {
          location.mapNode.status = 'viewable';
        } else if (this.config.canGlitch && location.canViewGlitch && location.canViewGlitch(items, this.config)) {
          location.mapNode.status = 'g-viewable';
        } else {
          location.mapNode.status = 'unavailable';
        }
        if (location.item[0].charAt(0) === '=') {
          location.mapNode.status += ' hint';
        } else if (location.item[0].includes('requirement')) {
          // Original bug: writes to bare `status` variable instead of `location.mapNode.status`,
          // making sign append a no-op for LW locations.
          // Original: status += " sign"
          // Fixed: location.mapNode.status += ' sign';
          location.mapNode.status += ' sign';
        }
        location.item = this.checkReplacePrizes(location.item);
        location.mapNode.prize = this.checkReplacePrizes(location.mapNode.prize);
      });
      this.overworldData.dwLocations.forEach((location) => {
        if (location.item[0] === 'warp') {
          if (
            location.canGet(items, this.config) ||
            (this.config.canGlitch && location.canGlitch && location.canGlitch(items, this.config))
          ) {
            location.mapNode.status = 'warp';
          } else {
            location.mapNode.status = 'invisible';
          }
        } else {
          var statusClass = '';
          if (
            !location.mapNode.isFaded &&
            this.config.canGlitch &&
            location.canViewGlitch &&
            location.canViewGlitch(items, this.config) &&
            !location.canGet(items, this.config) &&
            !location.canView(items, this.config)
          ) {
            statusClass += ' g-viewable';
          } else if (
            location.mapNode.status.indexOf('now-getable') > -1 ||
            (location.canView &&
              (location.mapNode.status.indexOf('unavailable') > -1 ||
                location.mapNode.status.indexOf('viewable') > -1) &&
              location.canGet(items, this.config)) ||
            (location.mapNode.status.indexOf('now-g-getable') > -1 && location.canGet(items, this.config))
          ) {
            statusClass += ' now-getable';
          } else if (
            location.mapNode.status.indexOf('now-g-getable') > -1 ||
            (!location.mapNode.isFaded &&
              this.config.canGlitch &&
              location.canViewGlitch &&
              this.config.canGlitch &&
              location.canGlitch &&
              location.canGlitch(items, this.config) &&
              location.mapNode.status === 'unavailable')
          ) {
            statusClass += ' now-g-getable';
          } else if (!location.canGet || location.canGet(items, this.config)) {
            statusClass += ' getable';
          } else if (this.config.canGlitch && location.canGlitch && location.canGlitch(items, this.config)) {
            statusClass += ' g-getable';
          } else if (location.canView && location.canView(items, this.config)) {
            statusClass += ' viewable';
          } else {
            statusClass += ' unavailable';
          }
          location.mapNode.status = statusClass;
          if (location.item[0].charAt(0) === '=') {
            location.mapNode.status += ' hint';
          } else if (location.item[0].includes('requirement')) {
            statusClass += ' sign';
          }
        }
        location.item = this.checkReplacePrizes(location.item);
        location.mapNode.prize = this.checkReplacePrizes(location.mapNode.prize);
      });
      if (mapName === 'light-world') {
        this.dungeonsData.forEach((dungeon) => {
          if (this.lwDuns.indexOf(dungeon.name) > -1) {
            var dungeonStatus = 'unavailable';
            if (dungeon.canEnter(items, this.config)) {
              dungeonStatus = 'getable';
            }
            dungeon.mapNode.status = dungeonStatus;
          }
        });
      } else if (mapName === 'dark-world') {
        this.dungeonsData.forEach((dungeon) => {
          if (this.lwDuns.indexOf(dungeon.name) === -1) {
            var dungeonStatus = 'unavailable';
            if (this.config.mode === 'inverted') {
              dungeonStatus = 'reachable';
            } else {
              if (viewType && viewType !== 'all') {
                if (
                  ((viewType === 'ip' && dungeon.name === 'Ice Palace') ||
                    (viewType === 'mire' && dungeon.name === 'Misery Mire') ||
                    (viewType === 'dm' && (dungeon.name === 'Turtle Rock' || dungeon.name === 'Ganons Tower')) ||
                    (viewType === 'ow' &&
                      dungeon.name !== 'Ice Palace' &&
                      dungeon.name !== 'Misery Mire' &&
                      dungeon.name !== 'Turtle Rock' &&
                      dungeon.name !== 'Ganons Tower')) &&
                  dungeon.canEnter(items, this.config)
                ) {
                  dungeonStatus = 'getable';
                }
              } else if (dungeon.canEnter(items, this.config)) {
                dungeonStatus = 'getable';
              }
              dungeonStatus =
                (viewType === 'ip' && dungeon.name === 'Ice Palace') ||
                (viewType === 'mire' && dungeon.name === 'Misery Mire') ||
                (viewType === 'dm' && (dungeon.name === 'Turtle Rock' || dungeon.name === 'Ganons Tower')) ||
                (viewType === 'ow' &&
                  dungeon.name !== 'Ice Palace' &&
                  dungeon.name !== 'Misery Mire' &&
                  dungeon.name !== 'Turtle Rock' &&
                  dungeon.name !== 'Ganons Tower')
                  ? 'reachable'
                  : 'unavailable';
            }
            if (dungeon.canEnter(items, this.config)) {
              dungeonStatus += ' getable';
            } else {
              dungeonStatus += ' unaccessible';
            }
            dungeon.mapNode.status = dungeonStatus;
          }
        });
      }
    }
    this.dungeonsData.forEach((dungeon) => {
      dungeon.dungeonMaps.forEach((floor) => {
        floor.nodes.forEach((node) => {
          node.content = this.checkReplacePrizes([node.content])[0];
          node.mapNode.prize = this.checkReplacePrizes(node.mapNode.prize);
        });
      });
    });
  }

  getAccessibleDungeons(items: Items, worldName: string, filter: string) {
    if (filter === undefined) {
      filter = '';
    }
    var results = [];
    if (worldName === 'light-world') {
      this.dungeonsData.forEach((dungeon) => {
        if (this.lwDuns.indexOf(dungeon.name) > -1) {
          var dungeonStatus = 'unavailable';
          if (dungeon.canEnter(items, this.config)) {
            dungeonStatus = 'getable';
          }
          results.push({
            x: dungeon.x,
            y: dungeon.y,
            tooltip: dungeon.name,
            id: dungeon.startingMap.id,
            status: dungeonStatus,
            prize: [],
            originalNode: dungeon,
            isFaded: false,
          });
        }
      });
    } else if (worldName === 'dark-world') {
      this.dungeonsData.forEach((dungeon) => {
        if (this.lwDuns.indexOf(dungeon.name) === -1) {
          var dungeonStatus = 'unavailable';
          if (filter && filter !== 'all') {
            if (
              ((filter === 'ip' && dungeon.name === 'Ice Palace') ||
                (filter === 'mire' && dungeon.name === 'Misery Mire') ||
                (filter === 'dm' && (dungeon.name === 'Turtle Rock' || dungeon.name === 'Ganons Tower')) ||
                (filter === 'ow' &&
                  dungeon.name !== 'Ice Palace' &&
                  dungeon.name !== 'Misery Mire' &&
                  dungeon.name !== 'Turtle Rock' &&
                  dungeon.name !== 'Ganons Tower')) &&
              dungeon.canEnter(items, this.config)
            ) {
              dungeonStatus = 'getable';
            }
          } else if (dungeon.canEnter(items, this.config)) {
            dungeonStatus = 'getable';
          }
          dungeonStatus =
            (filter === 'ip' && dungeon.name === 'Ice Palace') ||
            (filter === 'mire' && dungeon.name === 'Misery Mire') ||
            (filter === 'dm' && (dungeon.name === 'Turtle Rock' || dungeon.name === 'Ganons Tower')) ||
            (filter === 'ow' &&
              dungeon.name !== 'Ice Palace' &&
              dungeon.name !== 'Misery Mire' &&
              dungeon.name !== 'Turtle Rock' &&
              dungeon.name !== 'Ganons Tower')
              ? 'reachable'
              : 'unavailable';
          if (dungeon.canEnter(items, this.config)) {
            dungeonStatus += ' getable';
          } else {
            dungeonStatus += ' unaccessible';
          }
          results.push({
            x: dungeon.x,
            y: dungeon.y,
            tooltip: dungeon.name,
            id: dungeon.startingMap.id,
            status: dungeonStatus,
            prize: [],
            originalNode: dungeon,
            isFaded: false,
          });
        }
      });
    }
    return results;
  }

  getDungeonPrizes() {
    var prizes = {};
    this.dungeonsData.forEach((dungeon, dungeonIndex) => {
      if (dungeonIndex !== 3 && dungeonIndex !== 11) {
        prizes[dungeon.name] = this._itemNamesService.getItemById(dungeon.dungeonPrize).longName;
      }
    });
    return prizes;
  }

  getMap(mapId: string) {
    var foundMap;
    var foundDungeon;
    var dungeonIndex = this.dungeonAbbrevs.indexOf(mapId.split('-')[0]);
    if (
      dungeonIndex > -1 &&
      (this.dungeonsData[dungeonIndex].dungeonMaps.forEach((floor) => {
        if (floor.id === mapId) {
          foundMap = floor;
          foundDungeon = this.dungeonsData[dungeonIndex];
        }
      }),
      foundMap)
    ) {
      return [foundMap, foundDungeon];
    } else {
      console.log('Map not found');
      return [null, null];
    }
  }

  addItemReplacement(itemName: string) {
    var item = this._itemNamesService.getItemByLongName(itemName);
    if (!this.prizesToReplace[item.id]) {
      this.prizesToReplace[item.id] = '7';
    }
  }

  checkReplacePrizes(prizes: string[]) {
    return prizes.map((prizeId) => {
      if (this.prizesToReplace[prizeId]) {
        return this.prizesToReplace[prizeId];
      } else {
        return prizeId;
      }
    });
  }

  shuffleArray(array: any[]) {
    var temp;
    var randomIndex;
    for (var remaining = array.length; remaining !== 0; ) {
      randomIndex = Math.floor(Math.random() * remaining);
      remaining -= 1;
      temp = array[remaining];
      array[remaining] = array[randomIndex];
      array[randomIndex] = temp;
    }
    return array;
  }
}
