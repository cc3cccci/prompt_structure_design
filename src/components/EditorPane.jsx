import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Trash2, GripVertical, Edit2, Eraser } from 'lucide-react';

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

function EditorPane({ fields, onFieldChange, onAddField, onDeleteField, onRenameField, onReorderFields, onAddPhrase, onDeletePhrase, onEditPhrase, onReorderPhrases }) {
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);
  
  const [addingPhraseFor, setAddingPhraseFor] = useState(null);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [editingPhrase, setEditingPhrase] = useState(null); // { fieldId, index, text }
  const [editingFieldNameId, setEditingFieldNameId] = useState(null);
  const [editingFieldNameText, setEditingFieldNameText] = useState('');

  // Drag states for fields
  const [draggingFieldIdx, setDraggingFieldIdx] = useState(null);
  const [dragOverFieldIdx, setDragOverFieldIdx] = useState(null);

  // Drag states for phrases
  const [draggingPhrase, setDraggingPhrase] = useState(null); // { fieldId, index }
  const [dragOverPhrase, setDragOverPhrase] = useState(null); // { fieldId, index }

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
      onDeletePhrase(editingPhrase.fieldId, editingPhrase.index);
    }
    setEditingPhrase(null);
  };

  const submitRenameField = () => {
    if (editingFieldNameId && editingFieldNameText.trim()) {
      onRenameField(editingFieldNameId, editingFieldNameText.trim());
    }
    setEditingFieldNameId(null);
  };

  return (
    <div className="editor-form">
      {fields.map((field, index) => (
        <div 
          key={field.id} 
          className={`field-group ${draggingFieldIdx === index ? 'dragging' : ''} ${dragOverFieldIdx === index ? 'drag-over' : ''}`}
          draggable
          onDragStart={(e) => {
            setDraggingFieldIdx(index);
            e.dataTransfer.effectAllowed = 'move';
            // Need to set data to allow drag in some browsers
            e.dataTransfer.setData('text/plain', index);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggingFieldIdx !== null && draggingFieldIdx !== index) {
              setDragOverFieldIdx(index);
            }
          }}
          onDragLeave={() => setDragOverFieldIdx(null)}
          onDrop={(e) => {
            e.preventDefault();
            if (draggingFieldIdx !== null && draggingFieldIdx !== index) {
              onReorderFields(draggingFieldIdx, index);
            }
            setDraggingFieldIdx(null);
            setDragOverFieldIdx(null);
          }}
          onDragEnd={() => {
            setDraggingFieldIdx(null);
            setDragOverFieldIdx(null);
          }}
        >
          <div className="field-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="drag-handle" title="按住拖动排序">
                <GripVertical size={16} />
              </div>
              {editingFieldNameId === field.id ? (
                <input
                  type="text"
                  autoFocus
                  className="field-title-edit"
                  value={editingFieldNameText}
                  onChange={(e) => setEditingFieldNameText(e.target.value)}
                  onBlur={submitRenameField}
                  onKeyDown={(e) => e.key === 'Enter' && submitRenameField()}
                />
              ) : (
                <label 
                  className="label" 
                  style={{ margin: 0, cursor: 'text' }}
                  onDoubleClick={() => {
                    setEditingFieldNameId(field.id);
                    setEditingFieldNameText(field.name);
                  }}
                  title="双击改名"
                >
                  {field.name}
                  <button 
                    className="icon-btn" 
                    style={{ padding: '2px', marginLeft: '6px', opacity: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFieldNameId(field.id);
                      setEditingFieldNameText(field.name);
                    }}
                  >
                    <Edit2 size={12} />
                  </button>
                </label>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="icon-btn" onClick={() => onFieldChange(field.id, '')} title="清空内容">
                <Eraser size={16} />
              </button>
              <button className="icon-btn" onClick={() => onDeleteField(field.id)} title="删除区块">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <AutoResizeTextarea
            value={field.value}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            placeholder={`请输入${field.name}...`}
          />
          
          <div className="phrases-list" onDragOver={e => e.preventDefault()}>
            {field.phrases?.map((phrase, pIndex) => {
              const isEditing = editingPhrase?.fieldId === field.id && editingPhrase?.index === pIndex;
              const isDragging = draggingPhrase?.fieldId === field.id && draggingPhrase?.index === pIndex;
              const isDragOver = dragOverPhrase?.fieldId === field.id && dragOverPhrase?.index === pIndex;

              if (isEditing) {
                return (
                  <input
                    key={pIndex}
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
                  key={pIndex} 
                  className={`phrase-chip phrase-chip-editable ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggingPhrase({ fieldId: field.id, index: pIndex });
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggingPhrase?.fieldId === field.id && draggingPhrase?.index !== pIndex) {
                      setDragOverPhrase({ fieldId: field.id, index: pIndex });
                    }
                  }}
                  onDragLeave={() => setDragOverPhrase(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggingPhrase?.fieldId === field.id && draggingPhrase?.index !== pIndex) {
                      onReorderPhrases(field.id, draggingPhrase.index, pIndex);
                    }
                    setDraggingPhrase(null);
                    setDragOverPhrase(null);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggingPhrase(null);
                    setDragOverPhrase(null);
                  }}
                  onClick={() => handlePhraseClick(field.id, phrase, field.value)}
                  onDoubleClick={() => setEditingPhrase({ fieldId: field.id, index: pIndex, text: phrase })}
                  title="单击插入，双击修改，拖动排序"
                >
                  {phrase}
                  <button 
                    className="phrase-delete-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhrase(field.id, pIndex);
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            
            {addingPhraseFor === field.id ? (
              <input
                type="text"
                autoFocus
                className="phrase-edit-input"
                value={newPhraseText}
                onChange={(e) => setNewPhraseText(e.target.value)}
                onBlur={() => submitNewPhrase(field.id)}
                onKeyDown={(e) => e.key === 'Enter' && submitNewPhrase(field.id)}
                placeholder="输入短语回车"
              />
            ) : (
              <span 
                className="phrase-chip"
                style={{ borderStyle: 'dashed', opacity: 0.6 }}
                onClick={() => setAddingPhraseFor(field.id)}
              >
                <Plus size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> 添加
              </span>
            )}
          </div>
        </div>
      ))}

      <div className="add-field-container" style={{ marginTop: '24px', paddingBottom: '40px' }}>
        {isAddingField ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={newFieldName} 
              onChange={(e) => setNewFieldName(e.target.value)} 
              placeholder="自定义要素名称 (例如: 语气)"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddField()}
              style={{ flex: 1, background: 'var(--panel-bg)' }}
            />
            <button className="primary" onClick={handleAddField}>添加</button>
            <button onClick={() => setIsAddingField(false)}>取消</button>
          </div>
        ) : (
          <button style={{ width: '100%', padding: '14px', borderStyle: 'dashed' }} onClick={() => setIsAddingField(true)}>
            <Plus size={18} /> 新增要素区块
          </button>
        )}
      </div>
    </div>
  );
}

export default EditorPane;
