import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BitacoraUbicacionesService {
  private bitacoraUrl = "http://172.16.1206:3024/api/obtener-bitacora-ubicacion-fecha/";
  constructor(private http: HttpClient) {}

  getRegistroUbicaciones(fecha): Observable<any> {
    const urlConFecha = `${this.bitacoraUrl}${fecha}`;
    
    // Hacer la solicitud GET con la URL completa
    return this.http.get<any>(urlConFecha);
  }

}
