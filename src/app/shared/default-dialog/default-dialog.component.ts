import { Component, Inject, OnInit } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-default-dialog',
  templateUrl: './default-dialog.component.html',
  styleUrls: ['./default-dialog.component.scss']
})
export class DefaultDialogComponent implements OnInit {

  responseMensaje:any;
  isLoading:boolean= false;
  mensajeCarga:string;
  exito:boolean= false;
  errorMsg:boolean= false;
    formularioData:{};


   constructor(public dialogRef: MatDialogRef<DefaultDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public garantia: any,
      private garantiasServices  : GarantiasService,
    private router: Router  ) { }

  ngOnInit(): void {

    if(this.garantia.clave === 'enviarASAP'){
      this.enviarASAP(this.garantia.data);
    }else if(this.garantia.clave === 'ingresarOrden'){
      this.ingresarOrden(this.garantia.formData);
    }else{
      console.log("sin accion")
    }
    
  }



  enviarASAP(garantia : any){
    
    this.isLoading = true;
    this.mensajeCarga = 'Enviando a SAP...'
    let data = garantia.Id_Pedido;
    
    this.garantiasServices.enviarSap(data).subscribe({
      next: (response) => {
        console.log("responder envio a sap : ", response);
        if (response?.error?.error || response?.error) {
         
          this.errorMsg = true;
          this.responseMensaje = response?.error?.error || response?.error;
        }else {
          this.exito = true;
         // this.successMessage = true;
          this.responseMensaje = 'Enviado exitosamente a SAP'

        }
      },
      error: (error) => {
         this.isLoading = false;
        this.errorMsg = true;
        this.responseMensaje = "Fallo el servidor"
        console.error('Error en la consulta:', error);
         setTimeout(() => {
             this.dialogRef.close({ exito: true });
           }, 1500);
      },
      complete: () => {
        this.isLoading = false;
          setTimeout(() => {
             this.dialogRef.close({ exito: true });
           }, 1500);
           setTimeout(() => {
             this.dialogRef.close({ exito: true });
           }, 2100);
        
      },
    });

  }


  ingresarOrden(garantia : any){
    
    this.isLoading = true;
    this.mensajeCarga = 'Ingresando Orden...'
    this.garantiasServices.insertarGarantiaIntranet(garantia).subscribe({
      next: (response) => {
      this.formularioData = response;
      this.exito= true;
      this.responseMensaje = 'Garantía ingresada correctamente';
     //   this.generarComprobante(formValue);
      },
       error: (error) => {
        this.isLoading = false;
        this.errorMsg = true;
        this.responseMensaje = "erro en el servidor, contacte al administrador"
        
         setTimeout(() => {
             this.dialogRef.close({ exito: true });
           }, 1500);
      },
      complete: () => {
        
        setTimeout(() => {
         
            this.isLoading = false;
     
        }, 1500);

        setTimeout(() => {
         this.dialogRef.close({ exito: true });
          this.router.navigate(['/servicio-tecnico']);
     
        }, 2100);

       // setTimeout(() => this.borrarMensaje(), 4000);
      }
    });
  }

    

}
