#!/usr/bin/env python3

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api import router
from cli import cli as cli_group

app = FastAPI(
    title="电商价格采集工具",
    description="支持京东、淘宝、拼多多等主流电商平台的商品价格采集与对比",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

static_dir = os.path.join(os.path.dirname(__file__), "web")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/", response_class=HTMLResponse)
    async def root():
        html_path = os.path.join(static_dir, "index.html")
        if os.path.exists(html_path):
            with open(html_path, 'r', encoding='utf-8') as f:
                return f.read()
        return """
        <html>
            <head><title>电商价格采集工具</title></head>
            <body>
                <h1>电商价格采集工具 API</h1>
                <p>API文档: <a href="/docs">/docs</a></p>
                <p>Web界面: <a href="/static/index.html">/static/index.html</a></p>
            </body>
        </html>
        """

app.cli = cli_group


def run_api():
    uvicorn.run(app, host="0.0.0.0", port=8000)


def run_cli():
    from cli.commands import cli
    cli()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] not in ["run", "api", "serve"]:
        cli()
    else:
        print("=" * 60)
        print("电商商品价格采集与对比工具 v1.0.0")
        print("=" * 60)
        print("\n启动API服务...")
        print("访问地址: http://localhost:8000")
        print("API文档: http://localhost:8000/docs")
        print("Web界面: http://localhost:8000/static/index.html")
        print("\n按 Ctrl+C 停止服务")
        print("=" * 60)
        run_api()
