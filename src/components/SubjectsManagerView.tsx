import React, { useState, useEffect } from 'react';
import { getSubjectsList, saveSubjectsList } from '../services/db';
import { Plus, Trash2, Edit2, Save, X, BookOpen } from 'lucide-react';

interface SubjectsManagerViewProps {
  language: 'en' | 'ar';
  currentSubjects: string[];
  onSubjectsUpdated: (newSubjects: string[]) => void;
}

export const SubjectsManagerView: React.FC<SubjectsManagerViewProps> = ({ language, currentSubjects, onSubjectsUpdated }) => {
  const [subjects, setSubjects] = useState<string[]>(currentSubjects);
  const [newSubject, setNewSubject] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSubjects(currentSubjects);
  }, [currentSubjects]);

  const handleAdd = async () => {
    if (!newSubject.trim()) return;
    const updated = [...subjects, newSubject.trim()];
    setLoading(true);
    try {
      await saveSubjectsList(updated);
      setSubjects(updated);
      onSubjectsUpdated(updated);
      setNewSubject('');
    } catch (e) {
      console.error(e);
      alert(language === 'ar' ? 'فشل حفظ المادة' : 'Failed to save subject');
    }
    setLoading(false);
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه المادة؟' : 'Are you sure you want to delete this subject?')) return;
    const updated = [...subjects];
    updated.splice(index, 1);
    setLoading(true);
    try {
      await saveSubjectsList(updated);
      setSubjects(updated);
      onSubjectsUpdated(updated);
    } catch (e) {
      console.error(e);
      alert(language === 'ar' ? 'فشل حذف المادة' : 'Failed to delete subject');
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || !editValue.trim()) return;
    const updated = [...subjects];
    updated[editingIndex] = editValue.trim();
    setLoading(true);
    try {
      await saveSubjectsList(updated);
      setSubjects(updated);
      onSubjectsUpdated(updated);
      setEditingIndex(null);
    } catch (e) {
      console.error(e);
      alert(language === 'ar' ? 'فشل تحديث المادة' : 'Failed to update subject');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <BookOpen className="text-indigo-600 w-6 h-6" />
        {language === 'ar' ? 'إدارة المواد الدراسية' : 'Manage School Subjects'}
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder={language === 'ar' ? 'اسم المادة الجديدة...' : 'New subject name...'}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !newSubject.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة' : 'Add'}
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subj, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            {editingIndex === idx ? (
              <div className="flex-1 flex gap-2 mr-4">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1 border border-slate-300 rounded-md"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Save className="w-5 h-5" />
                </button>
                <button onClick={() => setEditingIndex(null)} className="p-1 text-slate-400 hover:bg-slate-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium text-slate-700">{subj}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingIndex(idx);
                      setEditValue(subj);
                    }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title={language === 'ar' ? 'تعديل' : 'Edit'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title={language === 'ar' ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
