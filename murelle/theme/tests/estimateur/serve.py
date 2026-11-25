import http.server, functools, sys
class H(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if '/collections/' in path or '/products/' in path: return 'text/html'
        return super().guess_type(path)
    def log_message(self, *a): pass
    def translate_path(self, path):
        return super().translate_path(path.split('?')[0])
http.server.ThreadingHTTPServer(('127.0.0.1', 8767), functools.partial(H, directory=sys.argv[1])).serve_forever()
