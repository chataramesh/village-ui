import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminCreateComponent } from './admin-create/admin-create.component';
import { AdminListComponent } from './admin-list/admin-list.component';

const routes: Routes = [
  { path: '', component: AdminListComponent },
  { path: 'create', component: AdminCreateComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsRoutingModule { }
