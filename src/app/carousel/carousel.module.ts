import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from '../app-routing.module';
import { CarouselComponent } from './carousel.component';
import { AppComponent } from '../app.component';


@NgModule({
  declarations: [
    CarouselComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CarouselModule
  ],
  exports: [
    CarouselComponent
  ],
  bootstrap: [AppComponent]
})
export class CarouselModule { }
