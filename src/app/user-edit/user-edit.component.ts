import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { Router } from "@angular/router";
import { User } from "app/models/user.model";
import { ActividadService } from "app/services/actividad-services/actividad-service";
import { AreaService } from "app/services/areas-services/area-service";
import { MyDataService } from "app/services/data/my-data.service";
import { UserService } from "app/services/user/user.service";
import { ConfirmDialogComponent } from "app/shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-user-edit",
  templateUrl: "./user-edit.component.html",
  styleUrls: ["./user-edit.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class UserEditComponent implements OnInit {
  idUser: any;
  userFormEdit: FormGroup;
  users: any = [];
  fecha: string;
  dataUser: User;
  showTableEdit: boolean = true;
  showFormUpdate: boolean = false;
  successMessage: boolean = false;
  errorMessage: boolean = false;
  isLoading: boolean = false;
  fechaFin: any;
  showCambioClave: boolean = false;
  usuario: string;
  showOk: boolean = false;
  showError: boolean = false;
  showConfirmarClave: boolean = false;
  showErrorClave: boolean = false;

  //Variables que validan nueva clave
  password: string = "";
  hasUpperCase: boolean = false;
  hasSpecialCharacter: boolean = false;
  hasMinLength: boolean = false;
  hasNumber: boolean = false;
  claveActual: string;
  confirmarPassword: string;

  passwordStrength: string = "";
  strengthClass: string = "";

  private onChange: any = () => {};
  private onTouched: any = () => {};

  showPassword: boolean = false;
  isFieldEnabled: boolean = false;

  showConfirmaClave: boolean = false;

  progressBarClass: string = "";
  progressBarWidth: number = 0;

  areas: any[] = [];
  actividadList: any[] = [];

  selectedActividades: any[] = [];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private dataService: MyDataService,
    private dialog: MatDialog,
    private areaService:AreaService,
    private actividadService : ActividadService
  ) {
    this.asignarFecha();
  }

  ngOnInit() {
    this.dataService.getBooleanData().subscribe((e) => {
      this.showTableEdit = e;
    });

    this.userService.getAllUser().subscribe({
      next: (response) => {
        this.users = response.data;
        
      },
      error: (error) => {
        console.error("Error al obtener a los usuarios", error);
        // Lógica de manejo de errores
      },
      complete: () => {
        console.log("Obtener usuarios completada");
        // Lógica adicional que desees ejecutar cuando la operación se complete
      },
    });

    this.userFormEdit = this.fb.group({
      usuario: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      nombre: ["", Validators.required],
      apellidoPaterno: ["", Validators.required],
      apellidoMaterno: ["", Validators.required],
      fechaInicio: ["", Validators.required],
      usuarioActivo: [""],
      role: ["", Validators.required],
      area: ["", Validators.required],
      actividad: ["", Validators.required],
      password: [{ value: "", disabled: true }],
    });

    // Setear la fecha actual al cargar el componente
    const today = new Date().toISOString().substring(0, 10); // Formato 'YYYY-MM-DD'

    this.userFormEdit.get("fechaInicio")?.setValue(today);

    const currentDate = new Date(); // Fecha actual
    currentDate.setDate(currentDate.getDate() + 90); // Añade 90 días

    // Convertir la fecha a formato 'YYYY-MM-DD'
    const futureDate = currentDate.toISOString().substring(0, 10);
    this.fechaFin = futureDate;

    this.loadAreas();
    
    this.loadActividades();

  }
  asignarFecha() {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const fechaActual = new Date();
    const diaSemana = diasSemana[fechaActual.getDay()];
    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const año = fechaActual.getFullYear();

    this.fecha = `${diaSemana} ${dia} de ${mes} del ${año}`;
  }

  editUser(data) {
   
    console.log("request de usaurio a editar _: " , data);
   
    this.dataUser = data;
    
    this.selectedActividades = [...this.dataUser.actividad];
    
    this.selectedActividades = this.dataUser.actividad.map(act => ({
      ...act,
      codigoActividad: Number(act.codigoActividad) // Convertimos a numero para evitar conflictos de tipo
    }));
    
    
    const currentDate = new Date(); // Fecha actual
    currentDate.setDate(currentDate.getDate() + 90); // Añade 90 días

    // Convertir la fecha a formato 'YYYY-MM-DD'
    const futureDate = currentDate.toISOString().substring(0, 10);
    this.fechaFin = futureDate;

    this.idUser = this.dataUser.UsuarioID;

    // Convertir las fechas de dataUser a formato 'YYYY-MM-DD'
    const formattedFechaInicio = this.dataUser.FechaInicio.substring(0, 10); // 'YYYY-MM-DD'
    const formattedFechaFin = this.fechaFin; // 'YYYY-MM-DD'

    const dataReq = {
      usuario: this.dataUser.NombreUsuario,
      email: this.dataUser.Email,
      nombre: this.dataUser.Nombre,
      apellidoPaterno: this.dataUser.ApellidoPaterno,
      apellidoMaterno: this.dataUser.ApellidoMaterno,
      fechaInicio: formattedFechaInicio,
      fechaFin: formattedFechaFin,
      usuarioActivo: this.dataUser.Estado,
      role: this.dataUser.Rol,
      area: this.capitalizeWords(this.dataUser.Area),
      actividad: this.dataUser.actividad,
    };

    this.usuario = dataReq.usuario;
    
    this.userFormEdit.patchValue(dataReq);
    this.showTableEdit = false;
    this.showFormUpdate = true;
  }

  deleteUser(data) {
    this.dataUser = data;

    this.idUser = this.dataUser.UsuarioID;
    const dataReq = {
      usuario: this.dataUser.NombreUsuario,
      email: this.dataUser.Email,
      nombre: this.dataUser.Nombre,
      apellidoPaterno: this.dataUser.ApellidoPaterno,
      apellidoMaterno: this.dataUser.ApellidoMaterno,
      fechaInicio: this.dataUser.FechaInicio,
      fechaFin: this.dataUser.FechaFin,
      usuarioActivo: this.dataUser.Estado,
      role: this.dataUser.Rol,
      area: this.dataUser.Area,
      actividad: this.dataUser.actividad,
      action: "delete",
      idUsuario: this.idUser,
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "350px", // Ajusta el ancho según sea necesario
      data: { user: dataReq.usuario },
      enterAnimationDuration: "300ms",
      exitAnimationDuration: "300ms",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userService.deleteUser(dataReq).subscribe({
          next: () => {
            // Acción a realizar después de la eliminación exitosa

            this.successMessage = true;
            this.isLoading = true;
            setTimeout(() => {
              this.successMessage = false;
              this.errorMessage = false;

              this.loadUsers();
            }, 2000);
            // Aquí podrías actualizar la lista de usuarios o redirigir a otra página
          },
          error: (err) => {
            // Manejo de errores
            console.error("Error al eliminar el usuario", err);
          },
          complete: () => {
            // Acción a realizar cuando la eliminación se completa (opcional)
            console.log("Eliminación de usuario completada");
          },
        });
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }

  onEditSubmit() {
    let formData = this.userFormEdit.value;
   
    console.log("formData : ", formData);
    formData.IdUsuario = this.idUser;
    formData.fechaFin = this.fechaFin;
    formData.actividad =  this.selectedActividades;
    formData.clave = formData.password;
    console.log("request final a procesar  : ", formData);
   
    this.userService.updateUser(formData).subscribe({
      next: (response) => {
        console.log("respuestas : " , response);
        if (response.status != 200) {
          this.errorMessage = true;
          // Limpiar el formulario
          this.userFormEdit.reset();
        } else {
          // Mostrar mensaje de éxito
          this.successMessage = true;
          // Limpiar el formulario
          this.userFormEdit.reset();
        }

        setTimeout(() => {
          this.successMessage = false;
          this.errorMessage = false;
          this.showTableEdit = true;
          this.showFormUpdate = false;
          // Opcional: Recargar la tabla con los datos actualizados
          this.loadUsers();
        }, 2000);
      },
      error: (error) => {
        console.error("Error al editar el usuario", error);
        // Lógica de manejo de errores
      },
      complete: () => {
        console.log("Edicion de usuario completada" );
        // Lógica adicional que desees ejecutar cuando la operación se complete
      },
    });
  }

  loadUsers() {
    this.userService.getAllUser().subscribe({
      next: (response) => {
        this.isLoading = true;
        this.users = response.data;
      },
      error: (error) => {
        console.error("Error al obtener a los usuarios", error);
        if (error.status === 404) {
          this.isLoading = true;
          this.users = [];
          this.router.navigate(["/login"]);
        }
        // Lógica de manejo de errores
      },
      complete: () => {
        console.log("Obtener usuarios completada");
        this.isLoading = false;
        // Lógica adicional que desees ejecutar cuando la operación se complete
      },
    });
  }

  onToggleChange(event: MatSlideToggleChange): void {
    // Aquí puedes implementar la lógica que necesitas cuando cambia el estado.
    if (event.checked) {
      this.showCambioClave = true;
    } else {
      this.showCambioClave = false;
    }
  }

  onBlur(event: FocusEvent) {
    // Obtener el valor del campo de entrada
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;

    console.log("value" , this.usuario, value  );
    this.userService.claveActual(this.usuario, value).subscribe({
      next: (response) => {
        this.showOk = true;
        this.showError = false;
        this.isFieldEnabled = true;
        this.userFormEdit.get("password")?.enable();
      },
      error: (error) => {
        this.showError = true;
        this.showOk = false;
        this.userFormEdit.get("password")?.disable();
      },
      complete: () => {},
    });
  }

  onPasswordInput(password: string) {
    this.password = password;
    this.hasUpperCase = /[A-Z]/.test(this.password);
    this.hasSpecialCharacter = /[\W_]/.test(this.password); // Carácter especial
    this.hasMinLength = this.password.length >= 8;
    this.hasNumber = /\d/.test(this.password); // Verifica que contenga un número

    this.calculateStrength();
    this.onChange(this.password); // Notifica al formulario reactivo del cambio
    this.onTouched(); // Marca el control como tocado
    this.claveActual = this.password;
    if (
      this.hasUpperCase &&
      this.hasSpecialCharacter &&
      this.hasMinLength &&
      this.hasNumber
    ) {
      this.showConfirmaClave = true; // Establece el valor si la contraseña es válida
    } else {
      this.showConfirmaClave = false; // Establece otro valor si la contraseña no es válida
    }
  }

  confirmarClave(password: string) {
    this.password = password;
    this.confirmarPassword = this.password;

    this.comparaClave(this.claveActual, this.confirmarPassword);
  }

  calculateStrength() {
    const strengthPoints = [
      this.hasUpperCase,
      this.hasSpecialCharacter,
      this.hasMinLength,
      this.hasNumber,
    ].filter(Boolean).length;

    if (strengthPoints <= 1) {
      this.passwordStrength = "Clave Débil";
      this.progressBarClass = "bg-danger"; // Rojo para clave débil
      this.progressBarWidth = 25; // 25% de ancho
      this.strengthClass = "weak"; // Clase para clave débil
    } else if (strengthPoints === 2 || strengthPoints === 3) {
      this.passwordStrength = "Clave Media";
      this.progressBarClass = "bg-warning"; // Amarillo para clave media
      this.progressBarWidth = 50; // 50% de ancho
      this.strengthClass = "medium"; // Clase para clave media
    } else {
      this.passwordStrength = "Clave Fuerte";
      this.progressBarClass = "bg-success"; // Verde para clave fuerte
      this.progressBarWidth = 100; // 100% de ancho
      this.strengthClass = "strong"; // Clase para clave fuerte
    }
  }
  comparaClave(nuevaClave, confirmarClave) {
    if (nuevaClave === confirmarClave) {
      this.showConfirmarClave = true;
      this.showErrorClave = false;
    } else {
      this.showErrorClave = true;
      this.showConfirmarClave = false;
    }
  }

  onAreaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    
    const opcion = selectElement.value;

    switch (opcion) {
      case 'Herramientas':
        this.userFormEdit.get("email")?.setValue("herramientas@makita.cl");
        break;

      case 'Accesorios':
        this.userFormEdit.get("email")?.setValue("accesorios@makita.cl");
        break;

      case 'Recepcion':
        this.userFormEdit.get("email")?.setValue("recepcion@makita.cl");
        break;

      case 'Repuestos':
        this.userFormEdit.get("email")?.setValue("repuestos@makita.cl");
        break;

      default:
        console.log('Valor no manejado');
        break;
    }
    
   
  
  }

  loadAreas(){
    this.areaService.getAllareas().subscribe({
      next: (response) => {
        this.areas = response.data;
      },
      error: (error) => {
        console.error("Error al consultar las areas", error);
      },
      complete: () => {
        console.log("obtencion de Areas compeltada");
       
      },
    });
  }


  loadActividades(){
    this.actividadService.getAllActividad().subscribe({
      next: (response) => {
        this.actividadList = response.data;
      },
      error: (error) => {
        console.error("Error al consultar las actividades", error);
      },
      complete: () => {
        console.log("obtencion de Actividades compeltada");
       
      },
    });
  }

  onCheckboxChange(event: any, actividad: any) {

    const actividadObj = {
      nombreActividad: actividad.nombreActividad,
      codigoActividad: actividad.codigoActividad
    };

    if (event.target.checked) {
      // Si el checkbox está seleccionado, añadimos el objeto completo al arreglo
      this.selectedActividades.push(actividadObj);
    } else {
      // Si el checkbox no está seleccionado, eliminamos el objeto basado en 'codigoActividad'
      this.selectedActividades = this.selectedActividades.filter(act => act.codigoActividad !== actividad.codigoActividad);
    }

    console.log("asi queda mi arreglo de checkbox _: " , this.selectedActividades);
  
  
  }
  
  isActividadSelected(actividad): boolean {
    return this.selectedActividades.some(
      selected => selected.codigoActividad === actividad.codigoActividad
    );
  }

  capitalizeWords(text: string): string {
    if (!text) return "";
    return text
      .split(" ") // Divide el texto en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza la primera letra de cada palabra
      .join(" "); // Une las palabras nuevamente en una cadena
  }
}
