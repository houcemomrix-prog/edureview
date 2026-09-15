import re

# 1. SchoolArchiveView.tsx
with open('src/components/SchoolArchiveView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_archive = """<tr className="bg-[#821315]/5 text-[#821315] font-black text-[15px]">
                            <th rowSpan={2} className="py-2 px-1.5 border-b-2 border-l border-[#821315]/45 text-center w-8 align-middle">م</th>
                            <th rowSpan={2} className="py-2 px-3 border-b-2 border-l border-[#821315]/45 text-right w-40 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                            <th rowSpan={2} className="py-2 px-2 border-b-2 border-l border-[#821315]/45 text-center w-12 align-middle">الصف</th>
                            <th rowSpan={2} className="py-2 px-3 border-b-2 border-l border-[#821315]/45 w-24 align-middle">الأداة</th>
                            <th colSpan={2} className="py-1.5 px-1 border-b border-l border-[#821315]/45 text-center w-28 bg-[#821315]/10 align-middle">
                              <div className="text-center font-black text-[15px] text-[#821315] tracking-wide">{language === 'ar' ? 'الدرجة' : 'Grade'}</div>
                            </th>
                            <th rowSpan={2} className="py-2 px-3 border-b-2 text-center border-l border-[#821315]/45 font-black text-[15px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                          </tr>
                          <tr className="bg-[#821315]/5 text-[#821315] font-black text-[14px]">
                            <th className="py-1 px-1 border-b-2 border-l border-[#821315]/45 text-center w-14 bg-[#821315]/10">{language === 'ar' ? 'قبل' : 'Before'}</th>
                            <th className="py-1 px-1 border-b-2 border-l border-[#821315]/45 text-center w-14 bg-[#821315]/10">{language === 'ar' ? 'بعد' : 'After'}</th>
                          </tr>"""

rep_archive = """<tr className="bg-[#821315]/5 text-[#821315] font-black text-[15px] border-b-2 border-[#821315]/45">
                            <th className="py-2 px-1.5 border-l border-[#821315]/45 text-center w-8 align-middle">م</th>
                            <th className="py-2 px-3 border-l border-[#821315]/45 text-right w-40 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                            <th className="py-2 px-2 border-l border-[#821315]/45 text-center w-12 align-middle">الصف</th>
                            <th className="py-2 px-3 border-l border-[#821315]/45 w-24 align-middle">الأداة</th>
                            <th className="p-0 border-l border-[#821315]/45 text-center w-28 align-top" colSpan={2}>
                              <div className="flex flex-col w-full h-full">
                                <div className="font-black text-[15px] text-[#821315] tracking-wide py-1.5 border-b border-[#821315]/45">
                                  {language === 'ar' ? 'الدرجة' : 'Grade'}
                                </div>
                                <div className="grid grid-cols-2 text-[14px] font-black h-full">
                                  <div className="flex items-center justify-center border-l border-[#821315]/45 px-1 py-1.5 bg-[#821315]/10">
                                    {language === 'ar' ? 'قبل' : 'Before'}
                                  </div>
                                  <div className="flex items-center justify-center px-1 py-1.5 bg-[#821315]/10">
                                    {language === 'ar' ? 'بعد' : 'After'}
                                  </div>
                                </div>
                              </div>
                            </th>
                            <th className="py-2 px-3 text-center border-l border-[#821315]/45 font-black text-[15px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                          </tr>"""

content = content.replace(target_archive, rep_archive)
with open('src/components/SchoolArchiveView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

t1_target = """                              <thead className="bg-slate-100">
                                <tr>
                                  <th rowSpan={2} className="py-2.5 px-2 border-b-2 border-l-2 border-black w-8 align-middle">م</th>
                                  <th rowSpan={2} className="py-2.5 px-3 border-b-2 border-l-2 border-black align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                                  <th rowSpan={2} className="py-2.5 px-3 border-b-2 border-l-2 border-black w-16 text-center align-middle">{language === 'ar' ? 'الصف' : 'Class'}</th>
                                  <th rowSpan={2} className="py-2.5 px-3 border-b-2 border-l-2 border-black w-32 align-middle">{language === 'ar' ? 'أداة التقييم' : 'Assessment Tool'}</th>
                                  <th colSpan={2} className="py-1.5 px-1 border-b-2 border-l-2 border-black w-28 text-center bg-slate-200/50 align-middle">
                                    <div className="text-center font-black text-[14px] text-slate-800 tracking-wide">{language === 'ar' ? 'الدرجة' : 'Grade'}</div>
                                  </th>
                                  <th rowSpan={2} className="py-2.5 px-3 text-center font-black border-b-2 border-black align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                                </tr>
                                <tr className="bg-slate-100">
                                  <th className="py-1 px-1 border-b-2 border-l-2 border-black text-center w-14">{language === 'ar' ? 'قبل' : 'Before'}</th>
                                  <th className="py-1 px-1 border-b-2 border-l-2 border-black text-center w-14">{language === 'ar' ? 'بعد' : 'After'}</th>
                                </tr>
                              </thead>"""

t1_rep = """                              <thead className="bg-slate-100">
                                <tr className="border-b-2 border-black">
                                  <th className="py-2.5 px-2 border-l-2 border-black w-8 align-middle">م</th>
                                  <th className="py-2.5 px-3 border-l-2 border-black align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                                  <th className="py-2.5 px-3 border-l-2 border-black w-16 text-center align-middle">{language === 'ar' ? 'الصف' : 'Class'}</th>
                                  <th className="py-2.5 px-3 border-l-2 border-black w-32 align-middle">{language === 'ar' ? 'أداة التقييم' : 'Assessment Tool'}</th>
                                  <th className="p-0 border-l-2 border-black w-28 text-center align-top" colSpan={2}>
                                    <div className="flex flex-col w-full h-full bg-slate-200/30">
                                      <div className="font-black text-[14px] text-slate-800 tracking-wide py-1.5 border-b-2 border-black">
                                        {language === 'ar' ? 'الدرجة' : 'Grade'}
                                      </div>
                                      <div className="grid grid-cols-2 text-[12px] font-black h-full">
                                        <div className="flex items-center justify-center border-l-2 border-black px-1 py-1">
                                          {language === 'ar' ? 'قبل' : 'Before'}
                                        </div>
                                        <div className="flex items-center justify-center px-1 py-1">
                                          {language === 'ar' ? 'بعد' : 'After'}
                                        </div>
                                      </div>
                                    </div>
                                  </th>
                                  <th className="py-2.5 px-3 text-center font-black align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                                </tr>
                              </thead>"""
content = content.replace(t1_target, t1_rep)

t2_target = """                                      <thead>
                                        <tr className="bg-[#821315]/5 text-[#821315] font-black text-[11px]">
                                          <th rowSpan={2} className="py-1 px-1.5 border-b border-l border-[#821315]/20 text-center w-6 align-middle">م</th>
                                          <th rowSpan={2} className="py-1 px-2 border-b border-l border-[#821315]/20 text-right w-36 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                                          <th rowSpan={2} className="py-1 px-1.5 border-b border-l border-[#821315]/20 text-center w-12 align-middle">الصف</th>
                                          <th rowSpan={2} className="py-1 px-2 border-b border-l border-[#821315]/20 w-18 align-middle">الأداة</th>
                                          <th colSpan={2} className="py-1 px-1 border-b border-l border-[#821315]/20 text-center w-24 bg-[#821315]/10 align-middle">
                                            <div className="text-center font-black text-[12px] text-[#821315] tracking-wide">{language === 'ar' ? 'الدرجة' : 'Grade'}</div>
                                          </th>
                                          <th rowSpan={2} className="py-1 px-2 text-center border-b border-l border-[#821315]/20 font-black text-[11px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                                        </tr>
                                        <tr className="bg-[#821315]/5 text-[#821315] font-black text-[11px]">
                                          <th className="py-1 px-1 border-b border-l border-[#821315]/20 text-center w-12 bg-[#821315]/10">{language === 'ar' ? 'قبل' : 'Before'}</th>
                                          <th className="py-1 px-1 border-b border-l border-[#821315]/20 text-center w-12 bg-[#821315]/10">{language === 'ar' ? 'بعد' : 'After'}</th>
                                        </tr>
                                      </thead>"""

t2_rep = """                                      <thead>
                                        <tr className="bg-[#821315]/5 text-[#821315] font-black text-[11px] border-b border-[#821315]/20">
                                          <th className="py-1 px-1.5 border-l border-[#821315]/20 text-center w-6 align-middle">م</th>
                                          <th className="py-1 px-2 border-l border-[#821315]/20 text-right w-36 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                                          <th className="py-1 px-1.5 border-l border-[#821315]/20 text-center w-12 align-middle">الصف</th>
                                          <th className="py-1 px-2 border-l border-[#821315]/20 w-18 align-middle">الأداة</th>
                                          <th className="p-0 border-l border-[#821315]/20 text-center w-24 align-top" colSpan={2}>
                                            <div className="flex flex-col w-full h-full bg-[#821315]/10">
                                              <div className="font-black text-[12px] text-[#821315] tracking-wide py-0.5 border-b border-[#821315]/20">
                                                {language === 'ar' ? 'الدرجة' : 'Grade'}
                                              </div>
                                              <div className="grid grid-cols-2 text-[10.5px] font-black h-full">
                                                <div className="flex items-center justify-center border-l border-[#821315]/20 px-1 py-0.5">
                                                  {language === 'ar' ? 'قبل' : 'Before'}
                                                </div>
                                                <div className="flex items-center justify-center px-1 py-0.5">
                                                  {language === 'ar' ? 'بعد' : 'After'}
                                                </div>
                                              </div>
                                            </div>
                                          </th>
                                          <th className="py-1 px-2 text-center border-l border-[#821315]/20 font-black text-[11px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                                        </tr>
                                      </thead>"""
content = content.replace(t2_target, t2_rep)


t3_target = """                  <thead>
                    <tr className="bg-slate-100 text-[#821315] font-black text-[8.5px]">
                      <th rowSpan={2} className="py-1 px-1 border-b border-l border-slate-300 text-center w-8 align-middle">م</th>
                      <th rowSpan={2} className="py-1 px-2 border-b border-l border-slate-300 text-right w-36 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                      <th rowSpan={2} className="py-1 px-1.5 border-b border-l border-slate-300 text-center w-12 align-middle">الصف</th>
                      <th rowSpan={2} className="py-1 px-2 border-b border-l border-slate-300 w-18 align-middle">الأداة</th>
                      <th colSpan={2} className="py-1 px-1 border-b border-l border-slate-300 text-center w-24 bg-slate-200 align-middle">
                        <div className="text-center font-black text-[12px] text-black tracking-wide">{language === 'ar' ? 'الدرجة' : 'Grade'}</div>
                      </th>
                      <th rowSpan={2} className="py-1 px-2 text-center border-b border-l border-slate-300 font-black text-[11px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                    </tr>
                    <tr className="bg-slate-100 text-[#821315] font-black text-[9.5px]">
                      <th className="py-1 px-1 border-b border-l border-slate-300 text-center w-12 bg-slate-200">{language === 'ar' ? 'قبل' : 'Before'}</th>
                      <th className="py-1 px-1 border-b border-l border-slate-300 text-center w-12 bg-slate-200">{language === 'ar' ? 'بعد' : 'After'}</th>
                    </tr>
                  </thead>"""

t3_rep = """                  <thead>
                    <tr className="bg-slate-100 text-[#821315] font-black text-[8.5px] border-b border-[#000]">
                      <th className="py-1 px-1 border-l border-slate-300 text-center w-8 align-middle">م</th>
                      <th className="py-1 px-2 border-l border-slate-300 text-right w-36 align-middle">{language === 'ar' ? 'اسم الطالب/ة' : 'Student Name'}</th>
                      <th className="py-1 px-1.5 border-l border-slate-300 text-center w-12 align-middle">الصف</th>
                      <th className="py-1 px-2 border-l border-slate-300 w-18 align-middle">الأداة</th>
                      <th className="p-0 border-l border-slate-300 text-center w-24 align-top" colSpan={2}>
                        <div className="flex flex-col w-full h-full bg-slate-200">
                          <div className="font-black text-[12px] text-black tracking-wide py-0.5 border-b border-slate-300">
                            {language === 'ar' ? 'الدرجة' : 'Grade'}
                          </div>
                          <div className="grid grid-cols-2 text-[10px] font-black h-full">
                            <div className="flex items-center justify-center border-l border-slate-300 px-1 py-0.5">
                              {language === 'ar' ? 'قبل' : 'Before'}
                            </div>
                            <div className="flex items-center justify-center px-1 py-0.5">
                              {language === 'ar' ? 'بعد' : 'After'}
                            </div>
                          </div>
                        </div>
                      </th>
                      <th className="py-1 px-2 text-center border-l border-slate-300 font-black text-[11px] text-[#821315] align-middle">{language === 'ar' ? 'سبب التعديل' : 'Modification Reason'}</th>
                    </tr>
                  </thead>"""
content = content.replace(t3_target, t3_rep)
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 3. FormStyleController.tsx
with open('src/components/FormStyleController.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_style = """                      <thead>
                        <tr style={{ backgroundColor: formStyles.tableHeaderBg || 'color-mix(in srgb, var(--p-color-u) 4%, transparent)', color: formStyles.primaryColor }}>
                          <th rowSpan={2} className="p-1.5 border-l border-b border-slate-200 font-black w-8 align-middle">م</th>
                          <th rowSpan={2} className="p-1.5 border-l border-b border-slate-200 font-black w-36 text-right align-middle">{settings.colStudentNameAr || 'اسم الطالب/ة'}</th>
                          <th rowSpan={2} className="p-1.5 border-l border-b border-slate-200 text-center font-black w-10 align-middle">{settings.colClassAr || 'الصف'}</th>
                          <th rowSpan={2} className="p-1.5 border-l border-b border-slate-200 text-center font-black w-16 align-middle">{settings.colToolAr || 'الأداة'}</th>
                          <th colSpan={2} className="p-1 text-center border-l border-b border-slate-200 font-black w-20 align-middle bg-black/5">
                            <div className="text-center font-black leading-tight text-[11px]">{language === 'ar' ? 'الدرجة' : 'Grade'}</div>
                          </th>
                          <th rowSpan={2} className="p-1.5 border-l border-b border-slate-200 font-black text-center align-middle">{settings.colReasonAr || 'سبب التعديل'}</th>
                        </tr>
                        <tr style={{ backgroundColor: formStyles.tableHeaderBg || 'color-mix(in srgb, var(--p-color-u) 4%, transparent)', color: formStyles.primaryColor }}>
                          <th className="p-1 border-l border-b border-slate-200 text-center font-black w-10 bg-black/5 text-[9px]">{settings.colScoreBeforeAr || 'قبل'}</th>
                          <th className="p-1 border-l border-b border-slate-200 text-center font-black w-10 bg-black/5 text-[9px]">{settings.colScoreAfterAr || 'بعد'}</th>
                        </tr>
                      </thead>"""

rep_style = """                      <thead>
                        <tr style={{ backgroundColor: formStyles.tableHeaderBg || 'color-mix(in srgb, var(--p-color-u) 4%, transparent)', color: formStyles.primaryColor, borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: formStyles.primaryColor }}>
                          <th className="p-1.5 border-l border-slate-200 font-black w-8 align-middle">م</th>
                          <th className="p-1.5 border-l border-slate-200 font-black w-36 text-right align-middle">{settings.colStudentNameAr || 'اسم الطالب/ة'}</th>
                          <th className="p-1.5 border-l border-slate-200 text-center font-black w-10 align-middle">{settings.colClassAr || 'الصف'}</th>
                          <th className="p-1.5 border-l border-slate-200 text-center font-black w-16 align-middle">{settings.colToolAr || 'الأداة'}</th>
                          <th className="p-0 text-center border-l border-slate-200 font-black w-20 align-top" colSpan={2}>
                            <div className="flex flex-col w-full h-full bg-black/5">
                              <div className="font-black leading-tight text-[11px] py-1 border-b border-slate-200" style={{ backgroundColor: formStyles.tableHeaderBg || 'color-mix(in srgb, var(--p-color-u) 4%, transparent)', color: formStyles.primaryColor }}>
                                {language === 'ar' ? 'الدرجة' : 'Grade'}
                              </div>
                              <div className="grid grid-cols-2 text-[9px] font-black h-full">
                                <div className="flex items-center justify-center border-l border-slate-200 px-0.5 py-1">
                                  {settings.colScoreBeforeAr || 'قبل'}
                                </div>
                                <div className="flex items-center justify-center px-0.5 py-1">
                                  {settings.colScoreAfterAr || 'بعد'}
                                </div>
                              </div>
                            </div>
                          </th>
                          <th className="p-1.5 border-l border-slate-200 font-black text-center align-middle">{settings.colReasonAr || 'سبب التعديل'}</th>
                        </tr>
                      </thead>"""

content = content.replace(target_style, rep_style)
with open('src/components/FormStyleController.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
