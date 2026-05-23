import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ItemNamesService } from '../../services/item-names.service';
import { NodeStatus } from '../../models/node-status.enum';
import { Items } from '../../models/items.model';
import { Config } from '../../models/config.model';
import { DungeonPrize } from '../../models/dungeon-prize.enum';

@Component({
    selector: 'app-node',
    templateUrl: './node.component.html',
    styleUrls: ['./node.component.css'],
    standalone: false
})
export class NodeComponent implements OnInit {
  nodeX: string;
  nodeY: string;
  isLookable: boolean;
  chestCountNum: string;

  @Input() nodeType: string;
  @Input() nodeInfo: { [key: string]: any };
  @Input() dungeonItems: DungeonPrize;
  @Input() items: Items;
  @Input() config: Config;

  @Output() clickedNode = new EventEmitter<any>();
  @Output() nodeMouseEnter = new EventEmitter<any>();
  @Output() nodeMouseLeave = new EventEmitter<any>();

  constructor(private itemNamesService: ItemNamesService) {}

  ngOnInit() {
    this.nodeX = this.nodeInfo.x + '%';
    this.nodeY = this.nodeInfo.y + '%';
    this.isLookable = false;
    if (this.nodeType && this.nodeType === 'overworld' && this.nodeInfo.prize.length > 1) {
      this.chestCountNum = 'x' + this.nodeInfo.prize.length;
    }
  }

  getNodeType() {
    if (this.nodeType === 'overworld') {
      return 'overworld-type';
    } else if (this.nodeType === 'dungeon') {
      return 'dungeon-type';
    } else if (this.isIconShown()) {
      return 'in-dungeon-type icon-shown';
    } else {
      return 'in-dungeon-type';
    }
  }

  getDungeonBg() {
    var dungeonNames = [
      'Eastern Palace',
      'Desert Palace',
      'Tower of Hera',
      'Palace of Darkness',
      'Swamp Palace',
      'Skull Woods',
      'Thieves Town',
      'Ice Palace',
      'Misery Mire',
      'Turtle Rock',
      'Aga Tower',
      'Ganons Tower',
    ];
    if (this.nodeType === 'dungeon') {
      if (
        this.config.isEnemizer &&
        this.nodeInfo.tooltip !== 'Aga Tower' &&
        this.nodeInfo.tooltip !== 'Ganons Tower'
      ) {
        if (this.config.checkedBosses[dungeonNames.indexOf(this.nodeInfo.tooltip)]) {
          return (
            'url("./assets/dungeon-tracker-icons/boss' +
            this.config.bosses[dungeonNames.indexOf(this.nodeInfo.tooltip)] +
            '2.png")'
          );
        } else {
          return 'url("./assets/dungeon-tracker-icons/boss.png")';
        }
      } else {
        return 'url("./assets/dungeon-tracker-icons/boss' + dungeonNames.indexOf(this.nodeInfo.tooltip) + '2.png")';
      }
    }
    if (this.isIconShown()) {
      var itemId = this.nodeInfo.prize[0];
      return (
        'url("./assets/item-icons/' +
        this.itemNamesService.convertItemName(itemId, 'view', this.items)[0].split('-')[0] +
        '.png")'
      );
    }
    if (+this.nodeInfo.status == NodeStatus.BOSS) {
      if (this.dungeonItems.dungeonName === 'Aga Tower') {
        return 'url("./assets/dungeon-tracker-icons/boss102.png")';
      }
      if (this.dungeonItems.dungeonName !== 'Ganons Tower') {
        if (this.config.isEnemizer) {
          return (
            'url("./assets/dungeon-tracker-icons/boss' +
            this.config.bosses[this.dungeonItems.dungeonId] +
            '2.png")'
          );
        } else {
          return (
            'url("./assets/dungeon-tracker-icons/boss' + dungeonNames.indexOf(this.dungeonItems.dungeonName) + '2.png")'
          );
        }
      }
      if (this.config.isEnemizer) {
        switch (this.nodeInfo.tooltip) {
          case 'Ice Armos':
            return 'url("./assets/dungeon-tracker-icons/boss' + this.config.bosses[10] + '2.png")';
          case 'Lanmolas 2':
            return 'url("./assets/dungeon-tracker-icons/boss' + this.config.bosses[11] + '2.png")';
          case 'Moldorm 2':
            return 'url("./assets/dungeon-tracker-icons/boss' + this.config.bosses[12] + '2.png")';
          case 'Agahnim 2':
            return 'url("./assets/dungeon-tracker-icons/boss102.png")';
        }
      } else {
        switch (this.nodeInfo.tooltip) {
          case 'Ice Armos':
            return 'url("./assets/dungeon-tracker-icons/boss02.png")';
          case 'Lanmolas 2':
            return 'url("./assets/dungeon-tracker-icons/boss12.png")';
          case 'Moldorm 2':
            return 'url("./assets/dungeon-tracker-icons/boss22.png")';
          case 'Agahnim 2':
            return 'url("./assets/dungeon-tracker-icons/boss102.png")';
        }
      }
    }
  }

