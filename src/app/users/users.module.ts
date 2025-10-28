import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UsersRoutingModule } from './users-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserCreateComponent } from './user-create/user-create.component';

@NgModule({
  declarations: [
    UserListComponent,
    UserCreateComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    UsersRoutingModule
  ],
  exports: [UserListComponent],
})
export class UsersModule { }
