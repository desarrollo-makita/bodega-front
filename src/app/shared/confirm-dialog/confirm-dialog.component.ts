import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  email: string = '';
  numeroLLamada:any;
  rutCliente:any;
  isLoading = false;
  exito = false;
  mensajeExito = '';
  errorMensaje = '';
  errorMsg : boolean = false;
  dataOferta:any;
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  private garantiasServices  : GarantiasService  ) { }

  ngOnInit(): void {
   console.log("confirmacionnnnnnnnnn" , this.data);
   this.numeroLLamada = this.data.ServiceCallID;
   // obtenemos los datos del cliente
   this.buscarClientes(this.data.CustomerCode);

   // obtenemos los datos de la oferta
   this.obtenerOfertaVenta(this.data.ServiceCallID);
  }
   
  obtenerOfertaVenta(idLlamada:any){
    this.isLoading=  true;
    
    this.garantiasServices.obtenerOfertasVentas(idLlamada).subscribe({
      next: (response) => {
        console.log("esta sera la nueva data a mostrar directamente desde SAP" , response);
        
        if(response.llamada.length > 0){
          this.dataOferta =  response;
          this.data.detalleOferta =  this.dataOferta.llamada;
        }
      
      },
      error: (err) => {
      console.log("Error" , err);
      },
      complete: () => {
        this.isLoading= false;
      
      }
    });
  }


  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  buscarClientes(code: any) {
    
    console.log("code", code)
    let cardCode = code.startsWith('C') ? code.substring(1) : code;

    this.garantiasServices.getClientes(cardCode).subscribe({
      next: (response) => {
        console.log("response clientes:", response);
        // ✅ acceder al array correcto
        if (response && response.cliente && response.cliente.length > 0) {
          const cliente = response.cliente[0]; // tomamos el primer cliente del array
        } else {
          console.warn("No se encontró cliente con el código:", cardCode);
        }
      },
      error: (err) => console.error('Error en búsqueda de clientes', err)
    });
  }

  confirmar() {
    if (!this.isValidEmail(this.email)) return;

    this.isLoading = true;

    const datos = { ...this.data, emailServicioTecnico: this.email };
    console.log("datoooooooooooos", datos);

    this.garantiasServices.cerrarLLamadaServicio(datos).subscribe({
      next: () => {
        const ofertas = this.data || [];

        // Esperamos a que todas las ofertas abiertas se cierren
        this.cerrarOfertasAbiertas(datos).subscribe({
          next: () => {
            this.isLoading = false;
            this.exito = true;
            this.mensajeExito = 'Se ha cerrado la llamada y todas las ofertas abiertas correctamente';

            setTimeout(() => {
              this.dialogRef.close({ exito: true, mensaje: this.mensajeExito });
            }, 3000);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMsg = true;
            console.error("❌ Error cerrando ofertas:", err);
            this.errorMensaje = "Ocurrió un error al cerrar las ofertas abiertas";

            setTimeout(() => {
              this.dialogRef.close({ exito: false, mensaje: this.errorMensaje });
            }, 3000);
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = true;
        console.error("❌ Error cerrando la llamada de servicio:", err);
        this.errorMensaje = "Ocurrió un error al cerrar la llamada de servicio";

        setTimeout(() => {
          this.dialogRef.close({ exito: false, mensaje: this.errorMensaje });
        }, 3000);
      }
    });
  }

  cerrarOfertasAbiertas(ofertas:any) {
    console.log("ofertas" , ofertas)
    const observables = ofertas.detalleOferta
    .filter(oferta => oferta.Status === 'bost_Open')
    .map(oferta =>
      this.garantiasServices.cerrarOfertaVenta(ofertas).pipe(
        catchError(err => {
          console.error(`Error cerrando oferta ${oferta.DocumentNumber}`, err);
          return of(null); // Continuamos aunque falle una
        })
      )
    );

  if (observables.length === 0) {
    return of(null); // No hay ofertas abiertas, completamos inmediatamente
  }

  return forkJoin(observables); // Espera a que todas terminen
  }

}
