import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GarantiasService } from 'app/services/garantias/garantias.service';
import { regiones } from '../../util/regiones-comunas/regiones-comunas';
import { rutChilenoValidator } from '../../util/validador-rut';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MyDataService } from 'app/services/data/my-data.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
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
  ];

  mensaje: string = '';
  isLoading: boolean = false;
  successMessage: boolean = false;
  errorMessage: boolean = false;
  formularioData:{};
  modelosFiltrados: any[] = [];
  clientesFiltrados: any[] = [];
  proveedorFiltrados: any[] = [];
  adjuntos = [null, null, null, null];
 filePreviews: { file: File, url: string, type: string, name: string }[] = [];
  
  
  mostrarSugerencias = false;
  mostrarSugerenciasClientes = false;
  mostrarSugerenciasProveedores = false;
  dataRegiones:any;
  selectedRegion: any = null;
  dataComunas:any;


  mock =  {
        "ciudadConsumidor": "ciudadcliente",
        "descripcionHerramienta": "se debe agregar",
        "direccionConsumidor": "direccioncleinte",
        "emailConsumidor": "",
        "fechaDigitalizacionOs": "2025-07-29",
        "fonoConsumidor": "+56978945678",
        "informeTecnico": "asasasasas",
        "nombreConsumidor": "clientenombre",
        "nombreServicioAut": "enea",
        "nombreTecnico": "bryan barrientos",
        "referencia": "CX9 2.5",
        "regionConsumidor": "regioncliente",
        "rutConsumidor": "168020120",
        "rutServicioTecnico": "777777777",
        "serie": "123"
  }
  
  constructor(private fb: FormBuilder, private garantiasServices: GarantiasService, private dataService : MyDataService
  ) {}

  ngOnInit(): void {
   // this.mostrarAlerta();
    this.garantiaForm = this.fb.group({
      FechaDigitalizacionOs: [new Date(), Validators.required],
      TipoDocumento: ['', Validators.required],
      InformeTecnico: ['' , Validators.required],
      Modelo: ['', Validators.required],
      serie: ['', Validators.required],
      Revendedor: ['', Validators.required],
      RutServicioTecnico: ['', Validators.required],
      NombreServicioAut: ['', Validators.required],
      NombreConsumidor: ['', Validators.required],
      DireccionConsumidor: ['', Validators.required],
      RegionConsumidor: ['', Validators.required],
      ComunaConsumidor: ['', Validators.required],
      RutConsumidor: ['', [Validators.required, rutChilenoValidator]],
      TelCliente: ['+569', [Validators.required, Validators.pattern(/^\+569[0-9]{8}$/)]],
      Descripcion: ['', Validators.required], 
      serieHerramienta: [null, Validators.required],
      herramienta: [null, Validators.required],
      repuesto: [null, Validators.required],
      boleta: [null, Validators.required],
       NombreTecnico: ['', Validators.required],
    });   
 
    
    this.garantiaForm.get('Modelo')?.valueChanges.subscribe((valor) => {
      if (!valor) {
        this.garantiaForm.patchValue({ Descripcion: '' });
      }
    });

    this.dataRegiones = regiones;

    this.garantiaForm.get('RegionConsumidor')?.valueChanges.subscribe(nombreRegion => {
      const regionSeleccionada = this.dataRegiones.find(r => r.nombre === nombreRegion);
     
      if (regionSeleccionada && regionSeleccionada.codigo) {
        this.cargarComunas(regionSeleccionada.codigo); // <-- aquí llamas a tu API
      } else {
        this.dataComunas = []; // Limpia si no hay región válida
      }
    });

    this.obtenerRutLogueado();
  }


  obtenerRutLogueado() {
     this.dataService.getUserObjectData().pipe(take(1)).subscribe({
      next: (response) => {
        // Si comienza con "C", le quitamos solo esa letra
        let data = response != null ? response.CardCode : sessionStorage.getItem('cardCode') ;
        
        if (data !== null && data !== "null" && data !== undefined && data !== "") {
          let cardCode = data;
          this.buscarClientes(cardCode);
          this.garantiaForm.get('RutServicioTecnico')?.disable();
          this.garantiaForm.get('NombreServicioAut')?.disable();
        }else{
           this.garantiaForm.get('RutServicioTecnico')?.enable();
          this.garantiaForm.get('NombreServicioAut')?.enable();
        }
        
      },
      error: (error) => {
        console.error("Error al obtener responseReconteo", error);
      },
      complete: () => {},
    });
  }
  
  onSubmit(): void {
    this.isLoading = true;
    

    if (!this.garantiaForm.valid) {
      this.garantiaForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // Obtener y mapear datos del formulario
   
    const formValue = this.garantiaForm.getRawValue();
    const mappedData = this.mapFormularioARequest(formValue);

    // Crear FormData
    const formData = new FormData();

    // Agregar campos normales al FormData
    Object.entries(mappedData).forEach(([key, value]) => {
      formData.append(key, value ?? ''); // Evitar undefined
    });

    //Agregar archivos
    this.filePreviews.forEach((filePreview, index) => {
      if (!filePreview || !filePreview.file) return;

      const fieldNames = ['serieHerramienta', 'herramienta', 'repuesto', 'boleta'];
      const fieldName = fieldNames[index];
      if (fieldName) {
        formData.append(fieldName, filePreview.file, filePreview.name);
      }
    });

    //Enviar al backend
    this.garantiaForm.reset();
    this.garantiasServices.insertarGarantiaIntranet(formData).subscribe({
      next: (response) => {
        this.formularioData = response;
        this.generarComprobante(formValue);
      },
      error: (error) => console.error(error),
      complete: () => {
        setTimeout(() => {
          this.successMessage = true;
          this.mensaje = 'Garantía ingresada correctamente';
          this.isLoading = false;
          this.mostrarAlerta();
          this.borrarNombresArchivos();
        }, 1500);

        setTimeout(() => this.borrarMensaje(), 4000);
      }
    });
  }
  
  onTelefonoInput(event?: any) {
    const input = event.target;
    let value = input.value;

    // Forzar que empiece con +569
    if (!value.startsWith('+569')) {
      value = '+569' + value.replace(/[^0-9]/g, '').substring(0, 8);
    } else {
      value = '+569' + value.substring(4).replace(/[^0-9]/g, '').substring(0, 8);
    }

    input.value = value;
    this.garantiaForm.get('TelCliente')?.setValue(value);
  }


  mapFormularioARequest(formValue: any) {
   
    return {
      rutServicioTecnico: formValue.RutServicioTecnico,
      nombreServicioAut: formValue.NombreServicioAut,
      fechaDigitalizacionOs: formValue.FechaDigitalizacionOs,
      informeTecnico: formValue.InformeTecnico,
      fonoConsumidor: formValue.TelCliente,
      emailConsumidor: formValue.EmailConsumidor || '',
      direccionConsumidor: formValue.DireccionConsumidor,
      comunaConsumidor: formValue.ComunaConsumidor,
      regionConsumidor: formValue.RegionConsumidor,
      referencia: formValue.Modelo || '', // si tienes este campo, si no elimínalo
      descripcionHerramienta: formValue.Descripcion || 'se debe agregar',
      serie: formValue.serie,
      nombreConsumidor: formValue.NombreConsumidor,
      rutConsumidor: formValue.RutConsumidor,
      nombreTecnico: formValue.Revendedor,
      tipoDocumento : formValue.TipoDocumento
    };
  }

  borrarMensaje() {
    this.successMessage = false; // Limpiar el mensaje
    
  }

  borrarNombresArchivos(){
    this.filePreviews = [
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' },
      { file: null, url: '', type: '', name: '' }
    ];
   
  }

  clearFile(index: number) {
    const controlName = this.getControlNameByIndex(index);
    this.garantiaForm.get(controlName)?.reset();
    this.filePreviews[index] = null;

    const fileInput = document.getElementById(`archivo${index}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getControlNameByIndex(index: number): string {
    const controlNames = ['serieHerramienta', 'herramienta', 'repuesto', 'boleta'];
    return controlNames[index];
  }

  generarComprobante(formData: any) {
   if (!formData || Object.keys(formData).length === 0) {
      console.warn('Datos de comprobante vacíos');
      return;
    }

    // Mapeo de campos internos a nombres visibles
    const fieldLabels: { [key: string]: string } = {
      FechaDigitalizacionOs: 'Fecha Ingreso',
      TipoDocumento: 'Tipo Documento',
      InformeTecnico: 'Informe Técnico',
      Modelo: 'Modelo',
      serie: 'Serie',
      Revendedor: 'Revendedor',
      RutServicioTecnico: 'RUT Servicio Técnico',
      NombreServicioAut: 'Nombre Servicio Autorizado',
      NombreConsumidor: 'Nombre del Consumidor',
      DireccionConsumidor: 'Dirección',
      CiudadConsumidor: 'Ciudad',
      RegionConsumidor: 'Región',
      RutConsumidor: 'RUT del Consumidor',
      TelCliente: 'Teléfono del Cliente',
    };

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Voucher de Garantía', 20, 20);

    doc.setFontSize(12);
    doc.text('Herramienta en servicio técnico para evaluación.', 20, 30);

    // Cuerpo de la tabla con etiquetas visibles
    const bodyData = Object.entries(formData).map(([key, value]) => {
      const label = fieldLabels[key] || key; // usa el label traducido o el key si no está definido
      return [label, String(value)];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Campo', 'Valor']],
      body: bodyData,
    });

    doc.save(`voucher_${formData.NombreConsumidor || 'cliente'}_${Date.now()}.pdf`);
  }

  buscarModelos() {
    let valor = this.garantiaForm.get('Modelo')?.value;
    if (valor && valor.length >= 2) {
      valor = valor.toUpperCase();
      this.garantiasServices.buscarItems(valor).subscribe({
        next: (data) => {
          this.modelosFiltrados = data.items;
          this.mostrarSugerencias = true;
        },
        error: (err) => console.error('Error en búsqueda de modelos', err)
      });
    } else {
      this.modelosFiltrados = [];
      this.mostrarSugerencias = false;
    }
  }

  seleccionarModelo(item: any) {
    this.garantiaForm.patchValue({ 
      Modelo: item.ItemCode ,
      Descripcion: item.ItemName
    });
    this.modelosFiltrados = [];
    this.mostrarSugerencias = false;
  }

  ocultarListaConDelay() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
      this.mostrarSugerenciasClientes = false;
      this.mostrarSugerenciasProveedores = false;
    }, 200);
  }

  cargarComunas(codigoRegion: number) {
    this.garantiasServices.getComunas(codigoRegion).subscribe({
      next: (comunas) => {
        this.dataComunas = comunas.comunasList;
      },
      error: (err) => {
        console.error('Error cargando comunas:', err);
        this.dataComunas = [];
      }
    });
  }

  buscarClientes(code?: string) {
    // Si no viene code, tomar el valor actual del FormControl
    const inputValue = code ?? this.garantiaForm.get('RutServicioTecnico')?.value ?? '';

    // Normalizar: si empieza con 'C', quitarla
    const cardCode = inputValue.startsWith('C') ? inputValue.substring(1) : inputValue;

    this.garantiasServices.getClientes(cardCode).subscribe({
      next: (response) => {
        console.log("response clientes:", response);

        if (response && response.cliente && response.cliente.length > 0) {
          // Si viene code -> tomar el primer cliente directamente
          if (code) {
            const cliente = response.cliente[0];
            this.garantiaForm.patchValue({ 
              RutServicioTecnico: cliente.CardCode,
              NombreServicioAut: cliente.CardName
            });
            this.mostrarSugerenciasClientes = false; // no muestro lista
          } else {
            // Si fue búsqueda por typing -> mostrar sugerencias
            this.clientesFiltrados = response.cliente;
            this.mostrarSugerenciasClientes = true;
             
          }
        } else {
          console.warn("No se encontró cliente con el código:", cardCode);
          this.clientesFiltrados = [];
          this.mostrarSugerenciasClientes = false;
        }
      },
      error: (err) => console.error('Error en búsqueda de clientes', err)
    });
  }




   seleccionarCliente(item: any) {
    this.garantiaForm.patchValue({ 
      RutServicioTecnico: item.CardCode.startsWith('C') ? item.CardCode.substring(1) : item.CardCode,
      NombreServicioAut: item.CardName
    });
    // sessionStorage.setItem('cardCode', item.CardCode);
    this.clientesFiltrados = [];
    this.mostrarSugerenciasClientes = false;
  }

  buscarProveedor() {
    let valor = this.garantiaForm.get('Revendedor')?.value;
    if (valor && valor.length >= 2) {
      valor = valor.toUpperCase();
      
      this.garantiasServices.getProveedor(valor).subscribe({
        next: (data) => {
       
          this.proveedorFiltrados = data.cliente;
          this.mostrarSugerenciasProveedores = true;
        },
        error: (err) => console.error('Error en búsqueda de modelos', err)
      });
    } else {
      this.proveedorFiltrados = [];
      this.mostrarSugerenciasProveedores = false;
    }
  }

  seleccionarProveedor(item: any) {
    this.garantiaForm.patchValue({ 
     // RutDistribuidor: item.CardCode.startsWith('P') ? item.CardCode.substring(1) : item.CardCode,
      Revendedor: item.CardName
    });
    this.proveedorFiltrados = [];
    this.mostrarSugerenciasProveedores = false;
  }

  onRutInput(event: any) {
    let value = event.target.value.replace(/\./g, '').replace(/-/g, '');

    if (value.length > 1) {
      const cuerpo = value.slice(0, -1);
      const dv = value.slice(-1).toUpperCase();
      const nuevoValor = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;

      event.target.value = nuevoValor;
      this.garantiaForm.get('RutConsumidor')?.setValue(nuevoValor); // <-- emitEvent true por defecto
    } else {
      this.garantiaForm.get('RutConsumidor')?.setValue(value);
    }
  }


  onFileSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreviews[index] = {
        file: file,            // <-- guardamos el archivo real
        url: e.target.result,  // preview
        type: file.type,
        name: file.name
      };
    };
    reader.readAsDataURL(file);
  }

 mostrarAlerta() {
    Swal.fire({
      title: '¡Éxito!',
      html: '<p class="swal2-text-custom">Orden generada correctamente</p>',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#008686',
      customClass: { title: 'swal2-title-custom' },
      showCloseButton: false,
    });
  }


}
