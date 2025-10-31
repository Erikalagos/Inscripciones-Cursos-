import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { InscripcionesPageRoutingModule } from './inscripciones-routing.module';
import { InscripcionesPage } from './inscripciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,      // necesario para [(ngModel)]
    IonicModule,
    InscripcionesPageRoutingModule
  ],
  declarations: [InscripcionesPage]
})
export class InscripcionesPageModule {}
