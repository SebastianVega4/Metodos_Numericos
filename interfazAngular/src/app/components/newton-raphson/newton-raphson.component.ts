import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewtonRaphson } from 'src/app/models/NewtonRaphson';
import { NewtonRaphsonService } from "src/app/services/newtonRaphsonService";

@Component({
  selector: 'app-newton-raphson',
  templateUrl: './newton-raphson.component.html',
  styleUrls: ['./newton-raphson.component.css']
})
export class NewtonRaphsonComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método De Newton Raphson';
  lista: any = [];
  raiz: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private newtonRaphsonService: NewtonRaphsonService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', Validators.required],
      derivada: ['', Validators.required],
      puntoI: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  consulta() {
  // Validar que la función y derivada sean expresiones válidas
  try {
    // Intenta evaluar las expresiones para ver si son válidas
    const testFunc = new Function('x', 'return ' + this.eventForm.get('funcion')?.value);
    const testDeriv = new Function('x', 'return ' + this.eventForm.get('derivada')?.value);
    
    // Test con un valor cualquiera
    testFunc(1);
    testDeriv(1);
  } catch (e) {
    let errorMessage = 'Error desconocido en la función o derivada';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    alert(`Error en la función o derivada: ${errorMessage}`);
    return;
  }

  // Resto del código permanece igual...
  const newtonRaphson: NewtonRaphson = {
    funcion: this.eventForm.get('funcion')?.value,
    derivada: this.eventForm.get('derivada')?.value,
    punto_inicial: this.eventForm.get('puntoI')?.value
  };

  this.newtonRaphsonService.save(newtonRaphson).subscribe(
    response => {
      console.log(response);
      const data = response.Iteraciones;
      this.raiz = response.Raiz;
      this.imagen = 'data:image/png;base64,' + response.Imagen;
      if (Array.isArray(data)) {
        this.lista = data;
      } else {
        console.error('Los datos recibidos no son un array:', data);
        alert('Formato de respuesta inesperado del servidor.');
      }
    },
    error => {
      console.error(error);
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }
      alert(`Error: ${errorMessage}`);
      this.eventForm.reset();
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
