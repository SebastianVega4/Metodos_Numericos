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
    
    # Permitir prefijo 'math.' explícitamente
    normalized_expr = expr.replace('Math.', 'math.')
    normalized_expr = re.sub(r'math\.', '', normalized_expr)

    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    for match in re.finditer(pattern, normalized_expr):
        word = match.group()
        if word not in allowed_funcs and word != 'x':
            raise ValueError(f"Término no permitido en la expresión: '{word}'")

def detectar_raices(f, a, b):
    """Detecta si hay múltiples raíces en el intervalo."""
    puntos = np.linspace(a, b, 100)
    cambios_signo = 0
    
    # Evaluar función en todos los puntos
    f_vals = [f(x) for x in puntos]
    
    # Contar cambios de signo
    for i in range(1, len(f_vals)):
        if f_vals[i-1] * f_vals[i] < 0:
            cambios_signo += 1
            
    return cambios_signo

def biseccion(f, a, b, error=1e-6):
    maxima_Iteracion = 100
    iteraciones = []

    # Verificar condición inicial del método
    if f(a) * f(b) >= 0:
        # Detectar número de raíces en el intervalo
        num_raices = detectar_raices(f, a, b)
        
        if num_raices >= 2:
            raise ValueError(f"¡Hay al menos {num_raices} raíces en este intervalo! "
                             "El método de bisección solo puede encontrar una. "
                             "Por favor, reduzca el intervalo.")
        else:
            raise ValueError("La función debe tener signos opuestos en los extremos del intervalo (f(a)*f(b) < 0)"
            "(la función no cruza el eje X)")

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
        ax.plot(raiz, 0, 'ro', label='Raíz encontrada')
        
        # Marcar posibles raíces adicionales
        for x_val in np.linspace(a, b, 50):
            if abs(f(x_val)) < 0.5:  # Umbral para detectar cercanía al eje X
                ax.plot(x_val, 0, 'go', alpha=0.3)
        
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
            
        f_str_normalized = f_str.replace('Math.', 'math.')
        
        # Validar expresión matemática
        validate_expression(f_str)
        
        # Crear función
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": None})
        
        # Verificar que la función es válida
        f(a)
        f(b)
        
        # Ejecutar método
        root, iteraciones = biseccion(f, a, b)
        imagen = generar_grafica(f, a, b, root)
        
        return jsonify({
            'Raiz': root, 
            'Iteraciones': iteraciones, 
            'Imagen': imagen,
            'Mensaje': '¡Raíz encontrada con éxito!'
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)