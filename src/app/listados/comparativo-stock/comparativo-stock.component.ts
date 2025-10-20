import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SapServiceService } from 'app/services/saldos-sap/sap-service.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-comparativo-stock',
  templateUrl: './comparativo-stock.component.html',
  styleUrls: ['./comparativo-stock.component.scss']
})
export class ComparativoStockComponent implements OnInit {


  filtro: string = '';
  categoriaSeleccionada: string = '';

  errorCarga: boolean = false;

  mostrarPanelBusqueda = false;
  terminoBusqueda = '';
  inventario: any[] = [];
  inventarioFiltradas: any[] = [];
  cargando: boolean = false;
 
  botonesDeshabilitados: boolean = false;

  grupoSeleccionado: string = '';
  tipoItem: string = '';
  bodegaSeleccionado: string = '';

  anioSeleccionado!: number;
  mesSeleccionado!: number;
  fechaInventario!: string;




    constructor(private sapService: SapServiceService) {
      
    }
  

  ngOnInit(): void {
     const hoy = new Date();
    this.anioSeleccionado = hoy.getFullYear();  // 2025
    this.mesSeleccionado = hoy.getMonth() + 1; // 9
    this.fechaInventario = hoy.toISOString().split("T")[0]; // yyyy-mm-dd
  }

    convertirADate2(fechaISO: string): string {
  if (!fechaISO) return 'Fecha inválida';

  const match = fechaISO.match(/\/Date\((\d+)\)\//);
  let fecha: Date;

  if (match) {
    fecha = new Date(Number(match[1]));
  } else {
    // Intentamos parsear "21-07-2025" manualmente
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    } else {
      fecha = new Date(fechaISO);
    }
  }

  if (isNaN(fecha.getTime())) {
    return 'Fecha inválida';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}-${mes}-${anio}`;
}


obtenerubicacionesFiltrado(anio: number, mes: number, fechaInventario: string, tipoItem: string, bodega: string) {
  if (!anio || !mes || !fechaInventario || !tipoItem || !bodega) {
    alert('⚠️ Debe completar todos los filtros antes de continuar');
    return;
  }

  this.cargando = true;
  console.log('Llamando al backend con:', { anio, mes, fechaInventario, tipoItem, bodega });

  this.sapService.obtenerubicacionesFiltrado(anio, mes, fechaInventario, tipoItem, bodega).subscribe({
    next: (respuesta) => {
      console.log('📦 Inventario filtrado crudo:', respuesta);

      // Si el backend devuelve { data: [...] }
      const data = respuesta && Array.isArray(respuesta.data) ? respuesta.data : [];

      console.log('✅ Data procesada:', data);

      this.inventario = data;
      this.inventarioFiltradas = [...data];
      this.cargando = false;

      if (this.inventarioFiltradas.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos',
          text: 'No se encontraron registros para los filtros seleccionados',
          confirmButtonColor: '#3085d6',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '¡Listo!',
          text: `Se cargaron ${this.inventarioFiltradas.length} registros.`,
          confirmButtonColor: '#3085d6',
        });
      }

      console.log('📋 inventarioFiltradas final:', this.inventarioFiltradas);
    },
    error: (err) => {
      console.error('❌ Error al obtener inventario filtrado:', err);
      this.inventario = [];
      this.inventarioFiltradas = [];
      this.cargando = false;
    }
  });
}


exportarAExcel(): void {
  if (this.inventarioFiltradas.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Crear hoja Excel a partir del arreglo
  const hoja = XLSX.utils.json_to_sheet(this.inventarioFiltradas);

  // Crear libro y agregar hoja
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Ubicaciones');

  // Generar archivo Excel en memoria
  const excelBuffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });

  // Crear blob y descargar
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fecha = new Date().toISOString().split('T')[0];
  saveAs(blob, `Ubicaciones_${fecha}.xlsx`);
}



limpiarFiltros() {
  this.tipoItem = '';
  this.anioSeleccionado = null;
  this.mesSeleccionado = null;
  this.bodegaSeleccionado = '';
  this.filtro = '';
  this.inventarioFiltradas = [...this.inventario]; // Para mostrar todos los datos sin filtros
}

}
