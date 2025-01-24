<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use GuzzleHttp\Client;

class ConversationController extends AbstractController
{
    public function handleConversation(Request $request): Response
    {
        $conversationId = $request->request->get('conversation_id');
        $input = $request->request->get('input');

        if (!$conversationId || !$input) {
            return $this->json(['error' => 'Missing parameters'], Response::HTTP_BAD_REQUEST);
        }

        // Cliente Guzzle para realizar la solicitud al servidor externo
        $client = new Client();
        $buffer = ''; // Almacena el contenido del buffer del servidor externo
        $title = null;
        $suggestions = [];
        $tokenConcatenation = '';

        try {
            $externalResponse = $client->post('https://external-server.com/api', [
                'json' => [
                    'conversation_id' => $conversationId,
                    'question' => $input,
                    'stream' => true,
                ],
                'stream' => true,
            ]);

            // Crear una StreamedResponse para gestionar el streaming
            $response = new StreamedResponse(function () use ($externalResponse, &$buffer, &$title, &$suggestions, &$tokenConcatenation, $conversationId) {
                $stream = $externalResponse->getBody();

                while (!$stream->eof()) {
                    $chunk = $stream->read(1024); // Leer en bloques de 1024 bytes
                    $buffer .= $chunk;

                    // Procesar objetos JSON que lleguen completos en el buffer
                    while (($pos = strpos($buffer, '}')) !== false) {
                        $jsonString = substr($buffer, 0, $pos + 1);
                        $buffer = substr($buffer, $pos + 1);

                        $data = json_decode($jsonString, true);

                        if (isset($data['token'])) {
                            $token = $data['token'];
                            $tokenConcatenation .= $token;

                            // Enviar el token inmediatamente al frontend
                            echo json_encode(['token' => $token]) . PHP_EOL;
                            ob_flush();
                            flush();
                        }

                        if (isset($data['title'])) {
                            $title = $data['title'];
                        }

                        if (isset($data['suggestions'])) {
                            $suggestions = $data['suggestions'];
                        }
                    }
                }

                // Enviar la respuesta final al frontend
                echo json_encode([
                    'conversation_id' => $conversationId,
                    'tokenConcatenation' => $tokenConcatenation,
                    'title' => $title,
                    'suggestions' => $suggestions,
                ]);
            });

            $response->headers->set('Content-Type', 'application/json');
            return $response;
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
