import React, { useRef, useState } from 'react';

const App = () => {
  const [text, setText] = useState('');
  const [responseChunks, setResponseChunks] = useState<string[]>([]); // Array para almacenar los chunks completos
  const fileInput = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('text', text);
    if (fileInput.current?.files?.[0]) {
      formData.append('file', fileInput.current.files[0]);
    }

    try {
      // Usamos fetch en lugar de axios para manejar el streaming de manera efectiva
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      // Usamos .body.getReader() para leer el stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; // Buffer para acumular los chunks

      // Leemos el stream de manera incremental
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        // Decodificamos el chunk y lo agregamos al buffer
        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;

        // Mientras el buffer tenga un objeto JSON completo, procesamos
        let endOfJson;
        while ((endOfJson = buffer.indexOf('}')) !== -1) {
          const jsonPart = buffer.slice(0, endOfJson + 1);
          buffer = buffer.slice(endOfJson + 1); // Elimina la parte procesada

          try {
            const jsonData = JSON.parse(jsonPart); // Intentamos parsear el JSON
            setResponseChunks((prevChunks) => [
              ...prevChunks,
              JSON.stringify(jsonData), // Agregamos el JSON completo al estado
            ]);
          } catch (error) {
            console.error('Error al parsear JSON', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ingresa texto"
        />
        <input type="file" ref={fileInput} />
        <button type="submit">Enviar</button>
      </form>

      {/* Mostrar cada JSON recibido en pantalla */}
      <div>
        <h3>Respuesta del servidor (uno por uno):</h3>
        <pre>{responseChunks.map((chunk, index) => (
          <div key={index}>{chunk}</div> // Mostramos cada chunk de JSON por separado
        ))}</pre>
      </div>
    </div>
  );
};

export default App;