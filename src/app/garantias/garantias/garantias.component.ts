import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { AgregarRepuestosDialogComponent } from 'app/shared/agregar-repuestos-dialog/agregar-repuestos-dialog.component';
import { DefaultDialogComponent } from 'app/shared/default-dialog/default-dialog.component';
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
  isLoading :boolean= false;
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
  mensajeCarga:any;
  exito:any;
  decodedToken:any;

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  garantiaDataOriginal: any[] = []; // Copia original sin filtrar



    constructor(
      private garantiasServices: GarantiasService,
      private dialog: MatDialog,
      private authService: AuthGuard,
      
  ) {

    
  }

  ngOnInit(): void {
    // Simular carga
    console.log("entroooooaca  : ");
    const token = sessionStorage.getItem("authToken");
    this.decodedToken = this.authService.decodeToken(token);
    console.log("Token decodificado: ", this.decodedToken);
    this.cardCode = this.decodedToken.cardCode;
    this.role = this.decodedToken.role;
    this.role === 'Administrador'  ? this.mostrarAcciones = true : this.mostrarAcciones = false;
    
    this.validarFiltros();
    

  }


  validarFiltros(){
    console.log("dekodetoken" , this.decodedToken.role);
    if(this.decodedToken.role === 'ST' || this.decodedToken.role === 'STM'){
      this.filtrarGarantiasRut(this.decodedToken.cardCode);
    }else{
      this.filtrarGarantias();

    }
    
    console.log()
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
    this.isLoading= true;
    
    this.bloquearCombo = true; // Bloquea el combo mientras se cargan los datos
    
  if(estado === 'ingresada'){
    this.garantiasServices.getGarantiasPorEstadoIntranet(estado).subscribe({
      next: (response) => {
          this.garantiaDataOriginal = response.pedidosValidos.map(item => ({
            ...item,
            tipoLLamada: 'Garantia'
          }));
          this.garantiaData = [...this.garantiaDataOriginal];
        
        this.showIntranet = true;
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

      }
          
      });
        
    }
    
    else{
      this.garantiasServices.getGarantiasPorEstado().subscribe({

      next: (response) => {
        if(estado === 'pendientes'){
           this.garantiaDataOriginal = response.abiertas.map(item => ({
            ...item,
            tipoLLamada: 'Garantia'
        }));
          console.log("garantiaData" , this.garantiaData);
        }else if (estado === 'cerradas'){
          this.garantiaDataOriginal = response.cerradas.map(item => ({
            ...item,
            tipoLLamada: 'Garantia'
          }));

        }else if (estado === 'pendientesIncompletas'){
          
          this.garantiaDataOriginal = response.pendientes.map(item => ({
          ...item,
          tipoLLamada: 'Garantia'
          }));

        }else{
          this.garantiaData= [];
        }
          this.garantiaData = [...this.garantiaDataOriginal];
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

  obtenerGarantiasEstadoRut(estado: string , rut : string){
    this.isLoading= true;
    console.log("ingresadas : " , estado , rut);
      
    this.bloquearCombo = true; // Bloquea el combo mientras se cargan los datos
      
    if(estado === 'ingresada'){
      this.garantiasServices.getGarantiasPorEstadoRutIntranet(estado, rut).subscribe({
        next: (response) => {
          console.log("responseeeeeeeee::::",response)
          this.garantiaData = response.pedidosValidos;
          console.log(this.garantiaData);
          
          this.showIntranet = true;
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

        }
            
        });
        
      }
    
    else{
      this.garantiasServices.getGarantiasPorEstadoRut(rut).subscribe({
      next: (response) => {
         console.log("entro pendientes" , response);
        if(estado === 'pendientes'){
          
          this.garantiaData = response.abiertas.map(item => ({
              ...item,
              tipoLLamada: 'Garantia',
              rol: this.role
          }));

          console.log("entro pendientes2" , this.garantiaData);
        }else if (estado === 'cerradas'){
          
            this.garantiaData = response.cerradas.map(item => ({
              ...item,
              tipoLLamada: 'Garantia',
              rol: this.role
          }));
        }else{
          this.garantiaData= [];
        }
          
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
        this.garantiasServices.getGarantiasPorEstadoIntranet(estado).subscribe({
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
      this.garantiasServices.getGarantiasPorEstado().subscribe({
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
    this.obtenerGarantiasEstado(this.estadoSeleccionado);
  }
  
  filtrarGarantiasRut(rut) {
    this.obtenerGarantiasEstadoRut(this.estadoSeleccionado , rut);
  }
  abrirDetalleGarantia(garantia: any): void {
    
    const dialogRef = this.dialog.open(GarantiaDetalleDialogComponent, {
      data: garantia,
      // width: '900px',  
      maxHeight: '80vh', // opcional, para que no desborde la pantalla
      panelClass: 'custom-dialog-container'
    });
    
    dialogRef.afterClosed().subscribe((resultado) => {
       if (resultado?.exito) {
        setTimeout(() => {
            this.filtrarGarantias();
           
          }, 1000);
          
      }else if (resultado?.mensaje === 'cierre') {
          setTimeout(() => {
            }, 1500);
      }else{
         // usuario canceló o cerró sin confirmar
      console.log('Diálogo cerrado sin acción');
      }
      
    });
  }

  abrirModalAgregarRepuesto(garantia: any): void {
    

    console.log("Iniciando Modal abrirModalAgregarRepuesto con esta data : ", garantia);

    const dialogRef = this.dialog.open(AgregarRepuestosDialogComponent, {
      data: garantia,
      width: '500px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((resultado) => {
    
      console.log("resultado :_ " , resultado);
      this.obtenerGarantiasEstado(this.estadoSeleccionado);
        
       
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
    
    const dialogRef = this.dialog.open(DefaultDialogComponent, {
      data: { 
        data: garantia,
        clave: 'enviarASAP'
    },
      width: '80',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: false 
    });

  

    dialogRef.afterClosed().subscribe((resultado) => {

      
       this.filtrarGarantias();
      
    });
  }


  filtrarPorFecha() {
    
    if (!this.fechaDesde && !this.fechaHasta) {
      alert('Por favor selecciona al menos una fecha');
      return;
    }


    if (this.estadoSeleccionado === 'ingresada') {
      let dataFiltrada = [...this.garantiaDataOriginal];

      console.log("dataFiltradaaaa", dataFiltrada);

      dataFiltrada = dataFiltrada.filter(x => {
        const fechaItem = new Date(x.FechaAbertura);
        const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

        // 🧩 Normalizar todas las fechas al inicio del día
        fechaItem.setHours(0, 0, 0, 0);
        if (desde) desde.setHours(0, 0, 0, 0);
        if (hasta) hasta.setHours(0, 0, 0, 0);

        return (!desde || fechaItem >= desde) && (!hasta || fechaItem <= hasta);
      });

      this.garantiaData = dataFiltrada;
      console.log("Filtrado ingresadas:", this.garantiaData);
    }else{
      
      let dataFiltrada = [...this.garantiaDataOriginal];

      console.log("dataFiltrada" , dataFiltrada);

      dataFiltrada = dataFiltrada.filter(x => {
        const fechaItem = new Date(x.CreationDate);
        const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

        return (!desde || fechaItem >= desde) && (!hasta || fechaItem <= hasta);
      });

      this.garantiaData = dataFiltrada;
    }

    
}


  

// 🔹 Función para limpiar los campos de fecha
  limpiarFiltroFecha() {
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.garantiaData = [...this.garantiaDataOriginal];
  }


}
