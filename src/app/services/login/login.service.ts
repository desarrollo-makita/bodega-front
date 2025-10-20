import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private apiUrl = "http://172.16.1.206:3024/api/login";
  //private apiUrl = "http://localhost:4300/api/login";

  constructor(private http: HttpClient) {}

  login(nombreUsuario: string, clave: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { nombreUsuario, clave });
  }
}
