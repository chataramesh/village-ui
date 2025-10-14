import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EntitiesRoutingModule } from './entities-routing.module';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityCreateComponent } from './entity-create/entity-create.component';
import { EntityService } from './services/entity.service';
import { EntitySubscriptionService } from './services/entity-subscription.service';


@NgModule({
  declarations: [
    EntityCreateComponent,
    EntityListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EntitiesRoutingModule
  ],
  providers: [
    EntityService,
    EntitySubscriptionService
  ]
})
export class EntitiesModule { }
