import { Component } from '@angular/core';
import { InventarioService } from 'app/services/inventario/inventario.service';

@Component({
  selector: 'app-asignar-capturador',
  templateUrl: './asignar-capturador.component.html',
  styleUrls: ['./asignar-capturador.component.scss']
})
export class AsignarCapturadorComponent {
  
  // Variables del formulario
  selectedPeriodo: string;
  selectedMes: string;
  selectedUsuario: string;
  selectedCapturador: string;
  selectedProducto: string;
  mensaje: string = ''; // Mensaje para el usuario
  tipoMensaje: string = ''; // Tipo de mensaje para el usuario

  asignaciones: any[] = [];
  
  isLoading: boolean = false;
  capturadores: { nombre: string }[] = Array.from({ length: 45 }, (_, i) => ({ nombre: `Honeywell-${(i + 1).toString().padStart(2, '0')}` }));
  
  meses = [
    { nombre: 'Enero', codigo: '01' },
    { nombre: 'Febrero', codigo: '02' },
    { nombre: 'Marzo', codigo: '03' },
    { nombre: 'Abril', codigo: '04' },
    { nombre: 'Mayo', codigo: '05' },
    { nombre: 'Junio', codigo: '06' },
    { nombre: 'Julio', codigo: '07' },
    { nombre: 'Agosto', codigo: '08' },
    { nombre: 'Septiembre', codigo: '09' },
    { nombre: 'Octubre', codigo: '10' },
    { nombre: 'Noviembre', codigo: '11' },
    { nombre: 'Diciembre', codigo: '12' }
  ];

  usuarios = [
    { nombre: 'Adid Medina' },
    { nombre: 'Adrian Ahumada' },
    { nombre: 'Alan Salas' },
    { nombre: 'Alvaro Cardenas' },
    { nombre: 'Alvaro Embry' },
    { nombre: 'Alvaro Jara' },
    { nombre: 'Amanda Quiroga' },
    { nombre: 'Ana Gonzalez' },
    { nombre: 'Ana Villacorta' },
    { nombre: 'Andres Riquelme' },
    { nombre: 'Bastian Ampuero' },
    { nombre: 'Bastian Olivares' },
    { nombre: 'Carla Garrido' },
    { nombre: 'Carlos Cabrera' },
    { nombre: 'Carolina Cifuentes' },
    { nombre: 'Cesar Pereira' },
    { nombre: 'Cesar Sequea' },
    { nombre: 'Claudia Ferrada' },
    { nombre: 'David Leiva' },
    { nombre: 'Diego Uribe' },
    { nombre: 'Dylan Torres' },
    { nombre: 'Erick Ramirez' },
    { nombre: 'Eduardo Miranda' },
    { nombre: 'Fabian Molina' },
    { nombre: 'Felipe Aravena' },
    { nombre: 'Felipe Valenzuela' },
    { nombre: 'Franco Ibarra' },
    { nombre: 'Galo Azocar' },
    { nombre: 'Gonzalo Montt' },
    { nombre: 'Guillermo Pinto' },
    { nombre: 'Isadora Maggio' },
    { nombre: 'Jaime Gonzalez' },
    { nombre: 'Javiera Badilla' },
    { nombre: 'Joaquin Montenegro' },
    { nombre: 'Jorge Guerra' },
    { nombre: 'Jose Castillo' },
    { nombre: 'Jose Vasquez' },
    { nombre: 'Juan Toro' },
    { nombre: 'Juan Valenzuela' },
    { nombre: 'Leslie Coñoman' },
    { nombre: 'Marisela Jara' },
    { nombre: 'Matias Benavides' },
    { nombre: 'Miguel Garau' },
    { nombre: 'Nelson Romero' },
    { nombre: 'Pablo Quimen' },
    { nombre: 'Patricio Ramirez' },
    { nombre: 'Roberto Salgado' },
    { nombre: 'Roxana Lagos' }
];

