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
    
    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    for match in re.finditer(pattern, expr):
        word = match.group()
        if word not in allowed_funcs and word != 'x':
            raise ValueError(f"Término no permitido en la expresión: '{word}'")

def metodo_trapecio(f, a, b, n):
    if n <= 0:
        raise ValueError("El número de trapecios debe ser mayor que cero")
    
    h = (b - a) / n
    x = np.linspace(a, b, n+1)
    try:
        y = f(x)
    except Exception as e:
        raise ValueError(f"Error al evaluar la función: {str(e)}")
    
    area = (h/2) * np.sum(y[:-1] + y[1:])
    return area, x, y

@app.route('/trapecio', methods=['POST'])
def solve_trapecio():
    data = request.json
    
    # Validar datos de entrada
    if not data or 'funcion' not in data or 'a' not in data or 'b' not in data or 'n' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren: funcion, a, b y n.'}), 400
    
    try:
        f_str = data['funcion']
        a = float(data['a'])
        b = float(data['b'])
        n = int(data['n'])
        
        # Validar intervalo
        if a >= b:
            return jsonify({'error': 'El límite inferior (a) debe ser menor que el límite superior (b)'}), 400
            
        if n <= 0:
            return jsonify({'error': 'El número de trapecios (n) debe ser mayor que cero'}), 400
            
        # Validar expresión matemática
        validate_expression(f_str)
        
        # Crear función
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": {}})
        f_v = np.vectorize(f)
        
        # Verificar que la función es válida
        f(a)
        f(b)
        
        # Ejecutar método
        area, x, y = metodo_trapecio(f_v, a, b, n)
        
        # Generar gráfica
        plt.figure()
        plt.plot(x, y, 'b', label='f(x)')
        for i in range(n):
            plt.fill([x[i], x[i], x[i+1], x[i+1]], 
                    [0, y[i], y[i+1], 0], 'r', edgecolor='black', alpha=0.5)
        plt.grid(True)
        plt.axhline(0, color="#000000")
        plt.axvline(0, color="#000000")
        plt.title("Método del Trapecio")
        plt.ylabel("Eje Y")
        plt.xlabel("Eje X")
        plt.legend()

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

        return jsonify({'Area': area, 'Imagen': img_base64})
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006)