import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { VillagesRoutingModule } from './villages-routing.module';
import { VillageTreeComponent } from './village-tree/village-tree.component';
import { VillageCreateComponent } from './village-create/village-create.component';
import { CountryListComponent } from './country-list/country-list.component';
import { StateListComponent } from './state-list/state-list.component';
import { DistrictListComponent } from './district-list/district-list.component';
import { MandalListComponent } from './mandal-list/mandal-list.component';


@NgModule({
  declarations: [
    VillageTreeComponent,
    VillageCreateComponent,
    CountryListComponent,
    StateListComponent,
    DistrictListComponent,
    MandalListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    VillagesRoutingModule
  ]
})
export class VillagesModule { }
