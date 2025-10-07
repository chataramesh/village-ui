import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminCreateComponent } from './admin-create/admin-create.component';


@NgModule({
  declarations: [
    AdminListComponent,
    AdminCreateComponent
  ],
  imports: [
    CommonModule,
    AdminsRoutingModule
  ]
})
export class AdminsModule { }
