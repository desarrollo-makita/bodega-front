import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-garantia-detalle-dialog',
  templateUrl: './garantia-detalle-dialog.component.html',
  styleUrls: ['./garantia-detalle-dialog.component.scss']
})
export class GarantiaDetalleDialogComponent implements OnInit {
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GarantiaDetalleDialogComponent>,
    private garantiasServices : GarantiasService,
     private dialog: MatDialog,
  ) {
   
  }
  
           
  mostrarBotonesInferiores: boolean = true; 
  isLoading = false;
  tabSeleccionada: string = 'general';
  comentarios: string = '';
  mostrarMotivos: boolean = false;
  botonRechazar: string = 'Rechazar';
  botonAprobar: string = 'Aprobar';
  confirmarRechazoHabilitado: boolean = false;

  mostrarBotonCancelar: boolean = false;
  dataRechazo:any;
  mostrarComentarioRechazo: boolean = false;
  deshabilitarBotonera: boolean = false;
  dataLLamadaServicio:any;
  generalFields: Array<{ label: string, value: any, clase?: string }> = []; 
  dataOferta: any = { llamada: [] };
  anexos: any[] = [];
  descargando: Record<string, boolean> = {};
  botonCerrar :  string = 'Cerrar';
  botonConfirmarCerrar :  string = 'Confirmar cierre';
  mostrarBotonCerrar : boolean = false;
  mostrarBotonConfirmarCierre :  boolean = false;
  

  ngOnInit() {
    console.log("data recibida: ", this.data);

    this.dataLLamadaServicio = this.data;
     console.log("dataLLamadaServicio ", this.dataLLamadaServicio);
   if (this.data && this.data.Status === -1) {
      this.mostrarComentarioRechazo = true;
      this.comentarios = this.dataLLamadaServicio.Resolution;
      this.deshabilitarBotonera = true;
    }
  }
  

  cambiarTab(tab: string) {
    
    this.tabSeleccionada = tab;
    
    console.log("tabSeleccionado",this.tabSeleccionada )
    
    if (tab === 'detalle') {
      this.obtenerOfertaVenta(this.data.ServiceCallID);
    }else if(tab === 'anexos'){
       this.cargarDocumentos(this.data.AttachmentEntry);
    }
  }
  
  cerrarModal() {
      this.dialogRef.close({
        exito: false,
        mensaje : 'cierre'
             
      });
  }

  aprobar() {
    this.mostrarMotivos = false;
    this.botonRechazar = 'Rechazar';
    this.botonAprobar = 'Aprobar';
  }

  cerrar(datosGarantia: any) {
    this.mostrarMotivos = true;
    console.log("datos a enviar: ", datosGarantia);
    this.deshabilitarBotonera = false;
    this.mostrarBotonCerrar = true; // esta negado asi que es false en el html
    this.mostrarBotonConfirmarCierre= true;
    
    
  }
  
  validarComentario(dato: any) {
     console.log("dato:", dato);
    this.data.comentarioRechazo = this.comentarios;
    console.log("data:", this.data);
    console.log(this.comentarios)
    this.confirmarRechazoHabilitado = this.comentarios.trim().length > 0;
  }

  abrir(doc: any) {
    this.garantiasServices.abrirDocumentoIntranet(doc.id).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Error al abrir el documento:', error);
      }
  });
  }

  getEstadoClase(estado: string): string {
    if (!estado) return '';
    switch (estado.toLowerCase()) {
      case 'enprocesoaprobacion':
        return 'pendiente';
      case 'aprobado':
        return 'aprobado';
      case 'rechazado':
        this.mostrarBotonesInferiores = false;
        return 'rechazado';
      default:
        return '';
    }
  }

  obtenerOfertaVenta(idLlamada:any){
    this.isLoading=  true;
    this.garantiasServices.obtenerOfertasVentas(idLlamada).subscribe({
      next: (response) => {
      console.log("esta sera la nueva data a mostrar directamente desde SAP" , response);
      this.dataOferta =  response;
      },
      error: (err) => {
      console.log("Error" , err);
      },
      complete: () => {
        this.isLoading= false;
        this.deshabilitarBotonera= false;
      }
    });
  }

  cargarDocumentos(attachmentEntry: any) {
    this.isLoading=  true;
    this.garantiasServices.cargarDocumentos(attachmentEntry).subscribe({
      next: (response: any) => {
        console.log("TRAEMOS LOS DOCUMENTOS", response);
        // Aseguramos que this.anexos sea siempre un array (si el backend devuelve un objeto único)
        this.anexos = Array.isArray(response) ? response : [response];
      },
      error: (err) => {
        console.error("Error al cargar documentos", err);
        // opcional: mostrar toast/alert aquí
      },complete: () => {
        this.isLoading= false;
        
      }
    });
  }

  abrirDocumento(doc: any) {
    
    this.isLoading = true
    this.descargando[doc.nombre] = true;

    this.garantiasServices.descargarDocumentos(doc.absoluteEntry).subscribe({
      next: (blob: Blob) => {
        // Crear URL temporal y abrir en otra pestaña
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
        this.descargando[doc.nombre] = false;
      },
      error: (err) => {
        console.error('Error al abrir documento', err);
        alert('No se pudo abrir el documento');
        this.descargando[doc.nombre] = false;
      }, complete: () => {
        this.isLoading= false;
        
      }
    });
  }

  confirmarCierre(datosGarantia: any) {
    
    console.log("datos a enviar: ", datosGarantia);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: datosGarantia,
      disableClose: true,
      width: '500px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container'
    });

    // Solo escuchas el resultado final (cuando modal se cierra)
    dialogRef.afterClosed().subscribe(result => {
      if (result?.exito) {
        console.log("✔ LLamada cerrada con éxito , se cierra la llamada debe generar uan nueva llamada:", result.mensaje);
        this.deshabilitarBotonera = true;
        
        this.dialogRef.close({
            exito: true,
            
          });
      
        } else {
        console.log("❌ Cancelado o cerrado sin acción");
      }
    });
    
  }






}
