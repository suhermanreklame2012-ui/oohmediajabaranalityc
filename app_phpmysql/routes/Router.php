<?php
/**
 * SEO-Friendly URL Routing Engine (PHP Native 8.4)
 */

class Router {
    private array $routes = [];

    public function get(string $path, callable|array $handler, array $middlewares = []): void {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middlewares): void {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = '#^' . $pattern . '$#';
        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function dispatch(string $uri, string $method): void {
        $cleanUri = parse_url($uri, PHP_URL_PATH);
        $cleanUri = rtrim($cleanUri, '/');
        if ($cleanUri === '') $cleanUri = '/';

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && preg_match($route['pattern'], $cleanUri, $matches)) {
                // Run middlewares
                foreach ($route['middlewares'] as $mw) {
                    if (is_callable($mw)) {
                        $mw();
                    }
                }

                // Filter named parameters
                $params = array_filter($matches, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY);

                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$class, $action] = $handler;
                    $controller = new $class();
                    $controller->$action(...$params);
                    return;
                } elseif (is_callable($handler)) {
                    $handler(...$params);
                    return;
                }
            }
        }

        // 404 Handler
        http_response_code(404);
        View::render('errors/404', [
            'title' => 'Halaman Tidak Ditemukan (404 Not Found)'
        ], 'main');
    }
}
