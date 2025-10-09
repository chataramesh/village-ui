import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserStatsComponent } from './user-stats/user-stats.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserCreateComponent,
    UserStatsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    UsersRoutingModule
  ],
  exports: [UserStatsComponent,UserListComponent],
})
export class UsersModule { }
