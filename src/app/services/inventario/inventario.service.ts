import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  private apiUrl = 'http://172.16.1.206:3024/api/consultar-inventario';
  private asignarUrl = 'http://172.16.1.206:3024/api/asignar-capturador'; 
  private getAssignmentUrl = 'http://172.16.1.206:3024/api/consultar-asignacion';
  private deleteAsignacionUrl = 'http://172.16.1.206:3024/api/delete-asignacion';
  private validarIncioInventarioUrl  = 'http://172.16.1.206:3024/api/validar-inicio-inventario';
  private obtenerBodegaUrl  = 'http://172.16.1.206:3024/api/consultar-grupo-bodega';
  private inicioInventarioUrl  = 'http://172.16.1.206:3024/api/iniciar-inventario';
  private actualizarSinCierreUrl = 'http://172.16.1.206:3024/api/actualizar-conteo-sin-cierre';
  private actualizarConCierreUrl = 'http://172.16.1.206:3024/api/actualizar-conteo-cierre';
  private validaCierreInvUrl = 'http://172.16.1.206:3024/api/validar-cierre-inventario';
  private consultarReconteoUrl = 'http://172.16.1.206:3024/api/consultar-reconteos';
                                                               

  constructor(private http: HttpClient) {}

  consultaInventario(tipoItem: string, local: string , fechaInventario: string): Observable<any> {
    const params = new HttpParams()
      .set('tipoItem', tipoItem)
      .set('local', local)
      .set('fechaInventario', fechaInventario);

    return this.http.get<any>(this.apiUrl, { params });
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

  consultarReconteo(data: any): Observable<any> {
    return this.http.post(this.consultarReconteoUrl, data);
  }

  

}
