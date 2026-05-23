import { Pipe, PipeTransform } from '@angular/core';
import { ItemNamesService } from '../services/item-names.service';

@Pipe({
    name: 'itemLogFilter',
    pure: false,
    standalone: false
})
export class ItemLogFilterPipe implements PipeTransform {
  constructor(private _itemNamesService: ItemNamesService) {}

  transform(items: { item: string; shortName: string; longName: string; location: string; region: string; type: string }[], filterArgs: { onlyImportantShown: boolean; searchQuery: string }) {
    if (!items || !filterArgs) {
      return items;
    }
    var specialItems = ['blind', 'tt-bomb', 'switch', 'flood', 'ip-switch-room', 'hintTile'];
    return items.filter((entry) => {
      return (
        (!!specialItems.includes(entry.shortName) && filterArgs.searchQuery === '') ||
        ((!filterArgs.onlyImportantShown ||
          entry.longName.indexOf('Agahnim') !== -1 ||
          entry.longName.indexOf('Ganon') !== -1 ||
          entry.item === 'hint' ||
          !!ItemNamesService.isTrackableItem(+entry.item) ||
          entry.type === 'view' ||
          entry.type === 'cant') &&
          (filterArgs.searchQuery == '' ||
            entry.location.toLowerCase().indexOf(filterArgs.searchQuery.toLowerCase()) > -1 ||
            entry.region.toLowerCase().indexOf(filterArgs.searchQuery.toLowerCase()) > -1 ||
            ((entry.type !== 'view' ||
              (!entry.shortName.includes('smallKey') &&
                !entry.shortName.includes('bigKey') &&
                !entry.shortName.includes('map') &&
                !entry.shortName.includes('compass'))) &&
              (this._itemNamesService
                .getItemById(entry.item)
                .longName.toLowerCase()
                .indexOf(filterArgs.searchQuery.toLowerCase()) > -1 ||
                entry.item.toLowerCase().indexOf(filterArgs.searchQuery.toLowerCase()) > -1))))
      );
    });
  }
}
