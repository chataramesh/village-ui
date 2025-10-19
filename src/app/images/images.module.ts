import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { ImagesComponent } from './images.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';

const routes: Routes = [
  {
    path: '',
    component: ImagesComponent
  }
];

@NgModule({
  declarations: [
    ImagesComponent,
    ImageUploadComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ImagesComponent,
    ImageUploadComponent
  ]
})
export class ImagesModule { }
