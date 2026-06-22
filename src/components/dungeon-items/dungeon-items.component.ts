import { GameService } from '../../services/game.service';
import { Component, ElementRef, OnDestroy, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ItemNamesService } from '../../services/item-names.service';
import { ModalStateService } from '../../services/modal-state.service';
import { SeedReportService } from '../../services/seed-report.service';
import { trapFocus, restoreFocusAfterClose } from '../ui/focus-trap';
import { isDebug } from '../../debug';
import { NodeStatus } from '../../models/node-status.enum';
import { Items } from '../../models/items.model';
import { Config } from '../../models/config.model';
import { Dungeon } from '../../models/dungeon.model';
import { DungeonMap } from '../../models/dungeon-map.model';
import { DungeonNode } from '../../models/dungeon-node.model';
import { DungeonPrize } from '../../models/dungeon-prize.enum';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeComponent } from '../node/node.component';
import { DungeonItemCountComponent } from '../dungeon-item-count/dungeon-item-count.component';
import { SeedService } from '../../services/seed.service';

@Component({
    selector: 'app-map',
    templateUrl: './dungeon-items.component.html',
    styleUrls: ['./dungeon-items.component.css'],
    imports: [NgStyle, NodeComponent, DungeonItemCountComponent, FormsModule]
})
export class DungeonItemsComponent implements OnDestroy, OnInit {
  @ViewChild('reportDescriptionInput') reportDescriptionInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('reportModal') reportModal?: ElementRef<HTMLDivElement>;
  isModalOpen = false;
  isDebug: boolean;
  hasUsedMirror: boolean;
  currentRegion: string;
  preloadedImages: HTMLImageElement[];
  nonDuns: string[];
  currentDungeonMap: DungeonMap;
  currentDungeon: Dungeon;
  currentDungeonItems: DungeonPrize;
  originalWorld: string;
  otherWorld: string;
  clipboardMessage: string;
  dungeonFinishMap: string;
  dungeonFinishRegion: number;
  dungeonMirrorMap: string;
  mirrorNode: DungeonNode;
  mirrorRegion: number;
  mirrorMap: string;
  tooltip: string;
  warpButtonText: string;

  @Input() items: Items;
  @Input() currentMap: string;
  @Input() config: Config;

  @Output() addedItem = new EventEmitter<any[]>();
  @Output() viewItem = new EventEmitter<any[]>();
  @Output() cantItem = new EventEmitter<any[]>();
  @Output() hintCheck = new EventEmitter<any[]>();
  @Output() finishedDungeon = new EventEmitter<string[]>();
  @Output() onGameFinished = new EventEmitter<string>();

  isSubmittingReport: boolean;
  reportDescription: string;
  reportMessage: string;
  reportError: string;
  private modalTrigger?: HTMLElement;

  constructor(
    private gameService: GameService,
    private itemNameService: ItemNamesService,
    private _modalStateService: ModalStateService,
    private _seedService: SeedService,
    
    private _seedReportService: SeedReportService,
  ) {
    this.isSubmittingReport = false;
    this.reportDescription = '';
    this.reportMessage = '';
    this.reportError = '';
    this.isDebug = false;
    this.hasUsedMirror = false;
    this.currentRegion = 'ow';
    this.preloadedImages = [];
    this.nonDuns = ['lw', 'dw'];
  }

  ngOnInit() {
    this.isDebug = isDebug();
    if (this.config.isFullMap) {
      var mapResult = this.gameService.getMap(this.currentMap);
      this.currentDungeonMap = mapResult[0];
      this.currentDungeon = mapResult[1];
      this.currentDungeonMap.preloadImages(this.currentDungeon.name);
      this.changeMap(this.currentDungeonMap.id);
      this.currentDungeonItems = this.items.getDungeonItems(this.currentDungeon.name);
    }
    if (this.config.mode === 'inverted') {
      this.originalWorld = 'dark-world';
      this.otherWorld = 'light-world';
    } else {
      this.originalWorld = 'light-world';
      this.otherWorld = 'dark-world';
    }
    this.clearTooltip();
    this.clipboardMessage = '';
    this.preloadMapsAndIcons();
  }

  ngOnDestroy() {
    this._modalStateService.setReportModalOpen(false);
  }

  ngOnChanges() {
    if (this.currentMap === 'light-world' || this.currentMap === 'dark-world') {
      if (this.currentDungeonMap) {
        this.currentDungeonMap.cleanPreload();
      }
      this.currentDungeon = null;
      this.currentDungeonMap = null;
      this.currentDungeonItems = null;
    }
  }

  onNodeClick(node: any) {
    if (this.config.noLogic) {
      if (this.items.spFlooded) {
        this.unfloodSwamp();
      }
      if (node.prize[0] === 'warp') {
        this.currentRegion = node.id;
        this.changeMap(this.otherWorld);
      } else if (node.prize[0] === 'tr-ledge') {
        this.changeDungeon('tr-inverted-ledge');
      } else if (node.prize[0] === 'gt-requirement') {
        this.hintCheck.emit(['sign', "Ganon's Tower Entry", this.getSignpostText('tower')]);
      } else if (node.prize[0] === 'ganon-requirement') {
        this.hintCheck.emit(['sign', 'Ganon Vulnerability', this.getSignpostText('ganon')]);
      } else if (node.prize[0].charAt(0) === '=') {
        this.hintCheck.emit([node.tooltip, this.currentMap, this.config.hints[+node.prize[0].substr(1)]]);
      } else if (
        node.status === 'opened' ||
        node.originalNode.isOpened ||
        (node.originalNode.canView && !node.isFaded)
      ) {
        if (node.status !== 'opened' && node.originalNode.canView) {
          this.viewItem.emit([node, this.currentMap, this.currentRegion]);
          node.isFaded = true;
        }
      } else {
        this.addPrizes(node, this.currentMap);
        if (node.originalNode) {
          node.originalNode.isOpened = true;
        }
        node.status = 'opened';
        if (node.tooltip === 'Ganon' || node.prize[0] === '270') {
          this.onGameFinished.emit('');
        }
      }
      return;
    }
    if (!(node.status.indexOf('unreachable') > -1)) {
      if (this.items.spFlooded) {
        this.unfloodSwamp();
      }
      if (
        (node.status.indexOf('now-getable') > -1 || node.status.indexOf('now-g-getable') > -1) &&
        !node.isFaded
      ) {
        this.viewItem.emit([node, this.currentMap, this.currentRegion]);
        if (node.status.indexOf('now-getable') > -1) {
          node.status = 'getable';
        } else {
          node.status = 'g-getable';
        }
        this.gameService.updateData(this.items, this.currentMap, this.currentRegion);
      } else if (node.status.indexOf('getable') > -1) {
        if (!node.originalNode.isOpened && node.status.indexOf('unreachable') === -1) {
          if (node.prize[0] === 'gt-requirement') {
            this.hintCheck.emit(['sign', "Ganon's Tower Entry", this.getSignpostText('tower')]);
          } else if (node.prize[0] === 'ganon-requirement') {
            this.hintCheck.emit(['sign', 'Ganon Vulnerability', this.getSignpostText('ganon')]);
          } else if (node.prize[0].charAt(0) === '=') {
            this.hintCheck.emit([
              node.tooltip,
              this.currentMap,
              this.config.hints[+node.prize[0].substr(1)],
            ]);
          } else {
            this.addPrizes(node, this.currentMap);
            if (node.originalNode) {
              node.originalNode.isOpened = true;
            }
            node.status = 'opened';
            if (node.tooltip === 'Ganon' || node.prize[0] === '270') {
              this.onGameFinished.emit('');
            }
          }
        }
      } else if (node.status.indexOf('viewable') > -1) {
        this.viewItem.emit([node, this.currentMap, this.currentRegion]);
      } else if (node.status === 'warp') {
        this.currentRegion = node.id;
        this.changeMap(this.otherWorld);
      } else if (node.status === 'tr-ledge') {
        this.changeDungeon('tr-inverted-ledge');
      }
    }
  }

