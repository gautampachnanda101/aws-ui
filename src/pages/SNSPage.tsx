import { useState, useEffect } from 'react';
import { Trash2, Plus, Send, Bell } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { AWSClientFactory, SNSService, logger } from '../services';
import { SNSTopic, SNSSubscription } from '../types';

export function SNSPage() {
  const { currentInstance } = useConfigStore();
  const [topics, setTopics] = useState<SNSTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<SNSSubscription[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [newSubProtocol, setNewSubProtocol] = useState('email');
  const [newSubEndpoint, setNewSubEndpoint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snsService = currentInstance
    ? new SNSService(new AWSClientFactory(currentInstance))
    : null;

  useEffect(() => {
    if (snsService) {
      loadTopics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstance]);

  useEffect(() => {
    if (selectedTopic && snsService) {
      loadSubscriptions(selectedTopic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  const loadTopics = async () => {
    if (!snsService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading SNS topics', { instance: currentInstance?.name });
      const topicList = await snsService.listTopics();
      setTopics(topicList);
      logger.info('SNS topics loaded successfully', { count: topicList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load topics';
      setError(message);
      logger.error('Failed to load SNS topics', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async (topicArn: string) => {
    if (!snsService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading SNS subscriptions', { topicArn });
      const subList = await snsService.listSubscriptions(topicArn);
      setSubscriptions(subList);
      logger.info('SNS subscriptions loaded', { topicArn, count: subList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load subscriptions';
      setError(message);
      logger.error('Failed to load SNS subscriptions', err as Error, { topicArn });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!snsService || !newTopicName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating SNS topic', { topicName: newTopicName });
      await snsService.createTopic(newTopicName);
      setNewTopicName('');
      await loadTopics();
      logger.info('SNS topic created successfully', { topicName: newTopicName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create topic';
      setError(message);
      logger.error('Failed to create SNS topic', err as Error, {
        topicName: newTopicName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicArn: string) => {
    if (!snsService || !confirm('Delete this topic?')) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting SNS topic', { topicArn });
      await snsService.deleteTopic(topicArn);
      if (selectedTopic === topicArn) {
        setSelectedTopic(null);
        setSubscriptions([]);
      }
      await loadTopics();
      logger.info('SNS topic deleted successfully', { topicArn });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete topic';
      setError(message);
      logger.error('Failed to delete SNS topic', err as Error, { topicArn });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!snsService || !selectedTopic || !messageText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Publishing SNS message', { topicArn: selectedTopic });
      await snsService.publish(
        selectedTopic,
        messageText,
        messageSubject || undefined
      );
      setMessageText('');
      setMessageSubject('');
      logger.info('SNS message published successfully', { topicArn: selectedTopic });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish message';
      setError(message);
      logger.error('Failed to publish SNS message', err as Error, {
        topicArn: selectedTopic
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!snsService || !selectedTopic || !newSubEndpoint.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating SNS subscription', {
        topicArn: selectedTopic,
        protocol: newSubProtocol
      });
      await snsService.subscribe(selectedTopic, newSubProtocol, newSubEndpoint);
      setNewSubEndpoint('');
      await loadSubscriptions(selectedTopic);
      logger.info('SNS subscription created successfully', {
        topicArn: selectedTopic
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(message);
      logger.error('Failed to create SNS subscription', err as Error, {
        topicArn: selectedTopic
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionArn: string) => {
    if (!snsService || !confirm('Unsubscribe?')) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting SNS subscription', { subscriptionArn });
      await snsService.unsubscribe(subscriptionArn);
      if (selectedTopic) {
        await loadSubscriptions(selectedTopic);
      }
      logger.info('SNS subscription deleted successfully', { subscriptionArn });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(message);
      logger.error('Failed to delete SNS subscription', err as Error, {
        subscriptionArn
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
      <h1>SNS Topics</h1>

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
        {/* Topics List */}
        <div className="card">
          <h2>Topics</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Topic name"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTopic()}
            />
            <button
              className="btn-primary"
              onClick={handleCreateTopic}
              disabled={loading || !newTopicName.trim()}
              aria-label="Create topic"
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading && topics.length === 0 ? (
              <p>Loading...</p>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.TopicArn}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedTopic === topic.TopicArn ? '#646cff33' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTopic(topic.TopicArn || null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                    <Bell size={16} />
                    <span style={{ fontSize: '0.85em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {snsService?.getTopicName(topic.TopicArn || '')}
                    </span>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.TopicArn || '');
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

        {/* Topic Details */}
        <div className="card">
          <h2>Topic Details {selectedTopic && `- ${snsService?.getTopicName(selectedTopic)}`}</h2>

          {selectedTopic && (
            <>
              {/* Publish Message */}
              <div style={{ marginTop: '1rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <h3>Publish Message</h3>
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message"
                    rows={3}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-success"
                    onClick={handlePublish}
                    disabled={loading || !messageText.trim()}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Subscriptions */}
              <div style={{ marginTop: '1rem' }}>
                <h3>Subscriptions</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select
                    value={newSubProtocol}
                    onChange={(e) => setNewSubProtocol(e.target.value)}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="sqs">SQS</option>
                    <option value="http">HTTP</option>
                    <option value="https">HTTPS</option>
                    <option value="lambda">Lambda</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Endpoint"
                    value={newSubEndpoint}
                    onChange={(e) => setNewSubEndpoint(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSubscribe}
                    disabled={loading || !newSubEndpoint.trim()}
                    aria-label="Add subscription"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {subscriptions.length === 0 ? (
                  <p>No subscriptions</p>
                ) : (
                  <div>
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.SubscriptionArn}
                        style={{
                          backgroundColor: '#2a2a2a',
                          padding: '0.75rem',
                          borderRadius: '4px',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div><strong>{sub.Protocol}</strong></div>
                          <div style={{ fontSize: '0.85em', opacity: 0.8 }}>{sub.Endpoint}</div>
                        </div>
                        <button
                          className="btn-danger"
                          onClick={() => handleUnsubscribe(sub.SubscriptionArn || '')}
                          disabled={loading}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedTopic && (
            <p style={{ marginTop: '1rem' }}>Select a topic to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
