import { AbstractControl, ValidationErrors } from "@angular/forms";

export function rutChilenoValidator(control: AbstractControl): ValidationErrors | null {
  const rut = control.value?.toString().trim().toUpperCase();

  if (!rut) return null;

  // Quitar puntos y guion para procesar solo números y DV
  const rutSinFormato = rut.replace(/\./g, '').replace(/-/g, '');

  // Debe tener al menos 2 caracteres: números + dígito verificador
  if (rutSinFormato.length < 2) return { rutInvalido: true };

  const cuerpo = rutSinFormato.slice(0, -1);
  const dv = rutSinFormato.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return { rutInvalido: true };

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperadoNum = 11 - (suma % 11);
  let dvEsperado = '';

  if (dvEsperadoNum === 11) dvEsperado = '0';
  else if (dvEsperadoNum === 10) dvEsperado = 'K';
  else dvEsperado = dvEsperadoNum.toString();

  if (dv !== dvEsperado) return { rutInvalido: true };

  return null;
}
