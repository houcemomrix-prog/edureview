const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `              {userProfile && userProfile.role === 'moderator' && (
                <div className="p-4 bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {isUniversalSubject(userProfile.subject) ? '🌟' : '📚'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-black text-xs text-indigo-950 uppercase tracking-wide">
                          {language === 'ar' ? 'صلاحية التدقيق المعتمدة:' : 'Authorized Auditing Scope:'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                          {isUniversalSubject(userProfile.subject)
                            ? (language === 'ar' ? 'فاحص شامل لكافة المواد والتقييمات' : 'Universal Auditor - All Subjects')
                            : translateSubject(userProfile.subject || '', language)
                          }
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-800/80 leading-relaxed font-sans mt-0.5">
                        {isUniversalSubject(userProfile.subject)
                          ? (language === 'ar' 
                              ? 'يمكنك الاطلاع على كافة الاختبارات وأوراق القياس المرفوعة من المعلمين بجميع المواد وتدقيقها واعتمادها مباشرة.'
                              : 'You have oversight across all assessments uploaded by teachers across all disciplines.')
                          : (language === 'ar'
                              ? \`يتم عرض الاختبارات المرفوعة لمادة \${translateSubject(userProfile.subject || '', language)} ويمكنك استعراض بقية المواد عبر قائمة التصفية.\`
                              : \`Displaying uploads for \${translateSubject(userProfile.subject || '', language)}. You can switch subjects using the filter dropdown.\`
                            )
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}`;

const newContent = content.replace(targetStr, '');
fs.writeFileSync('src/App.tsx', newContent, 'utf8');
