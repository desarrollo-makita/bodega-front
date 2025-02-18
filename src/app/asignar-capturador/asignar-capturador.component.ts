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
  
  isLoading: boolean = false;
  capturadores: { nombre: string }[] = Array.from({ length: 30 }, (_, i) => ({ nombre: `Honeywell-${(i + 1).toString().padStart(2, '0')}` }));
  
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
    { nombre: 'Jorge Herrera'},
    { nombre: 'Beatriz Muñoz'},
    { nombre: 'Marcos Yañez'},
    { nombre: 'Luis Sanchez'},
  ];
  
  productos= [
    { nombre: 'HERRAMIENTAS' },
    { nombre: 'ACCESORIOS' },
    { nombre: 'REPUESTOS' }
  ];
  
  constructor(private inventarioService : InventarioService) {}

  ngOnInit(): void {
    this.selectedPeriodo = new Date().getFullYear().toString();
    this.selectedMes = (new Date().getMonth() + 1).toString().padStart(2, '0');
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

}
