import React, { useState, useEffect } from 'react';
import EditorPane from './components/EditorPane';
import PreviewPane from './components/PreviewPane';
import { Download, Upload, RotateCcw, Eraser, Save, FolderOpen, X as CloseIcon, Sun, Moon, PenLine, Eye } from 'lucide-react';
import './App.css';

const defaultFields = [
  { id: 'role', name: '角色', value: '', phrases: ['资深全栈开发工程师', '经验丰富的产品经理', '拥有 10 年经验的专家', '专业的数据分析师', '资深文案策划', '耐心的教师'] },
  { id: 'objective', name: '目标', value: '', phrases: ['帮我写一段代码', '帮我总结这篇文章', '帮我翻译这段内容', '为我提供一些创意'] },
  { id: 'context', name: '背景', value: '', phrases: ['这是一个面向儿童的产品', '需要在资源受限的环境下运行', '用户群体主要是大学生'] },
  { id: 'constraints', name: '约束', value: '', phrases: ['字数控制在 500 字以内', '请使用中文回复', '语气要严谨客观', '解释要通俗易懂，避免专业术语', '不要包含任何解释性的废话', '请一步一步地思考'] },
  { id: 'format', name: '格式', value: '', phrases: ['请以 Markdown 格式输出', '请将结果整理成表格', '请严格输出为 JSON 格式', '请分点作答', '以代码块的形式展示', '使用大纲形式输出'] },
  { id: 'examples', name: '示例', value: '', phrases: ['输入：xxx，输出：yyy', '例如：...'] },
  { id: 'steps', name: '步骤', value: '', phrases: ['第一步：分析问题；第二步：给出方案', '1. 列出核心观点 2. 分别举例说明', '1. 发现错误 2. 提供修复代码 3. 解释原理'] },
];

