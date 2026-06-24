import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ItemArrayService } from './item-array.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  _apiUrl: string;
  webVersion: string;
  defaultSeedMetadataPrefix: string;
  lastSeedTimestamp: number;
  lastSeedParams: { [key: string]: string };
  lastSeed: { [key: string]: any };

  constructor(
    private _http: HttpClient,
    private _itemArrayService: ItemArrayService
  ) {
    this._apiUrl = 'https://lttp-rando-seed-api.glitch.me/';
    this.webVersion = '4.1';
    this.defaultSeedMetadataPrefix = '000001xXJAo0A0ebe3WP10000010022000000000';
    if (true /* environment.production */) {
      this._apiUrl = 'https://lttp-rando-seed-api.glitch.me/';
    } else {
      this._apiUrl = 'https://lttp-rando-seed-api-dev.glitch.me/';
    }
  }

  ping() {
    this._http.get(this._apiUrl);
  }

  buildStringUrl(seedHash?:string): string{
     return 'https://alttpr.com/en/h/' + (seedHash || localStorage.getItem('seedHash'))
  }
  buildStringLabel(): string{
     var seedHash = localStorage.getItem('seedHash');
     var seedStr = seedHash
      ? localStorage.getItem('seedHash') + ' -> ' + this.buildStringUrl(seedHash)
      : 'BrXZ47EgQR4Qq8A: (Using Default Seed)';
    return seedStr;
  }

  getSeedMetadataPrefix(): string {
    var prefix = localStorage.getItem('seedMetadataPrefix');
    if (this.isSeedMetadataPrefixValid(prefix)) {
      return prefix;
    }

    if (prefix) {
      localStorage.removeItem('seedMetadataPrefix');
      localStorage.removeItem('itemArray');
    }

    return this.defaultSeedMetadataPrefix;
  }

  isSeedMetadataPrefixValid(prefix: string): boolean {
    if (!prefix || prefix.length !== 40) {
      return false;
    }

    var fields: [number, RegExp][] = [
      [20, /^[01]$/],
      [21, /^[0-3]$/],
      [22, /^[0-2]$/],
      [23, /^[0-4]$/],
      [24, /^[0-7]$/],
      [25, /^[0-7]$/],
      [26, /^[0-2]$/],
      [27, /^[0-3]$/],
      [28, /^[0-3]$/],
      [29, /^[0-2]$/],
      [30, /^[0-2]$/],
    ];

    for (var i = 0; i < fields.length; i++) {
      if (!fields[i][1].test(prefix.charAt(fields[i][0]))) {
        return false;
      }
    }

    return true;
  }

  getSeed(mode: string, params: any, isDaily = false, isQuals = false) {
    var url;
    var online = false;
    var seedStr = this.buildStringLabel();
    const fakeObservable = {
      prefix: this.getSeedMetadataPrefix(),
      itemArray: localStorage.getItem('itemArray'),
      seedData: {
        seed: seedStr,
        logic: '',
        variation: 'none',
        goal: 'ganon',
        mode: 'open',
        data: '000001xXJAo0A0ebe3WP10000010022000000000017017015017006013120006013017153017016013101017013013014008015136017124128013014012118014014006121017014015015015017017015015013013126102132006014017154013151151213017017226013117106227201152240015109153228215013202241111007013102014152013017013153013008015017015242203009008229216112217217013013008017017154016150008017013127150019006119013152133100123016013013116122015218218218218231218244205008218008008135102131219232115014013017245017206125108207220246220220013233015113234221017208114015247006129017235222013248209017222110249223210236008223223017107211224015224224007104224015105250237130225251015153016007007014238014011012225225017008017016014018225017212017006102014',
        hints: [],
        silversHint: 'Did you find the silver arrows in Dark World?',
        bosses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2],
        reqTower: '7',
        reqGanon: '7',
        error: null,
      },
      subscribe: function(success: any, failure: any) {
        if (fakeObservable.itemArray) {
          fakeObservable.seedData.data = fakeObservable.prefix + fakeObservable.itemArray;
        }
        this.lastSeedTimestamp = Date.now();
        this.lastSeedParams = {};
        this.lastSeed = fakeObservable.seedData;
        success(fakeObservable.seedData);
      },
    };
    var offlineResult = Object.create(fakeObservable);
    if (isQuals) {
      url = this._apiUrl + 'api/tseed?v=' + this.webVersion;
      Object.keys(params).forEach(function(key) {
        url += '&' + key + '=' + params[key];
      });
    } else if (isDaily) {
      url = this._apiUrl + 'api/daily?v=' + this.webVersion + '&mode=' + mode;
    } else if (mode === 'mystery') {
      url = this._apiUrl + 'api/seed?v=' + this.webVersion + '&mode=mystery';
    } else {
      url = this._apiUrl + 'api/seed?v=' + this.webVersion;
      Object.keys(params).forEach(function(key) {
        url += '&' + key + '=' + params[key];
      });
    }
    if (online) {
      return this._http
        .get(url)
        .pipe(
          map((data: any) => {
            this.lastSeedTimestamp = Date.now();
            this.lastSeedParams = {};
            this.lastSeed = data;
            return data;
          }),
          catchError((error: any) => { return this.handleError(error); })
        );
    } else {
      return offlineResult;
    }
  }

  getStatus() {
    var me = this;
    const fakeStatusObservable = {
      data: {},
      subscribe: function(success: any, failure: any) {
        success(this.data);
      },
    };
    var statusUrl = this._apiUrl + 'api/status?v=' + this.webVersion;
    return fakeStatusObservable;
  }

  handleError(error: any) {
    console.error(error);
    return throwError(error.error || 'Z3RSim seems to be offline. Please try again later.');
  }

  // ---- Native Angular helper methods (replaces spoilerLogAdapter.js + globals) ----

  saveSpoilerLogToLocalStorage(spoilerLogData: any): void {
    try {
      localStorage.setItem('z3r_spoiler_log', JSON.stringify(spoilerLogData));
    } catch (e) {
      console.error('Failed to save spoiler log', e);
    }
  }

  loadAndGenerateItemArray(seedPatch?: any[]): Promise<any[]> {
    var me = this;
    return new Promise(function(resolve, reject) {
      try {
        var storedSpoilerLog = localStorage.getItem('z3r_spoiler_log');
        var spoilerLog = storedSpoilerLog ? JSON.parse(storedSpoilerLog) : null;

        if (!spoilerLog) {
          resolve([]);
          return;
        }

        // Fetch the hotfix JSON files at runtime
        Promise.all([
          fetch('./hotfix/itemNameToFullItemMap.json').then(function(r) { return r.json(); }),
          fetch('./hotfix/spoilerToDetailedMap.json').then(function(r) { return r.json(); }),
          fetch('./hotfix/detailedMap.json').then(function(r) { return r.json(); })
        ]).then(function(results) {
          var itemNameMap = results[0];
          var spoilerMap = results[1];
          var detailedMap = results[2];

          // Generate seed metadata prefix
          var seedPrefix = me._itemArrayService.generateSeedMetadataPrefix(spoilerLog, seedPatch);
          localStorage.setItem('seedMetadataPrefix', seedPrefix);

          // Generate the item array
          var itemArray = me._itemArrayService.generateItemArray(
            spoilerLog, itemNameMap, spoilerMap, detailedMap
          );

          resolve(itemArray);
        }).catch(function(err) {
          console.error('Error loading hotfix data:', err);
          resolve([]);
        });
      } catch (error) {
        console.error('Error generating item array:', error);
        reject(error);
      }
    });
  }

  generateSeed(seedParams: any): Promise<any> {
    var proxyUrl = 'https://z3r-proxy.derpaholicrex.workers.dev';
    var fullUrl = proxyUrl + '/api/randomizer';

    return fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seedParams)
    }).then(function(response) {
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }
      return response.json();
    });
  }

  extractSeedHash(fileName: string): string | null {
    var lastUnderscoreIndex = fileName.lastIndexOf('_');
    var extensionIndex = fileName.lastIndexOf('.');
    if (lastUnderscoreIndex !== -1 && extensionIndex !== -1 && lastUnderscoreIndex < extensionIndex) {
      return fileName.substring(lastUnderscoreIndex + 1, extensionIndex);
    }
    return null;
  }
}
