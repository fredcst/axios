interface Conversation {
  id: string;
  title?: string;
}

const [conversations, setConversations] = useState<Conversation[]>([]);
const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
const [error, setError] = useState<string | null>(null);

const createConversation = async (): Promise<Conversation | null> => {
  try {
    const response = await axios.post<Conversation>('/api/conversation', {});
    const newConversation = response.data;

    if (newConversation.id) {
      setConversations((prev: Conversation[]) => [...prev, newConversation]); // Aquí se evita el error
      setSelectedConversation(newConversation);
      setError(null);
      return newConversation;
    } else {
      setError('Error creating conversation');
      return null;
    }
  } catch (err) {
    setError('Error creating conversation');
    return null;
  }
};

const handleSend = async () => {
  if (!input) return;

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
      sendMessageStream(newConversation.id);
    }
  } else {
    sendMessageStream(selectedConversation.id);
  }
};