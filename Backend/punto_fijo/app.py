from flask import Flask, request, jsonify
import math
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def punto_fijo(g, x0, tol=1e-6, max_iter=100):
    iteraciones=[]
    cont=0
    x = x0
    for _ in range(max_iter):
        x_next = g(x)
        iteraciones.append({
            'iteracion':cont,
            'xi':x_next, 
            'error':abs(x_next-x),

        })
        if abs(x_next - x) < tol:
            return x_next,iteraciones
        x = x_next
        cont=cont+1
    raise ValueError("No convergió.")

@app.route('/punto_fijo', methods=['POST'])
def solve_punto_fijo():
    data = request.json
    
    # Validar campos requeridos
    if not data or 'funcion' not in data or 'funcion_original' not in data or 'punto_inicial' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren funcion, funcion_original y punto_inicial'}), 400
    
    g_str = data['funcion']
    f_str = data['funcion_original']
    x0 = data['punto_inicial']
    
    # Validar punto inicial es número
    try:
        x0 = float(x0)
    except ValueError:
        return jsonify({'error': 'El punto inicial debe ser un número válido'}), 400

    # Validar funciones matemáticas
    try:
        # Primero validar sintaxis básica
        compile(g_str, '<string>', 'eval')
        compile(f_str, '<string>', 'eval')
        
        # Luego validar con valores
        g = lambda x: eval(g_str, {"math": math, "x": x, "__builtins__": {}})
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": {}})
        
        # Probar con un valor
        test_x = 1.0
        g(test_x)
        f(test_x)
        
        g_v = np.vectorize(g)
        f_v = np.vectorize(f)
    except SyntaxError as e:
        return jsonify({'error': f'Error de sintaxis en la función: {str(e)}'}), 400
    except NameError as e:
        return jsonify({'error': f'Nombre no reconocido en la función: {str(e)}. Use "math." para funciones matemáticas'}), 400
    except Exception as e:
        return jsonify({'error': f'Error en la función: {str(e)}'}), 400

    try:
        root, iteraciones = punto_fijo(g, x0)
        
        # Generar la gráfica
        a = min(float(x0) - 5, -5)
        b = max(float(x0) + 5, 5)
        n = 100
        xn = np.linspace(a, b, n)
        yn = f_v(xn)

        plt.figure()
        plt.plot(xn, yn)
        plt.grid(True)
        plt.axhline(0, color="#ff0000")
        plt.axvline(0, color="#ff0000")
        plt.plot(root, 0, 'ko')
        plt.title("Método Punto fijo")
        plt.ylabel("Eje Y")
        plt.xlabel("Eje X")
        if not np.isnan(root):
            plt.axvline(root)

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

        return jsonify({'Raiz': root, 'Iteraciones': iteraciones, 'Imagen': img_base64})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)