function App() {
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem('promptFields');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultFields;
      }
    }
    return defaultFields;
  });

  const [savedPrompts, setSavedPrompts] = useState(() => {
    const saved = localStorage.getItem('savedPrompts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [showSavedPrompts, setShowSavedPrompts] = useState(false);
  const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('promptFields', JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFieldChange = (id, newValue) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
  };

  const handleAddField = (name) => {
    const newField = {
      id: 'custom_' + Date.now(),
      name,
      value: '',
      phrases: []
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleRenameField = (id, newName) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const handleReorderFields = (dragIndex, dropIndex) => {
    const newFields = [...fields];
    const draggedItem = newFields.splice(dragIndex, 1)[0];
    newFields.splice(dropIndex, 0, draggedItem);
    setFields(newFields);
  };

  const handleAddPhrase = (id, phrase) => {
    setFields(prev => prev.map(f => {
      if (f.id === id) {
        const newPhrases = f.phrases ? [...f.phrases, phrase] : [phrase];
        return { ...f, phrases: Array.from(new Set(newPhrases)) };
      }
      return f;
    }));
  };

  const handleDeletePhrase = (id, phraseIndex) => {
    setFields(prev => prev.map(f => {
      if (f.id === id && f.phrases) {
        const newPhrases = [...f.phrases];
        newPhrases.splice(phraseIndex, 1);
        return { ...f, phrases: newPhrases };
      }
      return f;
    }));
  };

  const handleEditPhrase = (id, phraseIndex, newText) => {
    setFields(prev => prev.map(f => {
      if (f.id === id && f.phrases) {
        const newPhrases = [...f.phrases];
        newPhrases[phraseIndex] = newText;
        return { ...f, phrases: newPhrases };
      }
      return f;
    }));
  };

  const handleReorderPhrases = (fieldId, dragIndex, dropIndex) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId && f.phrases) {
        const newPhrases = [...f.phrases];
        const draggedItem = newPhrases.splice(dragIndex, 1)[0];
        newPhrases.splice(dropIndex, 0, draggedItem);
        return { ...f, phrases: newPhrases };
      }
      return f;
    }));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fields, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "prompt_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedFields = JSON.parse(event.target.result);
        if (Array.isArray(importedFields)) {
          setFields(importedFields);
        } else {
          alert('无效的配置文件格式');
        }
      } catch (err) {
        alert('解析文件失败');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const handleResetDefaults = () => {
    if (window.confirm('确定要恢复默认配置吗？这将清空您当前的输入和自定义设置。')) {
      setFields(defaultFields);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有输入框的内容吗？')) {
      setFields(prev => prev.map(f => ({ ...f, value: '' })));
    }
  };

  const handleSaveCurrentPrompt = () => {
    const name = window.prompt('为当前提示词起个名字存为模板（如：小红书文案）：');
    if (name && name.trim()) {
      const newSaved = {
        id: 'saved_' + Date.now(),
        name: name.trim(),
        fields: JSON.parse(JSON.stringify(fields)) // deep copy
      };
      setSavedPrompts([...savedPrompts, newSaved]);
    }
  };

  const handleLoadPrompt = (savedPrompt) => {
    if (window.confirm(`确认要加载模板"${savedPrompt.name}"吗？这将覆盖当前的所有输入。`)) {
      setFields(savedPrompt.fields);
      setShowSavedPrompts(false);
    }
  };

  const handleDeleteSavedPrompt = (e, id) => {
    e.stopPropagation(); // prevent loading
    if (window.confirm('确定要删除这个模板吗？')) {
      setSavedPrompts(savedPrompts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="app-container">
      {/* ===== EDITOR PANE ===== */}
      <div className={`pane editor-pane ${mobileTab !== 'editor' ? 'mobile-hidden' : ''}`}>
        <div className="header" style={{ position: 'relative' }}>
          <h1>结构化提示词</h1>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 4px' }}></div>
            <button className="icon-btn" onClick={handleSaveCurrentPrompt} title="存为模板">
              <Save size={18} />
            </button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowSavedPrompts(!showSavedPrompts)} title="我的提示词">
                <FolderOpen size={18} />
              </button>
              {showSavedPrompts && (
                <div className="saved-prompts-dropdown">
                  {savedPrompts.length === 0 ? (
                    <div className="saved-prompt-empty">暂无保存的模板</div>
                  ) : (
                    savedPrompts.map(p => (
                      <div key={p.id} className="saved-prompt-item" onClick={() => handleLoadPrompt(p)}>
                        <span className="saved-prompt-name">{p.name}</span>
                        <button className="delete-btn" onClick={(e) => handleDeleteSavedPrompt(e, p.id)}>
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 4px' }}></div>
            <button className="icon-btn" onClick={handleClearAll} title="清空内容">
              <Eraser size={18} />
            </button>
            <button className="icon-btn" onClick={handleResetDefaults} title="恢复默认">
              <RotateCcw size={18} />
            </button>
            <button className="icon-btn mobile-hide" onClick={handleExport} title="导出配置">
              <Download size={18} />
            </button>
            <label className="icon-btn mobile-hide" style={{cursor: 'pointer'}} title="导入配置">
              <Upload size={18} />
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>
        </div>
        <EditorPane 
          fields={fields} 
          onFieldChange={handleFieldChange} 
          onAddField={handleAddField}
          onDeleteField={handleDeleteField}
          onRenameField={handleRenameField}
          onReorderFields={handleReorderFields}
          onAddPhrase={handleAddPhrase}
          onDeletePhrase={handleDeletePhrase}
          onEditPhrase={handleEditPhrase}
          onReorderPhrases={handleReorderPhrases}
        />
      </div>

      {/* ===== PREVIEW PANE ===== */}
      <div className={`pane preview-pane ${mobileTab !== 'preview' ? 'mobile-hidden' : ''}`}>
        <PreviewPane fields={fields} />
      </div>

      {/* ===== MOBILE TAB BAR ===== */}
      <div className="mobile-tab-bar">
        <button
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          <PenLine size={20} />
          <span>编辑</span>
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          <Eye size={20} />
          <span>预览</span>
        </button>
      </div>
    </div>
  );
}

export default App;
