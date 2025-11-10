import { useState, useEffect } from 'react';
import { Trash2, Plus, RefreshCw, Database } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { AWSClientFactory, DynamoDBService, logger } from '../services';
import { DynamoDBItem } from '../types';

export function DynamoDBPage() {
  const { currentInstance } = useConfigStore();
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [items, setItems] = useState<DynamoDBItem[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableKey, setNewTableKey] = useState('id');
  const [newItem, setNewItem] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dynamoService = currentInstance
    ? new DynamoDBService(new AWSClientFactory(currentInstance))
    : null;

  useEffect(() => {
    if (dynamoService) {
      loadTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInstance]);

  useEffect(() => {
    if (selectedTable && dynamoService) {
      loadItems(selectedTable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  const loadTables = async () => {
    if (!dynamoService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Loading DynamoDB tables', { instance: currentInstance?.name });
      const tableList = await dynamoService.listTables();
      setTables(tableList);
      logger.info('DynamoDB tables loaded successfully', { count: tableList.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tables';
      setError(message);
      logger.error('Failed to load DynamoDB tables', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (tableName: string) => {
    if (!dynamoService) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Scanning DynamoDB table', { table: tableName });
      const itemList = await dynamoService.scanTable(tableName);
      setItems(itemList);
      logger.info('DynamoDB items loaded successfully', {
        table: tableName,
        count: itemList.length
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load items';
      setError(message);
      logger.error('Failed to scan DynamoDB table', err as Error, { table: tableName });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!dynamoService || !newTableName.trim() || !newTableKey.trim()) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Creating DynamoDB table', {
        tableName: newTableName,
        keyName: newTableKey
      });
      await dynamoService.createTable(
        newTableName,
        [{ AttributeName: newTableKey, KeyType: 'HASH' }],
        [{ AttributeName: newTableKey, AttributeType: 'S' }]
      );
      setNewTableName('');
      setNewTableKey('id');
      await loadTables();
      logger.info('DynamoDB table created successfully', { tableName: newTableName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create table';
      setError(message);
      logger.error('Failed to create DynamoDB table', err as Error, {
        tableName: newTableName
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    if (!dynamoService || !confirm(`Delete table ${tableName}?`)) return;

    setLoading(true);
    setError(null);
    try {
      logger.info('Deleting DynamoDB table', { tableName });
      await dynamoService.deleteTable(tableName);
      if (selectedTable === tableName) {
        setSelectedTable(null);
        setItems([]);
      }
      await loadTables();
      logger.info('DynamoDB table deleted successfully', { tableName });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete table';
      setError(message);
      logger.error('Failed to delete DynamoDB table', err as Error, { tableName });
    } finally {
      setLoading(false);
    }
  };

  const handlePutItem = async () => {
    if (!dynamoService || !selectedTable) return;

    setLoading(true);
    setError(null);
    try {
      const item = JSON.parse(newItem);
      logger.info('Putting item to DynamoDB', { table: selectedTable });
      await dynamoService.putItem(selectedTable, item);
      setNewItem('{}');
      await loadItems(selectedTable);
      logger.info('Item added successfully', { table: selectedTable });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
      logger.error('Failed to put item', err as Error, { table: selectedTable });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: DynamoDBItem) => {
    if (!dynamoService || !selectedTable || !confirm('Delete this item?')) return;

    setLoading(true);
    setError(null);
    try {
      // Extract primary key from item (assuming first field is the key)
      const keyField = Object.keys(item)[0];
      const key = { [keyField]: item[keyField] };

      logger.info('Deleting DynamoDB item', { table: selectedTable, key });
      await dynamoService.deleteItem(selectedTable, key);
      await loadItems(selectedTable);
      logger.info('Item deleted successfully', { table: selectedTable });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
      logger.error('Failed to delete item', err as Error, { table: selectedTable });
    } finally {
      setLoading(false);
    }
  };

  if (!currentInstance) {
    return <div className="card">Please configure a LocalStack instance</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>DynamoDB</h1>

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
        {/* Tables List */}
        <div className="card">
          <h2>Tables</h2>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Table name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <input
              type="text"
              placeholder="Primary key name"
              value={newTableKey}
              onChange={(e) => setNewTableKey(e.target.value)}
              style={{ marginBottom: '0.5rem', width: '100%' }}
            />
            <button
              className="btn-primary"
              onClick={handleCreateTable}
              disabled={loading || !newTableName.trim() || !newTableKey.trim()}
              style={{ width: '100%' }}
            >
              <Plus size={16} /> Create Table
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {loading && tables.length === 0 ? (
              <p>Loading...</p>
            ) : (
              tables.map((table) => (
                <div
                  key={table}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedTable === table ? '#646cff33' : '#2a2a2a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTable(table)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} />
                    <span>{table}</span>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(table);
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

        {/* Items List */}
        <div className="card">
          <h2>Items {selectedTable && `in ${selectedTable}`}</h2>

          {selectedTable && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <textarea
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder='{"id": "123", "name": "Example"}'
                  rows={3}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-success"
                  onClick={handlePutItem}
                  disabled={loading}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={() => selectedTable && loadItems(selectedTable)}
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          )}

          {selectedTable ? (
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              {items.length === 0 ? (
                <p>No items found</p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#2a2a2a',
                      padding: '1rem',
                      borderRadius: '4px',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <pre style={{ margin: 0, flex: 1 }}>
                        {JSON.stringify(item, null, 2)}
                      </pre>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteItem(item)}
                        disabled={loading}
                        style={{ padding: '0.25rem 0.5rem', marginLeft: '1rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p style={{ marginTop: '1rem' }}>Select a table to view items</p>
          )}
        </div>
      </div>
    </div>
  );
}
