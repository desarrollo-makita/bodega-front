import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GarantiasService } from 'app/services/garantias/garantias.service';

@Component({
  selector: 'app-consultar-stock-st',
  templateUrl: './consultar-stock-st.component.html',
  styleUrls: ['./consultar-stock-st.component.scss']
})
export class ConsultarStockStComponent implements OnInit {

  itemForm!: FormGroup;
  itemBusqueda: string = '';
  isLoading: boolean = false;
  showTable: boolean = false;
  modelosFiltrados: any[] = [];
  mostrarSugerencias: boolean = false;

  // Datos simulados
  datosStock = [
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "BOD01", "StockFinal": 11, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ANF01", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "CPO01", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ST01", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ST02", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ST03", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ST04", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "ST05", "StockFinal": 0, "Precio": 33228 },
    { "TipoItem": "HERRAMIENTAS", "Descripcion": "TAPA VENTILADOR P/BHX250", "Bodega": "TEM01", "StockFinal": 0, "Precio": 33228 }
  ];

  resultadosFiltrados: any[] = [];

  constructor(private fb: FormBuilder,
     private garantiasServices: GarantiasService,
  ) { }

  ngOnInit(): void {

        this.itemForm = this.fb.group({
          itemBusqueda: ['', Validators.required],
        });  
   }

onSubmit(): void {
  const item = this.itemForm.get('itemBusqueda')?.value?.toUpperCase(); // 🔹 Siempre en mayúsculas

  console.log("🔍 Item a buscar:", item);

  if (!item) return;

  this.isLoading = true;
  this.showTable = false;

  this.garantiasServices.obtenerStockServicioTecnico(item).subscribe({
    next: (data) => {
      console.log("📦 Datos recibidos:", data);
      this.isLoading = false;
      this.showTable = true;
      this.resultadosFiltrados = data; // si estás mostrando en tabla
    },
    error: (err) => {
      console.error('❌ Error en búsqueda de modelos', err);
      this.isLoading = false;
    }
  });
}

    buscarModelos() {
      let valor = this.itemForm.get('itemBusqueda')?.value;
      console.log('Valor de búsqueda:', valor);
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

   ocultarListaConDelay() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
     
    }, 200);
  }

    seleccionarModelo(item: any) {
    this.itemForm.patchValue({ 
      itemBusqueda: item.ItemCode ,
      
    });
    this.modelosFiltrados = [];
    this.mostrarSugerencias = false;
  }

}
