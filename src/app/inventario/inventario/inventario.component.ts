import { Component, OnInit } from '@angular/core';
import { InventarioService } from 'app/services/inventario/inventario.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {

  // Variables del formulario
  selectedMes: string;
  selectedPeriodo: string;
  selectedTipoItem: string;
  selectedLocal: string;

  mensaje: string = ''; // Mensaje para el usuario
  inventarioData: any = [];
  isLoading: boolean = false;
  showTable:boolean= false;

  p: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página

  saldoTotal : number = 0;
  conteoTotal : number = 0;
  
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

  tiposItems = [
    { descripcion: '01-Herramientas', codigo: '01' },
    { descripcion: '02-Kit', codigo: '02' },
    { descripcion: '03-Accesorios', codigo: '03' },
    { descripcion: '04-Repuestos', codigo: '04' }
  ];

  locales = [
    { descripcion: 'Casa Matriz ENEA', codigo: '01' },
    { descripcion: 'Serv. Tecnico Temuco', codigo: '03' },
    { descripcion: 'Centro de Servicios Antofagasta', codigo: '04' },
    { descripcion: 'Centro de Servicios Copiapo', codigo: '05' }
  ];

  
  constructor(private invetarioServices: InventarioService) {}

  ngOnInit(): void {
    this.selectedPeriodo = new Date().getFullYear().toString();
    this.selectedMes = (new Date().getMonth() + 1).toString().padStart(2, '0');
  }

  onSubmit() {
    const data = {
      periodo: this.selectedPeriodo,
      mes: this.selectedMes,
      tipoItem: this.selectedTipoItem,
      local: this.selectedLocal
    };
    this.isLoading = true;
    this.invetarioServices.consultaInventario(data.periodo, data.mes, data.tipoItem, data.local).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.isLoading = true;
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.mostrarMensaje("No se encontraron datos para los filtros seleccionados.");
          this.inventarioData = [];
          this.resetFormulario();
          this.showTable = false;
        } else {
          this.mensaje = ""; // Limpiar mensaje si hay datos
          this.inventarioData = response.data.recordset;
          this.showTable = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta:', error);
        this.mostrarMensaje("Ocurrió un error al obtener los datos.");
      },
      complete: () => {
    
        this.calcularTotales()
        this.isLoading = false;
      },
    });
  }


  calcularTotales() {
    // Sumamos los valores de "SaldoStock" y "Conteo" de cada fila
    this.saldoTotal = this.inventarioData.reduce((total, row) => total + row.SaldoStock, 0);
    this.conteoTotal = this.inventarioData.reduce((total, row) => total + row.Conteo, 0);

    console.log("Inventario : " , this.saldoTotal , this.conteoTotal);  
  }
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = "";
    }, 2000); // Ocultar mensaje después de 2 segundos
  }

  resetFormulario() {   
    this.selectedTipoItem = "";
    this.selectedLocal = "";
    this.inventarioData = [];
  }

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedTipoItem && this.selectedLocal);
  }

  onChange() {
    console.log('Mes seleccionado:', this.selectedMes);
    console.log('Tipo de ítem seleccionado:', this.selectedTipoItem);
    console.log('Local seleccionado:', this.selectedLocal);
    console.log('Periodo seleccionado:', this.selectedPeriodo);
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

  actualizarPaginacion() {
    console.log("Nueva cantidad de elementos por página:", this.itemsPerPage);
    this.p = 1; // Reinicia la paginación cuando cambia la cantidad de elementos por página
  }
}
