import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LOCALES, MESES, TIPOS_ITEMS } from 'app/shared/constants';

@Component({
  selector: 'app-asignacion-reconteos',
  templateUrl: './asignacion-reconteos.component.html',
  styleUrls: ['./asignacion-reconteos.component.scss']
})
export class AsignacionReconteosComponent implements OnInit {


  
  // Variables del formulario
  selectedMes: string;
  selectedPeriodo: string;
  selectedTipoItem: string;
  selectedLocal: string;
  selectedGrupo: string;
  asignacionForm!: FormGroup;

  mes: any ;
  meses: any = MESES;
  tiposItems: any [] = TIPOS_ITEMS;
  locales = LOCALES;
  periodo: any;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    this.asignacionForm = this.fb.group({
      mes: ['', Validators.required],
      tipoItem: ['', Validators.required],
      local: ['', Validators.required]
    });

    const fechaActual = new Date();
  
    this.periodo = fechaActual.getFullYear().toString();
    this.mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');

    this.selectedPeriodo = this.periodo;
    this.selectedMes = this.mes;
  }

  asignar(){
    console.log("asignar::")
  }

  onChange() {
    console.log('Mes seleccionado:', this.selectedMes);
    console.log('Tipo de ítem seleccionado:', this.selectedTipoItem);
    console.log('Local seleccionado:', this.selectedLocal);
    console.log('Periodo seleccionado:', this.selectedPeriodo);
  }

  getMesTooltip(codigo: string): string {
    const mesEncontrado = this.meses.find(mes => mes.codigo === codigo);
    return mesEncontrado ? mesEncontrado.nombre : '';
  }

  getLocalTooltip(codigo: string): string {
    const localEncontrado = this.locales.find(local => local.codigo === codigo);
    return localEncontrado ? localEncontrado.descripcion : '';
  }

  formValido(): boolean {
    return !!(this.selectedMes && this.selectedPeriodo && this.selectedTipoItem && this.selectedLocal);
  }

}
