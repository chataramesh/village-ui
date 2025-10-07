import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserStatsComponent } from './user-stats/user-stats.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserListComponent,
    UserCreateComponent,
    UserStatsComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule
  ],
  exports: [UserStatsComponent],
})
export class UsersModule { }
