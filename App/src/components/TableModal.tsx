import React, { useState } from 'react';
import type { TableSchema } from '../db';
import './TableModal.css';

interface TableModalProps {
  tableInfo: TableSchema;
  onClose: () => void;
}

type TabType = 'data' | 'properties';

export function TableModal({ tableInfo, onClose }: TableModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="table-modal-backdrop" onClick={handleBackdropClick}>
      <div className="table-modal">
        <div className="table-modal-header">
          <h2>📊 {tableInfo.tableName}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="table-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            📋 Data
          </button>
          <button
            className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            🔧 Properties
          </button>
        </div>

        <div className="table-modal-content">
          {activeTab === 'data' && (
            <div className="data-tab">
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      {tableInfo.columns.map((col) => (
                        <th key={col.name}>{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableInfo.data.length === 0 ? (
                      <tr>
                        <td colSpan={tableInfo.columns.length} className="empty-cell">
                          No data in this table
                        </td>
                      </tr>
                    ) : (
                      tableInfo.data.map((row, idx) => (
                        <tr key={idx}>
                          {tableInfo.columns.map((col) => (
                            <td key={col.name}>
                              {row[col.name] !== null && row[col.name] !== undefined
                                ? String(row[col.name])
                                : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="row-count">
                  {tableInfo.data.length} row{tableInfo.data.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="properties-tab">
              <div className="properties-header">
                <h3>Column Properties</h3>
                <p className="properties-description">
                  Detailed information about each column in the table
                </p>
              </div>
              <div className="properties-grid">
                {tableInfo.columns.map((col) => (
                  <div key={col.name} className="property-card">
                    <div className="property-name">
                      {col.name}
                      {col.pk === 1 && <span className="pk-badge">PK</span>}
                    </div>
                    <div className="property-details">
                      <div className="property-row">
                        <span className="property-label">Type:</span>
                        <span className="property-value">{col.type || 'ANY'}</span>
                      </div>
                      <div className="property-row">
                        <span className="property-label">Nullable:</span>
                        <span className="property-value">
                          {col.notnull === 0 ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {col.dflt_value !== null && (
                        <div className="property-row">
                          <span className="property-label">Default:</span>
                          <span className="property-value">{col.dflt_value}</span>
                        </div>
                      )}
                      <div className="property-row">
                        <span className="property-label">Primary Key:</span>
                        <span className="property-value">
                          {col.pk === 1 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
