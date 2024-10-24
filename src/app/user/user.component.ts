import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthGuard } from "app/auth/auth.guard";
import { User } from "app/models/user.model";
import { ActividadService } from "app/services/actividad-services/actividad-service";
import { AreaService } from "app/services/areas-services/area-service";
import { MyDataService } from "app/services/data/my-data.service";
import { UserService } from "app/services/user/user.service";
import { format } from "path";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.css"],
})
export class UserComponent implements OnInit {
  isActive: boolean = false; // Estado inicial del switch
  userForm: FormGroup;
  successMessage: boolean = false;
  showOtherSelects = true;

  nombre: any;
  fechaVigencia: any;
  rol: any;
  apellidoPaterno: any;
  apellidoMaterno: any;
  public vigencia: string = "";
  errorMessage: boolean = false;
  warningMessage: boolean = false;
  emailRespuesta: any;
  fechaFin: any;
  isLoading: boolean = false;
  isPasswordValid: boolean = false;
  emailCreacion: string;
  areas: any[] = [];

  selectedActivities: any[] = [];
  actividadList: any[] = [];
  
  constructor(
    private authService: AuthGuard,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private myDataService: MyDataService,
    private areaService: AreaService,
    private actividadService: ActividadService
  ) {}

  ngOnInit() {

    this.loadAreas();
    const token = sessionStorage.getItem("authToken");
    if (token) {
      const decodedToken = this.authService.decodeToken(token);

      console.log("decodeToken _: " , decodedToken);
      this.nombre = decodedToken.username;
      this.apellidoPaterno = decodedToken.apellidoPaterno;
      this.apellidoMaterno = decodedToken.ApellidoMaterno;
      this.rol = decodedToken.role;
      this.vigencia = this.calcularVigencia(decodedToken.fechaFin);

      if (decodedToken.role === "Consulta") {
        this.router.navigate(["/informes"]);
      }
    }

    this.userForm = this.fb.group({
      usuario: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      nombre: ["", Validators.required],
      apellidoPaterno: ["", Validators.required],
      apellidoMaterno: ["", Validators.required],
      fechaInicio: ["", Validators.required],
      password: ["", Validators.required],
      usuarioActivo: [false, Validators.requiredTrue],
      role: ["", Validators.required],
      area: ["", Validators.required],
      actividades: this.fb.array([], Validators.required) // FormArray para checkboxes
      
    });

    this.userForm.get("nombre").valueChanges.subscribe(() => {
      this.setUsuario();
    });

    this.userForm.get("apellidoPaterno").valueChanges.subscribe(() => {
      this.setUsuario();
    });

    this.userForm.get("apellidoMaterno").valueChanges.subscribe(() => {
      this.setUsuario();
    });

    // Setear la fecha actual al cargar el componente
    const today = new Date().toISOString().substring(0, 10); // Formato 'YYYY-MM-DD'

    this.userForm.get("fechaInicio")?.setValue(today);

    const currentDate = new Date(); // Fecha actual
    currentDate.setDate(currentDate.getDate() + 90); // Añade 90 días

    // Convertir la fecha a formato 'YYYY-MM-DD'
    const futureDate = currentDate.toISOString().substring(0, 10);
    this.fechaFin = futureDate;

    this.loadActividades();
    

  }

  setUsuario(): void {
    const nombre = this.userForm.get("nombre").value;
    const apellidoPaterno = this.userForm.get("apellidoPaterno").value;
    const apellidoMaterno = this.userForm.get("apellidoMaterno").value;

    if (nombre && apellidoPaterno) {
      // Extraer la primera letra del nombre y el primer apellido
      const primeraLetraNombre = nombre.trim().charAt(0).toLowerCase();
      const primerApellido = apellidoPaterno.trim().split(" ")[0].toLowerCase();
      let usuario = `${primeraLetraNombre}${primerApellido}`;

      // Llamar al servicio para verificar si el username existe
      this.userService.usernameExists(usuario).subscribe((exists) => {
        if (exists && apellidoMaterno) {
          // Si ya existe y hay un segundo apellido, agregar la primera letra del apellido materno
          const primeraLetraMaterno = apellidoMaterno
            .trim()
            .charAt(0)
            .toLowerCase();
          usuario += primeraLetraMaterno;
        }
        // Establecer el valor del campo usuario
        this.userForm.get("usuario").setValue(usuario);
      });
    }
  }

