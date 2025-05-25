from flask import Flask, request, jsonify
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import math  

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
errorMin = 0.00001

def secante(funcion, x0, x1, max_iter=100):
    iteraciones = []
    for i in range(max_iter):
        error = abs((x1 - x0) / x1)
        if error < errorMin:
            return x1, iteraciones
        if funcion(x1) - funcion(x0) == 0:
            raise ValueError("División por cero en la fórmula de la secante.")
        x2 = x1 - funcion(x1) * (x1 - x0) / (funcion(x1) - funcion(x0))
        iteraciones.append({
            'iteracion': i + 1,
            'x0': round(x0, 4),
            'x1': round(x1, 4),
            'x2': round(x2, 4),
            'error': round(error, 4)
        })
        x0, x1 = x1, x2
    raise ValueError("No se encuentra la raíz.")

def generar_grafica(f, x0, x1, raiz):
    fig, ax = plt.subplots()
    x = np.linspace(x0 - 2, x1 + 2, 400)
    y = np.array([f(val) for val in x])
    
    ax.plot(x, y, label='f(x)')
    ax.axhline(0, color='red', lw=0.5)
    ax.axvline(0, color='red', lw=0.5)
    ax.plot(raiz, 0, 'ro')
    ax.axvline(raiz, color='green', linestyle='--', lw=0.5)
    
    ax.set_title("Método de la Secante")
    ax.set_xlabel("Eje X")
    ax.set_ylabel("Eje Y")
    ax.legend()
    ax.grid(True)
    
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png')
    buffer.seek(0)
    imagen = base64.b64encode(buffer.read()).decode('utf-8')
    plt.close(fig)
    
    return imagen

@app.route('/secante', methods=['POST'])
def solve_secante():
    data = request.json
    
    # Validar campos requeridos
    if not data or 'funcion' not in data or 'x0' not in data or 'x1' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren funcion, x0 y x1'}), 400
    
    f_str = data['funcion']
    
    # Validar que x0 y x1 sean números
    try:
        x0 = float(data['x0'])
        x1 = float(data['x1'])
    except ValueError:
        return jsonify({'error': 'Los puntos iniciales deben ser números válidos'}), 400

    # Validar función matemática
    try:
        # Primero validar sintaxis básica
        compile(f_str, '<string>', 'eval')
        
        # Luego validar con valores
        def f(x):
            return eval(f_str, {"math": math, "x": x})
        
        # Probar con un valor
        test_x = (x0 + x1) / 2
        f(test_x)
    except SyntaxError as e:
        return jsonify({'error': f'Error de sintaxis en la función: {str(e)}'}), 400
    except NameError as e:
        return jsonify({'error': f'Nombre no reconocido en la función: {str(e)}. Use "math." para funciones matemáticas'}), 400
    except Exception as e:
        return jsonify({'error': f'Error en la función: {str(e)}'}), 400

    try:
        root, iteraciones = secante(f, x0, x1)
        imagen = generar_grafica(f, x0, x1, root)
        return jsonify({'Raiz': root, 'Iteraciones': iteraciones, 'Imagen': imagen})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004)