import json
from http.client import HTTPConnection
from http.server import HTTPServer
from threading import Thread

from api.health import handler


def _start_server() -> tuple[HTTPServer, Thread]:
    server = HTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def test_health_endpoint_returns_ok_json() -> None:
    server, thread = _start_server()
    try:
        port = server.server_address[1]
        conn = HTTPConnection("127.0.0.1", port, timeout=2)
        conn.request("GET", "/api/health")
        response = conn.getresponse()

        assert response.status == 200
        assert response.getheader("Content-Type") == "application/json"

        body = json.loads(response.read().decode("utf-8"))
        assert body == {"ok": True, "service": "v8-on-fire-api"}
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
