import { useState, useEffect } from 'react';
import type { DatabaseInstance, TableSchema } from '../../db';
import { getTableNames, getCompleteTableInfo } from '../../db';
import { TableModal } from '../TableModal';
import './DatabaseExplorer.css';

interface DatabaseExplorerProps {
  db: DatabaseInstance | null;
}

export function DatabaseExplorer({ db }: DatabaseExplorerProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (db) {
      const tableNames = getTableNames(db);
      setTables(tableNames);
    }
  }, [db]);

  const handleTableClick = (tableName: string) => {
    if (db) {
      const tableInfo = getCompleteTableInfo(db, tableName);
      console.log("This is the table data:", tableInfo);
      setSelectedTable(tableInfo);
    }
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
  };

  const handleRefresh = () => {
    if (db) {
      const tableNames = getTableNames(db);
      setTables(tableNames);
    }
  };

  if (!db) {
    return null;
  }

  return (
    <>
      <div className={`database-explorer ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="explorer-header">
          <div className="explorer-title">
            <span className="explorer-icon">🗄️</span>
            {isExpanded && <h3>Database Tables</h3>}
          </div>
          <div className="explorer-actions">
            {isExpanded && (
              <button
                className="icon-btn"
                onClick={handleRefresh}
                title="Refresh tables"
              >
                🔄
              </button>
            )}
            <button
              className="icon-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="explorer-content">
            {tables.length === 0 ? (
              <div className="empty-tables">
                <p>No tables found</p>
              </div>
            ) : (
              <div className="tables-list">
                {tables.map((tableName) => (
                  <div
                    key={tableName}
                    className="table-item"
                    onClick={() => handleTableClick(tableName)}
                  >
                    <span className="table-icon">📋</span>
                    <span className="table-name">{tableName}</span>
                    <span className="view-icon">👁️</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTable && (
        <TableModal tableInfo={selectedTable} onClose={handleCloseModal} />
      )}
    </>
  );
}
