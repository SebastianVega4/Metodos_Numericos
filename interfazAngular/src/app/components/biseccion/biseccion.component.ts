import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Biseccion } from 'src/app/models/biseccion';
import { BiseccionService } from 'src/app/services/biseccionService';

@Component({
  selector: 'app-biseccion',
  templateUrl: './biseccion.component.html',
  styleUrls: ['./biseccion.component.css']
})
export class BiseccionComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método de Bisección';
  lista: any[] = [];
  raiz: number = 0;
  imagen: string = '';
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private biseccionService: BiseccionService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', Validators.required],
      x0: ['', Validators.required],
      x1: ['', Validators.required],
    });
  }

  ngOnInit(): void { }

  consulta() {
    // Validar que x0 y x1 sean diferentes
    const x0 = this.eventForm.get('x0')?.value;
    const x1 = this.eventForm.get('x1')?.value;

    if (x0 === x1) {
      alert('Los puntos x0 y x1 deben ser diferentes');
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

    const biseccion: Biseccion = {
      funcion: this.eventForm.get('funcion')?.value,
      x0: x0,
      x1: x1
    };

    this.biseccionService.save(biseccion).subscribe(
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
        let errorMessage = 'Error al procesar la solicitud: ';
        if (error instanceof Error) {
          errorMessage += error.message;
        } else if (typeof error === 'string') {
          errorMessage += error;
        } else if (error.error?.error) {
          errorMessage += error.error.error;
        }
        alert(errorMessage);
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


