from flask import Flask, request, jsonify
import matplotlib.pyplot as plt
import numpy as np
import io
import base64
import math
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
        if word not in allowed_funcs and word not in ['x', 'y']:
            raise ValueError(f"Término no permitido en la expresión: '{word}'")

def metodo_euler(f, x0, y0, x_inicio, x_fin, h, sol_exacta=None):
    resultados = []
    x_vals = np.arange(x_inicio, x_fin + h, h)
    y_euler = y0
    error_maximo = 0
    error_promedio = 0
    error_acumulado = 0
    puntos = 0
    
    for x in x_vals:
        if x < x0:
            continue
            
        y_exact = None
        error = 0
        
        if sol_exacta:
            try:
                y_exact = sol_exacta(x)
                error = abs(y_exact - y_euler)
                error_acumulado += error
                puntos += 1
                if error > error_maximo:
                    error_maximo = error
            except:
                pass
            
        resultados.append({
            'x': x,
            'y_euler': y_euler,
            'y_exact': y_exact,
            'error': error if sol_exacta else None
        })
        
        # Calcular siguiente paso
        y_euler += h * f(x, y_euler)
    
    if puntos > 0 and sol_exacta:
        error_promedio = error_acumulado / puntos
    
    return resultados, error_maximo, error_promedio

def generar_grafica_euler(resultados, mostrar_exacta):
    plt.figure()
    
    x_vals = [r['x'] for r in resultados]
    y_euler = [r['y_euler'] for r in resultados]
    
    plt.plot(x_vals, y_euler, 'b-', label='Solución Euler')
    
    if mostrar_exacta and resultados[0]['y_exact'] is not None:
        y_exact = [r['y_exact'] for r in resultados]
        plt.plot(x_vals, y_exact, 'r--', label='Solución Exacta')
    
    plt.title('Método de Euler')
    plt.xlabel('x')
    plt.ylabel('y')
    plt.legend()
    plt.grid(True)
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return base64.b64encode(img.getvalue()).decode('utf-8')

@app.route('/euler', methods=['POST', 'OPTIONS']) 
def solve_euler():
    data = request.json
    
    # Validar campos requeridos
    required_fields = ['funcion', 'x0', 'y0', 'xInicio', 'xFin', 'paso']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Datos incompletos. Se requieren todos los campos.'}), 400
    
    try:
        # Validar y convertir datos
        f_str = data['funcion']
        x0 = float(data['x0'])
        y0 = float(data['y0'])
        x_inicio = float(data['xInicio'])
        x_fin = float(data['xFin'])
        h = float(data['paso'])
        
        mostrar_exacta = data.get('mostrarExacta', False)
        sol_exacta_str = data.get('solucionExacta')
        
        # Validar expresión matemática
        validate_expression(f_str)
        
        # Crear función para la EDO
        def f(x, y):
            return eval(f_str, {"math": math, "x": x, "y": y})
        
        # Crear función para solución exacta si existe
        sol_exacta = None
        if mostrar_exacta and sol_exacta_str:
            validate_expression(sol_exacta_str)
            sol_exacta = lambda x: eval(sol_exacta_str, {"math": math, "x": x})
        
        # Ejecutar método
        resultados, error_maximo, error_promedio = metodo_euler(
            f, x0, y0, x_inicio, x_fin, h, sol_exacta
        )
        
        # Generar gráfica
        grafica = generar_grafica_euler(resultados, mostrar_exacta)
        
        return jsonify({
            'resultados': resultados,
            'grafica': grafica,
            'errorMaximo': error_maximo,
            'errorPromedio': error_promedio
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app = Flask(__name__)
CORS(app, resources={r"/euler": {"origins": "*", "methods": ["POST", "OPTIONS"]}})