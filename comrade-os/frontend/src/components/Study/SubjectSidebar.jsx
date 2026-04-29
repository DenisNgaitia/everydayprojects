/**
 * SubjectSidebar.jsx
 * Left-hand panel: subjects list → collapsible topics per subject.
 * Includes completion ring per subject, inline add-forms, and selection state.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    addSubject, addTopic, deleteSubject, deleteTopic, toggleTopicComplete
} from '../../utils/dataService';

// ─── Completion Ring ──────────────────────────────────────────────────────────

function CompletionRing({ done, total, color }) {
    const r = 10;
    const circ = 2 * Math.PI * r;
    const pct = total > 0 ? done / total : 0;
    const offset = circ - pct * circ;
    return (
        <svg width="28" height="28" className="-rotate-90 shrink-0">
            <circle cx="14" cy="14" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
                cx="14" cy="14" r={r}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 3px ${color})` }}
            />
        </svg>
    );
}

// ─── Topic Row ────────────────────────────────────────────────────────────────

function TopicRow({ topic, isSelected, onClick, onToggle, onDelete }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer group"
            style={{
                background: isSelected ? 'var(--border)' : 'transparent',
                borderLeft: isSelected ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            }}
            onClick={onClick}
        >
            {/* Completion checkbox */}
            <button
                id={`topic-check-${topic.id}`}
                onClick={e => { e.stopPropagation(); onToggle(topic.id); }}
                className="shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                style={{
                    borderColor: topic.completed ? 'var(--accent-cyan)' : 'var(--border)',
                    background: topic.completed ? 'var(--accent-cyan)' : 'transparent',
                }}
                aria-label={`Toggle ${topic.name} complete`}
            >
                {topic.completed && <span style={{ fontSize: '8px', color: '#000', fontWeight: 800 }}>✓</span>}
            </button>

            <span
                className="flex-1 text-[13px] truncate"
                style={{
                    color: topic.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: topic.completed ? 'line-through' : 'none',
                    opacity: topic.completed ? 0.6 : 1,
                }}
            >
                {topic.name}
            </span>

            <button
                onClick={e => { e.stopPropagation(); onDelete(topic.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                aria-label={`Delete topic ${topic.name}`}
            >
                ×
            </button>
        </motion.div>
    );
}

// ─── Subject Block ────────────────────────────────────────────────────────────

function SubjectBlock({
    subject, topics, notes,
    selectedTopicId, selectedSubjectId,
    onSelectSubject, onSelectTopic,
    onStudyUpdate
}) {
    const [open, setOpen] = useState(true);
    const [addingTopic, setAddingTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');

    const subjectTopics = topics.filter(t => t.subjectId === subject.id);
    const subjectNotes  = notes.filter(n => n.subjectId === subject.id);
    const completedTopics = subjectTopics.filter(t => t.completed).length;
    const isSelected = selectedSubjectId === subject.id && selectedTopicId == null;

    const handleAddTopic = (e) => {
        e.preventDefault();
        if (!newTopicName.trim()) return;
        const updated = addTopic(subject.id, newTopicName.trim());
        onStudyUpdate(updated);
        setNewTopicName('');
        setAddingTopic(false);
    };

    const handleDeleteSubject = (e) => {
        e.stopPropagation();
        if (!confirm(`Delete "${subject.name}" and all its topics and notes?`)) return;
        const updated = deleteSubject(subject.id);
        onStudyUpdate(updated);
    };

    const handleToggleTopic = (topicId) => {
        const updated = toggleTopicComplete(topicId);
        onStudyUpdate(updated);
    };

    const handleDeleteTopic = (topicId) => {
        if (!confirm('Delete this topic and its notes?')) return;
        const updated = deleteTopic(topicId);
        onStudyUpdate(updated);
    };

    return (
        <div>
            {/* Subject header */}
            <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group"
                style={{
                    background: isSelected ? `${subject.color}14` : 'transparent',
                    border: isSelected ? `1px solid ${subject.color}40` : '1px solid transparent',
                }}
                onClick={() => { onSelectSubject(subject.id); onSelectTopic(null); }}
            >
                <CompletionRing
                    done={completedTopics}
                    total={subjectTopics.length}
                    color={subject.color}
                />
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: subject.color }}>
                        {subject.name}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {subjectTopics.length} topic{subjectTopics.length !== 1 ? 's' : ''} · {subjectNotes.length} note{subjectNotes.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        id={`subject-add-topic-${subject.id}`}
                        onClick={e => { e.stopPropagation(); setAddingTopic(v => !v); }}
                        className="text-[11px] w-5 h-5 flex items-center justify-center rounded-full"
                        style={{ color: subject.color, border: `1px solid ${subject.color}` }}
                        aria-label="Add topic"
                    >
                        +
                    </button>
                    <button
                        id={`subject-delete-${subject.id}`}
                        onClick={handleDeleteSubject}
                        className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                        aria-label="Delete subject"
                    >
                        ×
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
                        className="text-[10px]"
                        style={{ color: 'var(--text-secondary)', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
                        aria-label={open ? 'Collapse' : 'Expand'}
                    >
                        ▾
                    </button>
                </div>
            </div>

            {/* Add topic form */}
            <AnimatePresence>
                {addingTopic && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleAddTopic}
                        className="flex gap-2 px-3 py-2"
                    >
                        <input
                            autoFocus
                            type="text"
                            placeholder="Topic name…"
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.target.value)}
                            className="input-field flex-1 text-[12px]"
                            style={{ padding: '6px 10px' }}
                        />
                        <button type="submit" className="btn-primary text-[11px]" style={{ padding: '6px 10px' }}>Add</button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Topics */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pl-3 flex flex-col gap-0.5 mt-0.5"
                    >
                        <AnimatePresence initial={false}>
                            {subjectTopics.map(topic => (
                                <TopicRow
                                    key={topic.id}
                                    topic={topic}
                                    isSelected={selectedTopicId === topic.id}
                                    onClick={() => { onSelectSubject(subject.id); onSelectTopic(topic.id); }}
                                    onToggle={handleToggleTopic}
                                    onDelete={handleDeleteTopic}
                                />
                            ))}
                        </AnimatePresence>
                        {subjectTopics.length === 0 && (
                            <p className="text-[11px] px-3 py-1" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                                No topics yet
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── SubjectSidebar ───────────────────────────────────────────────────────────

export default function SubjectSidebar({
    study,
    selectedSubjectId,
    selectedTopicId,
    onSelectSubject,
    onSelectTopic,
    onStudyUpdate,
}) {
    const [addingSubject, setAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    const { subjects = [], topics = [], notes = [] } = study;
    const uncategorisedNotes = notes.filter(n => !n.subjectId);

    const handleAddSubject = (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;
        const updated = addSubject(newSubjectName.trim());
        onStudyUpdate(updated);
        setNewSubjectName('');
        setAddingSubject(false);
    };

    return (
        <aside
            className="flex flex-col h-full"
            style={{
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                overflowY: 'auto',
            }}
        >
            {/* Sidebar header */}
            <div
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                <h2 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    Subjects
                </h2>
                <button
                    id="sidebar-add-subject"
                    onClick={() => setAddingSubject(v => !v)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-[14px] transition-all"
                    style={{
                        color: 'var(--accent-cyan)',
                        border: '1px solid var(--accent-cyan)',
                    }}
                    aria-label="Add subject"
                >
                    +
                </button>
            </div>

            {/* Add subject form */}
            <AnimatePresence>
                {addingSubject && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleAddSubject}
                        className="flex gap-2 px-4 py-3"
                        style={{ borderBottom: '1px solid var(--border)' }}
                    >
                        <input
                            autoFocus
                            type="text"
                            placeholder="Subject name…"
                            value={newSubjectName}
                            onChange={e => setNewSubjectName(e.target.value)}
                            className="input-field flex-1 text-[12px]"
                            style={{ padding: '6px 10px' }}
                        />
                        <button type="submit" className="btn-primary text-[11px]" style={{ padding: '6px 10px' }}>Add</button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* "All Notes" shortcut */}
            <button
                id="sidebar-all-notes"
                onClick={() => { onSelectSubject(null); onSelectTopic(null); }}
                className="flex items-center gap-3 px-4 py-3 text-left transition-all"
                style={{
                    background: !selectedSubjectId ? 'var(--panel)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: !selectedSubjectId ? '2px solid var(--accent-purple)' : '2px solid transparent',
                    color: !selectedSubjectId ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
            >
                <span className="text-base">📋</span>
                <div>
                    <p className="text-[13px] font-medium">All Notes</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {notes.length} total
                    </p>
                </div>
            </button>

            {/* Subject list */}
            <div className="flex-1 flex flex-col gap-1 p-3">
                {subjects.length === 0 && (
                    <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                        Add your first subject
                    </p>
                )}
                {subjects.map(subject => (
                    <SubjectBlock
                        key={subject.id}
                        subject={subject}
                        topics={topics}
                        notes={notes}
                        selectedTopicId={selectedTopicId}
                        selectedSubjectId={selectedSubjectId}
                        onSelectSubject={onSelectSubject}
                        onSelectTopic={onSelectTopic}
                        onStudyUpdate={onStudyUpdate}
                    />
                ))}

                {/* Uncategorised bucket */}
                {uncategorisedNotes.length > 0 && (
                    <button
                        id="sidebar-uncategorised"
                        onClick={() => { onSelectSubject('uncategorised'); onSelectTopic(null); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{
                            background: selectedSubjectId === 'uncategorised' ? 'var(--panel)' : 'transparent',
                            border: selectedSubjectId === 'uncategorised' ? '1px solid var(--border)' : '1px solid transparent',
                        }}
                    >
                        <span className="text-base">🗂</span>
                        <div>
                            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Uncategorised</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                {uncategorisedNotes.length} note{uncategorisedNotes.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </button>
                )}
            </div>
        </aside>
    );
}
