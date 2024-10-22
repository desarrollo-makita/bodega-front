import { Component, EventEmitter, forwardRef, Output } from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-password-strength",
  templateUrl: "./password-strength.component.html",
  styleUrls: ["./password-strength.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordStrengthComponent),
      multi: true,
    },
  ],
})
export class PasswordStrengthComponent {
  @Output() passwordValid = new EventEmitter<boolean>();
  passwordControl: FormControl = new FormControl("");

  password: string = "";
  hasUpperCase: boolean = false;
  hasSpecialCharacter: boolean = false;
  hasMinLength: boolean = false;
  hasNumber: boolean = false;
  showBarra: boolean = false;

  passwordStrength: string = "";
  strengthClass: string = "";

  private onChange: any = () => {};
  private onTouched: any = () => {};

  showPassword: boolean = false;

  progressBarClass: string = "";
  progressBarWidth: number = 0;

  onPasswordInput(password: string) {
    this.password = password;
    if (this.password.length === 0) {
      this.showBarra = false;
    } else {
      this.showBarra = true;
      this.hasUpperCase = /[A-Z]/.test(this.password);
      this.hasSpecialCharacter = /[\W_]/.test(this.password); // Carácter especial
      this.hasMinLength = this.password.length >= 8;
      this.hasNumber = /\d/.test(this.password); // Verifica que contenga un número

      this.calculateStrength();
      this.onChange(this.password); // Notifica al formulario reactivo del cambio
      this.onTouched(); // Marca el control como tocado
    }
  }

  calculateStrength() {
    const strengthPoints = [
      this.hasUpperCase,
      this.hasSpecialCharacter,
      this.hasMinLength,
      this.hasNumber,
    ].filter(Boolean).length;

    if (strengthPoints <= 1) {
      this.passwordStrength = "Clave Débil";
      this.progressBarClass = "bg-danger"; // Rojo para clave débil
      this.progressBarWidth = 25; // 25% de ancho
      this.strengthClass = "weak"; // Clase para clave débil
    } else if (strengthPoints === 2 || strengthPoints === 3) {
      this.passwordStrength = "Clave Media";
      this.progressBarClass = "bg-warning"; // Amarillo para clave media
      this.progressBarWidth = 50; // 50% de ancho
      this.strengthClass = "medium"; // Clase para clave media
    } else {
      this.passwordStrength = "Clave Fuerte";
      this.progressBarClass = "bg-success"; // Verde para clave fuerte
      this.progressBarWidth = 100; // 100% de ancho
      this.strengthClass = "strong"; // Clase para clave fuerte
    }
  }

  // Métodos de ControlValueAccessor
  writeValue(value: any): void {
    this.password = value || "";
    this.onPasswordInput(this.password);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
