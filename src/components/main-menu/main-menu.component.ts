import { SeedService } from '../../services/seed.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgStyle, NgClass } from '@angular/common';
import { HelpPopoverComponent } from '../help-popover/help-popover.component';

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.css'],
    imports: [FormsModule, NgStyle, NgClass, HelpPopoverComponent]
})
export class MainMenuComponent implements OnInit {
  generationType: string;
  shouldDisablePlay: boolean;
  modeSelected: string;
  swordsSelected: string;
  goalSelected: string;
  dungeonItemsSelected: string;
  enemizerSelected: string;
  itemPlacementSelected: string;
  accessibilitySelected: string;
  openTowerSelected: string;
  openGanonSelected: string;
  hintsSelected: string;
  mapSelected: string;
  seedNum: string;
  errorMessage: string;
  dailySeed: boolean;
  autoSeed: boolean;
  isAdvancedOWEnabled: string;
  preloadedBosses: HTMLImageElement[];
  preloadedIcons: HTMLImageElement[];
  openCrystalOptions: { id: string; label: string }[];
  lockedMode: string;
  lockedMap: string;
  preloadedMap: HTMLImageElement;
  seedInfo: string;
  isGenerating: boolean;

  constructor(
    private _seedService: SeedService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.generationType = 'open';
    this.shouldDisablePlay = false;
    this.modeSelected = 'standard';
    this.swordsSelected = 'randomized';
    this.goalSelected = 'ganon';
    this.dungeonItemsSelected = 'standard';
    this.enemizerSelected = 'none';
    this.itemPlacementSelected = 'advanced';
    this.accessibilitySelected = 'items';
    this.openTowerSelected = '7';
    this.openGanonSelected = '7';
    this.hintsSelected = 'off';
    this.mapSelected = 'no';
    this.seedNum = '';
    this.errorMessage = '';
    this.dailySeed = false;
    this.autoSeed = true;
    this.isAdvancedOWEnabled = 'inline-block';
    this.preloadedBosses = [];
    this.preloadedIcons = [];
    this.isGenerating = false;
    this.openCrystalOptions = [
      {
        id: '0',
        label: '0 Crystals',
      },
      {
        id: '1',
        label: '1 Crystal',
      },
      {
        id: '2',
        label: '2 Crystals',
      },
      {
        id: '3',
        label: '3 Crystals',
      },
      {
        id: '4',
        label: '4 Crystals',
      },
      {
        id: '5',
        label: '5 Crystals',
      },
      {
        id: '6',
        label: '6 Crystals',
      },
      {
        id: '7',
        label: '7 Crystals',
      },
      {
        id: 'random',
        label: 'Random',
      },
    ];
    if(!localStorage.getItem('seedHash')){
      this.shouldDisablePlay = true;
    } else{
      this.seedInfo = this._seedService.buildStringUrl();
    }
    
  }

  ngOnInit() {
    if (localStorage.getItem('defaultTab')) {
      this.generationType = localStorage.getItem('defaultTab');
    } else {
      this.generationType = 'open';
    }
    if (localStorage.getItem('swordsSelected')) {
      this.modeSelected = localStorage.getItem('modeSelected');
      this.swordsSelected = localStorage.getItem('swordsSelected');
      this.goalSelected = localStorage.getItem('goalSelected');
    } else {
      localStorage.setItem('modeSelected', this.modeSelected);
      localStorage.setItem('swordsSelected', this.swordsSelected);
      localStorage.setItem('goalSelected', this.goalSelected);
    }
    if (localStorage.getItem('mapSelected')) {
      this.mapSelected = localStorage.getItem('mapSelected');
    } else {
      localStorage.setItem('mapSelected', this.mapSelected);
    }
    if (localStorage.getItem('enemizerSelected')) {
      this.enemizerSelected = localStorage.getItem('enemizerSelected');
    } else {
      localStorage.setItem('enemizerSelected', this.enemizerSelected);
    }
    if (localStorage.getItem('dungeonItemsSelected')) {
      this.dungeonItemsSelected = localStorage.getItem('dungeonItemsSelected');
      this.itemPlacementSelected = localStorage.getItem('itemPlacementSelected');
      this.accessibilitySelected = localStorage.getItem('accessibilitySelected');
      this.openTowerSelected = localStorage.getItem('openTowerSelected');
      this.openGanonSelected = localStorage.getItem('openGanonSelected');
      this.hintsSelected = localStorage.getItem('hintsSelected');
    }
    if (this.modeSelected === 'inverted') {
      this.mapSelected = 'no';
      this.isAdvancedOWEnabled = 'none';
    } else {
      this.isAdvancedOWEnabled = 'inline-block';
    }
    this._seedService.getStatus().subscribe(
      (statusResponse) => {
        if (statusResponse) {
          switch (statusResponse.type) {
            case 'error':
            case 'warning':
              this.errorMessage = statusResponse.msg;
          }
        } else {
          this.errorMessage = 'Unable to connect to the server. Please try again later';
        }
      },
      (error) => {
        this.errorMessage = error;
      },
    );
    setTimeout(() => {
      this.preloadMap();
    }, 1000);
    setTimeout(() => {
      this.preloadBosses();
    }, 3000);
    setTimeout(() => {
      this.preloadItems();
    }, 6000);
  }

