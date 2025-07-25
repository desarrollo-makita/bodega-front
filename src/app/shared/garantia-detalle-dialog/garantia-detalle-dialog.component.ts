import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-garantia-detalle-dialog',
  templateUrl: './garantia-detalle-dialog.component.html',
  styleUrls: ['./garantia-detalle-dialog.component.scss']
})
export class GarantiaDetalleDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<GarantiaDetalleDialogComponent>
  ) {
    console.log('DATA RECIBIDA EN MODAL:', this.data);
  }
  ngOnInit() {console.log('DATA RECIBIDA EN MODAL ngOnInit:', this.data);
  }                      

  tabSeleccionada: 'general' | 'detalle' | 'anexos' = 'general';
  comentarios: string = '';
  mostrarMotivos: boolean = false;
  botonRechazar: string = 'Rechazar';
  botonAprobar: string = 'Aprobar';
  confirmarRechazoHabilitado: boolean = false;

  get datosGenerales() {
    if (!this.data) return [];
    
    return [
      { label: 'Tipo Orden', value: this.data.TipoDocumento },
      { label: 'Status Garantía', value: 'Pendiente de Aprobación' },
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
    this.dialogRef.close();
  }

  aprobar() {
    this.mostrarMotivos = false;
    this.botonRechazar = 'Rechazar';
       this.botonAprobar = 'Aprobar';
  }

  rechazar() {
    this.mostrarMotivos = true;
    this.botonRechazar = 'Enviar rechazo';
    this.botonAprobar = 'Cancelar';
  }

  validarComentario() {
    this.confirmarRechazoHabilitado = this.comentarios.trim().length > 0;
  }

}
