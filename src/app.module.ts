import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './components/app/app.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { GameComponent } from './components/game/game.component';
import { AboutComponent } from './components/about/about.component';
import { SupportComponent } from './components/support/support.component';
import { ChangelogComponent } from './components/changelog/changelog.component';
import { TpLogComponent } from './components/tp-log/tp-log.component';
import { TpLogRedirectComponent } from './components/tp-log-redirect/tp-log-redirect.component';
import { ItemTrackerComponent } from './components/item-tracker/item-tracker.component';
import { TrackerNodeComponent } from './components/tracker-node/tracker-node.component';
import { NodeComponent } from './components/node/node.component';
import { DungeonItemsComponent } from './components/dungeon-items/dungeon-items.component';
import { DungeonItemCountComponent } from './components/dungeon-item-count/dungeon-item-count.component';
import { ItemLineComponent } from './components/item-line/item-line.component';
import { ItemLogComponent } from './components/item-log/item-log.component';
import { OptionsComponent } from './components/options/options.component';
import { GameMenuComponent } from './components/game-menu/game-menu.component';
import { EndStatsComponent } from './components/end-stats/end-stats.component';

import { ItemLogFilterPipe } from './pipes/item-log-filter.pipe';

import { GameService } from './services/game.service';
import { SeedService } from './services/seed.service';
import { ItemArrayService } from './services/item-array.service';
import { ItemNamesService } from './services/item-names.service';
import { WindowRef } from './services/window-ref.service';

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    GameComponent,
    AboutComponent,
    SupportComponent,
    ChangelogComponent,
    TpLogComponent,
    TpLogRedirectComponent,
    ItemTrackerComponent,
    TrackerNodeComponent,
    NodeComponent,
    DungeonItemsComponent,
    DungeonItemCountComponent,
    ItemLineComponent,
    ItemLogComponent,
    OptionsComponent,
    GameMenuComponent,
    EndStatsComponent,
    ItemLogFilterPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
  ],
  providers: [
    ItemNamesService,
    GameService,
    SeedService,
    ItemArrayService,
    WindowRef,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
