import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlaceLocationPage } from './place-location';

@NgModule({
  declarations: [
    PlaceLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(PlaceLocationPage),
  ],
})
export class PlaceLocationPageModule {}
