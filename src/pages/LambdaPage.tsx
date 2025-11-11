import { useState, useEffect } from 'react';
import { Trash2, Plus, Play, Code } from 'lucide-react';
import JSZip from 'jszip';
import { useConfigStore } from '../stores/configStore';
import { AWSClientFactory, LambdaService, logger } from '../services';
import { LambdaFunction } from '../types';

export function LambdaPage() {
  const { currentInstance } = useConfigStore();
  const [functions, setFunctions] = useState<LambdaFunction[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionDetails, setFunctionDetails] = useState<LambdaFunction | null>(null);
  const [newFunctionName, setNewFunctionName] = useState('');
  const [invokePayload, setInvokePayload] = useState('{}');
  const [invokeResult, setInvokeResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lambdaService = currentInstance
    ? new LambdaService(new AWSClientFactory(currentInstance))
    : null;

  useEffect(() => {
    if (lambdaService) {
      loadFunctions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstance]);

  useEffect(() => {
    if (selectedFunction && lambdaService) {
      loadFunctionDetails(selectedFunction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFunction]);

  const loadFunctions = async () => {
    if (!lambdaService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading Lambda functions', { instance: currentInstance?.name });
      const functionList = await lambdaService.listFunctions();
      setFunctions(functionList);
      logger.info('Lambda functions loaded successfully', {
        count: functionList.length
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load functions';
      setError(message);
      logger.error('Failed to load Lambda functions', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunctionDetails = async (functionName: string) => {
    if (!lambdaService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading Lambda function details', { functionName });
      const details = await lambdaService.getFunction(functionName);
      setFunctionDetails(details);
      logger.info('Lambda function details loaded', { functionName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load function details';
      setError(message);
      logger.error('Failed to load Lambda function details', err as Error, {
        functionName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFunction = async () => {
    if (!lambdaService || !newFunctionName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating Lambda function', { functionName: newFunctionName });

      // Create a simple Node.js Lambda function
      const code = `
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello from Lambda!' })
    };
};
`;
      
      // Create a proper ZIP file using JSZip
      const zip = new JSZip();
      zip.file('index.js', code);
      const zipBlob = await zip.generateAsync({ type: 'uint8array' });

      await lambdaService.createFunction(
        newFunctionName,
        'nodejs18.x',
        'index.handler',
        zipBlob,
        'arn:aws:iam::000000000000:role/lambda-role',
        'Created via LocalStack UI'
      );

      setNewFunctionName('');
      await loadFunctions();
      logger.info('Lambda function created successfully', {
        functionName: newFunctionName
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create function';
      setError(message);
      logger.error('Failed to create Lambda function', err as Error, {
        functionName: newFunctionName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFunction = async (functionName: string) => {
    if (!lambdaService || !confirm(`Delete function ${functionName}?`)) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting Lambda function', { functionName });
      await lambdaService.deleteFunction(functionName);
      if (selectedFunction === functionName) {
        setSelectedFunction(null);
        setFunctionDetails(null);
      }
      await loadFunctions();
      logger.info('Lambda function deleted successfully', { functionName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete function';
      setError(message);
      logger.error('Failed to delete Lambda function', err as Error, { functionName });
    } finally {
      setLoading(false);
    }
  };

  const handleInvokeFunction = async () => {
    if (!lambdaService || !selectedFunction) return;

    setLoading(true);
    setError(null);
    setInvokeResult(null);
    try {
      logger.info('Invoking Lambda function', { functionName: selectedFunction });
      const payload = JSON.parse(invokePayload);
      const result = await lambdaService.invokeFunction(selectedFunction, payload);
      setInvokeResult(
        `Status: ${result.statusCode}\n\nResponse:\n${result.payload}`
      );
      logger.info('Lambda function invoked successfully', {
        functionName: selectedFunction,
        statusCode: result.statusCode
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to invoke function';
      setError(message);
      logger.error('Failed to invoke Lambda function', err as Error, {
        functionName: selectedFunction
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
      <h1>Lambda Functions</h1>

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
        {/* Functions List */}
        <div className="card">
          <h2>Functions</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Function name"
              value={newFunctionName}
              onChange={(e) => setNewFunctionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFunction()}
            />
            <button
              className="btn-primary"
              onClick={handleCreateFunction}
              disabled={loading || !newFunctionName.trim()}
              aria-label="Create function"
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading && functions.length === 0 ? (
              <p>Loading...</p>
            ) : (
              functions.map((func) => (
                <div
                  key={func.FunctionName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedFunction === func.FunctionName ? '#646cff33' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedFunction(func.FunctionName || null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <Code size={16} />
                    <div>
                      <div>{func.FunctionName}</div>
                      <div style={{ fontSize: '0.75em', opacity: 0.7 }}>{func.Runtime}</div>
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFunction(func.FunctionName || '');
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

        {/* Function Details */}
        <div className="card">
          <h2>Function Details {selectedFunction && `- ${selectedFunction}`}</h2>

          {selectedFunction && functionDetails && (
            <>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '4px' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>ARN:</strong> {functionDetails.FunctionArn}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Runtime:</strong> {functionDetails.Runtime}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Handler:</strong> {functionDetails.Handler}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Code Size:</strong> {functionDetails.CodeSize} bytes
                </div>
                <div>
                  <strong>Last Modified:</strong> {functionDetails.LastModified}
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h3>Invoke Function</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <textarea
                    value={invokePayload}
                    onChange={(e) => setInvokePayload(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={5}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="btn-success"
                    onClick={handleInvokeFunction}
                    disabled={loading}
                    aria-label="Invoke function"
                  >
                    <Play size={16} />
                  </button>
                </div>

                {invokeResult && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '4px'
                  }}>
                    <h4>Result:</h4>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {invokeResult}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedFunction && (
            <p style={{ marginTop: '1rem' }}>Select a function to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
