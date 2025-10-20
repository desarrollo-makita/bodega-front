import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyDataService } from 'app/services/data/my-data.service';
import { LoginService } from 'app/services/login/login.service';
import { PasswordRecoveryDialogComponent } from 'app/shared/password-recovery-dialog/password-recovery-dialog.component';
import { ReplaceTemporaryKeyComponent } from 'app/shared/replace-temporary-key/replace-temporary-key.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';
  showMessage : boolean= false;
  isLoading: boolean = false;
  showLogin:boolean;
  claveProvisoria:string;

  constructor(
    private fb: FormBuilder , 
    private router: Router , 
    private loginService: LoginService, 
    private dataService: MyDataService,
    public dialog: MatDialog ) {
    
      this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      clave: ['', Validators.required],
     

    });

    this.showLogin = true;
  }

  ngOnInit() {      
    sessionStorage.clear();}
  

  onSubmit() {
    if (this.loginForm.valid) {
      const { usuario, clave } = this.loginForm.value;
      this.claveProvisoria = clave;
      this.isLoading = true; // Mostrar el loader
      this.loginService.login(usuario, clave).subscribe({
        next: response => {
          console.log("response : " , response);
          // Guarda el token en el localStorage
          sessionStorage.setItem('menu', JSON.stringify(response.data.menu));
          
          this.dataService.setArrayData(response.data.menu);
          
          console.log('Login successful' , response);

          this.dataService.setUserObjectData(response.data);
          this.dataService.setCardCode(response.data.CardCode);
          sessionStorage.setItem('cardCode', response.data.CardCode);
            console.log('llego aca1');
          if(response.data.recuperarClave ===  1){
            console.log("responseeeeeeee : " , response.data);
            response.data.claveTemporal = this.claveProvisoria;
              this.openDialogReplaceKey('1300ms', '1300ms' , response.data);
            
          }else{
             console.log('llego aca2' , response.data);
            // Guarda el token en el localStorage
            sessionStorage.setItem('authToken', response.data.token);
          console.log('llego aca3');
            if(response.data.Rol === 'Consulta'){
              this.router.navigate(['/inventario']);
            }else if(response.data.Rol === 'Administrador'){
              this.router.navigate(['/user']);
            }else if(response.data.Rol === 'ST' || response.data.Rol === 'STM'){
               this.router.navigate(['/servicio-tecnico']);
            }else if(response.data.Rol === 'Operario'){
              this.errorMessage = 'Usuario sin permiso para ingresar al mantenedor';
            }else{
              this.errorMessage = 'Usuario Nuevo';
            }

          }
        },
        error: error => {
      
          console.log('Login failed', error);
          this.errorMessage = 'Login fallido. Verifique sus credenciales.'; // Actualizar el mensaje de error
          this.showMessage = true;
          this.isLoading = false; // Ocultar el loader
        },
        complete: () => {
          this.isLoading = false; // Ocultar el loader
        }
      });
    } else {
      console.log('Form not valid');
    }
  }

  clearUsuario() {
    if(this.showMessage){
      this.errorMessage = '';
      this.loginForm.reset();
      this.showMessage = false;
    }
  }

  openDialog(event: Event , enterAnimationDuration: string, exitAnimationDuration: string ): void {
    this.showLogin = false;
    event.preventDefault();  // Evita la navegación predeterminada
    const dialogRef = this.dialog.open(PasswordRecoveryDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró');
      this.showLogin = true;
    });
  }

  openDialogReplaceKey(enterAnimationDuration: string, exitAnimationDuration: string , data : any ): void {
    this.showLogin = false;
   
    const dialogRef = this.dialog.open(ReplaceTemporaryKeyComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: data ,
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró');
      this.showLogin = true;
     
    });
  }
}


 

