import { useState, useEffect } from 'react';
import { Trash2, Plus, Send, Mail } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { AWSClientFactory, SQSService, logger } from '../services';
import { SQSMessage } from '../types';

export function SQSPage() {
  const { currentInstance } = useConfigStore();
  const [queues, setQueues] = useState<string[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [messages, setMessages] = useState<SQSMessage[]>([]);
  const [newQueueName, setNewQueueName] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sqsService = currentInstance
    ? new SQSService(new AWSClientFactory(currentInstance))
    : null;

  useEffect(() => {
    if (sqsService) {
      loadQueues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstance]);

  const loadQueues = async () => {
    if (!sqsService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading SQS queues', { instance: currentInstance?.name });
      const queueList = await sqsService.listQueues();
      setQueues(queueList);
      logger.info('SQS queues loaded successfully', { count: queueList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load queues';
      setError(message);
      logger.error('Failed to load SQS queues', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (queueUrl: string) => {
    if (!sqsService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Receiving SQS messages', { queueUrl });
      const messageList = await sqsService.receiveMessages(queueUrl, 10);
      setMessages(messageList);
      logger.info('SQS messages received', { queueUrl, count: messageList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
      logger.error('Failed to receive SQS messages', err as Error, { queueUrl });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQueue = async () => {
    if (!sqsService || !newQueueName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating SQS queue', { queueName: newQueueName });
      await sqsService.createQueue(newQueueName);
      setNewQueueName('');
      await loadQueues();
      logger.info('SQS queue created successfully', { queueName: newQueueName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create queue';
      setError(message);
      logger.error('Failed to create SQS queue', err as Error, {
        queueName: newQueueName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQueue = async (queueUrl: string) => {
    if (!sqsService || !confirm('Delete this queue?')) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting SQS queue', { queueUrl });
      await sqsService.deleteQueue(queueUrl);
      if (selectedQueue === queueUrl) {
        setSelectedQueue(null);
        setMessages([]);
      }
      await loadQueues();
      logger.info('SQS queue deleted successfully', { queueUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete queue';
      setError(message);
      logger.error('Failed to delete SQS queue', err as Error, { queueUrl });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!sqsService || !selectedQueue || !messageBody.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Sending SQS message', { queueUrl: selectedQueue });
      await sqsService.sendMessage(selectedQueue, messageBody);
      setMessageBody('');
      logger.info('SQS message sent successfully', { queueUrl: selectedQueue });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      logger.error('Failed to send SQS message', err as Error, {
        queueUrl: selectedQueue
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (receiptHandle: string) => {
    if (!sqsService || !selectedQueue) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting SQS message', { queueUrl: selectedQueue });
      await sqsService.deleteMessage(selectedQueue, receiptHandle);
      await loadMessages(selectedQueue);
      logger.info('SQS message deleted successfully', { queueUrl: selectedQueue });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete message';
      setError(message);
      logger.error('Failed to delete SQS message', err as Error, {
        queueUrl: selectedQueue
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentInstance) {
    return <div className="card">Please configure a LocalStack instance</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>SQS Queues</h1>

      {error && (
        <div style={{
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Queues List */}
        <div className="card">
          <h2>Queues</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Queue name"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateQueue()}
            />
            <button
              className="btn-primary"
              onClick={handleCreateQueue}
              disabled={loading || !newQueueName.trim()}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading && queues.length === 0 ? (
              <p>Loading...</p>
            ) : (
              queues.map((queueUrl) => (
                <div
                  key={queueUrl}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedQueue === queueUrl ? '#646cff33' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedQueue(queueUrl)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                    <Mail size={16} />
                    <span style={{ fontSize: '0.85em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sqsService?.getQueueName(queueUrl)}
                    </span>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQueue(queueUrl);
                    }}
                    disabled={loading}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="card">
          <h2>Messages {selectedQueue && `in ${sqsService?.getQueueName(selectedQueue)}`}</h2>

          {selectedQueue && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Message body"
                  rows={3}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-success"
                  onClick={handleSendMessage}
                  disabled={loading || !messageBody.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
              <button
                onClick={() => selectedQueue && loadMessages(selectedQueue)}
                disabled={loading}
              >
                Receive Messages
              </button>
            </div>
          )}

          {selectedQueue && messages.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {messages.map((msg) => (
                <div
                  key={msg.MessageId}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: '1rem',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <small>ID: {msg.MessageId}</small>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteMessage(msg.ReceiptHandle || '')}
                      disabled={loading}
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.Body}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {selectedQueue && messages.length === 0 && (
            <p style={{ marginTop: '1rem' }}>No messages available</p>
          )}

          {!selectedQueue && (
            <p style={{ marginTop: '1rem' }}>Select a queue to view messages</p>
          )}
        </div>
      </div>
    </div>
  );
}
