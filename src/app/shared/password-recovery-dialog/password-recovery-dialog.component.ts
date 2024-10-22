import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/services/user/user.service';

@Component({
  selector: 'app-password-recovery-dialog',
  templateUrl: './password-recovery-dialog.component.html',
  styleUrls: ['./password-recovery-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordRecoveryDialogComponent {
  username: string = '';
  mensajeUsuario : any;
  showMensaje : boolean =false;
  esError: boolean = false;
modal:boolean= false;

  constructor(public dialogRef: MatDialogRef<PasswordRecoveryDialogComponent> , private usuarioService : UserService) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    console.log("this.isername" , this.username);
    this.usuarioService.recuperarClave(this.username).subscribe({
      next: response => {
        console.log("Respuestaasas" , response);
        if(response.mensaje.existe){
          this.modal = true;
          this.esError = false;
          this.showMensaje = true;
          this.mensajeUsuario = "Se ha enviado una clave temporal a su correo";
        }else{
          this.esError = true;
          this.showMensaje = true;
          this.mensajeUsuario  = "Ingresar un usuario valido";
          
        }
        
      },
      error: error => {
    
       
      },
      complete: () => {
        if(this.modal){
          setTimeout(() => {
            this.dialogRef.close();
          }, 3000);
        }
       
      }
    });
   
    
  }
}
