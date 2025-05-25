export class Euler {
    funcion: string;
    x0: number;
    y0: number;
    xInicio: number;
    xFin: number;
    paso: number;
    solucionExacta?: string;

    constructor(funcion: string, x0: number, y0: number, xInicio: number, xFin: number, paso: number, solucionExacta?: string) {
        this.funcion = funcion;
        this.x0 = x0;
        this.y0 = y0;
        this.xInicio = xInicio;
        this.xFin = xFin;
        this.paso = paso;
        this.solucionExacta = solucionExacta;
    }
}