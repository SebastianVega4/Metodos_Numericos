FROM python:3.13.3-slim

WORKDIR /app

# Solución alternativa para DNS (sin modificar resolv.conf)
RUN echo 'Acquire::http::Proxy "http://8.8.8.8";' > /etc/apt/apt.conf.d/99dns && \
    echo 'Acquire::https::Proxy "http://8.8.8.8";' >> /etc/apt/apt.conf.d/99dns

COPY requirements.txt .

# Instalación robusta con múltiples mirrors
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
    --retries 10 \
    --timeout 120 \
    -r requirements.txt \
    --index-url https://pypi.org/simple/ \
    --extra-index-url https://pypi.tuna.tsinghua.edu.cn/simple \
    --trusted-host pypi.org \
    --trusted-host pypi.tuna.tsinghua.edu.cn

COPY app.py .

CMD ["python", "app.py"]