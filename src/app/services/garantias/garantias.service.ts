import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GarantiasService {

 private obtenerGarantiasAbiertas = "http://localhost:3026/api/obtener-llamadas";
    private obtenerGarantiasAbiertasRut = "http://localhost:3026/api/obtener-llamadas-rut";
    private obtenerGarantiasIntranet = "http://localhost:3026/api/obtener-garantias-estado-intranet";
    private insertarGarantiasIntranet = "http://localhost:3026/api/insertar-garantias-intranet";
    private adjuntarArchivosSTMurl = "http://localhost:3026/api/insertar-archivos-stm-intranet";
    private buscarItemURL = "http://localhost:3026/api/buscar-item-formulario";
    private buscarComunasURL = "http://localhost:3026/api/obtener-comunas";
    private buscarClientesURL = "http://localhost:3026/api/obtener-clientes";
    private buscarRepuestosAccesoriosURL = "http://localhost:3026/api/buscar-item-repuesto-accesorio";
    private insertarPedidosIntranetURL = "http://localhost:3026/api/insertar-pedido-garantia-intranet"
    private obtenerDetalleGarantiasIntranetURL = "http://localhost:3026/api/obtener-detalle-garantia-intranet";
    private buscarProveedorURL = "http://localhost:3026/api/obtener-proveedor";
    private enviarSapURL = "http://localhost:3026/api/actualiza-idPedido-documentos";
    private editarPedidosIntranetURL = "http://localhost:3026/api/editar-pedido-detalle-intranet"
    private obtenerArticulosURL = "http://localhost:3026/api/detalle-articulos-orden";
    private eliminarArticulosURL = "http://localhost:3026/api/eliminar-articulo-pedido"
    private eliminarArticulosLocalURL = "http://localhost:3026/api/eliminar-articulo-pedido-local"
    private abrirDocumento = "http://localhost:3026/api/abrir-documento"
    private cerrarOfertaVentaURL = "http://localhost:3026/api/cerrar-oferta-venta"
    private obtenerOfertaVentaURL = "http://localhost:3026/api/obtener-ofertas-ventas";
    private cargarDocumentosURL = "http://localhost:3026/api/obtener-documentos-llamada";
    private descargarDocumentosURL = "http://localhost:3026/api/anexos";
    private cerrarLLamadaServicioURL = "http://localhost:3026/api/cerrar-llamada-servicio"
    private crearOfertaVentaURL = "http://localhost:3026/api/crear-oferta-venta"
    private rechazarOFertaVentaURL = "http://localhost:3026/api/rechazar-oferta-venta"
    private aprobarOFertaVentaURL = "http://localhost:3026/api/crear-orden-desde-oferta"
    private obtenerGarantiasEstadoRutURL = "http://localhost:3026/api/obtener-garantias-estado-rut-intranet";





  constructor(private http: HttpClient) {}

  getGarantiasPorEstado(): Observable<any> {
    const url = `${this.obtenerGarantiasAbiertas}`;
    return this.http.get<any>(url);
  }  

     getGarantiasPorEstadoRut(rut): Observable<any> {
    const url = `${this.obtenerGarantiasAbiertasRut}/${rut}`;
    return this.http.get<any>(url);
  }
  
  getGarantiasPorEstadoIntranet(estado: string ): Observable<any> {
    const url = `${this.obtenerGarantiasIntranet}/${estado}`;
    return this.http.get<any>(url);
  }

   //Nuevo servicio creado , para buscar las ingresadas por estado ingresadas y rut 
   getGarantiasPorEstadoRutIntranet(estado: string , rut: string): Observable<any> {
    const url = `${this.obtenerGarantiasEstadoRutURL}/${estado}/${rut}`;
    return this.http.get<any>(url);
  }
  
  insertarGarantiaIntranet(data : any): Observable<any> {
    return this.http.post<any>(this.insertarGarantiasIntranet,  data );
  }
  adjuntarArchivosSTM(formData: FormData): Observable<any> {
    return this.http.post<any>(this.adjuntarArchivosSTMurl, formData);
}

  buscarItems(filtro: string): Observable<any> {
    const url = `${this.buscarItemURL}`;
    const params = new HttpParams().set('query', filtro);
    return this.http.get<any>(url, { params });
  }

   buscarRepuestosAccesorios(filtro: string): Observable<any> {
    const url = `${this.buscarRepuestosAccesoriosURL}`;
    const params = new HttpParams().set('query', filtro);
    return this.http.get<any>(url, { params });
  }

   getComunas(codigo: number): Observable<any> {
    const url = `${this.buscarComunasURL}/${codigo}`;
    return this.http.get<any>(url);
  } 


  getClientes(codigo: number): Observable<any> {
    const url = `${this.buscarClientesURL}/${codigo}`;
    return this.http.get<any>(url);
  } 


  insertarPedidosIntranet(data : any): Observable<any> {
    return this.http.post<any>(this.insertarPedidosIntranetURL, { data });
  }
  editarPedidosIntranet(data : any): Observable<any> {
    return this.http.post<any>(this.editarPedidosIntranetURL, { data });
  }
  getGarantiasDetallesIntranet(idPedido: string): Observable<any> {
    const url = `${this.obtenerDetalleGarantiasIntranetURL}/${idPedido}`;
    return this.http.get<any>(url);
  }
  
  getProveedor(codigo: number): Observable<any> {
    const url = `${this.buscarProveedorURL}/${codigo}`;
    return this.http.get<any>(url);
  }

  enviarSap(data : any): Observable<any> {
    return this.http.post<any>(this.enviarSapURL, { data });
  }
  
  obtenerArticulosOrden(docEntry: any): Observable<any> {
    const url = `${this.obtenerArticulosURL}/${docEntry}`;
    return this.http.get<any>(url);
  }

  eliminarArticulos(data : any): Observable<any> {
    return this.http.post<any>(this.eliminarArticulosURL, { data });
  }


  eliminarArticulosLocal(data : any): Observable<any> {
    return this.http.post<any>(this.eliminarArticulosLocalURL, { data });
  }

  abrirDocumentoIntranet(id: any): Observable<Blob> {
    const url = `${this.abrirDocumento}/${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  cerrarOfertaVenta(data : any): Observable<any> {
    return this.http.post<any>(this.cerrarOfertaVentaURL, { data });
  }

  obtenerOfertasVentas(docEntry: any): Observable<any> {
    const url = `${this.obtenerOfertaVentaURL}/${docEntry}`;
    return this.http.get<any>(url);
  }

  cargarDocumentos(attachmentEntry: any): Observable<any> {
    const url = `${this.cargarDocumentosURL}/${attachmentEntry}`;
    return this.http.get<any>(url);
  }

    descargarDocumentos(doc: any): Observable<Blob> {
    // Construye URL con lineNum + timestamp para evitar cache
    const url = `${this.descargarDocumentosURL}/${doc.absoluteEntry}/${doc.lineNum}`;
    return this.http.get(url, { responseType: 'blob' });
  }

    cerrarLLamadaServicio(data : any): Observable<any> {
    return this.http.post<any>(this.cerrarLLamadaServicioURL, { data });
  }
    crearOfertaVenta(data : any): Observable<any> {
      return this.http.post<any>(this.crearOfertaVentaURL, { data });
    }

    rechazarOfertaVenta(data : any): Observable<any> {
      return this.http.post<any>(this.rechazarOFertaVentaURL, { data });
    }

   aprobarOfertaVenta(data : any): Observable<any> {
      return this.http.post<any>(this.aprobarOFertaVentaURL, { data });
    }

  
}
