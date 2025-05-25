import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PuntoF } from 'src/app/models/PuntoF';
import { PuntoFService } from 'src/app/services/puntoFService';

@Component({
  selector: 'app-punto-fijo',
  templateUrl: './punto-fijo.component.html',
  styleUrls: ['./punto-fijo.component.css']
})
export class PuntoFijoComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Metodo Punto Fijo';
  lista: any[] = [];
  raiz: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private puntoService: PuntoFService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', [Validators.required, this.validateMathExpression]],
      funcionO: ['', [Validators.required, this.validateMathExpression]],
      puntoI: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  // Validador personalizado para expresiones matemáticas
  validateMathExpression(control: any) {
    const value = control.value;
    if (!value) return null;
    
    try {
      // Intenta evaluar la expresión con math y x
      const testFn = new Function('math', 'x', `return ${value}`);
      testFn(Math, 1); // Prueba con x=1
      return null; // No hay error
    } catch (e) {
      return { invalidExpression: true };
    }
  }

  consulta() {
    if (this.eventForm.invalid) {
      this.showAlert('Por favor complete todos los campos correctamente');
      return;
    }

    const puntoF: PuntoF = {
      funcion: this.eventForm.get('funcion')?.value,
      funcion_original: this.eventForm.get('funcionO')?.value,
      punto_inicial: this.eventForm.get('puntoI')?.value
    };

    this.puntoService.save(puntoF).subscribe(
      response => {
        if (response.error) {
          this.showAlert(response.error);
          return;
        }
        
        const data = response.Iteraciones;
        this.raiz = response.Raiz;
        this.imagen = 'data:image/png;base64,' + response.Imagen;
        
        if (Array.isArray(data)) {
          this.lista = data;
        } else {
          console.error('Los datos recibidos no son un array:', data);
          this.showAlert('Error en el formato de los datos recibidos');
        }
      },
      error => {
        console.error(error);
        let errorMessage = 'Ocurrió un error al procesar la solicitud';
        
        if (error.error?.error) {
          errorMessage = this.parseErrorMessage(error.error.error);
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        }
        
        this.showAlert(errorMessage);
        this.eventForm.reset();
      }
    );
  }

  // Analiza los mensajes de error del servidor para mostrarlos mejor
  private parseErrorMessage(error: string): string {
    if (error.includes('Error en la función')) {
      return 'Error en la expresión matemática: ' + error.split(':')[-1];
    } else if (error.includes('No convergió')) {
      return 'El método no convergió. Intente con otro punto inicial o función.';
    } else if (error.includes('division by zero')) {
      return 'División por cero detectada en la función';
    } else if (error.includes('math domain error')) {
      return 'Operación matemática inválida (ej. raíz cuadrada de negativo)';
    }
    return error;
  }

  private showAlert(message: string): void {
    alert(message);
  }

  openCalculator(field: string) {
    this.selectedField = field;
    const calculatorModal = document.getElementById('calculatorModal');
    if (calculatorModal) {
      calculatorModal.style.display = 'flex';
    }
  }

  closeCalculator() {
    const calculatorModal = document.getElementById('calculatorModal');
    if (calculatorModal) {
      calculatorModal.style.display = 'none';
    }
  }

  saveFunction(func: string) {
    if (this.selectedField) {
      this.eventForm.get(this.selectedField)?.setValue(func);
      this.closeCalculator();
    }
  }
}