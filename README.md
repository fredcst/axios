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