  addPrizes(node: any, region: string) {
    this.addedItem.emit([node, region, this.currentRegion]);
  }

  onDungeonClick(node: any) {
    if (
      this.config.noLogic ||
      (node.status.indexOf('getable') > -1 && node.status.indexOf('unavailable') === -1)
    ) {
      if (node.id === 'tr-entry') {
        this.changeDungeon('tr-entry');
        node.originalNode.startingMap.id = 'tr-entry';
      } else {
        this.changeDungeon(node.originalNode.startingMap.id);
      }
    }
  }

  changeDungeon(mapId: string) {
    if (this.currentDungeonMap) {
      this.currentDungeonMap.cleanPreload();
    }
    if (
      this.currentDungeonMap &&
      this.nonDuns.indexOf(this.currentDungeonMap.id.split('-')[0]) > -1 &&
      this.nonDuns.indexOf(mapId.split('-')[0]) === -1
    ) {
      this.dungeonFinishMap = this.currentDungeonMap.id;
      this.dungeonFinishRegion = this.items.currentRegionInMap;
      this.dungeonMirrorMap = mapId;
    }
    if (mapId === 'dw-desert') {
      this.checkMedallion('mm');
    }
    if (mapId === 'dw-trportal') {
      this.checkMedallion('tr');
    }
    this.resetDungeons();
    if (mapId !== 'sp-entry') {
      this.unfloodSwamp();
    }
    var mapResult = this.gameService.getMap(mapId);
    this.currentDungeonMap = mapResult[0];
    this.currentDungeon = mapResult[1];
    if (mapId === 'tr-entry') {
      this.currentDungeon.startingMap = this.currentDungeonMap;
    }
    this.currentDungeonMap.preloadImages(this.currentDungeon.name);
    this.changeMap(this.currentDungeonMap.id);
    this.items.visitDungeon(this.currentDungeon.name);
    this.checkMapsLeft();
    this.currentDungeonItems = this.items.getDungeonItems(this.currentDungeon.name);
    if (this.currentDungeon.name === 'Turtle Rock') {
      this.items.trMedallionChecked = true;
    }
    if (this.currentDungeon.name === 'Misery Mire') {
      this.items.mmMedallionChecked = true;
    }
  }

  changeMapInDungeon(targetMapId: string) {
    if (this.currentDungeonMap) {
      this.currentDungeonMap.cleanPreload();
    }
    if (targetMapId === 'exit') {
      this.leaveDungeon();
    } else {
      var targetMap;
      this.currentDungeon.dungeonMaps.forEach((dungeonMap) => {
        if (dungeonMap.id === targetMapId) {
          targetMap = dungeonMap;
        }
      });
      if (targetMap) {
        this.currentDungeonMap = targetMap;
        this.currentDungeonMap.preloadImages(this.currentDungeon.name);
        this.changeMap(targetMap.id);
        if (this.config.isEnemizer) {
          this.currentDungeonMap.nodes.forEach((mapNode) => {
            if (mapNode.status === NodeStatus.BOSS) {
              if (!this.config.checkedBosses[this.currentDungeonItems.dungeonId]) {
                this.config.checkedBosses[this.currentDungeonItems.dungeonId] = true;
              }
            }
          });
        }
      }
    }
  }

