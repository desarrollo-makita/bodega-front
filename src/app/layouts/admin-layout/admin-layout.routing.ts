import { Routes } from '@angular/router';

import { InformesComponent } from '../../informes/informes.component';
import { UserComponent } from '../../user/user.component';
import { UserEditComponent } from 'app/user-edit/user-edit.component';
import { AreaMantenedorComponent } from 'app/area-mantenedor/area-mantenedor.component';



export const AdminLayoutRoutes: Routes = [
    { path: 'informes',      component: InformesComponent },
    { path: 'user',           component: UserComponent },
    { path: 'rol-mantenedor', component: AreaMantenedorComponent },
    { path: 'user/user-edit', component: UserEditComponent },


   
];