  onDailySeedClick() {
    if (this.dailySeed) {
      this.seedNum = "Today's Daily Seed";
    } else {
      this.seedNum = '';
    }
  }

  onSubmit() {
    this.shouldDisablePlay = true;
    this.lockedMode = this.modeSelected;
    this.lockedMap = this.mapSelected;
    this.errorMessage = '';
    var seedParams: { [key: string]: string } = {};
    var queryParams: { [key: string]: string | boolean } = {};
    localStorage.setItem('defaultTab', this.generationType);
    if (this.lockedMap === 'yes') {
      queryParams.fullMap = true;
    }
    if (this.generationType === 'custom') {
      localStorage.setItem('modeSelected', this.modeSelected);
      localStorage.setItem('swordsSelected', this.swordsSelected);
      localStorage.setItem('goalSelected', this.goalSelected);
      localStorage.setItem('mapSelected', this.mapSelected);
      localStorage.setItem('enemizerSelected', this.enemizerSelected);
      localStorage.setItem('dungeonItemsSelected', this.dungeonItemsSelected);
      localStorage.setItem('itemPlacementSelected', this.itemPlacementSelected);
      localStorage.setItem('accessibilitySelected', this.accessibilitySelected);
      localStorage.setItem('openTowerSelected', this.openTowerSelected);
      localStorage.setItem('openGanonSelected', this.openGanonSelected);
      localStorage.setItem('hintsSelected', this.hintsSelected);
      this.preloadedMap = null;
      this.preloadedIcons = null;
      this.preloadedBosses = null;
      if (this.itemPlacementSelected !== 'advanced') {
        queryParams.placement = this.itemPlacementSelected;
      }
      if (this.dungeonItemsSelected !== 'standard') {
        queryParams.dItems = this.dungeonItemsSelected;
      }
      if (this.accessibilitySelected !== 'items') {
        queryParams.accessibility = this.accessibilitySelected;
      }
      if (this.goalSelected !== 'ganon') {
        queryParams.goal = this.goalSelected;
      }
      if (this.openTowerSelected !== '7') {
        queryParams.tower = this.openTowerSelected;
      }
      if (this.openGanonSelected !== '7') {
        queryParams.ganon = this.openGanonSelected;
      }
      if (this.enemizerSelected !== 'none') {
        queryParams.enemizer = this.enemizerSelected;
      }
      if (this.hintsSelected !== 'off') {
        queryParams.hints = this.hintsSelected;
      }
      if (this.swordsSelected !== 'randomized') {
        queryParams.swords = this.swordsSelected;
      }
      if (this.lockedMap === 'yes') {
        queryParams.fullMap = true;
      }
      seedParams.item_placement = this.itemPlacementSelected;
      seedParams.dungeon_items = this.dungeonItemsSelected;
      seedParams.accessibility = this.accessibilitySelected;
      seedParams.goal = this.goalSelected;
      seedParams.entry_crystals_tower = this.openTowerSelected;
      seedParams.entry_crystals_ganon = this.openGanonSelected;
      seedParams.mode = this.modeSelected;
      seedParams.enemizer = this.enemizerSelected;
      seedParams.hints = this.hintsSelected;
      seedParams.weapons = this.swordsSelected;
      this._seedService.getSeed(this.lockedMode, seedParams).subscribe(
        (seedResponse) => {
          if (!seedResponse || seedResponse.error) {
            this.errorMessage = seedResponse.error;
            this.shouldDisablePlay = false;
          } else {
            this._router.navigate(['/' + this.modeSelected], {
              queryParams: queryParams,
            });
          }
          this.preloadedMap = null;
          this.preloadedIcons = null;
          this.preloadedBosses = null;
        },
        (error) => {
          this.errorMessage = error;
          this.shouldDisablePlay = false;
        },
      );
    } else if (this.generationType === 'open') {
      if (this.seedNum) {
        seedParams.seed = this.seedNum;
      }
      seedParams.enemizer = 'none';
      this.errorMessage =
        "The seed may take a few seconds to load. If it doesn't after 10s please reload the page and try again.";
      this._seedService.getSeed(this.lockedMode, seedParams, false, true).subscribe(
        (seedResponse) => {
          if (!seedResponse || seedResponse.error) {
            this.errorMessage = seedResponse.error;
            this.shouldDisablePlay = false;
          } else if (this.autoSeed) {
            queryParams.seed = seedResponse.seed;
            this._router.navigate(['/qual'], {
              queryParams: queryParams,
            });
          } else {
            this._router.navigate(['/' + this.modeSelected], {
              queryParams: queryParams,
            });
          }
          this.preloadedMap = null;
          this.preloadedIcons = null;
          this.preloadedBosses = null;
        },
        (error) => {
          this.errorMessage = error;
          this.shouldDisablePlay = false;
        },
      );
    } else if (this.generationType === 'mystery') {
      this._seedService.getSeed('mystery', seedParams).subscribe(
        (seedResponse) => {
          if (!seedResponse || seedResponse.error) {
            this.errorMessage = seedResponse.error;
            this.shouldDisablePlay = false;
          } else {
            this._router.navigate(['/mystery'], {
              queryParams: queryParams,
            });
          }
          this.preloadedMap = null;
          this.preloadedIcons = null;
          this.preloadedBosses = null;
        },
        (error) => {
          this.errorMessage = error;
          this.shouldDisablePlay = false;
        },
      );
    }
  }

