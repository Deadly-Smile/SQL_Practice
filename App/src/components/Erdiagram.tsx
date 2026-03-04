import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useDatabaseSchema } from '../hooks/useDatabaseSchema';
import type { DatabaseSchema } from '../hooks/useDatabaseSchema'
import type { DatabaseInstance } from '../db';
import './Erdiagram.css';

interface ERDiagramProps {
  db: DatabaseInstance | null;
  onClose: () => void;
}

/**
 * Generate Mermaid ER diagram syntax from schema
 */
function generateMermaidER(schema: DatabaseSchema): string {
  let mermaidCode = 'erDiagram\n';

  // Add tables with columns
  schema.tables.forEach(table => {
    mermaidCode += `    ${table.name} {\n`;
    table.columns.forEach(col => {
      const pkMarker = col.primaryKey ? ' PK' : '';
      const notNullMarker = col.notNull ? ' "NOT NULL"' : '';
      mermaidCode += `        ${col.type} ${col.name}${pkMarker}${notNullMarker}\n`;
    });
    mermaidCode += `    }\n`;
  });

  // Add relationships
  schema.tables.forEach(table => {
    table.foreignKeys.forEach(fk => {
      mermaidCode += `    ${fk.table} ||--o{ ${table.name} : "has"\n`;
    });
  });

  return mermaidCode;
}

export function ERDiagram({ db, onClose }: ERDiagramProps) {
  const { schema, isLoading, error } = useDatabaseSchema(db);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });
  }, []);

  useEffect(() => {
    if (!schema || !mermaidRef.current) return;

    const renderDiagram = async () => {
      try {
        const mermaidCode = generateMermaidER(schema);
        mermaidRef.current!.innerHTML = '';
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    };

    renderDiagram();
  }, [schema]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (isLoading) {
    return (
      <div className="er-diagram-modal" onClick={handleBackdropClick}>
        <div className="er-diagram-container">
          <div className="er-loading">Generating ER Diagram...</div>
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="er-diagram-modal" onClick={handleBackdropClick}>
        <div className="er-diagram-container">
          <div className="er-error">{error || 'No schema available'}</div>
          <button className="er-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="er-diagram-modal" onClick={handleBackdropClick}>
      <div className="er-diagram-container">
        <div className="er-diagram-header">
          <h2>📊 Database ER Diagram</h2>
          <button className="er-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="er-diagram-info">
          <span className="info-badge">{schema.tables.length} Tables</span>
          <span className="info-text">Entity Relationship Diagram</span>
        </div>

        <div className="er-diagram-content">
          <div ref={mermaidRef} className="mermaid-diagram" />
        </div>

        <div className="er-diagram-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="legend-marker pk">PK</span>
              <span>Primary Key</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker fk">→</span>
              <span>Foreign Key</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}