import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { ConfirmInventarioDialogComponent } from 'app/shared/confirm-inventario-dialog/confirm-inventario-dialog.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LOCALES, MESES, TIPOS_ITEMS } from 'app/shared/constants';
import { Router } from '@angular/router';
import { MyDataService } from 'app/services/data/my-data.service';
import { AlmacenamientoDialogComponent } from 'app/shared/almacenamiento-dialog/almacenamiento-dialog.component';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {

  // Variables del formulario
  selectedMes: string;
  selectedPeriodo: string;
  selectedTipoItem: string;
  selectedLocal: string;
  selectedGrupo: string;

  codigoBloqueo: boolean= false;

  periodo : any;
  mes : any;
  usuario:any;
  

  mensaje: string = ''; // Mensaje para el usuario
  inventarioData: any[] = [];  // Lista completa de 18,000 registros
  filteredInventarioData: any[] = []; // Lista filtrada
  searchQuery: string = '';  // Lo que el usuario escribe en el input

 
  isLoading: boolean = false;
  showTable:boolean= false;
  habilitarBoxes: boolean= true;
  successMessage: boolean = false;
  errorMessage: boolean = false;
  grupoList: any;
  mostrarGrafico : boolean = false;
  sinInventarioIniciado: boolean = false;
  mostrarFlecha : boolean= false;
  isInventarioCerrado : boolean = false;

  p: number = 1; // Página actual
  itemsPerPage: number = 5; // Elementos por página
  selectedFechaInicio:string
  saldoTotal : number = 0;
  conteoTotal : number = 0;
  totalItems: number = 0;
  titulo: string=''
  respuestaValidaInicioInventario : any;
  meses = MESES;
  tiposItems: any = [];
  formattedDate: any;
  ultimo: number = 0;
  respuestaValidaCierreInventario: any;
  locales =LOCALES;

  cantidadReconteos: number = 0;

  cantidadReconteos2: number = 2;
  almacenamiento: string = 'N';

  constructor(
    private invetarioServices: InventarioService , 
    private dialog: MatDialog,
    private authService: AuthGuard,
    private router: Router,
    private myDataService: MyDataService
) {}

  ngOnInit(): void {
    this.validarInventarioFun();
    this.obtenerGrupoLocal();
  }
  openDialog(mensaje: string){
    this.mostrarFlecha= false;
    this.openConfirmDialog(mensaje);
    this.errorMessage= false;
  }
 
  openConfirmDialog(mensaje: string): void {
    console.log("mensaje  : " , mensaje , '-' , this.respuestaValidaInicioInventario);
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
  
    // Convertir el número del mes a nombre del mes (recordar que los arrays comienzan en 0)
    const mesNombre = meses[parseInt(this.mes, 10) - 1];
      
    const dialogRef = this.dialog.open(ConfirmInventarioDialogComponent, {
      disableClose: true,
      data: {
        mensaje: mensaje,
        periodo: this.periodo,
        mes: mesNombre,
        datos: this.respuestaValidaInicioInventario
      
      }
    });

    
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.successMessage = true;
        console.log('Inventario iniciado con éxito:', result.data);
        this.mensaje = 'Inventario iniciado correctamente';
        this.validarInventarioFun()
        setTimeout(() => {
          this.successMessage = false;
          
        }, 2000);
       
      } else if (result?.action === 'cerrar') {
        console.log("se cierra el modal")
      }else{
        this.errorMessage = true;
        this.mensaje = 'Error al iniciar el inventario';
        console.log('El usuario canceló o hubo un error');
        this.validarInventarioFun()
        setTimeout(() => {
          this.errorMessage = false;

        }, 2000);
      }
    });
  }

  almacenamientoConfirmDialog(mensaje: string , datosFiltro : any): void {
    console.log("mensaje  : " , mensaje , '-' , datosFiltro);
    const dialogRef = this.dialog.open(AlmacenamientoDialogComponent, {
      //disableClose: true,
      data: {
        mensaje: mensaje,       
        datos: datosFiltro
      
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.successMessage = true;
      
        setTimeout(() => {
          this.successMessage = false;
          
        }, 2000);
       
      } else if (result?.action === 'cerrar') {
        console.log("se cierra el modal")
      }
    });
  }
  
  
  obtenerGrupoLocal(){

    this.invetarioServices.obtenerBodegas().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor grupoLocal:', response.data);
        this.grupoList = response.data;
      },
      error: (error) => {
      
        console.error('Error en la consulta:', error);
       
      },
      complete: () => {
       
      },
    });

  }

  onSubmit() {
    this.isLoading = true;
    this.consultaTablaRegistro();
    // Añadir la clase 'loading' al body para desactivar interacciones
    
   /* if(!this.habilitarBoxes){
      const mensaje = `Usted no ha iniciado el inventario`;
      this.openConfirmDialog(mensaje);
      this.isLoading = false;
      
    }else{
      this.consultaTablaRegistro();
      
    }*/
    
  }


  calcularTotales() {
    // Sumamos los valores de "SaldoStock" y "Conteo" de cada fila
    console.log("Datos del inventario:", this.inventarioData);
    this.saldoTotal = this.inventarioData.reduce((total, row) => total + row.SaldoStock, 0);
    this.conteoTotal = this.inventarioData.reduce((total, row) => total + row.Conteo, 0);

    this.titulo = this.selectedTipoItem;        
  }
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = "";
      this.successMessage = false;
      this.errorMessage = false;
    }, 9000); // Ocultar mensaje después de 2 segundos
  }

  resetFormulario() {   
    this.selectedTipoItem = "";
    this.selectedLocal = "";
    this.inventarioData = [];
  }

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedTipoItem && this.selectedLocal);
  }

  onChange() {
  
    console.log('Tipo de ítem seleccionado:', this.selectedTipoItem);
    console.log('Local seleccionado:', this.selectedLocal);
    console.log('Fecha inicio inventsario:', this.selectedFechaInicio);
    
  }

  getMesTooltip(codigo: string): string {
    const mesEncontrado = this.meses.find(mes => mes.codigo === codigo);
    return mesEncontrado ? mesEncontrado.nombre : '';
  }

  getTipoItemTooltip(codigo: string): string {
    const tipo = this.tiposItems.find(item => item.codigo === codigo);
    return tipo ? tipo.descripcion : '';
  }

  getLocalTooltip(codigo: string): string {
    const localEncontrado = this.locales.find(local => local.codigo === codigo);
    return localEncontrado ? localEncontrado.descripcion : '';
  }

  actualizarPaginacion() {
    console.log("Nueva cantidad de elementos por página:", this.itemsPerPage);
    this.p = 1; // Reinicia la paginación cuando cambia la cantidad de elementos por página
  }

  validarInventarioFun(){

    const fechaActual = new Date();
  // Formatear la fecha al formato YYYY-MM-DD
    this.formattedDate = fechaActual.toISOString().split('T')[0];

    console.log("Fecha formateada : ", this.formattedDate);
    
    this.periodo = fechaActual.getFullYear().toString();
    console.log("periodo ", this.periodo);
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    console.log("mes : ", this.mes);

    this.selectedPeriodo = this.periodo;
    this.selectedMes = this.mes;

    const token = sessionStorage.getItem("authToken");
    const decodedToken = this.authService.decodeToken(token);
    this.usuario = decodedToken.username;
    console.log("validarInicioInventario : ", this.formattedDate);
    this.invetarioServices.validarInicioInventario(this.formattedDate).subscribe({
      next: (response) => {
        console.log("response : ", response);
        if (!response.data) {
          console.log("Error: response.data es null o undefined." , response);
          this.tiposItems = []; // Evita el error de map() al asignar un array vacío
        } else if (!Array.isArray(response.data)) {
          console.log("Error: response.data no es un array. Valor recibido:", response.data);
          this.tiposItems = [];
        }else{
          this.respuestaValidaInicioInventario = response.data;

          this.tiposItems = response.data;
        
        //  this.tiposItems = [...new Map(this.tiposItems.map(item => [item.Tipoitem, item])).values()];

        this.tiposItems= TIPOS_ITEMS;
        
  
          this.isLoading = true;
          if (response.data.length === 0 ) {
            // Mostrar el pop-up cuando el código sea 0
            const mensaje = `Usted no ha iniciado el inventario`;
            this.openConfirmDialog( mensaje);
            this.habilitarBoxes = false;
          }else {
            this.habilitarBoxes =  true;
          }
        }
      
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta:', error);
        this.mostrarMensaje("Ocurrió un error al obtener los datos.");
      },
      complete: () => {
        this.calcularTotales()
        this.isLoading = false;
        
      },
    });
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.inventarioData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Inventario': worksheet }, SheetNames: ['Inventario'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'inventario.xlsx');
  }

  actualizarConteo(){ 
    this.isLoading = true;
    this.mostrarGrafico = false;
    const grupoEncontrado = this.grupoList.find(grupo => grupo.NumeroLocal === this.selectedLocal);
  
    const data = {
        periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
        mes: parseInt(this.selectedMes, 10) || null, 
        tipoItem: this.selectedTipoItem,
        local: this.selectedLocal,
        grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null, // Devuelve el número en lugar de un array
        fechaInventario: this.selectedFechaInicio,
    };

    console.log("data:", data);

    this.invetarioServices.actualizarSaldosSinCierre(data).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor actualizarSaldosSinCierre:', response);
    },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta:', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al actual los datos."); setTimeout(() => {
          this.errorMessage = false;

        }, 2000);
      },
      complete: () => {
      
        const dataActualizaTabla = {
          periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
          mes: parseInt(this.selectedMes, 10) || null, 
          tipoItem: this.selectedTipoItem,
          local: this.selectedLocal,
          grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null, // Devuelve el número en lugar de un array,
          fechaInventario: this.selectedFechaInicio,
      };
        this.actualizaTabla(dataActualizaTabla);
        this.isLoading = false;
       
        
      },
    });
  }

  actualizaTabla(data: any) {
    this.mostrarGrafico= false;
   // const fecha = new Date('2025-02-31');
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
        console.log('Respuesta actualizaTabla:', response);
        this.isLoading = true;
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.successMessage = true;
          this.mostrarMensaje(`DEBE INICIAR INVENTARIO DE ${data.tipoItem}`);
          this.inventarioData = [];
          this.resetFormulario();
          this.showTable = false;
        } else {
          this.mensaje = ""; // Limpiar mensaje si hay datos
          this.inventarioData = response.data.recordset;
          this.showTable = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta:', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al obtener los datos actualizaTabla");
      },
      complete: () => {
        this.calcularTotales();
        this.successMessage = true;
        this.mostrarGrafico = true
        this.isLoading = false;
        this.successMessage = true;
        this.mensaje = 'Inventario Actualizado correctamente';
        this.consultaTablaRegistro();
        setTimeout(() => {
          this.successMessage = false;
        }, 2500);
      },
    })
  }

  filterItems() {
    if (!this.searchQuery.trim()) {
        this.filteredInventarioData = [...this.inventarioData]; // Restaurar datos originales
    } else {
        this.filteredInventarioData = this.inventarioData.filter(item =>
            item.Item.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
    this.p = 1; // Reiniciar paginación a la primera página
}

  consultaTablaRegistro(){
    
    const data = {
          tipoItem: this.selectedTipoItem,
          local: this.selectedLocal,
          fechaInventario: this.selectedFechaInicio
        };
    
   
    this.isLoading = true;
    this.showTable = false;
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
        console.log('Respuesta consultaInventario:', response);

        this.totalItems = response.data.recordset.length;
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.sinInventarioIniciado =  true;
          this.showTable = false;
          this.errorMessage = true;
          this.mostrarFlecha = true;
          this.mostrarMensaje(`${response.info.mensaje}`);
          this.inventarioData = [];
          this.resetFormulario();
          setTimeout(() => {
           this.mostrarFlecha = false;
          }, 8000);
 
        } else {
          this.sinInventarioIniciado =  false;
         // this.mensaje = ""; // Limpiar mensaje si hay datos
          this.inventarioData = response.data.recordset;
          this.filteredInventarioData = [...this.inventarioData]; // Copia para el filtrado
          this.showTable = true;
          this.mostrarFlecha = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        console.error('Error en la consulta:', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al obtener los datos.");
      },
      complete: () => {
        if(this.sinInventarioIniciado){

          this.showTable= false;
          this.mostrarGrafico = false
          this.isLoading = false;
        }else{
          this.calcularTotales()
          console.log("se calcularon los totales");
          this.mostrarGrafico = true;
          this.showTable= true;
          
        
          this.validarCierreInventario(data);
          this.validarCantidadReconteos(data);
        }
        
        
      },
    });
  }

  cerrarInventario(){
    this.isLoading = true;
    this.mostrarGrafico = false;
    const grupoEncontrado = this.grupoList.find(grupo => grupo.NumeroLocal === this.selectedLocal);
  
   const data = {
        periodo: this.selectedPeriodo,  // Convierte a número, si falla asigna null
        mes: parseInt(this.selectedMes, 10) || null, 
        tipoItem: this.selectedTipoItem,
        local: this.selectedLocal,
        grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null,
        fechaInventario: this.selectedFechaInicio, // Devuelve el número en lugar de un array
    };

    console.log("data:", data);

    this.invetarioServices.cierreInventario(data).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor cierreInventario:', response);
        this.codigoBloqueo = response.codigo === 0 ? true: false;
    },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta: cierreInventario', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al cierreInventario."); 
        setTimeout(() => {
          this.errorMessage = false;

        }, 2000);
      },
      complete: () => {
      
        const dataActualizaTabla = {
          periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
          mes: parseInt(this.selectedMes, 10) || null, 
          tipoItem: this.selectedTipoItem,
          local: this.selectedLocal,
          grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null, // Devuelve el número en lugar de un array
          fechaInventario: this.selectedFechaInicio,
      };
        this.actualizaTabla(dataActualizaTabla);
        
        
      },
    });
    
  }

  validarCierreInventario(data: any){
    console.log("validaaaqaaciereeeee" , data);
    this.isLoading = true;
    this.invetarioServices.validarCierreInventario(data.tipoItem, data.local , data.fechaInventario).subscribe({
      next: (response) => {
        console.log('Respuesta valida cierre inventario:', response);

        this.codigoBloqueo = response.data.Estado === 1 ? true : false;
    
       
      },
      error: (error) => {
        this.isLoading = false;
        this.mostrarMensaje(`Error al validar cierre inventario`);
       
        setTimeout(() => {
          this.errorMessage = false;

        }, 10000);

      },
      complete: () => {

        if(this.codigoBloqueo){
          this.successMessage = true; 
          this.isLoading = false;
          this.mostrarMensaje(`Inventario Cerrado , Solo puede Exportar los datos a Exel e iniciar el reconteo.`);
         
          setTimeout(() => {
            this.successMessage = false;
  
          }, 10000);
        }else{
          this.isLoading = false;
        }
       
      },
    });
  }
  
  separarFecha(fecha: Date | string | null): { periodo: string, mes: string, dia: number } {
    // Si la fecha es null, retornamos valores predeterminados
    if (fecha === null) {
      console.log('Error: fecha es null');
      return { periodo: '', mes: '', dia: 0 };
    }
  
    // Si la fecha no es de tipo Date, intentamos convertirla a Date
    if (!(fecha instanceof Date)) {
      // Si la fecha es una cadena, intentamos crear un objeto Date
      if (typeof fecha === 'string') {
        fecha = new Date(fecha);
      } else {
        console.log('Error: el parámetro no es una fecha válida');
        return { periodo: '', mes: '', dia: 0 };  // Retorna valores predeterminados si no se puede convertir
      }
    }
  
    // Verificar si la conversión fue exitosa
    if (isNaN(fecha.getTime())) {
      console.log('Error: la fecha no es válida');
      return { periodo: '', mes: '', dia: 0 };  // Retorna valores predeterminados si la fecha no es válida
    }
  
    // Si la fecha es válida, procesamos el año, mes y día
    console.log('Tipo de datos de fecha:', typeof fecha);  // Esto te mostrará el tipo de datos
  
    const periodo = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate();
    
    return { periodo, mes, dia };
  }

  reconteo(){
  
    console.log("this.cantidadReconteos," , this.cantidadReconteos);
    const mensaje = `¿Desea sumar el almacenaje?`;
    const grupoEncontrado = this.grupoList.find(grupo => grupo.NumeroLocal === this.selectedLocal);
    
    const datosInventario = {
      tipoItem: this.selectedTipoItem,
      local: this.selectedLocal,
      fechaInventario: this.selectedFechaInicio,
      bodega: grupoEncontrado.GrupoBodega,
      loading: this.isLoading,
      numeroReconteo :  this.cantidadReconteos,
      almacenamiento: this.almacenamiento,
    };

    console.log("datosInventario : ",datosInventario)

    this.myDataService.setReconteoData(datosInventario);

    if(this.cantidadReconteos === 1){
      this.router.navigate(['/asignacion-reconteos']);
    }else{
      this.almacenamientoConfirmDialog(mensaje, datosInventario);
    }

    // this.almacenamientoConfirmDialog(mensaje, datosInventario);
   
    
  }


  validarCantidadReconteos(data: any) {
    
    this.invetarioServices.validarCantidadReconteos(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
      
        if (response?.data?.NumeroReconteo !== undefined) {
          console.log('Entró al IF: NumeroReconteo es', response.data.NumeroReconteo);
  
          this.ultimo = response.data.NumeroReconteo;
          this.cantidadReconteos = isNaN(this.ultimo) ? 1 : this.ultimo + 1;
        } else {
          console.log('Entró al ELSE: Accion es undefined o no existe');
          this.cantidadReconteos = 1;
        }
  
        console.log('this.cantidadReconteos', this.cantidadReconteos);
      },
      error: (error) => {
        console.error('Error al validar cantidad de reconteos:', error);
        // this.cantidadReconteos = 1;
      },
      complete: () => {
        // Aquí puedes hacer algo adicional si es necesario
      },
    });
  }

  onToggleAlmacenamiento(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.almacenamiento = checked ? 'S' : 'N';
    console.log('almacenamiento:', this.almacenamiento);
  }
  
  

}


