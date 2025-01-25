const createConversation = async () => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    if (response.data.id) {
      setConversations([...conversations, response.data]);
      setError(null);
      setSelectedConversation(response.data);
      return response.data; // Devuelve la conversación creada
    } else {
      setError('Error creating conversation');
    }
  } catch (error) {
    setError('Error creating conversation');
  }
};

const handleSend = async () => {
  if (!input) {
    return;
  }

  setMessages([...messages, { input, output: '', id: -1, attachment: attachments[0]?.name }]);
  setInput('');
  setAttachments([]);

  if (!selectedConversation) {
    const newConversation = await createConversation();
    if (newConversation?.id) {
      sendMessageStream(newConversation.id);
    }
  } else {
    sendMessageStream(selectedConversation.id);
  }
};

const messageData = responseSaveToDb.data;

if (messageData.id) {
  const newMessage = {
    input,
    output: concatenatedTokens,
    id: messageData.id,
    attachment: messageData.attachment,
    source: messageData.source,
  };

  const messageIndex = messages.findIndex((message) => message.id === -1); // Mensaje temporal

  if (messageIndex !== -1) {
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = newMessage;
    setMessages(updatedMessages);
  } else {
    setMessages([...messages, newMessage]);
  }

  // Actualización de la lista de conversaciones
  const updatedConversations = conversations.map((conv) => {
    // Si coincide el ID, actualizamos el nombre
    if (conv.id === messageData.conversationId) {
      return { ...conv, name: messageData.name };
    }
    return conv;
  });

  // Verifica si falta la conversación recién creada
  if (!updatedConversations.some((conv) => conv.id === messageData.conversationId)) {
    updatedConversations.push({
      id: messageData.conversationId,
      name: messageData.name,
    });
  }

  setConversations(updatedConversations);
  setSuggestions(messageData.suggestions);
  setResponseChunks([]);
  setError(null);
} else {
  setError('Error sending message: no ID');
}


