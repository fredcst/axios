import React, { useState } from 'react';

const StreamedRequest = () => {
    const [conversationId, setConversationId] = useState('');
    const [input, setInput] = useState('');
    const [response, setResponse] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Crear el formulario multipart
        const formData = new FormData();
        formData.append('conversation_id', conversationId);
        formData.append('input', input);

        try {
            const res = await fetch('http://localhost/proxy', {
                method: 'POST',
                body: formData,
            });

            if (!res.body) {
                throw new Error('No se recibió respuesta del servidor.');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let receivedData = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                receivedData += chunk;

                // Mostrar los datos en tiempo real
                setResponse((prev) => prev + chunk);
            }

            console.log('Respuesta completa:', receivedData);
        } catch (err) {
            console.error('Error:', err);
            setResponse('Ocurrió un error.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Conversation ID"
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit">Enviar</button>
            </form>
            <div>
                <h3>Respuesta:</h3>
                <pre>{response}</pre>
            </div>
        </div>
    );
};

export default StreamedRequest;



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
            // Inicializar variables
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
                while (!$body->eof()) {
                    $line = $body->read(1024); // Leer en bloques
                    if (!empty(trim($line))) {
                        // Enviar al cliente en tiempo real
                        echo $line;
                        ob_flush();
                        flush();

                        // Parsear el JSON recibido
                        $decoded = json_decode($line, true);
                        if (isset($decoded['token'])) {
                            $tokens[] = $decoded['token'];
                        }
                        if (isset($decoded['title'])) {
                            $title = $decoded['title'];
                        }
                    }
                }

                // Guardar tokens y título en una variable (puedes reemplazar esto con otra lógica)
                $finalString = implode(' ', $tokens);
                // Aquí podrías persistir o trabajar con $finalString y $title.
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
}
