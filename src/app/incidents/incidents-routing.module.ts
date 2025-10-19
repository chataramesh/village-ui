import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncidentCreateComponent } from './incident-create/incident-create.component';
import { IncidentListComponent } from './incident-list/incident-list.component';


const routes: Routes = [
  {
    path: '',
    component: IncidentListComponent
  },
  {
    path: 'create',
    component: IncidentCreateComponent
  },
  {
    path: 'edit/:id',
    component: IncidentCreateComponent // Reuse create component for editing
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncidentsRoutingModule { }
