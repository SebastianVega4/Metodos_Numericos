FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir numpy flask flask-cors

COPY app.py .

EXPOSE 5005

CMD ["python", "app.py"]