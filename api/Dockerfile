FROM python:3.13

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
  apt-get install -y build-essential libffi-dev && \
  apt-get install -y sqlite3

# uvのインストール
RUN pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org uv

WORKDIR /app

COPY ./src/ src/
COPY ./pyproject.toml .
COPY ./uv.lock .
COPY ./README.md .

# uvを使って依存関係のインストール
# For environments with SSL certificate issues, uncomment the next line:
# ENV UV_VERIFY_SSL=false
RUN uv sync --frozen

EXPOSE 8002

# アプリケーションの起動コマンドを設定
ENTRYPOINT ["uv", "run", "python", "-m", "uvicorn", "src.gtfs_jp_wayfinder.main:app", "--host", "0.0.0.0", "--port", "8002"]