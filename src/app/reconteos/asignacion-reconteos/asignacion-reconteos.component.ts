import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyDataService } from 'app/services/data/my-data.service';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { LOCALES, MESES, OPERARIOS, TIPOS_ITEMS } from 'app/shared/constants';
import { take } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-asignacion-reconteos',
  templateUrl: './asignacion-reconteos.component.html',
  styleUrls: ['./asignacion-reconteos.component.scss']
})
export class AsignacionReconteosComponent implements OnInit {

  successMessage: boolean = false;
  errorMessage: boolean = false;
  requestReconteo: any;
  nuevoNombre: string = '';
  listaNombres: { nombre: string }[] = [];
  tipoItem:any;
  listaItems: any[] = [];
  listaSinUsuarios:any [] =[];
  usuariosValidos: string[] = [];
  mensaje: string = ''; // Mensaje para el usuario
  reconteosData: any;
  isLoading: boolean = false;

  cantidadReconteo: number = 0; // 
  cantidadPersonas: number = 1; // 
  operarios: { nombre: string }[] = []; // Arreglo de operarios
  cantidadOperarios: number = 0;
  showMostrarBody = false;

  showMostrarTarjetas = false;
  
  showAsignarReconteos: boolean = false;

  operariosAsignados :any[] = [];

  groupedByUsuario: any[] = [];

  porcentajeReconteo: number = 60;
  
  ItemsRecibidos: number = 0;
  ItemsEnviados: number = 0;
  nuevaCantidad: number = 1;
  listaRegistros: any[] = [];
  itemsPerPage: number = 5; // Elementos por página
  p: number = 1; // Página actual
  cantidadActual: any;

  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';
  filteredInventarioData: any[] = []; // Lista filtrada
  totalDirefencias: any;

  mostrarCeros: boolean = true;
  mostrarCantidadReconteoHeader  : boolean =  false;
  asignaciones: any[] = [];
  totalRecuento:  any;
  reconteosTotales: any;

  itemsContados: number = 0;
  reconteoTotal: number = 0;


  @ViewChildren('inputElement') inputs!: QueryList<ElementRef>;

  constructor(private dataService: MyDataService,
              private invetarioServices: InventarioService,
             private myDataService: MyDataService,
  ) { }

  ngOnInit(): void {
    
   
    this.isLoading = true;
    this.cargarAsignaciones();
    
    this.consultaTablaRegistro();
    
    // recuperamos la dta que se setea en la pantalla de inventario
    this.dataService.getReconteoData().pipe(take(1)).subscribe({
      next: (response) => {
        console.log("<<<<<>>>>>>",response)
        this.isLoading = true;
        this.requestReconteo = response; // dato de entrada para servicios
        this.reconteosData = response.numeroReconteo; // el numeros  ereconteo que vamos
        this.tipoItem = response.tipoItem.substring(3);
      
       
      },
      error: (error) => {
        console.error("Error al obtener responseReconteo", error);
        // Lógica de manejo de errores
      },
      complete: () => {
        
        if(this.reconteosData === 1 ){
     
          this.iniciarReconteos(this.requestReconteo);
        }else{
          this.siguienteReconteo(this.requestReconteo);
        }
      },
    });
   this.cantidadActual = sessionStorage.getItem('cantidadReconteos');
   console.log("cantidadActual02", this.cantidadActual);
   
  }

  ngAfterViewInit() {
    // Enfocar el primer input al cargar
    if (this.inputs.first) {
        this.inputs.first.nativeElement.focus();
    }
  }
  actualizarPaginacion() {
      
    this.p = 1; // Reinicia la paginación cuando cambia la cantidad de elementos por página
  }
  
