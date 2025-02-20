import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

@Component({
  selector: 'app-grafico-torta',
  templateUrl: './grafico-torta.component.html',
  styleUrls: ['./grafico-torta.component.scss']
})
export class GraficoTortaComponent implements AfterViewInit {
  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef;
  @Input() saldoTotal: number = 0; // Recibimos el total de Saldo Stock
  @Input() conteoTotal: number = 0; // Recibimos el total de Conteo

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }


    crearGrafico() {
      // Calculamos los datos del gráfico
      console.log("grficooooos : " ,  this.conteoTotal , this.saldoTotal);
      const porcentajeAvance = (this.conteoTotal / this.saldoTotal) * 100;
      const porcentajeSaldo = 100 - porcentajeAvance;
  
      new Chart(this.graficoCanvas.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Saldo Stock', 'Conteo'],
          datasets: [{
            data: [porcentajeSaldo, porcentajeAvance], // Mostramos el porcentaje
            backgroundColor: ['#ff6347', '#008686'],
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
