import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { VillageAdminComponent } from './village-admin/village-admin.component';
import { VillagerComponent } from './villager/villager.component';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';
import { SharedModule } from '../shared/shared.module';
import { NotificationBellComponent } from '../shared/components/notification-bell.component';
import { ProfileModalComponent } from '../shared/components/profile-modal/profile-modal.component';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { VillagerEntityListComponent } from './villager/villager-entity-list/villager-entity-list.component';
import { SubscriptionsComponent } from './villager/subscriptions/subscriptions.component';

@NgModule({
  declarations: [
    SuperAdminComponent,
    VillageAdminComponent,
    VillagerComponent,
    DashboardLandingComponent,
    VillagerEntityListComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    NotificationBellComponent,
    ProfileModalComponent,
    SubscriptionsComponent,
    MatTooltipModule,
    MatProgressBarModule,
    NgApexchartsModule,
    MatCardModule,
    FormsModule
  ]
})
export class DashboardModule { }
