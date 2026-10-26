import os
import sys
from pathlib import Path
import uvicorn

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if __name__ == "__main__":
    is_prod = os.getenv("ENVIRONMENT", "").lower() == "production"
    default_host = "0.0.0.0" if is_prod else "127.0.0.1"
    host = os.getenv("HOST", default_host)
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development").lower() == "development"
    uvicorn.run("app.main:app", host=host, port=port, reload=reload, app_dir=str(BACKEND_DIR))