  onIsInverted(isInverted) {
    if (isInverted) {
      this.mapSelected = 'no';
      this.isAdvancedOWEnabled = 'none';
    } else {
      this.isAdvancedOWEnabled = 'inline-block';
    }
  }

  preloadMap() {
    this.preloadedMap = new Image();
    this.preloadedMap.src = 'assets/light-world.png';
  }

  preloadBosses() {
    var bossUrls = [
      'assets/dungeon-tracker-icons/boss02.png',
      'assets/dungeon-tracker-icons/boss12.png',
      'assets/dungeon-tracker-icons/boss22.png',
      'assets/dungeon-tracker-icons/boss32.png',
      'assets/dungeon-tracker-icons/boss42.png',
      'assets/dungeon-tracker-icons/boss52.png',
      'assets/dungeon-tracker-icons/boss62.png',
      'assets/dungeon-tracker-icons/boss72.png',
      'assets/dungeon-tracker-icons/boss82.png',
      'assets/dungeon-tracker-icons/boss92.png',
    ];
    this.preloadedBosses = [];
    bossUrls.forEach((url, index) => {
      this.preloadedBosses[index] = new Image();
      this.preloadedBosses[index].src = url;
    });
  }

  preloadItems() {
    var itemUrls = [
      'assets/item-icons/agahnim.png',
      'assets/item-icons/bombos.png',
      'assets/item-icons/book.png',
      'assets/item-icons/boots.png',
      'assets/item-icons/bottle.png',
      'assets/item-icons/bow.png',
      'assets/item-icons/byrna.png',
      'assets/item-icons/cape.png',
      'assets/item-icons/ether.png',
      'assets/item-icons/fireRod.png',
      'assets/item-icons/flippers.png',
      'assets/item-icons/flute.png',
      'assets/item-icons/glove.png',
      'assets/item-icons/hammer.png',
      'assets/item-icons/halfMagic.png',
      'assets/item-icons/hookshot.png',
      'assets/item-icons/iceRod.png',
      'assets/item-icons/lamp.png',
      'assets/item-icons/mirror.png',
      'assets/item-icons/moonPearl.png',
      'assets/item-icons/mushroom.png',
      'assets/item-icons/net.png',
      'assets/item-icons/powder.png',
      'assets/item-icons/quake.png',
      'assets/item-icons/somaria.png',
      'assets/item-icons/shield.png',
      'assets/item-icons/sword.png',
      'assets/item-icons/tunic1.png',
      'assets/dungeon-tracker-icons/medallion0.png',
      'assets/dungeon-tracker-icons/dungeon0.png',
    ];
    this.preloadedIcons = [];
    itemUrls.forEach((url, index) => {
      this.preloadedIcons[index] = new Image();
      this.preloadedIcons[index].src = url;
    });
  }

