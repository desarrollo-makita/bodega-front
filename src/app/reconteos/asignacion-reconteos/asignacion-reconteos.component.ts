import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MyDataService } from 'app/services/data/my-data.service';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { LOCALES, MESES, TIPOS_ITEMS } from 'app/shared/constants';
import { take } from 'rxjs';

@Component({
  selector: 'app-asignacion-reconteos',
  templateUrl: './asignacion-reconteos.component.html',
  styleUrls: ['./asignacion-reconteos.component.scss']
})
export class AsignacionReconteosComponent implements OnInit {

  requestReconteo: any;
  nuevoNombre: string = '';
  listaNombres: { nombre: string }[] = [];
  tipoItem:any;
  listaItems: any[] = [];

  cantidadReconteo: number = 5; // Ejemplo, este valor debería venir de tu lógica
  cantidadPersonas: number = 1; // Cantidad de operarios seleccionada
  operarios: { nombre: string }[] = []; // Arreglo de operarios
  cantidadOperarios: number = 0;


  @ViewChildren('inputElement') inputs!: QueryList<ElementRef>;

  constructor(private dataService: MyDataService,
              private invetarioServices: InventarioService
  ) { }

  ngOnInit(): void {
    
    this.dataService.getReconteoData().pipe(take(1)).subscribe({
      next: (response) => {

        this.requestReconteo = response;
        console.log("responseReconteo AsignacionReconteosComponent", response);

        this.tipoItem = response.tipoItem.substring(3);
      },
      error: (error) => {
        console.error("Error al obtener responseReconteo", error);
        // Lógica de manejo de errores
      },
      complete: () => {
        console.log("Obtener getReconteoData completada" , );
       this.obtenerReconteo(this.requestReconteo)
      },
    });

  }

  ngAfterViewInit() {
    // Enfocar el primer input al cargar
    if (this.inputs.first) {
        this.inputs.first.nativeElement.focus();
    }
}

  obtenerReconteo(data : any ){
    this.invetarioServices.consultarReconteo(this.requestReconteo).subscribe({
      next: (response) => {
        console.log('Respuesta consultarReconteo:', response);
        this.cantidadReconteo = response.data.length;
        this.listaItems= response.data;
        console.log('cantidadReconteo :', this.cantidadReconteo);
      },
      error: (error) => {},
      complete: () => {},
    });
  }

  agregarNombre() {
    this.listaNombres = this.operarios
      .filter(op => op.nombre.trim() !== '') // Filtra vacíos
      .map(op => ({ nombre: op.nombre })); // Obtiene solo los nombres

    console.log('Lista consolidada:', this.listaNombres);

   
    const resultado = this.dividirReconteos(this.listaItems, this.listaNombres);
     console.log('resultado', resultado);

  }
  
  actualizarOperarios() {
    // Limpiar la lista de operarios y agregar la cantidad necesaria

    this.operarios = Array.from({ length: this.cantidadPersonas }, () => ({ nombre: '' }));
    console.log("operaqrios asignados : " , this.operarios , this.cantidadPersonas);
  }
  
  capitalizar(texto: string): string {
    return texto
      .toLowerCase() // Convertir todo a minúsculas primero
      .replace(/\b\w/g, letra => letra.toUpperCase()); // Capitalizar cada palabra
  }

  todosLosNombresIngresados(): boolean {
    return this.operarios.every(operario => operario.nombre.trim() !== '');
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
    const totalItems = listaItems.length; // Total de ítems (2000 en tu ejemplo)
    const cantidadNombres = listaNombres.length; // Número de nombres (en este caso 2)
  
    // Calcular cuántos items recibe cada nombre
    const itemsPorNombre = Math.floor(totalItems / cantidadNombres); // 1000 ítems por persona
  
    // Creamos un array para los resultados
    const resultado = [];
  
    // Dividimos los ítems entre los nombres
    let itemIndex = 0;
    listaNombres.forEach((nombre, i) => {
      const itemsAsignados = listaItems.slice(itemIndex, itemIndex + itemsPorNombre); // Toma una parte de los ítems
      resultado.push({
        nombre: nombre.nombre,
        data: itemsAsignados // Asignamos los ítems a la propiedad `data`
      });
      itemIndex += itemsPorNombre; // Aumentamos el índice para tomar la siguiente parte
    });
  
    console.log('Resultado:', resultado);
    return resultado;
  }
  
  
}
