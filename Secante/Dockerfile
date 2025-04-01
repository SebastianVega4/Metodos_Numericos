FROM python:3.6.8

WORKDIR /app

COPY requirements.txt requirements.txt
# Configure pip before installation
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_RETRIES=10 \
    PIP_TRUSTED_HOST=pypi.doubanio.com \
    PIP_INDEX_URL=https://pypi.doubanio.com/simple

# Install dependencies in one layer
RUN pip install --upgrade pip && \
    pip install --retries 10 --timeout 100 -r requirements.txt

COPY app.py app.py

CMD ["python", "app.py"]