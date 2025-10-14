import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';

const routes: Routes = [
  {
    path: '',
    component: EventListComponent
  },
  {
    path: 'create',
    component: EventListComponent
  }
];

@NgModule({
  declarations: [
    EventListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    EventListComponent
  ]
})
export class EventsModule { }
