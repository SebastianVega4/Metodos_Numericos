import numpy as np

def puntofijo(gx, a, tolera, iteramax=20, vertabla=True, precision=6):
    """
    g(x) se obtiene al despejar una x de f(x) máximo de iteraciones predeterminado: iteramax
    si no converge hasta iteramax iteraciones la respuesta es NaN (Not a Number)
    """
    itera = 0
    b = gx(a)
    tramo = abs(b - a)
    if vertabla == True:
        print('método del Punto Fijo')
        print('i', ['xi', 'gi', 'tramo'])
        np.set_printoptions(precision)
        print(itera, np.array([a, b, tramo]))
    while (tramo >= tolera and itera <= iteramax):
        a = b
        b = gx(a)
        tramo = abs(b - a)
        itera = itera + 1
        if vertabla == True:
            print(itera, np.array([a, b, tramo]))
    respuesta = b

    # Valida respuesta
    if itera >= iteramax:
        respuesta = np.nan
        print('itera: ', itera,'No converge,se alcanzó el máximo de iteraciones')
    return (respuesta)




# RUN

# INGRESO
fx = lambda x: np.exp(-x) - x
gx = lambda x: np.exp(-x)

a = 0
b = 1
tolera = 0.001
iteramax = 15

# PROCEDIMIENTO
respuesta = puntofijo(gx, a, tolera, iteramax, vertabla=True)

# SALIDA
print('raíz en: ', respuesta)
