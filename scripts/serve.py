#!/usr/bin/env python3
"""
Servidor HTTP para el portafolio.
Sirve archivos estáticos desde la raíz del proyecto
y es accesible desde cualquier dispositivo en la red local.
"""

import http.server
from http.server import ThreadingHTTPServer
import socket
import sys
import os
import json
from pathlib import Path

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    """Extiende SimpleHTTPRequestHandler para servir correctamente los archivos."""
    
    def __init__(self, *args, **kwargs):
        # El directorio raíz es la carpeta padre de scripts/
        root_dir = Path(__file__).resolve().parent.parent
        super().__init__(*args, directory=str(root_dir), **kwargs)
    
    def log_message(self, format, *args):
        """Override para mostrar más información en los logs."""
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")

def get_local_ip():
    """Obtiene la IP local del equipo en la red."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def is_port_in_use(port):
    """Verifica si un puerto está en uso."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def find_available_port(start=8000, end=8100):
    """Encuentra un puerto disponible en el rango especificado."""
    for port in range(start, end + 1):
        if not is_port_in_use(port):
            return port
    return None

if __name__ == "__main__":
    local_ip = get_local_ip()
    
    port = PORT
    if is_port_in_use(port):
        available = find_available_port(port + 1)
        if available:
            port = available
            print(f"⚠️  Puerto {PORT} en uso. Usando puerto {port}.")
        else:
            print("❌ No se encontró un puerto disponible en el rango 8000-8100.")
            sys.exit(1)
    
    server_address = ('0.0.0.0', port)
    
    print("=" * 60)
    print("🚀  PORTAFOLIO - Servidor Local")
    print("=" * 60)
    print(f"\n📡  Servidor iniciado en:")
    print(f"     Local:   http://localhost:{port}")
    print(f"     Red:     http://{local_ip}:{port}")
    print(f"\n📱  Abre estas URLs desde cualquier dispositivo")
    print(f"    conectado a la MISMA red WiFi.")
    print(f"\n⌨️   Presiona Ctrl+C para detener el servidor.")
    print("=" * 60)
    
    # Use a threaded HTTP server so multiple large video requests don't block each other
    httpd = ThreadingHTTPServer(server_address, CustomHandler)
    # make worker threads daemon so they don't block shutdown
    httpd.daemon_threads = True
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋  Servidor detenido.")
        httpd.server_close()
        sys.exit(0)