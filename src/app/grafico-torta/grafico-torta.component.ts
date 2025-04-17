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
  @Input() totalItems: number = 0; // Recibimos el total items

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  crearGrafico() {
    const porcentajeAvance = ((this.conteoTotal / this.saldoTotal) * 100).toFixed(2);
    const porcentajeSaldo = (100 - parseFloat(porcentajeAvance)).toFixed(2);
  
    new Chart(this.graficoCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: [
          `Saldo total Stock = ${this.saldoTotal}`, 
          `Conteo = ${this.conteoTotal}`
        ],
        datasets: [{
          data: [porcentajeSaldo, porcentajeAvance], 
          backgroundColor: ['#ff6347', '#008686'], // Colores para cada sección del gráfico
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 5
        },
        plugins: {
          legend: {
            position: 'left',
            align: 'center',
            labels: {
              padding: 5,
              font: {
                size:20
              }
            }
          },
          title: {
            display: true, 
            text: `Se encontraron ${this.totalItems} Items de  ${this.titulo.substring(3)}`,
            font: {
              size: 20,
              weight: 'bold'
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let value = context.raw;
                let label = context.label;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }
  
  

}
