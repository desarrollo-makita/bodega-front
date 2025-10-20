import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SapServiceService {

   private baseUrl = 'http://172.16.1.206:3000/api';

  constructor(private http: HttpClient) {}


  obtenerSaldosStock(grupo: string, bodega: string, categoria: string ,  esMuestra: boolean): Observable<any> 
  {
  
    const params = new HttpParams()
    .set('grupo', grupo)
    .set('bodega', bodega)
    .set('categoria', categoria)
    .set('esMuestra', esMuestra ? 'true' : 'false');

  //console.log(' Valor de docNum:', docNum); // <-- Asegúrate que no sea undefined o ''
  //const url = `${this.baseUrl}/SaldosStock?Bodega=${CodigoBodega}`;
  const url = `${this.baseUrl}/obtenerSaldosStock`;
  //console.log(' URL generada para obtenerSaldosStock:', url);
  return this.http.get<any>(url, { params });
  }


    obtenerSaldosStockUbicacion(anio: number,mes: number,fechaInventario: string,grupo: string, bodega: string, categoria: string ,  esMuestra: boolean): Observable<any> 
  {
  
    const params = new HttpParams()
    .set('anio', anio)
    .set('mes', mes)
    .set('fechaInventario', fechaInventario)
    .set('grupo', grupo)
    .set('bodega', bodega)
    .set('categoria', categoria)
    .set('esMuestra', esMuestra ? 'true' : 'false');

  //console.log(' Valor de docNum:', docNum); // <-- Asegúrate que no sea undefined o ''
  //const url = `${this.baseUrl}/SaldosStock?Bodega=${CodigoBodega}`;
  const url = `${this.baseUrl}/obtenerSaldosStockUbicacion`;
  //console.log(' URL generada para obtenerSaldosStock:', url);
  return this.http.get<any>(url, { params });
  }


  obtenerInventarioFiltrado(
  anio: number,
  mes: number,
  fechaInventario: string,
  tipoItem: string,
  bodega: string
): Observable<any> {

  const params = new HttpParams()
    .set('anio', anio)
    .set('mes', mes)
    .set('fechaInventario', fechaInventario)
    .set('tipoItem', tipoItem)
    .set('bodega', bodega);

  const url = `${this.baseUrl}/inventarioFiltrado`;

  return this.http.get<any>(url, { params });
}



obtenerStock(modelo: string): Observable<any> {
  const params = new HttpParams()
    .set('modelo', modelo);
  const url = `${this.baseUrl}/obtenerStock`;
  return this.http.get<any>(url, { params });
}

obtenerBodegas( sucursal: string,): Observable<any> {
  const params = new HttpParams()
    .set('sucursal', sucursal);
  const url = `${this.baseUrl}/obtenerBodegas`;
  return this.http.get<any>(url, { params });
}

obtenerCategorias( TipoProducto: string,): Observable<any> {
  const params = new HttpParams()
    .set('TipoProducto', TipoProducto);
  const url = `${this.baseUrl}/obtenerCategorias`;
  console.log(' URL generada para obtenerCategorias:', url);
  return this.http.get<any>(url, { params });
}




obtenerubicacionesFiltrado(
  anio: number,
  mes: number,
  fechaInventario: string,
  tipoItem: string,
  bodega: string
): Observable<any> {

  const params = new HttpParams()
    .set('anio', anio)
    .set('mes', mes)
    .set('fechaInventario', fechaInventario)
    .set('tipoItem', tipoItem)
    .set('bodega', bodega);

  const url = `${this.baseUrl}/obtenerubicacionesFiltrado`;

  return this.http.get<any>(url, { params });
}



  enviarSaldosStockASQL(datos: any[]) {
  return this.http.post<any>(`${this.baseUrl}/api/stock-sap`, datos);
}





obtenerSaldosSucursal(
  anio: number,
  mes: number,
  fechaInventario: string,
  sucursal: string,
  tipoItem: string,
  bodega: string,
  categoria: string
): Observable<any> {

  const params = new HttpParams()
    .set('anio', anio)
    .set('mes', mes)
    .set('fechaInventario', fechaInventario)
    .set('sucursal', sucursal)
    .set('tipoItem', tipoItem)
    .set('bodega', bodega)
    .set('categoria', categoria);

  const url = `${this.baseUrl}/obtenerSaldosSucursal`;

  return this.http.get<any>(url, { params });
}



 

}