  onDungeonNodeClick(node: any) {
    if (
      this.config.noLogic ||
      node.originalNode.canOpen(this.items, this.config) ||
      (this.config.canGlitch &&
        node.originalNode.canGlitch &&
        node.originalNode.canGlitch(this.items, this.config))
    ) {
      switch (+node.status) {
        case NodeStatus.OPEN_DOOR_PUSH_BLOCK:
          this.addPrizes(node, this.currentDungeon.name);
          node.originalNode.status = NodeStatus.OPEN_DOOR.toString();
        case NodeStatus.SQ_OPTION:
        case NodeStatus.HOLE:
        case NodeStatus.WATER_WARP:
        case NodeStatus.OPEN_DOOR:
          if (this.currentDungeonMap.id === 'tr-inverted-ledge') {
            if (node.id === 'tr-bc') {
              this.currentDungeon.startingMap = this.gameService.getMap('tr-bc')[0];
            } else if (node.id === 'tr-laser-bridge') {
              this.currentDungeon.startingMap = this.gameService.getMap('tr-laser-bridge')[0];
            }
          }
          if (node.prize[0] === 'hc-darkchest' && this.items.gameState === 2) {
            this.items.gameState = 3;
          } else if (node.prize[0] === 'hc-sanctuary' && this.items.gameState === 3) {
            this.items.gameState = 4;
          }
          if (this.items.spFlooded && node.prize[0].substr(0, 2) === 'dw') {
            this.unfloodSwamp();
          }
          if (node.prize[0] === 'Ganon' || node.prize[0] === 'Triforce') {
            this.addPrizes(node, this.currentDungeon.name);
            this.onGameFinished.emit('');
          } else if (
            node.prize[0] !== 'exit' &&
            node.prize[0].split('-')[0] !== this.currentDungeonMap.id.split('-')[0]
          ) {
            this.changeDungeon(node.prize[0]);
            this.items.currentRegionInMap = node.originalNode.destinationSection;
          } else {
            this.changeMapInDungeon(node.prize[0]);
            this.items.currentRegionInMap = node.originalNode.destinationSection;
          }
          break;
        case NodeStatus.SK_LOCKED:
          if (this.config.noLogic || this.currentDungeonItems.smallKeys > 0) {
            this.currentDungeonItems.smallKeys--;
            if (this.currentDungeonItems.smallKeys < 0) {
              this.currentDungeonItems.smallKeys = 0;
            }
            node.originalNode.status = NodeStatus.OPEN_DOOR.toString();
            this.currentDungeon.dungeonMaps.forEach((dungeonMap) => {
              if (dungeonMap.id === node.prize[0]) {
                dungeonMap.nodes.forEach((mapNode) => {
                  if (mapNode.content === this.currentDungeonMap.id) {
                    mapNode.status = NodeStatus.OPEN_DOOR.toString();
                  }
                });
              }
            });
          } else {
            this.cantItem.emit([node, this.currentDungeon.name, false]);
          }
          break;
        case NodeStatus.BK_LOCKED:
          if (this.config.noLogic || this.currentDungeonItems.hasBigKey) {
            this.changeMapInDungeon(node.prize[0]);
            this.items.currentRegionInMap = node.originalNode.destinationSection;
          } else {
            this.cantItem.emit([node, this.currentDungeon.name, false]);
          }
          break;
        case NodeStatus.BIG_CHEST:
          if (this.config.noLogic || this.currentDungeonItems.hasBigKey) {
            this.addPrizes(node, this.currentDungeon.name);
            this.items.stats.bigChests++;
            node.originalNode.status = NodeStatus.OPEN_BIG_CHEST.toString();
          } else {
            this.cantItem.emit([node, this.currentDungeon.name, false]);
          }
          break;
        case NodeStatus.VIEWABLE_CLOSED_CHEST:
        case NodeStatus.VIEWABLE_GETABLE_CLOSED_CHEST:
        case NodeStatus.CLOSED_CHEST:
          if (node.tooltip === 'Old Man') {
            this.items.oldManRescued = true;
          } else if (node.tooltip === 'Blacksmiths Item') {
            this.items.blacksmithsRescued = true;
          } else if (node.tooltip === 'Spectacle Rock Item') {
            this.currentDungeon.dungeonMaps.forEach(function (dungeonMap) {
              dungeonMap.nodes.forEach(function (mapNode) {
                if (mapNode.name === 'Spectacle Rock Item') {
                  mapNode.status = NodeStatus.OPEN_CHEST;
                }
              });
            });
          } else if (node.tooltip === "Link's Uncle" && this.items.gameState === 0) {
            this.items.gameState = 1;
          } else if (node.tooltip === "Zelda's Chest" && this.items.gameState === 1) {
            this.items.gameState = 2;
          }
          if (
            node.originalNode.accessibleSectionArray[0] === -1 &&
            +node.status === NodeStatus.CLOSED_CHEST
          ) {
            this.items.currentRegionInMap = 0;
          }
          if (this.config.isFullMap && this.currentDungeonMap.isIndoors) {
            this.addPrizes(node, this.currentDungeonMap.name);
          } else {
            this.addPrizes(node, this.currentDungeon.name);
          }
          node.originalNode.status = NodeStatus.OPEN_CHEST.toString();
          break;
        case NodeStatus.BOSS:
          if (this.currentDungeon.name === 'Ganons Tower' && node.tooltip !== 'Agahnim 2') {
            switch (node.tooltip) {
              case 'Ice Armos':
                this.items.iceArmosDefeated = true;
                break;
              case 'Lanmolas 2':
                this.items.lanmo2Defeated = true;
                break;
              case 'Moldorm 2':
                this.items.moldorms2Defeated = true;
            }
          } else {
            if (
              this.currentDungeon.name === 'Aga Tower' ||
              this.currentDungeon.name === 'Ganons Tower'
            ) {
              this.currentRegion = 'ow';
              if (this.currentDungeon.name === 'Aga Tower') {
                this.items.agahnim = 1;
              }
            }
            this.addPrizes(node, this.currentDungeon.name);
            this.defeatDungeon(this.currentDungeon.name === 'Aga Tower');
          }
          node.originalNode.status = NodeStatus.DEFEATED_BOSS.toString();
          break;
        case NodeStatus.GROUND_KEY:
          this.items.add(
            'smallKey-' + Dungeon.allDungeonNames.indexOf(this.currentDungeon.name),
            this.currentDungeon.name,
            true,
          );
          node.originalNode.status = NodeStatus.EMPTY.toString();
          break;
        case NodeStatus.EMPTY:
          break;
        case NodeStatus.SWITCH_FLIPPED:
        case NodeStatus.SWITCH:
          this.addPrizes(node, this.currentDungeon.name);
          var newSwitchStatus;
          newSwitchStatus = +node.status === NodeStatus.SWITCH ? NodeStatus.SWITCH_FLIPPED : NodeStatus.SWITCH;
          node.originalNode.status = newSwitchStatus.toString();
          break;
        case NodeStatus.WATER_SWITCH:
          this.addPrizes(node, this.currentDungeon.name);
          node.originalNode.status = NodeStatus.WATER_SWITCH_FLIPPED.toString();
          break;
        case NodeStatus.BLIND_RESCUE:
          this.addPrizes(node, this.currentDungeon.name);
          node.originalNode.status = NodeStatus.BLIND_RESCUED.toString();
          break;
        case NodeStatus.TT_BOMB_FLOOR:
          this.addPrizes(node, this.currentDungeon.name);
          node.originalNode.status = NodeStatus.TT_BOMB_FLOOR_DONE.toString();
          break;
        case NodeStatus.PORTAL:
          var portalParts = this.currentDungeonMap.id.split('-');
          if (
            portalParts[1] === 'trportal' &&
            !this.items.isTROpened &&
            !!this.items[this.config.trMedallion] &&
            (!!this.items.sword || this.config.weapons === 'swordless')
          ) {
            this.items.isTROpened = true;
          }
          portalParts[0] = 'dw';
          this.items.currentRegionInMap = node.originalNode.destinationSection;
          this.changeDungeon(portalParts.join('-'));
          break;
        case NodeStatus.MIRROR:
          var mirrorParts = this.currentDungeonMap.id.split('-');
          if (mirrorParts[0] === 'dw') {
            mirrorParts[0] = 'lw';
            this.items.currentRegionInMap = node.originalNode.destinationSection;
            setTimeout(() => {
              this.mirrorNode = new DungeonNode(
                node.originalNode.name,
                node.originalNode.x,
                node.originalNode.y,
                node.originalNode.status,
                node.originalNode.canOpen,
                node.originalNode.content,
                node.originalNode.errorMessage,
                node.originalNode.mirrorAccessibleSectionArray,
                node.originalNode.mirrorDestinationSection,
                node.originalNode.canGlitch,
                node.originalNode.accessibleSectionArray,
                node.originalNode.destinationSection,
              );
              this.mirrorNode.mapNode = {
                x: node.originalNode.mapNode.x,
                y: node.originalNode.mapNode.y,
                tooltip: node.originalNode.mapNode.tooltip,
                id: node.originalNode.mapNode.id,
                status: node.originalNode.mapNode.status,
                prize: node.originalNode.mapNode.prize,
                originalNode: this.mirrorNode,
                isFaded: node.originalNode.mapNode.isFaded,
              };
            }, 1);
          } else {
            mirrorParts[0] = 'dw';
            this.items.currentRegionInMap = node.originalNode.destinationSection;
            setTimeout(() => {
              this.mirrorNode = new DungeonNode(
                node.originalNode.name,
                node.originalNode.x,
                node.originalNode.y,
                node.originalNode.status,
                node.originalNode.canOpen,
                node.originalNode.content,
                node.originalNode.errorMessage,
                [node.originalNode.mirrorAccessibleSectionArray],
                node.originalNode.mirrorDestinationSection,
                node.originalNode.canGlitch,
                node.originalNode.accessibleSectionArray,
                node.originalNode.destinationSection,
              );
              this.mirrorNode.mapNode = {
                x: node.originalNode.mapNode.x,
                y: node.originalNode.mapNode.y,
                tooltip: node.originalNode.mapNode.tooltip,
                id: node.originalNode.mapNode.id,
                status: node.originalNode.mapNode.status,
                prize: node.originalNode.mapNode.prize,
                originalNode: this.mirrorNode,
                isFaded: node.originalNode.mapNode.isFaded,
              };
            }, 1);
          }
          this.mirrorNode = null;
          this.mirrorRegion = node.originalNode.destinationSection;
          this.mirrorMap = mirrorParts.join('-');
          this.changeDungeon(this.mirrorMap);
          break;
        case NodeStatus.FROG:
          this.items.hasBlacksmiths = true;
          node.originalNode.status = NodeStatus.EMPTY.toString();
          break;
        case NodeStatus.PURPLE_CHEST:
          this.items.hasPurpleChest = true;
          node.originalNode.status = NodeStatus.EMPTY.toString();
          break;
        case NodeStatus.BIG_BOMB:
          this.items.hasBigBomb = true;
          node.originalNode.status = NodeStatus.EMPTY.toString();
          break;
        case NodeStatus.BOOK_CHECKABLE_ITEM:
          if (this.items.book) {
            this.addPrizes(node, this.currentDungeon.name);
            node.originalNode.status = NodeStatus.EMPTY.toString();
          } else {
            this.cantItem.emit([node, this.currentDungeon.name, true]);
          }
          break;
        case NodeStatus.PEDESTAL:
          this.addPrizes(node, this.currentDungeon.name);
          node.originalNode.status = NodeStatus.EMPTY.toString();
          if (this.config.goal === 'pedestal') {
            this.onGameFinished.emit('');
          }
          break;
        case NodeStatus.DUCK:
          this.items.isFluteActivated = true;
          node.originalNode.status = NodeStatus.EMPTY.toString();
          break;
        case NodeStatus.HINT:
          this.hintCheck.emit([
            node.tooltip,
            this.currentDungeon.name,
            this.config.hints[+node.prize[0]],
          ]);
          break;
        case NodeStatus.SIGNPOST:
          if (this.currentDungeonMap.name === 'Ganons Tower Entrance') {
            this.hintCheck.emit(['sign', "Ganon's Tower Entry", this.getSignpostText('tower')]);
          } else {
            this.hintCheck.emit(['sign', 'Ganon Vulnerability', this.getSignpostText('ganon')]);
          }
      }
    } else if (
      node.status === NodeStatus.VIEWABLE_CLOSED_CHEST.toString() ||
      ((node.status === NodeStatus.BOOK_CHECKABLE_ITEM.toString() ||
        node.status === NodeStatus.PEDESTAL.toString()) &&
        this.items.book)
    ) {
      if (this.config.isFullMap && this.currentDungeonMap.isIndoors) {
        this.viewItem.emit([node, this.currentDungeonMap.name, this.currentRegion]);
      } else {
        this.viewItem.emit([node, this.currentDungeon.name, this.currentRegion]);
      }
    } else {
      this.cantItem.emit([node, this.currentDungeon.name, true]);
    }
  }

