<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
        $buffer = ''; // Almacenará el contenido del buffer del servidor externo
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

            // Streamed Response para enviar tokens uno a uno al frontend
            return new Response(function () use ($externalResponse, &$buffer, &$title, &$suggestions, &$tokenConcatenation) {
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
                            echo json_encode(['token' => $token]);
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
            }, Response::HTTP_OK, [
                'Content-Type' => 'application/json',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
