import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  operationString: string = '';
  basicOperationShape = /[-+*/%^]/;
  memoryValue: number = 0;
  isMemorySet: boolean = false;
  isSecondFunction: boolean = false;
  lastAnswer: number = 0;
  degreeMode: boolean = false;

  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // Modo segunda función
  secondFunctionMode() {
    this.isSecondFunction = !this.isSecondFunction;
  }

  // Escribir en el display
  writeToDisplay(value: string) {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    if (displayBox.value.length < 100) {
      displayBox.value += value;
      this.operationString = displayBox.value;
      this.scrollDisplayToEnd();
    }
  }

  // Funciones matemáticas
  writeMathFunction(data: string) {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    let currentValue = displayBox.value;

    // Manejar funciones trigonométricas según el modo (grados/radianes)
    if (this.degreeMode && ['sin(', 'cos(', 'tan(', 'sinh(', 'cosh(', 'tanh('].includes(data)) {
      data = data.replace('(', '(Math.PI/180*');
    }

    switch (data) {
      case 'sin(':
        currentValue += 'Math.sin(';
        break;
      case 'cos(':
        currentValue += 'Math.cos(';
        break;
      case 'tan(':
        currentValue += 'Math.tan(';
        break;
      case 'sinh(':
        currentValue += 'Math.sinh(';
        break;
      case 'cosh(':
        currentValue += 'Math.cosh(';
        break;
      case 'tanh(':
        currentValue += 'Math.tanh(';
        break;
      case 'x^2':
        currentValue += '**2';
        break;
      case 'x^3':
        currentValue += '**3';
        break;
      case 'x^y':
        currentValue += '**';
        break;
      case '10^x':
        currentValue += '10**';
        break;
      case 'e^x':
        currentValue += 'Math.exp(';
        break;
      case '1/x':
        currentValue += '1/';
        break;
      case 'sqrt(':
        currentValue += 'Math.sqrt(';
        break;
      case 'cbrt(':
        currentValue += 'Math.cbrt(';
        break;
      case 'yroot(':
        currentValue += 'Math.pow(?,1/';
        break; // Requiere manejo especial
      case 'ln(':
        currentValue += 'Math.log(';
        break;
      case 'log(':
        currentValue += 'Math.log10(';
        break;
      case 'factorial(':
        currentValue += this.factorialExpression();
        break;
      case 'PI':
        currentValue += 'Math.PI';
        break;
      case 'E':
        currentValue += 'Math.E';
        break;
      case 'rand(':
        currentValue += 'Math.random()';
        break;
      case 'abs(':
        currentValue += 'Math.abs(';
        break;
      case 'mod(':
        currentValue += '%';
        break;
      case 'floor(':
        currentValue += 'Math.floor(';
        break;
      case 'deg(':
        this.degreeMode = true;
        currentValue = '';
        break;
      case 'rad(':
        this.degreeMode = false;
        currentValue = '';
        break;
      default:
        currentValue += data;
    }

    displayBox.value = currentValue;
    this.operationString = currentValue;
    this.scrollDisplayToEnd();
  }

  // Operadores
  writeOperatorToDisplay(operator: string) {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    let legacy = displayBox.value;

    if (this.basicOperationShape.test(legacy.slice(-1))) {
      this.operationString = legacy.slice(0, -1) + operator;
    } else {
      this.operationString = legacy + operator;
    }

    displayBox.value = this.operationString;
    this.scrollDisplayToEnd();
  }

  // Cambiar signo
  toggleSign() {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    let currentValue = displayBox.value;

    if (currentValue.startsWith('-')) {
      displayBox.value = currentValue.slice(1);
    } else {
      displayBox.value = '-' + currentValue;
    }

    this.operationString = displayBox.value;
  }

  // Limpiar
  clearDisplay() {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    displayBox.value = '';
    this.operationString = '';
  }

  clearAll() {
    this.clearDisplay();
    this.isSecondFunction = false;
  }

  // Borrar último carácter
  eraseLastInput() {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    let currentValue = displayBox.value;
    displayBox.value = currentValue.slice(0, -1);
    this.operationString = displayBox.value;
  }

  // Calcular resultado
  passOperationString() {
    try {
      // Reemplazar constantes y funciones personalizadas
      let expression = this.operationString
        .replace(/\^/g, '**') // Convertir ^ a **
        .replace(/mod/g, '%') // Convertir mod a %
        .replace(/π/g, 'Math.PI') // Convertir π a Math.PI
        .replace(/e/g, 'Math.E'); // Convertir e a Math.E

      const result = new Function('Math', 'return ' + expression)(Math);
      this.lastAnswer = result;
      this.save.emit(result.toString());
    } catch (e) {
      this.save.emit('Error');
    }
    this.close.emit();
  }

// Agrega esta función para manejar el scroll
  ngAfterViewInit() {
    const display = document.getElementById('displayBox');
    if (display) {
      display.addEventListener('scroll', () => {
        const indicator = display.querySelector('.display-scroll-indicator');
        if (indicator) {
          indicator.style.display = display.scrollWidth > display.clientWidth ? 'block' : 'none';
        }
      });
    }
  }

  // Guardar función
  saveFunctionString() {
    this.save.emit(this.operationString);
    this.close.emit();
  }

  // Memoria
  clearMemory() {
    this.memoryValue = 0;
    this.isMemorySet = false;
  }

  readMemory() {
    if (this.isMemorySet) {
      this.writeToDisplay(this.memoryValue.toString());
    }
  }

  addToMemory() {
    try {
      const currentValue = parseFloat(this.operationString) || 0;
      this.memoryValue += currentValue;
      this.isMemorySet = true;
    } catch (e) {
      console.error('Error adding to memory');
    }
  }

  subtractFromMemory() {
    try {
      const currentValue = parseFloat(this.operationString) || 0;
      this.memoryValue -= currentValue;
      this.isMemorySet = true;
    } catch (e) {
      console.error('Error subtracting from memory');
    }
  }

  saveToMemory() {
    try {
      const currentValue = parseFloat(this.operationString);
      if (!isNaN(currentValue)) {
        this.memoryValue = currentValue;
        this.isMemorySet = true;
      }
    } catch (e) {
      console.error('Error saving to memory');
    }
  }

  // Expresión para factorial
  private factorialExpression(): string {
    return '((n)=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r})(';
  }

  // Desplazamiento del display
  private scrollDisplayToEnd() {
    const displayBox = document.getElementById("displayBox") as HTMLInputElement;
    setTimeout(() => {
      displayBox.scrollLeft = displayBox.scrollWidth;
    }, 0);
  }
}
