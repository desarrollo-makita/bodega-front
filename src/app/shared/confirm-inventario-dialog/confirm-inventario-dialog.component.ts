import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventarioService } from 'app/services/inventario/inventario.service';

@Component({
  selector: 'app-confirm-inventario-dialog',
  templateUrl: './confirm-inventario-dialog.component.html',
  styleUrls: ['./confirm-inventario-dialog.component.scss']
})
export class ConfirmInventarioDialogComponent implements OnInit {


  periodo: any;
  mes:any;
  tipoItem:any;
  local:any;
  grupo;
  categorias = ['01-HERRAMIENTAS', '03-ACCESORIOS', '04-REPUESTOS'];
  seleccionados: string[] = [];
  grupoList: string[] = [];

  isLoading: boolean = false;
  // Variables para los selects
  numeroLocalSeleccionado: string | null = null;
  nombreGrupoBodegaSeleccionado: string | null = null;

  desactivarBotonInicio : boolean = true ;

  // Variable para almacenar el local seleccionado
  selectedLocal: any;  // Puedes inicializar con un valor predeterminado si lo deseas
  inventarioIniciado: boolean = false; 
  
  constructor(private inventarioServices : InventarioService,
    public dialogRef: MatDialogRef<ConfirmInventarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensaje: string, periodo: string, mes: string , datos: any }
  ) {}

  ngOnInit(): void {
    console.log("mensaje0012132  : " , this.data.mensaje , '-' , this.data.periodo , '-' , this.data.mes , '-' , this.data.datos);
    this.obtenerGrupoLocal();
    const fechaActual = new Date();
    this.periodo = fechaActual.getFullYear().toString();
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
  }

  onConfirm(): void {
    this.isLoading = true;
    this.desactivarBotonInicio = true;
    
    const dataInicio = { 
      periodo: this.periodo,
      mes: this.mes,
      categorias: this.seleccionados,
      numeroLocal: this.local,
      grupoBodega: this.grupo
    }
   

    if (this.verificarInventario(this.data.datos, dataInicio)) {
      this.inventarioIniciado = true; // Setea a true si el inventario ya fue iniciado
    
      this.isLoading = false;
      setTimeout(() => {
        this.inventarioIniciado = false;
        
      }, 2000);
    } else{
      
      this.inventarioServices.iniciarInventario(dataInicio).subscribe({
     
        next: (response) => {
          console.log('Respuesta del servidor iniciarInventario:', response);
         // Extraemos los tipos de ítem que llegaron en la respuesta
         
          
          this.grupoList = response.data;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en la consulta:', error);
          this.dialogRef.close({ success: false }); 
         
        },
        complete: () => {
          console.log("dtaaaaaaaaaaaaaaaaaaaaIncio" ,  dataInicio);
          this.isLoading = false;
          this.desactivarBotonInicio = false;
          this.dialogRef.close({ success: true, data: dataInicio }); // Enviar datos al padre
  
          
        },
      });
       
    }

  }

  onCancel(): void {
    this.dialogRef.close(false); // El usuario presionó "Cancelar"
  }

  onCheckboxChange(event: Event, categoria: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (isChecked) {
      this.seleccionados.push(categoria); // Agregar si está marcado
    } else {
      this.seleccionados = this.seleccionados.filter(item => item !== categoria); // Eliminar si se desmarca
    }

    console.log("this.seleccionados" , this.seleccionados);
  
    this.desactivarBotonInicio = this.seleccionados.length === 0 ? true: false
  }

  obtenerGrupoLocal(){

    this.inventarioServices.obtenerBodegas().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor grupoLocal:', response.data);
        this.grupoList = response.data;

        console.log('this.grupoList:', this.grupoList);
      },
      error: (error) => {
      
        console.error('Error en la consulta:', error);
       
      },
      complete: () => {
       
      },
    });

  }

   // Método para manejar el cambio en el combobox
   onLocalChange(event: any): void {
    // Aquí puedes agregar la lógica para manejar el cambio en la selección del local
    console.log('Local seleccionado: ', this.selectedLocal);

    this.local = this.selectedLocal.NumeroLocal;
    this.grupo = this.selectedLocal.GrupoBodega;
  }


  verificarInventario(resultado1: any[], resultado2: any): boolean {
    const inventarioEncontrado = resultado1.some(item =>
      item.Agno.toString() === resultado2.periodo &&
      item.Mes.toString().padStart(2, '0') === resultado2.mes &&
      item.Local === resultado2.numeroLocal &&
      item.GrupoBodega === resultado2.grupoBodega
    );
  
    if (inventarioEncontrado) {
      console.log("Ya fue iniciado el inventario escogido");
    }
  
    return inventarioEncontrado;
  }
  
 
}
