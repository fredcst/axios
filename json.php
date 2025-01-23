<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use GuzzleHttp\Client;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProxyController
{
    #[Route('/proxy', name: 'proxy', methods: ['POST'])]
    public function proxy(Request $request): Response
    {
        // Verificar si los parámetros necesarios están presentes
        $conversationId = $request->request->get('conversation_id');
        $input = $request->request->get('input');
        if (!$conversationId || !$input) {
            throw new BadRequestHttpException('Faltan parámetros necesarios.');
        }

        // Cliente de Guzzle
        $client = new Client();

        // Crear una respuesta en stream para el frontend
        $streamedResponse = new StreamedResponse(function () use ($client, $conversationId, $input) {
            $tokens = [];
            $title = null;

            try {
                // Enviar solicitud POST al servidor externo
                $response = $client->post('https://external-server.com/api', [
                    'multipart' => [
                        [
                            'name' => 'conversation_id',
                            'contents' => $conversationId,
                        ],
                        [
                            'name' => 'input',
                            'contents' => $input,
                        ],
                    ],
                    'stream' => true, // Recibir respuesta en stream
                ]);

                // Procesar la respuesta en stream
                $body = $response->getBody();
                $buffer = ''; // Acumula datos hasta encontrar un JSON completo

                while (!$body->eof()) {
                    $buffer .= $body->read(1); // Leer byte a byte
                    if ($this->isCompleteJson($buffer)) {
                        // Enviar al cliente el JSON completo
                        echo $buffer;
                        ob_flush();
                        flush();

                        // Parsear el JSON recibido
                        $decoded = json_decode($buffer, true);
                        if (isset($decoded['token'])) {
                            $tokens[] = $decoded['token'];
                        }
                        if (isset($decoded['title'])) {
                            $title = $decoded['title'];
                        }

                        // Limpiar el buffer una vez procesado
                        $buffer = '';
                    }
                }

                // Guardar tokens y título en una variable
                $finalString = implode(' ', $tokens);
                // Aquí puedes guardar $finalString y $title donde lo necesites.
            } catch (\Exception $e) {
                // Manejar errores en la conexión al servidor externo
                echo json_encode(['error' => $e->getMessage()]);
                ob_flush();
                flush();
            }
        });

        // Configurar los headers
        $streamedResponse->headers->set('Content-Type', 'application/json');
        return $streamedResponse;
    }

    /**
     * Verifica si el contenido del buffer es un JSON completo.
     */
    private function isCompleteJson(string $buffer): bool
    {
        $trimmed = trim($buffer);
        if (substr($trimmed, 0, 1) === '{' && substr($trimmed, -1) === '}') {
            json_decode($trimmed);
            return json_last_error() === JSON_ERROR_NONE;
        }

        return false;
    }
}