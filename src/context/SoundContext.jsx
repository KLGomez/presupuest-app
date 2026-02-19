import { createContext, useState, useContext, useEffect, useRef } from 'react';

const SoundContext = createContext();

// Short Base64 sound effects to ensure self-contained functionality
// Click/Pop
const CLICK_SOUND = 'data:audio/wav;base64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='; // Placeholder, will replace with real short beep
// Real sounds would be longer, using short oscillators for demo purposes if files missing, 
// but for a "pop" effect I'll use a very short buffer generated via AudioContext to be more "pro".

export const SoundProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const audioCtxRef = useRef(null);

    useEffect(() => {
        // Initialize AudioContext interactions require user gesture usually
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
        }
    }, []);

    const playTone = (type) => {
        if (isMuted || !audioCtxRef.current) return;

        // Resume context if suspended (browser policy)
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'click') {
            // High pitch short "pop"
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);

        } else if (type === 'delete') {
            // "Crunch" noise-ish (approximated with low freq saw)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.15);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);

        } else if (type === 'success') {
            // "Ka-ching" (Coin) - Two high bells
            osc.type = 'sine';

            // Bell 1
            osc.frequency.setValueAtTime(1200, now);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);

            // Bell 2 (slightly later)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.frequency.setValueAtTime(1600, now + 0.1);
            gain2.gain.setValueAtTime(0.2, now + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc2.start(now + 0.1);
            osc2.stop(now + 0.4);
        } else if (type === 'scribble') {
            // White noise for scribble effect
            const bufferSize = ctx.sampleRate * 0.3; // 0.3 seconds
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter to make it sound more like paper
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;

            noise.connect(filter);
            filter.connect(gainNode);

            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            noise.start(now);
        }
    };

    const playClick = () => playTone('click');
    const playDelete = () => playTone('delete');
    const playSuccess = () => playTone('success');
    const playScribble = () => playTone('scribble');
    const toggleMute = () => setIsMuted(!isMuted);

    return (
        <SoundContext.Provider value={{ playClick, playDelete, playSuccess, playScribble, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => useContext(SoundContext);
