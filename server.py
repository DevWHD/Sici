import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.getcwd()

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        self.send_response(200)
        return super().do_GET()

    def log_message(self, format, *args):
        print(f"{args[0]} - - {self.log_date_time_string()} \"{args[1]}\" {args[2]}")

os.chdir(DIRECTORY)

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"✓ Servidor rodando em: http://localhost:{PORT}")
    print(f"✓ Acesse: http://localhost:{PORT}/sketch.html")
    print(f"✓ Pressione Ctrl+C para parar")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Servidor parado")