  leaveDungeon(isAgaTower = false) {
    if (this.currentDungeonMap) {
      this.currentDungeonMap.cleanPreload();
    }
    if (this.config.isFullMap) {
      if (isAgaTower || this.currentDungeon.name === 'Ganons Tower') {
        this.changeDungeon('dw-hyrule-castle');
      } else if (this.currentDungeon.name === 'Turtle Rock') {
        this.currentDungeon.startingMap.id = 'tr-entry';
        this.changeDungeon('dw-trportal');
      } else {
        this.changeDungeon(this.dungeonFinishMap);
        this.items.currentRegionInMap = this.dungeonFinishRegion;
      }
      this.dungeonFinishMap = '';
      this.dungeonFinishRegion = 0;
    } else {
      if (this.currentDungeon.name === 'Aga Tower' && isAgaTower) {
        this.changeMap(this.otherWorld);
      } else if (
        this.gameService.lwDuns.indexOf(this.currentDungeon.name) > -1 ||
        this.currentDungeonMap.id === 'tr-inverted-ledge'
      ) {
        this.changeMap('light-world');
      } else {
        this.changeMap('dark-world');
      }
      this.unfloodSwamp();
    }
    this.resetDungeons();
    if (this.currentDungeonMap) {
      this.currentDungeonMap.cleanPreload();
    }
    if (!this.config.isFullMap) {
      this.currentDungeon = null;
      this.currentDungeonMap = null;
      this.currentDungeonItems = null;
    }
  }

