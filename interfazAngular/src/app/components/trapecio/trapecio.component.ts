import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trapecio } from 'src/app/models/trapecio';
import { trapecioService } from 'src/app/services/trapecioService';

@Component({
  selector: 'app-Trapecio',
  templateUrl: './trapecio.component.html',
  styleUrls: ['./trapecio.component.css']
})
export class TrapecioComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método Del Trapécio';
  lista: any[] = [];
  area: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private trapeService: trapecioService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', Validators.required],
      a: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      b: ['', [Validators.required, Validators.pattern(/^-?\d*\.?\d+$/)]],
      n: ['', [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]]
    });
  }

  ngOnInit(): void { }

  consulta() {
    // Validar que a sea menor que b
    const a = parseFloat(this.eventForm.get('a')?.value);
    const b = parseFloat(this.eventForm.get('b')?.value);
    
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

    const trape: trapecio = {
      funcion: this.eventForm.get('funcion')?.value,
      a: a,
      b: b,
      n: parseInt(this.eventForm.get('n')?.value)
    };

    this.trapeService.save(trape).subscribe(
      response => {
        console.log(response);
        this.area = response.Area;
        this.imagen = 'data:image/png;base64,' + response.Imagen;
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
    this.selectedField = field;
    const calculatorModal = document.getElementById('calculatorModal');
    if (calculatorModal) {
      calculatorModal.style.display = 'block';
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