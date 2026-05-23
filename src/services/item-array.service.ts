import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ItemArrayService {

  constructor() {}

  /**
   * Generates item array from spoiler log data
   * This replaces scripts/generateItemArray.js as a native Angular service
   */
  generateItemArray(spoilerLogData: any, itemNameToFullItemMap: any, spoilerToDetailedMap: any, detailedMap: any): string[] {
    var itemNameToFullItemMap = typeof itemNameToFullItemMap === 'string'
        ? JSON.parse(itemNameToFullItemMap)
        : itemNameToFullItemMap;

    var spoilerToDetailedMap = typeof spoilerToDetailedMap === 'string'
        ? JSON.parse(spoilerToDetailedMap)
        : spoilerToDetailedMap;

    var detailedMap = typeof detailedMap === 'string'
        ? JSON.parse(detailedMap)
        : detailedMap;

    var spoilerLog = typeof spoilerLogData === 'string'
        ? JSON.parse(spoilerLogData)
        : spoilerLogData;

    // Initialize array with "000" for all positions (0-225 based on detailed map values)
    var itemArray = new Array(226).fill("000");

    function stripSuffix(name) {
      return name.replace(/:1$/, '');
    }

    function processSection(sectionName: string, section: any) {
      for (var locationName in section) {
        if (!section.hasOwnProperty(locationName)) continue;
        var itemName = section[locationName];

        // Skip non-item entries (like boss fights, etc.)
        if (typeof itemName !== 'string' || itemName.indexOf(':') === -1) {
          continue;
        }

        // Strip :1 from location and item names
        var cleanLocationName = stripSuffix(locationName);
        var cleanItemName = stripSuffix(itemName);

        // Look up location in spoilerToDetailedMap
        var locationMapping = spoilerToDetailedMap[cleanLocationName];
        if (!locationMapping) {
          continue;
        }

        var locationIndex = locationMapping.detailedMapValue;

        // Look up item in itemNameToFullItemMap
        var itemMapping = itemNameToFullItemMap[cleanItemName];
        if (!itemMapping) {
          continue;
        }

        var itemId = itemMapping.id;

        // Place item ID at the correct location index (formatted as 3-digit number with leading zeros)
        if (locationIndex >= 0 && locationIndex < itemArray.length) {
          var itemStr = itemId != null ? itemId.toString() : '000';
          if (itemId === -1 || itemId == null) {
            itemStr = '000';
          }
          while (itemStr.length < 3) {
            itemStr = '0' + itemStr;
          }
          itemArray[locationIndex] = itemStr;
        }
      }
    }

    // Process each major section of the spoiler log
    for (var sectionName in spoilerLog) {
      if (!spoilerLog.hasOwnProperty(sectionName)) continue;

      if (sectionName === 'meta' || sectionName === 'Bosses' || sectionName === 'playthrough' || sectionName === 'Shops' || sectionName === 'Equipped') {
        continue;
      }

      var section = spoilerLog[sectionName];
      if (typeof section === 'object' && section !== null) {
        processSection(sectionName, section);
      }
    }

    return itemArray;
  }

  /**
   * Generates seed metadata prefix string from spoiler log
   * This replaces scripts/generateSeedMetadataPrefix.js as a native Angular service
   */
  generateSeedMetadataPrefix(spoilerLog: any): string {
    if (!spoilerLog || !spoilerLog.meta) {
      throw new Error('Invalid spoiler log: missing meta section');
    }

    var meta = spoilerLog.meta;
    var special = spoilerLog.Special;

    function stripSuffix(name) {
      return name.replace(/:1$/, '');
    }

    // Position mappings based on collectSeedMetadata function
    var positionMappings: any = {};
    positionMappings[20] = meta.item_placement === 'basic' ? '0' : meta.item_placement === 'advanced' ? '1' : '0';
    positionMappings[21] = meta.dungeon_items === 'standard' ? '0' : meta.dungeon_items === 'mc' ? '1' : meta.dungeon_items === 'mcs' ? '2' : meta.dungeon_items === 'full' ? '3' : '0';
    positionMappings[22] = meta.accessibility === 'items' ? '0' : meta.accessibility === 'locations' ? '1' : meta.accessibility === 'none' ? '2' : '0';
    positionMappings[23] = meta.goal === 'ganon' ? '0' : meta.goal === 'dungeons' ? '1' : meta.goal === 'pedestal' ? '2' : meta.goal === 'triforce' ? '3' : meta.goal === 'fast_ganon' ? '4' : '0';
    positionMappings[24] = meta.entry_crystals_tower || '0';
    positionMappings[25] = meta.entry_crystals_ganon || '0';
    positionMappings[26] = meta.mode === 'standard' ? '0' : meta.mode === 'open' ? '1' : meta.mode === 'inverted' ? '2' : '0';
    positionMappings[27] = (meta.enemizer || 'none') === 'none' ? '0' : meta.enemizer === 'simple' ? '1' : meta.enemizer === 'full' ? '2' : meta.enemizer === 'random' ? '3' : '0';
    positionMappings[28] = meta.weapons === 'randomized' ? '0' : meta.weapons === 'assured' ? '1' : meta.weapons === 'vanilla' ? '2' : meta.weapons === 'swordless' ? '3' : '0';

    // Position 29: mmMedallion
    var mmMedallion = 'bombos';
    if (special && special['Misery Mire Medallion:1']) {
      mmMedallion = stripSuffix(special['Misery Mire Medallion:1']).toLowerCase();
    }
    positionMappings[29] = mmMedallion === 'bombos' ? '0' : mmMedallion === 'ether' ? '1' : mmMedallion === 'quake' ? '2' : '0';

    // Position 30: trMedallion
    var trMedallion = 'bombos';
    if (special && special['Turtle Rock Medallion:1']) {
      trMedallion = stripSuffix(special['Turtle Rock Medallion:1']).toLowerCase();
    }
    positionMappings[30] = trMedallion === 'bombos' ? '0' : trMedallion === 'ether' ? '1' : trMedallion === 'quake' ? '2' : '0';

    // Build the prefix string (positions 0-39 for 40 total characters)
    var prefix = '';
    prefix += '000001xXJAo0A0ebe3WP'; // Using the example seed from your sample

    // Add the metadata positions (20-30)
    for (var i = 20; i <= 30; i++) {
      prefix += positionMappings[i];
    }

    // Add padding zeros for positions 31-39 to reach 40 characters total
    for (var i = 31; i <= 39; i++) {
      prefix += '0';
    }

    return prefix;
  }
}