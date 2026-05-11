import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

const AutoResizeTextarea = ({ value, onChange, placeholder }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      style={{ overflow: 'hidden', resize: 'none' }}
    />
  );
};

function EditorPane({ fields, onFieldChange, onAddField, onDeleteField, onAddPhrase, onDeletePhrase, onEditPhrase }) {
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);
  
  const [addingPhraseFor, setAddingPhraseFor] = useState(null);
  const [newPhraseText, setNewPhraseText] = useState('');

  const [editingPhrase, setEditingPhrase] = useState(null); // { fieldId, index, text }

  const handleAddField = () => {
    if (newFieldName.trim()) {
      onAddField(newFieldName.trim());
      setNewFieldName('');
      setIsAddingField(false);
    }
  };

  const handlePhraseClick = (fieldId, phrase, currentValue) => {
    const space = currentValue ? (currentValue.endsWith('\n') ? '' : '\n') : '';
    onFieldChange(fieldId, currentValue + space + phrase);
  };

  const submitNewPhrase = (fieldId) => {
    if (newPhraseText.trim()) {
      onAddPhrase(fieldId, newPhraseText.trim());
    }
    setAddingPhraseFor(null);
    setNewPhraseText('');
  };

  const submitEditPhrase = () => {
    if (editingPhrase && editingPhrase.text.trim()) {
      onEditPhrase(editingPhrase.fieldId, editingPhrase.index, editingPhrase.text.trim());
    } else if (editingPhrase && !editingPhrase.text.trim()) {
      // If empty, delete it
      onDeletePhrase(editingPhrase.fieldId, editingPhrase.index);
    }
    setEditingPhrase(null);
  };

  return (
    <div className="editor-form">
      {fields.map(field => (
        <div key={field.id} className="field-group">
          <div className="field-header">
            <label className="label">{field.name}</label>
            {field.isCustom && (
              <button className="icon-btn" onClick={() => onDeleteField(field.id)} title="删除要素">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <AutoResizeTextarea
            value={field.value}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={`请输入${field.name}...`}
          />
          {(field.phrases && field.phrases.length > 0) || true ? (
            <div className="phrases-list">
              {field.phrases?.map((phrase, index) => {
                const isEditing = editingPhrase?.fieldId === field.id && editingPhrase?.index === index;
                if (isEditing) {
                  return (
                    <input
                      key={index}
                      type="text"
                      autoFocus
                      className="phrase-edit-input"
                      value={editingPhrase.text}
                      onChange={(e) => setEditingPhrase({ ...editingPhrase, text: e.target.value })}
                      onBlur={submitEditPhrase}
                      onKeyDown={(e) => e.key === 'Enter' && submitEditPhrase()}
                    />
                  );
                }
                return (
                  <span 
                    key={index} 
                    className="phrase-chip phrase-chip-editable"
                    onClick={() => handlePhraseClick(field.id, phrase, field.value)}
                    onDoubleClick={() => setEditingPhrase({ fieldId: field.id, index, text: phrase })}
                    title="单击插入，双击修改"
                  >
                    {phrase}
                    <button 
                      className="phrase-delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePhrase(field.id, index);
                      }}
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
              {addingPhraseFor === field.id ? (
                <input
                  type="text"
                  autoFocus
                  value={newPhraseText}
                  onChange={(e) => setNewPhraseText(e.target.value)}
                  onBlur={() => submitNewPhrase(field.id)}
                  onKeyDown={(e) => e.key === 'Enter' && submitNewPhrase(field.id)}
                  placeholder="输入短语后回车"
                  style={{ padding: '2px 8px', fontSize: '12px', width: '120px', borderRadius: '100px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              ) : (
                <span 
                  className="phrase-chip"
                  style={{ borderStyle: 'dashed', opacity: 0.6 }}
                  onClick={() => setAddingPhraseFor(field.id)}
                >
                  <Plus size={10} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} /> 添加
                </span>
              )}
            </div>
          ) : null}
        </div>
      ))}

      <div className="add-field-container" style={{ marginTop: '24px' }}>
        {isAddingField ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={newFieldName} 
              onChange={(e) => setNewFieldName(e.target.value)} 
              placeholder="自定义要素名称 (例如: 语气)"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
            />
            <button className="primary" onClick={handleAddField}>添加</button>
            <button onClick={() => setIsAddingField(false)}>取消</button>
          </div>
        ) : (
          <button style={{ width: '100%', padding: '12px', borderStyle: 'dashed' }} onClick={() => setIsAddingField(true)}>
            <Plus size={16} /> 添加自定义要素
          </button>
        )}
      </div>
    </div>
  );
}

export default EditorPane;