  onSubmit() {
    this.isLoading = true;
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      console.log("formData" , formData);
      const userData = {
        nombre: formData.nombre,
        apellidoPaterno: formData.apellidoPaterno ,
        apellidoMaterno : formData.apellidoMaterno,
        email: formData.email,
        area: formData.area,
        rol: formData.role,
        estado: formData.usuarioActivo ? "true" : "false",
        fechaInicio: formData.fechaInicio,
        fechaFin: this.fechaFin,
        nombreUsuario: formData.usuario,
        clave: formData.password,
        actividad: formData.actividades
      };

      // Suscribirse al observable devuelto por createUser
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          
          if (response.status != 200) {
            this.errorMessage = true;
            // Limpiar el formulario
            this.userForm.reset();
          } else if (
            response.status === 200 &&
            response.resul.output.StatusID === 1
          ) {
            this.warningMessage = true;
            this.emailRespuesta = response.resul.data.email;
          } else if (
            response.status === 200 &&
            response.resul.output.StatusID === 0
          ) {
            // Mostrar mensaje de éxito
            this.successMessage = true;
            // Limpiar el formulario
            setTimeout(() => {
              window.location.reload();
            }, 2000);


          }

          // Ocultar el mensaje después de 2 segundos
          setTimeout(() => {
            this.successMessage = false;
            this.errorMessage = false;
            this.warningMessage = false;
          }, 2000);
        },
        error: (error) => {
          console.error("Error al crear el usuario", error);
        },
        complete: () => {
          console.log("Creación de usuario completada");
          this.isLoading = false;
        },
      });
    } else {
      // Marca todos los controles como tocados para mostrar errores
      this.userForm.markAllAsTouched();
    }
  }

  onRoleChange(event: Event): void {
    const selectedRole = (event.target as HTMLSelectElement).value;
    this.showOtherSelects = selectedRole !== "Consulta";
  }

  calcularVigencia(fechaFin) {
    console.log("Fecha fin:", fechaFin);

    // Obtener la fecha de hoy sin horas, minutos y segundos
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    // Convertir la fecha de fin a un objeto Date y ajustar a la medianoche
    const fin = new Date(fechaFin);
    fin.setHours(0, 0, 0, 0);

    console.log("Fecha Actual:", fechaActual.toLocaleDateString());
    console.log("Fecha Fin:", fin.toLocaleDateString());

    // Calcular la diferencia en milisegundos
    const diferenciaMs = fin.getTime() - fechaActual.getTime();

    // Convertir a días (1000 ms * 60 seg * 60 min * 24 horas)
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)); // Usar Math.ceil para incluir el último día

    return `Vigencia hasta el ${fin.toLocaleDateString()} (${diferenciaDias} días)`;
  }

  capitalizeWords(text: string): string {
    if (!text) return "";
    return text
      .split(" ") // Divide el texto en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza la primera letra de cada palabra
      .join(" "); // Une las palabras nuevamente en una cadena
  }


  onAreaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    console.log('Valor seleccionado (evento):', selectElement.value);
    
    const opcion = selectElement.value;

    switch (opcion) {
      case 'Herramientas':
        this.userForm.get("email")?.setValue("herramientas@makita.cl");
        break;

      case 'Accesorios':
        this.userForm.get("email")?.setValue("accesorios@makita.cl");
        break;

      case 'Recepcion':
        this.userForm.get("email")?.setValue("recepcion@makita.cl");
        break;

      case 'Repuestos':
        this.userForm.get("email")?.setValue("repuestos@makita.cl");
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

  onCheckboxChange(event: any, actividad: any) {
    const actividadesFormArray = this.userForm.get('actividades') as FormArray;
  
    if (event.target.checked) {
      // Agregar el objeto actividad al FormArray
      actividadesFormArray.push(
        this.fb.group({
          nombreActividad: actividad.nombreActividad,
          codigoActividad: actividad.codigoActividad
        })
      );
    } else {
      // Eliminar la actividad desmarcada
      const index = actividadesFormArray.controls.findIndex(
        (ctrl) =>
          ctrl.value.nombreActividad === actividad.nombreActividad &&
          ctrl.value.codigoActividad === actividad.codigoActividad
      );
      if (index !== -1) {
        actividadesFormArray.removeAt(index);
      }
    }
  
    console.log(this.userForm.value.actividades); // Ver las actividades seleccionadas
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

  
}
