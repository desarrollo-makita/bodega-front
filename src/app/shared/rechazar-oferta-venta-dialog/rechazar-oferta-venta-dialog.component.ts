import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-rechazar-oferta-venta-dialog',
  templateUrl: './rechazar-oferta-venta-dialog.component.html',
  styleUrls: ['./rechazar-oferta-venta-dialog.component.scss']
})
export class RechazarOfertaVentaDialogComponent implements OnInit {
  email: string = '';
  numeroLLamada:any;
  rutCliente:any;
  isLoading = false;
  exito = false;
  mensajeExito = '';
  errorMensaje = '';
  errorMsg : boolean = false;
  dataOferta:any;
  comentario:string;


  constructor(public dialogRef: MatDialogRef<RechazarOfertaVentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,  
  private garantiasServices  : GarantiasService  ) { }

  ngOnInit(): void {
   console.log("confirmacionnnnnnnnnn" , this.data);
   this.numeroLLamada = this.data.DocumentNumber;
   // obtenemos los datos del cliente
   //this.buscarClientes(this.data.CustomerCode);

   // obtenemos los datos de la oferta
   //this.obtenerOfertaVenta(this.data.ServiceCallID);
  }
   
  validarComentario(){
     this.data.comentarioRechazo = this.comentario;
    
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
    console.log("datoooooooooooosssssadgfdf", datos);

    this.garantiasServices.rechazarOfertaVenta(datos).subscribe({
      next: () => {
      
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
              this.isLoading = true;
          this.dialogRef.close({ exito: false, mensaje: this.errorMensaje });
        }, 3000);
      }
    });

  }



}
