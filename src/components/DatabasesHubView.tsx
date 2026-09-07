import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Users, 
  School, 
  Stamp,
  LayoutList,
  Layers
} from 'lucide-react';
import { UserDatabaseView } from './UserDatabaseView';
import { SchoolsDatabaseView } from './SchoolsDatabaseView';
import { SchoolStampsManager } from './SchoolStampsManager';
import { Language } from '../lib/translations';

interface DatabasesHubViewProps {
  language: Language;
}

type DbTab = 'users' | 'schools' | 'stamps';

export function DatabasesHubView({ language }: DatabasesHubViewProps) {
  const [activeDbTab, setActiveDbTab] = useState<DbTab>('users');
  const isRtl = language === 'ar';

  return (
    <div className="space-y-6 w-full font-sans text-slate-850" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Premium Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6.5 relative overflow-hidden">
        {/* Abstract design element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-50/10 rounded-tr-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-linear-to-br from-[#051C3F] to-indigo-900 rounded-2xl text-amber-400 shadow-md">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#051C3F] tracking-tight">
                {isRtl ? '🗄️ المركز الوطني لقواعد البيانات والأنظمة' : '🗄️ National Central Databases Hub'}
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1.5 leading-relaxed">
                {isRtl 
                  ? 'بوابة الإدارة المركزية والتحكم الشامل في سجل المدققين، الكوادر التعليمية، المدارس المستهدفة، وأختام المدارس الرسمية' 
                  : 'Central administration console for auditing specialists, MoE staff educational accounts, targeted schools, and official school seals.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {isRtl ? 'ربط سحابي مباشر متصل' : 'Connected to Central MoE Cloud'}
            </span>
          </div>
        </div>
      </div>

      {/* Database Switcher Navigation */}
      <span className="hidden"></span> {/* Empty span for DOM alignment */}
      <div className="bg-slate-100/85 p-1.5 rounded-2xl border border-slate-205/65 max-w-2xl mx-auto flex flex-col sm:flex-row gap-1 animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => setActiveDbTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            activeDbTab === 'users'
              ? 'bg-[#051C3F] text-amber-300 shadow-md'
              : 'text-slate-505 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>{isRtl ? '👥 المستخدمين' : '👥 Users'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDbTab('schools')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            activeDbTab === 'schools'
              ? 'bg-[#821315] text-amber-250 shadow-md'
              : 'text-slate-550 hover:text-slate-850 hover:bg-white/40'
          }`}
        >
          <School className="w-4 h-4 shrink-0" />
          <span>{isRtl ? '🏢 المدارس' : '🏢 Schools'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDbTab('stamps')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
            activeDbTab === 'stamps'
              ? 'bg-[#0b5e32] text-white shadow-md'
              : 'text-slate-550 hover:text-slate-850 hover:bg-white/40'
          }`}
        >
          <Stamp className="w-4 h-4 shrink-0" />
          <span>{isRtl ? '💮 أختام المدارس' : '💮 School Stamps'}</span>
        </button>
      </div>

      {/* Main Container of Selected Active Database */}
      <div className="w-full min-w-0 transition-all duration-200">
        <AnimatePresence mode="wait">
          {activeDbTab === 'users' && (
            <motion.div
              key="users-db"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
            >
              <UserDatabaseView language={language} />
            </motion.div>
          )}

          {activeDbTab === 'schools' && (
            <motion.div
              key="schools-db"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
            >
              <SchoolsDatabaseView language={language} />
            </motion.div>
          )}

          {activeDbTab === 'stamps' && (
            <motion.div
              key="stamps-db"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
            >
              <SchoolStampsManager language={language} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
