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
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { FeatureHeaderComponent } from './components/feature-header/feature-header.component';


@NgModule({
  declarations: [
    CardsComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    UserProfileDropdownComponent,
    FeatureHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedRoutingModule,
    MatCardModule,
    ChatWidgetComponent
  ],
  exports: [
    CardsComponent,
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    UserProfileDropdownComponent,
    ChatWidgetComponent,
    FeatureHeaderComponent
  ]
})
export class SharedModule { }
