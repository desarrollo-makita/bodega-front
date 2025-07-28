import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ingresar-garantias',
  templateUrl: './ingresar-garantias.component.html',
  styleUrls: ['./ingresar-garantias.component.scss']
})
export class IngresarGarantiasComponent implements OnInit {
  garantiaForm!: FormGroup;
  tiposDocumento: string[] = [
    'GARANTIA',
    'PRESUPUESTO',
    'PUESTA EN MARCHA',
    'ORDEN DE TRABAJO'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.garantiaForm = this.fb.group({
      FechaDigitalizacionOs: [new Date(), Validators.required],
      TipoDocumento: ['', Validators.required],
      InformeTecnico: ['' , Validators.required],
      Modelo: ['', Validators.required],
      serie: ['', Validators.required],
      NumeroDocumento: ['', Validators.required],
      Revendedor: ['', Validators.required],
      RutServicioTecnico: ['', Validators.required],
      NombreServicioAut: ['', Validators.required],
      NombreConsumidor: ['', Validators.required],
      DireccionConsumidor: ['', Validators.required],
      CiudadConsumidor: ['', Validators.required],
      RegionConsumidor: ['', Validators.required],
      RutConsumidor: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.garantiaForm.valid) {
      console.log('Formulario enviado:', this.garantiaForm.value);
      // Aquí podrías llamar a tu servicio para guardar
    } else {
      this.garantiaForm.markAllAsTouched();
    }
  }
}
