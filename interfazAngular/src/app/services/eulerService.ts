import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Euler } from '../models/euler';

@Injectable({
  providedIn: 'root'
})
export class EulerService {
  private url = 'http://localhost:5009/euler';

  constructor(private http: HttpClient) { }

  solve(euler: Euler): Observable<any> {
    return this.http.post(this.url, euler).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error al procesar la solicitud';
        
        if (error.error?.error) {
          errorMessage = this.parseErrorMessage(error.error.error);
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidorrr';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos enviados al servidor';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor';
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private parseErrorMessage(error: string): string {
    if (error.includes('Término no permitido')) {
      return 'Expresión matemática contiene términos no permitidos: ' + error.split(':').pop();
    } else if (error.includes('División por cero')) {
      return 'División por cero detectada en la función';
    } else if (error.includes('Error de sintaxis')) {
      return 'Error de sintaxis en la expresión matemática: ' + error.split(':').pop();
    }
    return error;
  }
}