import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

@Component({
  selector: 'app-grafico-torta',
  templateUrl: './grafico-torta.component.html',
  styleUrls: ['./grafico-torta.component.scss']
})
export class GraficoTortaComponent implements AfterViewInit {
  @ViewChild('graficoCanvas') graficoCanvas!: ElementRef;
  @Input() saldoTotal: number = 0;
  @Input() conteoTotal: number = 0;
  @Input() titulo: string = '';
  @Input() totalItems: number = 0;
  @Input() listaRegistros: any;

  private chartInstance: Chart | null = null;
  conteoRealizado:any

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    this.crearGrafico();
  }

  crearGrafico() {
    console.log("listaRegistros: ", this.listaRegistros);

    if (!this.listaRegistros || this.listaRegistros.length === 0) {
      console.warn("No hay datos para mostrar el gráfico.");
      return;
    }

    const totalItems = this.listaRegistros.length;
    this.conteoRealizado = this.listaRegistros.filter(item => parseFloat(item.Conteo) > 0).length;
    const conteoPendiente = totalItems - this.conteoRealizado;

    const porcentajeRealizado = ((this.conteoRealizado / totalItems) * 100).toFixed(2);
    const porcentajePendiente = (100 - parseFloat(porcentajeRealizado)).toFixed(2);

    // Destruye el gráfico anterior si existe
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.graficoCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Ítems pendientes de contar', 'Conteo de item realizado'],
        datasets: [{
          data: [conteoPendiente, this.conteoRealizado],
          backgroundColor: ['#E0E0E0', '#008686'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutBounce'
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                const label = context.label;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const porcentaje = ((Number(value) / Number(total)) * 100).toFixed(2);
                return `${label}: ${porcentaje}%`;
              }
            }
          }
        }
      }
    });
  }
}
