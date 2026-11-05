#!/usr/bin/env python3
"""Náhled hry kacik v okně prohlížeče. npm k tomu není potřeba."""

import os
import socket
import sys
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
FIRST_PORT = 8765


def port_is_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("0.0.0.0", port))
        except OSError:
            return False
    return True


def game_already_running(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=1) as response:
            page = response.read(8000).decode("utf-8", "replace").lower()
    except Exception:
        return False
    return "kacik" in page


def main():
    os.chdir(ROOT)
    if not port_is_free(FIRST_PORT) and game_already_running(FIRST_PORT):
        print("Hra už běží. Druhý server nespouštěj.")
        print(f"Otevři v prohlížeči: http://127.0.0.1:{FIRST_PORT}")
        return 0

    port = None
    for candidate in range(FIRST_PORT, FIRST_PORT + 20):
        if port_is_free(candidate):
            port = candidate
            break
    if port is None:
        print("Volný port se nenašel. Zavři staré okno se serverem a zkus to znovu.")
        return 1

    url = f"http://127.0.0.1:{port}"
    print("kacik běží. Tohle okno terminálu nech zapnuté.")
    print(f"Hru otevři v prohlížeči: {url}")
    print("Vypneš to klávesami Ctrl+C.")
    server = ThreadingHTTPServer(("0.0.0.0", port), SimpleHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nKonec.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
