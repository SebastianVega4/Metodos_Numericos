from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def is_diagonally_dominant(A):
    n = len(A)
    for i in range(n):
        diag = np.abs(A[i][i])
        row_sum = np.sum(np.abs(A[i])) - diag
        if diag <= row_sum:
            return False
    return True


def jacobi_method(A, b, tol=1e-6, max_iter=100):
    n = len(b)
    x = np.zeros(n)
    x_prev = np.copy(x)
    iterations = []

    # Verificar elementos diagonales no cero
    for i in range(n):
        if A[i][i] == 0:
            return None, None, f"Error: Elemento diagonal cero en fila {i + 1}."

    # Verificar convergencia (solo advertencia)
    is_dominant = is_diagonally_dominant(A)

    for k in range(1, max_iter + 1):
        current_iter = {'iteration': k, 'x': x_prev.tolist(), 'error': None}
        x = np.zeros(n)

        for i in range(n):
            sigma = np.dot(A[i, :i], x_prev[:i]) + np.dot(A[i, i + 1:], x_prev[i + 1:])
            x[i] = (b[i] - sigma) / A[i][i]

        error = np.linalg.norm(x - x_prev)
        current_iter['error'] = error
        iterations.append(current_iter)

        if error < tol:
            return iterations, x.tolist(), None

        x_prev = np.copy(x)

    return None, None, f"Error: No convergió después de {max_iter} iteraciones."


@app.route('/jacobi', methods=['POST'])
def solve_jacobi():
    data = request.json

    try:
        # Validar y procesar entrada
        A = np.array(data['Matriz'], dtype=float)
        b = np.array(data['Vector_Resultado'], dtype=float)

        if A.shape[0] != A.shape[1]:
            return jsonify({'error': 'La matriz debe ser cuadrada.'}), 400

        if A.shape[0] != b.size:
            return jsonify({'error': 'Dimensiones de matriz y vector no coinciden.'}), 400

        # Ejecutar método de Jacobi
        iterations, solution, error_msg = jacobi_method(A, b)

        if error_msg:
            return jsonify({'error': error_msg}), 400

        return jsonify({
            'iteracion': iterations,
            'solucion': solution,
            'advertencia': None if is_diagonally_dominant(
                A) else "Advertencia: La matriz no es diagonalmente dominante."
        })

    except Exception as e:
        return jsonify({'error': f"Error de procesamiento: {str(e)}"}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5007)