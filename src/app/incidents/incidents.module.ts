import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IncidentListComponent } from './incident-list/incident-list.component';
import { IncidentCreateComponent } from './incident-create/incident-create.component';
import { IncidentsRoutingModule } from './incidents-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    IncidentListComponent,
    IncidentCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    IncidentsRoutingModule,
    SharedModule,
  ]
})
export class IncidentsModule { }
