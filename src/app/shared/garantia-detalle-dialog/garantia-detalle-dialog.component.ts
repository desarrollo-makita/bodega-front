import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { RechazarOfertaVentaDialogComponent } from '../rechazar-oferta-venta-dialog/rechazar-oferta-venta-dialog.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { request } from 'http';



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
       private fb: FormBuilder,
  ) {

    this.formularioRepuestos = this.fb.group({
      repuestos: this.fb.array([this.crearRepuesto()])
    });
   
  }
  
  formularioRepuestos: FormGroup;
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
  mostrarBotoneraOferta : boolean  = false;
  modelosFiltrados: any[][] = [];
  mostrarAgregarOferta:boolean= false;

  ngOnInit() {
    console.log("data recibida: ", this.data);

    this.dataLLamadaServicio = this.data;
     console.log("dataLLamadaServicio ", this.dataLLamadaServicio);
   if (this.data && this.data.Status === -1) {
      this.mostrarComentarioRechazo = true;
      this.comentarios = this.dataLLamadaServicio.Resolution;
      this.deshabilitarBotonera = true;
      this.mostrarAgregarOferta = false;
      //this.mostrarBotoneraOferta = true;
    }
  }
  
  get repuestos(): FormArray {
    return this.formularioRepuestos.get('repuestos') as FormArray;
  }



  crearRepuesto(): FormGroup {
    return this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarRepuesto(): void {
    this.repuestos.push(this.crearRepuesto());
  }

   eliminarRepuesto(index: number): void {
    this.repuestos.removeAt(index);
    if (this.repuestos.length === 0) {
      this.repuestos.push(this.crearRepuesto());
    }
  }

  buscarRepuestos(valor: string, index: number): void {
    if (!valor || valor.length < 2) {
      this.modelosFiltrados[index] = [];
      return;
    }

    valor = valor.toUpperCase();
    this.garantiasServices.buscarRepuestosAccesorios(valor).subscribe({
      next: (response) => {
        this.modelosFiltrados[index] = response.items || [];
      },
      error: () => {
        this.modelosFiltrados[index] = [];
      }
    });
  }

  seleccionarModelo(index: number, itemCode: string): void {
    const seleccionado = this.modelosFiltrados[index]?.find((item) => item.ItemCode === itemCode);
    if (seleccionado) {
      const grupo = this.repuestos.at(index);
      grupo.patchValue({
        codigo: seleccionado.ItemCode,
        descripcion: seleccionado.ItemName,
        precio: seleccionado.ItemPrice.Price
      });
      this.modelosFiltrados[index] = [];
    }
  }

  cambiarTab(tab: string) {

    if (this.data && this.data.Status === -1) {
     
      this.deshabilitarBotonera = true;
    }
    
    this.tabSeleccionada = tab;
    
    console.log("tabSeleccionado",this.tabSeleccionada )
    
    if (tab === 'detalle') {
      this.obtenerOfertaVenta(this.data.ServiceCallID);
    }else if(tab === 'anexos'){
       this.cargarDocumentos(this.data.AttachmentEntry);
    }else if(tab === 'agregar'){
      console.log("se agrega nuevo TABS")
    }
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


  cerrarModal(): void {
    this.dialogRef.close();
   
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

  obtenerOfertaVenta(idLlamada: any) {
    this.isLoading = true;

    this.garantiasServices.obtenerOfertasVentas(idLlamada).subscribe({
      next: (response) => {
        console.log("Nueva data desde SAP:", response);
        console.log(" this.dataLLamadaServicio" ,  this.dataLLamadaServicio.Status)
        this.dataOferta = response;

        // Verificar si hay algún Status abierto
        const hayAbierto = response.llamada.some((oferta: any) => 
          oferta.Status === 'bost_Open' && 
          oferta.Status !== (this.dataLLamadaServicio.Status - 1)
        );

        // Asignar mostrarAgregarOferta según corresponda
        this.mostrarAgregarOferta = !hayAbierto; // si hay abierto -> false, si no -> true
      },
      error: (err) => {
        console.log("Error:", err);
      },
      complete: () => {
        this.isLoading = false;
        this.deshabilitarBotonera = false;
      }
    });
  }


  cargarDocumentos(attachmentEntry: any) {
    this.isLoading=  true;
    
    console.log("attachmentEntry", attachmentEntry);
    if(attachmentEntry === null || attachmentEntry === undefined || attachmentEntry === 0){
      this.isLoading=  false;
    }else{
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
    
  }

  abrirDocumento(doc: any) {
  this.isLoading = true;
  this.descargando[doc.nombre] = true;

  this.garantiasServices.descargarDocumentos(doc.absoluteEntry).subscribe({
  next: (blob: Blob) => {
    // Crear URL temporal
    const fileURL = window.URL.createObjectURL(blob);

    // Crear <a> temporal
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = doc.nombre; // nombre del archivo
    a.target = '_blank';

    // Añadir al DOM y hacer click
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Liberar memoria del blob después de 1 segundo
    setTimeout(() => window.URL.revokeObjectURL(fileURL), 1000);

    this.descargando[doc.nombre] = false;
  },
  error: (err) => {
    console.error('Error al abrir documento', err);
    alert('No se pudo abrir el documento');
    this.descargando[doc.nombre] = false;
  },
  complete: () => {
    this.isLoading = false;
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

   rechazarOferta(ofertaVenta: any) {
    
    console.log("datos a enviar: ", ofertaVenta);

    const dialogRef = this.dialog.open(RechazarOfertaVentaDialogComponent, {
      data:  ofertaVenta ,
      disableClose: true,
      width: '500px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container'
    });

    // Solo escuchas el resultado final (cuando modal se cierra)
    dialogRef.afterClosed().subscribe(result => {
      if (result?.exito) {
        this.obtenerOfertaVenta(this.data.ServiceCallID);
        console.log("✔ Oferta rechazada con éxito...", result.mensaje);
      }
    });
    
  }


  guardar(){
    this.isLoading = true;
    if (this.formularioRepuestos.valid) {
      const repuestos = this.formularioRepuestos.get('repuestos')?.value;
      
      const payload = {
        ...this.dataLLamadaServicio,
        detalle: repuestos.map((r: any) => ({
          referencia: r.codigo,
          cantidad: r.cantidad,
          rutCliente: this.dataLLamadaServicio.entidad,
          descripcion: r.descripcion,
          precio : r.precio
        }))
      };

      const requestPayload = this.transformData(payload);

      this.garantiasServices.crearOfertaVenta(requestPayload.data).subscribe({
        next: (response) => {
          console.log("se crea la oferta d eventa", response);
          
         
        
        },
        error: (err) => {
          console.log("Error" , err);
          this.isLoading= false;
        },
        complete: () => {
           setTimeout(() => {
              this.isLoading= false;
    }, 200);
        
        }
    });
    
    
    }
  }

  private transformData(payload: any): any {
 
    console.log("payload a enviar: ", payload);
    return {
      data: {
        RutServicioTecnico: payload.CustomerCode,
        ServiceCallID: payload.ServiceCallID,
        U_U_NombreConsumidor:payload.U_U_NombreConsumidor,
        U_U_NombreDistribuidor:payload.U_U_NombreDistribuidor, 
        U_U_RutConsumidor: payload.U_U_RutConsumidor,
        Repuestos: payload.detalle.map((d: any) => ({
          itemRepuesto: d.referencia,
          Cantidad: d.cantidad,
          
        }))
      }
    };
  }
}
