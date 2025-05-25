from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def is_numeric(value):
    try:
        float(value)
        return True
    except ValueError:
        return False

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

def gauss_seidel(matriz, vector, error_min, iteraciones_max):
    filas, columnas = matriz.shape
    x = np.zeros(filas)
    comp = np.zeros(filas)
    iteraciones = []

    for k in range(iteraciones_max):
        iteracion_actual = x.copy()
        for valorF in range(filas):
            suma = 0
            for valorC in range(columnas):
                if valorC != valorF:
                    suma += matriz[valorF, valorC] * x[valorC]
            try:
                x[valorF] = (vector[valorF] - suma) / matriz[valorF, valorF]
            except ZeroDivisionError:
                raise ValueError(f"División por cero al calcular x[{valorF}]")

        iteraciones.append({'iteracion': k + 1, 'x': x.tolist()})

        for valorF in range(filas):
            suma = 0
            for valorC in range(columnas):
                suma += matriz[valorF, valorC] * x[valorC]
            comp[valorF] = suma

        error = np.abs(comp - vector)
        if all(i <= error_min for i in error):
            break

    if k == iteraciones_max - 1:
        raise ValueError(f"No convergió después de {iteraciones_max} iteraciones. Último error: {max(error)}")

    return x, error.tolist(), iteraciones

@app.route('/gauss-seidel', methods=['POST'])
def resolver_gauss_seidel():
    data = request.json

    if 'matriz' not in data or 'vector' not in data:
        return jsonify({'error': 'Faltan campos necesarios: matriz y vector son requeridos.'}), 400

    try:
        matriz = np.array(data['matriz'], dtype=float)
        vector = np.array(data['vector'], dtype=float)
        error_min = float(data.get('error_min', 1e-6))
        iteraciones_max = int(data.get('iteraciones_max', 100))
    except ValueError:
        return jsonify({'error': 'Todos los elementos deben ser números válidos.'}), 400

    try:
        validate_matrix(matriz, vector)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    try:
        resultado, error, iteraciones = gauss_seidel(matriz, vector, error_min, iteraciones_max)
        return jsonify({
            'resultado': resultado.tolist(),
            'error': error,
            'iteraciones': iteraciones
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006)