  redirect(path) {
    this._router.navigate(['/' + path]);
  }

  onGenerateNewSeed() {
    var me = this;
    me.isGenerating = true;

    var seedParams = {
      glitches: 'none',
      item_placement: this.itemPlacementSelected || 'advanced',
      dungeon_items: this.dungeonItemsSelected || 'standard',
      accessibility: this.accessibilitySelected || 'items',
      goal: this.goalSelected || 'ganon',
      crystals: {
        ganon: this.openGanonSelected || '7',
        tower: this.openTowerSelected || '7'
      },
      mode: this.modeSelected || 'open',
      entrances: 'none',
      hints: this.hintsSelected || 'on',
      weapons: this.swordsSelected || 'randomized',
      item: { pool: 'normal', functionality: 'normal' },
      tournament: false,
      spoilers: 'on',
      lang: 'en',
      enemizer: {
        boss_shuffle: this.enemizerSelected || 'none',
        enemy_shuffle: 'none',
        enemy_damage: 'default',
        enemy_health: 'default'
      }
    };

    this._seedService.generateSeed(seedParams).then(function(spoilerData) {
      me._seedService.saveSpoilerLogToLocalStorage(spoilerData.spoiler);
      localStorage.setItem('seedHash', spoilerData && spoilerData.hash);

      me._seedService.loadAndGenerateItemArray().then(function(itemArray) {
        console.log('Item array generated:', itemArray && itemArray.length, 'locations');
        localStorage.setItem('itemArray', itemArray ? itemArray.join('') : '');
        me.showNotification('New seed generated successfully!', 'success');
           if(!localStorage.getItem('seedHash')){
            me.shouldDisablePlay = true;
          }else{
            me.seedInfo = me._seedService.buildStringUrl();
            me.shouldDisablePlay = false;
          }
      });
    }).catch(function(error) {
      console.error('Seed generation failed:', error);
      me.showNotification('Failed to generate seed: ' + error.message, 'error');
    }).then(function() {
      me.isGenerating = false;
    });
  }

  onSpoilerLogFileSelected(event: Event) {
    var me = this;
    var input = event.target as HTMLInputElement;
    var files = input.files;
    var file = (files && files.length > 0) ? files[0] : null;
    if (!file) return;

    var reader = new FileReader();
    var me = this;
    reader.onload = function() {
      try {
        var text = reader.result as string;
        var spoilerLogData = JSON.parse(text);
        var seed = me._seedService.extractSeedHash(file.name);
        if (seed) {
          localStorage.setItem('seedHash', seed);
        }
        me._seedService.saveSpoilerLogToLocalStorage(spoilerLogData);
        me._seedService.loadAndGenerateItemArray().then(function(itemArray) {
          if (itemArray) {
            localStorage.setItem('itemArray', itemArray.join(''));
          }
        });
        
        me.showNotification('Spoiler log successfully loaded! Reloading page...', 'success');
        if(!localStorage.getItem('seedHash')){
          me.shouldDisablePlay = true;
        }else {
          me.seedInfo = me._seedService.buildStringUrl()
          me.shouldDisablePlay = false;
        }
      } catch (error) {
        console.error('Error loading spoiler log:', error);
        alert('Error loading spoiler log file. Please check the console for details.');
      }
    };
    reader.readAsText(file);
  }

  showNotification(message: string, type: string) {
    var cls = type === 'success' ? 'alert--success' : 'alert--danger';
    var existing = document.querySelector('.' + cls + '-notification');
    if (existing) existing.remove();

    var notification = document.createElement('div');
    notification.className = 'alert app-notification ' + cls + ' ' + cls + '-notification';
    notification.setAttribute('role', 'alert');

    var body = document.createElement('span');
    body.className = 'app-notification-body';

    var label = document.createElement('strong');
    label.textContent = type === 'success' ? 'Success:' : 'Error:';
    body.appendChild(label);

    var text = document.createElement('span');
    text.textContent = message;
    body.appendChild(text);
    notification.appendChild(body);

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.className = 'close-button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
    closeBtn.onclick = function() { notification.remove(); };
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);

    setTimeout(function() {
      if (notification.parentNode) notification.remove();
    }, type === 'success' ? 5000 : 8000);
  }
}
