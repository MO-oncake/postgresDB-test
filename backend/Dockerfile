# Use Python base image
FROM python:3.11

# Set working directory
WORKDIR /app

# Install dependencies
COPY Pipfile Pipfile.lock /app/
RUN pip install pipenv && pipenv install --deploy --ignore-pipfile

# Copy application files
COPY . /app

# Set environment variables
ENV DATABASE_URL=${DATABASE_URL}
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the app
CMD ["pipenv", "run", "flask", "run", "--host=0.0.0.0"]
