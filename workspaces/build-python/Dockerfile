FROM python:3.9-slim
WORKDIR /app
RUN pip install --no-cache-dir flask requests numpy pandas
COPY ./runner.py /app/runner.py
CMD ["python", "/app/runner.py"]