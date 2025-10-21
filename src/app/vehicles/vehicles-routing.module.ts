import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleCreateComponent } from './vehicle-create/vehicle-create.component';

const routes: Routes = [
  { path: '', component: VehicleListComponent },
  { path: 'create', component: VehicleCreateComponent },
  { path: 'edit/:id', component: VehicleCreateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