  unfloodSwamp() {
    this.gameService.dungeonsData[5].dungeonMaps.forEach((dungeonMap) => {
      dungeonMap.nodes.forEach((mapNode) => {
        if (mapNode.status == NodeStatus.WATER_SWITCH_FLIPPED) {
          mapNode.status = NodeStatus.WATER_SWITCH;
          this.items.remove('flood', 'Swamp Palace');
        }
      });
    });
  }

  resetDungeons() {
    this.items.crystalSwitch = false;
    this.gameService.dungeonsData[8].dungeonMaps.forEach((dungeonMap) => {
      if (dungeonMap.id === 'ip-push-block') {
        dungeonMap.nodes.forEach((mapNode) => {
          if (mapNode.content == 'ip-switch-room') {
            mapNode.status = NodeStatus.OPEN_DOOR_PUSH_BLOCK;
            this.items.ipBlockPushed = false;
          }
        });
      }
    });
  }

  resetCrystalSwitch() {
    var switchDungeons = ['Swamp Palace', 'Misery Mire', 'Ice Palace'];
    this.gameService.dungeonsData.forEach(function (dungeon) {
      if (switchDungeons.indexOf(dungeon.name) > -1) {
        dungeon.dungeonMaps.forEach(function (dungeonMap) {
          dungeonMap.nodes.forEach(function (mapNode) {
            if (mapNode.status == NodeStatus.SWITCH_FLIPPED) {
              mapNode.status = NodeStatus.SWITCH;
            }
          });
        });
      }
    });
  }

  changeTooltip(node: any) {
    if (node.prize[0] === 'warp') {
      this.tooltip = 'Dark World Portal';
    } else {
      this.tooltip = node.tooltip;
    }
    if (node.prize[0] === 'exit' && this.currentDungeonMap.id === 'tr-inverted-ledge') {
      this.tooltip = 'Jump down the Ledge';
    } else if (this.currentDungeon && node.prize[0] === 'exit') {
      this.tooltip = 'Leave the Dungeon';
    } else if (
      !this.currentDungeon ||
      !node.originalNode.canOpen ||
      !node.originalNode.errorMessage ||
      node.originalNode.canOpen(this.items, this.config) ||
      (node.originalNode.canGlitch && node.originalNode.canGlitch(this.items, this.config))
    ) {
      if (
        !this.currentDungeon &&
        node.status.indexOf('getable') > -1 &&
        (node.status.indexOf('unreachable') > -1 || node.status.indexOf('unavailable') > -1)
      ) {
        this.tooltip += '. Unreachable from here';
      }
    } else {
      this.tooltip += '. ' + node.originalNode.errorMessage;
    }
  }

  clearTooltip() {
    if (this.currentMap === 'light-world') {
      this.tooltip = 'Light World';
    } else if (this.currentMap === 'dark-world') {
      this.tooltip = 'Dark World';
    } else {
      this.tooltip = this.currentDungeonMap.name;
    }
  }

  defeatDungeon(isAgaTower: boolean) {
    if (this.currentDungeon.name === 'Ganons Tower') {
      this.hintCheck.emit(['Ganon', this.currentMap, this.config.silversHint]);
    } else if (this.currentDungeon.name === 'Turtle Rock') {
      this.items.isTROpened = true;
    }
    this.finishedDungeon.emit([this.currentDungeon.dungeonPrize, this.currentDungeon.name]);
    this.currentDungeonItems.isBossDefeated = true;
    this.currentDungeonItems.checkThisMap();
    this.checkMapsLeft();
    this.leaveDungeon(isAgaTower);
  }

  onSaveAndQuit() {
    if (this.config.isFullMap) {
      if (this.mirrorNode) {
        this.mirrorNode = null;
        this.mirrorMap = '';
      }
      var isDarkWorldDungeon = this.gameService.dwDuns.indexOf(this.currentDungeon.name) > -1;
      if (
        this.items.agahnim &&
        this.items.mirror &&
        (this.currentMap.split('-')[0] === 'dw' || isDarkWorldDungeon)
      ) {
        this.changeDungeon('dw-hyrule-castle');
      } else {
        this.changeDungeon('lw-sq');
      }
    } else {
      this.currentRegion = 'ow';
      this.hasUsedMirror = false;
      if (this.currentDungeon) {
        var isLightWorldDungeon = this.gameService.lwDuns.indexOf(this.currentDungeon.name) > -1;
        this.leaveDungeon();
        if (this.config.mode !== 'inverted') {
          if (!isLightWorldDungeon && this.items.agahnim && this.items.mirror) {
            this.changeMap('dark-world');
          } else {
            this.changeMap('light-world');
          }
        } else if (isLightWorldDungeon && this.items.agahnim && this.items.mirror) {
          this.changeMap('light-world');
        } else {
          this.changeMap('dark-world');
        }
      } else if (this.config.mode !== 'inverted') {
        if (this.currentMap === 'dark-world' && this.items.agahnim && this.items.mirror) {
          this.changeMap('dark-world');
        } else {
          this.changeMap('light-world');
        }
      } else if (this.currentMap === 'light-world' && this.items.agahnim && this.items.mirror) {
        this.changeMap('light-world');
      } else {
        this.changeMap('dark-world');
      }
    }
  }

  onWarpClicked() {
    this.resetCrystalSwitch();
    this.items.crystalSwitch = false;
    if (this.config.isFullMap) {
      if (this.items.mirror) {
        this.changeDungeon(this.dungeonMirrorMap);
      } else if (this.items.gameState === 2) {
        this.changeDungeon('hc-zelda');
      } else if (this.items.gameState === 3) {
        this.changeDungeon('hc-darkchest');
      } else {
        this.changeDungeon(this.dungeonMirrorMap);
      }
      return;
    }
    if (
      (this.config.mode !== 'inverted' && this.canWarpToDW()) ||
      (this.config.mode === 'inverted' && this.canWarpToLW())
    ) {
      this.changeMap(this.otherWorld);
    } else if (this.currentMap === this.otherWorld) {
      if (this.items.mirror) {
        this.hasUsedMirror = true;
      }
      this.changeMap(this.originalWorld);
    } else if (this.currentDungeon) {
      if (this.currentDungeonMap) {
        this.currentDungeonMap.cleanPreload();
      }
      this.currentDungeonMap = this.currentDungeon.startingMap;
      this.currentDungeonMap.preloadImages(this.currentDungeon.name);
      this.changeMap(this.currentDungeonMap.id);
      this.resetCrystalSwitch();
    }
  }

