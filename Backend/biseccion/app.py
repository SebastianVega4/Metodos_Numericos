from flask import Flask, request, jsonify
from flask_cors import CORS
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import math
import re

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

def biseccion(f, a, b, error=1e-6):
    maxima_Iteracion = 100
    iteraciones = []

    # Verificar condición inicial del método
    if f(a) * f(b) >= 0:
        raise ValueError("La función debe tener signos opuestos en los extremos del intervalo (f(a)*f(b) < 0)")

    for i in range(maxima_Iteracion):
        try:
            c = (a + b) / 2
            fc = f(c)
        except Exception as e:
            raise ValueError(f"Error al evaluar la función: {str(e)}")

        iteraciones.append({
            'iteracion': i + 1,
            'a': round(a,4),
            'b': round(b,4),
            'c': round(c,4),
            'fc': round(fc,4),
            'error': round(abs(fc),4),
        })
        
        if abs(fc) < error or (b - a) / 2 < error:
            return c, iteraciones
            
        if fc * f(a) < 0:
            b = c
        else:
            a = c
            
    raise ValueError(f"No convergió después de {maxima_Iteracion} iteraciones. Último valor: {round(c,4)}")

def generar_grafica(f, a, b, raiz):
    try:
        fig, ax = plt.subplots()
        x = np.linspace(min(a, b) - 1, max(a, b) + 1, 400)
        y = np.array([f(val) for val in x])
        
        ax.plot(x, y, label='f(x)')
        ax.axhline(0, color='red', lw=0.5)
        ax.axvline(0, color='red', lw=0.5)
        ax.plot(raiz, 0, 'ro')
        ax.axvline(raiz, color='green', linestyle='--', lw=0.5)
        
        ax.set_title("Método de Bisección")
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
    except Exception as e:
        raise ValueError(f"Error al generar la gráfica: {str(e)}")

@app.route('/biseccion', methods=['POST'])
def solve_biseccion():
    data = request.json
    
    # Validar datos de entrada
    if not data or 'funcion' not in data or 'x0' not in data or 'x1' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren: funcion, x0 y x1.'}), 400
    
    try:
        f_str = data['funcion']
        a = float(data['x0'])
        b = float(data['x1'])
        
        # Validar intervalo
        if a == b:
            return jsonify({'error': 'Los puntos x0 y x1 deben ser diferentes.'}), 400
            
        # Validar expresión matemática
        validate_expression(f_str)
        
        # Crear función
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": {}})
        
        # Verificar que la función es válida
        f(a)
        f(b)
        
        # Ejecutar método
        root, iteraciones = biseccion(f, a, b)
        imagen = generar_grafica(f, a, b, root)
        
        return jsonify({'Raiz': root, 'Iteraciones': iteraciones, 'Imagen': imagen})
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)