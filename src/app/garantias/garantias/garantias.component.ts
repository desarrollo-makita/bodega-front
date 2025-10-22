import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { AgregarRepuestosDialogComponent } from 'app/shared/agregar-repuestos-dialog/agregar-repuestos-dialog.component';
import { DefaultDialogComponent } from 'app/shared/default-dialog/default-dialog.component';
import { EditarRepuestosDialogComponent } from 'app/shared/editar-repuestos-dialog/editar-repuestos-dialog.component';
import { GarantiaDetalleDialogComponent } from 'app/shared/garantia-detalle-dialog/garantia-detalle-dialog.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  estadoSeleccionado: string = 'ingresada'; // Valor por defecto
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
          console.log("responseEEE:" , response);
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
     
      
      if (resultado === undefined) {
        console.log("El usuario cerró el modal sin enviar a SAP.");
        this.filtrarGarantias();
      }else if (resultado?.succes) {
        console.log("Envío a SAP exitoso");
         this.filtrarGarantias();
      }else {
        console.log("Fallo en el envío");
        this.filtrarGarantias();
      }
      
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

//Voucher sin pedido con totales dentro de la tabla
descargarVoucher(mappedData: any) {
  console.log(mappedData);

  const doc = new jsPDF();

  // Datos desde mappedData
  const cliente = mappedData.NombreConsumidor;
  const direccion = mappedData.DireccionConsumidor;
  const rut = mappedData.CpfConsumidor;
  const telefono = mappedData.FonoConsumidor;
  const contacto = mappedData.NombreConsumidor;
  const email = mappedData.EmailConsumidor || "sin correo informado";
  const tipoDocto = mappedData.TipoDocumento || "GARANTÍA";
  const modelo = mappedData.Referencia || "";
  const fechaDocto = mappedData.FechaDigitalizacion
    ? new Date(mappedData.FechaDigitalizacion).toLocaleDateString("es-CL")
    : "";
  const clienteSolicita = mappedData.NombreServicioAut || "";
  const observaciones = mappedData.DefectoReclamado || "";
  const idPedido = mappedData.Id_Pedido || null;

  // ✨ CABECERA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VOUCHER DE GARANTÍA", 105, 15, { align: "center" });

  // ID Pedido arriba a la derecha
  if (idPedido) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`N° Pedido: ${idPedido}`, 200, 17, { align: "right" });
  }

  // Línea de separación (abajo de ID Pedido)
  doc.setLineWidth(0.3);
  doc.line(10, 20, 200, 20);

  const startY = 25;
  const lineHeight = 7;

  // Cliente / Tipo Documento
  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", 10, startY);
  doc.text("Tipo Docto.:", 120, startY);
  doc.setFont("helvetica", "normal");
  doc.text(`${cliente}`, 35, startY);
  doc.text(`${tipoDocto}`, 150, startY);

  // Dirección / Modelo
  doc.setFont("helvetica", "bold");
  doc.text("Dirección:", 10, startY + lineHeight);
  doc.text("Modelo:", 120, startY + lineHeight);
  doc.setFont("helvetica", "normal");
  doc.text(`${direccion}`, 35, startY + lineHeight);
  doc.text(`${modelo}`, 150, startY + lineHeight);

  // RUT / Fecha
  doc.setFont("helvetica", "bold");
  doc.text("RUT:", 10, startY + lineHeight * 2);
  doc.text("Fecha Docto:", 120, startY + lineHeight * 2);
  doc.setFont("helvetica", "normal");
  doc.text(`${rut}`, 35, startY + lineHeight * 2);
  doc.text(`${fechaDocto}`, 150, startY + lineHeight * 2);

  // Teléfono / Cliente Solicita
  doc.setFont("helvetica", "bold");
  doc.text("Teléfono:", 10, startY + lineHeight * 3);
  doc.text("Cliente Solicita:", 120, startY + lineHeight * 3);
  doc.setFont("helvetica", "normal");
  doc.text(`${telefono}`, 35, startY + lineHeight * 3);
  doc.text(`${clienteSolicita}`, 150, startY + lineHeight * 3);

  // Contacto / Email
  doc.setFont("helvetica", "bold");
  doc.text("Contacto:", 10, startY + lineHeight * 4);
  doc.text("Email:", 120, startY + lineHeight * 4);
  doc.setFont("helvetica", "normal");
  doc.text(`${contacto}`, 35, startY + lineHeight * 4);
  doc.text(`${email}`, 150, startY + lineHeight * 4);

  // 🧾 TABLA de detalle
  const columns = ["Modelo", "Descripción", "Cantidad", "Precio"];
  const detalle = mappedData.detalle || [];

  // Calcular totales
  let neto = 0;
  detalle.forEach((d) => {
    const precio = Number(d.Precio) || 0;
    const cantidad = Number(d.Cantidad) || 1;
    neto += precio * cantidad;
  });
  const iva = Math.round(neto * 0.19);
  const total = neto + iva;

  // Generar filas de detalle
  const data =
    detalle.length > 0
      ? detalle.map((d: any) => [
          d.Referencia || "",
          d.descripcion || "",
          d.Cantidad?.toString() || "",
          `$${(Number(d.Precio) || 0).toLocaleString("es-CL")}`,
        ])
      : [["Sin registro de pedido", "", "", ""]];

  // Agregar totales al final de la tabla
  if (detalle.length > 0) {
    data.push([
      "",
      "",
      { content: "Neto", styles: { fontStyle: "bold" } },
      { content: `$${neto.toLocaleString("es-CL")}`, styles: { fontStyle: "bold" } },
    ]);
    data.push([
      "",
      "",
      { content: "IVA 19%", styles: { fontStyle: "bold" } },
      { content: `$${iva.toLocaleString("es-CL")}`, styles: { fontStyle: "bold" } },
    ]);
    data.push([
      "",
      "",
      { content: "Total", styles: { fontStyle: "bold" } },
      { content: `$${total.toLocaleString("es-CL")}`, styles: { fontStyle: "bold" } },
    ]);
  }

  // Generar la tabla
  autoTable(doc, {
    startY: startY + lineHeight * 5 + 5,
    head: [columns],
    body: data,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [200, 200, 200] },
    columnStyles: {
      3: { halign: "right" }, // precios alineados a la derecha
    },
  });

  // 📋 Observaciones
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Observaciones:", 10, finalY);
  doc.setFont("helvetica", "normal");
  doc.text(observaciones, 40, finalY);

  // ⚠️ Glosa Importante
  finalY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Importante:", 10, finalY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const glosa = [
    "1.- El cliente encomienda la reparación de la máquina arriba individualizada. El presupuesto tendrá validez de 15 días. El cliente deberá confirmar o no el presupuesto dentro de un plazo de 30 días desde la solicitud de reparación.",
    "2.- Las máquinas que se encuentren dentro de su periodo de garantía quedan sujetas a la revisión por el servicio técnico según las cláusulas y condiciones estipuladas en la respectiva póliza de garantía del producto en cuestión.",
    "3.- El servicio técnico no se responsabiliza por las pérdidas o daños que puedan sufrir las máquinas, causadas por fuerza mayor o casos fortuitos.",
    "4.- Las máquinas en servicio técnico quedan sujetas al artículo 42 de la ley 19.496; se entenderán abandonadas en favor del proveedor las especies que le sean entregadas en reparación, cuando no sean retiradas en el plazo de un año contado desde la fecha en que haya otorgado y suscrito el correspondiente documento de recepción del trabajo.\n\n",
    "NOTA: NO SE ENTREGARÁN TRABAJOS SIN LA PRESENTACIÓN DE LA PRESENTE ORDEN.",
    "RETIRAR SIN REPARAR CANCELA $2.129",
  ];

  let y = finalY + 5;
  glosa.forEach((linea) => {
    const splitText = doc.splitTextToSize(linea, 185);
    doc.text(splitText, 12, y);
    y += splitText.length * 5 + 3;
  });

  // Guardar PDF
  doc.save(`Voucher-${cliente}.pdf`);
}









  

// 🔹 Función para limpiar los campos de fecha
  limpiarFiltroFecha() {
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.garantiaData = [...this.garantiaDataOriginal];
  }


}