  canWarp() {
    if (this.config.isFullMap) {
      return (
        this.currentDungeonMap.id !== 'hc-sanctuary' &&
        (this.items.mirror
          ? (this.warpButtonText = 'Mirror')
          : (this.warpButtonText = 'Death Warp'),
        this.nonDuns.indexOf(this.currentDungeonMap.id.split('-')[0]) === -1)
      );
    }
    var hasMirror = this.items.mirror;
    if (
      this.config.mode !== 'inverted' &&
      this.currentMap === 'light-world' &&
      hasMirror &&
      this.hasUsedMirror
    ) {
      this.warpButtonText = 'Go Back to DW';
    }
    if (
      this.config.mode === 'inverted' &&
      this.currentMap === 'dark-world' &&
      hasMirror &&
      this.hasUsedMirror
    ) {
      this.warpButtonText = 'Go Back to LW';
    }
    if (this.currentDungeon !== null) {
      this.warpButtonText = hasMirror ? 'Mirror' : 'Death Warp';
    }
    if (this.config.mode !== 'inverted' && this.currentMap === 'dark-world') {
      this.warpButtonText = hasMirror ? 'Mirror to LW' : 'S&Q to LW';
    }
    if (this.config.mode === 'inverted' && this.currentMap === 'light-world') {
      this.warpButtonText = hasMirror ? 'Mirror to DW' : 'S&Q to DW';
    }
    return (
      this.currentDungeon !== null ||
      (this.currentMap === 'dark-world' &&
        hasMirror &&
        (this.hasUsedMirror || this.config.mode !== 'inverted')) ||
      (this.currentMap === 'light-world' &&
        hasMirror &&
        (this.hasUsedMirror || this.config.mode === 'inverted'))
    );
  }

  canWarpToDW() {
    return (
      this.currentMap === 'light-world' &&
      (this.items.agahnim ||
        (this.items.hammer && this.items.glove && this.items.moonPearl) ||
        (this.items.glove === 2 && this.items.moonPearl) ||
        (this.items.flute && this.items.glove === 2) ||
        this.items.canDarkEastDeathMountain(this.config.canGlitch))
    );
  }

  canWarpToLW() {
    return (
      this.currentMap === 'dark-world' &&
      (this.items.agahnim ||
        (this.items.hammer && this.items.glove && this.items.moonPearl) ||
        (this.items.glove === 2 && this.items.moonPearl) ||
        this.items.flute ||
        (this.items.glove && (this.config.canGlitch || this.items.lamp)))
    );
  }

  canFlute() {
    return (
      !!this.config.isFullMap &&
      !!this.items.flute &&
      ((this.config.mode === 'inverted' && this.currentDungeonMap.id.split('-')[0] === 'dw') ||
        (this.config.mode !== 'inverted' && this.currentDungeonMap.id.split('-')[0] === 'lw')) &&
      !this.currentDungeonMap.isIndoors &&
      !!this.items.isFluteActivated
    );
  }

  onFluteClicked() {
    this.changeDungeon('lw-flute-map');
  }

  getAvailableDungeonMapIndexes() {
    var startIndex;
    var endIndex;
    var availableIndexes = [];
    if (this.currentMap === 'light-world' || this.currentMap.substr(0, 2) === 'lw') {
      startIndex = 1;
      endIndex = 3;
    } else {
      startIndex = 5;
      endIndex = 11;
    }
    for (var i = startIndex; i <= endIndex; i++) {
      if (
        this.items.dungeonItemsArray[i].mapPrizeStatus === DungeonPrize.UNKNOWN &&
        this.items.dungeonItemsArray[i].hasMap
      ) {
        availableIndexes.push(i);
      }
    }
    return availableIndexes;
  }

  onCheckMap(checkType: string) {
    if (checkType === 'gp') {
      this.gameService.dungeonsData.forEach((dungeon, index) => {
        if (this.itemNameService.getItemById(dungeon.dungeonPrize).shortName === 'pendantCourage') {
          this.items.dungeonItemsArray[index + 1].mapPrizeStatus = DungeonPrize.GREEN_PENDANT;
        }
      });
    } else if (checkType === 'rc') {
      this.gameService.dungeonsData.forEach((dungeon, index) => {
        var prizeName = this.itemNameService.getItemById(dungeon.dungeonPrize).shortName;
        if (prizeName === 'crystal5' || prizeName === 'crystal6') {
          this.items.dungeonItemsArray[index + 1].mapPrizeStatus = DungeonPrize.RED_CRYSTAL;
        }
      });
    } else if (this.config.dungeonItems === 'standard') {
      if (checkType === 'lw') {
        this.items.lwMapOpen = true;
        this.gameService.dungeonsData.forEach((dungeon, index) => {
          if (index < 3) {
            this.items.dungeonItemsArray[index + 1].checkThisMap();
          }
        });
      } else if (this.canViewMap('dark-world')) {
        this.items.dwMapOpen = true;
        this.gameService.dungeonsData.forEach((dungeon, index) => {
          if (index >= 4 && index <= 10) {
            this.items.dungeonItemsArray[index + 1].checkThisMap();
          }
        });
      }
    } else {
      var availableIndexes = this.getAvailableDungeonMapIndexes();
      availableIndexes.forEach((dungeonIndex) => {
        this.items.dungeonItemsArray[dungeonIndex].checkThisMap();
      });
    }
    this.checkMapsLeft();
  }

