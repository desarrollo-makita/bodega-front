
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SapServiceService } from 'app/services/saldos-sap/sap-service.service';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario-sucursal',
  templateUrl: './inventario-sucursal.component.html',
  styleUrls: ['./inventario-sucursal.component.scss']
})
export class InventarioSucursalComponent implements OnInit {


  filtro: string = '';


  errorCarga: boolean = false;

  mostrarPanelBusqueda = false;
  terminoBusqueda = '';
  inventario: any[] = [];
  inventarioFiltradas: any[] = [];
  cargando: boolean = false;

  bodegaSeleccionado: string = '';
  bodegas: any[] = [];
  codigoLocal: string = '04';


  categoriaSeleccionado: string = '';
  categorias: any[] = [];
 
  botonesDeshabilitados: boolean = false;

  grupoSeleccionado: string = '';
  tipoItem: string = '';
  localSeleccionado: string = '';
  sucursal: string = '';

  anioSeleccionado!: number;
  mesSeleccionado!: number;
  fechaInventario!: string;


   constructor(private sapService: SapServiceService) {}


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
    } 
    else
    {
    // Intentamos parsear "21-07-2025" manualmente
    const partes = fechaISO.split('-');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
    }
     else
    {
      fecha = new Date(fechaISO);
    }
    }

    if (isNaN(fecha.getTime())) 
    {
    return 'Fecha inválida';
    }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}-${mes}-${anio}`;
}

cargarBodegas(Sucursal: string): void {

    if (!Sucursal ) {
    alert('⚠️ Debe ingresar sucursal');
    return;
  }

    this.sapService.obtenerBodegas(Sucursal).subscribe({
    next: (respuesta) => {
      

      // Si el backend devuelve { data: [...] }
      const data = respuesta && Array.isArray(respuesta.data) ? respuesta.data : [];

    
      this.bodegas = data;
      this.cargando = false;

      if (this.bodegas.length === 0) {
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
          text: `Se cargaron ${this.bodegas.length} registros.`,
          confirmButtonColor: '#3085d6',
        });
      }

      
    },
    error: (err) => {
      console.error('❌ Error al obtener bodegas:', err);
      this.bodegas = [];
   
      this.cargando = false;
    }
  });

  }


   
  obtenerSaldosSucursal(anio: number, mes: number, fechaInventario: string, sucursal: string, bodega: string, tipoItem: string, categoria: string 
     )
     {
    if (!anio || !mes || !fechaInventario || !sucursal || !bodega || !tipoItem  || !categoria)  {
      alert('⚠️ Debe completar todos los filtros antes de continuar');
      return;
    }
  
    this.cargando = true;
    console.log('Llamando al backend con:', { anio, mes, fechaInventario, tipoItem, bodega });

    this.sapService.obtenerSaldosSucursal(anio, mes, fechaInventario, sucursal, bodega, tipoItem, categoria).subscribe({
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



categoriasSeleccionado(TipoProducto: string): void {
  if (!TipoProducto) {
    alert('⚠️ Debe ingresar TipoProducto');
    return;
  }

  this.cargando = true;

  this.sapService.obtenerCategorias(TipoProducto).subscribe({
    next: (respuesta) => {
      const data = respuesta && Array.isArray(respuesta.data) ? respuesta.data : [];
      this.categorias = data;
      this.cargando = false;

      if (this.categorias.length === 0) {
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
          text: `Se cargaron ${this.categorias.length} registros.`,
          confirmButtonColor: '#3085d6',
        });
      }
    },
    error: (err) => {
      console.error('❌ Error al obtener categorías:', err);
      this.categorias = [];
      this.cargando = false;
    }
  });
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
  this.sucursal = '';
  this.categoriaSeleccionado = '';
  this.inventarioFiltradas = [...this.inventario]; // Para mostrar todos los datos sin filtros
}





}
