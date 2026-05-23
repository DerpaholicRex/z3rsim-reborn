import { ItemNamesService } from '../../services/item-names.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Items } from '../../models/items.model';

@Component({
    selector: 'app-item-line',
    templateUrl: './item-line.component.html',
    styleUrls: ['./item-line.component.css'],
    standalone: false
})
export class ItemLineComponent implements OnInit {
  bookLocations: string[];
  shortName: string;
  longName: string;
  textLine: string;
  actionType: string;
  subText: string;

  @Input() itemLogEntry: { item: string; shortName: string; longName: string; location: string; region: string; type: string };
  @Input() items: Items;

  constructor(private _itemNamesService: ItemNamesService) {
    this.bookLocations = ['Master Sword Pedestal', 'Ether Tablet', 'Bombos Tablet'];
  }

  ngOnInit() {
    if (this.itemLogEntry) {
      this.shortName = this.itemLogEntry.shortName;
      this.longName = this.itemLogEntry.longName;
      ItemNamesService.dungeonItemNames.forEach((dungeonItemName) => {
        if (this.shortName.indexOf(dungeonItemName) > -1) {
          if (this.itemLogEntry.type === 'view') {
            if (
              this.shortName.indexOf('bigKey') > -1 &&
              this.bookLocations.indexOf(this.itemLogEntry.location) === -1
            ) {
              this.longName = 'a Big Key';
            } else if (
              this.shortName.indexOf('smallKey') > -1 &&
              this.bookLocations.indexOf(this.itemLogEntry.location) === -1
            ) {
              this.longName = 'a Small Key';
            } else if (this.shortName.indexOf('map') > -1) {
              this.longName = 'a Map';
            } else if (this.shortName.indexOf('compass') > -1) {
              this.longName = 'a Compass';
            } else {
              this.setSubText();
            }
          } else {
            this.setSubText();
          }
          this.shortName = dungeonItemName;
        }
      });
      if (this.itemLogEntry.type === 'cant' || this.itemLogEntry.type === 'hint') {
        this.textLine = this.itemLogEntry.longName;
        return;
      }
      switch (this.itemLogEntry.type) {
        case 'get':
          this.actionType = 'Got';
          break;
        case 'view':
          this.actionType = 'Saw';
      }
      if (this.itemLogEntry.region === 'light-world') {
        this.itemLogEntry.region = 'Light World';
      } else if (this.itemLogEntry.region === 'dark-world') {
        this.itemLogEntry.region = 'Dark World';
      }
    }
    if (this.shortName.indexOf('agahnim') > -1 || this.shortName.indexOf('ganon') > -1) {
      this.textLine = 'Defeated ' + this.longName;
    } else if (this.shortName === 'switch') {
      this.textLine = 'Flipped Switch';
    } else if (this.shortName === 'flood') {
      this.textLine = 'Flooded Room';
    } else if (this.shortName === 'tt-bomb') {
      this.textLine = 'Destroyed the floor';
    } else if (this.shortName === 'blind') {
      this.textLine = 'Rescued Blind';
    } else if (this.shortName === 'ip-switch-room') {
      this.textLine = 'Pushed Block to the Switch';
    } else if (this.shortName === 'sign') {
      this.textLine = this.longName;
    } else {
      this.textLine = this.actionType + ' ' + this.longName + ' in ' + this.itemLogEntry.location;
    }
  }

  setSubText() {
    var dungeonIndex = this.shortName.split('-')[1];
    var dungeonAbbrevs = ['HC', 'EP', 'DP', 'ToH', 'AT', 'PoD', 'SP', 'SW', 'TT', 'IP', 'MM', 'TR', 'GT'];
    this.subText = dungeonAbbrevs[dungeonIndex];
  }
}
