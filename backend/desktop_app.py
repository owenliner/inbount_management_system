"""Desktop application entry point.

Launches FastAPI in a background thread and opens a native window via pywebview.
"""

import os
import socket
import sys
import threading
import time


def find_free_port() -> int:
    """Find an available TCP port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def init_database_if_needed():
    """Run seed_data if the database file doesn't exist yet (first launch)."""
    from app.config import _get_desktop_data_dir

    db_path = _get_desktop_data_dir() / "inbound_management.db"
    if not db_path.exists():
        print("First launch detected — initializing database...")
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)

        # seed_data.py is bundled as a data file, not a Python module.
        # Use importlib.util to load it from _MEIPASS or the script directory.
        import importlib.util
        if getattr(sys, "frozen", False):
            seed_path = os.path.join(sys._MEIPASS, "seed_data.py")
        else:
            seed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data.py")

        spec = importlib.util.spec_from_file_location("seed_data", seed_path)
        seed_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(seed_mod)
        seed_mod.seed_database()
        print("Database initialized successfully.")


def start_server(port: int):
    """Start uvicorn in the current thread (meant to run as daemon)."""
    import uvicorn
    from app.main import app as fastapi_app

    # Pass the app object directly instead of import string.
    # String-based import ("app.main:app") fails in frozen mode because
    # uvicorn's import machinery can't find the bundled 'app' package.
    uvicorn.run(
        fastapi_app,
        host="127.0.0.1",
        port=port,
        log_level="warning",
    )


def wait_for_server(port: int, timeout: float = 15.0):
    """Block until the server is accepting connections."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.1)
    return False


def main():
    # Ensure we're running from the backend directory so imports work
    if getattr(sys, "frozen", False):
        os.chdir(os.path.dirname(sys.executable))
        # When frozen, add _MEIPASS to path for bundled packages
        sys.path.insert(0, sys._MEIPASS)
    else:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Enable desktop mode
    os.environ["DESKTOP_MODE"] = "true"

    # Clear lru_cache so settings pick up the new env var
    from app.config import get_settings
    get_settings.cache_clear()

    port = find_free_port()
    url = f"http://127.0.0.1:{port}"

    # Initialize database on first run
    init_database_if_needed()

    # Start FastAPI server in a daemon thread
    server_thread = threading.Thread(target=start_server, args=(port,), daemon=True)
    server_thread.start()

    print(f"Starting server on {url}...")
    if not wait_for_server(port):
        print("ERROR: Server failed to start within timeout.")
        sys.exit(1)

    print("Server ready. Opening window...")

    # Open native window
    import webview

    window = webview.create_window(
        title="入库管理系统",
        url=url,
        width=1280,
        height=800,
        min_size=(1024, 640),
    )
    # webview.start() blocks until the window is closed
    webview.start()

    # Window closed — the daemon thread will be killed automatically
    print("Window closed. Exiting.")


if __name__ == "__main__":
    main()
