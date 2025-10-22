import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { DefaultDialogComponent } from '../default-dialog/default-dialog.component';

@Component({
  selector: 'app-agregar-repuestos-dialog',
  templateUrl: './agregar-repuestos-dialog.component.html',
  styleUrls: ['./agregar-repuestos-dialog.component.scss']
})
export class AgregarRepuestosDialogComponent implements OnInit {

  garantia: any;
  formularioRepuestos: FormGroup;
  formularioAdjuntos: FormGroup;
  modelosFiltrados: any[][] = [];
  mostrarSugerencias = false;
  mensaje = '';
  guardadoExitoso = false;
  isLoading :boolean = false;

  codigo: any;
  mensajeDetalle: any;
  tabSeleccionada: 'agregar' | 'detalle' | 'anexos' = 'agregar';
  successMessage: boolean = false;
  errorMessage:boolean = false;

  detallePedidoList: any[] = [];

  pedido: any;
  mensajeCarga:any;


  userRole: string = '';
  decodedToken:any;

  descargando: { [key: number]: boolean } = {};
  filePreviews: { file: File, url: string, type: string, name: string }[] = [];
  documentosAdjuntos:any;
  
  @Output() resultadoGuardar = new EventEmitter<{ exito: boolean, mensaje: string }>();

  constructor(
    public dialogRef: MatDialogRef<AgregarRepuestosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private garantiasServices: GarantiasService,
    private authService: AuthGuard,
     private dialog: MatDialog,
    
  ) 
  {
    this.garantia = this.data;
    
    this.formularioRepuestos = this.fb.group({
      repuestos: this.fb.array([this.crearRepuesto()])
    });

     this.formularioAdjuntos = this.fb.group({
      serieHerramienta: [null, Validators.required],
      herramienta: [null, Validators.required],
      repuesto: [null, Validators.required],
      boleta: [null, Validators.required]
    });
  }

  get repuestos(): FormArray {
    return this.formularioRepuestos.get('repuestos') as FormArray;
  }

