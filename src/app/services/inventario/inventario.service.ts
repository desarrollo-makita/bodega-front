import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  private apiUrl = 'http://172.16.1.206:3024/api/consultar-inventario'; // Reemplázalo con tu URL real

  constructor(private http: HttpClient) {}

  consultaInventario(periodo: string, mes: string, tipoItem: string, local: string): Observable<any> {
    const params = new HttpParams()
      .set('periodo', periodo.toString())
      .set('mes', mes.toString())
      .set('tipoItem', tipoItem)
      .set('local', local);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
