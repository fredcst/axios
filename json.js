import React, { useState } from 'react';

const ChatComponent: React.FC = () => {
    const [conversationId, setConversationId] = useState('');
    const [input, setInput] = useState('');
    const [tokens, setTokens] = useState<string[]>([]);
    const [finalResponse, setFinalResponse] = useState<any>(null);

    const handleSend = async () => {
        setTokens([]);
        setFinalResponse(null);

        const formData = new FormData();
        formData.append('conversation_id', conversationId);
        formData.append('input', input);

        const response = await fetch('/api/conversation', {
            method: 'POST',
            body: formData,
        });

        const reader = response.body?.getReader();
        if (!reader) return;

        let buffer = '';
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Procesar tokens (streamed JSONs)
            while (buffer.includes('}')) {
                const endIndex = buffer.indexOf('}') + 1;
                const jsonString = buffer.slice(0, endIndex);
                buffer = buffer.slice(endIndex);

                try {
                    const data = JSON.parse(jsonString);

                    if (data.token) {
                        setTokens((prev) => [...prev, data.token]); // Actualizar tokens dinámicamente
                    } else {
                        // Última respuesta clásica con todos los datos
                        setFinalResponse(data);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                value={conversationId}
                placeholder="Conversation ID"
                onChange={(e) => setConversationId(e.target.value)}
            />
            <textarea
                value={input}
                placeholder="Input"
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>

            <div>
                <h3>Streaming Tokens:</h3>
                <div>{tokens.join(' ')}</div>
            </div>

            {finalResponse && (
                <div>
                    <h3>Final Response:</h3>
                    <p>Title: {finalResponse.title}</p>
                    <p>Suggestions: {finalResponse.suggestions?.join(', ')}</p>
                    <p>Full Token Concatenation: {finalResponse.tokenConcatenation}</p>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;
