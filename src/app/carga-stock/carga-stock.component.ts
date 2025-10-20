
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { SapServiceService } from 'app/services/saldos-sap/sap-service.service';



@Component({
  selector: 'app-carga-stock',
  templateUrl: './carga-stock.component.html',
  styleUrls: ['./carga-stock.component.scss']
})
export class CargaStockComponent implements OnInit {

  ordenes: any[] = [];
  ordenesFiltradas: any[] = [];
  filtro: string = '';
  categoriaSeleccionada: string = '';
  cargando: boolean = false;
  errorCarga: boolean = false;
  numeroOrdenBuscada: string = '';
  mostrarPanelBusqueda = false;
  terminoBusqueda = '';
  ordenesPanel: any[] = [];
  ordenesFiltradasPanel: any[] = [];
  obtenerOrdenesLivianas: any[] = [];
  botonesDeshabilitados: boolean = false;
  grupoSeleccionado: string = '';
  bodegaSeleccionado: string = '';
  esMuestra: boolean = false;
  anioSeleccionado!: number;
  mesSeleccionado!: number;
  fechaInventario!: string;


  categoriasAccesorios = [
  { codigo: 'C1', nombre: 'BATERIAS' },
  { codigo: 'C2', nombre: 'DISCOS' },
  { codigo: 'C3', nombre: 'ACEITES' }
];

  private ordenesSub: Subscription | null = null;

  constructor(private sapService: SapServiceService) {
  
    
  }

  ngOnInit(): void {
    // Carga todas las órdenes activas automáticamente al iniciar
   // this.cargarTodasLasOrdenes();
    //  this.cargarTodasLasOrdenes();
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


/*
obtenerSaldosStock(grupo: string, bodega: string, categoria: string , esMuestra: boolean) {
  this.cargando = true;



  this.sapService.obtenerSaldosStock(grupo, bodega, categoria, esMuestra).subscribe({
    next: (orden) => {
      console.log('📦 Stock:', JSON.stringify(orden, null, 2));

      const data = Array.isArray(orden.data) ? orden.data : [];

      if (data.length === 0) {
        console.warn('⚠️ No se encontraron datos en la respuesta de SAP:', data);
      }

      this.ordenes = data;
      this.ordenesFiltradas = [...data];
      this.cargando = false;
    },
    error: (err) => {
      console.error('❌ Error al buscar orden:', err);
      this.ordenes = [];
      this.ordenesFiltradas = [];
      this.cargando = false;
    }
  });
}

*/

obtenerSaldosStock(grupo: string, bodega: string, categoria: string , esMuestra: boolean) {
  this.cargando = true;

  this.sapService.obtenerSaldosStock(grupo, bodega, categoria, esMuestra).subscribe({
    next: (orden) => {
      console.log('📦 Stock:', JSON.stringify(orden, null, 2));

      const data = Array.isArray(orden.data) ? orden.data : [];

      if (data.length === 0) {
        console.warn('⚠️ No se encontraron datos en la respuesta de SAP:', data);
      }

      this.ordenes = data;
      this.ordenesFiltradas = [...data];

  
      if (data.length > 0) {
        this.enviarDatosASQL(); // Reutiliza tu función existente
      } else {
        this.cargando = false;
      }
    },
    error: (err) => {
      console.error('❌ Error al buscar orden:', err);
      this.ordenes = [];
      this.ordenesFiltradas = [];
      this.cargando = false;
    }
  });
}


obtenerSaldosStockUbicacion(anio: number,mes: number,fechaInventario: string,grupo: string, bodega: string, categoria: string , esMuestra: boolean)
 {


    if (!anio) {
    alert('⚠️ Debe seleccionar un anio antes de continuar');
    return;
  }

    if (!mes) {
    alert('⚠️ Debe seleccionar un Mes antes de continuar');
    return;
  }

     if (!fechaInventario) {
    alert('⚠️ Debe seleccionar un Mes antes de continuar');
    return;
  }


   if (!grupo) {
    alert('⚠️ Debe seleccionar un grupo antes de continuar');
    return;
  }



   if (!bodega) {
    alert('⚠️ Debe seleccionar un Bodega antes de continuar');
    return;
  }



  this.cargando = true;

  this.sapService.obtenerSaldosStockUbicacion(anio,mes,fechaInventario,grupo, bodega, categoria, esMuestra).subscribe({
    next: (orden) => {
      console.log('📦 Stock:', JSON.stringify(orden, null, 2));

      const data = Array.isArray(orden.data) ? orden.data : [];

      if (data.length === 0) {
        console.warn('⚠️ No se encontraron datos en la respuesta de SAP:', data);
      }

      
      
      this.ordenes = data;
      this.ordenesFiltradas = [...data];
      this.cargando = false;

       Swal.fire({
  icon: 'success',
  title: '¡Listo!',
  text: 'Datos enviados correctamente a SQL Server (BodegaMantenedor)',
  confirmButtonColor: '#3085d6',
  confirmButtonText: 'Aceptar'
});


      
  
 
        
    },
    error: (err) => {
      console.error('Error al buscar orden:', err);
      this.ordenes = [];
      this.ordenesFiltradas = [];
      this.cargando = false;
    }
  });
}



limpiarFiltros() {
  this.grupoSeleccionado = '';
  this.categoriaSeleccionada = '';
  this.bodegaSeleccionado = '';
  this.filtro = '';
  this.ordenesFiltradas = [...this.ordenes]; // Para mostrar todos los datos sin filtros
}


enviarDatosASQL() {
  if (!this.ordenesFiltradas || this.ordenesFiltradas.length === 0) {
    alert('No hay datos para enviar a SQL Server');
    return;
  }

  this.sapService.enviarSaldosStockASQL(this.ordenesFiltradas).subscribe({
    next: (res) => {
      console.log('✅ Datos enviados a SQL Server:', res);
//      alert('Datos enviados correctamente a SQL Server');

      Swal.fire({
  icon: 'success',
  title: '¡Listo!',
  text: 'Datos enviados correctamente a SQL Server',
  confirmButtonColor: '#3085d6',
  confirmButtonText: 'Aceptar'
});

    },
    error: (err) => {
      console.error('❌ Error al enviar datos a SQL Server:', err);
      alert('Error al enviar datos a SQL Server');
    }
  });

   this.cargando = false;
}



exportarSaldosStockAExcel(): void {
  const datosParaExportar = this.ordenesFiltradas.map(item => ({
    Bodega: item.Bodega,
    TipoItem: item.TipoItem,
    Item: item.Item,
    Descripcion: item.Descripcion,
    Obsoleto: item.Obsoleto,
    Vigencia: item.Vigencia,
    CodigoTipoProducto: item.CodigoTipoProducto,
    TipoProducto: item.TipoProducto,
    CategoriaProducto: item.CategoriaProducto,
    SaldoStock: item.SaldoStock,
    CostoUnitario: item.CostoUnitario,
    PrecioLista: item.PrecioLista,
    CodigoEan: item.CodigoEan,
    Tecnologia: item.Tecnologia,
    Ubicacion: item.Ubicacion,
    Moneda: item.Moneda,
    Voltaje: item.Voltaje
  }));

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'SaldosStock': worksheet },
    SheetNames: ['SaldosStock']
  };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, 'Saldos_Stock.xlsx');
}









}