  isIconShown() {
    return (
      !this.nodeInfo.originalNode.isOpened &&
      this.nodeInfo.prize[0].charAt(0) !== '=' &&
      !this.nodeInfo.prize[0].includes('requirement') &&
      (this.nodeInfo.isFaded ||
        (this.nodeInfo.originalNode.canView &&
          this.nodeInfo.tooltip.indexOf('Tablet') === -1 &&
          this.nodeInfo.status.indexOf('getable') > -1 &&
          this.nodeInfo.status.indexOf('now') === -1) ||
        +this.nodeInfo.status === NodeStatus.VIEWABLE_CLOSED_CHEST ||
        (this.nodeInfo.tooltip === 'Ganon' && this.nodeInfo.status.indexOf('getable') > -1))
    );
  }

  getNodeBgClass() {
    this.isLookable = false;
    if (this.nodeType === 'inside-dungeon') {
      var isViewable =
        +this.nodeInfo.status === NodeStatus.VIEWABLE_CLOSED_CHEST ||
        ((+this.nodeInfo.status === NodeStatus.PEDESTAL ||
          +this.nodeInfo.status === NodeStatus.BOOK_CHECKABLE_ITEM) &&
          this.items.book);
      if (
        +this.nodeInfo.status !== NodeStatus.VIEWABLE_CLOSED_CHEST &&
        +this.nodeInfo.status !== NodeStatus.PEDESTAL
      ) {
        this.nodeInfo.status;
        NodeStatus.BOOK_CHECKABLE_ITEM;
      }
      if (
        (this.nodeInfo.originalNode.canOpen(this.items, this.config) ||
          +this.nodeInfo.status === NodeStatus.VIEWABLE_CLOSED_CHEST ||
          (this.items.book &&
            (!this.items.book ||
              +this.nodeInfo.status === NodeStatus.PEDESTAL ||
              +this.nodeInfo.status === NodeStatus.BOOK_CHECKABLE_ITEM)) ||
          (this.config.canGlitch &&
            this.nodeInfo.originalNode.canGlitch &&
            this.nodeInfo.originalNode.canGlitch(this.items, this.config))) &&
        (+this.nodeInfo.status !== NodeStatus.BOOK_CHECKABLE_ITEM || this.items.book)
      ) {
        if (
          !isViewable ||
          this.nodeInfo.originalNode.canOpen(this.items, this.config) ||
          (this.config.canGlitch &&
            this.nodeInfo.originalNode.canGlitch &&
            this.nodeInfo.originalNode.canGlitch(this.items, this.config))
        ) {
          if (+this.nodeInfo.status === NodeStatus.BK_LOCKED || +this.nodeInfo.status === NodeStatus.BIG_CHEST) {
            if (this.dungeonItems.hasBigKey) {
              if (
                !this.nodeInfo.originalNode.canOpen(this.items, this.config) &&
                this.config.canGlitch &&
                this.nodeInfo.originalNode.canGlitch &&
                this.nodeInfo.originalNode.canGlitch(this.items, this.config)
              ) {
                return 'glitched-state';
              } else {
                return 'dun-open-state';
              }
            } else {
              return 'dungeon-unavailable';
            }
          } else if (+this.nodeInfo.status === NodeStatus.SK_LOCKED) {
            if (this.dungeonItems.smallKeys > 0) {
              if (
                !this.nodeInfo.originalNode.canOpen(this.items, this.config) &&
                this.config.canGlitch &&
                this.nodeInfo.originalNode.canGlitch &&
                this.nodeInfo.originalNode.canGlitch(this.items, this.config)
              ) {
                return 'glitched-state';
              } else {
                return 'dun-open-state';
              }
            } else {
              return 'dungeon-unavailable';
            }
          } else if (
            +this.nodeInfo.status === NodeStatus.WATER_SWITCH_FLIPPED ||
            +this.nodeInfo.status === NodeStatus.BLIND_RESCUED ||
            +this.nodeInfo.status === NodeStatus.EMPTY ||
            +this.nodeInfo.status === NodeStatus.OPEN_CHEST ||
            +this.nodeInfo.status === NodeStatus.OPEN_BIG_CHEST ||
            +this.nodeInfo.status === NodeStatus.TT_BOMB_FLOOR_DONE
          ) {
            return 'opened-state';
          } else if (
            !this.nodeInfo.originalNode.canOpen(this.items, this.config) &&
            this.config.canGlitch &&
            this.nodeInfo.originalNode.canGlitch &&
            this.nodeInfo.originalNode.canGlitch(this.items, this.config)
          ) {
            return 'glitched-state';
          } else {
            return 'dun-open-state';
          }
        } else {
          return 'view-state';
        }
      } else {
        return 'dungeon-unavailable';
      }
    }
    if (this.nodeType !== 'overworld') {
      var bgClass = '';
      if (this.nodeInfo.status.indexOf('unavailable') > -1) {
        bgClass += 'unavailable';
      }
      if (this.nodeInfo.status.indexOf('getable') > -1) {
        bgClass += ' dungeon';
      } else {
        bgClass += ' unavailable';
      }
      if (this.dungeonItems.isBossDefeated && this.dungeonItems.itemsLeft === 0) {
        bgClass += ' cleared';
      } else if (this.dungeonItems.isBossDefeated) {
        bgClass += ' dun-defeated';
      }
      return bgClass;
    }
    var bgClass = '';
    if (this.nodeInfo.status.indexOf('unreachable') > -1) {
      bgClass += 'unavailable';
    }
    if (this.nodeInfo.originalNode.isOpened) {
      bgClass += ' opened';
    } else if (this.nodeInfo.status.indexOf('now-getable') > -1) {
      bgClass += ' open';
    } else if (this.nodeInfo.status.indexOf('g-') > -1) {
      bgClass += ' glitched-open';
    } else if (this.nodeInfo.status.indexOf('viewable') > -1) {
      bgClass += ' view';
    } else if (this.nodeInfo.prize[0] === 'warp') {
      bgClass += ' warp';
    } else if (this.nodeInfo.prize.includes('tr-ledge')) {
      bgClass += ' tr-ledge';
    } else if (this.nodeInfo.status.indexOf('unavailable') > -1) {
      bgClass += ' unavailable';
    } else {
      bgClass += ' open';
    }
    if (this.nodeInfo.prize[0].charAt(0) === '=') {
      bgClass += ' big-hint-tile';
    } else if (this.nodeInfo.prize[0].includes('requirement')) {
      bgClass += ' sign';
    }
    if (this.nodeInfo.status.indexOf('invisible') > -1 && !this.config.noLogic) {
      bgClass += ' invisible';
    }
    this.isLookable =
      this.nodeInfo.status.indexOf('now-getable') > -1 ||
      this.nodeInfo.status.indexOf('now-g-getable') > -1 ||
      this.nodeInfo.status.indexOf('viewable') > -1;
    return bgClass;
  }

