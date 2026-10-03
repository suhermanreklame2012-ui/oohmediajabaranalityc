<?php
/**
 * View Renderer
 */

class View {
    public static function render(string $viewPath, array $data = [], string $layout = 'main'): void {
        extract($data);
        $viewFile = __DIR__ . '/../../views/' . $viewPath . '.php';
        
        if (!file_exists($viewFile)) {
            http_response_code(500);
            die("View template [$viewPath] not found.");
        }

        ob_start();
        require $viewFile;
        $content = ob_get_clean();

        $layoutFile = __DIR__ . '/../../views/layouts/' . $layout . '.php';
        if (file_exists($layoutFile)) {
            require $layoutFile;
        } else {
            echo $content;
        }
    }

    public static function json(mixed $data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
