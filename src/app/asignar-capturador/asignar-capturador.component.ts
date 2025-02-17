import { Component } from '@angular/core';

@Component({
  selector: 'app-asignar-capturador',
  templateUrl: './asignar-capturador.component.html',
  styleUrls: ['./asignar-capturador.component.scss']
})
export class AsignarCapturadorComponent {
  
  // Variables del formulario
  selectedMes: string;
  selectedPeriodo: string;
  selectedCapturador: string;
  selectedUsuario: string;

  capturadores: string[] = Array.from({ length: 31 }, (_, i) => `Honeywell-${(i + 1).toString().padStart(2, '0')}`);
  
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


  
  periodo: string = "2025";

  usuarioSeleccionado!: string;
  capturadorSeleccionado!: string;
  mesSeleccionado!: string;

  constructor() {}

  ngOnInit(): void {
    this.selectedPeriodo = new Date().getFullYear().toString();
    this.selectedMes = (new Date().getMonth() + 1).toString().padStart(2, '0');
  }

  onSubmit() {}
  
  onChange() {
    console.log('Mes seleccionado:', this.selectedMes);
  }

  getMesTooltip(codigo: string): string {
    const mesEncontrado = this.meses.find(mes => mes.codigo === codigo);
    return mesEncontrado ? mesEncontrado.nombre : '';
  }
   
  getUsuariosTooltip(codigo: string): string {
    const users = this.usuarios.find(item => item.nombre === codigo);
    return users ? users.nombre : '';
  }

}