  getNodeState() {
    if (this.nodeType !== 'inside-dungeon') {
      return '';
    }
    switch (+this.nodeInfo.status) {
      case NodeStatus.OPEN_DOOR:
        return 'open-door';
      case NodeStatus.SK_LOCKED:
        return 'sk-door';
      case NodeStatus.BK_LOCKED:
        return 'bk-door';
      case NodeStatus.BIG_CHEST:
        return 'big-chest';
      case NodeStatus.VIEWABLE_CLOSED_CHEST:
      case NodeStatus.VIEWABLE_GETABLE_CLOSED_CHEST:
      case NodeStatus.CLOSED_CHEST:
        return 'closed-chest';
      case NodeStatus.OPEN_CHEST:
        return 'open-chest';
      case NodeStatus.OPEN_BIG_CHEST:
        return 'open-big-chest';
      case NodeStatus.BOSS:
        return 'boss';
      case NodeStatus.DEFEATED_BOSS:
        return 'defeated-boss';
      case NodeStatus.GROUND_KEY:
        return 'spare-key';
      case NodeStatus.EMPTY:
        return 'empty';
      case NodeStatus.SWITCH:
        return 'switch-red';
      case NodeStatus.SWITCH_FLIPPED:
        return 'switch-blue';
      case NodeStatus.WATER_SWITCH:
        return 'water-switch-off';
      case NodeStatus.WATER_SWITCH_FLIPPED:
        return 'water-switch-on';
      case NodeStatus.BLIND_RESCUE:
        return 'blind';
      case NodeStatus.BLIND_RESCUED:
        return 'empty';
      case NodeStatus.TT_BOMB_FLOOR:
        return 'tt-floor';
      case NodeStatus.TT_BOMB_FLOOR_DONE:
        return 'tt-floor-open';
      case NodeStatus.OPEN_DOOR_PUSH_BLOCK:
        return 'push-block';
      case NodeStatus.PORTAL:
        if (this.nodeInfo.originalNode.canOpen(this.items, this.config) || this.config.noLogic) {
          return 'portal';
        } else {
          return 'invisible';
        }
      case NodeStatus.MIRROR:
        return 'mirror';
      case NodeStatus.FROG:
        return 'frog';
      case NodeStatus.PURPLE_CHEST:
        return 'purple-chest';
      case NodeStatus.BIG_BOMB:
        return 'big-bomb';
      case NodeStatus.BOOK_CHECKABLE_ITEM:
        return 'tablet';
      case NodeStatus.PEDESTAL:
        return 'pedestal';
      case NodeStatus.DUCK:
        return 'duck';
      case NodeStatus.HOLE:
        return 'hole';
      case NodeStatus.WATER_WARP:
        return 'water-warp';
      case NodeStatus.HINT:
        return 'hint-tile';
      case NodeStatus.SIGNPOST:
        return 'sign';
      case NodeStatus.SQ_OPTION:
        var sqClass = 'sq-item ' + this.nodeInfo.prize[0];
        if (
          this.nodeInfo.prize[0] === 'lw-flute1' &&
          !this.nodeInfo.originalNode.canOpen(this.items, this.config)
        ) {
          sqClass += ' invisible';
        }
        return sqClass;
      default:
        console.log('Node Status not found: ' + this.nodeInfo.status);
        return '';
    }
  }

  onNodeClick() {
    if (!this.config.noLogic && !!this.isLookable && !this.nodeInfo.isFaded) {
      if (
        this.nodeInfo.status.indexOf('viewable') > -1 ||
        (this.nodeInfo.originalNode.canOpen &&
          !this.nodeInfo.originalNode.canOpen(this.items, this.config) &&
          +this.nodeInfo.status === NodeStatus.VIEWABLE_CLOSED_CHEST)
      ) {
        this.nodeInfo.isFaded = true;
      }
    }
  }
}
