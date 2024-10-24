import { Component, OnInit } from '@angular/core';
import { BitacoraUbicacionesService } from 'app/services/bitacora-services/bitacora-ubicaciones.service';
import moment from 'moment';

@Component({
  selector: 'app-bitacora-ubicaciones',
  templateUrl: './bitacora-ubicaciones.component.html',
  styleUrls: ['./bitacora-ubicaciones.component.scss']
})
export class BitacoraUbicacionesComponent implements OnInit {
  
  fecha: string;  // Variable para almacenar la fecha seleccionada
  message:string;
  bitacoraUbicacionesList:any=[];
  showTable:boolean= false;

  isLoading: boolean = false;

  constructor(private bitacoraServices : BitacoraUbicacionesService) { }

  ngOnInit(): void {
  }

  
  onSubmit() {
    console.log("Fecha seleccionada:", this.fecha);
    this.isLoading = true;
    this.bitacoraServices.getRegistroUbicaciones(this.fecha).subscribe({
      next: (response) => {
        console.log(response)
        if (!response.data) {
          // Si no hay datos, mostrar el mensaje
          this.message = "No se registra información para esa fecha.";
          this.showTable = false;
        } else {
          // Si hay datos, limpiar el mensaje
          this.message = "";
          this.bitacoraUbicacionesList = response.data;
          this.showTable = true;
        }
       
      },
      error: (error) => {
        console.error('Error:', error);
        this.message = "Ocurrió un error al consultar la información.";
      },
      complete: () => {
        /*setTimeout(() => {
          this.isLoading = false;
        }, 2000);*/
        this.isLoading = false;
      },
    });

    
    
  }

  formatDate(date: string): string {
    return moment(date).format('DD/MM/YYYY HH:mm');
  }

}
