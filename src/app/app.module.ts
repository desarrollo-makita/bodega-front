import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.routing';
import { NavbarModule } from './shared/navbar/navbar.module';
import { FooterModule } from './shared/footer/footer.module';
import { SidebarModule } from './sidebar/sidebar.module';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { UserComponent } from './user/user.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { AreaMantenedorComponent } from './area-mantenedor/area-mantenedor.component';

// Nuevas importaciones para Angular Material
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';  // Agregado para mat-form-field
import { MatInputModule } from '@angular/material/input';  // Agregado para matInput
import { MatCardModule } from '@angular/material/card'; // Agregado para mat-card

import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { PasswordStrengthComponent } from './util/password-strength/password-strength.component';
import { PasswordRecoveryDialogComponent } from './shared/password-recovery-dialog/password-recovery-dialog.component';
import { ReplaceTemporaryKeyComponent } from './shared/replace-temporary-key/replace-temporary-key.component';
import { BitacoraUbicacionesComponent } from './bitacora-ubicaciones/bitacora-ubicaciones.component';
import { InventarioComponent } from './inventario/inventario/inventario.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AsignarCapturadorComponent } from './asignar-capturador/asignar-capturador.component';
import { GraficoTortaComponent } from './grafico-torta/grafico-torta.component';
import { ConfirmInventarioDialogComponent } from './shared/confirm-inventario-dialog/confirm-inventario-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { CerrarInventarioDialogComponent } from './shared/cerrar-inventario-dialog/cerrar-inventario-dialog.component';

import { AsignacionReconteosComponent } from './reconteos/asignacion-reconteos/asignacion-reconteos.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AlmacenamientoDialogComponent } from './shared/almacenamiento-dialog/almacenamiento-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BateriasDialogComponent } from './shared/baterias-dialog/baterias-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventarioBateriasComponent } from './inventario-baterias/inventario-baterias/inventario-baterias.component';
import { AsignacionRerconteosBateriasComponent } from './reconteo-baterias/asignacion-rerconteos-baterias/asignacion-rerconteos-baterias.component';
import { GarantiasComponent } from './garantias/garantias/garantias.component';
import { GarantiaDetalleDialogComponent } from './shared/garantia-detalle-dialog/garantia-detalle-dialog.component';
import { IngresarGarantiasComponent } from './garantias/ingresar-garantias/ingresar-garantias.component';
import { AgregarRepuestosDialogComponent } from './shared/agregar-repuestos-dialog/agregar-repuestos-dialog.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    AppRoutingModule,
    MatDialogModule,     // Para diálogos
    MatButtonModule,     // Para botones
    MatSlideToggleModule, // Para switches
    MatIconModule,       // Para íconos
    MatFormFieldModule,  // Para usar mat-form-field
    MatInputModule,      // Para usar matInput
    MatCardModule,       // Para usar mat-card
    MatSelectModule,
    NgxPaginationModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatRadioModule,
    MatTooltipModule

    
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
    UserComponent,
    UserEditComponent,
    AreaMantenedorComponent,
    ConfirmDialogComponent,
    PasswordStrengthComponent,
    PasswordRecoveryDialogComponent,
    ReplaceTemporaryKeyComponent,
    BitacoraUbicacionesComponent,
    InventarioComponent,
    AsignarCapturadorComponent,
    GraficoTortaComponent,
    ConfirmInventarioDialogComponent,
    CerrarInventarioDialogComponent,
    AsignacionReconteosComponent,
    AlmacenamientoDialogComponent,
    BateriasDialogComponent,
    InventarioBateriasComponent,
    AsignacionRerconteosBateriasComponent,
    GarantiasComponent,
    GarantiaDetalleDialogComponent,
    IngresarGarantiasComponent,
    AgregarRepuestosDialogComponent,

    
    
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
