import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = "http://172.16.1206:3024/api/crear-usuarios";
  private getUser = "http://172.16.1206:3024/api/get-all-users";
  private updatetUser = "http://172.16.1206:3024/api/editar-usuarios";
  private getUserNameUrl = "http://172.16.1206:3024/api/get-nombre-usuario";
  private deleteUserUrl = "http://172.16.1206:3024/api/delete-usuario";
  private claveActualUrl = "http://172.16.1206:3024/api/valida-clave-actual";
  private recuperarClaveUrl = "http://172.16.1206:3024/api/recuperar-password";
  private replaceClaveUrl = "http://172.16.1206:3024/api/replace-password-id";

  constructor(private http: HttpClient) {}

  createUser(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, { data });
  }

  getAllUser(): Observable<any> {
    return this.http.get<any>(this.getUser);
  }

  updateUser(dataEdit: any): Observable<any> {
    return this.http.put<any>(this.updatetUser, dataEdit);
  }

  // Método para verificar si el username ya existe
  usernameExists(username: string): Observable<boolean> {
    const url = `${this.getUserNameUrl}?username=${username}`;
    return this.http.get<boolean>(url);
  }

  deleteUser(data: any): Observable<any> {
    const params = new HttpParams({ fromObject: data });
    const url = `${this.deleteUserUrl}`;
    return this.http.delete<any>(url, { params });
  }

  claveActual(nombreUsuario: string, clave: string): Observable<any> {
    return this.http.post<any>(this.claveActualUrl, { nombreUsuario, clave });
  }

  recuperarClave(usuario: string): Observable<any> {
    return this.http.post<any>(this.recuperarClaveUrl, { usuario});
  }

  replacePassword(data: any): Observable<any> {
    return this.http.put<any>(this.replaceClaveUrl, { data});
  }


}
