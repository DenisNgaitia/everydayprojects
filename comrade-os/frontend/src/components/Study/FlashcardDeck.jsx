/**
 * FlashcardDeck.jsx
 * Flip-card flashcard viewer with keyboard navigation and progress tracking.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Flashcard({ card, index, total }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className="relative cursor-pointer select-none"
            style={{ perspective: '1200px', minHeight: '180px' }}
            onClick={() => setFlipped(v => !v)}
            role="button"
            aria-label={flipped ? 'Show question' : 'Show answer'}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setFlipped(v => !v)}
        >
            <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '180px' }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-8 py-6"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <span className="text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Question {index + 1} of {total}
                    </span>
                    <p className="text-[15px] font-semibold text-center leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {card.front}
                    </p>
                    <p className="text-[11px] mt-6" style={{ color: 'var(--text-secondary)' }}>Tap to reveal answer</p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-8 py-6"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(0,229,255,0.06))',
                        border: '1px solid var(--accent-purple)',
                        boxShadow: '0 0 24px rgba(139,92,246,0.2)',
                    }}
                >
                    <span className="text-[10px] uppercase tracking-widest mb-4" style={{ color: 'var(--accent-purple)' }}>
                        Answer
                    </span>
                    <p className="text-[14px] text-center leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {card.back}
                    </p>
                    <p className="text-[11px] mt-6" style={{ color: 'var(--text-secondary)' }}>Tap to go back</p>
                </div>
            </motion.div>
        </div>
    );
}

export default function FlashcardDeck({ flashcards }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [known, setKnown] = useState(new Set());
    const [direction, setDirection] = useState(1);

    if (!flashcards || flashcards.length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-2xl py-8"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}
            >
                No flashcards for this note.
            </div>
        );
    }

    const go = (delta) => {
        setDirection(delta);
        setCurrentIndex(prev => {
            const next = prev + delta;
            if (next < 0) return flashcards.length - 1;
            if (next >= flashcards.length) return 0;
            return next;
        });
    };

    const toggleKnown = () => {
        setKnown(prev => {
            const next = new Set(prev);
            if (next.has(currentIndex)) next.delete(currentIndex);
            else next.add(currentIndex);
            return next;
        });
    };

    const knownCount = known.size;
    const progress = Math.round((knownCount / flashcards.length) * 100);

    return (
        <div className="flex flex-col gap-4">
            {/* Progress bar */}
            <div>
                <div className="flex justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                        Mastery
                    </span>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--accent-cyan)' }}>
                        {knownCount}/{flashcards.length}
                    </span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'var(--border)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', boxShadow: '0 0 8px rgba(0,229,255,0.4)' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 40 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Flashcard
                        card={flashcards[currentIndex]}
                        index={currentIndex}
                        total={flashcards.length}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
                <button
                    id="flashcard-prev"
                    onClick={() => go(-1)}
                    className="btn-secondary flex-1"
                    style={{ padding: '8px' }}
                >
                    ← Prev
                </button>

                <button
                    id={`flashcard-known-${currentIndex}`}
                    onClick={toggleKnown}
                    className="flex-1 rounded-xl text-[13px] font-semibold py-2 transition-all"
                    style={{
                        background: known.has(currentIndex)
                            ? 'rgba(57,255,20,0.12)' : 'var(--panel)',
                        border: known.has(currentIndex)
                            ? '1px solid #39ff14' : '1px solid var(--border)',
                        color: known.has(currentIndex) ? '#39ff14' : 'var(--text-secondary)',
                    }}
                >
                    {known.has(currentIndex) ? '✓ Known' : 'Mark Known'}
                </button>

                <button
                    id="flashcard-next"
                    onClick={() => go(1)}
                    className="btn-secondary flex-1"
                    style={{ padding: '8px' }}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
