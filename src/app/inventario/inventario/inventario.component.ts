import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from 'app/auth/auth.guard';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { ConfirmInventarioDialogComponent } from 'app/shared/confirm-inventario-dialog/confirm-inventario-dialog.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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

  periodo : any;
  mes : any;
  usuario:any;
  

  mensaje: string = ''; // Mensaje para el usuario
  inventarioData: any[] = [];  // Lista completa de 18,000 registros
  filteredInventarioData: any[] = []; // Lista filtrada
  searchQuery: string = '';  // Lo que el usuario escribe en el input

 
  isLoading: boolean = false;
  showTable:boolean= false;
  habilitarBoxes: boolean= false;
  successMessage: boolean = false;
  errorMessage: boolean = false;
  grupoList: any;
  mostrarGrafico : boolean = false;

  p: number = 1; // Página actual
  itemsPerPage: number = 5; // Elementos por página

  saldoTotal : number = 0;
  conteoTotal : number = 0;
  titulo: string=''
  respuestaValidaInicioInventario : any;
  meses = [
    { nombre: 'Enero', codigo: '01' },
    { nombre: 'Febrero', codigo: '02' },
    { nombre: 'Marzo', codigo: '03' },
    { nombre: 'Abril', codigo: '04' },
    { nombre: 'Mayo', codigo: '05' },
    { nombre: 'Junio', codigo: '06' },
    { nombre: 'Julio', codigo: '07' },
    { nombre: 'Agosto', codigo: '08' },
    { nombre: 'Septiembre', codigo: '09' },
    { nombre: 'Octubre', codigo: '10' },
    { nombre: 'Noviembre', codigo: '11' },
    { nombre: 'Diciembre', codigo: '12' }
  ];

  tiposItems: any = [];

  locales = [
    { descripcion: 'Casa Matriz ENEA', codigo: '01'},
    { descripcion: 'Serv. Tecnico Temuco', codigo: '03'},
    { descripcion: 'Centro de Servicios Antofagasta', codigo: '04'},
    { descripcion: 'Centro de Servicios Copiapo', codigo: '05'}
  ];


  constructor(
    private invetarioServices: InventarioService , 
    private dialog: MatDialog,
    private authService: AuthGuard,
    ) {}

  ngOnInit(): void {
    this.validarInventarioFun();
    this.obtenerGrupoLocal();
  }
  openDialog(mensaje: string){
    this.openConfirmDialog(mensaje);
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
    // Añadir la clase 'loading' al body para desactivar interacciones
    
    if(!this.habilitarBoxes){
      const mensaje = `Usted no ha iniciado el inventario`;
      this.openConfirmDialog(mensaje);
      this.isLoading = false;
      
    }else{
      this.consultaTablaRegistro();
      
    }
    
  }


  calcularTotales() {
    // Sumamos los valores de "SaldoStock" y "Conteo" de cada fila
   
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
    }, 3000); // Ocultar mensaje después de 2 segundos
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
    console.log('Mes seleccionado:', this.selectedMes);
    console.log('Tipo de ítem seleccionado:', this.selectedTipoItem);
    console.log('Local seleccionado:', this.selectedLocal);
    console.log('Periodo seleccionado:', this.selectedPeriodo);
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
  
    this.periodo = fechaActual.getFullYear().toString();
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');

    this.selectedPeriodo = this.periodo;
    this.selectedMes = this.mes;

    const token = sessionStorage.getItem("authToken");
    const decodedToken = this.authService.decodeToken(token);
    this.usuario = decodedToken.username;
    
    this.invetarioServices.validarInicioInventario(this.periodo, this.mes).subscribe({
      next: (response) => {
        if (!response.data) {
          console.log("Error: response.data es null o undefined.");
          this.tiposItems = []; // Evita el error de map() al asignar un array vacío
        } else if (!Array.isArray(response.data)) {
          console.log("Error: response.data no es un array. Valor recibido:", response.data);
          this.tiposItems = [];
        }else{
          this.respuestaValidaInicioInventario = response.data;

          this.tiposItems = response.data;
        
          this.tiposItems = [...new Map(this.tiposItems.map(item => [item.Tipoitem, item])).values()];
        
  
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
        grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null // Devuelve el número en lugar de un array
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
          grupo: grupoEncontrado ? grupoEncontrado.GrupoBodega : null // Devuelve el número en lugar de un array
      };
        this.actualizaTabla(dataActualizaTabla);
        this.isLoading = false;
       
        
      },
    });
  }


  actualizaTabla(data: any) {
    this.mostrarGrafico= false;
    this.invetarioServices.consultaInventario(data.periodo, data.mes, data.tipoItem, data.local).subscribe({
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
        this.calcularTotales()
        this.mostrarGrafico = true
        this.isLoading = false;
        this.successMessage = true;
        this.mensaje = 'Saldos Actualizados correctamente';
        setTimeout(() => {
          this.successMessage = false;

        }, 2000);
      },
    });
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
      periodo: this.selectedPeriodo,
      mes: this.selectedMes,
      tipoItem: this.selectedTipoItem,
      local: this.selectedLocal
    };
    
    this.isLoading = true;
    this.showTable = false;
    this.invetarioServices.consultaInventario(data.periodo, data.mes, data.tipoItem, data.local).subscribe({
      next: (response) => {
        console.log('Respuesta consultaInventario:', response);
        
        if (response.data && response.data.recordset && response.data.recordset.length === 0) {
          this.successMessage = true;
          this.mostrarMensaje(`DEBE INICIAR INVENTARIO DE ${data.tipoItem}`);
          this.inventarioData = [];
          this.resetFormulario();
          this.showTable = false;
        } else {
          this.mensaje = ""; // Limpiar mensaje si hay datos
          this.inventarioData = response.data.recordset;
          this.filteredInventarioData = [...this.inventarioData]; // Copia para el filtrado
          this.showTable = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        console.error('Error en la consulta:', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al obtener los datos.");
      },
      complete: () => {
        this.calcularTotales()
        this.showTable= true;
        this.mostrarGrafico = true
        this.isLoading = false;
        
      },
    });
  }



} //FIN CLASE