  checkMapsLeft() {
    var crystalCount = 0;
    var pendantCount = 0;
    var someCrystalCount = 0;
    var somePendantCount = 0;
    var greenPendantFound = 0;
    var redCrystalCount = 0;
    var unknownCount = 0;
    for (var i = 1; i <= 11; i++) {
      if (i !== 4) {
        switch (this.items.dungeonItemsArray[i].mapPrizeStatus) {
          case DungeonPrize.UNKNOWN:
            unknownCount++;
            break;
          case DungeonPrize.RED_CRYSTAL:
            redCrystalCount++;
          case DungeonPrize.CRYSTAL:
            crystalCount++;
          case DungeonPrize.SOME_CRYSTAL:
            someCrystalCount++;
            break;
          case DungeonPrize.GREEN_PENDANT:
            greenPendantFound = 1;
          case DungeonPrize.PENDANT:
            pendantCount++;
          case DungeonPrize.SOME_PENDANT:
            somePendantCount++;
        }
      }
    }
    var allPendantsFound = somePendantCount === 3;
    var allCrystalsFound = someCrystalCount === 7;
    var canDeduceCrystals = redCrystalCount === 2 || crystalCount >= 6 || (crystalCount === 5 && redCrystalCount === 0);
    var canDeducePendants = greenPendantFound === 1 || pendantCount >= 2;
    for (var i = 1; i <= 11; i++) {
      if (i !== 4) {
        if (this.items.dungeonItemsArray[i].mapPrizeStatus === DungeonPrize.UNKNOWN) {
          if (allPendantsFound) {
            this.items.dungeonItemsArray[i].mapPrizeStatus = DungeonPrize.SOME_CRYSTAL;
          } else if (allCrystalsFound) {
            this.items.dungeonItemsArray[i].mapPrizeStatus = DungeonPrize.SOME_PENDANT;
          }
        }
        if (canDeduceCrystals && this.items.dungeonItemsArray[i].mapPrizeStatus === DungeonPrize.SOME_CRYSTAL) {
          this.items.dungeonItemsArray[i].mapPrizeStatus = DungeonPrize.CRYSTAL;
        } else if (
          canDeducePendants &&
          this.items.dungeonItemsArray[i].mapPrizeStatus === DungeonPrize.SOME_PENDANT
        ) {
          this.items.dungeonItemsArray[i].mapPrizeStatus = DungeonPrize.PENDANT;
        }
      }
    }
  }

  canViewMap(worldOrType: string) {
    if (this.config.isFullMap) {
      if (worldOrType === 'light-world') {
        return (
          this.currentDungeonMap.id.split('-')[0] === 'lw' &&
          !this.currentDungeonMap.isIndoors &&
          (this.getAvailableDungeonMapIndexes().length > 0 ||
            this.config.dungeonItems === 'standard')
        );
      }
      if (worldOrType === 'dark-world') {
        return (
          this.currentDungeonMap.id.split('-')[0] === 'dw' &&
          !this.currentDungeonMap.isIndoors &&
          (this.getAvailableDungeonMapIndexes().length > 0 ||
            this.config.dungeonItems === 'standard')
        );
      }
      if (worldOrType === 'green-pendant') {
        var hasGreenPendant = false;
        this.items.dungeonItemsArray.forEach(function (dungeonItem) {
          if (dungeonItem.mapPrizeStatus === DungeonPrize.GREEN_PENDANT) {
            hasGreenPendant = true;
          }
        });
        return this.currentDungeonMap.id === 'lw-saha' && !hasGreenPendant;
      }
      var redCrystalCount = 0;
      this.items.dungeonItemsArray.forEach(function (dungeonItem) {
        if (dungeonItem.mapPrizeStatus === DungeonPrize.RED_CRYSTAL) {
          redCrystalCount++;
        }
      });
      return this.currentDungeonMap.id === 'dw-bomb-shop' && redCrystalCount < 2;
    }
    if (this.config.dungeonItems === 'standard') {
      return this.currentMap === worldOrType;
    }
    if (this.currentMap === worldOrType) {
      return this.getAvailableDungeonMapIndexes().length > 0;
    }
    if (worldOrType === 'green-pendant') {
      var hasGreenPendant = false;
      this.items.dungeonItemsArray.forEach(function (dungeonItem) {
        if (dungeonItem.mapPrizeStatus === DungeonPrize.GREEN_PENDANT) {
          hasGreenPendant = true;
        }
      });
      return (
        !hasGreenPendant &&
        this.currentMap === 'light-world' &&
        (this.config.mode !== 'inverted' || this.items.canInvertedLW())
      );
    }
    if (worldOrType === 'red-crystals') {
      var redCrystalCount = 0;
      this.items.dungeonItemsArray.forEach(function (dungeonItem) {
        if (dungeonItem.mapPrizeStatus === DungeonPrize.RED_CRYSTAL) {
          redCrystalCount++;
        }
      });
      return (
        redCrystalCount < 2 &&
        this.items.canSouthDarkWorld(this.config.canGlitch) &&
        this.currentRegion === 'ow' &&
        ((this.config.mode !== 'inverted' && this.currentMap === 'dark-world') ||
          (this.config.mode === 'inverted' &&
            this.currentMap === 'light-world' &&
            this.items.canInvertedLW()))
      );
    }
    return false;
  }

  checkMedallion(medallionType: string) {
    if (medallionType === 'tr' && (this.canViewTRMedallion() || this.config.isFullMap)) {
      this.items.trMedallionChecked = true;
    }
    if (medallionType === 'mm' && (this.canViewMMMedallion() || this.config.isFullMap)) {
      this.items.mmMedallionChecked = true;
    }
    this.gameService.updateData(this.items, this.currentMap, this.currentRegion);
  }

  canViewTRMedallion() {
    return (
      !this.config.isFullMap &&
      (this.config.mode === 'inverted'
        ? this.items.canInvertedEastDarkDeathMountain(this.config.canGlitch) &&
          this.currentMap === 'dark-world'
        : this.items.canDarkEastDeathMountain(this.config.canGlitch) &&
          this.currentMap === 'dark-world' &&
          (this.currentRegion === 'dm' || this.currentRegion === 'all'))
    );
  }

  canViewMMMedallion() {
    return (
      !this.config.isFullMap &&
      (this.config.mode === 'inverted'
        ? this.items.canMire(this.config) && this.currentMap === 'dark-world'
        : this.items.canMire(this.config) &&
          this.currentMap === 'dark-world' &&
          (this.currentRegion === 'mire' || this.currentRegion === 'all'))
    );
  }

  changeMap(mapId: string) {
    if (mapId === 'dw-desert') {
      this.checkMedallion('mm');
    } else if (mapId === 'dw-trportal') {
      this.checkMedallion('tr');
    }
    this.currentMap = mapId;
    this.gameService.updateData(this.items, this.currentMap, this.currentRegion);
    this.clearTooltip();
  }

  getMapBg() {
    if (this.currentMap === 'light-world') {
      return 'url(assets/light-world.png)';
    } else if (this.currentMap === 'dark-world') {
      return 'url(assets/dark-world.png)';
    } else if (this.currentMap === 'ip-switch-room' && this.items.ipBlockPushed) {
      return 'url("assets/maps/Ice Palace/ip-switch-room-block.png")';
    } else if (Dungeon.pegMaps.indexOf(this.currentMap) === -1) {
      return 'url("assets/maps/' + this.currentDungeon.name + '/' + this.currentMap + '.png")';
    } else if (Dungeon.floodMaps.indexOf(this.currentMap) > -1 && this.items.spFlooded) {
      return (
        'url("assets/maps/' +
        this.currentDungeon.name +
        '/' +
        this.currentMap +
        '-flooded' +
        (this.items.crystalSwitch ? '-flipped' : '') +
        '.png")'
      );
    } else {
      return (
        'url("assets/maps/' +
        this.currentDungeon.name +
        '/' +
        this.currentMap +
        (this.items.crystalSwitch ? '-flipped' : '') +
        '.png")'
      );
    }
  }

