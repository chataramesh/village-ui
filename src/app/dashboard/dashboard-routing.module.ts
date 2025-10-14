import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../core/guards/role.guard';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { VillageAdminComponent } from './village-admin/village-admin.component';
import { VillagerComponent } from './villager/villager.component';
import { VillagerEntityListComponent } from './villager/villager-entity-list/villager-entity-list.component';
import { DashboardLandingComponent } from './dashboard-landing/dashboard-landing.component';

const routes: Routes = [
  { path: '', component: DashboardLandingComponent }, // optional landing
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [RoleGuard], data: { role: 'SUPER_ADMIN' } },
  { path: 'village-admin', component: VillageAdminComponent, canActivate: [RoleGuard], data: { role: 'VILLAGE_ADMIN' } },
  {
    path: 'villager',
    children: [
      { path: '', component: VillagerComponent, canActivate: [RoleGuard], data: { role: 'VILLAGER' } },
      { path: 'entities', component: VillagerEntityListComponent, canActivate: [RoleGuard], data: { role: 'VILLAGER' } }
    ]
  }
];

@NgModule({     
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
