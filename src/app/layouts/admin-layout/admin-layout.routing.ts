import { Routes } from '@angular/router';

import { InformesComponent } from '../../informes/informes.component';
import { UserComponent } from '../../user/user.component';
import { UserEditComponent } from 'app/user-edit/user-edit.component';
import { AreaMantenedorComponent } from 'app/area-mantenedor/area-mantenedor.component';
import { BitacoraUbicacionesComponent } from 'app/bitacora-ubicaciones/bitacora-ubicaciones.component';
import { InventarioComponent } from 'app/inventario/inventario/inventario.component';
import { AsignarCapturadorComponent } from 'app/asignar-capturador/asignar-capturador.component';
import { AsignacionReconteosComponent } from 'app/reconteos/asignacion-reconteos/asignacion-reconteos.component';
import { InventarioBateriasComponent } from 'app/inventario-baterias/inventario-baterias/inventario-baterias.component';
import { AsignacionRerconteosBateriasComponent } from 'app/reconteo-baterias/asignacion-rerconteos-baterias/asignacion-rerconteos-baterias.component';
import { GarantiasComponent } from 'app/garantias/garantias/garantias.component';
import { IngresarGarantiasComponent } from 'app/garantias/ingresar-garantias/ingresar-garantias.component';
import { CargaStockComponent } from 'app/carga-stock/carga-stock.component';
import { ComparativoStockComponent } from '../../listados/comparativo-stock/comparativo-stock.component';
import { InventarioListadoComponent } from '../../listados/inventario-listado/inventario-listado.component';
import { ConsultaStockComponent } from '../../listados/consulta-stock/consulta-stock.component';
import { InventarioSucursalComponent } from '../../listados/inventario-sucursal/inventario-sucursal.component';




export const AdminLayoutRoutes: Routes = [
    { path: 'informes',      component: InformesComponent },
    { path: 'user',           component: UserComponent },
    { path: 'rol-mantenedor', component: AreaMantenedorComponent },
    { path: 'user/user-edit', component: UserEditComponent },
    { path: 'bitacora-ubicaciones', component: BitacoraUbicacionesComponent },
    { path: 'inventario', component: InventarioComponent },
    { path: 'asignar-capturador', component: AsignarCapturadorComponent },
    { path: 'asignacion-reconteos', component: AsignacionReconteosComponent },
    { path: 'inventario-baterias', component: InventarioBateriasComponent },
    { path: 'asignacion-reconteos-baterias', component: AsignacionRerconteosBateriasComponent },
    { path: 'servicio-tecnico', component: GarantiasComponent},
    { path: 'crear-orden-trabajo', component: IngresarGarantiasComponent},
    { path: 'carga-stock', component: CargaStockComponent},
    { path: 'comparativo-stock', component: ComparativoStockComponent },
    { path: 'inventario-listado', component: InventarioListadoComponent },
    { path: 'consulta-stock', component: ConsultaStockComponent },
    { path: 'inventario-sucursal', component: InventarioSucursalComponent }

  

];
