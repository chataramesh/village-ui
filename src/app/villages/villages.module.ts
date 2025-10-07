import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VillagesRoutingModule } from './villages-routing.module';
import { VillageTreeComponent } from './village-tree/village-tree.component';


@NgModule({
  declarations: [
    VillageTreeComponent
  ],
  imports: [
    CommonModule,
    VillagesRoutingModule
  ]
})
export class VillagesModule { }
