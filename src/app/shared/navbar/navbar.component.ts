import { Component, OnInit, ElementRef } from '@angular/core';

import { Location } from '@angular/common';
import { MyDataService } from 'app/services/data/my-data.service';
import { Router } from '@angular/router';
import { AuthGuard } from 'app/auth/auth.guard';

@Component({
    // moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit{
    private listTitles: any[];
    location: Location;
    private toggleButton: any;
    private sidebarVisible: boolean;
    showIcons: boolean;
    menuItems : any;
    title: string;
    currentRoute: string = '';

    constructor(
        location: Location,  
        private element: ElementRef, 
        private myDataService: MyDataService,
        private router: Router,
        private dataSharingService : MyDataService,
        private authService : AuthGuard) 
        {
        
            this.location = location;
            this.sidebarVisible = false;
            this.showIcons = true;
            
        }

    ngOnInit(){
      
        this.dataSharingService.getStringData().subscribe(menu => 
            {
                const ruta  = this.getTitle();
                this.updateTitle(ruta);
            });
        
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0]
       
    }

    updateTitle(title: string) {
        if (title === '/user') {
            this.title = 'Usuarios';
            this.showIcons = true;
        } else if (title === '/informes') {
            this.title = 'Informes';
            this.showIcons = false;
        } else if (title === '/rol-mantenedor') {
            this.title = 'Mantenedor de Area';
            this.showIcons = false;
        } else if (title === '/inventario') {
            this.title = 'Inventario';
            this.showIcons = false;
        } else if (title === '/bitacora-ubicaciones') {
            this.title = 'Bitacora Ubicaciones';
            this.showIcons = false;
        } else if (title === '/asignar-capturador') {
            this.title = 'Asignar Capturador';
            this.showIcons = false;
        } else if (title === '/inventario-baterias') {
            this.title = 'Inventario Baterias';
            this.showIcons = false;
        } else if (title === '/asignacion-reconteos') {
            this.title = 'Asignacion de Reconteos';
            this.showIcons = false;
        }
        else if (title === '/asignacion-reconteos-baterias') {
            this.title = 'Asignacion de Reconteos-Baterias';
            this.showIcons = false;
        }
        else if (title === '/servicio-tecnico') {
            this.title = 'Servicio Tecnico';
            this.showIcons = false;
        }
        else if (title === '/crear-orden-trabajo') {
            this.title = 'Ingresar Orde de Trabajo';
            this.showIcons = false;
        }
      }

    
    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };
    sidebarToggle() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };

    getTitle(){
        var titlee = this.location.prepareExternalUrl(this.location.path());
        if(titlee.charAt(0) === '#'){
            titlee = titlee.slice( 1 );
        } 

        return titlee;
       
    }

    logout(): void {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('menu');
    
        // Redirigir a la página de inicio de sesión
        this.router.navigate(['/login']);
    }


    navigateToUserEdit() {
       
        this.dataSharingService.setBooleanData(true);
        this.router.navigate(['user/user-edit']);
      }

    navigateToUserCreate(){
        this.router.navigate(['/user']);
    }
}
