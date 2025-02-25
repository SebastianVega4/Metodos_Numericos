import numpy as np
import json


def punto_fijo(gx, a, tolera, iteramax=20, vertabla=True, precision=6):
    """
    Método del punto fijo para encontrar la raíz de una ecuación.
    """
    itera = 0
    b = gx(a)
    tramo = abs(b - a)

    resultados = []

    if vertabla:
        print('Método del Punto Fijo')
        print(f"{'Iteración':<10}{'xi':<10}{'gi':<10}{'tramo':<10}")
        print(f"{itera:<10}{a:<10.6f}{b:<10.6f}{tramo:<10.6f}")

    while tramo >= tolera and itera < iteramax:
        a = b
        b = gx(a)
        tramo = abs(b - a)
        itera += 1

        resultados.append({"iteracion": itera, "xi": a, "gi": b, "tramo": tramo})

        if vertabla:
            print(f"{itera:<10}{a:<10.6f}{b:<10.6f}{tramo:<10.6f}")

    if itera >= iteramax:
        print('No converge, se alcanzó el máximo de iteraciones')
        return json.dumps({"error": "No converge", "iteraciones": itera})

    return json.dumps({"raiz": b, "iteraciones": itera, "resultados": resultados})


# PRUEBA
if __name__ == "__main__":
    gx = lambda x: np.exp(-x)
    a = 0
    tolera = 0.001
    iteramax = 15

    respuesta = punto_fijo(gx, a, tolera, iteramax, vertabla=True)
    print("Resultado JSON:", respuesta)