  obtenerReconteo(data : any ){
    
    console.log("data", data) ;
    this.invetarioServices.consultarReconteo(data).subscribe({
      next: (response) => {
      
        console.log("obtener reconteos ...", response);
        this.cantidadReconteo = response.data.length;
        this.listaItems= response.data;
        this.itemsContados  = response.itemsContados;
        this.reconteoTotal = response.reconteoTotal;

        console.log("CANTIDAD DE RECONTEOS",this.cantidadReconteo)
        if(this.itemsContados === this.reconteoTotal){          
          this.nuevaCantidad = parseInt(sessionStorage.getItem('cantidadReconteos'), 10) ;
          const cantidad = parseInt(sessionStorage.getItem('cantidadReconteos'), 10) + 1;
          console.log("*************************" , cantidad);
         // sessionStorage.setItem('cantidadReconteos', this.nuevaCantidad.toString());
          sessionStorage.setItem('proximoReconteo', cantidad.toString());
          sessionStorage.setItem('cantidadReconteos', cantidad.toString());
       
          return;
          // Sumar 1
         
        }

        this.listaSinUsuarios = this.listaItems.filter(
          (item: any) => !item.Usuario || item.Usuario.trim() === ''
        );
      
        if(this.listaSinUsuarios.length === 0 ){

          this.showMostrarBody = false;
         
        }else{
          this.showMostrarBody = true;
          this.showMostrarTarjetas = false;
          
        }
      },
      error: (error) => {},
      complete: () => {
        this.nuevaCantidad =  parseInt(sessionStorage.getItem('cantidadReconteos'), 10);
        this.agruparItemsPorUsuario(this.listaItems)
        setTimeout(() => {
          this.isLoading = false;
        
         }, 5000);
        
      },
    });
  }

  iniciarReconteos(data : any ){
    this.invetarioServices.iniciarReconteo(data).subscribe({
      next: (response) => {
    
        console.log("Error : B: :" , response);
       
      },
      error: (error) => {  console.log("Error : C: :" , error);},
      complete: () => {
        
        this.obtenerReconteo(data);
        this.consultaTablaRegistro();
          setTimeout(() => {
            this.isLoading = false;
            this.showMostrarTarjetas = !this.showMostrarBody ? true : false;
           }, 5000);
        },
    });
  }

  siguienteReconteo(data : any ){
    
    this.isLoading = true;
    
    data.numeroReconteo = sessionStorage.getItem('cantidadReconteos');

    this.reconteosData = parseInt(sessionStorage.getItem('cantidadReconteos'), 10);
    this.invetarioServices.siguienteReconteo(data).subscribe({
      next: (response) => {
        console.log("siguiente reconteo ...", response);
      },
      error: (error) => { 
        console.error("Error ...", error);
        this.isLoading = false;},
      complete: () => {
        
         this.obtenerReconteo(data)
         
          setTimeout(() => {
          console.log("showMostrarBody", this.showMostrarBody);
            this.isLoading = false;
            this.showMostrarTarjetas = !this.showMostrarBody ? true : false;
  
          }, 5000);
      },
    });
  }

  agregarNombre() {
    this.showMostrarBody = false;
    this.isLoading = true;
    this.listaNombres = this.operarios
      .filter(op => op.nombre.trim() !== '') // Filtra vacíos
      .map(op => ({ nombre: op.nombre })); // Obtiene solo los nombres
    
      console.log("listaNombres", this.listaNombres);
      console.log("listaItemsasasasas", this.listaItems);
    const resultado = this.dividirReconteos(this.listaItems, this.listaNombres);
    
    console.log("resultado", resultado);

    this.invetarioServices.asignarReconteos(resultado ).subscribe({
      next: (response) => {
        
        // Filtrar los nombres únicos de usuarios sin capturador
        const usuariosSinCapturador = Array.from(
          new Set(response.fallidos.map(item => item.usuario))
        );
        
        if (usuariosSinCapturador.length > 0) {
          // Crear un solo mensaje con los nombres
          const mensaje = `Los siguientes usuarios no tienen capturador asignado: ${usuariosSinCapturador.join(', ')}`;
          this.mostrarMensaje(mensaje);  // Mostrar el mensaje completo
          this.errorMessage = true;
        } else {
          // Si no hay fallidos, mostrar un mensaje de éxito
          this.successMessage = true;
          this.mostrarMensaje("Asignación de reconteos exitosa");
        }
       
      },
      error: (error) => {
        
        this.errorMessage = true;
        this.mostrarMensaje("Error al asignar reconteos"); 
        this.isLoading= false;
      },
      complete: () => {
     
        this.isLoading= false;
        // ACA LLAMAR A LA ACTUALIZACION DE LA LISTA DE ASIGNADOS
        this.showMostrarTarjetas = true;

       // this.successMessage = true;
        //this.mostrarMensaje("Asignación de reconteo exitosa");
        this.cantidadPersonas = 0;
        this.operarios = [];
        this.consultaTablaRegistro();
        this.obtenerReconteo(this.requestReconteo); 
       
      
      },
    });
  }
  
