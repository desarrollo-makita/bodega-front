import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService{
  private allActivityUrl = "http://172.16.2.170:3024/api/get-all-actividades";

  constructor(private http: HttpClient) {}

  getAllActividad(): Observable<any> {
    return this.http.get<any>(this.allActivityUrl);
  }

}
