import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';

@Component({
  selector: 'app-agregar-repuestos-dialog',
  templateUrl: './agregar-repuestos-dialog.component.html',
  styleUrls: ['./agregar-repuestos-dialog.component.scss']
})
export class AgregarRepuestosDialogComponent implements OnInit {

  garantia: any;
  formularioRepuestos: FormGroup;
  modelosFiltrados: any[][] = [];
  mostrarSugerencias = false;
  mensaje = '';
  guardadoExitoso = false;
  isLoading :boolean = false;

  codigo: any;
  mensajeDetalle: any;
  tabSeleccionada: 'agregar' | 'detalle'  = 'agregar';

  detallePedidoList: any[] = [];

  

  @Output() resultadoGuardar = new EventEmitter<{ exito: boolean, mensaje: string }>();

  constructor(
    public dialogRef: MatDialogRef<AgregarRepuestosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private garantiasServices: GarantiasService
    
  ) 
  {
    this.garantia = data;
    this.formularioRepuestos = this.fb.group({
      repuestos: this.fb.array([this.crearRepuesto()])
    });
  }

  get repuestos(): FormArray {
    return this.formularioRepuestos.get('repuestos') as FormArray;
  }

  ngOnInit(): void {
    console.log("data en el modal : " ,  this.data);
    let pedido =  this.data.Id_Pedido;
    this.garantiasServices.getGarantiasDetallesIntranet(pedido).subscribe({
      next: (response) => {
        this.detallePedidoList = response.pedidosValidos.data;
        console.log(this.detallePedidoList);
      },
      error: () => {
        
      },
      complete: () => {
        setTimeout(() => {
             
        }, 1000);
      },
    });
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
        descripcion: seleccionado.ItemName
      });
      this.modelosFiltrados[index] = [];
    }
  }

  crearRepuesto(): FormGroup {
    return this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
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
    this.isLoading = true;
    if (this.formularioRepuestos.valid) {
      const repuestos = this.formularioRepuestos.get('repuestos')?.value;

      const payload = {
        ...this.garantia,
        detalle: repuestos.map((r: any) => ({
          referencia: r.codigo,
          cantidad: r.cantidad,
          rutCliente: this.garantia.entidad,
          descripcion: r.descripcion
        }))
      };

      const requestPayload = this.transformData(payload);
      console.log("pedidos" , requestPayload);
      this.garantiasServices.insertarPedidosIntranet(requestPayload).subscribe({
        next: (res) => {
          console.log("reeees" , res);
          const respuesta = res.responsePedidosGarantia;
          console.log("respuesta" , respuesta);
          if (!respuesta) {
            // Si no existe la respuesta esperada, tratamos como error
            this.dialogRef.close({
              exito: false,
              mensaje: 'Respuesta inesperada del servidor. Intenta nuevamente.'
            });
            return;
          }

          this.codigo = respuesta.codigo;
          this.mensajeDetalle = respuesta.mensaje;
        },
        error: (err) => {
          // Error de red o del servidor
          console.log("Error de red o servidor:", err);
          this.dialogRef.close({
            exito: false,
            mensaje: 'Error al guardar la garantía. Intenta nuevamente...'
          });
        },
        complete: () => {
          this.isLoading = false;

      if (this.codigo === -1) {
        console.log("Error de negocio:", this.mensajeDetalle);
        this.dialogRef.close({
          exito: false,
          mensaje: 'Error al guardar la garantía. Intenta nuevamente.'
        });
      } else if (this.codigo !== undefined) {
        console.log("Éxito:", this.mensajeDetalle);
        this.dialogRef.close({
          exito: true,
          mensaje: 'se ha generado el pedido correctamente.'
        });
      }
      // Si this.codigo no fue asignado en ningún momento (caso raro)
      else {
        console.log("Error: código de respuesta no recibido.");
        this.dialogRef.close({
          exito: false,
          mensaje: 'No se recibió una respuesta válida del servidor.'
        });
      }
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
      tipoGarantia: payload.TipoGarantia || 'Garantía',
      nombreCliente: payload.NombreConsumidor,
      direccionCliente: payload.DireccionConsumidor,

      fechaCompra: payload.FechaCompra || null,
      distribuidor: payload.Revendedor || '',
      numeroDocumento: payload.NotaFiscal || '',
      observacion: payload.DefectoReclamado || '',
      idPedido: payload.Id_Pedido,

      detalle: payload.detalle.map((d: any) => ({
        referencia: d.referencia,
        cantidad: d.cantidad,
        rutCliente: payload.CodigoServicioAut,
        descripcion : d.descripcion
      }))
    }
  };
}



}
