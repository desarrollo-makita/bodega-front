import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GarantiasService {

  private obtenerGarantiasEstadoURL = "http://localhost:3026/api/obtener-garantias-estado";

  constructor(private http: HttpClient) {}

  getGarantiasPorEstado(estado: string): Observable<any> {
    const url = `${this.obtenerGarantiasEstadoURL}/${estado}`;
    return this.http.get<any>(url);
  }
}
