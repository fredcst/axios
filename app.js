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