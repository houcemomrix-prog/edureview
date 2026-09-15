const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  /{myReports.length === 0 \? \([\s\S]*?<\/div>\n                  \) : \([\s\S]*?<\/div>\n                  \)}/,
  `{myReports.length === 0 && myTeacherNotifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-slate-400">
                      <p className="text-xs font-bold leading-relaxed">
                        {language === 'ar' ? 'لا توجد إشعارات لتقارير الجودة حالياً' : 'No quality report notifications currently.'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {language === 'ar' ? 'تظهر هنا إشعارات فورية عند توجيه تقارير جديدة لمدرستكم.' : 'Notifications will appear here when new reports are sent.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myReports.slice(0, 5).map((rep, index) => {
                        const isUnread = !readReportIds.includes(rep.id || '');
                        return (
                          <div
                            id={\`notif-item-\${rep.id || index}\`}
                            key={\`notif-\${rep.id || index}-\${index}\`}
                            onClick={() => rep.id && markReportAsRead(rep.id)}
                            className={\`p-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 \${isUnread ? 'bg-amber-50/20' : ''}\`}
                          >
                            <div className={\`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center \${isUnread ? 'bg-amber-100/60 text-amber-805' : 'bg-slate-100 text-slate-500'}\`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1 text-right rtl:text-right ltr:text-left">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={\`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-md \${isUnread ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-500'}\`}>
                                  {isUnread 
                                    ? (language === 'ar' ? 'جديد 🔔' : 'New 🔔') 
                                    : (language === 'ar' ? 'مقروء' : 'Read')
                                  }
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold font-mono">
                                  {rep.semester === 'first' ? (language === 'ar' ? 'الفصل ١' : 'Sem 1') : (language === 'ar' ? 'الفصل ٢' : 'Sem 2')}
                                </span>
                              </div>
                              <p className="text-[11px] font-black text-slate-800 leading-snug">
                                {language === 'ar' ? 'تم استلام تقرير جولة جودة ومطابقة جديد' : 'New quality & compliance report received'}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {language === 'ar' ? rep.titleAr : (rep.titleEn || rep.titleAr)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {myTeacherNotifications.slice(0, 5).map((notif, index) => {
                        const isUnread = !notif.read;
                        return (
                          <div
                            id={\`notif-teacher-\${notif.id || index}\`}
                            key={\`notif-teacher-\${notif.id || index}-\${index}\`}
                            onClick={() => notif.id && handleTeacherNotificationClick(notif.id)}
                            className={\`p-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 \${isUnread ? 'bg-sky-50/30' : ''}\`}
                          >
                            <div className={\`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center \${isUnread ? 'bg-sky-100/60 text-sky-800' : 'bg-slate-100 text-slate-500'}\`}>
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1 text-right rtl:text-right ltr:text-left">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={\`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-md \${isUnread ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-500'}\`}>
                                  {isUnread 
                                    ? (language === 'ar' ? 'جديد 🔔' : 'New 🔔') 
                                    : (language === 'ar' ? 'مقروء' : 'Read')
                                  }
                                </span>
                              </div>
                              <p className="text-[11px] font-black text-slate-800 leading-snug">
                                {language === 'ar' ? notif.titleAr : notif.titleEn}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                {language === 'ar' ? notif.messageAr : notif.messageEn}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}`
);

fs.writeFileSync('src/components/Header.tsx', code);
