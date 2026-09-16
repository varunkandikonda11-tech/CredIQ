from __future__ import annotations

import socket
import sys
from urllib.error import URLError
from urllib.request import urlopen

HOST = "127.0.0.1"
PORT = 8000
HEALTH_URL = f"http://{HOST}:{PORT}/health"


def port_in_use(host: str, port: int) -> bool:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0
    finally:
        sock.close()


def health_ok() -> bool:
    try:
        with urlopen(HEALTH_URL, timeout=1.5) as response:
            return response.status == 200
    except (URLError, OSError, TimeoutError):
        return False


def main() -> None:
    occupied = port_in_use(HOST, PORT)
    if occupied and health_ok():
        print(f"CreditIQ API already running at {HEALTH_URL}")
        print("Open http://127.0.0.1:8000/docs — do not start a second process on 8000.")
        return

    if occupied:
        print(
            f"Port {PORT} is already in use on {HOST}. "
            "Windows reports this as WinError 10013. Stop the other process or use another port."
        )
        sys.exit(1)

    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)


if __name__ == "__main__":
    main()
