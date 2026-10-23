"""Optional offline server: Python 3.8+, standard library only."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--no-browser', action='store_true')
    parser.add_argument('--port', type=int, default=8765, help='Stable port preserves browser saves; 0 chooses a temporary port')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
        url = 'http://127.0.0.1:{}/index.html'.format(server.server_port)
        print('Shadow Rift: Last Eclipse - OFFLINE LOCAL SERVER', flush=True)
        print(url, flush=True)
        print('Keep this window open. Press Ctrl+C to stop.', flush=True)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            if not args.no_browser:
                webbrowser.open(url)
            while worker.is_alive():
                worker.join(.5)
        except KeyboardInterrupt:
            print('\nStopping server.')
        finally:
            server.shutdown()
            worker.join()


if __name__ == '__main__':
    main()