  ngOnInit(): void {

    const token = sessionStorage.getItem("authToken");
    this.decodedToken = this.authService.decodeToken(token);
    console.log("Token decodificado: ", this.decodedToken, this.garantia);
   
    this.userRole = this.decodedToken.role;

    this.pedido =  this.garantia.Id_Pedido;;
    this.detallePedidoList = this.garantia.detalle || [];
    this.documentosAdjuntos = this.garantia.documentos || [];
    console.log("thisdocumentos|" , this.documentosAdjuntos);
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
        precio: seleccionado.ItemPrice.Price === 0 ? 1 : seleccionado.ItemPrice.Price
      });
      this.modelosFiltrados[index] = [];
    }
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

  cerrar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
    
    if (this.formularioRepuestos.valid) {
      const repuestos = this.formularioRepuestos.get('repuestos')?.value;

      const payload = {
        ...this.garantia,
        detalle: repuestos.map((r: any) => ({
          referencia: r.codigo,
          cantidad: r.cantidad,
          rutCliente: this.garantia.entidad,
          descripcion: r.descripcion,
          precio : r.precio
        }))
      };

      const requestPayload = this.transformData2(payload);

      const dialogRef = this.dialog.open(DefaultDialogComponent, {
        data: { 
          formData: requestPayload, 
          clave: 'ingresarPedidos',
          os: this.data.ID_OS
        },
          width: '80',
          maxHeight: '80vh',
          panelClass: 'custom-dialog-container',
          disableClose: false,
          autoFocus: false   
      });
        
      dialogRef.afterClosed().subscribe(resultado => {
        console.log("Resultado recibido1:", resultado);
        if (resultado) {
          // Se cerró enviando un valor
            console.log("Resultado recibido:", resultado);
            console.log("data para armar el coucher con pedido", payload);
          if (resultado.exito) {
            
            this.successMessage = true;
            this.mensaje = resultado.mensaje;
          } else {
            
            console.log("no es undefined");
          }
        } else {
           this.dialogRef.close({
              exito: true,
              mensaje: 'se ha generado el pedido correctamente.'
            });
            this.formularioRepuestos.reset();  
        }

        
      });
    }
  }

    private transformData(payload: any): any {
 
    return {
    data: {
      entidad: payload.Entidad,
      fecha: payload.Fecha || new Date().toISOString(), // Asegura fecha
      folio: payload.Folio,
      informeTecnico: payload.DescripcionDefecto || '',

      modelo: payload.Referencia,
      serie: payload.Serie,
      tipoGarantia: payload.TipoDocumento || '',
      nombreCliente: payload.NombreConsumidor,
      direccionCliente: payload.DireccionConsumidor,

      fechaCompra: payload.FechaCompra || null,
      distribuidor: payload.Revendedor || '',
      numeroDocumento: payload.NotaFiscal || '',
      observacion: payload.DefectoReclamado || '',
      idPedido: payload.Id_Pedido,
      tipoDocumento : payload.TipoDocumento,

      detalle: payload.detalle.map((d: any) => ({
        referencia: d.referencia,
        cantidad: d.cantidad,
        rutCliente: payload.CodigoServicioAut,
        descripcion : d.descripcion,
        precio : d.precio
      }))
    }
  };
  }

  private transformData2(payload: any): any {
 
    return {
    data: {
      entidad: payload.Entidad,
      fecha: payload.Fecha || new Date().toISOString(), // Asegura fecha
      folio: payload.Folio,
      informeTecnico: payload.DescripcionDefecto || '',

      modelo: payload.Referencia,
      serie: payload.Serie,
      tipoGarantia: payload.TipoDocumento || '',
      nombreCliente: payload.NombreConsumidor,
      direccionCliente: payload.DireccionConsumidor,

      fechaCompra: payload.FechaAbertura || null,
      distribuidor: payload.Revendedor || '',
      numeroDocumento: payload.NotaFiscal || '',
      observacion: payload.DefectoReclamado || '',
      idPedido: payload.Id_Pedido,
      tipoDocumento : payload.TipoDocumento,

      detalle: payload.detalle.map((d: any) => ({
        referencia: d.referencia,
        cantidad: d.cantidad,
        rutCliente: payload.CodigoServicioAut,
        descripcion : d.descripcion,
        precio : d.precio
      }))
    }
  };
  }


  eliminarRepuestoLocal(repuesto: any) {

    let resultado;
    this.isLoading = true;
    const data = 
    {
      idPedido : repuesto.ID,
      referencia : repuesto.Referencia,
      idItem: repuesto.ID_Item

    }
    this.garantiasServices.eliminarArticulosLocal(data).subscribe({
      next: (response) => {
       resultado = response;
        console.log("Respuesta de eliminacion de articulo local :" , response);
      },
      error: () => {
        
      },
      complete: () => {
        
        this.mensaje = resultado.mensaje;
        setTimeout(() => {
         
          this.cargarTabla();
           
        }, 1000);
      },
    });
  }


  cargarTabla(){
   
    this.garantiasServices.getGarantiasDetallesIntranet(this.pedido).subscribe({
      next: (response) => {
        this.detallePedidoList = response.pedidosValidos.data;
        console.log(this.detallePedidoList);
      },
      error: () => {
        this.isLoading= false;
      },
      complete: () => {
        
        setTimeout(() => {
          this.isLoading= false;     
          this.formularioRepuestos.reset();
         
        }, 1500);
      },
    });
  }

  abrirDocumento(doc: any) {
  
    this.isLoading = true
    this.descargando[doc.nombreArchivo] = true;

    this.garantiasServices.abrirDocumentoIntranet(doc.id).subscribe({
      next: (blob: Blob) => {
        // Crear URL temporal y abrir en otra pestaña
        const fileURL = window.URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
        this.descargando[doc.nombreArchivo] = false;
      },
      error: (err) => {
        console.error('Error al abrir documento', err);
        alert('No se pudo abrir el documento');
        this.descargando[doc.nombreArchivo] = false;
      }, complete: () => {
        this.isLoading= false;
        
      }
    });
  }

  borrarNombresArchivos(){
    this.filePreviews = [
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' }
    ];
  
  }

  getControlNameByIndex(index: number): string {
    const controlNames = ['serieHerramienta', 'herramienta', 'repuesto', 'boleta'];
    return controlNames[index];
  }

  clearFile(index: number) {
    const controlName = this.getControlNameByIndex(index);
   
    this.filePreviews[index] = null;

    const fileInput = document.getElementById(`archivo${index}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0]; // Solo tomamos el primer archivo
    const reader = new FileReader();

    reader.onload = () => {
      this.filePreviews[index] = {
        file: file,
        url: reader.result as string,
        type: file.type,
        name: file.name
      };
    };

    reader.readAsDataURL(file); // Esto nos permite mostrar un preview si es imagen
  }

  // Verifica si hay al menos un archivo seleccionado
  tieneArchivosSeleccionados(): boolean {
    return this.filePreviews.some(fp => fp != null && fp.file != null);
  }

// Envía los archivos al backend
enviarArchivos(): void {
  const formData = new FormData();

  // 🔹 Nombres de campos que espera tu backend
  const fieldNames = ['serieHerramienta', 'herramienta', 'repuesto', 'boleta'];

  // 🔹 Adjunta solo archivos seleccionados
  this.filePreviews.forEach((fp, index) => {
    if (fp && fp.file && fieldNames[index]) {
      formData.append(fieldNames[index], fp.file, fp.name);
    }
  });

  // 🔹 Campos adicionales (body del request)
  formData.append('userRole', this.userRole);
  formData.append('os', this.data.ID_OS);
  formData.append('empresa', 'Makita');

  console.log('🧾 FormData preparado:', formData);

// Type assertion to any to access entries() without TypeScript error
for (let pair of (formData as any).entries()) {
  console.log(pair[0], pair[1]);
}

  // 🔹 Abre el diálogo y pasa el FormData directamente
  const dialogRef = this.dialog.open(DefaultDialogComponent, {
    data: {
      clave: 'adjuntarArchivos',
      formData: formData,  // <<-- aquí sí se pasa, pero sin envolver luego en JSON
      os: this.data.ID_OS
    },
    width: '80v',
    maxHeight: '80vh',
    panelClass: 'custom-dialog-container',
    disableClose: false,
    autoFocus: false
  });

  dialogRef.afterClosed().subscribe((resultado) => {
     this.filePreviews = [];
    this.cerrar();
  });
}



  



}
