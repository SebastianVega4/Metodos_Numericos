import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Simpson } from 'src/app/models/Simpson';
import { SimpsonService } from 'src/app/services/simpsonService';

@Component({
  selector: 'app-simpson',
  templateUrl: './simpson.component.html',
  styleUrls: ['./simpson.component.css']
})
export class SimpsonComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método de Simpson';
  lista: any[] = [];
  raiz: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private simpsonS: SimpsonService,
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', Validators.required],
      limitea: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      limiteb: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      nimagenes: ['', [Validators.required, Validators.min(2), this.parValidator]],
    });
  }

  ngOnInit(): void { }

  // Validador personalizado para verificar que el número sea par
  parValidator(control: any) {
    const value = control.value;
    if (value && value % 2 !== 0) {
      return { parError: true };
    }
    return null;
  }

  consulta() {
    // Validar que a sea menor que b
    const a = parseFloat(this.eventForm.get('limitea')?.value);
    const b = parseFloat(this.eventForm.get('limiteb')?.value);

    if (a >= b) {
      alert('El límite inferior (a) debe ser menor que el límite superior (b)');
      return;
    }

    // Validar que la función sea una expresión válida
    try {
      const testFunc = new Function('x', 'return ' + this.eventForm.get('funcion')?.value);
      testFunc(1); // Test con un valor cualquiera
    } catch (e) {
      let errorMessage = 'Error en la función: ';
      if (e instanceof Error) {
        errorMessage += e.message;
      } else if (typeof e === 'string') {
        errorMessage += e;
      }
      alert(errorMessage);
      return;
    }

    const simpson: Simpson = {
      funcion: this.eventForm.get('funcion')?.value,
      limitea: a,
      limiteb: b,
      nimagenes: parseInt(this.eventForm.get('nimagenes')?.value)
    };

    this.simpsonS.save(simpson).subscribe(
      response => {
        console.log(response);
        const data = response.Resultados;
        this.raiz = response.Raiz;
        this.imagen = 'data:image/png;base64,' + response.Grafica;

        if (Array.isArray(data)) {
          this.lista = data;
        } else {
          console.error('Los datos recibidos no son un array:', data);
          alert('Formato de respuesta inesperado del servidor.');
        }
      },
      error => {
        console.error(error);
        let errorMessage = 'Error al procesar la solicitud: ';
        if (error instanceof Error) {
          errorMessage += error.message;
        } else if (typeof error === 'string') {
          errorMessage += error;
        } else if (error.error?.error) {
          errorMessage += error.error.error;
        }
        alert(errorMessage);
      }
    );
  }

  openCalculator(field: string) {
    this.selectedField = field; // Guarda el campo seleccionado
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
