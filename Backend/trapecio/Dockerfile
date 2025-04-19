FROM python:3.13.3-alpine3.21

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY app.py app.py

CMD ["python", "app.py"]