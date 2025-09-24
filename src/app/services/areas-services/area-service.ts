import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreaService {

  private allUserUrl = "http://localhost:3024/api/get-all-areas";
  private deleteAreaUrl = "http://localhost:3024/api/delete-area";
  private insertAreaUrl = "http://localhost:3024/api/insertar-nueva-area";


  constructor(private http: HttpClient) {}

  getAllareas(): Observable<any> {
    return this.http.get<any>(this.allUserUrl);
  }

  deleteUser(data: any): Observable<any> {
    const params = new HttpParams({ fromObject: data });
    const url = `${this.deleteAreaUrl}`;
    return this.http.delete<any>(url, { params });
  }

  insertarArea(dataArea: any): Observable<any> {
    return this.http.post<any>(this.insertAreaUrl, { dataArea });
  }
}
