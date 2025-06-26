const sendMessage = async (input, conversationId) => {
  const formData = new FormData();
  formData.append('input', input);
  formData.append('conversation_id', conversationId);

  const response = await fetch('/api/send-and-stream', {
    method: 'POST',
    body: formData,
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let output = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    output += chunk;
    // actualiza el UI en tiempo real con cada chunk
    console.log(chunk);
  }

  console.log('Respuesta completa:', output);
};