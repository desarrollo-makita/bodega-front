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



  @ViewChildren('inputElement') inputs!: QueryList<ElementRef>;

  constructor(private dataService: MyDataService,
              private invetarioServices: InventarioService
              ,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.setCapturadores();
    // recuperamos la dta que se setea en la pantalla de inventario
    this.dataService.getReconteoData().pipe(take(1)).subscribe({
      next: (response) => {
        this.isLoading = true;
        this.requestReconteo = response;
        this.reconteosData = response.numeroReconteo;
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

    this.consultarResumenReconteo(this.requestReconteo);
  }

  ngAfterViewInit() {
    // Enfocar el primer input al cargar
    if (this.inputs.first) {
        this.inputs.first.nativeElement.focus();
    }
}

  obtenerReconteo(data : any ){
    this.invetarioServices.consultarReconteo(data).subscribe({
      next: (response) => {
      
        this.cantidadReconteo = response.data.length;
        this.listaItems= response.data;

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
        this.agruparItemsPorUsuario(this.listaItems)
        setTimeout(() => {
          this.isLoading = false;
        
         }, 3000);
        
      },
    });
  }

  iniciarReconteos(data : any ){
    this.invetarioServices.iniciarReconteo(data).subscribe({
      next: (response) => {
    
       
      },
      error: (error) => {console.log("Error : " , error);},
      complete: () => {
        this.obtenerReconteo(data)
          setTimeout(() => {
            this.isLoading = false;
            this.showMostrarTarjetas = !this.showMostrarBody ? true : false;
           }, 3000);
        },
    });
  }

  siguienteReconteo(data : any ){
    this.invetarioServices.siguienteReconteo(data).subscribe({
      next: (response) => {
     
       
      },
      error: (error) => {},
      complete: () => {

        this.obtenerReconteo(data)
          setTimeout(() => {
            this.isLoading = false;
            this.showMostrarBody = true;
  
          }, 10000);
      },
    });
  }

  agregarNombre() {
    this.showMostrarBody = false;
    this.isLoading = true;
    this.listaNombres = this.operarios
      .filter(op => op.nombre.trim() !== '') // Filtra vacíos
      .map(op => ({ nombre: op.nombre })); // Obtiene solo los nombres
    
    const resultado = this.dividirReconteos(this.listaItems, this.listaNombres);
    
    

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
        cantidad : this.reconteosData,
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
     
    }, 9000); // Ocultar mensaje después de 2 segundos
  }
  

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet( this.listaItems);
    const workbook: XLSX.WorkBook = { Sheets: { 'reconteos': worksheet }, SheetNames: ['reconteos'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'reconteos.xlsx');
  }
  
  agruparItemsPorUsuario(lista: any[]){
    const agrupadoPorUsuario: { [key: string]: any[] } = {};
  
    lista.forEach(item => {
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
   this.consultarResumenReconteo(this.requestReconteo);
  }
  
  volverAtras() {
    window.history.back();
  }

  consultarResumenReconteo(data: any) {
    this.isLoading =true;
    this.showMostrarTarjetas = false;
    this.invetarioServices.consultarResumenReconteo(data).subscribe({
      next: (response) => {
         if (response && response.data) {
          this.ItemsRecibidos = response.data.ItemsRecibidos;
          this.ItemsEnviados = response.data.ItemsEnviados;
          if( this.ItemsRecibidos ===  this.ItemsEnviados){
            sessionStorage.setItem('siguienteReconteo', 'true');
          }
         }
        
        
      },
      error: (error) => {
        this.isLoading= false;
        
      },
      complete: () => {
        this.obtenerReconteo(this.requestReconteo);
        setTimeout(() => {
          this.isLoading = false;
          this.showMostrarTarjetas = true;
        }, 3000);
      },
    });
  }
}