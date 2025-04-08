// src/app/models/user.model.ts

export interface User {
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    Area: string;
    Email: string;
    Estado: string;
    FechaFin: string;
    FechaInicio: string;
    Nombre: string;
    NombreUsuario: string;
    Rol: string;
    UsuarioID: number;
    actividad: Actividad[];
  }

  interface Actividad {
    nombreActividad: string;
    codigoActividad: number; // Asegúrate de que este tipo coincida con tus datos
  }
  

 export interface ReconteoData {
    tipoItem: string;
    local: string;
    fechaInventario: string;
    bodega: number;
  }