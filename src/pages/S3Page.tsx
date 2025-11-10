import { useState, useEffect } from 'react';
import { Trash2, Plus, Download, Upload, FolderOpen, File } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { AWSClientFactory, S3Service, logger } from '../services';
import { S3Bucket, S3Object } from '../types';

export function S3Page() {
  const { currentInstance } = useConfigStore();
  const [buckets, setBuckets] = useState<S3Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [newBucketName, setNewBucketName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const s3Service = currentInstance
    ? new S3Service(new AWSClientFactory(currentInstance))
    : null;

  useEffect(() => {
    if (s3Service) {
      loadBuckets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstance]);

  useEffect(() => {
    if (selectedBucket && s3Service) {
      loadObjects(selectedBucket);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBucket]);

  const loadBuckets = async () => {
    if (!s3Service) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading S3 buckets', { instance: currentInstance?.name });
      const bucketList = await s3Service.listBuckets();
      setBuckets(bucketList);
      logger.info('S3 buckets loaded successfully', { count: bucketList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load buckets';
      setError(message);
      logger.error('Failed to load S3 buckets', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadObjects = async (bucketName: string) => {
    if (!s3Service) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading S3 objects', { bucket: bucketName });
      const objectList = await s3Service.listObjects(bucketName);
      setObjects(objectList);
      logger.info('S3 objects loaded successfully', {
        bucket: bucketName,
        count: objectList.length
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load objects';
      setError(message);
      logger.error('Failed to load S3 objects', err as Error, { bucket: bucketName });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    if (!s3Service || !newBucketName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating S3 bucket', { bucketName: newBucketName });
      await s3Service.createBucket(newBucketName);
      setNewBucketName('');
      await loadBuckets();
      logger.info('S3 bucket created successfully', { bucketName: newBucketName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create bucket';
      setError(message);
      logger.error('Failed to create S3 bucket', err as Error, {
        bucketName: newBucketName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBucket = async (bucketName: string) => {
    if (!s3Service || !confirm(`Delete bucket ${bucketName}?`)) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting S3 bucket', { bucketName });
      await s3Service.deleteBucket(bucketName);
      if (selectedBucket === bucketName) {
        setSelectedBucket(null);
        setObjects([]);
      }
      await loadBuckets();
      logger.info('S3 bucket deleted successfully', { bucketName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete bucket';
      setError(message);
      logger.error('Failed to delete S3 bucket', err as Error, { bucketName });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!s3Service || !selectedBucket || !uploadFile) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Uploading file to S3', {
        bucket: selectedBucket,
        fileName: uploadFile.name
      });
      const arrayBuffer = await uploadFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      await s3Service.uploadObject(
        selectedBucket,
        uploadFile.name,
        buffer,
        uploadFile.type
      );
      setUploadFile(null);
      await loadObjects(selectedBucket);
      logger.info('File uploaded successfully', {
        bucket: selectedBucket,
        fileName: uploadFile.name
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      setError(message);
      logger.error('Failed to upload file', err as Error, {
        bucket: selectedBucket,
        fileName: uploadFile.name
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObject = async (key: string) => {
    if (!s3Service || !selectedBucket || !confirm(`Delete object ${key}?`)) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting S3 object', { bucket: selectedBucket, key });
      await s3Service.deleteObject(selectedBucket, key);
      await loadObjects(selectedBucket);
      logger.info('S3 object deleted successfully', { bucket: selectedBucket, key });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete object';
      setError(message);
      logger.error('Failed to delete S3 object', err as Error, {
        bucket: selectedBucket,
        key
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadObject = async (key: string) => {
    if (!s3Service || !selectedBucket) return;

    try {
      logger.info('Downloading S3 object', { bucket: selectedBucket, key });
      const content = await s3Service.getObject(selectedBucket, key);
      const blob = new Blob([content]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key;
      a.click();
      URL.revokeObjectURL(url);
      logger.info('S3 object downloaded successfully', {
        bucket: selectedBucket,
        key
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download object';
      setError(message);
      logger.error('Failed to download S3 object', err as Error, {
        bucket: selectedBucket,
        key
      });
    }
  };

  if (!currentInstance) {
    return <div className="card">Please configure a LocalStack instance</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>S3 Storage</h1>

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
        {/* Buckets List */}
        <div className="card">
          <h2>Buckets</h2>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Bucket name"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBucket()}
            />
            <button
              className="btn-primary"
              onClick={handleCreateBucket}
              disabled={loading || !newBucketName.trim()}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading && buckets.length === 0 ? (
              <p>Loading...</p>
            ) : (
              buckets.map((bucket) => (
                <div
                  key={bucket.Name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedBucket === bucket.Name ? '#646cff33' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedBucket(bucket.Name || null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FolderOpen size={16} />
                    <span>{bucket.Name}</span>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBucket(bucket.Name || '');
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

        {/* Objects List */}
        <div className="card">
          <h2>Objects {selectedBucket && `in ${selectedBucket}`}</h2>

          {selectedBucket && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <button
                className="btn-success"
                onClick={handleUploadFile}
                disabled={loading || !uploadFile}
              >
                <Upload size={16} />
              </button>
            </div>
          )}

          {selectedBucket ? (
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Size</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {objects.map((obj) => (
                  <tr key={obj.Key}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <File size={14} />
                        {obj.Key}
                      </div>
                    </td>
                    <td>{obj.Size ? `${(obj.Size / 1024).toFixed(2)} KB` : '-'}</td>
                    <td>{obj.LastModified?.toLocaleString() || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleDownloadObject(obj.Key || '')}
                          disabled={loading}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteObject(obj.Key || '')}
                          disabled={loading}
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: '1rem' }}>Select a bucket to view objects</p>
          )}
        </div>
      </div>
    </div>
  );
}
