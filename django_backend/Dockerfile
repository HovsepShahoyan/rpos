FROM python:3-slim AS builder

# Install UV (fast Python package installer)
RUN pip install --no-cache-dir uv

# Set work directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY pyproject.toml uv.lock ./

# Install dependencies in a virtual environment
RUN uv venv /opt/venv && \
    . /opt/venv/bin/activate && \
    uv sync --frozen --no-dev

FROM python:3.12-slim AS runtime

# Copy pre-built virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment to use our venv by default
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy only application code (avoid cache invalidation)
COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Default command
CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000"]
