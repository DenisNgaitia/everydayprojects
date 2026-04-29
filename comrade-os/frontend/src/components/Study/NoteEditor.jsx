/**
 * NoteEditor.jsx
 * Create + Edit panel for notes.
 * Features: title, subject/topic selectors, tag input,
 * markdown textarea with live preview toggle, save/cancel.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from './MarkdownRenderer';

const PLACEHOLDER = `## Topic Overview

Write your notes here using **markdown**.

### Key Concepts
- Concept one
- Concept two

### Code Example
\`\`\`
function example() {
  return "hello comrade";
}
\`\`\`

> Important insight to remember.
`;

export default function NoteEditor({
    note,           // null = creating new note
    subjects,
    topics,
    defaultSubjectId,
    defaultTopicId,
    onSave,
    onCancel,
}) {
    const isEditing = !!note;

    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [subjectId, setSubjectId] = useState(
        note?.subjectId ?? defaultSubjectId ?? null
    );
    const [topicId, setTopicId] = useState(
        note?.topicId ?? defaultTopicId ?? null
    );
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState(note?.tags || []);
    const [preview, setPreview] = useState(false);
    const [errors, setErrors] = useState({});

    // When selected subject changes, reset topic if it doesn't belong to the subject
    useEffect(() => {
        if (topicId) {
            const topic = topics.find(t => t.id === topicId);
            if (!topic || topic.subjectId !== subjectId) setTopicId(null);
        }
    }, [subjectId]);

    const filteredTopics = topics.filter(t => t.subjectId === subjectId);

    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = 'Title is required';
        if (!content.trim()) e.content = 'Content cannot be empty';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({
            title: title.trim(),
            content: content.trim(),
            subjectId: subjectId || null,
            topicId: topicId || null,
            tags,
        });
    };

    const addTag = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const cleaned = tagInput.trim().replace(/^,/, '').trim();
            if (cleaned && !tags.includes(cleaned)) {
                setTags(prev => [...prev, cleaned]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

    return (
        <div className="flex flex-col h-full">
            {/* ── Editor Header ────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                <h2
                    className="text-[15px] font-bold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {isEditing ? 'Edit Note' : 'New Note'}
                </h2>
                <div className="flex items-center gap-2">
                    {/* Preview toggle */}
                    <button
                        id="note-preview-toggle"
                        onClick={() => setPreview(v => !v)}
                        className="text-[12px] px-3 py-1.5 rounded-full transition-all"
                        style={{
                            background: preview ? 'var(--accent-purple)' : 'var(--panel)',
                            color: preview ? '#fff' : 'var(--text-secondary)',
                            border: preview ? 'none' : '1px solid var(--border)',
                        }}
                    >
                        {preview ? '✏️ Edit' : '👁 Preview'}
                    </button>
                    <button
                        id="note-cancel-btn"
                        onClick={onCancel}
                        className="btn-secondary text-[12px]"
                        style={{ padding: '6px 14px' }}
                    >
                        Cancel
                    </button>
                    <button
                        id="note-save-btn"
                        onClick={handleSave}
                        className="btn-primary text-[12px]"
                        style={{ padding: '6px 14px' }}
                    >
                        {isEditing ? 'Update' : 'Save Note'}
                    </button>
                </div>
            </div>

            {/* ── Meta fields ──────────────────────────────────────────── */}
            <div
                className="grid grid-cols-2 gap-3 px-6 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {/* Title */}
                <div className="col-span-2">
                    <input
                        id="note-title"
                        type="text"
                        placeholder="Note title…"
                        value={title}
                        onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: null })); }}
                        className="input-field w-full"
                        style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            borderColor: errors.title ? 'var(--accent-pink)' : undefined,
                        }}
                    />
                    {errors.title && (
                        <p className="text-[11px] mt-1" style={{ color: 'var(--accent-pink)' }}>{errors.title}</p>
                    )}
                </div>

                {/* Subject selector */}
                <div>
                    <p className="label mb-1">Subject</p>
                    <select
                        id="note-subject"
                        value={subjectId ?? ''}
                        onChange={e => setSubjectId(e.target.value ? Number(e.target.value) : null)}
                        className="input-field w-full text-[13px]"
                    >
                        <option value="">— No subject —</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Topic selector */}
                <div>
                    <p className="label mb-1">Topic</p>
                    <select
                        id="note-topic"
                        value={topicId ?? ''}
                        onChange={e => setTopicId(e.target.value ? Number(e.target.value) : null)}
                        className="input-field w-full text-[13px]"
                        disabled={!subjectId || filteredTopics.length === 0}
                    >
                        <option value="">— No topic —</option>
                        {filteredTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Tags */}
                <div className="col-span-2">
                    <p className="label mb-1">Tags <span style={{ opacity: 0.5, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— press Enter or comma to add</span></p>
                    <div className="flex flex-wrap gap-1.5 items-center input-field" style={{ minHeight: '38px', padding: '6px 12px' }}>
                        {tags.map(tag => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--accent-purple)', color: '#fff', fontWeight: 600 }}
                            >
                                #{tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="text-[10px] leading-none"
                                    style={{ opacity: 0.7 }}
                                    aria-label={`Remove tag ${tag}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            id="note-tag-input"
                            type="text"
                            placeholder={tags.length === 0 ? 'e.g. calculus, exam' : ''}
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                            className="flex-1 bg-transparent outline-none text-[13px]"
                            style={{ minWidth: '80px', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Content area ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {preview ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto px-8 py-6"
                        >
                            {content.trim() ? (
                                <MarkdownRenderer content={content} />
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Nothing to preview yet — write something in the editor.
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            <textarea
                                id="note-content"
                                value={content}
                                onChange={e => { setContent(e.target.value); if (errors.content) setErrors(p => ({ ...p, content: null })); }}
                                placeholder={PLACEHOLDER}
                                className="flex-1 resize-none bg-transparent outline-none px-8 py-6 font-mono text-[13px] leading-relaxed"
                                style={{
                                    color: 'var(--text-primary)',
                                    caretColor: 'var(--accent-cyan)',
                                    borderColor: errors.content ? 'var(--accent-pink)' : undefined,
                                }}
                                spellCheck={false}
                            />
                            {errors.content && (
                                <p className="text-[11px] px-8 pb-2" style={{ color: 'var(--accent-pink)' }}>{errors.content}</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
