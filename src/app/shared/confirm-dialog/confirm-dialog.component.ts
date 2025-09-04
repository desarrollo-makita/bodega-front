import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  email: string = '';
  numeroOfertaVenta:any;
  rutCliente:any;
  isLoading = false;
  exito = false;
  mensajeExito = '';
  errorMensaje = '';
  errorMsg : boolean = false;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  private garantiasServices  : GarantiasService  ) { }

  ngOnInit(): void {
   console.log("confirmacionnnnnnnnnn" , this.data);
   this.numeroOfertaVenta = this.data.DocNumAsociado;
   this.buscarClientes(this.data.RutServicioTecnico);
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

    // armamos los datos a enviar
    const datos = {
      ...this.data,
      emailServicioTecnico: this.email
    };
    
    this.garantiasServices.rechazarOfertaVenta(datos).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.exito = true;
        this.mensajeExito = 'Se ha rechazado la oferta de venta correctamente';
        // opcional cerrar automáticamente después de 1.5 seg
        setTimeout(() => {
          
          this.dialogRef.close({
            exito: true,
            mensaje: this.mensajeExito
          });
        }, 3000);
      },
      error: (err) => {
        this.errorMsg = true;
        console.error("❌ Error en la consulta:", err);
        this.isLoading = false;
        this.errorMensaje = "Ocurrió un error al rechazar la oferta de venta";
        setTimeout(() => {
          
          this.dialogRef.close({
            exito: true,
            mensaje: this.errorMensaje
          });
        }, 3000);
      },
      complete: () => {}
    });
  }
}
