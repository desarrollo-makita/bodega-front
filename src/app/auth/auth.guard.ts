import { Injectable } from '@angular/core';
import { CanActivate, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode} from 'jwt-decode';
import { MyDataService } from 'app/services/data/my-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private dataSharingService : MyDataService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    
    const isLoggedIn = sessionStorage.getItem('authToken'); // Verifica si hay un token en el almacenamiento local
    let isMenu = sessionStorage.getItem('menu');
    isMenu = JSON.parse(isMenu);
    
    if (!isLoggedIn) {
        this.router.navigate(['/login']); // Redirige al login si no está autenticado
      return false;
    }
    
    return true;
  }

 
    // Método para decodificar el token
    decodeToken(token: string): any {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
}
