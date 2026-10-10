"""Serve Titana and an attachment download outside the embedded preview.
Run: python scripts/preview_server.py --port 3000
Only the presentation and its download page are exposed, not the repository.
"""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

ROOT = Path(__file__).resolve().parent.parent
NAME = "titana-campaign-intelligence.html"
DOWNLOAD_PAGE = '''<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دانلود ارائهٔ تیتانا</title><style>body{font-family:Tahoma,Arial,sans-serif;background:#f5f7fb;color:#17263c;margin:0;padding:24px;line-height:2}main{max-width:660px;margin:8vh auto;background:white;padding:28px;border:1px solid #dce5f1;border-radius:16px}a{display:inline-block;background:#2866db;color:white;padding:12px 24px;border-radius:9px;text-decoration:none}small{display:block;margin-top:24px;color:#526782}</style><main><h1>دانلود فایل HTML تیتانا</h1><p>این صفحه را در زبانهٔ مستقل مرورگر باز کنید و دکمهٔ زیر را بزنید. فایل دریافت‌شده را می‌توانید بدون اینترنت با مرورگر باز کنید.</p><a id="downloadAttachment" href="?download=html">دانلود فایل HTML</a><small>اگر هنوز داخل پنجرهٔ Preview هستید، از گزینهٔ «بازکردن در زبانهٔ جدید» خود Preview استفاده کنید. محدودیت دانلود پنجرهٔ تعبیه‌شده را سرور نمی‌تواند تغییر دهد.</small><p>لینک‌های کوتاه داخل فایل نمایشی‌اند. تغییرهای موقت شما در فایل خروجی ذخیره نمی‌شوند.</p></main></html>'''.encode("utf-8")


class Preview(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.respond(send_body=False)

    def do_GET(self):
        self.respond(send_body=True)

    def respond(self, send_body):
        url = urlsplit(self.path)
        allowed = {"/", "/" + NAME, "/downloads/" + NAME}
        if url.path not in allowed:
            self.send_error(404)
            return
        mode = parse_qs(url.query).get("download", [""])[0]
        attachment = mode == "html"
        if mode == "1":
            body = DOWNLOAD_PAGE
        else:
            source = ROOT / ("downloads" if attachment or url.path.startswith("/downloads/") else "") / NAME
            try:
                body = source.read_bytes()
            except OSError:
                self.send_error(503, "Export unavailable; run node scripts/export-titana.cjs")
                return
        self.send_response(200)
        self.send_header("Content-Type", "application/octet-stream" if attachment else "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        if attachment:
            self.send_header("Content-Disposition", f'attachment; filename="{NAME}"')
        self.end_headers()
        if send_body:
            self.wfile.write(body)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=3000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("0.0.0.0", args.port), Preview)
    print(f"Titana preview listening on port {server.server_port}", flush=True)
    server.serve_forever()
