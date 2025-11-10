import { useConfigStore } from '../stores/configStore';
import { Database, HardDrive, Mail, Bell, Code, Settings } from 'lucide-react';

export function HomePage() {
  const { currentInstance } = useConfigStore();

  const services = [
    { name: 'S3', icon: HardDrive, description: 'Object storage service', path: '/s3' },
    { name: 'DynamoDB', icon: Database, description: 'NoSQL database service', path: '/dynamodb' },
    { name: 'SQS', icon: Mail, description: 'Message queue service', path: '/sqs' },
    { name: 'SNS', icon: Bell, description: 'Notification service', path: '/sns' },
    { name: 'Lambda', icon: Code, description: 'Serverless compute', path: '/lambda' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1>LocalStack CRUD UI</h1>

      {currentInstance ? (
        <div style={{
          padding: '1rem',
          backgroundColor: '#646cff33',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <strong>Connected to:</strong> {currentInstance.name} ({currentInstance.endpoint})
        </div>
      ) : (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ff444433',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <strong>Warning:</strong> No LocalStack instance configured. Please go to{' '}
          <a href="/config" style={{ color: '#646cff' }}>Configuration</a> to set up an instance.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <a
              key={service.name}
              href={service.path}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Icon size={48} style={{ marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '0.5rem' }}>{service.name}</h2>
                <p style={{ opacity: 0.8, fontSize: '0.9em' }}>{service.description}</p>
              </div>
            </a>
          );
        })}

        <a href="/config" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="card"
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              height: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Settings size={48} style={{ marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Configuration</h2>
            <p style={{ opacity: 0.8, fontSize: '0.9em' }}>Manage LocalStack instances</p>
          </div>
        </a>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>About</h2>
        <p>
          This is a comprehensive CRUD UI for managing AWS services via LocalStack. It provides
          full Create, Read, Update, and Delete operations for:
        </p>
        <ul>
          <li><strong>S3:</strong> Bucket and object management</li>
          <li><strong>DynamoDB:</strong> Table and item operations</li>
          <li><strong>SQS:</strong> Queue management and message handling</li>
          <li><strong>SNS:</strong> Topic and subscription management</li>
          <li><strong>Lambda:</strong> Function deployment and invocation</li>
        </ul>
        <p>
          All operations are logged with Google Cloud Logging standards for easy monitoring and debugging.
        </p>
      </div>
    </div>
  );
}