  productos= [
    { nombre: '01-HERRAMIENTAS' },
    { nombre: '03-ACCESORIOS' },
    { nombre: '04-REPUESTOS' }
  ];
 
  constructor(private inventarioService : InventarioService) {}

  ngOnInit(): void {
    this.selectedPeriodo = new Date().getFullYear().toString();
    this.selectedMes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    this.cargarAsignaciones();
  }

  onSubmit() {
    
    this.borrarMensaje();
    this.isLoading = true;
    const asignacion = {
      periodo: this.selectedPeriodo,
      mes: this.selectedMes,
      usuario: this.selectedUsuario,
      capturador: this.selectedCapturador,
      producto: this.selectedProducto
    };

    this.inventarioService.asignarCapturador(asignacion).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
      },
      error: (error) => {
 

        setTimeout(() => {
          this.mensaje = `Error  ${JSON.stringify( error.error.error)}`;
          this.tipoMensaje = 'error';
          this.isLoading = false;
          this.resetFormulario();
        }, 1000); 
       
      },
      complete: () => {
      
        setTimeout(() => {
          this.mensaje = '¡Asignación realizada con éxito!';
          this.tipoMensaje = 'success';// Muestra el loader al menos 1 segundo
          this.isLoading = false;
          this.cargarAsignaciones();
          this.resetFormulario();
          
        }, 1000); 
       
       
      },
    });
  }

  borrarMensaje() {
 
      this.mensaje = ''; // Limpiar el mensaje
      this.tipoMensaje = ''; // Limpiar el tipo de mensaje
    
  }

  
  onChange() {}

  getMesTooltip(codigo: string): string {
    const mesEncontrado = this.meses.find(mes => mes.codigo === codigo);
    return mesEncontrado ? mesEncontrado.nombre : '';
  }
   
  getUsuariosTooltip(codigo: string): string {
    const users = this.usuarios.find(item => item.nombre === codigo);
    return users ? users.nombre : '';
  }

  getCapturadorTooltip(codigo: string): string {
    const capturador = this.capturadores.find(item => item.nombre === codigo);
    return capturador ? capturador.nombre : '';
  }

  getProductoTooltip(codigo: string): string {
    const producto = this.productos.find(item => item.nombre === codigo);
    return producto ? producto.nombre : '';
  }


  resetFormulario() {   
    this.selectedUsuario = null;
    this.selectedCapturador = null;
    this.selectedProducto = null;
   
              
  }

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedUsuario && this.selectedCapturador && this.selectedProducto);
  }


  cargarAsignaciones() {
   
    this.inventarioService.obtenerAsignaciones().subscribe({
      next: (response) => {
        console.log('Respuesta obtenerAsignaciones  - servidor:', response);
        this.asignaciones = response.data;
        
      },
      error: (error) => {
 

        setTimeout(() => {
          this.mensaje = `Error  ${JSON.stringify( error.error.error)}`;
          this.tipoMensaje = 'error';
        
          this.resetFormulario();
        }, 1000); 
       
      },
      complete: () => {
        console.log('Proceso exitoso');
        setTimeout(() => {
          this.borrarMensaje();
        },1000);
 
       
      },
    });
  }

   // Función para eliminar asignación
  eliminarAsignacion(asignacion: any): void {
    this.isLoading = true;
    this.inventarioService.eliminarAsignacion(asignacion).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
      },
      error: (error) => {
        setTimeout(() => {
          this.mensaje = `Error  ${JSON.stringify( error.error.error)}`;
          this.tipoMensaje = 'error';
      
        }, 1000); 
        
      },
      complete: () => {
        
        setTimeout(() => {
          this.mensaje = '¡Asignación eliminada con éxito!';
          this.tipoMensaje = 'success';// Muestra el loader al menos 1 segundo
          this.isLoading = false;
          this.cargarAsignaciones();
          
        }, 1000); 
      },
    });
  }
}
