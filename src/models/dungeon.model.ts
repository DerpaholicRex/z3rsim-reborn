import { DungeonMap } from './dungeon-map.model';
import { Items } from './items.model';
import { Config } from './config.model';

export class Dungeon {
  static dungeonNames = [
    'light-world',
    'Eastern Palace',
    'Desert Palace',
    'Tower of Hera',
    'Aga Tower',
    'Palace of Darkness',
    'Swamp Palace',
    'Skull Woods',
    'Thieves Town',
    'Ice Palace',
    'Misery Mire',
    'Turtle Rock',
    'Ganons Tower',
  ];
  static dungeonDataNames = [
    'Eastern Palace',
    'Desert Palace',
    'Tower of Hera',
    'Aga Tower',
    'Palace of Darkness',
    'Swamp Palace',
    'Skull Woods',
    'Thieves Town',
    'Ice Palace',
    'Misery Mire',
    'Turtle Rock',
    'Ganons Tower',
    'Light World',
    'Dark World',
    'Hyrule Castle',
  ];
  static allDungeonNames = [
    'Hyrule Castle',
    'Eastern Palace',
    'Desert Palace',
    'Tower of Hera',
    'Aga Tower',
    'Palace of Darkness',
    'Swamp Palace',
    'Skull Woods',
    'Thieves Town',
    'Ice Palace',
    'Misery Mire',
    'Turtle Rock',
    'Ganons Tower',
    'Light World',
    'Dark World',
  ];
  static crystalDungeonNames = [
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
  ];
  static lwDungeons = ['Eastern Palace', 'Desert Palace', 'Tower of Hera'];
  // Maps in this list must have a matching `-flipped` background asset.
  static pegMaps = [
    'ip-bj',
    'ip-fairy-drop',
    'ip-final-switch',
    'ip-push-block',
    'ip-push-block-right',
    'mm-compass',
    'mm-entry',
    'mm-fish-spine',
    'mm-map',
    'sp-left',
    'sp-south-switch',
    'sp-switch',
  ];
  static floodMaps = ['sp-south-switch', 'sp-switch'];
  static nonDungeon = [
    'light-world',
    'dark-world',
    'Light World',
    'Dark World',
    'Death Mountain',
    'Hyrule Castle',
  ];
  static dungeonsWithDunItemsCount = [
    'Eastern Palace',
    'Desert Palace',
    'Tower of Hera',
    'Aga Tower',
    'Palace of Darkness',
    'Swamp Palace',
    'Skull Woods',
    'Thieves Town',
    'Ice Palace',
    'Misery Mire',
    'Turtle Rock',
    'Ganons Tower',
  ];

  name: string;
  dungeonPrize: string;
  canEnter: (items: Items, config: Config) => any;
  dungeonMaps: DungeonMap[];
  startingMap: DungeonMap;
  mapNode: { [key: string]: any };
  x: number;
  y: number;

  constructor(
    name: string,
    dungeonPrize: string,
    canEnter: (items: Items, config: Config) => any,
    x: number,
    y: number,
  ) {
    this.name = name;
    this.dungeonPrize = dungeonPrize;
    this.canEnter = canEnter;
    this.dungeonMaps = [];
    this.x = x;
    this.y = y;
  }
}
