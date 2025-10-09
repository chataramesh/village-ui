import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { VillagesRoutingModule } from './villages-routing.module';
import { VillageTreeComponent } from './village-tree/village-tree.component';
import { VillageCreateComponent } from './village-create/village-create.component';


@NgModule({
  declarations: [
    VillageTreeComponent,
    VillageCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    VillagesRoutingModule
  ]
})
export class VillagesModule { }
