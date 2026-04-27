import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { addNote, deleteNote, getUser } from '../utils/dataService';
import GlassCard from '../components/UI/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyPage() {
    const { state, dispatch } = useAppContext();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [showFlashcard, setShowFlashcard] = useState({});

    const uploadNote = () => {
        if (!title.trim() || !content.trim()) return;
        const updated = addNote(title, content);
        dispatch({ type: 'UPDATE_STUDY', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
        setTitle('');
        setContent('');
    };

    const handleDelete = (noteId) => {
        if (!confirm('Delete this note set?')) return;
        const updated = deleteNote(noteId);
        dispatch({ type: 'UPDATE_STUDY', payload: updated });
        if (selectedNote?.id === noteId) setSelectedNote(null);
    };

    const notes = state.study?.notes || [];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                    📚 Study AI
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">Upload Notes</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Topic / Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="input-field w-full"
                        />
                        <textarea
                            placeholder="Paste your notes or lecture content here..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={6}
                            className="input-field w-full resize-none"
                        />
                        <button
                            onClick={uploadNote}
                            disabled={!title.trim() || !content.trim()}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            ✨ Generate AI Study Materials
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        AI will generate a summary, flashcards, and practice questions from your notes.
                    </p>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">My Notes ({notes.length})</h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {notes.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-8">
                                No notes yet. Upload your first set!
                            </p>
                        )}
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedNote?.id === note.id
                                        ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                                        : 'hover:bg-white/3 border border-transparent'
                                }`}
                            >
                                <div onClick={() => setSelectedNote(note)} className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate">{note.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{note.summary?.substring(0, 60)}...</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                                    className="text-gray-500 hover:text-red-400 text-xs ml-2 mt-1"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Note detail */}
            <AnimatePresence>
                {selectedNote && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                    >
                        <GlassCard glow>
                            <h3 className="text-xl font-bold mb-2">{selectedNote.title}</h3>
                            <p className="text-sm text-gray-300 mb-6 leading-relaxed">{selectedNote.summary}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-neon-pink mb-3 flex items-center gap-2">
                                        🎴 Flashcards
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedNote.flashcards?.map((card, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setShowFlashcard(prev => ({ ...prev, [i]: !prev[i] }))}
                                                className="bg-white/3 rounded-xl p-3 cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                <p className="text-sm font-medium">{card.front}</p>
                                                {showFlashcard[i] && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="text-sm text-neon-cyan mt-2 pt-2 border-t border-white/5"
                                                    >
                                                        {card.back}
                                                    </motion.p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neon-yellow mb-3 flex items-center gap-2">
                                        ❓ Practice Questions
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedNote.questions?.map((q, i) => (
                                            <details key={i} className="bg-white/3 rounded-xl p-3 group">
                                                <summary className="cursor-pointer text-sm font-medium list-none flex items-center justify-between">
                                                    {q.question}
                                                    <span className="text-gray-500 group-open:rotate-180 transition-transform">▾</span>
                                                </summary>
                                                <p className="text-sm text-neon-cyan mt-2 pt-2 border-t border-white/5">{q.answer}</p>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}