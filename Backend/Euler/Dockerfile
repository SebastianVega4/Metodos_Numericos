FROM python:3.13-slim

WORKDIR /app

# Instalar dependencias del sistema para compilación
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar la aplicación
COPY . .

# Puerto expuesto
EXPOSE 5009

# Comando para ejecutar la aplicación
CMD ["python", "app.py"]