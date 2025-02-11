# Use official Python image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy application files from backend directory
COPY app app/
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Expose the port FastAPI will run on
EXPOSE 8080

# Run FastAPI with Uvicorn using the PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8080"]