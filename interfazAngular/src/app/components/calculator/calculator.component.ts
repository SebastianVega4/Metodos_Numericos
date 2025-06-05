import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements AfterViewChecked {
  operationString: string = '';
  basicOperationShape = /[-+*/]/;
  cursorPosition: number = 0;
  memoryValue: number = 0;

  @ViewChild('displayBox', { static: true }) displayBox!: ElementRef<HTMLInputElement>;
  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  ngAfterViewChecked() {
    this.adjustFontSize();
  }

  adjustFontSize() {
    const input = this.displayBox.nativeElement;
    const maxWidth = parseInt(getComputedStyle(input).width);
    const textWidth = this.getTextWidth(this.operationString, getComputedStyle(input).font);

    if (textWidth > maxWidth * 1.5) {
      input.classList.add('smaller-font');
      input.classList.remove('small-font');
    } else if (textWidth > maxWidth) {
      input.classList.add('small-font');
      input.classList.remove('smaller-font');
    } else {
      input.classList.remove('small-font', 'smaller-font');
    }

    // Asegurar que el texto visible incluya la posición del cursor
    this.scrollToCursor();
  }

  scrollToCursor() {
    const input = this.displayBox.nativeElement;
    const charWidth = this.getTextWidth('M', getComputedStyle(input).font);
    const scrollPos = this.cursorPosition * charWidth - input.clientWidth / 2;
    input.scrollLeft = Math.max(0, scrollPos);
  }

  getTextWidth(text: string, font: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = font;
      return context.measureText(text).width;
    }
    return 0;
  }

  setCursorPosition(event: MouseEvent) {
    const input = event.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const x = event.clientX - rect.left + input.scrollLeft;
    let pos = 0;
    let width = 0;

    for (let i = 0; i < this.operationString.length; i++) {
      const charWidth = this.getTextWidth(this.operationString[i], getComputedStyle(input).font);
      width += charWidth;
      if (width > x) break;
      pos++;
    }

    this.cursorPosition = pos;
    setTimeout(() => {
      input.setSelectionRange(pos, pos);
      this.scrollToCursor();
    }, 0);
  }

  handleKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Permitir navegación con teclado
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      setTimeout(() => {
        this.cursorPosition = input.selectionStart || 0;
        this.scrollToCursor();
      }, 0);
      return;
    }

    // Manejar edición en posición del cursor
    if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();

      if (event.key === 'Backspace') {
        if (this.cursorPosition > 0) {
          this.operationString =
            this.operationString.substring(0, this.cursorPosition - 1) +
            this.operationString.substring(this.cursorPosition);
          this.cursorPosition--;
        }
      } else if (event.key === 'Delete') {
        if (this.cursorPosition < this.operationString.length) {
          this.operationString =
            this.operationString.substring(0, this.cursorPosition) +
            this.operationString.substring(this.cursorPosition + 1);
        }
      } else {
        this.operationString =
          this.operationString.substring(0, this.cursorPosition) +
          event.key +
          this.operationString.substring(this.cursorPosition);
        this.cursorPosition++;
      }

      // Actualizar la posición del cursor en el input
      setTimeout(() => {
        input.setSelectionRange(this.cursorPosition, this.cursorPosition);
        this.scrollToCursor();
      }, 0);
    }
  }

  writeToDisplay(value: string) {
    this.operationString =
      this.operationString.substring(0, this.cursorPosition) +
      value +
      this.operationString.substring(this.cursorPosition);
    this.cursorPosition += value.length;

    // Enfocar y posicionar el cursor
    setTimeout(() => {
      this.displayBox.nativeElement.focus();
      this.displayBox.nativeElement.setSelectionRange(this.cursorPosition, this.cursorPosition);
      this.scrollToCursor();
    }, 0);
  }

  writeMathFunction(data: string) {
    let transformedData = data;

    switch(data) {
    case 'sin(': transformedData = 'math.sin('; break;
    case 'cos(': transformedData = 'math.cos('; break;
    case 'tan(': transformedData = 'math.tan('; break;
    case 'sqrt(': transformedData = 'math.sqrt('; break;
    case 'log(': transformedData = 'math.log10('; break;
    case 'ln(': transformedData = 'math.log('; break;
    case '10^x': transformedData = 'math.pow(10,'; break;
    case 'x^2': transformedData = '**2'; break;
    case 'x^3': transformedData = '**3'; break;
    case 'x^-1': transformedData = '**-1'; break;
    case 'e': transformedData = 'math.e'; break;
    case 'PI': transformedData = 'math.pi'; break;
    case '!': transformedData = '!'; break;
  }

    this.writeToDisplay(transformedData);
  }

  writeOperatorToDisplay(operator: string) {
    // Reemplazar operador si el último carácter es un operador
    if (this.operationString.length > 0 &&
        this.basicOperationShape.test(this.operationString[this.operationString.length - 1])) {
      this.operationString = this.operationString.slice(0, -1) + operator;
      if (this.cursorPosition === this.operationString.length + 1) {
        this.cursorPosition--;
      }
    } else {
      this.writeToDisplay(operator);
    }
  }

  toggleSign() {
    if (this.operationString.startsWith('-')) {
      this.operationString = this.operationString.slice(1);
      if (this.cursorPosition === 1) {
        this.cursorPosition = 0;
      }
    } else {
      this.operationString = '-' + this.operationString;
      this.cursorPosition++;
    }
  }

  clearDisplay() {
    this.operationString = '';
    this.cursorPosition = 0;
  }

  eraseLastInput() {
    if (this.operationString.length > 0) {
      this.operationString = this.operationString.slice(0, -1);
      if (this.cursorPosition > this.operationString.length) {
        this.cursorPosition = this.operationString.length;
      }
    }
  }

  passOperationString() {
  try {
    // Reemplazar Math por math para compatibilidad con Python
    const expression = this.operationString.replace(/Math\./g, 'math.');
    const result = new Function('math', `return ${expression}`)(Math);
    this.save.emit(result.toString());
  } catch (e) {
    this.save.emit('Error');
  }
  this.close.emit();
}

saveFunctionString() {
  // También aplicar el reemplazo al guardar la función
  const expression = this.operationString.replace(/Math\./g, 'math.');
  this.save.emit(expression);
  this.close.emit();
}

  // Funciones de memoria
  clearMemory() {
    this.memoryValue = 0;
  }

  readMemory() {
    this.writeToDisplay(this.memoryValue.toString());
  }

  addToMemory() {
    try {
      const currentValue = eval(this.operationString) || 0;
      this.memoryValue += currentValue;
    } catch (e) {
      // Ignorar errores
    }
  }

  subtractFromMemory() {
    try {
      const currentValue = eval(this.operationString) || 0;
      this.memoryValue -= currentValue;
    } catch (e) {
      // Ignorar errores
    }
  }

  saveToMemory() {
    try {
      this.memoryValue = eval(this.operationString) || 0;
    } catch (e) {
      // Ignorar errores
    }
  }
}
