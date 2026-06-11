import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

export default function MentionInput({ value, onChange, placeholder, teamMembers, disabled }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef(null);

  // Detect @ trigger and filter members
  useEffect(() => {
    if (mentionStart === -1) {
      setShowDropdown(false);
      return;
    }

    const query = mentionQuery.toLowerCase();
    const filtered = teamMembers
      .filter(m => m.name && m.name.toLowerCase().includes(query))
      .slice(0, 5);

    setFilteredMembers(filtered);
    setSelectedIndex(0);
    setShowDropdown(filtered.length > 0);
  }, [mentionQuery, teamMembers, mentionStart]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if @ is at start or after space
      const charBefore = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      if (charBefore === ' ' || lastAtIndex === 0) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show dropdown if query has no spaces (still typing mention)
        if (!query.includes(' ')) {
          setMentionStart(lastAtIndex);
          setMentionQuery(query);
          return;
        }
      }
    }

    // Close dropdown if no valid mention
    setMentionStart(-1);
    setMentionQuery('');
    setShowDropdown(false);
  };

  const selectMember = (member) => {
    if (mentionStart === -1) return;

    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + mentionQuery.length + 1); // +1 for @
    const mentionTag = `@[${member.name}](${member.id}) `;
    const newValue = before + mentionTag + after;

    onChange(newValue);
    setShowDropdown(false);
    setMentionStart(-1);
    setMentionQuery('');

    // Focus back to textarea
    setTimeout(() => {
      const newPos = (before + mentionTag).length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredMembers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredMembers[selectedIndex]) {
      e.preventDefault();
      selectMember(filteredMembers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setMentionStart(-1);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all resize-none"
      />

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && filteredMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 right-0 mt-1 rounded-xl border border-white/[0.1] bg-[#0a0f1e] shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1">
              {filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => selectMember(member)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-all ${
                    index === selectedIndex
                      ? 'bg-blue-500/20 text-white'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {member.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-white/[0.06] bg-white/[0.02]">
              <p className="text-[10px] text-slate-600">
                ↑↓ navigasi · Enter pilih · Esc tutup
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
