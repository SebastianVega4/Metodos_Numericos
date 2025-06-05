from flask import Flask, request, jsonify
import math
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def validate_expression(expr):
    """Valida que la expresión matemática sea segura y válida."""
    allowed_funcs = set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                       'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
                       'exp', 'log', 'log10', 'sqrt', 'pi', 'e'])
    
    # Permitir prefijo 'math.' explícitamente
    normalized_expr = expr.replace('Math.', 'math.')
    normalized_expr = re.sub(r'math\.', '', normalized_expr)  # Remover prefijo para validación

    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    for match in re.finditer(pattern, normalized_expr):
        word = match.group()
        if word not in allowed_funcs and word != 'x':
            raise ValueError(f"Término no permitido en la expresión: '{word}'")
        
def simpson(f, a, b, n=100):
    if n <= 0:
        raise ValueError("El número de subintervalos debe ser mayor que cero")
    if n % 2 == 1:
        raise ValueError("El número de subintervalos debe ser par")
    if a >= b:
        raise ValueError("El límite inferior (a) debe ser menor que el límite superior (b)")
    
    h = (b - a) / n
    try:
        x = np.linspace(a, b, n + 1)
        y = np.array([f(xi) for xi in x])
    except Exception as e:
        raise ValueError(f"Error al evaluar la función: {str(e)}")
    
    S = y[0] + y[-1] + 4 * np.sum(y[1:-1:2]) + 2 * np.sum(y[2:-1:2])
    return S * h / 3, x, y

@app.route('/simpson', methods=['POST'])
def solve_simpson():
    data = request.json
    
    # Validar datos de entrada
    if not data or 'funcion' not in data or 'limitea' not in data or 'limiteb' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren: funcion, limitea y limiteb.'}), 400
    
    try:
        f_str = data['funcion']
        a = float(data['limitea'])
        b = float(data['limiteb'])
        n = int(data.get('nimagenes', 100))
        
        # Validar expresión matemática
        validate_expression(f_str)
        
        # Crear función
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": {}})
        
        # Ejecutar método
        resultado, x, y = simpson(f, a, b, n)
        
        # Generar gráfica
        plt.figure()
        plt.plot(x, y, 'b', zorder=5, label='f(x)')
        plt.scatter(x, y, color='blue')
        midpoints = [(x[i] + x[i + 1]) / 2 for i in range(n)]
        midpoints_y = [f(mid) for mid in midpoints]
        plt.scatter(midpoints, midpoints_y, color='red', zorder=5, label='Puntos medios')
        plt.fill_between(x, 0, y, where=[(xi >= a) and (xi <= b) for xi in x], color='skyblue', alpha=0.4)
        plt.title('Método de Simpson')
        plt.xlabel('x')
        plt.ylabel('f(x)')
        plt.legend()

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        grafica = base64.b64encode(img.getvalue()).decode('utf-8')

        resultados = [{'x': float(x[i]), 'y': float(y[i])} for i in range(len(x))]
        resultados += [{'x': float(midpoints[i]), 'y': float(midpoints_y[i])} for i in range(len(midpoints))]
        
        return jsonify({
            'Raiz': resultado,
            'Grafica': grafica,
            'Resultados': resultados
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008)