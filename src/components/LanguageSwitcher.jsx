import { useLanguage } from '../i18n/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ variant = 'navbar' }) {
  const { lang, setLang } = useLanguage();

  const base = variant === 'settings'
    ? 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200'
    : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200';

  const active = 'text-white bg-blue-500/15 border border-blue-500/30';
  const inactive = 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/10 hover:border-white/20';

  if (variant === 'settings') {
    return (
      <div className="flex gap-2">
        <button onClick={() => setLang('en')} className={`${base} ${lang === 'en' ? active : inactive}`}>
          🇺🇸 English
        </button>
        <button onClick={() => setLang('id')} className={`${base} ${lang === 'id' ? active : inactive}`}>
          🇮🇩 Indonesia
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
      className={`${base} ${inactive}`}
      title={lang === 'en' ? 'Switch to Indonesian' : 'Ganti ke English'}
    >
      <Globe size={variant === 'navbar' ? 13 : 14} />
      <span>{lang === 'en' ? 'ID' : 'EN'}</span>
    </button>
  );
}
