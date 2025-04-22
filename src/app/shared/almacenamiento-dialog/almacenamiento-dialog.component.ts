import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InventarioService } from 'app/services/inventario/inventario.service';

@Component({
  selector: 'app-almacenamiento-dialog',
  templateUrl: './almacenamiento-dialog.component.html',
  styleUrls: ['./almacenamiento-dialog.component.scss']
})
export class AlmacenamientoDialogComponent implements OnInit {
  almacenamientoForm: FormGroup;
  almacenamiento: string = 'N';
  cantidadUnitaria : any;
  totalItems : any;
  showInfoAlmacenamiento: boolean = false;
  isLoading: boolean = false;

  
  constructor( 
    private inventarioService: InventarioService,
    private fb: FormBuilder,
    private router: Router,
    public dialogRef: MatDialogRef<AlmacenamientoDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { mensaje: string, datos: any }) { }



  ngOnInit(): void {
    console.log("OBTENEMOS DATOS DE INVENTARIO : ", this.data.datos)
    this.almacenamientoForm = this.fb.group({
      almacenamiento: [this.almacenamiento] // puedes añadir validadores si quieres
    });


    console.log("001" , this.data.datos.tipoItem);
    console.log("002" , this.data.datos.local); 
    console.log("003" ,this.data.datos.fechaInventario);
    
    this.inventarioService.consultaAmacen(this.data.datos.tipoItem, this.data.datos.local , this.data.datos.fechaInventario).subscribe({
      next: (response) => {
        console.log('Respuesta consultaAmacen:', response);

        this.cantidadUnitaria = response.cantidadUnitaria;
        this.totalItems = response.totalItems;
    
       
      },
      error: (error) => {

        console.log("Error al consultaAmacen", error);
      },
      complete: () => {},
    });

    
  }

  onConfirm(): void {
    this.dialogRef.close({ success: true}); 
    console.log("revisando el ingreso");
    this.router.navigate(['/asignacion-reconteos']);
  }

  onToggleAlmacenamiento(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    this.almacenamiento = checked ? 'S' : 'N';
    
    this.showInfoAlmacenamiento = checked;
  }

}
