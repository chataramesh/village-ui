import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserStatsComponent } from './user-stats/user-stats.component';

const routes: Routes = [
  { path: '', component: UserListComponent },
  { path: 'create', component: UserCreateComponent },
  { path: 'edit/:id', component: UserCreateComponent },
  { path: 'stats', component: UserStatsComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
