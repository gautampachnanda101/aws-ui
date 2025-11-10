import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { S3Page } from './pages/S3Page';
import { DynamoDBPage } from './pages/DynamoDBPage';
import { SQSPage } from './pages/SQSPage';
import { SNSPage } from './pages/SNSPage';
import { LambdaPage } from './pages/LambdaPage';
import { ConfigPage } from './pages/ConfigPage';
import { logger } from './services';

function App() {
  logger.info('LocalStack CRUD UI initialized');

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/s3" element={<S3Page />} />
            <Route path="/dynamodb" element={<DynamoDBPage />} />
            <Route path="/sqs" element={<SQSPage />} />
            <Route path="/sns" element={<SNSPage />} />
            <Route path="/lambda" element={<LambdaPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
