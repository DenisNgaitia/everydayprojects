import { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import {
    addNote, updateNote, deleteNote, toggleNoteComplete, getUser,
} from '../utils/dataService';
import SubjectSidebar from '../components/Study/SubjectSidebar';
import NoteEditor from '../components/Study/NoteEditor';
import MarkdownRenderer from '../components/Study/MarkdownRenderer';
import FlashcardDeck from '../components/Study/FlashcardDeck';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Note Card (list item) ────────────────────────────────────────────────────

function NoteCard({ note, subject, isSelected, onClick, onDelete, onToggleComplete }) {
    const accentColor = subject?.color || 'var(--accent-purple)';
    const dateStr = note.updatedAt
        ? new Date(note.updatedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
        : '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col rounded-2xl cursor-pointer group transition-all"
            style={{
                background: isSelected ? `${accentColor}10` : 'var(--panel)',
                border: `1px solid ${isSelected ? accentColor : 'var(--border)'}`,
                boxShadow: isSelected ? `0 0 16px ${accentColor}22` : 'none',
            }}
            onClick={onClick}
        >
            <div className="flex items-start gap-3 px-4 py-3">
                {/* Completion toggle */}
                <button
                    id={`note-complete-${note.id}`}
                    onClick={e => { e.stopPropagation(); onToggleComplete(note.id); }}
                    className="shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                        borderColor: note.completed ? '#39ff14' : 'var(--border)',
                        background: note.completed ? '#39ff14' : 'transparent',
                    }}
                    aria-label={`Toggle note ${note.title} complete`}
                >
                    {note.completed && <span style={{ fontSize: '9px', color: '#000', fontWeight: 900 }}>✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                    <h4
                        className="text-[14px] font-semibold truncate mb-0.5"
                        style={{
                            color: note.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: note.completed ? 'line-through' : 'none',
                        }}
                    >
                        {note.title}
                    </h4>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {note.summary?.substring(0, 70)}…
                    </p>
                </div>

                <button
                    id={`note-delete-${note.id}`}
                    onClick={e => { e.stopPropagation(); onDelete(note.id); }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity text-[11px] w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    aria-label={`Delete note ${note.title}`}
                >
                    ×
                </button>
            </div>

            {/* Tags row */}
            {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {note.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
                        >
                            #{tag}
                        </span>
                    ))}
                    {dateStr && (
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                            {dateStr}
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}

// ─── Note Viewer ──────────────────────────────────────────────────────────────

function NoteViewer({ note, subject, onEdit, onClose }) {
    const [tab, setTab] = useState('content'); // 'content' | 'flashcards' | 'questions'
    const accentColor = subject?.color || 'var(--accent-purple)';

    const TABS = [
        { id: 'content', label: '📝 Content' },
        { id: 'flashcards', label: `🃏 Flashcards (${note.flashcards?.length || 0})` },
        { id: 'questions', label: `❓ Practice (${note.questions?.length || 0})` },
    ];

    return (
        <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Viewer header */}
            <div
                className="flex items-start justify-between gap-4 px-6 py-5 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {subject && (
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                style={{ color: accentColor, border: `1px solid ${accentColor}`, opacity: 0.9 }}
                            >
                                {subject.name}
                            </span>
                        )}
                        {note.completed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                style={{ color: '#39ff14', border: '1px solid #39ff14' }}>
                                Complete
                            </span>
                        )}
                    </div>
                    <h2 className="text-[20px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                        {note.title}
                    </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        id="note-viewer-edit"
                        onClick={onEdit}
                        className="btn-secondary text-[12px]"
                        style={{ padding: '6px 14px' }}
                    >
                        Edit
                    </button>
                    <button
                        id="note-viewer-close"
                        onClick={onClose}
                        className="text-[18px] leading-none"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="Close viewer"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Tab bar */}
            <div
                className="flex gap-1 px-6 py-3 shrink-0"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {TABS.map(t => (
                    <button
                        key={t.id}
                        id={`note-tab-${t.id}`}
                        onClick={() => setTab(t.id)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-full transition-all"
                        style={{
                            background: tab === t.id ? accentColor : 'var(--panel)',
                            color: tab === t.id ? '#000' : 'var(--text-secondary)',
                            border: tab === t.id ? 'none' : '1px solid var(--border)',
                            fontWeight: tab === t.id ? 700 : 500,
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
                <AnimatePresence mode="wait">
                    {tab === 'content' && (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <MarkdownRenderer content={note.content} />
                        </motion.div>
                    )}
                    {tab === 'flashcards' && (
                        <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <FlashcardDeck flashcards={note.flashcards} />
                        </motion.div>
                    )}
                    {tab === 'questions' && (
                        <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="flex flex-col gap-3">
                                {note.questions?.map((q, i) => (
                                    <details
                                        key={i}
                                        className="rounded-2xl overflow-hidden"
                                        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                                    >
                                        <summary
                                            className="flex items-center justify-between px-5 py-4 cursor-pointer text-[14px] font-medium list-none"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {q.question}
                                            <span style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s' }}>▾</span>
                                        </summary>
                                        <div
                                            className="px-5 pb-4 text-[13px] leading-relaxed"
                                            style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}
                                        >
                                            <p className="pt-3">{q.answer}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── StudyPage ────────────────────────────────────────────────────────────────

export default function StudyPage() {
    const { state, dispatch } = useAppContext();

    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);   // note object
    const [editingNote, setEditingNote] = useState(null);   // note object or 'new'
    const [searchQuery, setSearchQuery] = useState('');

    const study = state.study || { subjects: [], topics: [], notes: [] };
    const { subjects, topics, notes } = study;

    // ── Sync AppContext after any dataService mutation ────────────────────
    const syncStudy = useCallback((updated) => {
        dispatch({ type: 'UPDATE_STUDY', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
    }, [dispatch]);

    // ── Filtered notes based on sidebar selection + search ────────────────
    const visibleNotes = useMemo(() => {
        let pool = notes;
        if (selectedSubjectId === 'uncategorised') {
            pool = notes.filter(n => !n.subjectId);
        } else if (selectedSubjectId) {
            pool = selectedTopicId
                ? notes.filter(n => n.topicId === selectedTopicId)
                : notes.filter(n => n.subjectId === selectedSubjectId);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            pool = pool.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.content?.toLowerCase().includes(q) ||
                n.tags?.some(t => t.toLowerCase().includes(q))
            );
        }
        return pool;
    }, [notes, selectedSubjectId, selectedTopicId, searchQuery]);

    // ── Stats ─────────────────────────────────────────────────────────────
    const completedNotes = notes.filter(n => n.completed).length;
    const completedTopics = topics.filter(t => t.completed).length;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleSaveNote = ({ title, content, subjectId, topicId, tags }) => {
        if (editingNote && editingNote !== 'new') {
            const updated = updateNote(editingNote.id, { title, content, tags });
            syncStudy(updated);
            // Keep the viewer open on the updated note
            const freshNote = updated.notes.find(n => n.id === editingNote.id);
            setViewingNote(freshNote || null);
        } else {
            const updated = addNote(title, content, { subjectId, topicId, tags });
            syncStudy(updated);
            setViewingNote(updated.notes[0]);
        }
        setEditingNote(null);
    };

    const handleDeleteNote = (noteId) => {
        if (!confirm('Delete this note?')) return;
        const updated = deleteNote(noteId);
        syncStudy(updated);
        if (viewingNote?.id === noteId) setViewingNote(null);
    };

    const handleToggleComplete = (noteId) => {
        const updated = toggleNoteComplete(noteId);
        syncStudy(updated);
        if (viewingNote?.id === noteId) {
            setViewingNote(updated.notes.find(n => n.id === noteId) || null);
        }
    };

    // ── Derived: subject for a given note ─────────────────────────────────
    const subjectForNote = (note) => subjects.find(s => s.id === note?.subjectId) || null;

    // ── Progress summary ──────────────────────────────────────────────────
    const noteProgress = notes.length > 0 ? Math.round((completedNotes / notes.length) * 100) : 0;
    const topicProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

    return (
        <div
            className="flex"
            style={{
                height: 'calc(100vh - 80px)',
                maxWidth: '1200px',
                margin: 'auto',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--bg-primary)',
            }}
        >
            {/* ── Left Sidebar ─────────────────────────────────────────── */}
            <div className="shrink-0" style={{ width: '240px' }}>
                <SubjectSidebar
                    study={study}
                    selectedSubjectId={selectedSubjectId}
                    selectedTopicId={selectedTopicId}
                    onSelectSubject={setSelectedSubjectId}
                    onSelectTopic={setSelectedTopicId}
                    onStudyUpdate={syncStudy}
                />
            </div>

            {/* ── Centre: Note List ─────────────────────────────────────── */}
            <div
                className="flex flex-col shrink-0"
                style={{
                    width: '280px',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    overflowY: 'auto',
                }}
            >
                {/* Header */}
                <div className="px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Progress summary */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1 rounded-xl px-3 py-2 text-center"
                            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                            <p className="text-[18px] font-black" style={{ color: 'var(--accent-cyan)' }}>{noteProgress}%</p>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Notes done</p>
                        </div>
                        <div className="flex-1 rounded-xl px-3 py-2 text-center"
                            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                            <p className="text-[18px] font-black" style={{ color: 'var(--accent-purple)' }}>{topicProgress}%</p>
                            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Topics done</p>
                        </div>
                    </div>

                    {/* Search */}
                    <input
                        id="study-search"
                        type="text"
                        placeholder="Search notes…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input-field w-full text-[12px] mb-3"
                        style={{ padding: '8px 12px' }}
                    />

                    <button
                        id="study-new-note-btn"
                        onClick={() => { setEditingNote('new'); setViewingNote(null); }}
                        className="btn-primary w-full text-[13px]"
                        style={{ padding: '8px' }}
                    >
                        + New Note
                    </button>
                </div>

                {/* Note list */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    {visibleNotes.length === 0 ? (
                        <div className="text-center py-10" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            <div className="text-3xl mb-3">📝</div>
                            <p>No notes here yet.</p>
                            {!searchQuery && <p className="text-[11px] mt-1 opacity-60">Create one with the button above.</p>}
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {visibleNotes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    subject={subjectForNote(note)}
                                    isSelected={viewingNote?.id === note.id}
                                    onClick={() => { setViewingNote(note); setEditingNote(null); }}
                                    onDelete={handleDeleteNote}
                                    onToggleComplete={handleToggleComplete}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* ── Right: Main Panel (editor / viewer / empty state) ──────── */}
            <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <AnimatePresence mode="wait">
                    {editingNote ? (
                        <motion.div
                            key="editor"
                            className="h-full"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <NoteEditor
                                note={editingNote === 'new' ? null : editingNote}
                                subjects={subjects}
                                topics={topics}
                                defaultSubjectId={selectedSubjectId !== 'uncategorised' ? selectedSubjectId : null}
                                defaultTopicId={selectedTopicId}
                                onSave={handleSaveNote}
                                onCancel={() => setEditingNote(null)}
                            />
                        </motion.div>
                    ) : viewingNote ? (
                        <motion.div
                            key={`viewer-${viewingNote.id}`}
                            className="h-full"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <NoteViewer
                                note={viewingNote}
                                subject={subjectForNote(viewingNote)}
                                onEdit={() => setEditingNote(viewingNote)}
                                onClose={() => setViewingNote(null)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            className="h-full flex flex-col items-center justify-center gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-5xl">🎓</div>
                            <div className="text-center">
                                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
                                    Select a note or create one
                                </p>
                                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                                    Use the sidebar to organise by subject and topic.
                                </p>
                            </div>
                            <button
                                id="study-empty-new-btn"
                                onClick={() => setEditingNote('new')}
                                className="btn-primary"
                                style={{ marginTop: '8px' }}
                            >
                                + Create First Note
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}