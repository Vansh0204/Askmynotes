import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, ChevronRight, BookOpen, MessageSquare,
  Trash2, Send, Info, ExternalLink, Lightbulb, Layout,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromFile, chunkText } from './utils/documentProcessor';
import { simulateLLMResponse, generateStudyMaterial } from './utils/llmSimulator';

const App = () => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState(1);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'study'
  const [subjects, setSubjects] = useState([
    { id: 1, name: '', files: [], chunks: [], chatHistory: [], studyMaterial: null },
    { id: 2, name: '', files: [], chunks: [], chatHistory: [], studyMaterial: null },
    { id: 3, name: '', files: [], chunks: [], chatHistory: [], studyMaterial: null },
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [subjects, activeSubjectId, viewMode]);

  const handleSubjectNameChange = (id, name) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleFileUpload = (id, e) => {
    const newFiles = Array.from(e.target.files);
    setSubjects(subjects.map(s => s.id === id ? {
      ...s,
      files: [...s.files, ...newFiles]
    } : s));
  };

  const removeFile = (subjectId, fileName) => {
    setSubjects(subjects.map(s => s.id === subjectId ? {
      ...s,
      files: s.files.filter(f => f.name !== fileName)
    } : s));
  };

  const processSetup = async () => {
    setLoading(true);
    const updatedSubjects = await Promise.all(subjects.map(async (subject) => {
      let allChunks = [];
      for (const file of subject.files) {
        const text = await extractTextFromFile(file);
        const chunks = chunkText(text, file.name);
        allChunks = [...allChunks, ...chunks];
      }
      return { ...subject, chunks: allChunks };
    }));
    setSubjects(updatedSubjects);
    setLoading(false);
    setSetupComplete(true);
  };

  const isSetupValid = subjects.every(s => s.name.trim() !== '' && s.files.length > 0);

  const activeSubject = subjects.find(s => s.id === activeSubjectId);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const query = inputValue;
    setInputValue('');

    // Add user message
    const updatedHistory = [...activeSubject.chatHistory, { role: 'user', content: query }];
    setSubjects(subjects.map(s => s.id === activeSubjectId ? { ...s, chatHistory: updatedHistory } : s));

    // Get AI response
    const response = await simulateLLMResponse(query, activeSubject.chunks, activeSubject.name);

    const finalHistory = [...updatedHistory, { role: 'assistant', ...response }];
    setSubjects(subjects.map(s => s.id === activeSubjectId ? { ...s, chatHistory: finalHistory } : s));
  };

  const handleGenerateStudy = async () => {
    setLoading(true);
    const material = await generateStudyMaterial(activeSubject.chunks, activeSubject.name);
    setSubjects(subjects.map(s => s.id === activeSubjectId ? { ...s, studyMaterial: material } : s));
    setLoading(false);
    setViewMode('study');
  };

  if (!setupComplete) {
    return (
      <div className="container animate-fade-in">
        <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
          <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>AskMyNotes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            The Subject-Scoped Study Copilot
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              className="glass"
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: subject.id * 0.1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: 'bold' }}>{subject.id}</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter Subject Name"
                  value={subject.name}
                  onChange={(e) => handleSubjectNameChange(subject.id, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '2px solid var(--glass-border)',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    width: '100%',
                    padding: '0.5rem 0',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '2rem',
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload PDF or TXT notes</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt"
                    onChange={(e) => handleFileUpload(subject.id, e)}
                    style={{ display: 'none' }}
                  />
                </label>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {subject.files.map(file => (
                    <motion.div
                      layout
                      key={file.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        border: '1px solid var(--glass-border)'
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <FileText size={16} color="#94a3b8" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                      </div>
                      <Trash2
                        size={16}
                        style={{ cursor: 'pointer', color: 'var(--danger)' }}
                        onClick={() => removeFile(subject.id, file.name)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', paddingBottom: '4rem' }}>
          <button
            className="btn-primary"
            disabled={!isSetupValid || loading}
            onClick={processSetup}
            style={{
              fontSize: '1.25rem',
              padding: '1rem 4rem',
              opacity: isSetupValid ? 1 : 0.5,
              cursor: (isSetupValid && !loading) ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Power Up Bot'} <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  // --- Main App Layout (Sidebar + Content) ---
  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div className="glass" style={{
        width: '280px',
        height: '100%',
        borderRadius: '0',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem'
      }}>
        <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>AskMyNotes</h2>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</p>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSubjectId(s.id)}
              style={{
                background: activeSubjectId === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                border: 'none',
                padding: '1rem',
                borderRadius: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                fontWeight: activeSubjectId === s.id ? '600' : '400'
              }}
            >
              <BookOpen size={18} />
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <button
            className="btn-primary"
            onClick={() => setSetupComplete(false)}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--glass-border)' }}
          >
            <Layout size={18} /> Reset Setup
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Top Header */}
        <div style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>{activeSubject.name}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeSubject.files.length} Notes Indexed</p>
          </div>

          <div className="glass" style={{ display: 'flex', padding: '0.25rem', borderRadius: '12px' }}>
            <button
              onClick={() => setViewMode('chat')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'chat' ? 'var(--primary)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <MessageSquare size={16} /> Chat
            </button>
            <button
              onClick={() => viewMode === 'study' ? null : handleGenerateStudy()}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'study' ? 'var(--primary)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              <Lightbulb size={16} /> Study Mode
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {viewMode === 'chat' ? (
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {activeSubject.chatHistory.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                  <h3>Ask anything about {activeSubject.name}</h3>
                  <p>I will answer strictly using your uploaded notes.</p>
                </div>
              )}

              {activeSubject.chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div className="glass" style={{
                    padding: '1.25rem',
                    background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    borderColor: msg.role === 'user' ? 'var(--primary)' : 'var(--glass-border)'
                  }}>
                    <p style={{ lineHeight: '1.6' }}>{msg.content || msg.answer}</p>

                    {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                      <div style={{
                        marginTop: '1.25rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Citations:</span>
                          {msg.citations.map((c, ci) => (
                            <span key={ci} style={{
                              background: 'rgba(255,255,255,0.1)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FileText size={10} /> {c.file} ({c.reference})
                            </span>
                          ))}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: msg.confidence === 'High' ? 'var(--accent)' : 'var(--text-muted)'
                        }}>
                          {msg.confidence === 'High' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          <span style={{ fontWeight: '600' }}>Confidence: {msg.confidence}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'assistant' && msg.evidence && msg.evidence.length > 0 && (
                    <details style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <summary style={{ cursor: 'pointer', outline: 'none' }}>View Supporting Evidence</summary>
                      <div className="glass" style={{ marginTop: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {msg.evidence.map((snippet, si) => (
                          <div key={si} style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                            "{snippet}..."
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Loader2 className="animate-spin" size={18} /> Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          ) : (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Study Material</h2>
                <button className="btn-primary" onClick={handleGenerateStudy} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Lightbulb size={18} />} Refresh Set
                </button>
              </div>

              {activeSubject.studyMaterial && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                  <section>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle2 /> Multiple Choice Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {activeSubject.studyMaterial.mcqs.map((q, i) => (
                        <div key={i} className="glass" style={{ padding: '1.5rem' }}>
                          <p style={{ fontWeight: '600', marginBottom: '1rem' }}>{i + 1}. {q.question}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {q.options.map((opt, oi) => (
                              <div key={oi} style={{
                                padding: '0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                fontSize: '0.9rem'
                              }}>
                                {opt}
                              </div>
                            ))}
                          </div>
                          <details style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <summary style={{ cursor: 'pointer', color: 'var(--accent)' }}>View Answer & Explanation</summary>
                            <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                              <p><strong>Correct Option:</strong> {q.options[q.correct]}</p>
                              <p style={{ marginTop: '0.5rem' }}>{q.explanation}</p>
                              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Source: {q.citation}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookOpen size={18} /> Short Answer Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {activeSubject.studyMaterial.shortAnswers.map((q, i) => (
                        <div key={i} className="glass" style={{ padding: '1.5rem' }}>
                          <p style={{ fontWeight: '600', marginBottom: '1rem' }}>{i + 1}. {q.question}</p>
                          <details>
                            <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>View Model Answer</summary>
                            <div style={{ marginTop: '0.5rem', padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', lineHeight: '1.6' }}>
                              {q.answer}
                              <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Source: {q.citation}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar (Only in Chat) */}
        {viewMode === 'chat' && (
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              display: 'flex',
              gap: '1rem',
              position: 'relative'
            }}>
              <input
                type="text"
                placeholder={`Ask a question about ${activeSubject.name}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
              <button
                className="btn-primary"
                onClick={sendMessage}
                style={{ padding: '0 2rem' }}
              >
                <Send size={20} />
              </button>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={10} /> Answers are strictly grounded in your {activeSubject.name} notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