  actualizarOperarios() {
    // Verificar cuántos operarios se necesitan y ajustar la lista
    if (this.operarios.length < this.cantidadPersonas) {
      // Si la cantidad actual de operarios es menor, agregar más operarios vacíos
      const cantidadNueva = this.cantidadPersonas - this.operarios.length;
      this.operarios.push(...Array.from({ length: cantidadNueva }, () => ({ nombre: '' })));
    } else if (this.operarios.length > this.cantidadPersonas) {
      // Si hay más operarios de los necesarios, eliminar los excedentes
      this.operarios = this.operarios.slice(0, this.cantidadPersonas);
    }
  
    
  }
  
  
  capitalizar(texto: string): string {
    return texto
      .toLowerCase() // Convertir todo a minúsculas primero
      .replace(/\b\w/g, letra => letra.toUpperCase()); // Capitalizar cada palabra
  }


  formatearNombre(event: Event, index: number): void {
    const target = event.target as HTMLParagraphElement;
    let texto = target.textContent || "";
  
    // Guardar la posición actual del cursor
    const selection = window.getSelection();
    const range = document.createRange();
    const cursorPos = selection?.focusOffset ?? texto.length;
  
    // Formatear: Primera letra de cada palabra en mayúscula
    const nombreFormateado = texto
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  
    // Actualizar el array de operarios
    this.operarios[index].nombre = nombreFormateado;
  
    // Reemplazar el contenido del elemento sin invertir el texto
    target.textContent = nombreFormateado;
  
    // Restaurar la posición del cursor
    range.setStart(target.childNodes[0], Math.min(cursorPos, nombreFormateado.length));
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  actualizarCantidad() {
    const nuevaCantidad = this.cantidadOperarios;

    if (nuevaCantidad > this.operarios.length) {
      // Agregar más operarios si el número aumenta
      for (let i = this.operarios.length; i < nuevaCantidad; i++) {
        this.operarios.push({ nombre: '' });
      }
    } else if (nuevaCantidad < this.operarios.length) {
      // Eliminar los últimos si el número disminuye
      this.operarios.splice(nuevaCantidad);
    }
  }

  dividirReconteos(listaItems: any[], listaNombres: { nombre: string }[]): any[] {
    const totalItems = listaItems.length; 
    const cantidadNombres = listaNombres.length;
  
    // Calcular cuántos items recibe cada nombre (parte entera)
    const itemsPorNombre = Math.floor(totalItems / cantidadNombres);
  
    // Creamos un array para los resultados
    const resultado = [];
  
    // Dividimos los ítems entre los nombres
    let itemIndex = 0;
    listaNombres.forEach((nombre, i) => {
      // Si es el último nombre, le damos el resto también
      let fin = (i === cantidadNombres - 1) 
        ? totalItems // hasta el final
        : itemIndex + itemsPorNombre;
  
      const itemsAsignados = listaItems.slice(itemIndex, fin);
      
      resultado.push({
        cantidad : sessionStorage.getItem('cantidadReconteos'),
        nombre: nombre.nombre,
        data: itemsAsignados
      });
  
      itemIndex = fin; // Actualizamos el índice de inicio para el siguiente
    });
  
    
    return resultado;
  }
  
  
  obtenerAsignacionesusuarios() {
   
    this.invetarioServices.obtenerAsignaciones().subscribe({
      next: (response) => {
     
        this.usuariosValidos = response.data;
        
        
      },
      error: (error) => {},
      complete: () => {
        
    },
    });
  }

  mostrarMensaje(texto: string) {
    this.mensaje = texto;
    setTimeout(() => {
      this.mensaje = "";
      this.successMessage = false;
      this.errorMessage = false;
     
    }, 5000); // Ocultar mensaje después de 2 segundos
  }
  

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet( this.listaRegistros);
    const workbook: XLSX.WorkBook = { Sheets: { 'inventario-reconteos': worksheet }, SheetNames: ['inventario-reconteos'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'inventario-reconteos.xlsx');
  }
  
  agruparItemsPorUsuario(lista: any[]){
    const listaFiltrada = lista.filter(item => item.Estado === "EnProceso");
    
    const agrupadoPorUsuario: { [key: string]: any[] } = {};
  
    listaFiltrada.forEach(item => {
      const usuario = item.Usuario; // Usa 'Usuario' con U mayúscula
  
      if (!agrupadoPorUsuario[usuario]) {
        agrupadoPorUsuario[usuario] = [];
      }
  
      agrupadoPorUsuario[usuario].push(item);
    });
  
    this.groupedByUsuario = Object.keys(agrupadoPorUsuario).map(nombre => ({
      nombre,
      data: agrupadoPorUsuario[nombre]
    }));
  }
  

   setCapturadores(){
    
    this.dataService.getArrayCap().pipe(take(1)).subscribe({
      next: (response) => {
        
        this.operariosAsignados = response;
      },
      error: (error) => {
        console.error("Error al obtener asignacion de capturadores", error);
        // Lógica de manejo de errores
      },
      complete: () => {

    
      },
    });
  }

  actualizarDatos(){
    this.isLoading = true;
    this.obtenerReconteo(this.requestReconteo);
    this.consultaTablaRegistro();
    setTimeout(() => {
      this.isLoading = false;
     // this.showMostrarTarjetas = true;
    }, 5000);
  }
  
  volverAtras() {
    window.history.back();
  }


  
  formateaReconteo(){
    const data = this.requestReconteo;
    this.siguienteReconteo(data);
  }

  consultaTablaRegistro(){
    this.cantidadActual = sessionStorage.getItem('cantidadReconteos');
    console.log("cantidadActual01", this.cantidadActual);
    const requestStorage = JSON.parse(sessionStorage.getItem('data'));
    
    if (!requestStorage || Object.keys(requestStorage).length === 0) {
      
      return; // Salir si no hay datos
    }
    const data = {
          tipoItem: requestStorage.tipoItem,
          local: requestStorage.local,
          fechaInventario: requestStorage.fechaInventario
        };
    
    // Guarda el objeto convertido en string
    sessionStorage.setItem('data', JSON.stringify(data));
    
    this.invetarioServices.consultaInventario(data.tipoItem, data.local, data.fechaInventario).subscribe({
      next: (response) => {
  
        this.listaRegistros = response.data.recordset;
        this.calcularDiferencias(this.listaRegistros);
        this.filteredInventarioData = [...this.listaRegistros];
      
      },
      error: (error) => {
       
        
        console.error('Error en la consulta:', error);
        this.errorMessage = true;
        this.mostrarMensaje("Ocurrió un error al obtener los datos.");
      },
      complete: () => {
       
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
    sessionStorage.setItem('totalDirefencias', JSON.stringify(this.totalDirefencias));
  }




  cargarAsignaciones() {
   
    this.invetarioServices.obtenerAsignaciones().subscribe({
      next: (response) => {
        console.log('Respuesta obtenerAsignaciones  - servidor:', response);
        this.operariosAsignados = response.data;
        

        this.myDataService.setArrayCap(this.asignaciones); // Actualiza el BehaviorSubject con los datos obtenidos
      },
      error: (error) => {
 

        setTimeout(() => {
          this.mensaje = `Error  ${JSON.stringify( error.error.error)}`;
        
       
        }, 1000); 
       
      },
      complete: () => {
        console.log('Proceso exitoso');
      },
    });
  }

  obtenerFilasFiltradas() {
    
  
    if (!this.mostrarCeros) {
   
      return this.filteredInventarioData;
    } else {
      // Determinar cuál es la última columna de diferencia visible
      const keyUltimaDiferencia = this.nuevaCantidad === 1 
        ? 'Diferencia' 
        : 'Diferencia0' + (this.nuevaCantidad - 1);
  
      const filtradas = this.filteredInventarioData.filter(row => {
        const valor = row[keyUltimaDiferencia];
        console.log(`Revisando ${keyUltimaDiferencia}:`, valor);
        return valor !== 0;
      });
  
     
      return filtradas;
    }
  }
  


}