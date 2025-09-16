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
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { ReconteoData } from 'app/models/user.model';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class InventarioComponent implements OnInit {

  // Variables del formulario
  selectedMes: string;
  selectedPeriodo: string;
  selectedTipoItem: string;
  selectedLocal: string;
  selectedGrupo: string;
  mensajeCargado: string = '';
  inventarioTerminado: boolean = false;
  botonInventarioTerminado: boolean  = false;

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
  listaRegistros: any[] = [];

  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';

  totalDirefencias : number = 0 ;
  mostrarCeros: boolean = false;
  inventarioCerrado: boolean = false;

  textBoton: string = '';
  proximoReconteo: number = 0;


  dataActualiza: any = {};
  dataActualizaTabla: any = {};
  dataCerrarConteo: any = {};
  dataActualizaTablaCierre : any ={};
  datosInventarioReconteo: ReconteoData;
  grupo: any;

  constructor(
    private invetarioServices: InventarioService , 
    private dialog: MatDialog,
    private authService: AuthGuard,
    private router: Router,
    private myDataService: MyDataService
) {}

  ngOnInit(): void {
    this.obtenerGrupoLocal();
    this.validarInventarioFun();
    
  }
  
  openDialog(mensaje: string){
    this.mostrarFlecha= false;
    this.openConfirmDialog(mensaje);
    this.errorMessage= false;
  }
 
  openConfirmDialog(mensaje: string): void {
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
        
        this.titulo = result.data.categorias[0];
        this.mensaje = 'Inventario iniciado correctamente';
        this.validarInventarioFun()
        this.consultaTablaRegistroInicial(result.data)
        setTimeout(() => {
          this.successMessage = false;
          
        }, 5000);
       
      } else if (result?.action === 'cerrar') {
        
      }else{
        this.errorMessage = true;
        this.mensaje = 'Error al iniciar el inventario';
        
        this.validarInventarioFun()
        setTimeout(() => {
          this.errorMessage = false;

        }, 5000);
      }
    });
  }

  almacenamientoConfirmDialog(mensaje: string , datosFiltro : any): void {
    
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
          
        }, 5000);
       
      } else if (result?.action === 'cerrar') {
        
      }
    });
  }

  obtenerGrupoLocal(){
    
    this.invetarioServices.obtenerBodegas().subscribe({
      next: (response) => {
        
        this.grupoList = response.data;
        
        sessionStorage.setItem('respuestaGrupo', JSON.stringify(this.grupoList));
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
    
  }


  calcularTotales() {
    // Sumamos los valores de "SaldoStock" y "Conteo" de cada fila
    
    this.saldoTotal = this.inventarioData.reduce((total, row) => total + row.SaldoStock, 0);
    this.conteoTotal = this.inventarioData.reduce((total, row) => total + row.Conteo, 0);

    this.titulo = this.selectedTipoItem ? this.selectedTipoItem : this.titulo; ;        
  }
  
  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = "";
      this.successMessage = false;
      this.errorMessage = false;
    }, 5000); // Ocultar mensaje después de 2 segundos
  }

  /*resetFormulario() {   
    this.selectedTipoItem = "";
    this.selectedLocal = "";
    this.inventarioData = [];
  }*/

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedTipoItem && this.selectedLocal);
  }

  onChange() {
    if (this.selectedTipoItem === '03-ACCESORIOS' && this.selectedLocal === '01' ) {
      this.grupo = 1;
    } else if (this.selectedTipoItem === '03-ACCESORIOS' && this.selectedLocal === '02') {
      this.grupo = 2;
      this.selectedLocal ='01';
      
    } else if (this.selectedTipoItem === '01-HERRAMIENTAS' && this.selectedLocal === '01') {
      this.grupo = 1; // valor por defecto si no cumple
    }

    sessionStorage.setItem('tipoItem', this.selectedTipoItem || '');
    sessionStorage.setItem('local', this.selectedLocal || '');
    sessionStorage.setItem('fechaInventario', this.selectedFechaInicio || '');
    sessionStorage.setItem('grupo', this.grupo || '');
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
    
    this.p = 1; // Reinicia la paginación cuando cambia la cantidad de elementos por página
  }

  validarInventarioFun(){
    const fechaActual = new Date();
    
    this.formattedDate = fechaActual.toISOString().split('T')[0];
    this.periodo = fechaActual.getFullYear().toString();
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    this.selectedPeriodo = this.periodo;
    this.selectedMes = this.mes;

    const token = sessionStorage.getItem("authToken");
    const decodedToken = this.authService.decodeToken(token);
    this.usuario = decodedToken.username;
    
    this.invetarioServices.validarInicioInventario(this.formattedDate).subscribe({
      next: (response) => {
        
        if (!response.data) {
          
          this.tiposItems = []; // Evita el error de map() al asignar un array vacío
        } else if (!Array.isArray(response.data)) {
          
          this.tiposItems = [];
        }else{
          this.respuestaValidaInicioInventario = response.data;

          this.tiposItems = response.data;
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
    
    this.mensajeCargado = 'Se están actualizando los conteos ingresados...'
    this.isLoading = true;
    this.mostrarGrafico = false;
    const localGuardado = sessionStorage.getItem('local') || ''; 
    const grupoListRecuperado = JSON.parse(sessionStorage.getItem('respuestaGrupo') || '[]');
   
    const grupoEncontrado =grupoListRecuperado.find(grupo => grupo.NumeroLocal === localGuardado);
    
    if(localGuardado === '02'){
      this.dataActualiza = {
          periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
          mes: parseInt(this.selectedMes, 10) || null, 
          tipoItem: this.selectedTipoItem,
          local: '01',
          grupo: 2,
          fechaInventario: this.selectedFechaInicio,
      };

    }else{
      console.log("grupoListRecuperado : " , grupoListRecuperado);
     
   
      this.dataActualiza = {
          periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
          mes: parseInt(this.selectedMes, 10) || null, 
          tipoItem: this.selectedTipoItem,
          local: this.selectedLocal,
          grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null, // Devuelve el número en lugar de un array
          fechaInventario: this.selectedFechaInicio,
      };
    }
    
    console.log("[actualizarSaldosSinCierre] para actualizar los datos de la tabal inverntario: " , this.dataActualiza);

    this.invetarioServices.actualizarSaldosSinCierre(this.dataActualiza).subscribe({
      next: (response) => {
        console.log("response actualizarSaldosSinCierre : " , response);
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
        if(localGuardado === '02'){
          this.dataActualizaTabla = {
            periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
            mes: parseInt(this.selectedMes, 10) || null, 
            tipoItem: this.selectedTipoItem,
            local: '02',
            grupo: 2,
            fechaInventario: this.selectedFechaInicio,
          };
       }else{
          this.dataActualizaTabla = {
            periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
            mes: parseInt(this.selectedMes, 10) || null, 
            tipoItem: this.selectedTipoItem,
            local: this.selectedLocal,
            grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null, // Devuelve el número en lugar de un array,
            fechaInventario: this.selectedFechaInicio,
          };
       }
        
        this.actualizaTabla(this.dataActualizaTabla);
        setTimeout(() => {
          this.isLoading = false;
          
        }, 5000);
       
        
      },
    });
  }

  actualizaTabla(data: any) {
    this.mostrarGrafico= false;
   // const fecha = new Date('2025-02-31');
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
        
        this.isLoading = true;
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.successMessage = true;
          this.mostrarMensaje(`DEBE INICIAR INVENTARIO DE ${data.tipoItem}`);
          this.inventarioData = [];
         // this.resetFormulario();
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
     
        this.mensaje = 'Inventario Actualizado correctamente';
        this.consultaTablaRegistro();
        setTimeout(() => {
          //this.isLoading = false;
          this.successMessage = false;
        }, 5000);
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
          fechaInventario: this.selectedFechaInicio,
          grupoBodega: this.grupo

        };

        
    
    // Guarda el objeto convertido en string
    sessionStorage.setItem('data', JSON.stringify(data));
   

    this.isLoading = true;
    this.showTable = false;
    
    this.invetarioServices.consultaInventario2(data.tipoItem, data.local, data.fechaInventario , data.grupoBodega).subscribe({
      next: (response) => {
        
        this.totalItems = response.data.recordset.length;
        this.listaRegistros =  response.data.recordset;
       
        console.log("this.lista" , this.listaRegistros)
        this.calcularDiferencias(this.listaRegistros);
        
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
       
          this.sinInventarioIniciado =  true;
          this.showTable = false;
          this.errorMessage = true;
          this.mostrarFlecha = true;
          this.mostrarMensaje(`${response.info.mensaje}`);
          this.inventarioData = [];
         // this.resetFormulario();
          setTimeout(() => {
           this.mostrarFlecha = false;
          }, 5000);
 
        } else {
          this.sinInventarioIniciado =  false;
         // this.mensaje = ""; // Limpiar mensaje si hay datos
          this.inventarioData = this.listaRegistros;
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
          
          this.mostrarGrafico = true;
          this.showTable= true;
          
        setTimeout(() => {
         
            this.validarCierreInventario(data);
            this.validarCantidadReconteos(data);
            this.validarTerminoInventario(data);
          }, 1500);
         
        }
        
        
      },
    });
  }

  cerrarInventario(){
    
    this.mensajeCargado = 'Cerrando conteo ...'
    this.isLoading = true;
    this.mostrarGrafico = false;
    const localGuardado = sessionStorage.getItem('local') || ''; 
    const grupoEncontrado =sessionStorage.getItem('grupo') || '';
  
    console.log("grupoencontrado : " , grupoEncontrado);
    
    this.dataCerrarConteo = {
      periodo: this.selectedPeriodo,  // Convierte a número, si falla asigna null
      mes: parseInt(this.selectedMes, 10) || null, 
      tipoItem: this.selectedTipoItem,
      local: localGuardado,
      grupoBodega: grupoEncontrado,
      fechaInventario: this.selectedFechaInicio, // Devuelve el número en lugar de un array
    };
   
    this.invetarioServices.cierreInventario(this.dataCerrarConteo).subscribe({
      next: (response) => {
        console.log("response cierreInventario : " , response);
        this.codigoBloqueo = response.codigo === 0 ? true: false;
        console.log("response cierreInventario [cierreInventario] : " ,  this.codigoBloqueo);
    },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en la consulta: cierreInventario', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al cierreInventario."); 
        setTimeout(() => {
          this.errorMessage = false;

        }, 5000);
      },
      complete: () =>  {
        this.dataActualizaTablaCierre = {
        periodo: parseInt(this.selectedPeriodo, 10) || null,  // Convierte a número, si falla asigna null
        mes: parseInt(this.selectedMes, 10) || null, 
        tipoItem: this.selectedTipoItem,
        local: this.selectedLocal,
        grupo: this.grupo
        
      };
   
      this.actualizaTabla(this.dataActualizaTablaCierre);
      setTimeout(() => {
        this.isLoading = false;
          
      }, 5000);
      },
    });
    
  }

  validarCierreInventario(data: any){
    data.local = this.selectedLocal;
    data.grupo = this.grupo;
    this.isLoading = true;
    this.invetarioServices.validarCierreInventario2(data.tipoItem, data.local , data.fechaInventario, data.grupo).subscribe({
      next: (response) => {
        

        this.codigoBloqueo = response.data.Estado === 1 ? true : false;
    
        console.log("Validando Inventario Cerrado [validarCierreInventario] ... " ,  this.codigoBloqueo);
       
      },
      error: (error) => {
        this.isLoading = false;
        this.mostrarMensaje(`Error al validar cierre inventario`);
       
        setTimeout(() => {
          this.errorMessage = false;

        }, 5000);

      },
      complete: () => {

        if(this.codigoBloqueo){
          this.successMessage = true; 
          this.isLoading = false;
          this.mostrarMensaje(`Inventario Cerrado , Solo puede Exportar los datos a Exel e iniciar el reconteo.`);
         
          setTimeout(() => {
            this.successMessage = false;
  
          }, 5000);
        }else{
          this.isLoading = false;
        }
       
      },
    });
  }
  validarTerminoInventario(data: any){
    data.local = this.selectedLocal;
    data.grupo = this.grupo;
    this.isLoading = true;
    this.invetarioServices.validarTerminoInventario2(data.tipoItem, data.local , data.fechaInventario , data.grupo).subscribe({
      next: (response) => {
        console.log("Validando Inventario Terminado ... " , response);
        this.botonInventarioTerminado =  response.estado === 1 ?  true : false;
      },
      error: (error) => {
        this.isLoading = false;
        this.mostrarMensaje(`Error al validar el termino de inventario`);
       
        setTimeout(() => {
          this.errorMessage = false;

        }, 5000);

      },
      complete: () => {

        if(this.botonInventarioTerminado){
          this.successMessage = true; 
          this.isLoading = false;
          this.mostrarMensaje(`Inventario Terminado , Solo puede Exportar los datos.`);
          this.inventarioTerminado = true
          setTimeout(() => {
            this.successMessage = false;
  
          }, 5000);
        }else{
          this.isLoading = false;
        }
       
      },
    });
  }
  
  separarFecha(fecha: Date | string | null): { periodo: string, mes: string, dia: number } {
    // Si la fecha es null, retornamos valores predeterminados
    if (fecha === null) {
      
      return { periodo: '', mes: '', dia: 0 };
    }
  
    // Si la fecha no es de tipo Date, intentamos convertirla a Date
    if (!(fecha instanceof Date)) {
      // Si la fecha es una cadena, intentamos crear un objeto Date
      if (typeof fecha === 'string') {
        fecha = new Date(fecha);
      } else {
        
        return { periodo: '', mes: '', dia: 0 };  // Retorna valores predeterminados si no se puede convertir
      }
    }
  
    // Verificar si la conversión fue exitosa
    if (isNaN(fecha.getTime())) {
      
      return { periodo: '', mes: '', dia: 0 };  // Retorna valores predeterminados si la fecha no es válida
    }
  
    // Si la fecha es válida, procesamos el año, mes y día
    
  
    const periodo = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate();
    
    return { periodo, mes, dia };
  }

  reconteo(){
    
    const localGuardado = sessionStorage.getItem('local') || ''; 
    const tipoItem = sessionStorage.getItem('tipoItem') || '';
    const fechaInventario = sessionStorage.getItem('fechaInventario') || '';
    const grupo =  sessionStorage.getItem('grupo') || '';
    
    const mensaje = `¿Desea sumar el almacenaje?`;
    
    this.datosInventarioReconteo = {
        tipoItem: tipoItem,
        local: localGuardado,
        fechaInventario: fechaInventario,
        bodega: Number(grupo),
        loading: this.isLoading,
        numeroReconteo: this.proximoReconteo,
      };
    
    
    sessionStorage.setItem('datosInventario', JSON.stringify(this.datosInventarioReconteo));
    this.myDataService.setReconteoData(this.datosInventarioReconteo);

    if(this.cantidadReconteos === 1){
      this.router.navigate(['/asignacion-reconteos']);
    }else{
      this.almacenamientoConfirmDialog(mensaje, this.datosInventarioReconteo);
    }

    // this.almacenamientoConfirmDialog(mensaje, datosInventario);
   
    
  }


  validarCantidadReconteos(data: any) {
    data.local = this.selectedLocal;
    this.grupo = this.grupo;
    
    this.invetarioServices.validarCantidadReconteos2(data.tipoItem, data.local, data.fechaInventario , this.grupo).subscribe({
      next: (response) => {
        
      console.log("Validando Cantidad de Reconteos ... " , response);
        sessionStorage.setItem("itemsRecibidos" , response.itemsRecibidos ) ;
        if (response?.data?.NumeroReconteo !== undefined && response?.enProceso === 0) {
          
          this.cantidadReconteos  = response.data.NumeroReconteo;
          
          this.proximoReconteo = this.cantidadReconteos + 1;

          sessionStorage.setItem('cantidadReconteos', this.proximoReconteo.toString());
          sessionStorage.setItem('proximoReconteo', this.proximoReconteo.toString());

          this.textBoton =  `Ir a  Reconteo${this.proximoReconteo}`;
        
        } else if(response?.data?.NumeroReconteo !== undefined && response?.enProceso != 0  ) {
          
          this.cantidadReconteos = response.data.NumeroReconteo;

          this.textBoton =  `Ir a  Reconteo${this.cantidadReconteos}`;

          this.proximoReconteo = this.cantidadReconteos;

          sessionStorage.setItem('proximoReconteo', this.proximoReconteo.toString());
          sessionStorage.setItem('cantidadReconteos', this.cantidadReconteos.toString());
       
        
        }else{
          this.cantidadReconteos = 1;
          
          this.textBoton =  `Ir a Reconteo ${this.cantidadReconteos}`;
          this.proximoReconteo = this.cantidadReconteos;
          sessionStorage.setItem('cantidadReconteos', this.cantidadReconteos.toString());
          sessionStorage.setItem('proximoReconteo', this.proximoReconteo.toString());
        }
  
        
      },
      error: (error) => {
        console.error('Error al validar cantidad de reconteos:', error);
        // this.cantidadReconteos = 1;
      },
      complete: () => {
       // this.obtenerReconteo();
      },
    });
  }

  onToggleAlmacenamiento(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.almacenamiento = checked ? 'S' : 'N';
    
  }
  

  consultaTablaRegistroInicial(dataConsultaTabla: any){
    console.log("con esta data consultamos la tabla invenytario : " , dataConsultaTabla);
    const data = {
      tipoItem: dataConsultaTabla.categorias[0],
      local: dataConsultaTabla.grupoBodega === 2  ?  "02" : dataConsultaTabla.numeroLocal,
      fechaInventario: dataConsultaTabla.fechaInventario
      ,
    }
    
    console.log("dataaaaaaaaaaaaaaaaaaaa : " , data);
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
        next: (response) => {
          console.log("responseee : " , response);
          
          this.totalItems = response.data.recordset.length;
          this.listaRegistros =  response.data.recordset;
          
          this.calcularDiferencias(this.listaRegistros);
          if (response.data && response.data.recordset && response.data.recordset.length === 0) {
            this.sinInventarioIniciado =  true;
            this.showTable = false;
            this.errorMessage = true;
            this.mostrarFlecha = true;
            this.mostrarMensaje(`${response.info.mensaje}`);
            this.inventarioData = [];
          // this.resetFormulario();
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
            
            this.mostrarGrafico = true;
            this.showTable= true;
          
            this.validarCierreInventario(data);
            this.validarCantidadReconteos(data);
           // this.actualizarConteo();
          }
          
          
        },
      });
    }

  recargarDataRegistro(){
    
    const data = JSON.parse(sessionStorage.getItem('data'));
    
    
    if (!data || Object.keys(data).length === 0) {
      
      return; // Salir si no hay datos
    }
    this.isLoading = true;
    this.showTable = false;
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
        

        this.totalItems = response.data.recordset.length;
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.sinInventarioIniciado =  true;
          this.showTable = false;
          this.errorMessage = true;
          this.mostrarFlecha = true;
          this.mostrarMensaje(`${response.info.mensaje}`);
          this.inventarioData = [];
         // this.resetFormulario();
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
          
          this.mostrarGrafico = true;
          this.showTable= true;
          
        
        this.validarCierreInventario(data);
        this.validarCantidadReconteos(data);
        }
        
        
      },
    });
  }


  ordenarPor(columna: string): void {
    
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
  
    this.filteredInventarioData.sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];
  
      if (valorA < valorB) return this.direccionOrden === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }

  calcularDiferencias(lista: any[]): void {
    this.totalDirefencias = lista.filter(item => item.Diferencia !== 0).length;
    
    

    if(this.totalDirefencias === 0){
      this.totalDirefencias = this.totalItems;
    }

    sessionStorage.setItem('totalDirefencias', JSON.stringify(this.totalDirefencias));
  }

  obtenerFilasFiltradas() {
    if (!this.mostrarCeros) {
     
      return this.filteredInventarioData;
    } else {
      // Determinar cuál es la última columna de diferencia visible
      const keyUltimaDiferencia = this.cantidadReconteos === 1 
        ? 'Diferencia' 
        : 'Diferencia0' + (this.cantidadReconteos - 1);
  
      const filtradas = this.filteredInventarioData.filter(row => {
        const valor = row[keyUltimaDiferencia];
       
        return valor !== 0;
      });
  
    
      return filtradas;
    }
  }
  
  

  obtenerReconteo(){
    const data = JSON.parse(sessionStorage.getItem('data'));

    //data.numeroReconteo = this.cantidadReconteos;
    console.log("data-obtenerReconteo" , data);
    
    /*  this.invetarioServices.consultarReconteo(data).subscribe({
      next: (response) => {
        console.log("responseeeee :"  , response);
 
      },
      error: (error) => {},
      complete: () => {
       
        
      },
    });*/
  }

  terminarInventario(){
    this.isLoading = true;
    const localGuardado = sessionStorage.getItem('local') || ''; 
    const tipoItem = sessionStorage.getItem('tipoItem') || '';
    const fechaInventario = sessionStorage.getItem('fechaInventario') || '';

    console.log("001 localGuardado : " , localGuardado);
    
    const partes = fechaInventario.split('-');
    let agno = partes[0]; // "2025"
    let mes = partes[1];  // "05"
    let dia = partes[2];  // "09"
    
    const grupoListRecuperado = JSON.parse(sessionStorage.getItem('respuestaGrupo') || '[]');
    console.log("002 grupoListRecuperado : " , grupoListRecuperado);
    const grupoEncontrado =grupoListRecuperado.find(grupo => grupo.NumeroLocal === localGuardado);
    console.log("003 grupoEncontrado  : " , grupoEncontrado);
    const dataCierre = {
      agno: agno,
      mes: mes,
      fechaInventario: fechaInventario,
      tipoItem: tipoItem,
      local: localGuardado === '02' ? '01' : localGuardado,
      grupoBodega: grupoEncontrado === undefined  ? 2 :  grupoEncontrado.GrupoBodega,
    };
    console.log("requestCierre" , dataCierre);
    
    this.invetarioServices.terminarInventario({dataCierre}).subscribe({
     
      next: (response) => {
        this.inventarioTerminado = true;
        
        console.log("Respuesta al terminar el inventario" , response);
       
      },
      error: (error) => {
        console.log("Error al terminar el inventario" , error);
        this.isLoading = false;
       
      },
      complete: () => {
        this.isLoading = false;
        this.inventarioCerrado = true;
        this.botonInventarioTerminado = true;
        
      },
    });
    
  }
  
  
  
  

}


