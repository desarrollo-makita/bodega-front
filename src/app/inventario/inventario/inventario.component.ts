import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {


  // Variables para almacenar los valores seleccionados
  selectedMes: string;
  selectedPeriodo: string;
  selectedTipoItem: string;
  selectedLocal: string;

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

  // Año actual


  // Tipos de Item
  tiposItems = [
    { descripcion: '01-Herramientas', codigo: '01' },
    { descripcion: '02-Kit', codigo: '02' },
    { descripcion: '03-Accesorios', codigo: '03' },
    { descripcion: '04-Repuestos', codigo: '04' }
  ];

  // Locales
  locales = [
    { descripcion: 'Casa Matriz ENEA', codigo: '01' },
    { descripcion: 'NO USAR Ex-Copiapo 365 Stgo Centro', codigo: '02' },
    { descripcion: 'Serv. Tecnico Temuco', codigo: '03' },
    { descripcion: 'Centro de Servicios Antofagasta', codigo: '04' },
    { descripcion: 'Centro de Servicios Copiapo', codigo: '05' }
  ];

  constructor() { }

  ngOnInit(): void {

    this.selectedPeriodo = new Date().getFullYear().toString(); 
    this.selectedMes = (new Date().getMonth() + 1).toString().padStart(2, '0');

  }
  
  onSubmit() {
    console.log('Formulario Inventario');  
  }

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedTipoItem && this.selectedLocal);
  }

  onChange() {
    console.log('Mes seleccionado:', this.selectedMes);
    console.log('Tipo de ítem seleccionado:', this.selectedTipoItem);
    console.log('Local seleccionado:', this.selectedLocal);
    console.log('selectedPeriodo:', this.selectedPeriodo);
  }
  
  getMesTooltip(codigo: string): string {
    const mesEncontrado = this.meses.find(mes => mes.codigo === codigo);
    return mesEncontrado ? mesEncontrado.nombre : '';
  }


  getTipoItemTooltip(codigo: string): string {
    const tipo = this.tiposItems.find(item => item.codigo === codigo);
    return tipo ? tipo.descripcion : '';
  }
  
  getLocalTooltip(codigo: string): string {
    const localEncontrado = this.locales.find(local => local.codigo === codigo);
    return localEncontrado ? localEncontrado.descripcion : '';
  }

}
