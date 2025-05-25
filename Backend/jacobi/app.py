from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def validate_matrix(A, b):
    """Validar la matriz y vector de entrada."""
    n = len(b)
    
    # Verificar que la matriz sea cuadrada
    if len(A) != n or any(len(row) != n for row in A):
        raise ValueError("La matriz debe ser cuadrada y coincidir con el tamaño del vector")
    
    # Verificar que no haya ceros en la diagonal
    for i in range(n):
        if A[i][i] == 0:
            raise ValueError(f"El elemento diagonal A[{i+1}][{i+1}] no puede ser cero")
    
    # Verificar que la matriz sea diagonalmente dominante
    for i in range(n):
        diagonal = abs(A[i][i])
        row_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        if diagonal <= row_sum:
            raise ValueError(f"La matriz no es diagonalmente dominante en la fila {i+1}")

def jacobi_method(A, b, tol=1e-6, max_iter=100):
    n = len(b)
    x = np.zeros(n)
    x1 = np.copy(x)
    k = 1
    iterations = []

    while k <= max_iter:
        current_iteration = {'iteration': k, 'x': x1.tolist()}
        for i in range(n):
            summation = 0
            for j in range(n):
                if i != j:
                    summation += A[i][j] * x1[j]
            try:
                x[i] = (b[i] - summation) / A[i][i]
            except ZeroDivisionError:
                raise ValueError(f"División por cero en el cálculo de x[{i}]")

        error = np.linalg.norm(x - x1)
        current_iteration['error'] = error
        iterations.append(current_iteration)

        if error < tol:
            return iterations, x.tolist(), error

        x1 = np.copy(x)
        k += 1

    raise ValueError(f"No convergió después de {max_iter} iteraciones. Último error: {error}")

@app.route('/jacobi', methods=['POST'])
def solve_jacobi():
    data = request.json
    
    # Validar datos de entrada
    if not data or 'Matriz' not in data or 'Vector_Resultado' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren: Matriz y Vector_Resultado.'}), 400
    
    try:
        A = np.array(data['Matriz'], dtype=float)
        b = np.array(data['Vector_Resultado'], dtype=float)
        
        # Validar matriz y vector
        validate_matrix(A, b)
        
        # Ejecutar método
        iterations, solution, final_error = jacobi_method(A, b)
        return jsonify({
            'iteracion': iterations, 
            'solucion': solution, 
            'error_final': final_error
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007)