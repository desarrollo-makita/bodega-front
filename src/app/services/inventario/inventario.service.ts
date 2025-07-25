import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  private apiUrl = 'http://localhost:3024/api/consultar-inventario';
  private asignarUrl = 'http://localhost:3024/api/asignar-capturador'; 
  private getAssignmentUrl = 'http://localhost:3024/api/consultar-asignacion';
  private deleteAsignacionUrl = 'http://localhost:3024/api/delete-asignacion';
  private validarIncioInventarioUrl  = 'http://localhost:3024/api/validar-inicio-inventario';
  private obtenerBodegaUrl  = 'http://localhost:3024/api/consultar-grupo-bodega';
  private inicioInventarioUrl  = 'http://localhost:3024/api/iniciar-inventario';
  private actualizarSinCierreUrl = 'http://localhost:3024/api/actualizar-conteo-sin-cierre';
  private actualizarConCierreUrl = 'http://localhost:3024/api/actualizar-conteo-cierre';
  private validaCierreInvUrl = 'http://localhost:3024/api/validar-cierre-inventario';
  private validaTerminoInvUrl = 'http://localhost:3024/api/validar-termino-inventario';
  private consultarReconteoUrl = 'http://localhost:3024/api/consultar-reconteos';
  private iniciarReconteosUrl = 'http://localhost:3024/api/iniciar-reconteos';
  private asignarReconteosUrl = 'http://localhost:3024/api/asignar-reconteos';
  private validaCantidadReconteosUrl = 'http://localhost:3024/api/validar-cantidad-reconteos';
  private siguienteReconteoURL = 'http://localhost:3024/api/siguiente-reconteo';
  private almacenammientoUrl = 'http://localhost:3024/api/obtener-almacenamiento';
  private consultarResumenReconteoUrl = 'http://localhost:3024/api/obtener-resumen-reconteo';
  private terminarInventarioUrl  = 'http://localhost:3024/api/finalizar-inventario';


  constructor(private http: HttpClient) {}

  consultaInventario(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.apiUrl, { params });
  }

  consultaAmacen(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.almacenammientoUrl, { params });
  }


  asignarCapturador(data: any): Observable<any> {
    return this.http.post(this.asignarUrl, data);
  }

  obtenerAsignaciones(): Observable<any> {
    return this.http.get<any>(this.getAssignmentUrl);
  }

  eliminarAsignacion(capturador: string): Observable<any> {
    const params = new HttpParams().set('capturador', capturador);
    return this.http.delete<any>(this.deleteAsignacionUrl, { params });
  }

  validarInicioInventario(fechaInventario: string): Observable<any> {
    const url = `${this.validarIncioInventarioUrl}/${fechaInventario}`;
    return this.http.get<any>(url);
  }
  
  obtenerBodegas(): Observable<any> {
    return this.http.get<any>(this.obtenerBodegaUrl);
  }
  
//inicia inventario y carga saldos
  iniciarInventario(data: any): Observable<any> {
    return this.http.post(this.inicioInventarioUrl, data);
  }

  actualizarSaldosSinCierre(data: any): Observable<any> {
    return this.http.post(this.actualizarSinCierreUrl, data);
  }

  cierreInventario(data: any): Observable<any> {
    console.log('Request data:', data); // Imprime los datos antes de enviarlos
    return this.http.post(this.actualizarConCierreUrl, data);
  }

  validarCierreInventario(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.validaCierreInvUrl, { params });
  }

  validarTerminoInventario(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.validaTerminoInvUrl, { params });
  }

  consultarReconteo(data: any): Observable<any> {
    return this.http.post(this.consultarReconteoUrl, data);
  }

  iniciarReconteo(data: any): Observable<any> {
    return this.http.post(this.iniciarReconteosUrl, data);
  }


  asignarReconteos(data: any): Observable<any> {
    return this.http.post(this.asignarReconteosUrl, data);
  }


  validarCantidadReconteos(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.validaCantidadReconteosUrl, { params });
  }


  siguienteReconteo(data: any): Observable<any> {
    return this.http.post(this.siguienteReconteoURL, data);
  }

  consultarResumenReconteo(data): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', data.tipoItem)
      .set('numeroReconteo', data.numeroReconteo)
      .set('fechaInventario', data.fechaInventario);

    return this.http.get<any>(this.consultarResumenReconteoUrl, { params });
  }


  terminarInventario(data: any): Observable<any> {
    return this.http.post(this.terminarInventarioUrl, data);
  }
}
