import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GarantiasService {

    private obtenerGarantiasEstadoURL = "http://localhost:3026/api/obtener-garantias-estado";
    private obtenerGarantiasIntranet = "http://localhost:3026/api/obtener-garantias-estado-intranet";
    private insertarGarantiasIntranet = "http://localhost:3026/api/insertar-garantias-intranet";
    private buscarItemURL = "http://localhost:3026/api/buscar-item-formulario";
    private buscarComunasURL = "http://localhost:3026/api/obtener-comunas";
    private buscarClientesURL = "http://localhost:3026/api/obtener-clientes";
    private buscarRepuestosAccesoriosURL = "http://localhost:3026/api/buscar-item-repuesto-accesorio";
    private insertarPedidosIntranetURL = "http://localhost:3026/api/insertar-pedido-garantia-intranet"
    private obtenerDetalleGarantiasIntranetURL = "http://localhost:3026/api/obtener-detalle-garantia-intranet";


  constructor(private http: HttpClient) {}

  getGarantiasPorEstado(estado: string): Observable<any> {
    const url = `${this.obtenerGarantiasEstadoURL}/${estado}`;
    return this.http.get<any>(url);
  }  
  
  getGarantiasPorEstadoIntranet(estado: string): Observable<any> {
    const url = `${this.obtenerGarantiasIntranet}/${estado}`;
    return this.http.get<any>(url);
  }

  
  insertarGarantiaIntranet(data : any): Observable<any> {
    return this.http.post<any>(this.insertarGarantiasIntranet, { data });
  }

  buscarItems(filtro: string): Observable<any> {
    const url = `${this.buscarItemURL}`;
    const params = new HttpParams().set('query', filtro);
    return this.http.get<any>(url, { params });
  }

   buscarRepuestosAccesorios(filtro: string): Observable<any> {
    const url = `${this.buscarRepuestosAccesoriosURL}`;
    const params = new HttpParams().set('query', filtro);
    return this.http.get<any>(url, { params });
  }

   getComunas(codigo: number): Observable<any> {
    const url = `${this.buscarComunasURL}/${codigo}`;
    return this.http.get<any>(url);
  } 


  getClientes(codigo: number): Observable<any> {
    const url = `${this.buscarClientesURL}/${codigo}`;
    return this.http.get<any>(url);
  } 


  insertarPedidosIntranet(data : any): Observable<any> {
    return this.http.post<any>(this.insertarPedidosIntranetURL, { data });
  }


    getGarantiasDetallesIntranet(idPedido: string): Observable<any> {
      const url = `${this.obtenerDetalleGarantiasIntranetURL}/${idPedido}`;
      return this.http.get<any>(url);
    }


  
}
