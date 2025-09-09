import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { AgregarRepuestosDialogComponent } from 'app/shared/agregar-repuestos-dialog/agregar-repuestos-dialog.component';
import { EditarRepuestosDialogComponent } from 'app/shared/editar-repuestos-dialog/editar-repuestos-dialog.component';
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
  garantiaDataIntranet: Garantia[] = [];
  garantiaPendiente = 0;
  garantiaAprobada = 0;
  garantiaRechazada = 0;
  estadoSeleccionado: string = 'pendientes'; // Valor por defecto
  showIntranet: boolean = false; // Controla la visibilidad de la tabla de intranet
  bloquearCombo: boolean = false;  
  mensajeGuardar: string;
  guardarExitoso: boolean;
  mensaje:any;
  tipoMensaje: string; // 'exito' o 'error'
  successMessage: boolean = false;
  errorMessage: boolean = false;
  hasNullIdPedido = false; // boolean que activaremos
  cardCode : any;
  role: any;
  mostrarAcciones: boolean = false;


    constructor(
      private garantiasServices: GarantiasService,
      private dialog: MatDialog,
      private authService: AuthGuard,
      
  ) {

    
  }

  ngOnInit(): void {
    // Simular carga
    const token = sessionStorage.getItem("authToken");
    const decodedToken = this.authService.decodeToken(token);
    this.cardCode = decodedToken.cardCode;
    this.role = decodedToken.role;
    this.role === 'Administrador'  ? this.mostrarAcciones = true : this.mostrarAcciones = false;
    this.filtrarGarantias();
    this.isLoading = false;

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
    
   
    this.bloquearCombo = true; // Bloquea el combo mientras se cargan los datos
    if(estado === 'ingresada'){
        this.garantiasServices.getGarantiasPorEstadoIntranet(estado , this.cardCode, this.role).subscribe({
          next: (response) => {
           
            this.garantiaData = response.pedidosValidos.data;
            
            this.hasNullIdPedido = this.garantiaData.some(g => g.idPedido === null || g.idPedido === undefined);
            
            if(response.pedidosValidos.plataforma === 'intranet'){this.showIntranet = true;}
          },
          error: (error) => {
            console.error('Error en la consulta:', error);
        },
          complete: () => {
            setTimeout(() => {
              this.isLoading = false;
              this.bloquearCombo = false; // Bloquea el combo una vez que se cargan los datos
            }, 500);
          },
      });
    }else{
      this.garantiasServices.getGarantiasPorEstado(estado, this.cardCode , this.role).subscribe({
        next: (response) => {
          console.log("Response: " , response);
          this.garantiaData = response.pedidosValidos;
          
          this.showIntranet = false;
        },
        error: (error) => {
          console.error('Error en la consulta:', error);
        },
        complete: () => {
          setTimeout(() => {
            this.isLoading = false;
            this.bloquearCombo = false;
            this.successMessage = false;
          }, 1000);
        },
      });
    }
   
  }

  obtenerGarantiasEstadoEditar(estado: string){
    
    this.isLoading = true;
    this.bloquearCombo = true; // Bloquea el combo mientras se cargan los datos
    if(estado === 'ingresada'){
        this.garantiasServices.getGarantiasPorEstadoIntranet(estado, this.cardCode, this.role).subscribe({
          next: (response) => {
          
            this.garantiaData = response.pedidosValidos.data;
            
            this.hasNullIdPedido = this.garantiaData.some(g => g.idPedido === null || g.idPedido === undefined);
            
            if(response.pedidosValidos.plataforma === 'intranet'){this.showIntranet = true;}
          },
          error: (error) => {
            console.error('Error en la consulta:', error);
        },
          complete: () => {
            setTimeout(() => {
              this.isLoading = false;
              this.bloquearCombo = false; // Bloquea el combo una vez que se cargan los datos
            }, 500);
          },
      });
    }else{
      this.garantiasServices.getGarantiasPorEstado(estado, this.cardCode, this.role).subscribe({
        next: (response) => {
      
          this.garantiaData = response.pedidosValidos;
          this.showIntranet = false;
        },
        error: (error) => {
          console.error('Error en la consulta:', error);
        },
        complete: () => {
          setTimeout(() => {
            this.isLoading = false;
            this.bloquearCombo = false;
          }, 1500);
        },
      });
    }
  }

  filtrarGarantias() {
    console.log("Estado seleccionado:", this.estadoSeleccionado);
    if (this.estadoSeleccionado === 'pendientes') {
      this.obtenerGarantiasEstado('EnProcesoAprobacion');
    }else if(this.estadoSeleccionado === 'rechazadas'){
      this.obtenerGarantiasEstado('Rechazadas');
    }else{
      this.obtenerGarantiasEstado(this.estadoSeleccionado);
    }
  }

  abrirDetalleGarantia(garantia: any): void {
    const dialogRef = this.dialog.open(GarantiaDetalleDialogComponent, {
      data: garantia,
      // width: '900px',  
      maxHeight: '80vh', // opcional, para que no desborde la pantalla
      panelClass: 'custom-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe((resultado) => {
       if (resultado.exito) {
        setTimeout(() => {
            this.filtrarGarantias();
           
          }, 1000);
          
      }else if (resultado.mensaje === 'cierre') {
          setTimeout(() => {
            }, 1500);
          }
      
    });
  }

  abrirModalAgregarRepuesto(garantia: any): void {
    
    const dialogRef = this.dialog.open(AgregarRepuestosDialogComponent, {
      data: garantia,
      width: '1000px',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        // Mostrar mensaje en el componente padre
        if (resultado.exito) {
          this.obtenerGarantiasEstado(this.estadoSeleccionado);
          this.successMessage= true
          this.mensaje = resultado.mensaje;
         
        } else {
          this.errorMessage = true
          this.mensaje = resultado.mensaje;
         
        }

        // Mostrar el mensaje por unos segundos (opcional)
        setTimeout(() => {
          this.mensaje = '';
          this.successMessage = false;
          this.errorMessage = false;
        }, 1500);
      }
    });
  }

  
  abrirModalAgregarRepuestoOT(garantia: any): void {
    
    garantia.Id_Pedido = garantia.ID_Pedido;
    
    const dialogRef = this.dialog.open(EditarRepuestosDialogComponent, {
      data: garantia,
      width: '1000px',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        // Mostrar mensaje en el componente padre
        if (resultado.exito) {
          this.obtenerGarantiasEstadoEditar("EnProcesoAprobacion");
          this.successMessage= true
          this.mensaje = resultado.mensaje;
         
        } else {
          this.errorMessage = true
          this.mensaje = resultado.mensaje;
         
        }

        // Mostrar el mensaje por unos segundos (opcional)
        setTimeout(() => {
          this.mensaje = '';
          this.successMessage = false;
          this.errorMessage = false;
        }, 1500);
      }
    });
  }



  enviarASAP(garantia : any){
    this.isLoading= true;
    let data = garantia.Id_Pedido;
    this.garantiasServices.enviarSap(data).subscribe({
      next: (response) => {
        if (response?.error?.error || response?.error) {
          this.errorMessage = true;
          this.mensaje = response?.error?.error || response?.error;
        }else {
          this.successMessage = true;
          this.mensaje = 'Enviado exitosamente a SAP'

        }
      },
      error: (error) => {
        console.error('Error en la consulta:', error);
      },
      complete: () => {
          setTimeout(() => {
              this.isLoading = false;
              this.errorMessage = false;
              this.successMessage = false;
              this.filtrarGarantias();
            }, 2500);
        
      },
    });
  }





}
