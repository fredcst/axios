const createConversation = async () => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    if (response.data.id) {
      const newConversation = response.data; // Captura directamente la conversación creada
      setConversations((prev) => [...prev, newConversation]);
      setError(null);
      setSelectedConversation(newConversation); // Actualiza el estado
      return newConversation; // Devuelve la conversación creada
    } else {
      setError('Error creating conversation');
      return null;
    }
  } catch (error) {
    setError('Error creating conversation');
    return null;
  }
};

const handleSend = async () => {
  if (!input) {
    return;
  }

  setMessages((prev) => [
    ...prev,
    {
      input,
      output: '',
      id: -1,
      attachment: attachments[0]?.name,
    },
  ]);
  setInput('');
  setAttachments([]);

  if (!selectedConversation) {
    const newConversation = await createConversation();
    if (newConversation?.id) {
      sendMessageStream(newConversation.id); // Usa directamente el ID retornado
    }
  } else {
    sendMessageStream(selectedConversation.id);
  }
};


const [conversations, setConversations] = useState<Conversation[]>([]);

const createConversation = async () => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    if (response.data.id) {
      const newConversation: Conversation = response.data;
      setConversations((prev) => [...prev, newConversation]); // Correcto tipo
      setError(null);
      setSelectedConversation(newConversation);
      return newConversation;
    } else {
      setError('Error creating conversation');
      return null;
    }
  } catch (error) {
    setError('Error creating conversation');
    return null;
  }
};

const [conversations, setConversations] = useState<Conversation[]>([]);

const createConversation = async () => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    if (response.data.id) {
      const newConversation: Conversation = response.data;
      setConversations((prev) => [...prev, newConversation]); // Correcto tipo
      setError(null);
      setSelectedConversation(newConversation);
      return newConversation;
    } else {
      setError('Error creating conversation');
      return null;
    }
  } catch (error) {
    setError('Error creating conversation');
    return null;
  }
};