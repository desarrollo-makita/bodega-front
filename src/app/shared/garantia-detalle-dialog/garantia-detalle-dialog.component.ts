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
  ngOnInit() {
    console.log("data recibida: ", this.data);
    if(this.data.EstadoSAP === 'RECHAZADO'){
      this.mostrarComentarioRechazo = true;
      this.comentarios = this.data.comentarioAdicional;

    }
  }
           
  mostrarBotonesInferiores: boolean = true; 
  isLoading = false;
  tabSeleccionada: 'general' | 'detalle' | 'anexos' = 'general';
  comentarios: string = '';
  mostrarMotivos: boolean = false;
  botonRechazar: string = 'Rechazar';
  botonAprobar: string = 'Aprobar';
  confirmarRechazoHabilitado: boolean = false;
  mostrarBotonRechazar: boolean = false;
  mostrarBotonCancelar: boolean = false;
  dataRechazo:any;
  mostrarComentarioRechazo: boolean = false;
  habilitarBotonera: boolean = false;  
  
  get datosGenerales() {
    if (!this.data) return [];
    
    return [
      { label: 'Tipo Orden', value: this.data.TipoDocumento },
      { 
        label: 'Status Garantía', 
        value: this.data.EstadoSAP === 'EnProcesoAprobacion' ? 'Pendiente Aprobación' : this.data.EstadoSAP, 
        clase: this.getEstadoClase(this.data.EstadoSAP)
      },
      { label: 'Orden Servicio Telecontrol', value: this.data.OS_ID },
      { label: 'Informe Técnico', value: this.data.InformeTecnico },
      { label: 'Tipo Documento', value: this.data.TipoMO },
      { label: 'Modelo', value: this.data.Modelo },
      { label: 'Serie', value: this.data.serie },
      { label: 'Número Documento', value: this.data.NumeroDocumento },
      { label: 'Observación', value: this.data.Observacion },
      { label: 'Vendedor', value: this.data.Revendedor },
      { label: 'RUT Servicio Técnico', value: this.data.RutServicioTecnico },
      { label: 'Nombre Servicio Autorizado', value: this.data.NombreServicioAut },
      { label: 'Fecha Apertura', value: (new Date(this.data.FechaAbertura)).toLocaleDateString() },
      { label: 'Nombre Consumidor', value: this.data.NombreConsumidor },
      { label: 'Dirección Consumidor', value: this.data.DireccionConsumidor },
      { label: 'Ciudad Consumidor', value: this.data.CiudadConsumidor },
      { label: 'Región Consumidor', value: this.data.RegionConsumidor },
      { label: 'RUT Consumidor', value: this.data.RutConsumidor },
    ];
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

  rechazar(datosGarantia: any) {
    
    console.log("dato:", datosGarantia);
    this.mostrarMotivos = true;
    this.mostrarBotonRechazar = true;
    this.mostrarBotonCancelar = true;
    //this.botonRechazar = 'Enviar rechazo';
    //this.botonAprobar = 'Cancelar';
  }

  enviarRechazo(datosGarantia: any) {
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
        console.log("✔ Oferta rechazada con éxito:", result.mensaje);
        this.habilitarBotonera = true;
        
        this.dialogRef.close({
            exito: true,
            
          });
      
        } else {
        console.log("❌ Cancelado o cerrado sin acción");
      }
    });
  }


  validarComentario(dato: any) {
    this.data.comentarioRechazo = this.comentarios;
    console.log("dato:", dato);
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
        // 👉 Aquí haces lo que necesites
        this.mostrarBotonesInferiores = false;
        return 'rechazado';

      default:
        return '';
    }
  }


}
