#!/usr/bin/env python3
"""
Servidor local de desenvolvimento com proxy CORS para o INTRA UFC.
Uso: python3 server.py [porta] (padrão: 8000)
"""
import sys
import http.server
import urllib.request
import urllib.error

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
API_REMOTE_URL = "https://sobral.179.197.66.83.sslip.io/onibus/ao-vivo"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/onibus/ao-vivo"):
            try:
                req = urllib.request.Request(
                    API_REMOTE_URL,
                    headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    content = response.read()
                    self.send_response(response.status)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(content)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(502)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(f'{{"erro": "{str(e)}"}}'.encode("utf-8"))
        else:
            super().do_GET()

if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, ProxyHTTPRequestHandler)
    print(f"\n🚍 INTRA UFC - Servidor rodando em http://localhost:{PORT}")
    print("   Pressione Ctrl+C para encerrar.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
