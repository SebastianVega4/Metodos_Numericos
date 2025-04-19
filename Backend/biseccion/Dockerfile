FROM python:3.13.3-slim

WORKDIR /app

COPY requirements.txt .

# Instalación robusta con múltiples mirrors
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app.py .

CMD ["python", "app.py"]