# 📐 Aplicación Web de Métodos Numéricos — Arquitectura basada en Microservicios

[![Angular](https://img.shields.io/badge/Built%20with-Angular-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![Docker](https://img.shields.io/badge/Contenedores-Docker-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Versión](https://img.shields.io/badge/Versión-1.0-brightgreen?style=for-the-badge)]()
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-blue?style=for-the-badge)]()

## 🧮 Descripción General

Esta aplicación web ha sido desarrollada como una plataforma de apoyo al estudio y comprensión de **métodos numéricos**, integrando una interfaz visual interactiva con backend matemático especializado. El sistema implementa una **arquitectura basada en microservicios**, en la cual cada método numérico se expone como un servicio independiente mediante **Flask (Python)**, y la interfaz gráfica desarrollada en **Angular** se comunica con ellos a través de contenedores **Docker**, orquestados por un archivo maestro `docker-compose.yml`.

Cada servicio corre en su propio contenedor, permitiendo una arquitectura distribuida, escalable y modular. La interfaz principal se ejecuta en el puerto `5009`.

## 🧠 Métodos Implementados

### 🔍 Ecuaciones No Lineales

- **Bisección**
- **Secante**
- **Newton-Raphson**
- **Punto Fijo**
- **Broyden (cuasi-Newton)**

### 🧮 Sistemas de Ecuaciones Lineales

- **Jacobi**
- **Gauss-Seidel**

### ∫ Integración Numérica

- **Regla del Trapecio**
- **Regla de Simpson (1/3)**

## ✨ Características Destacadas

- Arquitectura distribuida basada en microservicios.
- Interfaz moderna, intuitiva y responsiva con Angular.
- Comunicación entre servicios mediante HTTP/REST.
- Visualización gráfica dinámica de cada método.
- Validación matemática de entrada y mensajes de error contextualizados.
- Representación paso a paso de cada algoritmo.
- Modularidad para integrar nuevos métodos fácilmente.
- Ejecución y despliegue con Docker utilizando `docker-compose`.

## ⚙️ Arquitectura Técnica

La solución está compuesta por múltiples servicios:

- **Frontend Angular** (puerto `5009`)
- **Microservicios Flask** por cada método (puertos independientes)
- **Docker** para el aislamiento de cada componente
- **Docker Compose** para el despliegue automatizado de toda la solución

```
graph LR
  UI[Frontend Angular (5009)]
  BISECCION[Bisección]
  SECANTE[Secante]
  NEWTON[Newton-Raphson]
  PUNTO[Punto Fijo]
  BROYDEN[Broyden]
  JACOBI[Jacobi]
  GAUSS[Gauss-Seidel]
  TRAPECIO[Trapecio]
  SIMPSON[Simpson]

  UI --> BISECCION
  UI --> SECANTE
  UI --> NEWTON
  UI --> PUNTO
  UI --> BROYDEN
  UI --> JACOBI
  UI --> GAUSS
  UI --> TRAPECIO
  UI --> SIMPSON
```

## 🚀 Tecnologías Utilizadas

- **Angular 16+**
- **Flask (Python)**
- **Docker / Docker Compose**
- **Chart.js** (visualización)
- **Math.js** (procesamiento matemático)
- **HTML5 / CSS3 / SCSS**
- **TypeScript**

## 📚 Contexto Académico

Este proyecto fue desarrollado como parte del curso de **Métodos Numéricos** del programa de **Ingeniería de Sistemas** de la  
**Universidad Pedagógica y Tecnológica de Colombia - UPTC**, sede Sogamoso,  
con el objetivo de integrar teoría matemática, programación y despliegue moderno en un entorno práctico.

## 🧑‍💻 Ejecución del Proyecto

### Requisitos

- Docker y Docker Compose instalados
- Angular
- Git

### Pasos para ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/usuario/repositorio-metodos-numericos.git
cd repositorio-metodos-numericos
```

2. Levantar los contenedores con Docker Compose:

```bash
docker-compose up --build
```

3. Acceder a la aplicación en el navegador:

```
http://localhost:5009
```
OR

1. Clona el repositorio:
```bash
git clone https://github.com/usuario/repositorio-metodos-numericos.git
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el proyecto:
```bash
ng serve
```

Todos los servicios se levantarán automáticamente según el archivo `docker-compose.yml`.

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**. Puedes utilizarlo, modificarlo y distribuirlo libremente bajo los términos establecidos en el archivo `LICENSE`.

## 👨‍🎓 Autor

Desarrollado por **Sebastián Vega**  
📧 *Sebastian.vegar2015@gmail.com*  
🔗 [LinkedIn - Johan Sebastián Vega Ruiz](https://www.linkedin.com/in/johan-sebastian-vega-ruiz-b1292011b/)

---
 
Facultad de Ingeniería — Ingeniería de Sistemas 🧩
**🏫 Universidad Pedagógica y Tecnológica de Colombia**  
📍 Sogamoso, Boyacá 📍

© 2025 — Sebastian Vega
