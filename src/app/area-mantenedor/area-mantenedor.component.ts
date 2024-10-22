import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AreaService } from 'app/services/areas-services/area-service';
import { ConfirmDialogComponent } from 'app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-area-mantenedor',
  templateUrl: './area-mantenedor.component.html',
  styleUrls: ['./area-mantenedor.component.scss']
})
export class AreaMantenedorComponent implements OnInit {

  areas:[]=[];
  idArea:any;
  nombreArea: string;
  areaForm: FormGroup;

  constructor(private areaService: AreaService,private dialog: MatDialog , private fb: FormBuilder) { 

    this.areaForm = this.fb.group({
      area: ['', Validators.required] // campo requerido
    });
  }

  ngOnInit() {
    this.loadAreas();
      
  }


  loadAreas(){
    this.areaService.getAllareas().subscribe({
      next: (response) => {
        this.areas = response.data;
      },
      error: (error) => {
        console.error("Error al consultar las areas", error);
      },
      complete: () => {
        console.log("obtencion de Areas compeltada");
      
      },
    });
  }

  deleteArea(data) {
  
    console.log("data : " ,data);
    this.idArea = data.Id;
    this.nombreArea= data.Nombre;

    const dataReq = {
      nombre: this.nombreArea,
      action: "delete",
      idArea: this.idArea,
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "350px", // Ajusta el ancho según sea necesario,
      data: { user: dataReq.nombre },
      enterAnimationDuration: "300ms",
      exitAnimationDuration: "300ms",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.areaService.deleteUser(dataReq).subscribe({
          next: () => {
            this.loadAreas();

          
          },
          error: (err) => {
            // Manejo de errores
            console.error("Error al eliminar el area", err);
          },
          complete: () => {
            // Acción a realizar cuando la eliminación se completa (opcional)
            console.log("Eliminación de area completada");
          },
        });
      } else {
        console.log("Eliminación cancelada");
      }
    });
  }

  onSubmit() {
    if (this.areaForm.valid) {
      const areaName = this.areaForm.value.area; // obtiene el valor del campo 'area'
      console.log('Área enviada:', areaName);


      const dataArea = {
        nombre : areaName
      }
      this.areaService.insertarArea(dataArea).subscribe({
        next: (response) => {
         console.log("response : " , response);
        },
        error: (error) => {
          console.error("Error al consultar las areas", error);
        },
        complete: () => {
          this.loadAreas();
          
          // Limpiar el formulario
          this.areaForm.reset();

        
        },
      });
    }
  }
}

