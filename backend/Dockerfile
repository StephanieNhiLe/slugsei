# Use official Python image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy application files from backend directory
COPY app app/
COPY app/config.py .
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Set environment variables (Avoid storing credentials inside ENV)
# ENV GOOGLE_APPLICATION_CREDENTIALS="/app/service-account.json"

# Expose the port FastAPI will run on
EXPOSE 8080

# Run FastAPI with Uvicorn on the correct port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]