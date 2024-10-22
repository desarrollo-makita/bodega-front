import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { UserService } from 'app/services/user/user.service';

@Component({
  selector: 'app-replace-temporary-key',
  templateUrl: './replace-temporary-key.component.html',
  styleUrls: ['./replace-temporary-key.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReplaceTemporaryKeyComponent implements OnInit {
  claveTemporal: string;
  passwordTemporal: string;
  showCheckVerify: boolean = false;
  nuevaClave: string;
  hasUpperCase: boolean = false;
  hasSpecialCharacter: boolean = false;
  hasMinLength: boolean = false;
  hasNumber: boolean = false;
  showInfoClave: boolean = false;
  showVeryfiPassword: boolean = false;
  showMensajeFinal: boolean = false;
  showMensajeFinalError: boolean = false;

  key:string;


  constructor(
    public dialogRef: MatDialogRef<ReplaceTemporaryKeyComponent>,
    @Inject(MAT_DIALOG_DATA) 
    public data: any , 
    private userService : UserService , 
    private authService: AuthGuard,) { 
      
      console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeee : " , data);
      this.claveTemporal = data.claveTemporal;
      this.key =  data.token;
    }

  ngOnInit(): void {
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.passwordTemporal = inputElement.value;
    if(this.passwordTemporal  === this.claveTemporal  ){
      this.showCheckVerify =  true;
    }else{
      this.showCheckVerify = false;
    }
  }

  onPasswordInput(password: string) {
    this.nuevaClave = password;
    this.hasUpperCase = /[A-Z]/.test(this.nuevaClave);
    this.hasSpecialCharacter = /[\W_]/.test(this.nuevaClave); // Carácter especial
    this.hasMinLength = this.nuevaClave.length >= 8;
    this.hasNumber = /\d/.test(this.nuevaClave); // Verifica que contenga un número

    if (
      this.hasUpperCase &&
      this.hasSpecialCharacter &&
      this.hasMinLength &&
      this.hasNumber
    ) {
      this.showInfoClave = true; // Establece el valor si la contraseña es válida
    } else {
      this.showInfoClave = false;
    }

  }

  confirmarCLave(repeatClave : string){

    if(this.nuevaClave === repeatClave){
      this.showVeryfiPassword= true;
    }else{
      this.showVeryfiPassword= false;
    }
  }

  enviaCambioClave(){

    sessionStorage.setItem('authToken', this.key);
    const token = sessionStorage.getItem("authToken");

    const decodedToken = this.authService.decodeToken(token);
    
    const data = {
      idUsuario: decodedToken.id,
      password: this.nuevaClave
      
    }
    
    this.userService.replacePassword(data).subscribe({
      next: response => {
       console.log("response : " , response );

       this.showMensajeFinal = true;

       setTimeout(() => {
        this.showMensajeFinal = false;
        this.onClose()
      }, 2000);
        
      },
      error: error => {
        this.showMensajeFinalError = true;
        setTimeout(() => {
          this.showMensajeFinalError = false;
          this.onClose()
        }, 2000);
        
      },
      complete: () => {
       
      }
    })
  }


  onClose(): void {
    this.dialogRef.close();
  }

 

}
