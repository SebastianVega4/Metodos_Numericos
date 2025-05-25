# app.py
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
    # Lista de funciones matemáticas permitidas
    allowed_funcs = set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
                        'exp', 'log', 'log10', 'sqrt', 'pi', 'e'])
    
    # Buscar nombres de funciones/variables no permitidas
    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    for match in re.finditer(pattern, expr):
        word = match.group()
        if word not in allowed_funcs and word != 'x':
            raise ValueError(f"Término no permitido en la expresión: '{word}'")

def newton_raphson(f, df, x0, tol=1e-6, max_iter=100):
    x = x0
    iteraciones = []

    for i in range(max_iter):
        try:
            fx = f(x)
            dfx = df(x)
        except:
            raise ValueError("Error al evaluar la función o su derivada. Verifique las expresiones.")

        iteraciones.append({
            'x': round(x,4),
            'f': round(fx,4),
            'iteracion': i + 1,
            'd': round(dfx,4),
            'error': round(abs(fx),4)
        })
        if abs(fx) < tol:
            return x, iteraciones
        if dfx == 0:
            raise ValueError("Derivada cero en x={}. No se puede continuar.".format(round(x,4)))
        x = x - fx / dfx

    raise ValueError("No convergió después de {} iteraciones. Último valor: {}".format(max_iter, round(x,4)))

@app.route('/newton_raphson', methods=['POST'])
def solve_newton_raphson():
    data = request.json
    
    # Validar datos de entrada
    if not data or 'funcion' not in data or 'derivada' not in data or 'punto_inicial' not in data:
        return jsonify({'error': 'Datos incompletos. Se requieren: funcion, derivada y punto_inicial.'}), 400
    
    try:
        f_str = data['funcion']
        df_str = data['derivada']
        x0 = float(data['punto_inicial'])
        
        # Validar expresiones
        validate_expression(f_str)
        validate_expression(df_str)
        
        # Crear funciones
        f = lambda x: eval(f_str, {"math": math, "x": x, "__builtins__": {}})
        df = lambda x: eval(df_str, {"math": math, "x": x, "__builtins__": {}})
        
        # Verificar que las funciones son válidas
        test_x = 1.0
        f(test_x)
        df(test_x)
        
        # Ejecutar método
        raiz, iteraciones = newton_raphson(f, df, x0)

        # Generar gráfica
        plt.figure()
        a = min(-10, x0 - 5)
        b = max(10, x0 + 5)
        n = 100
        xn = np.linspace(a, b, n)
        f_v = np.vectorize(f)
        yn = f_v(xn)

        plt.plot(xn, yn, label='f(x)')
        plt.axhline(0, color='red', linestyle='--')
        plt.axvline(0, color='red', linestyle='--')
        plt.plot(raiz, f(raiz), 'ko', label='Raíz encontrada')
        plt.title("Método de Newton-Raphson")
        plt.xlabel("Eje X")
        plt.ylabel("Eje Y")
        plt.legend()
        plt.grid(True)

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close()

        img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

        return jsonify({'Raiz': raiz, 'Iteraciones': iteraciones, 'Imagen': img_base64})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except ZeroDivisionError:
        return jsonify({'error': 'División por cero en la evaluación de la función.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error durante la ejecución: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)