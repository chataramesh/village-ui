import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { CardsComponent } from './cards/cards.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [CardsComponent,NavbarComponent,
      NavbarComponent,
      SidebarComponent,
      FooterComponent,],
  imports: [
    CommonModule,
    SharedRoutingModule,MatCardModule
  ],
  exports: [CardsComponent,NavbarComponent,FooterComponent,SidebarComponent]
})
export class SharedModule { }
