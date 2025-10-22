import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedRoutingModule } from './shared-routing.module';
import { CardsComponent } from './cards/cards.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserProfileDropdownComponent } from './components/user-profile-dropdown/user-profile-dropdown.component';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    CardsComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    UserProfileDropdownComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedRoutingModule,
    MatCardModule
  ],
  exports: [
    CardsComponent,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    UserProfileDropdownComponent
  ]
})
export class SharedModule { }
