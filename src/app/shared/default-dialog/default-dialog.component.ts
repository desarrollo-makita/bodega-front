import { Component, Inject, OnInit } from '@angular/core';

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
  formularioData:any;
  codigo:any;
  mensajeDetalle:any;


  constructor(public dialogRef: MatDialogRef<DefaultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public garantia: any,
    private garantiasServices  : GarantiasService,
  private router: Router  ) { }

  ngOnInit(): void {

    console.log("data recibida :" , this.garantia);
    if(this.garantia.clave === 'enviarASAP'){
      this.enviarASAP(this.garantia.data);
    }else if(this.garantia.clave === 'ingresarOrden'){
      this.ingresarOrden(this.garantia.formData);
    }else if(this.garantia.clave === 'adjuntarArchivos') {
      this.adjuntarArchivosSTM(this.garantia.formData);
    }
    else if(this.garantia.clave === 'ingresarPedidos') {
      this.ingresarPedidos(this.garantia);
    }
  }



  enviarASAP(garantia : any){
    
    this.isLoading = true;
    this.mensajeCarga = 'Enviando a SAP...'
    let data = garantia;
    
    this.garantiasServices.enviarSap(data).subscribe({
      next: (response) => {
        console.log("responder envio a sap : ", response);
        if (!response.success) {
         
          this.errorMsg = true;
          this.responseMensaje = response.mensaje;
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
         
        
      },
    });

  }


  ingresarOrden(garantia : any){
    
    this.mensajeCarga = 'Ingresando Orden...'
    this.isLoading = true;
    this.garantiasServices.insertarGarantiaIntranet(garantia).subscribe({
      next: (response) => {
        this.formularioData = response.responseGarantia;

        if(this.formularioData.success === true){
            setTimeout(() => {
            this.isLoading = false;
            this.exito = true;
            this.responseMensaje =  this.formularioData.mensaje;
          }, 1000);
        }else{

          setTimeout(() => {
            this.isLoading = false;
            this.errorMsg = true;
            this.responseMensaje = 'No se pudo ingresar la garantia';
          }, 1000);

        }
      
       
        
      //   this.generarComprobante(formValue);
      },
       error: (error) => {
       
        this.errorMsg = true;
        this.responseMensaje = "erro en el servidor, contacte al administrador"
        
        
      },
      complete: () => {
        setTimeout(() => {
          this.dialogRef.close({ exito: true });
          this.router.navigate(['/servicio-tecnico']);
     
        }, 3000);

       // setTimeout(() => this.borrarMensaje(), 4000);
      }
    });
  }

  adjuntarArchivosSTM(garantia : any){
    
    console.log("gaAAAARANTIA _" , garantia);

    this.mensajeCarga = 'Ingresando Adjuntos...'
    this.isLoading = true;
    this.garantiasServices.adjuntarArchivosSTM(garantia).subscribe({
      next: (response) => {
        this.formularioData = response;

        if(this.formularioData.success === true){
            setTimeout(() => {
            this.isLoading = false;
            this.exito = true;
            this.responseMensaje =  this.formularioData.message;
          }, 1000);
        }else{

          setTimeout(() => {
            this.isLoading = false;
            this.errorMsg = true;
            this.responseMensaje = this.formularioData.message;
          }, 1000);

        }
        //   this.generarComprobante(formValue);
      },
       error: (error) => {
        console.log("error : " , error);
        this.isLoading = false;
        this.errorMsg = true;
        this.responseMensaje = "Error en el servidor, contacte al administrador";
      
      },
      complete: () => {
       

       // setTimeout(() => this.borrarMensaje(), 4000);
      }
    });
  }


  ingresarPedidos(garantia : any){
    
    this.isLoading = true;
    this.mensajeCarga = 'Cargando pedidos...'
    
    console.log("aca se debe generar el otro vouchedr con este dato" , garantia);
    this.garantiasServices.insertarPedidosIntranet(garantia).subscribe({
        next: (res) => {
          console.log("reeeeeeeeeees : " , res);
          
          const respuesta = res.responsePedidosGarantia;

            if (!respuesta) {
            // Si no existe la respuesta esperada, tratamos como error
            this.dialogRef.close({
              exito: false,
              mensaje: 'Respuesta inesperada del servidor. Intenta nuevamente.'
            });

            return;
          }
          
          this.codigo = respuesta.codigo;
          this.mensajeDetalle = respuesta.mensaje;
        
        },
        error: (err) => {
          // Error de red o del servidor
          this.isLoading= false;

            this.errorMsg = true;
            this.responseMensaje = "Error en el servidor, contacte al administrador"
            console.log("Error de red o servidor:", err);
          },
        complete: () => {
          
          if (this.codigo === -1) {
            this.errorMsg = true;
            this.responseMensaje = "Error en el servidor, contacte al administrador"
          } else if (this.codigo !== undefined) {
              this.isLoading= false;
              this.exito =  true;
              this.responseMensaje =  this.mensajeDetalle;
          }
          // Si this.codigo no fue asignado en ningún momento (caso raro)
          else {
            console.log("Error: código de respuesta no recibido.");
            this.dialogRef.close({
              exito: false,
              mensaje: 'No se recibió una respuesta válida del servidor.'
            });
          }
        }
      });
    
    }
  
  }
