import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { GarantiaDetalleDialogComponent } from 'app/shared/garantia-detalle-dialog/garantia-detalle-dialog.component';

interface Garantia {
  idPedido: number;
  nombreCliente: string;
  estadoSap: string;
  ordenVentaAsociada: number;
  servicioLlamada:number;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

@Component({
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss']
})
export class GarantiasComponent implements OnInit {
  isLoading = true;
  garantiaData: Garantia[] = [];
  garantiaPendiente = 0;
  garantiaAprobada = 0;
  garantiaRechazada = 0;
  estadoSeleccionado: string = 'pendientes'; // Valor por defecto

    constructor(
      private garantiasServices: GarantiasService,
      private dialog: MatDialog
  ) {

    
  }

  ngOnInit(): void {
    // Simular carga
    setTimeout(() => {
      this.filtrarGarantias();
      
    //  this.actualizarConteos();
      this.isLoading = false;
    }, 1200);
  }

  actualizarConteos() {
    this.garantiaPendiente = this.garantiaData.filter(g => g.estado === 'Pendiente').length;
    this.garantiaAprobada = this.garantiaData.filter(g => g.estado === 'Aprobado').length;
    this.garantiaRechazada = this.garantiaData.filter(g => g.estado === 'Rechazado').length;
  }

  aprobarGarantia(garantia: Garantia) {
    garantia.estado = 'Aprobado';
    this.actualizarConteos();
  }

  rechazarGarantia(garantia: Garantia) {
    garantia.estado = 'Rechazado';
    this.actualizarConteos();
  }

  obtenerGarantiasEstado(estado: string){
    this.garantiasServices.getGarantiasPorEstado(estado).subscribe({
      next: (response) => {
        this.garantiaData = response.pedidosValidos;
        console.log("this.garantiaData", this.garantiaData); 
      },
      error: (error) => {
        console.error('Error en la consulta:', error);
      },
      
      complete: () => {
      
      },
    });
  }

  filtrarGarantias() {
    console.log("Estado seleccionado:", this.estadoSeleccionado);
    if (this.estadoSeleccionado === 'pendientes') {
      this.obtenerGarantiasEstado('EnProcesoAprobacion');
    }else if(this.estadoSeleccionado === 'rechazadas'){
      this.obtenerGarantiasEstado('Pendiente');
    }else{
      this.obtenerGarantiasEstado(this.estadoSeleccionado);
    }
  }

  abrirDetalleGarantia(garantia: any): void {
    this.dialog.open(GarantiaDetalleDialogComponent, {
      data: garantia,
      width: '900px',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container' // opcional para estilos extra
    });
  }
}
