import React, { useState, useEffect } from 'react';
import { 
  Type, 
  Palette, 
  FileText, 
  Maximize2, 
  Layout, 
  RefreshCw, 
  Check, 
  Save, 
  Eye, 
  Sparkles,
  ShieldAlert,
  Sliders,
  PenTool,
  CheckCircle2
} from 'lucide-react';
import { FormDesignSettings } from '../types';
import { getFormDesignSettings, saveFormDesignSettings, DEFAULT_FORM_STYLES } from '../services/db';
import logoMoe from '../../photo.jpg';
import logoVision from '../../logovision_2.png';
import { getActiveStamp } from './OmanPrincipalStamp';

interface FormStyleControllerProps {
  language: 'ar' | 'en';
  onSuccess: (msg: string) => void;
}

export function FormStyleController({ language, onSuccess }: FormStyleControllerProps) {
  const [settings, setSettings] = useState<FormDesignSettings>(DEFAULT_FORM_STYLES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'typography' | 'colors' | 'dimensions' | 'titles' | 'fields' | 'table' | 'signatures_layout'>('typography');
  const [previewScale, setPreviewScale] = useState<number>(0.65);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');

  const updateAndSaveSettings = async (newSettings: FormDesignSettings) => {
    setSettings(newSettings);
    setAutoSaveStatus(language === 'ar' ? 'جاري تطبیق وحفظ التعديل...' : 'Applying & saving...');
    try {
      await saveFormDesignSettings(newSettings);
      window.dispatchEvent(new CustomEvent('oman_moe_styling_updated', { detail: newSettings }));
      setAutoSaveStatus(language === 'ar' ? 'تم حفظ التعديلات وتطبيقها تلقائياً!' : 'Saved & applied automatically!');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setAutoSaveStatus(language === 'ar' ? 'فشل حفظ التغيير' : 'Auto-save failed');
    }
  };

  // Load current global settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getFormDesignSettings();
        setSettings(data);
      } catch (e) {
        console.error("Failed to load form design settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFormDesignSettings(settings);
      
      // Dispatch a storage event or update DOM to notify other components of styling changes
      window.dispatchEvent(new CustomEvent('oman_moe_styling_updated', { detail: settings }));
      
      onSuccess(
        language === 'ar' 
          ? 'تم حفظ واعتماد قالب تنسيق الاستمارة الجديد بنجاح لجميع المستخدمين!' 
          : 'New form layout template saved and deployed successfully for all users!'
      );
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من استعادة قيم التصميم الافتراضية المعتمدة لوزارة التربية والتعليم؟' : 'Are you sure you want to restore default Ministry styles?')) {
      setSettings(DEFAULT_FORM_STYLES);
      onSuccess(
        language === 'ar' 
          ? 'تم استعادة التصميم المعتمد الافتراضي.' 
          : 'Restored default standard layout.'
      );
    }
  };

  const fontOptions = [
    { value: 'Cairo', label: language === 'ar' ? 'خط كـايرو (عصري)' : 'Cairo (Modern)' },
    { value: 'Tajawal', label: language === 'ar' ? 'خط تجوال (مبسط)' : 'Tajawal (Simplified)' },
    { value: 'Amiri', label: language === 'ar' ? 'خط أميري (نسخ كلاسيكي)' : 'Amiri (Serif/Naskh)' },
    { value: 'IBM Plex Sans Arabic', label: language === 'ar' ? 'آي بي إم أرابيك' : 'IBM Plex Sans Arabic' },
    { value: 'Inter', label: 'Inter (Sans-serif)' }
  ];

  const monoFontOptions = [
    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Fira Code', label: 'Fira Code' }
  ];

  const sizeOptions = ['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px'];
  const titleSizeOptions = ['18px', '20px', '22px', '24px', '26px', '28px', '30px'];
  const paddingOptions = [
    { value: '4px', label: language === 'ar' ? 'ضيق جداً (4px)' : 'Very Compact (4px)' },
    { value: '6px', label: language === 'ar' ? 'مضغوط وعملي (6px)' : 'Compact (6px)' },
    { value: '8px', label: language === 'ar' ? 'متوازن مريح (8px)' : 'Balanced (8px)' },
    { value: '10px', label: language === 'ar' ? 'متباعد متوسط (10px)' : 'Medium (10px)' },
    { value: '12px', label: language === 'ar' ? 'متسع وفسيح (12px)' : 'Generous (12px)' }
  ];

  const outerPaddingOptions = [
    { value: '16px', label: '16px' },
    { value: '24px', label: '24px' },
    { value: '32px', label: '32px' },
    { value: '40px', label: '40px' },
    { value: '48px', label: '48px' }
  ];

  const borderTypes = [
    { value: 'solid', label: language === 'ar' ? 'خط متصل' : 'Solid' },
    { value: 'dashed', label: language === 'ar' ? 'خط متقطع' : 'Dashed' },
    { value: 'double', label: language === 'ar' ? 'خط مزدوج' : 'Double' }
  ];

  const colorPresets = [
    { name: language === 'ar' ? 'عنابي الملكي العماني' : 'Royal MOE Burgundy', primary: '#821315', secondary: '#051C3F' },
    { name: language === 'ar' ? 'أخضر وزارة التربية' : 'Sultanate Emerald', primary: '#035c3e', secondary: '#2d3748' },
    { name: language === 'ar' ? 'كحلي دبلوماسي' : 'Diplomatic Sapphire', primary: '#0f2c59', secondary: '#41444b' },
    { name: language === 'ar' ? 'رمادي صناعي كلاسيكي' : 'Classic Industrial Slate', primary: '#475569', secondary: '#1e293b' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold font-sans">
          {language === 'ar' ? 'جاري تحميل قالب تصميم الاستمارات والخطوط الدراسية...' : 'Loading dynamic form CSS template...'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans antialiased text-slate-800" style={{ direction: 'rtl' }}>
      
      {/* Dynamic Embed for custom Google fonts selected by the admin */}
      <style id="admin-custom-styled-preview">
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@450;600;700&family=Inter:wght@400;600;700;900&display=swap');
          
          .admin-form-simulation {
            --p-color: ${settings.primaryColor};
            --s-color: ${settings.secondaryColor};
            --p-font: '${settings.primaryFont}', 'Cairo', sans-serif;
            --m-font: '${settings.monoFont}', monospace;
            --sz-title: ${settings.titleSize};
            --sz-header: ${settings.headerDetailsSize};
            --sz-th: ${settings.tableHeaderSize};
            --sz-tb: ${settings.tableBodySize};
            --sz-notes: ${settings.notesSize};
            --tbl-py: ${settings.tablePaddingY};
            --out-pad: ${settings.outerPadding};
            --brdr-w: ${settings.borderWidth};
            --brdr-t: ${settings.borderType};

            font-family: var(--p-font);
            padding: var(--out-pad);
            border: var(--brdr-w) var(--brdr-t) var(--p-color);
            background-color: #ffffff;
            position: relative;
            box-sizing: border-box;
            transition: all 0.2s ease-in-out;
          }
          .sim-title {
            font-size: var(--sz-title);
            color: var(--p-color);
            font-weight: 900;
          }
          .sim-header-cell {
            font-size: var(--sz-header);
            padding-top: var(--tbl-py);
            padding-bottom: var(--tbl-py);
          }
          .sim-table {
            border: ${settings.tableOuterBorderWidth || '1.5px'} ${settings.tableBorderType || 'solid'} ${settings.tableOuterBorderColor || settings.primaryColor} !important;
            border-collapse: collapse !important;
          }
          .sim-table th {
            font-size: var(--sz-th);
            background-color: ${settings.tableHeaderBg || 'color-mix(in srgb, var(--p-color) 4%, transparent)'};
            color: var(--p-color);
            padding: var(--tbl-py) 8px !important;
            border-bottom: ${settings.tableOuterBorderWidth || '1.5px'} ${settings.tableBorderType || 'solid'} ${settings.tableOuterBorderColor || settings.primaryColor} !important;
            ${settings.tableGridPattern === 'full' || settings.tableGridPattern === 'vertical' ? `border-left: ${settings.tableBorderWidth || '1px'} ${settings.tableBorderType || 'solid'} ${settings.tableBorderColor || '#cbd5e1'} !important; border-right: ${settings.tableBorderWidth || '1px'} ${settings.tableBorderType || 'solid'} ${settings.tableBorderColor || '#cbd5e1'} !important;` : 'border-left: none !important; border-right: none !important;'}
          }
          .sim-table td {
            font-size: var(--sz-tb);
            padding: var(--tbl-py) 8px !important;
            ${settings.tableGridPattern === 'full' || settings.tableGridPattern === 'horizontal' ? `border-bottom: ${settings.tableBorderWidth || '1px'} ${settings.tableBorderType || 'solid'} ${settings.tableBorderColor || '#cbd5e1'} !important;` : 'border-bottom: none !important;'}
            ${settings.tableGridPattern === 'full' || settings.tableGridPattern === 'vertical' ? `border-left: ${settings.tableBorderWidth || '1px'} ${settings.tableBorderType || 'solid'} ${settings.tableBorderColor || '#cbd5e1'} !important; border-right: ${settings.tableBorderWidth || '1px'} ${settings.tableBorderType || 'solid'} ${settings.tableBorderColor || '#cbd5e1'} !important;` : 'border-left: none !important; border-right: none !important;'}
          }
          .sim-text-primary {
            color: var(--p-color);
          }
          .sim-text-secondary {
            color: var(--s-color);
          }
          .sim-notes {
            font-size: var(--sz-notes);
          }
          .sim-border-accent {
            border-color: var(--p-color) !important;
          }
          .sim-watermark {
            font-family: var(--p-font);
            color: color-mix(in srgb, var(--p-color) 6%, transparent);
          }
        `}
      </style>

      {/* Right Column: Controls Panel */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                {language === 'ar' ? 'قالب تنسيق الاستمارة' : 'Form Layout controls'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'أداة المدير الخاصة بتخصيص خطوط وأحجام وألوان المستند المطبوع' : 'Configure official document fonts, sizing, boundaries, and colors.'}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title={language === 'ar' ? 'استعادة التصميم الأساسي للوزارة' : 'Restore Default standard'}
            >
              <RefreshCw className="w-4 h-4 animate-hover" />
            </button>
          </div>

          {/* Configuration subtabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('typography')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'typography' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Type className="w-3 h-3" />
                {language === 'ar' ? 'الخطوط والأحجام' : 'Fonts & Sizes'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('colors')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'colors' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Palette className="w-3 h-3" />
                {language === 'ar' ? 'الألوان والحدود' : 'Colors & Borders'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('dimensions')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'dimensions' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {language === 'ar' ? 'الأبعاد والمسافات' : 'Dimensions'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('titles')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'titles' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <FileText className="w-3 h-3" />
                {language === 'ar' ? 'الترويسة والوزارة' : 'Ministry & Title'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('fields')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'fields' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Sliders className="w-3 h-3" />
                {language === 'ar' ? 'حقول المعلومات' : 'Data Labels'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('table')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'table' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Layout className="w-3 h-3" />
                {language === 'ar' ? 'أعمدة الجدول' : 'Table Columns'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('signatures_layout')}
              className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black tracking-wide border-b-2 col-span-2 transition-all cursor-pointer ${
                activeSubTab === 'signatures_layout' 
                  ? 'border-purple-600 bg-purple-50 text-purple-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <PenTool className="w-3 h-3" />
                {language === 'ar' ? 'التوقيعات والإنماء والرمزيات' : 'Signatures & Layout'}
              </span>
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {/* SUBTAB 1: TYPOGRAPHY AND SIZES */}
            {activeSubTab === 'typography' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'نوع خط العناوين والكتابة الرئيسي:' : 'Primary Document Font:'}
                  </label>
                  <select
                    value={settings.primaryFont}
                    onChange={(e) => setSettings({ ...settings, primaryFont: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold font-sans cursor-pointer focus:border-purple-500"
                  >
                    {fontOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'نوع خط الأرقام والبيانات التقنية:' : 'Data & Numbers Font (Mono):'}
                  </label>
                  <select
                    value={settings.monoFont}
                    onChange={(e) => setSettings({ ...settings, monoFont: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold font-mono cursor-pointer focus:border-purple-500"
                  >
                    {monoFontOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2">
                    <label className="text-[10.5px] font-black text-slate-400 block">
                      {language === 'ar' ? 'عنوان الترويسة الرئيسية' : 'Main Title Size'}
                    </label>
                    <select
                      value={settings.titleSize}
                      onChange={(e) => setSettings({ ...settings, titleSize: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    >
                      {titleSizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10.5px] font-black text-slate-400 block">
                      {language === 'ar' ? 'بيانات المعلم والتوجيه' : 'Header Info Size'}
                    </label>
                    <select
                      value={settings.headerDetailsSize}
                      onChange={(e) => setSettings({ ...settings, headerDetailsSize: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 block">
                      {language === 'ar' ? 'عمود رأس الجدول' : 'Table Th'}
                    </label>
                    <select
                      value={settings.tableHeaderSize}
                      onChange={(e) => setSettings({ ...settings, tableHeaderSize: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 block">
                      {language === 'ar' ? 'محتوى الدرجات والطلاب' : 'Table Td'}
                    </label>
                    <select
                      value={settings.tableBodySize}
                      onChange={(e) => setSettings({ ...settings, tableBodySize: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 block">
                      {language === 'ar' ? 'الملاحظات والقرارات' : 'Notes/Legend'}
                    </label>
                    <select
                      value={settings.notesSize}
                      onChange={(e) => setSettings({ ...settings, notesSize: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    >
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: COLORS AND BORDERS */}
            {activeSubTab === 'colors' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'جاهزية نسق الألوان المعتمد للمحافظة:' : 'Presets / Theme color presets:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSettings({
                          ...settings,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary
                        })}
                        className="p-2 border border-slate-100 rounded-xl bg-slate-50 flex items-center gap-2 hover:bg-slate-100 cursor-pointer transition-all text-right"
                      >
                        <span 
                          className="w-4 h-4 rounded-full border border-white shrink-0 shadow-xs" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-[10px] font-bold text-slate-600 leading-tight block">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'اللون الترويجي الأساسي:' : 'Primary Theme Color:'}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={settings.primaryColor} 
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                      />
                      <input 
                        type="text" 
                        value={settings.primaryColor} 
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-full p-1.5 bg-slate-50 text-slate-700 font-mono text-[10.5px] rounded-lg border border-slate-200 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'اللون الثانوي المساعد:' : 'Secondary Accent Color:'}
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={settings.secondaryColor} 
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                      />
                      <input 
                        type="text" 
                        value={settings.secondaryColor} 
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-full p-1.5 bg-slate-50 text-slate-700 font-mono text-[10.5px] rounded-lg border border-slate-200 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'سماكة حدود المستند الكلي:' : 'Outer Border Width:'}
                    </label>
                    <select
                      value={settings.borderWidth}
                      onChange={(e) => setSettings({ ...settings, borderWidth: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:border-purple-500"
                    >
                      <option value="1px">1px</option>
                      <option value="1.5px">1.5px (متوازن)</option>
                      <option value="2px">2px</option>
                      <option value="3px">3px (سميك)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'طبيعة ونمط خط الحدود:' : 'Border Type Style:'}
                    </label>
                    <select
                      value={settings.borderType}
                      onChange={(e) => setSettings({ ...settings, borderType: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold focus:border-purple-500"
                    >
                      {borderTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: DIMENSIONS AND PADDING */}
            {activeSubTab === 'dimensions' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'الارتفاع الداخلي لخلايا وجداول الطلاب:' : 'Table Rows Vertical Spacing:'}
                  </label>
                  <select
                    value={settings.tablePaddingY}
                    onChange={(e) => setSettings({ ...settings, tablePaddingY: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                  >
                    {paddingOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'الهامش المرتد الخارجي للصفحة (Outer Margins):' : 'Page Outer Margin Padding:'}
                  </label>
                  <select
                    value={settings.outerPadding}
                    onChange={(e) => setSettings({ ...settings, outerPadding: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                  >
                    {outerPaddingOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.value} {language === 'ar' ? '(تنسيق ذكي)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-slate-200/60 pt-3 space-y-3">
                  <span className="text-xs font-black text-slate-700 block mb-1">
                    {language === 'ar' ? 'خيارات هوامش الصفحة عند الطباعة (A4 Paper Margins):' : 'Page Print Margin Controls:'}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 block">
                        {language === 'ar' ? 'الهامش الجانبي الأفقي:' : 'Horizontal Page Margin:'}
                      </label>
                      <select
                        value={settings.printPageMarginX || '12mm'}
                        onChange={(e) => setSettings({ ...settings, printPageMarginX: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                      >
                        <option value="6mm">{language === 'ar' ? 'ضيق كلياً (6 مم)' : 'Ultra Compact (6mm)'}</option>
                        <option value="10mm">{language === 'ar' ? 'ضيق (10 مم)' : 'Compact (10mm)'}</option>
                        <option value="12mm">{language === 'ar' ? 'متوازن (12 مم) - افتراضي' : 'Balanced (12mm) - Default'}</option>
                        <option value="16mm">{language === 'ar' ? 'متسع (16 مم)' : 'Generous (16mm)'}</option>
                        <option value="20mm">{language === 'ar' ? 'عريض (20 مم)' : 'Wide (20mm)'}</option>
                        <option value="25mm">{language === 'ar' ? 'عريض جداً (25 مم)' : 'Extra Wide (25mm)'}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 block">
                        {language === 'ar' ? 'الهامش الرأسي العمودي:' : 'Vertical Page Margin:'}
                      </label>
                      <select
                        value={settings.printPageMarginY || '10mm'}
                        onChange={(e) => setSettings({ ...settings, printPageMarginY: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                      >
                        <option value="5mm">{language === 'ar' ? 'ضيق كلياً (5 مم)' : 'Ultra Compact (5mm)'}</option>
                        <option value="8mm">{language === 'ar' ? 'ضيق (8 مم)' : 'Compact (8mm)'}</option>
                        <option value="10mm">{language === 'ar' ? 'متوازن (10 مم) - افتراضي' : 'Balanced (10mm) - Default'}</option>
                        <option value="14mm">{language === 'ar' ? 'متسع (14 مم)' : 'Generous (14mm)'}</option>
                        <option value="18mm">{language === 'ar' ? 'عريض (18 مم)' : 'Wide (18mm)'}</option>
                        <option value="22mm">{language === 'ar' ? 'عريض جداً (22 مم)' : 'Extra Wide (22mm)'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 block">
                      {language === 'ar' ? 'الحشو الداخلي لمحتوى الاستمارة:' : 'Internal Page Print Padding:'}
                    </label>
                    <select
                      value={settings.printPagePadding || '6mm 8mm'}
                      onChange={(e) => setSettings({ ...settings, printPagePadding: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                    >
                      <option value="4mm 6mm">{language === 'ar' ? 'ضيق جداً (4 مم رأسي / 6 مم جانبي)' : 'Ultra Compact (4mm V / 6mm H)'}</option>
                      <option value="6mm 8mm">{language === 'ar' ? 'متوازن (6 مم رأسي / 8 مم جانبي) - افتراضي' : 'Balanced (6mm V / 8mm H) - Default'}</option>
                      <option value="8mm 12mm">{language === 'ar' ? 'متسع (8 مم رأسي / 12 مم جانبي)' : 'Generous (8mm V / 12mm H)'}</option>
                      <option value="12mm 16mm">{language === 'ar' ? 'عريض (12 مم رأسي / 16 مم جانبي)' : 'Wide (12mm V / 16mm H)'}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 block">
                      {language === 'ar' ? 'درجة تكبير/تصغير محتويات الاستمارة (Zoom/Scale):' : 'Form Content Zoom (Scale Ratio):'}
                    </label>
                    <select
                      value={settings.printZoom || '100%'}
                      onChange={(e) => setSettings({ ...settings, printZoom: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold cursor-pointer focus:border-purple-500"
                    >
                      <option value="105%">{language === 'ar' ? 'تكبير إضافي (105%)' : 'Zoom In Strong (105%)'}</option>
                      <option value="103%">{language === 'ar' ? 'تكبير خفيف (103%)' : 'Zoom In Light (103%)'}</option>
                      <option value="100%">{language === 'ar' ? 'الحجم الافتراضي الكامل (100%)' : 'Default Full Scale (100%)'}</option>
                      <option value="97%">{language === 'ar' ? 'تصغير خفيف (97%)' : 'Zoom Out Minimal (97%)'}</option>
                      <option value="95%">{language === 'ar' ? 'تصغير متوازن (95%)' : 'Zoom Out Balanced (95%)'}</option>
                      <option value="92%">{language === 'ar' ? 'تصغير متوسط (92%)' : 'Zoom Out Medium (92%)'}</option>
                      <option value="90%">{language === 'ar' ? 'تصغير بهوامش إضافية (90%)' : 'Zoom Out Comfort (90%)'}</option>
                      <option value="85%">{language === 'ar' ? 'مساحة حواف واسعة (85%)' : 'Wide Margins Compact (85%)'}</option>
                      <option value="80%">{language === 'ar' ? 'هوامش فارغة كبيرة (80%)' : 'Extra Wide Margins (80%)'}</option>
                      <option value="75%">{language === 'ar' ? 'أقصى هوامش فارغة (75%)' : 'Maximum Margins (75%)'}</option>
                    </select>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-purple-900 text-xs leading-relaxed space-y-1">
                  <span className="font-extrabold block text-[13px] flex items-center gap-1.5 text-purple-800">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    {language === 'ar' ? 'مواءمة تصدير PDF التلقائية:' : 'Symmetric PDF Scaling:'}
                  </span>
                  <p className="text-[11px] font-bold text-purple-700">
                    {language === 'ar' 
                      ? 'تأميم وتبني هذه الأبعاد يضمن بقاء أطراف المستند خالية من الحواف الخاطئة أثناء تصدير PDF، مما يمنع انقسام الجداول إلى صفحات ثانوية.' 
                      : 'Setting symmetrical layouts here guarantees that html2canvas maps margins correctly without cutting columns or stretching rows.'}
                  </p>
                </div>
              </div>
            )}

            {/* SUBTAB 4: HEADERS AND SECURITY */}
            {activeSubTab === 'titles' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'اسم الوزارة (عربي):' : 'Ministry Title (Ar):'}
                    </label>
                    <input
                      type="text"
                      value={settings.titleTextAr}
                      onChange={(e) => setSettings({ ...settings, titleTextAr: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'اسم الوزارة (إنجليزي):' : 'Ministry Title (En):'}
                    </label>
                    <input
                      type="text"
                      value={settings.titleTextEn}
                      onChange={(e) => setSettings({ ...settings, titleTextEn: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold font-sans focus:border-purple-500 animate-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 block">
                    {language === 'ar' ? 'المديرية العامة التابعة بالتقرير:' : 'Socio-Educational Section Title:'}
                  </label>
                  <textarea
                    rows={2}
                    value={settings.subTitleTextAr}
                    onChange={(e) => setSettings({ ...settings, subTitleTextAr: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold leading-relaxed focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'عنوان الاستمارة الرئيسي (عربي):' : 'Document Main Title (Ar):'}
                    </label>
                    <input
                      type="text"
                      value={settings.reportTitleAr || ''}
                      onChange={(e) => setSettings({ ...settings, reportTitleAr: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500"
                      placeholder="استمارة الفحص و التدقيق المستمر"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 block">
                      {language === 'ar' ? 'عنوان الاستمارة الرئيسي (إنجليزي):' : 'Document Main Title (En):'}
                    </label>
                    <input
                      type="text"
                      value={settings.reportTitleEn || ''}
                      onChange={(e) => setSettings({ ...settings, reportTitleEn: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold font-sans focus:border-purple-500"
                      placeholder="Continuous Assessment Auditing & Moderation Form"
                    />
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-700 block">
                        {language === 'ar' ? 'شعار وزارة التربية والتعليم في الاستمارة:' : 'Ministry Logo Emblem:'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {language === 'ar' ? 'إظهار شعار سلطنة عمان والرموز الوطنية بالأعلى' : 'Toggle logo display at header'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.showSultanateLogo !== false}
                        onChange={(e) => setSettings({ ...settings, showSultanateLogo: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-700 block">
                        {language === 'ar' ? 'العلامة المائية الخلفية مسبقة الفحص:' : 'Background Document Watermark:'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {language === 'ar' ? 'طباعة مائلة خفيفة لتوثيق المصداقية' : 'Security stamp overlay'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.showWatermark}
                        onChange={(e) => setSettings({ ...settings, showWatermark: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {settings.showWatermark && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150 pt-1">
                      <input
                        type="text"
                        value={settings.watermarkText}
                        onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                        placeholder={language === 'ar' ? 'أدخل نص العلامة المائية هنا' : 'Watermark text'}
                        className="w-full p-2 bg-white border border-slate-200/60 rounded-lg text-xs font-bold focus:border-purple-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 5: INFORMATION FIELDS (حقول معلومات المعاينة) */}
            {activeSubTab === 'fields' && (
              <div className="space-y-4 animate-in fade-in duration-200 max-h-[380px] overflow-y-auto pr-1">
                <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-[11px] text-purple-900 leading-normal font-sans">
                  {language === 'ar' ? 'تعديل مسميات الجزء العلوي من الاستمارة (عربي وإنجليزي):' : 'Customize labels of metadata block:'}
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'المدرسة (عربي):' : 'School Label (Ar):'}</label>
                    <input type="text" value={settings.labelSchoolAr || ''} onChange={(e) => setSettings({ ...settings, labelSchoolAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? 'المدرسة (إنجليزي):' : 'School Label (En):'}</label>
                    <input type="text" value={settings.labelSchoolEn || ''} onChange={(e) => setSettings({ ...settings, labelSchoolEn: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'المجلس والزيارة (عربي):' : 'Academic Label (Ar):'}</label>
                    <input type="text" value={settings.labelAcademicAr || ''} onChange={(e) => setSettings({ ...settings, labelAcademicAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? 'المجلس والزيارة (إنجليزي):' : 'Academic Label (En):'}</label>
                    <input type="text" value={settings.labelAcademicEn || ''} onChange={(e) => setSettings({ ...settings, labelAcademicEn: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'المعلم القائم (عربي):' : 'Teacher Label (Ar):'}</label>
                    <input type="text" value={settings.labelTeacherAr || ''} onChange={(e) => setSettings({ ...settings, labelTeacherAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? 'المعلم القائم (إنجليزي):' : 'Teacher Label (En):'}</label>
                    <input type="text" value={settings.labelTeacherEn || ''} onChange={(e) => setSettings({ ...settings, labelTeacherEn: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'المادة وسنة التعيين (عربي):' : 'Subject Label (Ar):'}</label>
                    <input type="text" value={settings.labelSubjectAr || ''} onChange={(e) => setSettings({ ...settings, labelSubjectAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400">{language === 'ar' ? 'المادة وسنة التعيين (إنجليزي):' : 'Subject Label (En):'}</label>
                    <input type="text" value={settings.labelSubjectEn || ''} onChange={(e) => setSettings({ ...settings, labelSubjectEn: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'الملف الوظيفي (عربي):' : 'File Number (Ar):'}</label>
                    <input type="text" value={settings.labelFileNumberAr || ''} onChange={(e) => setSettings({ ...settings, labelFileNumberAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'المديرية (عربي):' : 'Directorate (Ar):'}</label>
                    <input type="text" value={settings.labelDirectorateAr || ''} onChange={(e) => setSettings({ ...settings, labelDirectorateAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'التخصص (عربي):' : 'Specialization (Ar):'}</label>
                    <input type="text" value={settings.labelSpecializationAr || ''} onChange={(e) => setSettings({ ...settings, labelSpecializationAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'تاريخ الزيارة (عربي):' : 'Visit Date (Ar):'}</label>
                    <input type="text" value={settings.labelVisitDateAr || ''} onChange={(e) => setSettings({ ...settings, labelVisitDateAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 6: TABLE COLUMNS & STYLING (أعمدة وتنسيق الجداول والمسافات) */}
            {activeSubTab === 'table' && (
              <div className="space-y-6 animate-in fade-in duration-200 h-[420px] overflow-y-auto pr-1">
                
                {/* Accordion Part 1: Rename Columns */}
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  <h4 className="text-xs font-black text-purple-700 flex items-center gap-1.5 uppercase tracking-widest">
                    <Layout className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'أولاً: عناوين وأسماء أعمدة الجدول' : '1. Rename Table Headers'}
                  </h4>
                  <div className="bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/50 text-[10px] text-purple-950 leading-tight">
                    {language === 'ar' ? 'تعديل وتحديد النطاق الاسمي لأعمدة رصد الدرجات بالبوابة التعليمية:' : 'Edit the exact titles of your dataset header cells:'}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'اسم العمود الأول (الرقم التسلسلي):' : 'Index (Ar):'}</label>
                      <input type="text" value={settings.colIdAr || ''} onChange={(e) => setSettings({ ...settings, colIdAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'عمود اسم الطالب ثلاثياً وقبيلته:' : 'Student Name Title:'}</label>
                      <input type="text" value={settings.colStudentNameAr || ''} onChange={(e) => setSettings({ ...settings, colStudentNameAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'عمود الصف والشعبة:' : 'Class/Section title:'}</label>
                      <input type="text" value={settings.colClassAr || ''} onChange={(e) => setSettings({ ...settings, colClassAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'عمود أداة التقويم المستمر:' : 'Tool/Instrument title:'}</label>
                      <input type="text" value={settings.colToolAr || ''} onChange={(e) => setSettings({ ...settings, colToolAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'الدرجة (قبل):' : 'Score Before (Ar):'}</label>
                      <input type="text" value={settings.colScoreBeforeAr || ''} onChange={(e) => setSettings({ ...settings, colScoreBeforeAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'الدرجة (بعد):' : 'Score After (Ar):'}</label>
                      <input type="text" value={settings.colScoreAfterAr || ''} onChange={(e) => setSettings({ ...settings, colScoreAfterAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'عمود سبب التعديل والقرار الفني للمطابقة:' : 'Modification Reason Column Title:'}</label>
                    <input type="text" value={settings.colReasonAr || ''} onChange={(e) => setSettings({ ...settings, colReasonAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:border-purple-500 focus:bg-white transition-all" />
                  </div>
                </div>

                {/* Accordion Part 2: Table Lines & Borders */}
                <div className="space-y-3 border-b border-slate-100 pb-4">
                  <h4 className="text-xs font-black text-purple-700 flex items-center gap-1.5 uppercase tracking-widest">
                    <Palette className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'ثانياً: خطوط وحدود الجداول الفنية' : '2. Table Grid & Border Styling'}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'نمط شبكة الجدول الداخلية:' : 'Internal Grid lines:'}</label>
                      <select 
                        value={settings.tableGridPattern || 'full'} 
                        onChange={(e) => setSettings({ ...settings, tableGridPattern: e.target.value as any })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <option value="full">{language === 'ar' ? 'كامل الشبكة (مربعات كاملة)' : 'Full Grid'}</option>
                        <option value="horizontal">{language === 'ar' ? 'أفقي فقط (خطوط الصفوف)' : 'Horizontal only'}</option>
                        <option value="vertical">{language === 'ar' ? 'رأسي فقط (خطوط الأعمدة)' : 'Vertical only'}</option>
                        <option value="none">{language === 'ar' ? 'بلا خطوط داخلية (تصفيف نظيف)' : 'No Internal Grid'}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'رسم شكل ونوع خطوط الجدول:' : 'Line stroke pattern:'}</label>
                      <select 
                        value={settings.tableBorderType || 'solid'} 
                        onChange={(e) => setSettings({ ...settings, tableBorderType: e.target.value as any })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <option value="solid">{language === 'ar' ? 'خــط متصل صلب (Solid)' : 'Solid'}</option>
                        <option value="dashed">{language === 'ar' ? 'خــط متقطّع متوازي (Dashed)' : 'Dashed'}</option>
                        <option value="dotted">{language === 'ar' ? 'نِقاط متتالية (Dotted)' : 'Dotted'}</option>
                        <option value="double">{language === 'ar' ? 'خـــط مزدوج سميك (Double)' : 'Double'}</option>
                        <option value="none">{language === 'ar' ? 'بلا حدود (مخفي)' : 'None'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'سمك الخطوط الداخلية للمربعات:' : 'Inner cells border width:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="0.5" 
                          max="4" 
                          step="0.5" 
                          value={parseFloat(settings.tableBorderWidth || '1')} 
                          onChange={(e) => setSettings({ ...settings, tableBorderWidth: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.tableBorderWidth || '1px'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'سمك الإطار الخارجي للجدول:' : 'Table outer frame thickness:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          step="0.5" 
                          value={parseFloat(settings.tableOuterBorderWidth || '1.5')} 
                          onChange={(e) => setSettings({ ...settings, tableOuterBorderWidth: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.tableOuterBorderWidth || '1.5px'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'لون الخطوط الداخلية للجدول:' : 'Inner Line colors:'}</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={settings.tableBorderColor || '#cbd5e1'} 
                          onChange={(e) => setSettings({ ...settings, tableBorderColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-200 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={settings.tableBorderColor || '#cbd5e1'} 
                          onChange={(e) => setSettings({ ...settings, tableBorderColor: e.target.value })}
                          className="w-full p-1 bg-slate-50 text-slate-600 font-mono text-[9px] rounded border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'لون الإطار الخارجي للجدول:' : 'Outer Frame border color:'}</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={settings.tableOuterBorderColor || settings.primaryColor} 
                          onChange={(e) => setSettings({ ...settings, tableOuterBorderColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-200 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={settings.tableOuterBorderColor || settings.primaryColor} 
                          onChange={(e) => setSettings({ ...settings, tableOuterBorderColor: e.target.value })}
                          className="w-full p-1 bg-slate-50 text-slate-600 font-mono text-[9px] rounded border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Part 3: Spacings & Layout alignment (Move them) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-purple-700 flex items-center gap-1.5 uppercase tracking-widest">
                    <Maximize2 className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'ثالثاً: تحريك وتعديل تموضع الأقسام والجداول' : '3. Section Spaces & Positional Gaps'}
                  </h4>
                  <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-900 leading-tight">
                    {language === 'ar' ? 'هل تلاحظ أن الاستمارة تقترب من حواف الورقة عند الطباعة؟ قم بتقليص التباعد الرأسي للأقسام لتنسحب الكتل للداخل تلقائياً وتتطابق مع أبعاد ورقة الـ A4 بالتمام.' : 'Is the content spilling to secondary pages? Use the sliders below to move and contract the gaps between modules dynamically:'}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'حجم الفجوات بين أقسام الاستمارة العامة:' : 'General sections Gap spacing:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="4" 
                          max="30" 
                          step="1" 
                          value={parseInt(settings.sectionSpacingY || '12')} 
                          onChange={(e) => setSettings({ ...settings, sectionSpacingY: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.sectionSpacingY || '12px'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'مسافة الفراغ أعلى الجداول:' : 'Table Top margin spacer:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          step="2" 
                          value={parseInt(settings.tableMarginTop || '0')} 
                          onChange={(e) => setSettings({ ...settings, tableMarginTop: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.tableMarginTop || '0px'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'مسافة الفراغ أسفل الجداول:' : 'Table Bottom spacer:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          step="2" 
                          value={parseInt(settings.tableMarginBottom || '0')} 
                          onChange={(e) => setSettings({ ...settings, tableMarginBottom: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.tableMarginBottom || '0px'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'الفراغ أسفل الترويسة الرئيسية:' : 'Header bottom margin:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          step="2" 
                          value={parseInt(settings.headerMarginBottom || '12')} 
                          onChange={(e) => setSettings({ ...settings, headerMarginBottom: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.headerMarginBottom || '12px'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 block">{language === 'ar' ? 'مسافة أسفل صندوق المعلومات:' : 'Meta bottom:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="0" 
                          max="30" 
                          step="2" 
                          value={parseInt(settings.metaMarginBottom || '12')} 
                          onChange={(e) => setSettings({ ...settings, metaMarginBottom: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.metaMarginBottom || '12px'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 block">{language === 'ar' ? 'مسافة كتل التواقيع السفلية:' : 'Signature block spacer:'}</label>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="range" 
                          min="4" 
                          max="40" 
                          step="2" 
                          value={parseInt(settings.signaturesPaddingY || '16')} 
                          onChange={(e) => setSettings({ ...settings, signaturesPaddingY: `${e.target.value}px` })}
                          className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{settings.signaturesPaddingY || '16px'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 7: SIGNATURES & LAYOUT (التوقيعات والإنماء والرمزيات) */}
            {activeSubTab === 'signatures_layout' && (
              <div className="space-y-4 animate-in fade-in duration-200 max-h-[380px] overflow-y-auto pr-1">
                <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-[11px] text-purple-900 leading-normal font-sans">
                  {language === 'ar' ? 'ضبط أقسام الإقرارات والإنماء وتخطيط كتل التوقيعات الرسمية:' : 'Configure labels & layouts for signatures blocks and proposals:'}
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-slate-500 block">{language === 'ar' ? 'عنوان قسم برامج الإنماء والتمكين المقترحة:' : 'Development Proposals Section Title:'}</label>
                  <input type="text" value={settings.sectionDevelopmentAr || ''} onChange={(e) => setSettings({ ...settings, sectionDevelopmentAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'مشرف مطابقة المادة:' : 'Auditor Sign title:'}</label>
                    <input type="text" value={settings.sectionAuditorSignAr || ''} onChange={(e) => setSettings({ ...settings, sectionAuditorSignAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500">{language === 'ar' ? 'مدير المدرسة المصادق:' : 'Admin Principal title:'}</label>
                    <input type="text" value={settings.sectionPrincipalSignAr || ''} onChange={(e) => setSettings({ ...settings, sectionPrincipalSignAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10.5px] font-black text-slate-500 block">{language === 'ar' ? 'إقرار وتوقيع المعلم القائم بالرصد:' : 'Teacher acknowledgement & sig title:'}</label>
                  <input type="text" value={settings.sectionTeacherSignAr || ''} onChange={(e) => setSettings({ ...settings, sectionTeacherSignAr: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'لون خلفية رأس الجدول:' : 'Table Header Background:'}</label>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={settings.tableHeaderBg || '#f8fafc'} 
                        onChange={(e) => setSettings({ ...settings, tableHeaderBg: e.target.value })}
                        className="w-7 h-7 rounded-md cursor-pointer border border-slate-200"
                      />
                      <input 
                        type="text" 
                        value={settings.tableHeaderBg || '#f8fafc'} 
                        onChange={(e) => setSettings({ ...settings, tableHeaderBg: e.target.value })}
                        className="w-full p-1.5 bg-slate-50 text-slate-600 font-mono text-[10px] rounded-md border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">{language === 'ar' ? 'تخطيط التوقيعات:' : 'Signatures Layout Flow:'}</label>
                    <select
                      value={settings.signatureLayout || 'horizontal'}
                      onChange={(e) => setSettings({ ...settings, signatureLayout: e.target.value as any })}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <option value="horizontal">{language === 'ar' ? 'أفقي متجاور (2 أو 3 أعمدة)' : 'Horizontal Columns'}</option>
                      <option value="vertical">{language === 'ar' ? 'رأسي متتالي (حجم ممتد)' : 'Vertical Flow'}</option>
                    </select>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-700 block">{language === 'ar' ? 'إدراج خانة توقيع المعلم القائم بالرصد:' : 'Include Teacher Aknowledgement Block:'}</span>
                      <span className="text-[9.5px] text-slate-400 block">{language === 'ar' ? 'يمنح المعلم مساحة للتوقيع للتأكد من مراجعته التعديلات' : 'Mandatory signature row for the teacher'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.showTeacherSignature !== false}
                        onChange={(e) => setSettings({ ...settings, showTeacherSignature: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/40 pt-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-700 block">{language === 'ar' ? 'خلفية البطاقة الكلية للمستند الكلي:' : 'Sheet Canvas Background Frame:'}</span>
                    </div>
                    <select
                      value={settings.cardBackgroundType || 'plain'}
                      onChange={(e) => setSettings({ ...settings, cardBackgroundType: e.target.value as any })}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <option value="plain">{language === 'ar' ? 'أبيض ناصع معتدل' : 'Plain Pure White'}</option>
                      <option value="shaded">{language === 'ar' ? 'رمادي خفيف هادئ للطباعة' : 'Soft Printing Shade'}</option>
                      <option value="subtle-grid">{language === 'ar' ? 'شبكة هندسية هندسية رقيقة' : 'Technical Micro-Grid'}</option>
                    </select>
                  </div>

                  <div className="border-t border-slate-200/40 pt-3 space-y-2">
                    <span className="text-xs font-black text-purple-800 block">
                      {language === 'ar' ? 'تحديد ومحاذاة موضع الختم للمدير:' : 'Configure Default Stamp Placement:'}
                    </span>
                    <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
                      {language === 'ar' 
                        ? 'يمكنك سحب الختم الأزرق مباشرة داخل نموذج معاينة المستند (على اليسار)، أو تحريكه بالبكسل بالأسفل لضبط المحاذاة الافتراضية بدقة:' 
                        : 'Drag the blue stamp directly inside the simulator preview, or use the micro-sliders below:'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 flex justify-between">
                          <span>{language === 'ar' ? 'الإزاحة الأفقية X:' : 'Horizontal X:'}</span>
                          <span className="font-mono text-purple-700 font-bold">{settings.stampOffsetX || 0}px</span>
                        </label>
                        <input 
                          type="range" 
                          min="-150" 
                          max="150" 
                          value={settings.stampOffsetX || 0} 
                          onChange={(e) => setSettings({ ...settings, stampOffsetX: parseInt(e.target.value) || 0 })}
                          className="w-full accent-purple-600"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 flex justify-between">
                          <span>{language === 'ar' ? 'الإزاحة الرأسية Y:' : 'Vertical Y:'}</span>
                          <span className="font-mono text-purple-700 font-bold">{settings.stampOffsetY || 0}px</span>
                        </label>
                        <input 
                          type="range" 
                          min="-150" 
                          max="150" 
                          value={settings.stampOffsetY || 0} 
                          onChange={(e) => setSettings({ ...settings, stampOffsetY: parseInt(e.target.value) || 0 })}
                          className="w-full accent-purple-600"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, stampOffsetX: 0, stampOffsetY: 0 })}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-transform active:scale-[0.98] cursor-pointer"
                    >
                      {language === 'ar' ? 'إعادة تعيين موضع الختم للوضع الافتراضي' : 'Reset Stamp Coordinates to Default (0,0)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 border-t border-slate-100 pt-5 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'ar' ? 'جاري تفعيل التصميم...' : 'Deploying style...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ واعتماد التصميم للجميع' : 'Deploy Template Globally'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-amber-900 text-xs font-bold leading-relaxed space-y-1">
          <div className="flex items-center gap-2 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{language === 'ar' ? 'صلاحيات إدارية حصرية للمدير' : 'Exclusive Portal Admin Controls'}</span>
          </div>
          <p className="text-[11px] font-medium text-amber-700 leading-normal">
            {language === 'ar' 
              ? 'بصفتك مدير البوابة، أي تعديل على هذه اللوحة يُعمم فوراً على كافة المدارس والمدققين بالوزارة. ستظهر الاستمارة بالتنسيق الجديد لكافة مستخدمي النظام عند رصد الدرجات أو معاينتها أو تنزيلها بصيغة PDF.' 
              : 'As Admin, styling changes are immediately broadcast. Custom styles are pulled dynamically when users read, sign, and print their forms.'}
          </p>
        </div>
      </div>

      {/* Left Column: Interactive Live Document Simulator */}
      <div className="lg:col-span-7 flex flex-col space-y-3">
        <div className="flex flex-wrap gap-2 items-center justify-between px-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-purple-600 animate-pulse" />
            {language === 'ar' ? 'محاكي المعاينة الحية للاستمارة (التفاعلي)' : 'Live Interactive Form Simulator'}
          </span>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm shadow-sm py-1 px-2.5 rounded-full border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">
              {language === 'ar' ? 'تعديل المعاينة الحية لتظهر بالكامل:' : 'Live Zoom Scale:'}
            </span>
            <input 
              type="range" 
              min="0.35" 
              max="1.0" 
              step="0.05" 
              value={previewScale} 
              onChange={(e) => setPreviewScale(parseFloat(e.target.value))} 
              className="w-20 md:w-28 h-1 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600 h-1"
            />
            <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-1.5 py-0.5 rounded border border-purple-250">
              {Math.round(previewScale * 100)}%
            </span>
          </div>
        </div>

        {/* WORD MARGINS SELECTION TOOLBAR */}
        <div className="bg-white border text-right border-slate-200/60 rounded-3xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm select-none" style={{ direction: 'rtl' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-rose-100 flex items-center justify-center text-rose-700">
                <span className="text-[9px] font-black">W</span>
              </div>
              <span className="text-xs font-black text-slate-800">
                {language === 'ar' ? 'أبعاد وهوامش الصفحة (نمط ميكروسوفت وورد):' : 'MS Word Print Margins Presets:'}
              </span>
              {autoSaveStatus && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250/50 px-2 py-0.5 rounded-full animate-pulse mr-2">
                  {autoSaveStatus}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-550 font-medium">
              {language === 'ar' ? 'اختر تهيئة الهوامش لضبط هوامش الصفحة وأبعاد مستند الطباعة فورياً:' : 'Select quick margin styles modeled after Microsoft Word formatting:'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1.5 items-center justify-start">
            {[
              {
                id: 'balanced',
                nameAr: 'متوازن (الافتراضي)',
                nameEn: 'Balanced',
                x: '12mm',
                y: '10mm',
                pad: '6mm 8mm',
                descAr: 'المعتمد',
                descEn: 'Default'
              },
              {
                id: 'narrow',
                nameAr: 'ضيق (Narrow)',
                nameEn: 'Narrow',
                x: '8mm',
                y: '8mm',
                pad: '4mm 5mm',
                descAr: 'حجم مدمج',
                descEn: 'Narrow'
              },
              {
                id: 'ultra',
                nameAr: 'ضيق جداً (Ultra)',
                nameEn: 'Ultra Narrow',
                x: '5mm',
                y: '5mm',
                pad: '3mm 4mm',
                descAr: 'أقصى اتساع',
                descEn: 'Compact-X'
              },
              {
                id: 'normal',
                nameAr: 'عادي (Normal)',
                nameEn: 'Normal',
                x: '25mm',
                y: '25mm',
                pad: '10mm 12mm',
                descAr: 'هوامش وورد',
                descEn: 'Standard Word'
              },
              {
                id: 'moderate',
                nameAr: 'معتدل (Moderate)',
                nameEn: 'Moderate',
                x: '19mm',
                y: '25mm',
                pad: '8mm 10mm',
                descAr: 'متوسط الأبعاد',
                descEn: 'Moderate Y'
              }
            ].map((m) => {
              const isSelected = settings.printPageMarginX === m.x && settings.printPageMarginY === m.y;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    updateAndSaveSettings({
                      ...settings,
                      printPageMarginX: m.x,
                      printPageMarginY: m.y,
                      printPagePadding: m.pad
                    });
                  }}
                  className={`px-2.5 py-1 rounded-xl border-1.5 text-[10px] font-black text-right flex flex-col items-start min-w-[102px] cursor-pointer transition-all duration-150 active:scale-[0.97] ${
                    isSelected 
                      ? 'border-rose-600 bg-rose-50/75 text-rose-800 shadow-sm font-extrabold'
                      : 'border-slate-200/50 bg-slate-50/50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <span>{language === 'ar' ? m.nameAr : m.nameEn}</span>
                  <span className="text-[8px] opacity-75 font-mono mt-0.5">
                    {language === 'ar' ? m.descAr : m.descEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Simulated Document Container */}
        <div className="bg-slate-100/40 border border-slate-200/50 rounded-3xl p-4 overflow-auto shadow-inner flex justify-center items-start min-h-[500px]">
          {/* Virtual Paper Sheet Wrapper (A4 297mm x 210mm in light gray slate bg representation to visualize page margins clearly) */}
          <div
            className="bg-slate-200 rounded shadow-2xl relative flex items-center justify-center border border-slate-300 pointer-events-auto select-none"
            style={{
              width: '297mm',
              minWidth: '297mm',
              height: '210mm',
              minHeight: '210mm',
              zoom: previewScale,
              boxSizing: 'border-box'
            }}
          >
            <div 
              className="admin-form-simulation rounded hover:shadow-lg relative border sim-border-accent bg-white transition-all duration-200 flex flex-col justify-between"
              style={{ 
                direction: 'rtl',
                width: `calc(297mm - 2 * ${settings.printPageMarginX || '12mm'})`,
                height: `calc(210mm - 2 * ${settings.printPageMarginY || '10mm'})`,
                padding: settings.printPagePadding || '6mm 8mm',
                fontFamily: settings.primaryFont,
                backgroundColor: settings.cardBackgroundType === 'shaded' ? '#f4f4f5' : '#ffffff',
                backgroundImage: settings.cardBackgroundType === 'subtle-grid' 
                  ? 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)' 
                  : 'none',
                backgroundSize: settings.cardBackgroundType === 'subtle-grid' ? '12px 12px' : 'auto',
                borderWidth: `${settings.borderWidth}px`,
                borderStyle: settings.borderStyle || 'solid',
                borderColor: settings.primaryColor,
                boxSizing: 'border-box'
              }}
            >
            
            {/* Simulated Watermark overlay */}
            {settings.showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <div className="sim-watermark text-[24px] font-black opacity-35 rotate-[-30deg] uppercase tracking-wide whitespace-normal text-center select-none" style={{ color: settings.primaryColor }}>
                  {settings.watermarkText || 'وزارة التربية والتعليم - وثيقة فحص رسمية'}
                </div>
              </div>
            )}

            {/* Visual Guideline showing the Padding Boundary like Word Margins */}
            <div className="absolute inset-0 border border-dashed border-rose-300/20 pointer-events-none z-0 rounded" style={{ margin: settings.printPagePadding || '6mm 8mm' }}>
              <div className="absolute top-1 right-2 font-mono text-[7px] text-rose-500/35 tracking-wider select-none">
                {language === 'ar' ? 'حدود هامش الصفحة الافتراضي (Word Margin Limit)' : 'Default MS Word Margin boundary'}
              </div>
            </div>

            <div 
              className="relative z-10 flex flex-col justify-between h-full w-full" 
              style={{ 
                gap: settings.sectionSpacingY || '12px',
                transform: `scale(${parseFloat(settings.printZoom || '100%') / 100})`,
                transformOrigin: 'top center',
                boxSizing: 'border-box'
              }}
            >
              
              {/* Header Grid Section */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-3" style={{ borderColor: settings.primaryColor, marginBottom: settings.headerMarginBottom || '12px' }}>
                
                {/* Right side: MOE Logo plus dynamic translation title */}
                <div className="flex items-center gap-2.5 text-right w-[33%]">
                  <img 
                    src={logoMoe} 
                    alt="Oman Ministry of Education Logo" 
                    className="w-12 h-12 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="leading-tight shrink-0">
                    <h4 className="sim-title tracking-tight font-black text-[13px]" style={{ color: settings.primaryColor }}>
                      {settings.titleTextAr}
                    </h4>
                    <p className="text-[9.5px] leading-relaxed text-slate-500 whitespace-pre-line mt-0.5 font-bold" style={{ fontSize: settings.metaSize }}>
                      {settings.subTitleTextAr || 'SULTANATE OF OMAN'}
                    </p>
                  </div>
                </div>

                {/* Center side: Primary Page Header Text & Subtext */}
                <div className="text-center w-[34%] space-y-1">
                  <h2 className="font-sans leading-relaxed tracking-normal font-black text-center" style={{ fontSize: settings.titleSize, color: settings.primaryColor }}>
                    {language === 'ar' ? (settings.reportTitleAr || 'استمارة الفحص والتدقيق المستمر') : (settings.reportTitleEn || 'Continuous Assessment Auditing & Moderation Form')}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {language === 'ar' ? 'عملية الفحص والتدقيق المستمر لمخرجات التعليم' : 'Learning Outcomes Inspection & Verification Process'}
                  </p>
                </div>

                {/* Left side: Oman Vision 2040 logo and tagline */}
                <div className="flex items-center gap-2 text-left justify-end w-[33%]">
                  <div className="text-left select-none leading-tight">
                    <div className="font-extrabold text-[12px]" style={{ color: settings.primaryColor }}>
                      {language === 'ar' ? 'رؤية عُمان 2040' : 'Oman Vision 2040'}
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold mt-0.5 max-w-[150px]">
                      {language === 'ar' ? 'نسعى بثقة لتأمين مخرجات التعليم' : 'Securing educational outcomes with faith'}
                    </div>
                  </div>
                  <img 
                    src={logoVision} 
                    alt="Oman Vision 2040" 
                    className="w-[45px] h-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

              </div>

              {/* Meta information area: Divided into left/right blocks exactly like the MoE Landscape blueprint */}
              <div className="grid grid-cols-12 gap-3 text-slate-800" style={{ fontSize: settings.metaSize, marginBottom: settings.metaMarginBottom || '12px' }}>
                
                {/* Right block: Form details (col-span-5) */}
                <div className="col-span-5 border rounded overflow-hidden bg-white flex flex-col justify-between" style={{ borderColor: settings.primaryColor }}>
                  <div className="text-center text-white py-1 px-2 font-black text-[11px] leading-snug" style={{ backgroundColor: settings.primaryColor }}>
                    {language === 'ar' ? 'بيانات استمارة الفحص والتدقيق المستمر' : 'Auditing System Metadata'}
                  </div>
                  <table className="w-full text-[11.5px] border-collapse leading-normal text-right">
                    <tbody>
                      <tr className="border-b bg-slate-50/40" style={{ borderColor: `${settings.primaryColor}25` }}>
                        <td className="font-extrabold w-24 p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>المادة الدراسية:</td>
                        <td className="p-1.5 text-slate-700 font-bold">التربية الإسلامية</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: `${settings.primaryColor}25` }}>
                        <td className="font-extrabold p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>العام الدراسي:</td>
                        <td className="p-1.5 text-slate-755 font-mono font-bold">2025 / 2026 م</td>
                      </tr>
                      <tr className="bg-slate-50/40">
                        <td className="font-extrabold p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>الفصل الدراسي:</td>
                        <td className="p-1.5 text-slate-700 font-bold">الفصل الدراسي الثاني</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Left block: Targeted teacher details (col-span-7) */}
                <div className="col-span-7 border rounded overflow-hidden bg-white text-right" style={{ borderColor: settings.primaryColor }}>
                  <div className="text-center text-white py-1 px-2 font-black text-[11px] leading-snug" style={{ backgroundColor: settings.primaryColor }}>
                    {language === 'ar' ? 'بيانات المعلم المستهدف بالفحص والمتابعة' : 'Target Teacher & School Profile'}
                  </div>
                  <table className="w-full text-[11.5px] border-collapse text-right leading-normal">
                    <tbody>
                      <tr className="border-b bg-slate-50/20" style={{ borderColor: `${settings.primaryColor}25` }}>
                        <td className="font-extrabold w-20 p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>الاسم:</td>
                        <td className="p-1.5 text-slate-700 font-bold whitespace-nowrap" colSpan={3}>أ. سهيل بن عامر الجنيبي</td>
                      </tr>
                      <tr className="border-b" style={{ borderColor: `${settings.primaryColor}25` }}>
                        <td className="font-extrabold p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>رقم الملف:</td>
                        <td className="p-1.5 text-slate-700 font-mono font-bold">928341</td>
                        <td className="font-extrabold p-1.5 border-l border-r text-right text-[#821315] font-sans" style={{ borderColor: `${settings.primaryColor}25` }}>سنة التعيين:</td>
                        <td className="p-1.5 text-slate-700 font-mono font-bold">2018</td>
                      </tr>
                      <tr className="border-b bg-slate-50/20" style={{ borderColor: `${settings.primaryColor}25` }}>
                        <td className="font-extrabold p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>المديرية:</td>
                        <td className="p-1.5 text-slate-700 font-bold leading-tight" colSpan={3}>المديرية العامة للتعليم بمحافظة الوسطى</td>
                      </tr>
                      <tr>
                        <td className="font-extrabold p-1.5 border-l text-black text-right" style={{ borderColor: `${settings.primaryColor}25` }}>المدرسة:</td>
                        <td className="p-1.5 text-slate-700 font-bold font-sans">Al-Azaiba Basic Education School</td>
                        <td className="font-extrabold p-1.5 border-l border-r text-right text-black font-sans" style={{ borderColor: `${settings.primaryColor}25` }}>تاريخ الزيارة:</td>
                        <td className="p-1.5 text-slate-700 font-mono font-bold">2026-06-08</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Side-by-side Section: Grades Audit Ledger (Right) & Technical Observations (Left) */}
              <div className="grid grid-cols-12 gap-3.5" style={{ marginTop: settings.tableMarginTop || '0px', marginBottom: settings.tableMarginBottom || '0px' }}>
                
                {/* Right col-span-5: Student Sample Grades Table */}
                <div className="col-span-5 flex flex-col gap-2">
                  {/* Table Title bar */}
                  <div className="bg-[#821315]/5 text-[#821315] border border-[#821315]/30 text-center py-1 font-black text-xs rounded shadow-sm">
                    {language === 'ar' ? 'جدول رصد ومطابقة عينة درجات الطلاب والمشغولات الدراسية' : 'Student sample grades audit result ledger'}
                  </div>

                  {/* Primary Table Sample: loaded with exact PDF items */}
                  <div className="overflow-hidden rounded border border-slate-200 bg-white relative group/table-widget">
                    {/* Size Control Overlay */}
                    <div className="absolute top-1.5 left-1.5 z-30 opacity-70 group-hover/table-widget:opacity-100 transition-all select-none flex items-center gap-1 bg-white/95 border border-purple-200 shadow-sm p-1 rounded-xl" style={{ direction: 'rtl' }}>
                      <span className="text-[9px] font-black text-[#821315] ml-1">{language === 'ar' ? 'حجم الجدول:' : 'Table Size:'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentBody = parseInt(settings.tableBodySize || '12') || 12;
                          const currentHeader = parseInt(settings.tableHeaderSize || '13') || 13;
                          const currentPadding = parseInt(settings.tablePaddingY || '8') || 8;
                          const nextBody = Math.max(8, currentBody - 1) + 'px';
                          const nextHeader = Math.max(9, currentHeader - 1) + 'px';
                          const nextPadding = Math.max(2, currentPadding - 1) + 'px';
                          updateAndSaveSettings({
                            ...settings,
                            tableBodySize: nextBody,
                            tableHeaderSize: nextHeader,
                            tablePaddingY: nextPadding
                          });
                        }}
                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-[#821315] font-black rounded flex items-center justify-center text-[11px] cursor-pointer"
                        title={language === 'ar' ? "تصغير الجدول" : "Shrink table"}
                      >
                        -
                      </button>
                      <span className="text-[9.5px] font-black text-slate-700 px-1 font-mono">
                        {settings.tableBodySize}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentBody = parseInt(settings.tableBodySize || '12') || 12;
                          const currentHeader = parseInt(settings.tableHeaderSize || '13') || 13;
                          const currentPadding = parseInt(settings.tablePaddingY || '8') || 8;
                          const nextBody = Math.min(24, currentBody + 1) + 'px';
                          const nextHeader = Math.min(26, currentHeader + 1) + 'px';
                          const nextPadding = Math.min(20, currentPadding + 1) + 'px';
                          updateAndSaveSettings({
                            ...settings,
                            tableBodySize: nextBody,
                            tableHeaderSize: nextHeader,
                            tablePaddingY: nextPadding
                          });
                        }}
                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-emerald-700 font-black rounded flex items-center justify-center text-[11px] cursor-pointer"
                        title={language === 'ar' ? "تكبير الجدول" : "Enlarge table"}
                      >
                        +
                      </button>
                    </div>
                    <table className="w-full text-right sim-table border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: settings.tableHeaderBg || '#f8fafc', fontSize: settings.tableHeaderSize }}>
                          <th className="p-1.5 text-center border-b border-slate-200 font-black w-8">{settings.colIdAr || 'م'}</th>
                          <th className="p-1.5 border-b border-slate-200 font-black w-36">{settings.colStudentNameAr || 'اسم الطالب/ة'}</th>
                          <th className="p-1.5 text-center border-b border-slate-200 font-black w-10">{settings.colClassAr || 'الصف'}</th>
                          <th className="p-1.5 text-center border-b border-slate-200 font-black w-16">{settings.colToolAr || 'الأداة'}</th>
                          <th className="p-1.5 text-center border-b border-slate-200 font-black w-16" colSpan={2}>
                            <div className="text-center font-black leading-tight mb-0.5 text-[9px]">{language === 'ar' ? 'الدرجـــة' : 'Grade'}</div>
                            <div className="grid grid-cols-2 text-[8px] border-t border-slate-300 pt-0.5 font-bold">
                              <span>{settings.colScoreBeforeAr || 'قبل'}</span>
                              <span>{settings.colScoreAfterAr || 'بعد'}</span>
                            </div>
                          </th>
                          <th className="p-1.5 border-b border-slate-200 font-black">{settings.colReasonAr || 'سبب التعديل والقرار الفني والفرز والمطابقة بوزارة التعليم'}</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: settings.tableBodySize }}>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/45">
                          <td className="p-1.5 text-center font-bold text-slate-500">1</td>
                          <td className="p-1.5 font-bold text-slate-800 text-[10.5px]">سالم بن أحمد الجنيبي</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-bold text-[10px]">اختبار قصير 1</td>
                          <td className="p-1.5 text-center font-mono font-bold bg-slate-50/75" style={{ fontFamily: settings.monoFont }}>10</td>
                          <td className="p-1.5 text-center font-mono font-black text-black" style={{ fontFamily: settings.monoFont }}>10</td>
                          <td className="p-1.5 text-[10px] font-bold text-slate-500">لا يوجد</td>
                        </tr>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/45">
                          <td className="p-1.5 text-center font-bold text-slate-500">2</td>
                          <td className="p-1.5 font-bold text-slate-800 text-[10.5px]">منى بنت عبدالله الوهيبية</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-bold text-[10px]">اختبار قصير 1</td>
                          <td className="p-1.5 text-center font-mono font-bold bg-slate-50/75" style={{ fontFamily: settings.monoFont }}>9</td>
                          <td className="p-1.5 text-center font-mono font-black text-black" style={{ fontFamily: settings.monoFont }}>9</td>
                          <td className="p-1.5 text-[10px] font-bold text-slate-500">لا يوجد</td>
                        </tr>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/45">
                          <td className="p-1.5 text-center font-bold text-slate-500">3</td>
                          <td className="p-1.5 font-bold text-slate-800 text-[10.5px]">سليمان بن علي الجنيبي</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-bold text-[10px]">واجب منزلي أول</td>
                          <td className="p-1.5 text-center font-mono font-bold bg-slate-50/75" style={{ fontFamily: settings.monoFont }}>5</td>
                          <td className="p-1.5 text-center font-mono font-black text-black" style={{ fontFamily: settings.monoFont }}>5</td>
                          <td className="p-1.5 text-[10px] font-bold text-slate-500">لا يوجد</td>
                        </tr>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/45 bg-red-50/20">
                          <td className="p-1.5 text-center font-bold text-[#821315]">4</td>
                          <td className="p-1.5 font-extrabold text-slate-850 text-[10.5px]">فاطمة بنت حميد المهرية</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium font-mono">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-extrabold text-[10px]">اختبار قصير 2</td>
                          <td className="p-1.5 text-center font-mono font-bold line-through text-red-500 bg-red-50/40" style={{ fontFamily: settings.monoFont }}>8</td>
                          <td className="p-1.5 text-center font-mono font-black text-red-700 bg-red-50" style={{ fontFamily: settings.monoFont }}>7</td>
                          <td className="p-1.5 text-[9px] font-black text-red-600">
                            <span className="px-1.5 py-0.5 bg-red-50 border border-red-200 rounded font-black">رمز: 4</span>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/45">
                          <td className="p-1.5 text-center font-bold text-slate-500">5</td>
                          <td className="p-1.5 font-bold text-slate-800 text-[10.5px]">أحمد بن سعيد الوهيبي</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-bold text-[10px]">عرض تقديمي</td>
                          <td className="p-1.5 text-center font-mono font-bold bg-slate-50/75" style={{ fontFamily: settings.monoFont }}>10</td>
                          <td className="p-1.5 text-center font-mono font-black text-black" style={{ fontFamily: settings.monoFont }}>10</td>
                          <td className="p-1.5 text-[10px] font-bold text-slate-500">لا يوجد</td>
                        </tr>
                        <tr className="border-b border-slate-150 hover:bg-slate-50/45">
                          <td className="p-1.5 text-center font-bold text-slate-500">6</td>
                          <td className="p-1.5 font-bold text-slate-800 text-[10.5px]">مريم بنت حمد الجنيبية</td>
                          <td className="p-1.5 text-center text-slate-500 font-medium">7/1</td>
                          <td className="p-1.5 text-center text-slate-600 font-bold text-[10px]">أداء عملي غنائي</td>
                          <td className="p-1.5 text-center font-mono font-bold bg-slate-50/75" style={{ fontFamily: settings.monoFont }}>12</td>
                          <td className="p-1.5 text-center font-mono font-black text-black" style={{ fontFamily: settings.monoFont }}>12</td>
                          <td className="p-1.5 text-[10px] font-bold text-slate-500">لا يوجد</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Left col-span-7: Technical Observations */}
                <div className="col-span-7 border border-slate-200 rounded overflow-hidden bg-white text-right font-sans flex flex-col justify-between relative group/table-widget">
                  {/* Size Control Overlay */}
                  <div className="absolute top-1.5 left-1.5 z-30 opacity-70 group-hover/table-widget:opacity-100 transition-all select-none flex items-center gap-1 bg-white/95 border border-purple-200 shadow-sm p-1 rounded-xl" style={{ direction: 'rtl' }}>
                    <span className="text-[9px] font-black text-[#821315] ml-1">{language === 'ar' ? 'حجم الجدول:' : 'Table Size:'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentBody = parseInt(settings.tableBodySize || '12') || 12;
                        const currentHeader = parseInt(settings.tableHeaderSize || '13') || 13;
                        const currentPadding = parseInt(settings.tablePaddingY || '8') || 8;
                        const nextBody = Math.max(8, currentBody - 1) + 'px';
                        const nextHeader = Math.max(9, currentHeader - 1) + 'px';
                        const nextPadding = Math.max(2, currentPadding - 1) + 'px';
                        updateAndSaveSettings({
                          ...settings,
                          tableBodySize: nextBody,
                          tableHeaderSize: nextHeader,
                          tablePaddingY: nextPadding
                        });
                      }}
                      className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-[#821315] font-black rounded flex items-center justify-center text-[11px] cursor-pointer"
                      title={language === 'ar' ? "تصغير الجدول" : "Shrink table"}
                    >
                      -
                    </button>
                    <span className="text-[9.5px] font-black text-slate-700 px-1 font-mono">
                      {settings.tableBodySize}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentBody = parseInt(settings.tableBodySize || '12') || 12;
                        const currentHeader = parseInt(settings.tableHeaderSize || '13') || 13;
                        const currentPadding = parseInt(settings.tablePaddingY || '8') || 8;
                        const nextBody = Math.min(24, currentBody + 1) + 'px';
                        const nextHeader = Math.min(26, currentHeader + 1) + 'px';
                        const nextPadding = Math.min(20, currentPadding + 1) + 'px';
                        updateAndSaveSettings({
                          ...settings,
                          tableBodySize: nextBody,
                          tableHeaderSize: nextHeader,
                          tablePaddingY: nextPadding
                        });
                      }}
                      className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-emerald-700 font-black rounded flex items-center justify-center text-[11px] cursor-pointer"
                      title={language === 'ar' ? "تكبير الجدول" : "Enlarge table"}
                    >
                      +
                    </button>
                  </div>
                  <div className="bg-[#821315]/5 text-[#821315] px-3 py-1.5 text-[11px] font-black text-center border-b border-slate-200">
                    {language === 'ar' ? 'الملاحظات الفنية على أدوات التقويم المستمر (التقرير المعتمد للجنة)' : 'Technical Observations / Audit Comments'}
                  </div>
                  <table className="w-full text-right text-[11px] border-collapse leading-normal font-sans flex-1">
                    <thead>
                      <tr className="bg-slate-50 text-slate-650 font-black text-[10.5px] border-b border-slate-200">
                        <th className="py-1.5 px-3 border-l border-slate-200 text-center w-24">الصف</th>
                        <th className="py-1.5 px-3 border-l border-slate-200 w-48">أداة التقويم</th>
                        <th className="py-1.5 px-3">موجز الملاحظات الوزارية والفنية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-[10.5px]">
                      <tr className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-3 border-l border-slate-150 text-center text-[#821315] bg-[#821315]/5 font-black">الصف السابع</td>
                        <td className="py-2.5 px-3 border-l border-slate-150">الاختبار القصير الأول</td>
                        <td className="py-2.5 px-3 text-slate-900 font-black leading-relaxed">ملاحظة رقم (1)</td>
                      </tr>
                      <tr className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-3 border-l border-slate-150 text-center text-[#821315] bg-[#821315]/5 font-black">الصف السابع</td>
                        <td className="py-2.5 px-3 border-l border-slate-150">الواجب المنزلي والأعمال</td>
                        <td className="py-2.5 px-3 text-slate-900 font-black leading-relaxed">ملاحظة رقم (2)</td>
                      </tr>
                      <tr className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-3 border-l border-slate-150 text-center text-[#821315] bg-[#821315]/5 font-black">الصف السابع</td>
                        <td className="py-2.5 px-3 border-l border-slate-150">الاختبار القصير الثاني</td>
                        <td className="py-2.5 px-3 text-slate-900 font-black leading-relaxed">ملاحظة رقم (3)</td>
                      </tr>
                      <tr className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-3 border-l border-slate-150 text-center text-[#821315] bg-[#821315]/5 font-black">الصف السابع</td>
                        <td className="py-2.5 px-3 border-l border-slate-150">التقييم العملي/الأدائي</td>
                        <td className="py-2.5 px-3 text-slate-900 font-black leading-relaxed">ملاحظة رقم (4)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Bottom Footer Bar with Suggested Program and signatures (4 columns) */}
              <div className="border border-slate-250 rounded-lg overflow-hidden bg-white" style={{ fontSize: settings.metaSize, marginTop: settings.signaturesPaddingY || '16px' }}>
                <div className="flex w-full text-[11.5px] divide-x divide-x-reverse divide-slate-200">
                  
                  {/* Suggested Program column (Col 1) */}
                  <div className="text-right flex flex-col justify-center w-[32%] shrink-0 px-3" style={{ paddingTop: settings.signaturesPaddingY || '12px', paddingBottom: settings.signaturesPaddingY || '12px' }}>
                    <span className="font-extrabold text-[#821315] block text-[10.5px]">
                      {settings.sectionDevelopmentAr || 'برامج الإنماء والتمكين المهني المقترحة بالتقرير:'}
                    </span>
                    <p className="text-slate-600 font-black leading-tight mt-1">
                      برنامج إرشادي على تطوير مفردات التقويم وأدوات الرصد الفنية
                    </p>
                  </div>

                  {/* Teacher signature (Col 2) */}
                  <div className="text-right flex flex-col justify-center w-[23%] shrink-0 px-3" style={{ paddingTop: settings.signaturesPaddingY || '12px', paddingBottom: settings.signaturesPaddingY || '12px' }}>
                    <span className="font-extrabold text-[#821315] block text-[10.5px]">
                      {settings.sectionTeacherSignAr || 'معلم المادة الموقع:'}
                    </span>
                    <p className="text-slate-700 font-black mt-1 leading-none">أ. سهيل بن عامر الجنيبي</p>
                    <div className="text-[9.5px] text-indigo-600 font-mono font-bold mt-1.5 leading-none">
                      OM-SIG-5XJA-IMRY
                    </div>
                  </div>

                  {/* Expert/Auditor (Col 3) */}
                  <div className="text-right flex flex-col justify-center w-[18%] shrink-0 px-3" style={{ paddingTop: settings.signaturesPaddingY || '12px', paddingBottom: settings.signaturesPaddingY || '12px' }}>
                    <span className="font-extrabold text-[#821315] block text-[10.5px]">
                      {settings.sectionAuditorSignAr || 'مشرف فحص ومطابقة المادة:'}
                    </span>
                    <p className="text-slate-700 font-black mt-1 leading-none">Salem Al-Harthy</p>
                    <div className="text-[9.5px] text-slate-400 mt-1.5 leading-none font-bold">
                      توقيع المفتش الفني: <span className="font-mono text-purple-600">/ Salem /</span>
                    </div>
                  </div>

                  {/* Principal (Col 4) */}
                  <div className="text-right flex flex-col justify-center w-[27%] shrink-0 bg-slate-50/20 px-3 relative min-h-[96px]" style={{ paddingTop: settings.signaturesPaddingY || '12px', paddingBottom: settings.signaturesPaddingY || '12px' }}>
                    <span className="font-extrabold text-[#821315] block text-[10.5px]">
                      {settings.sectionPrincipalSignAr || 'مدير المدرسة المصادق:'}
                    </span>
                    <p className="text-slate-700 font-black mt-1 leading-none">أ. محمد بن راشد الجنيبي</p>
                    <div className="text-[9.5px] text-[#821315] font-mono font-bold mt-1.5 leading-none">
                      OM-SIG-U7VP-0Z1K
                    </div>

                    {/* Interactive Draggable Stamp representing location adjustment */}
                    <div 
                      className="absolute select-none z-20 group cursor-move hover:scale-105 active:scale-110 transition-transform duration-75 flex items-center justify-center border border-dashed border-purple-500 bg-purple-500/5 hover:border-purple-600 hover:bg-purple-100/15 rounded-full"
                      style={{
                        width: '76px',
                        height: '76px',
                        right: '12px',
                        top: '4px',
                        transform: `translate(${settings.stampOffsetX || 0}px, ${settings.stampOffsetY || 0}px) rotate(-5deg)`,
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return;
                        e.preventDefault();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const initX = settings.stampOffsetX || 0;
                        const initY = settings.stampOffsetY || 0;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const dx = moveEvent.clientX - startX;
                          const dy = moveEvent.clientY - startY;
                          // Account for previewScale to make the movement 1:1 on-screen
                          const scale = previewScale || 0.65;
                          setSettings(prev => ({
                            ...prev,
                            stampOffsetX: Math.round(initX + dx / scale),
                            stampOffsetY: Math.round(initY + dy / scale)
                          }));
                        };

                        const handleMouseUp = () => {
                          window.removeEventListener('mousemove', handleMouseMove);
                          window.removeEventListener('mouseup', handleMouseUp);
                        };

                        window.addEventListener('mousemove', handleMouseMove);
                        window.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <img
                        src={getActiveStamp()}
                        alt="Stamp Placeholder"
                        className="w-14 h-14 object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      {/* Drag handle line/badge */}
                      <span className="absolute -bottom-6 bg-purple-900 text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 select-none">
                        {language === 'ar' ? '← اسحب لضبط موضع الختم →' : '← Drag Stamp →'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
            {/* End of Virtual Paper Sheet Wrapper */}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
