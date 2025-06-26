
// src/Controller/MonitoringController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MonitoringController extends AbstractController
{
    #[Route('/memory', name: 'app_memory_usage')]
    public function memoryUsage(): JsonResponse
    {
        return $this->json([
            'currentMB' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'peakMB'    => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
        ]);
    }
}


import React, { useEffect, useState } from 'react';

const MemoryUsage = () => {
  const [memory, setMemory] = useState({ currentMB: 0, peakMB: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/memory') // Asegúrate que tu frontend puede acceder a esta ruta (CORS o proxy)
        .then(res => res.json())
        .then(data => setMemory(data))
        .catch(err => console.error('Error fetching memory usage', err));
    }, 1000); // Cada segundo

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h2>Uso de Memoria (Symfony)</h2>
      <p>🧠 Actual: {memory.currentMB} MB</p>
      <p>📈 Pico: {memory.peakMB} MB</p>
    </div>
  );
};

export default MemoryUsage;



import React, { useState } from 'react';

function ChatComponent() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setResponse('');
    setLoading(true);

    const formData = new FormData();
    formData.append('input', input);
    formData.append('conversation_id', '123'); // cambia por el ID real

    const res = await fetch('/api/send-and-stream', {
      method: 'POST',
      body: formData,
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let partialResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      partialResponse += chunk;
      setResponse((prev) => prev + chunk); // actualiza el texto visible
    }

    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu mensaje..."
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>

      <div style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
        <strong>Respuesta:</strong>
        <br />
        {response}
      </div>
    </div>
  );
}

export default ChatComponent;