import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VillageTreeComponent } from './village-tree/village-tree.component';
import { VillageCreateComponent } from './village-create/village-create.component';

const routes: Routes = [
  { path: '', component: VillageTreeComponent },
  { path: 'create', component: VillageCreateComponent },
  { path: 'edit/:id', component: VillageCreateComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillagesRoutingModule { }
