import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VillageTreeComponent } from './village-tree/village-tree.component';

const routes: Routes = [
  { path: '', component: VillageTreeComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillagesRoutingModule { }
