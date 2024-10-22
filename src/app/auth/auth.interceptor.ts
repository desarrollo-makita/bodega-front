import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar la solicitud para agregar el token de autorización
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${this.getToken()}`
      }
    });

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejo general de errores
        this.handleError(error);
        return throwError(error);
      })
    );
  }

  private getToken(): string {
    // Recuperar el token de almacenamiento local o de algún servicio

    return sessionStorage.getItem('authToken') || '';
    
  }

  private handleError(error: HttpErrorResponse): void {
    // Manejo de errores HTTP
    console.log('Error en la solicitud', error);

    // Manejo de errores específicos por código de estado
    switch (error.status) {
      case 401:
        console.log('No autorizado - Error 401');
       
        // Redirigir a la página de login, por ejemplo
        break;
      case 403:
        console.log('Prohibido - Error 403');
       
        break;
      case 404:
        console.log('No encontrado - Error 404');
      
        break;
      case 500:
        console.log('Error en el servidor - Error 500');
      
        break;
      default:
        console.log('Error desconocido');
        break;
    }
  }
}
