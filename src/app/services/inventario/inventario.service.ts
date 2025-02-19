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

  constructor(private http: HttpClient) {}

  consultaInventario(periodo: string, mes: string, tipoItem: string, local: string): Observable<any> {
    const params = new HttpParams()
      .set('periodo', periodo.toString())
      .set('mes', mes.toString())
      .set('tipoItem', tipoItem)
      .set('local', local);

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
  
}
