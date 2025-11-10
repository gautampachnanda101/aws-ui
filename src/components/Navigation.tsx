import { useConfigStore } from '../stores/configStore';
import { Home, HardDrive, Database, Mail, Bell, Code, Settings } from 'lucide-react';

export function Navigation() {
  const { currentInstance } = useConfigStore();
  const currentPath = window.location.pathname;

  // Detect system color scheme
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const logoSrc = isDarkMode ? '/pachnanda-digital.png' : '/pachnanda-digital-v2.png';

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'S3', path: '/s3', icon: HardDrive },
    { name: 'DynamoDB', path: '/dynamodb', icon: Database },
    { name: 'SQS', path: '/sqs', icon: Mail },
    { name: 'SNS', path: '/sns', icon: Bell },
    { name: 'Lambda', path: '/lambda', icon: Code },
    { name: 'Config', path: '/config', icon: Settings },
  ];

  return (
    <nav style={{
      backgroundColor: 'var(--bg-secondary)',
      padding: '1rem',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
            <img src={logoSrc} alt="Pachnanda Digital" className="logo" />
          </a>

          {/* Separator */}
          <div style={{
            width: '1px',
            height: '32px',
            backgroundColor: 'var(--border-color)',
            marginRight: '0.5rem'
          }} />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'rgba(100, 108, 255, 0.15)' : 'transparent',
                  transition: 'all 0.2s',
                  border: isActive ? '1px solid var(--accent-color)' : '1px solid transparent'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>

        {currentInstance && (
          <div style={{
            fontSize: '0.85em',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#44ff44'
            }} />
            {currentInstance.name}
          </div>
        )}
      </div>
    </nav>
  );
}
