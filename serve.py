#!/usr/bin/env python3
"""Spouštění a vypínání náhledu hry kacik.

Příkazy:
  python3 serve.py           spustí hru a nechá ji běžet
  python3 serve.py stop      vypne hru na portu 8765
  python3 serve.py restart   vypne ji a hned spustí znovu
  python3 serve.py status    napíše, jestli běží a na jaké adrese
"""

import os
import re
import signal
import socket
import sys
import time
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def version():
    path = os.path.join(ROOT, "js", "game.js")
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return "?"
    match = re.search(r"GAME_VERSION\s*=\s*(\d+)", text)
    return match.group(1) if match else "?"


def port_is_free(port):
    # Po starém spojení zůstává port chvíli ve stavu TIME_WAIT a bind by selhal,
    # i když už hra neposlouchá. Poslouchající proces je spolehlivější.
    return not pids_on_port(port)


def pids_on_port(port):
    """Najde proces, který na portu poslouchá. Bez příkazu ss, jen přes /proc."""
    hexport = f"{port:04X}"
    inodes = set()
    for name in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            rows = open(name, encoding="utf-8").read().splitlines()[1:]
        except OSError:
            continue
        for row in rows:
            parts = row.split()
            local, state, inode = parts[1], parts[3], parts[9]
            if local.rsplit(":", 1)[-1].upper() == hexport and state == "0A":
                inodes.add(inode)
    if not inodes:
        return []
    found = []
    for entry in os.listdir("/proc"):
        if not entry.isdigit():
            continue
        fd_dir = f"/proc/{entry}/fd"
        try:
            descriptors = os.listdir(fd_dir)
        except OSError:
            continue
        for descriptor in descriptors:
            try:
                target = os.readlink(f"{fd_dir}/{descriptor}")
            except OSError:
                continue
            if target.startswith("socket:[") and target[8:-1] in inodes:
                found.append(int(entry))
                break
    return found


def command_of(pid):
    try:
        raw = open(f"/proc/{pid}/cmdline", "rb").read()
    except OSError:
        return ""
    return raw.replace(b"\0", b" ").decode("utf-8", "replace")


def game_pid(pid):
    command = command_of(pid)
    return "serve.py" in command or "http.server" in command


def address():
    return f"http://127.0.0.1:{PORT}"


def phone_addresses():
    found = []
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        ip = sock.getsockname()[0]
        sock.close()
    except OSError:
        ip = ""
    if ip and not ip.startswith("127."):
        found.append(f"http://{ip}:{PORT}")
    return found


def print_addresses():
    print(f"Na tomto počítači: {address()}")
    phones = phone_addresses()
    if phones:
        print("Na Pixelu ve stejné Wi-Fi otevři:")
        for url in phones:
            print(url)
    else:
        print("Adresu pro telefon se nepodařilo zjistit. Počítač a Pixel musí být na stejné Wi-Fi.")


def responds():
    try:
        with urllib.request.urlopen(address() + "/", timeout=1) as response:
            page = response.read(8000).decode("utf-8", "replace").lower()
    except Exception:
        return False
    return "kacik" in page


def stop():
    pids = [pid for pid in pids_on_port(PORT) if game_pid(pid)]
    if not pids and port_is_free(PORT):
        print(f"kacik neběží. Port {PORT} je volný.")
        return 0
    if not pids:
        print(f"Port {PORT} drží jiný program. Hru jsem nevypnul.")
        return 1
    for pid in pids:
        try:
            os.kill(pid, signal.SIGTERM)
        except OSError:
            pass
    for _ in range(20):
        if port_is_free(PORT):
            print(f"kacik je vypnutý. Port {PORT} je volný.")
            return 0
        time.sleep(0.1)
    print(f"kacik se nepodařilo vypnout. Port {PORT} je pořád obsazený.")
    return 1


def status():
    if responds():
        print(f"kacik verze {version()} běží.")
        print_addresses()
        return 0
    print(f"kacik neběží. Spusť ho příkazem: python3 serve.py")
    return 1


def serve():
    os.chdir(ROOT)
    if not port_is_free(PORT):
        if responds():
            print(f"kacik verze {version()} už běží.")
            print_addresses()
            print("Jiný port, třeba 18765, hra nepoužívá.")
            print("Novou verzi pustíš takto: python3 serve.py restart")
            return 0
        print(f"Port {PORT} je obsazený něčím jiným. Hra se nespustila.")
        return 1

    print(f"kacik verze {version()} běží.")
    print("Terminál nech zapnutý. Vypnutí: Ctrl+C, nebo v druhém okně python3 serve.py stop")
    print_addresses()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nKonec.")
    finally:
        server.server_close()
    return 0


def main(argv):
    command = argv[1] if len(argv) > 1 else "start"
    if command in ("start",):
        return serve()
    if command == "stop":
        return stop()
    if command == "status":
        return status()
    if command == "restart":
        stopped = stop()
        if stopped != 0:
            return stopped
        return serve()
    print("Neznámý příkaz. Použij: python3 serve.py [start|stop|restart|status]")
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
