import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { VillageAdminComponent } from './village-admin/village-admin.component';
import { VillagerComponent } from './villager/villager.component';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';
import { SharedModule } from '../shared/shared.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import { UsersModule } from '../users/users.module';
import { FormsModule } from '@angular/forms';
import { ProjectFilterPipe } from '../shared/pipes/project-filter.pipe';
import { SearchPipe } from '../shared/pipes/search.pipe';

@NgModule({
  declarations: [
    SuperAdminComponent,
    VillageAdminComponent,
    VillagerComponent,
    DashboardLandingComponent,
    ProjectFilterPipe,SearchPipe
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,SharedModule,UsersModule,MatTooltipModule,
    MatProgressBarModule,NgApexchartsModule,MatCardModule,FormsModule
  ]
})
export class DashboardModule { }
