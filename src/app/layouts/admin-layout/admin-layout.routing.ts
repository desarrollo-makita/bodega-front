import { Routes } from '@angular/router';

import { InformesComponent } from '../../informes/informes.component';
import { UserComponent } from '../../user/user.component';
import { UserEditComponent } from 'app/user-edit/user-edit.component';
import { AreaMantenedorComponent } from 'app/area-mantenedor/area-mantenedor.component';
import { BitacoraUbicacionesComponent } from 'app/bitacora-ubicaciones/bitacora-ubicaciones.component';
import { InventarioComponent } from 'app/inventario/inventario/inventario.component';
import { AsignarCapturadorComponent } from 'app/asignar-capturador/asignar-capturador.component';
import { ReconteosComponent } from 'app/reconteos/reconteos/reconteos.component';
import { AsignacionReconteosComponent } from 'app/reconteos/asignacion-reconteos/asignacion-reconteos.component';



export const AdminLayoutRoutes: Routes = [
    { path: 'informes',      component: InformesComponent },
    { path: 'user',           component: UserComponent },
    { path: 'rol-mantenedor', component: AreaMantenedorComponent },
    { path: 'user/user-edit', component: UserEditComponent },
    { path: 'bitacora-ubicaciones', component: BitacoraUbicacionesComponent },
    { path: 'inventario', component: InventarioComponent },
    { path: 'asignar-capturador', component: AsignarCapturadorComponent },
    { path: 'asignacion-reconteos', component: AsignacionReconteosComponent },
    { path: 'reconteo-inventario', component: ReconteosComponent },
  

];
