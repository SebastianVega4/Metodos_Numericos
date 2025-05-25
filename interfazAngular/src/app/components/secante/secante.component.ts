import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Secante } from 'src/app/models/secante';
import { SecanteService } from 'src/app/services/secanteService';

@Component({
  selector: 'app-secante',
  templateUrl: './secante.component.html',
  styleUrls: ['./secante.component.css']
})
export class SecanteComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método De La Secante';
  lista: any[] = [];
  raiz: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private secanteService: SecanteService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', [Validators.required, this.validateMathExpression]],
      x0: ['', [Validators.required, this.validateNumber]],
      x1: ['', [Validators.required, this.validateNumber]],
    });
  }

  ngOnInit(): void {}

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

  // Validador personalizado para números
  validateNumber(control: any) {
    const value = control.value;
    if (value === null || value === '') return null;
    
    if (isNaN(value)) {
      return { invalidNumber: true };
    }
    return null;
  }

  consulta() {
    if (this.eventForm.invalid) {
      this.showAlert('Por favor complete todos los campos correctamente');
      return;
    }

    const secante: Secante = {
      funcion: this.eventForm.get('funcion')?.value,
      x0: this.eventForm.get('x0')?.value,
      x1: this.eventForm.get('x1')?.value
    };

    this.secanteService.save(secante).subscribe(
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
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos enviados al servidor';
        }
        
        this.showAlert(errorMessage);
      }
    );
  }

  // Analiza los mensajes de error del servidor para mostrarlos mejor
  private parseErrorMessage(error: string): string {
    if (error.includes('Error en la función')) {
      return 'Error en la expresión matemática: ' + error.split(':').pop();
    } else if (error.includes('División por cero')) {
      return 'División por cero detectada en el cálculo. Intente con otros puntos iniciales.';
    } else if (error.includes('No se encuentra la raíz')) {
      return 'El método no convergió. Intente con otros puntos iniciales.';
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