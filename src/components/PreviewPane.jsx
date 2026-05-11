import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

function PreviewPane({ fields }) {
  const [copied, setCopied] = useState(false);
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    let generated = '';
    fields.forEach(field => {
      if (field.value.trim()) {
        generated += `**[${field.name}]**\n${field.value.trim()}\n\n`;
      }
    });
    setMarkdown(generated);
  }, [fields]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <button className="copy-btn primary" onClick={handleCopy} disabled={!markdown}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? '已复制' : '复制到剪贴板'}
      </button>
      
      {markdown ? (
        <div className="preview-content">
          {fields.map(field => {
            if (!field.value.trim()) return null;
            return (
              <div key={field.id} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>[{field.name}]</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{field.value}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          在左侧输入以实时预览提示词
        </div>
      )}
    </>
  );
}

export default PreviewPane;
