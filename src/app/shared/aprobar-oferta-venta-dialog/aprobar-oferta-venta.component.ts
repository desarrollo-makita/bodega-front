import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RechazarOfertaVentaDialogComponent } from '../rechazar-oferta-venta-dialog/rechazar-oferta-venta-dialog.component';
import { GarantiasService } from 'app/services/garantias/garantias.service';

@Component({
  selector: 'app-aprobar-oferta-venta',
  templateUrl: './aprobar-oferta-venta.component.html',
  styleUrls: ['./aprobar-oferta-venta.component.scss']
})
export class AprobarOfertaVentaComponent implements OnInit {
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
  ordenCreada: any;

 constructor(public dialogRef: MatDialogRef<RechazarOfertaVentaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,  
              private garantiasServices  : GarantiasService  
            ) { 

            }

  ngOnInit(): void {
    console.log(" aprobacion : " , this.data);
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  confirmar() {
    if (!this.isValidEmail(this.email)) return;

    this.isLoading = true;

    // Arma los datos en el formato esperado por el backend
    const data = {
      data: {
        success: true,
        customerCode: this.data.rutCliente,
        llamada: [
          {
            DocEntry: this.data.DocEntry ?? 0,           // si aún no lo tienes, usa 0
            DocumentNumber: this.data.DocumentNumber ?? 0, 
            Pedido: this.data.Pedido.map((item: any) => ({
              LineNum: item.LineNum ?? 0,
              ItemCode: item.ItemCode,
              ItemDescription: item.ItemDescription,
              Quantity: item.Quantity,
              Price: item.Price,
              WarehouseCode: item.WarehouseCode
            })),
            Comments: this.comentario ?? "Oferta aprobada"
          }
        ]
      },
      emailServicioTecnico: this.email
    };

   // console.log("Request armado:", JSON.stringify(data, null, 2));
   
   this.garantiasServices.aprobarOfertaVenta(data).subscribe({
      next: (response) => {
        console.log("respuesta desde la aprobacion : " ,response );
      this.ordenCreada = response.orden.DocNum;
      

       /* setTimeout(() => {
          this.dialogRef.close({ exito: true, mensaje: this.mensajeExito });
        }, 3000);*/
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = true;
        console.error("❌ Error al intentar aprobar ofertas:", err);
        this.errorMensaje = "Ocurrió un error al cerrar las ofertas abiertas";

        setTimeout(() => {
          this.isLoading = false;
          this.exito = false;
          this.errorMensaje = `ERRROR `;
         // this.dialogRef.close({ exito: false, mensaje: this.errorMensaje });
        }, 3000);
      },   complete: () => {
            
        setTimeout(() => {
              this.isLoading = false;
              this.exito = true;
              this.mensajeExito = `Se ha aprobado la oferta de venta, se creo la orden N° ${this.ordenCreada } `;
            // this.dialogRef.close({ exito: false, mensaje: this.errorMensaje });
            }, 3000);

        
        },
    });
  }



    validarComentario(){
     this.data.comentarioAprobacion = this.comentario;
    
  }
}
