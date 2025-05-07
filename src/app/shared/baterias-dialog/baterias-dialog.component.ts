import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-baterias-dialog',
  templateUrl: './baterias-dialog.component.html',
  styleUrls: ['./baterias-dialog.component.scss']
})
export class BateriasDialogComponent implements OnInit {
  seleccion: string = '';
  
  constructor(public dialogRef: MatDialogRef<BateriasDialogComponent>){ }

  ngOnInit(): void {
  }

  cerrar() {
    this.dialogRef.close(this.seleccion);
  }

}
