FROM python:3.12.4

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
  apt-get install -y build-essential libffi-dev && \
  apt-get install -y sqlite3

RUN pip install --upgrade pip

ENV PATH="/root/.local/bin:$PATH"

# Poetryのインストール
RUN curl -sSL https://install.python-poetry.org | python -

WORKDIR /app

COPY ./src/ src/
COPY ./data/ data/
COPY ./pyproject.toml .
COPY ./poetry.lock .

# Poetryの設定と依存関係のインストール
RUN poetry install --no-interaction --no-root --no-dev

EXPOSE 8002

WORKDIR /app/src

# アプリケーションの起動コマンドを設定
ENTRYPOINT ["poetry", "run" , "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]