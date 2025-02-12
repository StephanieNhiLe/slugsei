import os
import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import video, analysis, coaching

def create_app() -> FastAPI:
    app = FastAPI(title="Slugger Sensei: Virtual Baseball Coach Backend")

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins for development
        allow_credentials=True,
        allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
        allow_headers=["*"],  # Allow all headers
    )

    # Serve static files
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    # Include API routers
    app.include_router(video.router, prefix="/video", tags=["video"])
    app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
    app.include_router(coaching.router, prefix="/coaching", tags=["coaching"])

    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await websocket.accept()
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080)) 
    print(f"⚡ Starting FastAPI on PORT {port} ...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")