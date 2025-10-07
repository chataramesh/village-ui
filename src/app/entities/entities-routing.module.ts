import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntityCreateComponent } from './entity-create/entity-create.component';
import { EntityListComponent } from './entity-list/entity-list.component';

const routes: Routes = [
  { path: '', component: EntityListComponent },
  { path: 'create', component: EntityCreateComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitiesRoutingModule { }
