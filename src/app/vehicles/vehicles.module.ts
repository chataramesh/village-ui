import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VehiclesRoutingModule } from './vehicles-routing.module';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleCreateComponent } from './vehicle-create/vehicle-create.component';
import { VehicleService } from './services/vehicle.service';

@NgModule({
  declarations: [
    VehicleListComponent,
    VehicleCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VehiclesRoutingModule
  ],
  providers: [
    VehicleService
  ]
})
export class VehiclesModule { }