  onMapClicked(event: MouseEvent) {
    if (this.isDebug) {
      console.log((event.offsetX / 555) * 100, (event.offsetY / 555) * 100);
    }
  }

  getSignpostText(signType: string) {
    if (signType === 'tower') {
      return 'You need ' + this.config.towerCrystals + ' crystals to enter';
    }
    switch (this.config.goal) {
      case 'ganon':
        return 'You need ' + this.config.ganonCrystals + ' crystals and have defeated Agahnim 2';
      case 'fast_ganon':
        return 'You only need ' + this.config.ganonCrystals + ' crystals to beat Ganon';
      case 'pedestal':
        return 'You need to get to the pedestal';
      case 'dungeons':
        return "You need to defeat all of Ganon's bosses";
    }
  }

  openModal() {
    this.reportDescription = '';
    this.reportMessage = '';
    this.reportError = '';
    this.isSubmittingReport = false;
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    this.isModalOpen = true;
    this._modalStateService.setReportModalOpen(true);
    setTimeout(() => this.reportDescriptionInput?.nativeElement.focus());
  }

  copyClipboard() {
    var nav: any = window.navigator;
    nav.clipboard.writeText(this.config.data).then(
      () => {
        this.clipboardMessage = 'Copied!';
      },
      () => {
        this.clipboardMessage = 'Failed to copy';
      },
    );
  }

  closeModal() {
    this.isModalOpen = false;
    this.clipboardMessage = '';
    this.reportDescription = '';
    this.reportMessage = '';
    this.reportError = '';
    this.isSubmittingReport = false;
    this._modalStateService.setReportModalOpen(false);
    restoreFocusAfterClose(this.modalTrigger);
    this.modalTrigger = undefined;
  }

  onReportModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeModal();
      return;
    }
    trapFocus(event, this.reportModal?.nativeElement);
  }

  submitReport() {
    if (!this.reportDescription || this.reportDescription.trim().length === 0) {
      this.reportError = 'Please enter a description of the issue.';
      return;
    }
    if (this.reportDescription.length > 2000) {
      this.reportError = 'Description is too long. Please keep it under 2000 characters.';
      return;
    }

    this.isSubmittingReport = true;
    this.reportMessage = '';
    this.reportError = '';

    var seedHash = localStorage.getItem('seedHash');
    var seedData = this._seedService.buildStringUrl()

    this._seedReportService.submitReport(seedHash, this.reportDescription, seedData).then(
      (response) => {
        this.isSubmittingReport = false;
        this.reportMessage = response.message || 'Report submitted successfully!';
        alert(this.reportMessage);

        this.reportDescription = '';
      },
      (error) => {
        this.isSubmittingReport = false;
        this.reportError = error.message || 'Failed to submit report. Please try again later.';
        alert(this.reportError);
      }
    );
  }

  preloadMapsAndIcons() {
    var iconUrls = [
      'assets/node-icons/big_door.png',
      'assets/node-icons/closed_big_chest.png',
      'assets/node-icons/closed_chest.png',
      'assets/node-icons/key_door.png',
      'assets/node-icons/open_chest.png',
      'assets/node-icons/open_big_chest.png',
      'assets/node-icons/small_key.png',
      'assets/node-icons/warp.png',
      'assets/item-icons/compass.png',
      'assets/item-icons/compassEmpty.png',
      'assets/item-icons/bigKey.png',
      'assets/item-icons/bigKeyEmpty.png',
      'assets/item-icons/map.png',
      'assets/item-icons/mapEmpty.png',
      'assets/node-icons/open_door.png',
    ];
    if (!this.config.isFullMap) {
      iconUrls.push('assets/light-world.png');
      iconUrls.push('assets/dark-world.png');
    }
    this.preloadedImages = [];
    iconUrls.forEach((url, index) => {
      this.preloadedImages[index] = new Image();
      this.preloadedImages[index].src = url;
    });
  }

  getAll() {
    [
      'sword',
      'sword',
      'glove',
      'glove',
      'bow',
      'moonPearl',
      'hookshot',
      'fireRod',
      'iceRod',
      'bombos',
      'ether',
      'quake',
      'lamp',
      'hammer',
      'flute',
      'somaria',
      'book',
      'cape',
      'mirror',
      'mushroom',
      'boots',
      'flippers',
      'crystal1',
      'crystal2',
      'crystal3',
      'crystal4',
      'crystal5',
      'crystal6',
      'crystal7',
      'pendantCourage',
      'pendantPower',
      'pendantWisdom',
      'agahnim2',
      'smallKey-2',
      'smallKey-3',
      'smallKey-4',
      'smallKey-4',
      'smallKey-5',
      'smallKey-5',
      'smallKey-5',
      'smallKey-5',
      'smallKey-5',
      'smallKey-5',
      'smallKey-6',
      'smallKey-7',
      'smallKey-7',
      'smallKey-7',
      'smallKey-8',
      'smallKey-9',
      'smallKey-9',
      'smallKey-10',
      'smallKey-10',
      'smallKey-10',
      'smallKey-11',
      'smallKey-11',
      'smallKey-11',
      'smallKey-11',
      'smallKey-12',
      'smallKey-12',
      'smallKey-12',
      'smallKey-12',
      'bigKey-1',
      'bigKey-2',
      'bigKey-3',
      'bigKey-5',
      'bigKey-6',
      'bigKey-7',
      'bigKey-8',
      'bigKey-9',
      'bigKey-10',
      'bigKey-11',
      'bigKey-12',
    ].forEach((itemName) => {
      this.items.add(itemName, 'light-world');
    });
    this.items.isFluteActivated = true;
    this.items.gameState = 4;
    this.gameService.updateData(this.items, this.currentMap, this.currentRegion);
  }

  getBootsDw() {
    this.items.add('glove', 'light-world');
    this.items.add('glove', 'light-world');
    this.items.add('flute', 'light-world');
    this.items.isFluteActivated = true;
    this.items.add('book', 'light-world');
    this.items.add('hookshot', 'light-world');
    this.items.add('mirror', 'light-world');
    this.items.add('moonPearl', 'light-world');
  }
}
