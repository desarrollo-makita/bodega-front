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
  @Input() titulo: string = ''; // Recibimos el titulo del gráfico

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  crearGrafico() {
    console.log("grficooooos : ", this.conteoTotal, this.saldoTotal);
    const porcentajeAvance = ((this.conteoTotal / this.saldoTotal) * 100).toFixed(2);
    const porcentajeSaldo = (100 - parseFloat(porcentajeAvance)).toFixed(2);
  
    new Chart(this.graficoCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: [
          `Saldo Stock = ${this.saldoTotal}`, 
          `Conteo = ${this.conteoTotal}`

        ],
        datasets: [{
          data: [porcentajeSaldo, porcentajeAvance], 
          backgroundColor: ['#ff6347', '#008686'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 5 // Reduce espacio alrededor del gráfico
        },
        plugins: {
          legend: {
            position: 'left', // Mantiene la leyenda a la izquierda
            align: 'center', // Centra la leyenda verticalmente
            labels: {
              padding: 5, // Reduce la separación entre el gráfico y los labels
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true, 
            text: this.titulo
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let value = context.raw;
                let label = context.label;
                return `${label}: ${value}%`; // Muestra el % en el tooltip
              }
            }
          }
        }
      }
    });
  }
  
  

}
