import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['VILLAGE_ADMIN', 'SUPER_ADMIN', 'VILLAGER'] }
  },
  {
    path: 'admins',
    loadChildren: () => import('./admins/admins.module').then(m => m.AdminsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'SUPER_ADMIN' }
  },
  {
    path: 'villages',
    loadChildren: () => import('./villages/villages.module').then(m => m.VillagesModule),
    canActivate: [AuthGuard],
    data: { role: 'SUPER_ADMIN' }
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./vehicles/vehicles.module').then(m => m.VehiclesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'entities',
    loadChildren: () => import('./entities/entities.module').then(m => m.EntitiesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'incidents',
    loadChildren: () => import('./incidents/incidents.module').then(m => m.IncidentsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'images',
    loadChildren: () => import('./images/images.module').then(m => m.ImagesModule),
    canActivate: [AuthGuard]
    // Removed role restriction - villagers can access images too
  },
  {
    path: 'events',
    loadChildren: () => import('./events/events.module').then(m => m.EventsModule),
    canActivate: [AuthGuard]
    // Removed role restriction - villagers can access events too
  },

  // Schools routes
  {
    path: 'schools',
    loadChildren: () => import('./schools/schools.module').then(m => m.SchoolsModule),
    canActivate: [AuthGuard]
  },

  // Temples routes
  {
    path: 'temples',
    loadChildren: () => import('./temples/temples.module').then(m => m.TemplesModule),
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    useHash: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
