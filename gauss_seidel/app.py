from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def is_diagonally_dominant(A):
    n = len(A)
    for i in range(n):
        diag = abs(A[i][i])
        row_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        if diag <= row_sum:
            return False
    return True


def gauss_seidel(matriz, vector, error_min, iteraciones_max):
    n = len(vector)
    x = np.zeros(n)
    iterations = []

    # Verificar diagonal no nula
    for i in range(n):
        if matriz[i][i] == 0:
            return None, None, "Elemento diagonal cero en fila {}".format(i + 1)

    # Verificar convergencia
    is_dominant = is_diagonally_dominant(matriz)

    for k in range(iteraciones_max):
        x_prev = np.copy(x)
        for i in range(n):
            sigma = 0
            for j in range(n):
                if j != i:
                    sigma += matriz[i][j] * x[j]
            x[i] = (vector[i] - sigma) / matriz[i][i]

        # Calcular error
        error = np.linalg.norm(x - x_prev)
        iterations.append({
            'iteracion': k + 1,
            'x': [round(val, 6) for val in x.tolist()],
            'error': round(error, 6)
        })

        if error < error_min:
            break

    return x, iterations, None


@app.route('/gauss-seidel', methods=['POST'])
def resolver_gauss_seidel():
    try:
        data = request.json
        A = np.array(data['matriz'], dtype=float)
        b = np.array(data['vector'], dtype=float)

        # Validaciones
        if A.shape[0] != A.shape[1]:
            return jsonify({'error': 'La matriz debe ser cuadrada'}), 400

        if len(b) != A.shape[0]:
            return jsonify({'error': 'Dimensiones incompatibles entre matriz y vector'}), 400

        # Ejecutar método
        solucion, iteraciones, error = gauss_seidel(A, b, data.get('error_min', 1e-6), data.get('iteraciones_max', 100))

        if error:
            return jsonify({'error': error}), 400

        return jsonify({
            'resultado': [round(val, 6) for val in solucion.tolist()],
            'iteraciones': iteraciones,
            'advertencia': None if is_diagonally_dominant(A) else "Advertencia: La matriz no es diagonalmente dominante"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)