import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InventarioService } from 'app/services/inventario/inventario.service';
import { BateriasDialogComponent } from '../baterias-dialog/baterias-dialog.component';

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

    console.log("ACCESORIOS-01" , dataInicio);
    console.log("ACCESORIOS-02" , this.data);
    console.log("ACCESORIOS-03" , this.verificarInventario(this.data.datos, dataInicio));
   
    
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
        
  
        // Aquí modificamos NumeroLocal según GrupoBodega
        this.grupoList = response.data.map((item: any) => {
          switch (item.GrupoBodega) {
            case 1:
              return { ...item, NumeroLocal: '01-ENEA' };
            case 2:
              return { ...item, NumeroLocal: '01-ENEA-BATERIAS' };
            case 3:
              return { ...item, NumeroLocal: '03-TEMUCO' };
            case 4:
              return { ...item, NumeroLocal: '04-ANTOFAGASTA' };
            case 5:
              return { ...item, NumeroLocal: '05-COPIAPO' };
            default:
              return item; // si no coincide ningún GrupoBodega, se deja como está
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
    // Aquí puedes agregar la lógica para manejar el cambio en la selección del local
    this.selectedLocal = this.inventarioForm.get('selectedLocal')?.value;
  
    if (this.selectedLocal) {
      this.local = this.selectedLocal.NumeroLocal;
      this.grupo = this.selectedLocal.GrupoBodega;

      // Setear el grupo de bodega automáticamente
      this.inventarioForm.get('selectedGrupoBodega')?.setValue(this.selectedLocal.NombreGrupoBodega);
    
    }
   
    this.desactivarBotonInicio = this.selectedLocal.NumeroLocal ? false: true;
    
  }
  
  verificarInventario(resultado1: any[], resultado2: any): boolean {
    
    const inventarioEncontrado = resultado1.some(item =>
      item.Agno.toString() === resultado2.periodo &&
      item.Mes.toString().padStart(2, '0') === resultado2.mes &&
      item.Local === resultado2.numeroLocal &&
      item.GrupoBodega === resultado2.grupoBodega &&
      resultado2.categorias.includes(item.Tipoitem)
    );
  
    
    if (inventarioEncontrado) {
      
      this.desactivarBotonCerrar= false; 
    }
  
    return inventarioEncontrado;
  }

  
}
