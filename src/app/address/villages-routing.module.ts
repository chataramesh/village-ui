import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { StateListComponent } from './state-list/state-list.component';
import { DistrictListComponent } from './district-list/district-list.component';
import { MandalListComponent } from './mandal-list/mandal-list.component';
import { VillageListComponent } from './village-list/village-list.component';
import { VillageCreateComponent } from './village-create/village-create.component';

const routes: Routes = [
  { path: '', component: VillageListComponent },
  { path: 'create', component: VillageCreateComponent },
  { path: 'edit/:id', component: VillageCreateComponent },
  { path: 'countries', component: CountryListComponent },
  { path: 'states', component: StateListComponent },
  { path: 'districts', component: DistrictListComponent },
  { path: 'mandals', component: MandalListComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VillagesRoutingModule { }
