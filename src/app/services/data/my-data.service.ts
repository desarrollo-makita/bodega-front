// src/app/services/my-data.service.ts

import { Injectable } from '@angular/core';
import { User } from 'app/models/user.model';
import { BehaviorSubject } from 'rxjs';
 

@Injectable({
  providedIn: 'root'
})
export class MyDataService {

  private dataSource = new BehaviorSubject<string>(''); // Valor inicial para string
  private arrayDataSource = new BehaviorSubject<any[]>([]); // Valor inicial para array
  private userObjectSource = new BehaviorSubject<User | null>(null); // Valor inicial para el objeto
  private showEdit = new BehaviorSubject<boolean>(true); // Valor inicial para boolean
  
  // Observables expuestos para suscribirse
  stringData$ = this.dataSource.asObservable();
  arrayData$ = this.arrayDataSource.asObservable();
  userObjectData$ = this.userObjectSource.asObservable();
  booleanData$ = this.showEdit.asObservable();
  
  constructor() { }

  // Métodos para obtener los datos
  getBooleanData() {
    return this.booleanData$;
  }
  getStringData() {
    return this.stringData$;
  }

  getArrayData() {
    return this.arrayData$;
  }

  getUserObjectData() {
    return this.userObjectData$;
  }

  // Métodos para actualizar los datos
  setBooleanData(data: boolean) {
    this.showEdit.next(data);
  }
  setStringData(data: string) {
    this.dataSource.next(data);
  }

  setArrayData(data: any[]) {
    this.arrayDataSource.next(data);
  }

  setUserObjectData(data: User) {
    this.userObjectSource.next(data);
  }
}
