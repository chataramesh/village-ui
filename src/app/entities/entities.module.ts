import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EntitiesRoutingModule } from './entities-routing.module';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityCreateComponent } from './entity-create/entity-create.component';


@NgModule({
  declarations: [
    EntityCreateComponent,
    EntityListComponent,
    EntityCreateComponent
  ],
  imports: [
    CommonModule,
    EntitiesRoutingModule
  ]
})
export class EntitiesModule { }
