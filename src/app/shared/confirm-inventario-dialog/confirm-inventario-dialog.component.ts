import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { BateriasDialogComponent } from '../baterias-dialog/baterias-dialog.component';
import { BODEGAS } from '../constants';

@Component({
  selector: 'app-confirm-inventario-dialog',
  templateUrl: './confirm-inventario-dialog.component.html',
  styleUrls: ['./confirm-inventario-dialog.component.scss']
})
export class ConfirmInventarioDialogComponent implements OnInit {
  
  inventarioForm: FormGroup;

  periodo: any;
  mes:any;
  tipoItem:any;
  local:any;
  grupo;
  categorias = ['01-HERRAMIENTAS','03-ACCESORIOS', '04-REPUESTOS'];
  seleccionados: string[] = [];
  grupoList: string[] = [];
  fechaInicio: Date;
  formattedDate: any;

  isLoading: boolean = false;
  // Variables para los selects
  numeroLocalSeleccionado: string | null = null;
  nombreGrupoBodegaSeleccionado: string | null = null;

  desactivarBotonInicio : boolean = true ;
  desactivarComboBoxLocal : boolean = true;
  desactivarBotonCerrar : boolean = false;

  opcionSeleccionadaAccesorios : any;
  
  // Variable para almacenar el local seleccionado
  selectedLocal: any;  // Puedes inicializar con un valor predeterminado si lo deseas
  inventarioIniciado: boolean = false; 
  
  constructor(
    private fb: FormBuilder,
    private inventarioServices : InventarioService,
    public dialogRef: MatDialogRef<ConfirmInventarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensaje: string, periodo: string, mes: string , datos: any },
     private dialog: MatDialog,
  ) {
    this.inventarioForm = this.fb.group({
      selectedLocal: [''], // Campo obligatorio
      selectedGrupoBodega: [''] // Este se habilita o deshabilita según la selección del local
    });

    this.categorias.forEach(categoria => {
      this.inventarioForm.addControl(categoria, new FormControl(false));
    });

  }

  ngOnInit(): void {
    this.fechaInicio = new Date();
    
    // Formatear la fecha al formato YYYY-MM-DD
    this.formattedDate = this.fechaInicio.toISOString().split('T')[0];
    
    this.obtenerGrupoLocal();

    this.inventarioForm.valueChanges.subscribe(val => {
      this.desactivarBotonInicio = !this.categorias.some(categoria => val[categoria]);
    });
    
    const fechaActual = new Date();
    this.periodo = fechaActual.getFullYear().toString();
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
  }

  onConfirm(): void {
    this.isLoading = true;
    this.desactivarBotonInicio = true;
    this.desactivarBotonCerrar = true;
    
    
    const dataInicio = { 
      periodo: this.periodo,

      mes: this.mes,
      categorias: this.seleccionados,
      numeroLocal: this.local.substring(0, 2),
      grupoBodega: this.grupo,
      fechaInventario: this.formattedDate,
      categoria : this.opcionSeleccionadaAccesorios  === 'baterias' ? 'BATERIAS' :'',

    }

 if (this.data && this.data.datos) {
      if (this.verificarInventario(this.data.datos, dataInicio)) {
        this.inventarioIniciado = true; // Setea a true si el inventario ya fue iniciado
      
        this.isLoading = false;
        setTimeout(() => {
          this.inventarioIniciado = false;
          
        }, 5000);
      }else{
        this.inventarioServices.iniciarInventario(dataInicio).subscribe({
     
          next: (response) => {
            
          console.log("Respuesta de iniciarInventario:", response);
           
          },
          error: (error) => {
            this.isLoading = false;
            this.desactivarBotonCerrar = false;
            console.error('Error en la consulta:', error);
            this.dialogRef.close({ success: false }); 
           
          },
          complete: () => {
           
            this.isLoading = false;
            this.desactivarBotonInicio = false;
            this.desactivarBotonCerrar = true;
            this.dialogRef.close(
              { success: true, data: dataInicio }
            
            ); // Enviar datos al padre
    
            
          },
        });
      }
    }else{
      
      this.inventarioServices.iniciarInventario(dataInicio).subscribe({
     
        next: (response) => {
          
          console.log("Respuesta de iniciarInventario:", response);
         this.grupoList = response.data;
        },
        error: (error) => {
          
          this.isLoading = false;
          this.desactivarBotonCerrar = false;
          console.error('Error en la consulta:', error);
          this.dialogRef.close({ success: false }); 
         
        },
        complete: () => {
         
          this.isLoading = false;
          this.desactivarBotonInicio = false;
          this.desactivarBotonCerrar = false;
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
  
    
    

    if(isChecked && categoria === '03-ACCESORIOS' ){
      
       // 👇 Aquí abres el diálogo
       const dialogRef = this.dialog.open(BateriasDialogComponent, {
        width: '400px',
        data: {}
      });

      dialogRef.afterClosed().subscribe((resultado: string) => {
        
      this.opcionSeleccionadaAccesorios = resultado; // Guardar la opción seleccionada
      
        
      });
    }
    if (isChecked) {
      
      this.seleccionados.push(categoria); // Agregar si está marcado
    } else {
      this.seleccionados = this.seleccionados.filter(item => item !== categoria); // Eliminar si se desmarca
    }
  
    if(this.seleccionados.length === 0){
      this.inventarioForm.get('selectedLocal')?.setValue('');
      this.inventarioForm.get('selectedGrupoBodega')?.setValue('');
      this.desactivarComboBoxLocal = true;
    }else{
      this.desactivarComboBoxLocal = false;
    }
    
  
  }

  obtenerGrupoLocal(){
   this.inventarioServices.obtenerBodegas().subscribe({
      next: (response) => {
        console.log("obtener Bodegas:", response.data);  
        response.data.forEach(element => {
        const coincide = BODEGAS.some(filtro =>
        filtro.NumeroLocal === element.NumeroLocal &&
        filtro.GrupoBodega === element.GrupoBodega &&
        filtro.Codigo === element.Codigo
  );

  if (coincide) {
    element.NumeroLocalDes = element.NombreGrupoBodega;
    this.grupoList.push(element);
  }
});

               
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
    const selected = event.value;
    this.selectedLocal = selected;

    console.log("Seleccionado:", selected);

    if (selected) {
      this.local = selected.NumeroLocal;
      this.grupo = selected.GrupoBodega;

      this.inventarioForm.get('selectedGrupoBodega')?.setValue(selected.NombreGrupoBodega);
    }

    this.desactivarBotonInicio = selected?.NumeroLocal ? false : true;
  }
  verificarInventario(resultado1: any[], resultado2: any): boolean {
   const inventarioEncontrado = resultado1.some(item => {
      const fechaItem = new Date(item.FechaInventario).toISOString().split('T')[0]; // "2025-05-15"
      const fechaCoincide = fechaItem === resultado2.fechaInventario;
  
      const cumple = 
        item.Agno.toString() === resultado2.periodo &&
        item.Mes.toString().padStart(2, '0') === resultado2.mes &&
        item.Local === resultado2.numeroLocal &&
        item.GrupoBodega === resultado2.grupoBodega &&
        resultado2.categorias.includes(item.Tipoitem) &&
        fechaCoincide;
  
      // Log para ver qué está evaluando
      
  
      return cumple;
    });
  
    if (inventarioEncontrado) {
      this.desactivarBotonCerrar = false;
      
    } else {
      
    }
  
    return inventarioEncontrado;
  }

  
}
