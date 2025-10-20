import { Component, OnInit } from '@angular/core';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyDataService } from 'app/services/data/my-data.service';
import { SapServiceService } from 'app/services/saldos-sap/sap-service.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-consulta-stock',
  templateUrl: './consulta-stock.component.html',
  styleUrls: ['./consulta-stock.component.scss']
})
export class ConsultaStockComponent implements OnInit {

  consultaForm!: FormGroup;
  modelosFiltrados: any[] = [];
  mostrarSugerencias = false;
  isLoading: boolean = false;
  botonesDeshabilitados: boolean = false;
  inventario: any[] = [];
  inventarioFiltradas: any[] = [];

  constructor(
    private garantiasServices: GarantiasService,
   // private dataService: MyDataService,
    private fb: FormBuilder, 
    private sapService: SapServiceService
  ) {}

  ngOnInit(): void {
    this.consultaForm = this.fb.group({
      Modelo: ['', Validators.required],
      Descripcion: ['', Validators.required],
    });

    // Limpiar descripción si Modelo queda vacío
    this.consultaForm.get('Modelo')?.valueChanges.subscribe((valor) => {
      if (!valor) {
        this.consultaForm.patchValue({ Descripcion: '' });
      }
    });
  }

  // Enviar formulario
  onSubmit(): void {
    this.isLoading = true;

    if (!this.consultaForm.valid) {
      this.consultaForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // Lógica de envío aquí
    console.log('Formulario válido', this.consultaForm.value);

    this.isLoading = false;
  }

  // Buscar modelos según input
  buscarModelos() {
    let valor = this.consultaForm.get('Modelo')?.value;
    if (valor && valor.length >= 2) {
      valor = valor.toUpperCase();
      this.garantiasServices.buscarItems(valor).subscribe({
        next: (data) => {
          this.modelosFiltrados = data.items;
          this.mostrarSugerencias = true;
        },
        error: (err) => console.error('Error en búsqueda de modelos', err)
      });
    } else {
      this.modelosFiltrados = [];
      this.mostrarSugerencias = false;
    }
  }

  // Ocultar lista de sugerencias con delay
  ocultarListaConDelay() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }

  // Seleccionar modelo de la lista
  seleccionarModelo(item: any) {
    this.consultaForm.patchValue({ 
      Modelo: item.ItemCode,
      Descripcion: item.ItemName
    });
    this.modelosFiltrados = [];
    this.mostrarSugerencias = false;
  }


  obtenerInventarioFiltrado(modelo: string) {

    console.log('Click detectado. Valor de modelo:', modelo);

    if (!modelo ) {
      alert('⚠️ Debe ingresar item');
      return;
    }
  
    this.isLoading = true;

  
    this.sapService.obtenerStock(modelo).subscribe({
      next: (respuesta) => {
        console.log('📦 Inventario filtrado crudo:', respuesta);
  
        // Si el backend devuelve { data: [...] }
        const data = respuesta && Array.isArray(respuesta.data) ? respuesta.data : [];
  
        console.log('✅ Data procesada:', data);
  
        this.inventario = data;
        this.inventarioFiltradas = [...data];
        this.isLoading = false;
  
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
        this.isLoading = false;
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
    saveAs(blob, `Stock${fecha}.xlsx`);
  }
  
  

}
