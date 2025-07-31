import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GarantiasService } from 'app/services/garantias/garantias.service';

@Component({
  selector: 'app-agregar-repuestos-dialog',
  templateUrl: './agregar-repuestos-dialog.component.html',
  styleUrls: ['./agregar-repuestos-dialog.component.scss']
})
export class AgregarRepuestosDialogComponent implements OnInit {

  garantia: any;
  formularioRepuestos: FormGroup;
  modelosFiltrados: any[][] = [];
  mostrarSugerencias = false;

  constructor(
    public dialogRef: MatDialogRef<AgregarRepuestosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private garantiasServices: GarantiasService
  ) 
  {
    this.formularioRepuestos = this.fb.group({
      repuestos: this.fb.array([this.crearRepuesto()])
    });
  }

   get repuestos(): FormArray {
    return this.formularioRepuestos.get('repuestos') as FormArray;
  }

  buscarRepuestos(valor: string, index: number): void {
    if (!valor || valor.length < 2) {
      this.modelosFiltrados[index] = [];
      return;
    }

    valor = valor.toUpperCase();
    this.garantiasServices.buscarRepuestosAccesorios(valor).subscribe({
      next: (response) => {
        this.modelosFiltrados[index] = response.items || [];
      },
      error: () => {
        this.modelosFiltrados[index] = [];
      }
    });
  }

  seleccionarModelo(index: number, itemCode: string): void {
    const seleccionado = this.modelosFiltrados[index]?.find((item) => item.ItemCode === itemCode);
    if (seleccionado) {
      const grupo = this.repuestos.at(index);
      grupo.patchValue({
        codigo: seleccionado.ItemCode,
        descripcion: seleccionado.ItemName
      });
      this.modelosFiltrados[index] = [];
    }
  }

  crearRepuesto(): FormGroup {
    return this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarRepuesto(): void {
    this.repuestos.push(this.crearRepuesto());
  }

  eliminarRepuesto(index: number): void {
    this.repuestos.removeAt(index);
    if  (this.repuestos.length === 0) {
      this.repuestos.push(this.crearRepuesto());
    }
  }


  cerrar(): void {
    this.dialogRef.close();
  }

  guardar(): void {
   if (this.formularioRepuestos.valid) {
      this.dialogRef.close(this.formularioRepuestos.value.repuestos);
    }
  }

  ngOnInit(): void {
    console.log('Datos recibidos en el diálogo:', this.data);
  }

 

}
