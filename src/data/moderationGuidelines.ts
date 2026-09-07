export interface GuidelinePage {
  pageNumber: number;
  titleAr: string;
  titleEn: string;
  category: 'introduction' | 'regulations' | 'subjects-ar' | 'subjects-en' | 'cover';
  contentAr: string;
  contentEn: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  notesAr?: string[];
  notesEn?: string[];
}

export const MODERATION_GUIDELINES: GuidelinePage[] = [
  {
    pageNumber: 1,
    titleAr: "صفحة الغلاف الرسمية",
    titleEn: "Official Cover Page",
    category: "cover",
    contentAr: "وزارة التعليم\nسلطنة عمان\nمركز القياس والتقويم التربوي\n\nضوابط الفحص والتدقيق النهائي\nلمواد دبلوم التعليم العام\n\nنوفمبر 2025م",
    contentEn: "Ministry of Education\nSultanate of Oman\nCenter for Educational Assessment and Measurement (CEAM)\n\nFinal Verification and Moderation Guidelines\nfor General Education Diploma Academic Subjects\n\nNovember 2025"
  },
  {
    pageNumber: 2,
    titleAr: "تصميم الغلاف الداخلي",
    titleEn: "Inner Cover Design",
    category: "cover",
    contentAr: "ضوابط الفحص والتدقيق النهائي لمواد دبلوم التعليم العام\nمركز القياس والتقويم التربوي - سلطنة عمان",
    contentEn: "Final Moderation Guidelines [November 2025]\nCenter for Educational Assessment and Measurement - Sultanate of Oman"
  },
  {
    pageNumber: 3,
    titleAr: "جدول المحتويات والفهرس",
    titleEn: "Table of Contents",
    category: "introduction",
    contentAr: "1. المقدمة\n2. أولاً: مهام الفاحصين\n3. ثانياً: التعامل مع تعديل الدرجات\n4. ثالثاً: ملحوظات عامة\n5. رابعاً: ضوابط الفحص والتدقيق النهائي لمختلف المواد\n6. مادة التربية الإسلامية\n7. مادة اللغة العربية\n8. مواد الدراسات الاجتماعية\n9. مادتي الرياضيات الأساسية والمتقدمة\n10. مواد العلوم العامة\n11. مادة الفنون التشكيلية\n12. مادة الرياضة المدرسية\n13. مادة المهارات الموسيقية\n14. مادة تقنية المعلومات\n15. ضوابط موجهي المدارس ثنائية اللغة ( visiting moderators )",
    contentEn: "1. Introduction\n2. First: Tasks of the Moderators\n3. Second: Handling Grade Modifications\n4. Third: General Regulations and Field Notes\n5. Fourth: Subject-wise Core Moderation Blueprints\n6. Islamic Studies Guidelines\n7. Arabic Language Moderation\n8. Social Studies Suite (This is My Country, World Around Me)\n9. Basic & Advanced Mathematics Structures\n10. Science Lab Blueprints (Physics, Chemistry, Biology, Environmental)\n11. Fine Arts Audit Methods\n12. School Sports and PE Controls\n13. Musical Skills Rubrics\n14. IT & Information Technology Systems\n15. Guidelines for Visiting Moderators in Bilingual Programs (CEAM)"
  },
  {
    pageNumber: 4,
    titleAr: "المقدمة ومهام الفاحصين",
    titleEn: "Introduction & Tasks of Field Moderators",
    category: "introduction",
    contentAr: "المقدمة:\nتُنفذ عملية الفحص والتدقيق النهائي من خلال المتابعة الميدانية للتأكد من التطبيق السليم لأدوات التقويم المستمر، ومصداقية الدرجات المعطاة للطلبة في ضوء المعايير والمواصفات الفنية الواردة في وثائق تقويم تعلم الطلبة؛ وتتم لجميع معلمي الصف الثاني عشر من قبل فرق تُشكل في المديريات التعليمية بالمحافظات.\n\nأولاً: مهام الفاحصين:\n1. حضور الاجتماع الذي يعقده رئيس الفريق.\n2. استلام كشوف درجات التقويم المستمر، وسجل درجات المعلم.\n3. تنفيذ أعمال الفحص والتدقيق وفق الجدول المعد والالتزام بالضوابط.\n4. اختيار عينات عشوائية ممثلة لستة طلاب (2 ممتاز، 2 متوسط، 2 ضعيف) من كشوف درجات المعلم.\n5. فحص أعمال الطلبة للتحقق من وجود الأدلة ومطابقتها للمواصفات.\n6. إجراء التعديلات المناسبة على الدرجات عند استدعاء الأمر وفق الأسباب المحددة، مع إشعار رئيس الفريق ومستشار المدرسة.\n7. زيادة حجم العينة لتصل إلى 12 ملفاً عند اكتشاف ملاحظات متكررة.\n8. كتابة استمارة الفحص والتدقيق النهائي المتضمنة بيانات المعلم والتوصيات المهنية.",
    contentEn: "Introduction:\nThe final verification and moderation process is executed via physical school site visits. This guarantees correct execution of continuous assessment (CA) rubrics, verifying the credibility of grades in accordance with state-approved assessment specs. This targets all Grade 12 teachers and is carried out by specialized teams delegated by regional Educational Directorates.\n\nFirst: Core Tasks of Moderators:\n1. Attend technical briefings called by the Committee Chairperson.\n2. Receive official digital continuous assessment logs and school grade registries.\n3. Execute school audits strictly following the predetermined scheduler and compliance instructions.\n4. Construct a random sample representing 6 students (2 outstanding, 2 average, 2 critical level) from each class database.\n5. Audit physical and digital student portfolios to establish actual evidence of learning output.\n6. Apply structural changes on scores based on explicit ministry criteria, immediately sending notices to the Team Principal.\n7. Double the sample size to 12 files if repetitive marking irregularities are flagged.\n8. Prepare and sign the final Assessment Auditing Ledger detailing recommendations for pedagogical improvement."
  },
  {
    pageNumber: 5,
    titleAr: "التعامل مع تعديلات الدرجات وملحوظات عامة",
    titleEn: "Grade Adjustments & General Compliance Guidelines",
    category: "regulations",
    contentAr: "ثانياً: التعامل مع تعديل الدرجات:\nتُعدل درجات الطلبة بالزيادة أو النقصان في الحالات الآتية:\n1. وجود خطأ في نقل درجة الطالب من أداة التقويم إلى سجل درجات المعلم.\n2. وجود خطأ في رصد الدرجة في البوابة التعليمية الرسمية للهيكل التنظيمي.\n3. وجود خطأ ملموس في التصحيح التقديري للفاحص والمعلم.\n4. وجود خطأ في جمع الدرجات الفرعية في أداة التقييم.\n5. وجود خطأ في جبر كسر درجة المجموع الإجمالي.\n6. عدم توفر أو فقدان كلي للدليل المادي المبرهن على أعمال وأداء الطالب.\n\nثالثاً: ملحوظات عامة:\n1. تُقرب نصف الدرجة على مستوى المجموع الكلي فقط، ولا يصح جبر أو تقريب أنصاف الدرجات على مستوى أداة التحرير.\n2. يمنع منعاً باتاً إعادة تطبيق أدوات التقويم المستمر بغرض تحسين الدرجات للطلبة إلا في أحوال استثنائية وبموافقات رسمية.\n3. لا يسمح بإجراء أي تعديل في درجات التقويم بعد مغادرة فريق الفحص والتدقيق التابع للوزارة للمدرسة.\n4. في حال فقدان الأدلة، يقوم الفاحص بكتابة تقرير تفصيلي يوضح ملابسات الحالة ومسؤولية معلم المادة، ويرفع لمدير عام المديرية بالمحافظة.",
    contentEn: "Second: Handling Grade Adjustments:\nSystem scores must be adjusted (increased or decreased) in defined critical scenarios:\n1. Data transcription errors occurred when migrating grades to the official sheets.\n2. Typing or configuration mismatches detected inside the national Educational Portal database.\n3. Standard grading errors in estimating open-ended responses or items.\n4. Mathematical bugs in totaling sub-scores on test sheets.\n5. Rounding errors in processing decimal marks on composite files.\n6. Total absence or physical loss of actual portfolios indicating student work.\n\nThird: General Operational Notes:\n1. Half-scores are compiled and rounded only at the composite score level. No individual test sub-item is allowed to have speculative decimals rounded up prematurely.\n2. Portfolios cannot be re-applied or assigned new tasks simply to inflate baseline grades, except under documented administrative leaves.\n3. No marks can be modified post-facto once the official CEAM field delegation signs the audited ledger.\n4. If portfolios are entirely missing, the auditor files an emergency report pointing out individual accountability, raising it for executive actions."
  },
  {
    pageNumber: 6,
    titleAr: "ملحوظات جودة الكتابة وهوية الامتحانات",
    titleEn: "Handwriting Anomalies & Duplicate Assessment Tests",
    category: "regulations",
    contentAr: "ملحوظات هامة حول سلامة المتابعة:\n5. في حالة اختلاف خط الكتابة لأحد الطلبة بين مفردات الاختبار القصير أو الشك في وجود إجابات منسوخة، أو تطابق خط الكتابة لعدة طلاب في حل نفس الاختبار أو الواجب، يجب على الفاحص تدوين تقرير ومراجعة تاريخ تكرار الحالة والتنسيق مع إدارة المدرسة واللجنة المركزية بالمحافظة لاتخاذ الإجراءات التأديبية.\n\n6. في حالة تطابق تام وبلوغ تشابه كامل لنفس الاختبار القصير أو أدوات التقييم بين مدرسة وأخرى أو مجموعة من المدارس، يتوجب على الفاحص تسجيل الملاحظة ورفع تقرير عاجل يوضح تفاصيل الواقعة وموقف موجه المادة واللجنة الإشرافية بالمحافظة لبحث تكافؤ ومصداقية التعليم بالمنطقة.",
    contentEn: "Quality Audit and Integrity Parameters:\n5. If the student's spelling patterns or handwriting style indicates extreme mismatch between papers, or if identical answers appear verbatim across multiple student manuscripts, the moderator must initiate a full investigation. Coordination with school heads and security inspectors is mandated to address grading breaches.\n\n6. If duplicate assessments or identical short-tests with identical scoring indicators are verified between entirely different schools, the inspector has a duty to halt recognition. An emergency brief detailing the issue must be instantly sent to the Regional Directorate to assure equal opportunity and evaluation ethics."
  },
  {
    pageNumber: 7,
    titleAr: "ضوابط مادة التربية الإسلامية",
    titleEn: "Islamic Studies Moderation Blueprint",
    category: "subjects-ar",
    contentAr: "1- مادة التربية الإسلامية:\nأدوات التقويم المستمر ومعايير توزيع الدرجات المعتمدة (القرارات الوزارية):\n\nالملاحظة:\n• التلاوة: عدد التقييمات: 1، الدرجة القصوى: 3 درجات، أرقام صفحات المرجع الأساسي بالدليل: صفحة 10.\n• الحفظ: عدد التقييمات: 1، الدرجة القصوى: 3 درجات، المرجعية: معايير الحفظ بالمنهج.\n\nالاختبارات والتطبيقات:\n• السؤال القصير: عدد التقييمات: 1، الدرجة القصوى: 4 درجات، أرقام الصفحات بالمرجع: 11 + 12.\n• الاختبارات القصيرية التحريرية: عدد التقييمات: 2، الدرجة القصوى: 20 درجة، الصفحات بالدليل: 14 + 15 + 27.\n\nملحوظات هامة للتربية الإسلامية:\n• عند تساوي جميع درجات الطلاب في أداة معينة دون مبرر، تُكتب ملاحظة للفاحص: 'عدم مراعاة الفروق الفردية في رصد درجات الأداة'.\n• ضرورة توفر أدلة التسجيلات والمتابعة الشفوية لنصوص التلاوة المقررة للحفظ.",
    contentEn: "1- Islamic Studies Department:\nTechnical guidelines, continuous assessment breakdown, and specific evaluation scales:\n\nOral/Observational Rubrics:\n• Holy Quran Recitation (التلاوة): 1 assessment, 3 marks max. Refer to Page 10 of CEAM Reference Manual.\n• Memorization (الحفظ): 1 assessment, 3 marks max. Based on standardized assessment parameters.\n\nWritten Quizzes and Summative Tasks:\n• Structured Short Question: 1 assessment, 4 marks max. Refer to Pages 11 & 12 of manual.\n• Analytical Short Exams: 2 assessments, 20 marks total. Refer to Pages 14, 15 & 27 of reference code.\n\nIslamic Department Notes:\n• If identical scores are recorded across all student profiles, the supervisor flags: 'Lack of individual cognitive divergence indicators'.\n• Audible or physical records validating systematic recitation follow-ups must be preserved inside the portfolios.",
    tableData: {
      headers: ["أداة التقويم المستمر / CA Tool", "عدد مرات التقييم / Frequency", "الدرجات المخصصة / Total Marks", "أرقام صفحات الدليل / Manual Pages"],
      rows: [
        ["التلاوة والترتيل / Recitation", "1", "3", "10"],
        ["سجل الحفظ الصفي / Memorization", "1", "3", "Based on curriculum specs"],
        ["السؤال القصير / Short Question", "1", "4", "11 + 12"],
        ["الاختبارات القصيرة / Short Exams", "2", "20", "14 + 15 + 27"]
      ]
    }
  },
  {
    pageNumber: 8,
    titleAr: "ضوابط مادة اللغة العربية",
    titleEn: "Arabic Language Moderation Blueprint",
    category: "subjects-ar",
    contentAr: "2- مادة اللغة العربية:\nأدوات ومقاييس درجات التقويم المستمر لمدارس دبلوم التعليم العام:\n\n• العرض الشفوي والتقديم: عدد مرات التقييم: 1، الدرجة القصوى: 5 درجات، مرجع الصفحات بالدليل: 10 + 11.\n• التعبير والكتابة الإنتاجية: عدد مرات التقييم: 1، الدرجة القصوى: 5 درجات، مرجع الصفحات بالدليل: 12 + 13.\n• الاختبارات القصيرة المكتوبة: عدد مرات التقييم: 2، الدرجة القصوى: 20 درجة، مرجع الصفحات بالدليل: 20 + 22.\n\nملحوظات تقويم مادة اللغة العربية:\n• في حال عدم وجود تفاوت في درجات الاختبار المكتوب، تُسجل ملاحظة للموجّه وتوجيه المعلم بتنويع مستويات الأسئلة المعرفية وصياغتها طبقاً لرموز بلوم.\n• يمنع المعلم من رصد درجة التعبير الإنشائي دون كتابة تفاصيل معايير التصحيح والدرجة المحددة لكل معيار (الأفكار، الأسلوب، الهجاء، الخط).",
    contentEn: "2- Arabic Language Department:\nCA components and ministerial compliance targets:\n\n• Oral Presentations & Public Speaking: 1 assessment, 5 marks max. Refer to Pages 10 & 11 of the CEAM code.\n• Creative & Structured Essay Writing: 1 assessment, 5 marks max. Refer to Pages 12 & 13 of manual.\n• Standardized Written Exams: 2 assessments, 20 marks composite. Refer to Pages 20 & 22 of code book.\n\nArabic Department Compliance:\n• If the written tests exhibit total grades uniformity, the examiner should direct the teacher to enrich levels of cognitive difficulty based on Bloom's classification.\n• Decisive criteria detailing grade distribution for essays (e.g., flow of ideas, syntactical style, handwriting, spelling) must be visibly annotated by the educator.",
    tableData: {
      headers: ["أداة التقويم / CA Target", "عدد مرات التقييم / Frequency", "الدرجات القصوى / Max Grade", "صفحات المرجع الأساسي / Manual References"],
      rows: [
        ["العرض الشفوي / Oral Speaking", "1", "5", "10 + 11"],
        ["التعبير الكتابي الإنشائي / Essay Portfolios", "1", "5", "12 + 13"],
        ["الاختبارات القصيرة / Standardized Tests", "2", "20", "20 + 22"]
      ]
    }
  },
  {
    pageNumber: 9,
    titleAr: "ضوابط مواد الدراسات الاجتماعية",
    titleEn: "Social Studies Blueprint (This is My Country / History / Geography)",
    category: "subjects-ar",
    contentAr: "3- مواد الدراسات الاجتماعية:\nالتقييمات المطلوبة لمواد (هذا وطني / العالم من حولي / الجغرافيا والتقنيات الحديثة):\n\n• السؤال القصير: عدد مرات التقييم: 1، الدرجة القصوى: 5 درجات، مرجع الصفحات بالدليل: صفحة 8.\n• التقرير والبحث الجغرافي/التاريخي المكتوب: عدد مرات التقييم: 1، الدرجة القصوى: 5 درجات، مرجع الصفحات بالدليل: 9 + 10.\n• الاختبارات التحصيلية القصيرة: عدد مرات التقييم: 2، الدرجة القصوى: 20 درجة، مرجع الصفحات بالدليل: صفحة 11.\n\nملحوظات هامة لمواد الدراسات الاجتماعية:\n• يشترط وجود أدلة كافية على البحث العلمي والتقارير المكتوبة بالملفات تشمل المراجع واستخلاص الأفكار.\n• في حال عدم استيفاء هيكلية البحث ومطابقتها للمواصفات الفنية، تُسجل كملاحظة ويخصم من نقاط تقرير المعلم.",
    contentEn: "3- Social Studies Department:\nMandatory CA rules for subjects (e.g. This is My Country / History / Spatial Geography):\n\n• Structured Concept Short Question: 1 assessment, 5 marks max. Refer to Page 8.\n• Standard Written Research Paper / Project Report: 1 assessment, 5 marks max. Refer to Pages 9 & 10.\n• Multi-subject Written Short Exams: 2 assessments, 20 marks composite. Refer to Page 11.\n\nSocial Studies Department Controls:\n• Students' research portfolios must include solid evidence of scholarly research, identifying formal bibliography and individual analytical reviews.\n• If reports appear copied or lack correct citation indexes, a formal notice is flagged, deducting quality evaluation points from the instructor's ledger.",
    tableData: {
      headers: ["أداة التقييم / CA Component", "الفحوصات المطلوبة / Frequency", "متوسط الدرجة / Total Marks", "مرجع صفحات المحتوى / Source Pages"],
      rows: [
        ["السؤال القصير / Short Question", "1", "5", "8"],
        ["البحث أو التقرير الجغرافي / Project Paper", "1", "5", "9 + 10"],
        ["الاختبارات التحصيلية / Term Tests", "2", "20", "11"]
      ]
    }
  },
  {
    pageNumber: 10,
    titleAr: "ضوابط مادتي الرياضيات الأساسية والمتقدمة (عربي)",
    titleEn: "Basic & Advanced Mathematics Arabic Blueprint",
    category: "subjects-ar",
    contentAr: "4- مادتي الرياضيات الأساسية والرياضيات المتقدمة:\nضوابط التقويم للتعليم الأساسي وما بعد الأساسي من وزارة التعليم:\n\n• الأعمال الشفوية التفاعلية صبيحة الحصة: التكرار: 2، الدرجة القصوى: 5 درجات، الصفحة المرجعية: 8.\n• السؤال التقييمي القصير: التكرار: 1، الدرجة القصوى: 5 درجات، الصفحة المرجعية: 10.\n• الاختبارات القصيرة التحريرية: التكرار: 2، الدرجة القصوى: 20 درجة، الصفحة المرجعية بالدليل: 11 + 12.\n\nملحوظات في معايير الرياضيات المكتوبة:\n• لا يسمح بنسخ أو تكرار الأهداف والمسائل الحسابية المقيمة في جزيئات الأسئلة التقييمية وإدراجها بنفس الصيغة في الامتحانات القصيرة.\n• يجب أن يدعم سجل المعلم رصداً واضحاً للفروقات الفردية وتطور القدرات الفكرية لجميع المستويات الأكاديمية.",
    contentEn: "4- Basic & Advanced Mathematics Arabic Department:\nContinuous evaluation frameworks for upper secondary classes compiled by the ministry:\n\n• Live Interactive Oral Work: 2 instances, 5 marks composite limit. Refer to Manual Page 8.\n• Structured Concept Short Question: 1 instance, 5 marks max score. Refer to Page 10.\n• Written Mathematical Short Quizzes: 2 instances, 20 marks composite. Reference Manual Pages 11 & 12.\n\nArabic Mathematics Quality Controls:\n• Replicable calculation goals or questions assessed during smaller focus questions must NOT be replicated in the main chapter Exams.\n• Student files must clearly reflect math skills development, documenting tracking for gifted and remedial categories.",
    tableData: {
      headers: ["أداة تقويم الحساب / Math CA Component", "التكرار المطلوب / Audits Required", "العلامة المحددة / Marks Alloc", "الصفحة الرسمية / Book Page"],
      rows: [
        ["الأعمال الشفوية الصيفية / Oral Work", "2", "5", "8"],
        ["السؤال القصير / Concept Question", "1", "5", "10"],
        ["الامتحانات القصيرة الصفية / Written Exams", "2", "20", "11 + 12"]
      ]
    }
  },
  {
    pageNumber: 11,
    titleAr: "ضوابط مواد العلوم الأساسية (فيزياء / كيمياء / أحياء / بيئة)",
    titleEn: "Core Sciences Blueprint (Physics / Chemistry / Biology / Environment)",
    category: "subjects-ar",
    contentAr: "5- مواد العلوم الأساسية بالتعليم العام:\nتقسيم ملفات معايير الجودة والمتابعة المعملية ومجموع درجاتها:\n\n• الواجبات والتطبيقات المنزلية المستمرة: التكرار: 2، الدرجة القصوى: 10 درجات، صفحات الدليل: 15 + 16.\n• الاستقصاء العلمي العملي وأعمال المختبر والمهارات التطبيقية: التكرار: 1، الدرجة القصوى: 10 درجات، صفحات الدليل: 18 إلى 21.\n• الاختبارات الكتابية القصيرة بالمقرر: التكرار: 2، الدرجة القصوى: 10 درجات، صفحات الدليل: 23 + 24 + 36 + 37.\n\nملاحظات المتابعة العلمية لمعلمي العلوم:\n• غياب دليل موثق على أداء التجارب المعملية يترتب عليه حرمان الصف من نقاط المهارات العملية ويعرض المعلم للتحقيق.\n• يمنع إعادة الاختبار لغرض تعديل العلامة للمقصرين دون موافقة الإدارة المعنية بالوزارة.",
    contentEn: "5- Department of Physical and Natural Sciences:\nIntegrated schema of lab tasks, homework indicators, and grading limits:\n\n• Consistent Homework and Problem Sets: 2 checks, 10 marks total. Refer to Pages 15 & 16 of core index.\n• Lab Reports, Scientific Inquiry and Practical Skills: 1 major check, 10 marks max. Pages 18 to 21.\n• Term Written Scientific Exams: 2 tests, 10 marks composite. Reference Pages 23, 24, 36 & 37.\n\nScience Compliance Protocols:\n• Absence of signed sheets certifying real laboratory experimenting forces severe deductions in total classroom grades, escalating to MOE committees.\n• Retaking short quizzes or lab tests for the purpose of improving final scores is strictly forbidden without registered medical excuse files.",
    tableData: {
      headers: ["أدوات تقويم العلوم / Science CA Tool", "تكرار التقييم / Frequency", "القيمة الإجمالية / Total Marks", "أرقام صفحات الدليل / CEAM Pages"],
      rows: [
        ["الواجبات والتطبيقات / Science Homework", "2", "10", "15 + 16"],
        ["الاستقصاء وأعمال المختبر / Lab & Inquiry", "1", "10", "18 -> 21"],
        ["الاختبارات القصيرة / Short Science Quizzes", "2", "10", "23 + 24 + 36 + 37"]
      ]
    }
  },
  {
    pageNumber: 12,
    titleAr: "ضوابط مادة الفنون التشكيلية",
    titleEn: "Fine Arts Evaluation Blueprint",
    category: "subjects-ar",
    contentAr: "6- مادة الفنون التشكيلية:\nالتحقق من مواصفات الإنتاج الفني بالمؤسسات المدرسية:\n\n• الملاحظة الصفية وسلوكيات العمل: التكرار: 1، الدرجة القصوى: 10 درجات، صفحات الدليل: صفحة 7.\n• الأنشطة والمخرجات الفنية العملية: التكرار: 3، الدرجة القصوى: 45 درجة، صفحات الدليل: 7 إلى 9.\n• الاختبار القصير الفني أو النظري حول تاريخ الفن: التكرار: 1، الدرجة القصوى: 15 درجة، صفحات الدليل: 9 + 10.\n\nملحوظات توجيه الفن والتصميم:\n• لا يُقيم العمل الفني بناءً على خامات الورشة ومصاريف لوحاتها، بل بمدى محاكاة المخرج النهائي للمعايير الأكاديمية الواردة بالدليل.\n• تدوين ملاحظات تفصيلية لدرجات كل لوحة تشكيلية (مهارة التظليل، دمج الألوان، الابتكار والهوية).",
    contentEn: "6- Fine Arts and Design Department:\nStandard specifications validating creative and technical work styles:\n\n• Technical Observation & Craft Attitude: 1 assessment, 10 marks maximum. Page 7.\n• Studio Practical Activities and Artistic Portfolios: 3 assessments, 45 marks maximum. Pages 7 to 9.\n• Theory Short Quiz / Art History Assessment: 1 assessment, 15 marks. Pages 9 & 10.\n\nArts Department Design Notes:\n• Artwork is assessed NOT by material costs or complex canvas purchases, but purely by actual compliance with design and standard specs outlined in references.\n• Precise sub-grades outlining technical execution (e.g. shadow work, layout balance, innovation) must be logged on every reviewed template.",
    tableData: {
      headers: ["أداة تقويم الفنون / Creative CA Target", "سجل التكرار / Occurrences", "مجموع نقاط المادة / Allocated Marks", "صفحات الدليل / Manual Pages"],
      rows: [
        ["الملاحظة والتدوين / Craft Observation", "1", "10", "7"],
        ["المرسم والأنشطة العملية / Art Studio Projects", "3", "45", "7 -> 9"],
        ["الاختبار القصير / Design & History Test", "1", "15", "9 + 10"]
      ]
    }
  },
  {
    pageNumber: 13,
    titleAr: "ضوابط مادة الرياضة المدرسية",
    titleEn: "Physical Education & School Sports Blueprint",
    category: "subjects-ar",
    contentAr: "7- مادة الرياضة المدرسية:\nأدوات تقويم الصحة المدرسية واللياقة والتقويم الرياضي الشامل:\n\n• الأنشطة البدنية العملية والمهارات الحركية بالميدان: التكرار: 2، الدرجة القصوى: 50 درجة، صفحات الدليل: صفحة 7.\n• الملاحظة الفسيولوجية، حضور وانضباط الطالب بالملعب والزي: التكرار: 1، الدرجة القصوى: 10 درجات، صفحات الدليل: 7 إلى 9.\n• الاختبار المعرفي التحليلي القصير لقوانين الألعاب الرياضية: التكرار: 1، الدرجة القصوى: 10 درجات، صفحات الدليل: 9 + 10.\n\nملحوظات هامة لمعلم الرياضة المدرسية:\n• في حال عجز الطالب عن أداء المجهود البدني بالأنشطة العملية لمانع صحي طارئ، يجب تقديم تقرير طبي رسمي معول عليه لمركز القياس والتقويم.\n• يجب التأكد من تطبيق الاختبارات البدنية وفق معايير العمر ومثالية أداء المهارات الحركية المحددة بالكتيب.",
    contentEn: "7- Physical Education (PE) & School Sports Department:\nAssessment metrics targeting bodily fitness, coordination, and team sports theory:\n\n• Field Practical Drills and Athletic Skills: 2 assessments, 50 marks max. Page 7.\n• Behavioral Observation, Uniform Compliance, and Physical Ethics: 1 assessment, 10 marks max. Pages 7 to 9.\n• Written Sports Science Rules & Gaming Regulations Quiz: 1 assessment, 10 marks max. Pages 9 & 10.\n\nPE Compliance Principles:\n• If medical reasons/disabilities prevent standard sport drills practice, verified medical records must be formally logged inside the portfolio.\n• Field skills tests must adhere rigorously to developmental ages and precise movement execution patterns defined in our manuals.",
    tableData: {
      headers: ["أداة تقويم البدني / PE CA Target", "التكرار المطلق / Run Tracker", "علامة الإنجاز / Total Grade", "صفحات الدليل الأساسي / Manual Pages"],
      rows: [
        ["الأنشطة الميدانية والمهارة / Field Drills", "2", "50", "7"],
        ["السلوك والزي الرياضي / Discipline & Uniform", "1", "10", "7 -> 9"],
        ["الاختبار المعرفي الرياضي / Sports Rules Quiz", "1", "10", "9 + 10"]
      ]
    }
  },
  {
    pageNumber: 14,
    titleAr: "ضوابط مادة المهارات الموسيقية",
    titleEn: "Musical Skills Assessment Blueprint",
    category: "subjects-ar",
    contentAr: "8- مادة المهارات الموسيقية:\nمعايير فحص مواهب وتطبيقات مصلح الآلات الموسيقية والصولفيج الصفي:\n\n• الصولفيج النظري والعملي (الإيقاعي والغنائي): عدد مرات التقييم: 2 إيقاعي (10 درجات) + 2 غنائي (10 درجات)، ومجموع الصفحات بالدليل: 10 + 11.\n• الإنشاد والعزف العملي صلب الفصل الدراسي: عدد مرات التقييم: 2 إنشاد (20 درجة) + 2 عزف (20 درجة)، صفحات الدليل: 10 + 11.\n• الاختبار القصير النظري لعلوم وقواعد النوتة الموسيقية: عدد مرات التقييم: 1، الدرجة القصوى: 10 درجات، صفحات الدليل: صفحة 11.\n\nملحوظات هامة لمواد المهارات الموسيقية:\n• من الضروري حفظ تسجيلات مسجلة وملفات وسائط توضح معيار العزف والإنشاد الجماعي لتوثيق أداء الفصول والتقييم الداخلي للمعلم.",
    contentEn: "8- Musical Skills & Auditing Department:\nNational parameters testing musical scores, solfège execution, and instrumentation:\n\n• Solfège Execution (Rhythmic and Vocal Solfège): 2 rhythmic tasks (10 marks) + 2 vocal tasks (10 marks) max score. Manual Pages 10 & 11.\n• Practical Instrument Orchestration & Vocal Singing: 2 singing reviews (20 marks) + 2 instrumental play tests (20 marks) max. Pages 10 & 11.\n• Theory Music Notation and Harmonic Structure Quiz: 1 test instance, 10 marks limit. Manual Page 11.\n\nMusical Technical Guidelines:\n• Educators are required to keep digital audio files documenting students playing both collaboratively and solo, proving objective continuous evaluation processes.",
    tableData: {
      headers: ["أداة الموسيقى المعتمدة / Core Music CA Target", "تكرار التقييم / Frequency", "توزيع العلامات / Marks Distribution", "صفحات دليل القياس / Manual Pages"],
      rows: [
        ["الصولفيج (إيقاعي وغنائي) / Solfège Practice", "4 (2+2)", "20 (10+10)", "10 + 11"],
        ["الإنشاد والعزف الفردي / Instrumental & Vocal", "4 (2+2)", "40 (20+20)", "10 + 11"],
        ["الاختبار النظري الموسيقي / Theory Music Quiz", "1", "10", "11"]
      ]
    }
  },
  {
    pageNumber: 15,
    titleAr: "ضوابط مادة تقنية المعلومات (عربي)",
    titleEn: "Information Technology (IT/ICT) Arabic Guidelines",
    category: "subjects-ar",
    contentAr: "9- مادة تقنية المعلومات بمدارس الوزارة:\nأدوات ومجموع نقاط التقويم المستمر بالبوابة التعليمية:\n\n• النشاط الصفي البرمجي والتطبيقي العملي: التكرار: 2، الدرجة القصوى: 20 درجة، وثيقة الدليل: صفحة 13 والملحق صفحة 12.\n• الاختبار المعملي التطبيقي المباشر على الحواسيب: التكرار: 1، الدرجة القصوى: 10 درجات، وثيقة الدليل: صفحة 14 والملحق صفحة 4 و8.\n• المشروع الرقمي البرمجي/التطبيقي الجماعي أو الفردي: التكرار: 2، الدرجة القصوى: 20 درجة، وثيقة الدليل: صفحة 15 والملحق صفحة 12.\n• الاختبار القصير التحريري: التكرار: 1، الدرجة القصوى: 10 درجات، وثيقة الدليل: صفحة 16 والملحق صفحة 9.\n\nملاحظات وزارة التعليم لتقنية المعلومات:\n• إذا لم تتوفر استمارة تفصيلية لتقييم معايير المشروع البرمجي والبرمجيات المنتجة لا تُعتمد الدرجة وتخصم بالكلية.\n• يُعطى الطالب مساحته الكاملة داخل المختبر ويوفر له حاسوب مستقل صالح للتنفيذ البرمجي أثناء الفحوصات التطبيقية.",
    contentEn: "9- Information Technology & IT Systems Division:\nOmani Educational portal requirements regarding digital lab tests, software, and exams:\n\n• Coding and Laboratory Hands-on Task: 2 instances, 20 marks maximum layout. Manual Page 13 & Appendix Page 12.\n• Computer Lab Practical Assembly/Execution Test: 1 instance, 10 marks limit. Manual Page 14 & Appendix Pages 4 - 8.\n• Digital Coding Project or Software Prototype: 2 reviews, 20 marks total weight. Manual Page 15 & Appendix Page 12.\n• Theory Computing written Quiz: 1 instance, 10 marks limit. Manual Page 16 & Appendix Page 9.\n\nIT/ICT Department Guidelines:\n• If individual rubrics detailing actual software coding variables are not signed off, project scores must be strictly set to zero.\n• Each pupil is assigned an independent, fully-operational desktop to build software projects during formal lab audit intervals.",
    tableData: {
      headers: ["أداة التقييم التقني / IT CA Target", "رصد التكرار / Target Frequency", "الدرجة القصوى / Max Marks Limit", "أرقام صفحات الملحق / Source Manual Pages"],
      rows: [
        ["النشاط البرمجي العملي / Lab Coding Practice", "2", "20", "Doc Page 13 | Appx Page 12"],
        ["الاختبار المعملي العملي / Live Machine Exam", "1", "10", "Doc Page 14 | Appx Page 4, 8"],
        ["المشروع الرقمي المنجز / Software Team Project", "2", "20", "Doc Page 15 | Appx Page 12"],
        ["الاختبار الكتابي القصير / Computing Written Quiz", "1", "10", "Doc Page 16 | Appx Page 9"]
      ]
    }
  },
  {
    pageNumber: 16,
    titleAr: "مهام موجهي المدارس ثنائية اللغة - إنجليزي",
    titleEn: "Guidelines for Visiting Moderators (Bilingual Programs)",
    category: "subjects-en",
    contentAr: "ضوابط موجهي وفاحصي المدارس والبرامج ثنائية اللغة لوزارة التعليم:\n\nأولاً: مهام موجهي التدقيق والتعديل بالميدان:\n1. حضور الاجتماعات الإرشادية والتنسيقية مع رئيس لجنة القياس والتقويم بالمديرية.\n2. سحب كشوف الدرجات وسجلات تقييم المقررات ثنائية اللغة بمجرد مباشرة الفحوص الزيارية.\n3. الالتزام الكامل بمخطط الزيارة والجدولة المعتمدة للمقاطعة التعليمية.\n4. سحب عينة عشوائية تتألف من ستة طلاب ممثلة لكل فئة هرمية بدقة (2 طليعي، 2 أفراد المستوى العام والمقبول، 2 لطلاب مستويات الدعم الإرشادي).\n5. الفحص التحقيقي الدقيق للأوراق ودفاتر الطلاب ومطابقة توافقها الفني لمعايير وثائق وزارة التعليم.\n6. حال كشف فروقات أو تعاطف بالدرجات من المعلم، يتم التسجيل وإجراء تعديلات على كشف الرصد مع إحاطة الموجه المساعد.\n7. توسيع العينات وسحب 6 ملفات إضافية حال استمرار الإشكال، وفي حدة المخالفة يتم إدراج فحص شامل لكل ملفات الفصول.\n8. صياغة الاستمارات وتوجيه المعلمين لخطط التحسين مع توقيع معلم المجموعة.",
    contentEn: "10- GUIDELINES FOR VISITING MODERATORS\nFirst: Core Tasks of the Field Moderators:\n1. Attend technical preparation meetings as requested by the Moderation committee Board.\n2. Marksheets and official teacher records are obtained directly from school administration during school audits.\n3. Auditing functions are executed strictly according to the prepared calendar, fully adhering to final policies.\n4. A sample representing six students (2 verygood, 2 average, 2 weak academic status) is randomly extracted from class records taught by the target teacher.\n5. Field moderators inspect all written essays and exams, verifying sufficient material validation supporting scores entered in databases.\n6. If discrepancies inside grades are identified, visiting moderators apply corrective adjustment steps immediately, noting down precise reasons.\n7. If repetitive marking issues are identified in the sample, 6 additional student portfolios must be audited. Continued breaches force a comprehensive classroom audit.\n8. Compile official evaluation files for each instructor, including clear corrective pointers and professional development recommendations."
  },
  {
    pageNumber: 17,
    titleAr: "تعديل الدرجات وملحوظات عامة - إنجليزي",
    titleEn: "Bilingual Programs Mark Adjustments & General Notes",
    category: "subjects-en",
    contentAr: "ثانياً: حالات ومعايير تعديل درجات المواد ثنائية اللغة:\nيصرح للموجه الميداني بالتدخل الفني وتعديل درجات الطلاب بالتقرير زيادة أو نقصاناً في الأحوال التالية:\n1. تسجيل أخطاء بقنوات الترحيل من كراسات الطلاب لكشوف الرصد الداخلي.\n2. تسجيل خلاف في حسابات بوابة سلطنة عمان التعليمية.\n3. تسجيل أخطاء بنماذج التصحيح ودرجات الأسئلة المفتوحة والمقالية.\n4. تسجيل أخطاء حسابية في معالجة مجاميع الأوراق الفردية.\n5. تسجيل أخطاء في تدوير وجبر الكسور بالمجموع النهائي للامتحان.\n6. غياب مادي كامل لأي قرائن وأوراق للمصداقية المهنية لدرجة الطالب.\n\nثالثاً: الملاحظات العامة لمدارس ثنائية اللغة:\n1. جبر الكسور وتعديل أنصاف العلامات المئوية يصرح به فقط على مستوى المجاميع النهائية للمادة.\n2. يمنع إعادة الاختبارات الصفية بعد نفاذها بهدف التبرع لرفع درجة أي طالب بالملف إلا في استثناءات طبية قاهرة.\n3. لا يقبل إجراء أو اعتماد أي تبديل في درجات التقديمات الصباحية صلب الحصة بمجرد توقيع فاحص الوزارة وخروجه من أسوار المقاطعة المدرسية.",
    contentEn: "Second: Specific Cases for Mark Adjustments:\nStudent assessment parameters are legally elevated or reduced in define situations:\n1. Human errors detected when copying marks from the classroom exams to the teacher’s primary register.\n2. Numerical discrepancies verified when comparing paper logs and digital scores inside Ministry's portal.\n3. Objective errors in marking open-ended questions during teacher assessment.\n4. Errors in basic arithmetic summing sub-items on individual assessment files.\n5. Incorrectly rounding up intermediate fractions or decimal variables inside student records.\n6. Complete physical absence of solid portfolio evidence testifying standard execution of CA tools.\n\nThird: General Notes and Operational Principles:\n1. Half-marks must be preserved; final decimal calculations are only rounded up at the absolute total course compilation level.\n2. CA items or quizzes cannot be re-applied or assigned under loose specifications simply to elevate the baseline grade.\n3. No retro-active alterations inside course records are permitted after the official CEAM field moderator completes the visit and signs the final report."
  },
  {
    pageNumber: 18,
    titleAr: "جوانب تفاوتات خط اليد والاختبارات المكررة - إنجليزي",
    titleEn: "Bilingual Program Handwriting Anomalies & Joint Tests",
    category: "subjects-en",
    contentAr: "الضوابط الصارمة لوزارة التعليم بمتابعة سلامة امتحانات مدارس ثنائية اللغة:\n\n5. حال كشف موجهي التدقيق لخلاف جلي وصارخ في نمط خط الطالب في اختبار معين مقارنة بأعماله الأخرى، أو تشابه كبير في نصوص الإجابات الكتابية والحلول، يمتنع اعتماد الدرجة ويحرر تقرير عاجل لرئيس اللجنة المركزية بالمحافظة ويحال المعلم للبحث.\n\n6. حال تكرار نفس نماذج الاختبارات القصيرة وأسئلة التقييم صلب مدارس متعددة بشكل متطابق ينم عن تسريب أو تهاون معايير الجودة، يلغي المفتش صحة الامتحانات ويحرر استمارة متابعة عاجلة يرفع لمدير عام مركز القياس والتقويم بالوزارة CEAM لاتخاذ القرارات السيادية اللازمة.",
    contentEn: "Guidelines for Visiting Moderators - Detailed Fraud Protocols:\n5. If a student's handwriting patterns in any audited item varies distinctively between different submissions, or if identical answer manuscripts are uncovered cross-classifying different student books, the moderator blocks the mark. A full report is filed instantly with regional administration for processing.\n\n6. If identical short testing papers or rubrics appear cross-distributed inside independent target schools, showing coordinate templates or leaking behavior, the moderator cancels the tests. The inspector sends an emergency warning file to the Director General of global CEAM in Muscat."
  },
  {
    pageNumber: 19,
    titleAr: "مادة الرياضيات ثنائية اللغة (الأساسية والمتقدمة)",
    titleEn: "Mathematics Bilingual Subjects (Basic & Advanced)",
    category: "subjects-en",
    contentAr: "11- مادة الرياضيات بالمدارس ثنائية اللغة وثائق القياس والتقويم:\nأدوات ومجالات درجات دبلوم التعليم العام ثنائية اللغة:\n\n• الأعمال الشفوية صلب الفصل الدراسي: التكرار: 2، العلامة: 5 درجات، صفحة المرجع بالدليل الأساسي: صفحة 12.\n• الأسئلة التقييمية التحريرية القصيرة: التكرار: 1، العلامة: 5 درجات، صفحة المرجع بالدليل الأساسي: صفحة 14.\n• الامتحانات التحصيلية القصيرة: التكرار: 2، العلامة: 20 درجة، صفحة المرجع بالدليل الأساسي: صفحة 16.\n\nتعليمات جودة تقويم الرياضيات ثنائية اللغة:\n• يمنع صياغة أهداف تم تقييمها سابقاً بالأسئلة القصيرة وإعادة إدراجها بالامتحانات التحصيلية.\n• حال كشف غياب الفروقات الفردية وتماثل درجات الفصل يمنع اعتماد درجات المادة.",
    contentEn: "11- Mathematics Bilingual Subjects (Basic & Advanced Program):\nTechnical specifications and official grade distributions for bilingual math course streams:\n\n• Live Verbal/Oral Work: Audits Required: 2, Total Marks: 5. Manual Page Reference: 12.\n• Short Written Question: Audits Required: 1, Total Marks: 5. Manual Page Reference: 14.\n• Written Mathematics Short Exams: Audits Required: 2, Total Marks: 20. Manual Page Reference: 16.\n\nBilingual Mathematics Department Guidance:\n• Mathematical curriculum objectives tested during early brief question sessions must not be repeated inside core short term assessments.\n• Decisive student evaluation files must illustrate clear variations in scoring; standard grading sheets indicating homogenous grades without variance are immediately flagged.",
    tableData: {
      headers: ["أداة تقييم الرياضيات / Math CA Tool", "تكرار التقييم / Frequency", "توزيع الدرجات / Marks Allocation", "الصفحة المرجعية / Source Page No."],
      rows: [
        ["الأعمال الشفوية / Oral Mathematics Work", "2", "5", "12"],
        ["السؤال القصير / Concept Short Question", "1", "5", "14"],
        ["الامتحانات القصيرة / Standard Short Tests", "2", "20", "16"]
      ]
    }
  },
  {
    pageNumber: 20,
    titleAr: "الفيزياء / الكيمياء / الأحياء ثنائية اللغة",
    titleEn: "Physics, Chemistry, & Biology Bilingual Subjects",
    category: "subjects-en",
    contentAr: "12- العلوم ثنائية اللغة (الفيزياء / الكيمياء / الأحياء):\nأدوات وطبيعة درجات معايير التدقيق والقياس المستمر لوزارة التعليم:\n\n• الفروض والواجبات المنزلية التطبيقية: التكرار: 2، الدرجة القصوى: 10 درجات، صفحات الدليل بالملحق: 15 + 16.\n• الاستقصاء المعملي العملي وتجارب المختبر والتقارير: التكرار: 1، الدرجة القصوى: 10 درجات، صفحات الدليل بالملحق: 18 إلى 21.\n• الاختبارات التحريرية القصيرة في الفصل: التكرار: 2، الدرجة القصوى: 10 درجات، صفحات الدليل بالملحق: 23 و24 و34 و35.\n\nملحوظات جودة العلوم بمدارس ثنائية اللغة:\n• يجب إرفاق تقارير المختبر والنتائج المسجلة وتوقيعها من المعلم وأستاذ المختبر لتوثيق فترات التقويم المستمر.\n• لا يسمح نهائياً بإجراء اختبارات تعويضية بغية زيادة المعدل دون أعذار طبية قوية.",
    contentEn: "12- Scientific Stream Bilingual Programs (Physics / Chemistry / Biology):\nContinuous evaluation matrices, experimental reporting, and testing frameworks:\n\n• Home assignments & problem files: Audits Required: 2, Total Marks: 10. Manual Pages: 15 & 16.\n• Lab experiment records, manual logs & inquiry test: Audits Required: 1, Total Marks: 10. Manual Pages: 18 to 21.\n• Written scientific short tests: Audits Required: 2, Total Marks: 10. Pages: 23, 24, 34 & 35.\n\nBilingual Sciences Department Guidance:\n• Individual physical templates indicating student's laboratory calculations and findings must be signed off, certifying authentic hands-on experiment execution.\n• Retaking exams to upgrade baseline registers without hard medical validation files from district clinics is strictly prohibited.",
    tableData: {
      headers: ["أداة تقويم العلوم / Science CA Tool", "تكرار التقييم / Frequency", "الدرجات المخصصة / Total Marks", "صفحات المرجع / Reference Pages"],
      rows: [
        ["الواجبات والتطبيقات / Home Assignments", "2", "10", "15 + 16"],
        ["الاستقصاء وأعمال المختبر / Lab Practical Skills", "1", "10", "18 -> 21"],
        ["الامتحانات القصيرة / Scientific Short Tests", "2", "10", "23 + 24 + 34 + 35"]
      ]
    }
  },
  {
    pageNumber: 21,
    titleAr: "مادة تكنولوجيا المعلومات والاتصالات ICT ثنائية اللغة",
    titleEn: "ICT Education Bilingual Subject (Bilingual Program)",
    category: "subjects-en",
    contentAr: "13- مادة تكنولوجيا المعلومات والاتصالات ومشاريعها البرمجية:\nأدوات ومجموع نقاط التقويم المستمر بالبوابة ثنائية اللغة:\n\n• تقديم المشروعات والعروض الترويجية الرقمية: التكرار: 1، الدرجة القصوى: 10 درجات، صفحة المرجع بالدليل الأساسي: 8.\n• النشاط المعملي والتطبيقي الفعلي: التكرار: 1، الدرجة القصوى: 20 درجة، صفحة المرجع بالدليل الأساسي: 9.\n• الاختبار العملي المعملي على المنظومة: التكرار: 1، الدرجة القصوى: 10 درجات، صفحة المرجع بالدليل الأساسي: 10.\n• الاختبارات التحريرية القصيرة: التكرار: 2، الدرجة القصوى: 20 درجة، صفحات المرجع بالدليل الأساسي: 11 إلى 13.\n\nملحوظات هامة لمعلم تكنولوجيا الاتصالات ICT ثنائية اللغة:\n• يجب توفير النماذج المطبوعة والملفات البرمجية لتقييم معايير مخرجات المشروعات البرمجية وتكاملها.",
    contentEn: "13- Information and Communication Technology (ICT) Subject:\nCore digital portfolios, coding assessments and marks distribution:\n\n• Technology Project Presentations & Slides: 1 instance, 10 marks limit. Reference Page No: 8.\n• Structured Lab Programming Assignments: 1 instance, 20 marks limit. Reference Page No: 9.\n• Practical Software Machine Test in computer lab: 1 instance, 10 marks limit. Reference Page No: 10.\n• Computing Theory Written Short Exams: 2 instances, 20 marks total weight. Pages: 11 to 13.\n\nICT Bilingual Department Guidance:\n• Valid code files, project diagrams, and digital directories justifying development assignments must be preserved for external inspects.",
    tableData: {
      headers: ["أداة تقويم الحاسب / ICT CA Tool", "مرات التقييم / Frequency", "مجموع الدرجة / Marks Limit", "أرقام الصفحات / Manual Page No."],
      rows: [
        ["التقديم والعروض / Presentation", "1", "10", "8"],
        ["النشاط المعملي البرمجي / Programming Work", "1", "20", "9"],
        ["الاختبار العملي / Practical Lab Machine Test", "1", "10", "10"],
        ["الاختبارات القصيرة / Computing Short Tests", "2", "20", "11 -> 13"]
      ]
    }
  },
  {
    pageNumber: 22,
    titleAr: "مادة علم الاقتصاد ثنائية اللغة",
    titleEn: "Economy Subject (Bilingual Program)",
    category: "subjects-en",
    contentAr: "14- مادة الاقتصاد بالمدارس ثنائية اللغة:\nمجالات درجات التقويم المستمر المعتمدة بمجلس القياس:\n\n• الاختبارات القصيرة التحريرية لمبادئ الاقتصاد: التكرار: 2، العلامة: 20 درجة، صفحات المرجع: 11 إلى 13.\n• البحث الاقتصادي أو المقال التحليلي الصفي: التكرار: 1، العلامة: 15 درجة، صفحات المرجع: 14 + 15.\n• تقديم البحوث والعروض التنسيقية: التكرار: 1، العلامة: 10 درجات، صفحات المرجع: صفحة 16.\n• دراسات الحالة وتحليل مشكلات السوق والمستهلك: التكرار: 1، العلامة: 15 درجة، صفحات المرجع: صفحة 17.\n\nملحوظات مادة الاقتصاد لمدارس ثنائية اللغة:\n• غياب توضيح مصفوفة تقدير العلامات لكل مجهود فردي بكراسات الطلاب يسقط قيمة التقييم.\n• تقييم المشروع البحثي يتطلب تفصيل منهجية التحليل والمراجع الرسمية للمتغيرات الاقتصادية.",
    contentEn: "14- Economy Subject (Bilingual Program):\nContinuous evaluation parameters, economic analysis portfolios, and term marks:\n\n• Written Theory Economy Short Tests: 2 test reviews, 20 marks. Manual Pages: 11 to 13.\n• Economics Research Analysis or Guided Essay: 1 task, 15 marks. Pages: 14 & 15.\n• Presentation of research files & findings: 1 presentation, 10 marks. Page: 16.\n• Micro/Macroeconomic Case Study Analysis: 1 structured file, 15 marks. Page: 17.\n\nBilingual Economics Department Guidance:\n• Clear rubrics detailing how teachers scored student's economic essays are necessary inside the folders to justify CA registers.\n• Projects must illustrate independent qualitative or quantitative analysis formats, complete with validated source bibliography.",
    tableData: {
      headers: ["أداة تقويم الاقتصاد / Economics CA Tool", "مرات التقييم / Frequency", "توزيع العلامات / Marks Allocation", "الصفحة المرجعية / Reference Page No."],
      rows: [
        ["الاختبارات القصيرة / Short Exams", "2", "20", "11 -> 13"],
        ["المقال الاقتصادي / Economics Essay", "1", "15", "14 + 15"],
        ["العرض الشفوي والتقديم / Presentation", "1", "10", "16"],
        ["دراسة الحالة الاقتصادية / Market Case Study", "1", "15", "17"]
      ]
    }
  },
  {
    pageNumber: 23,
    titleAr: "مادة دراسات الأعمال ثنائية اللغة",
    titleEn: "Business Studies Subject (Bilingual Program)",
    category: "subjects-en",
    contentAr: "15- مادة دراسات الأعمال بالمدارس ثنائية اللغة:\nأدوات ومقاييس درجات التقويم المستمر لإدارة وسوق الأعمال:\n\n• الاختبارات التحريرية القصيرة لسياسات التمويل والتسويق: التكرار: 2، العلامة: 20 درجة، صفحات المرجع: 11 إلى 13.\n• المشروع التطبيقي لإنشاء وإدارة الأعمال والشركات: التكرار: 1، العلامة: 15 درجة، صفحات المرجع: صفحة 14.\n• تقديم المشروع وعرض دراسة الجدوى وتكلفة الإنتاج: التكرار: 1، العلامة: 10 درجات، صفحات المرجع: صفحة 15.\n• دراسة حالة تسويقية وإدارية وحلول مشكلات الشركات: التكرار: 1، العلامة: 15 درجة، صفحات المرجع: صفحة 16.\n\nملحوظات لإدارة دراسات الأعمال بمدارس ثنائية اللغة:\n• يجب إرفاق مصفوفات التقييم الموضحة لكافة البنود والدرجة الجزئية لكل مؤشر أداء.",
    contentEn: "15- Business Studies Subject (Bilingual Program):\nContinuous evaluation profiles for enterprise management, market research & finance:\n\n• Written Management & Finance Short Tests: 2 test reviews, 20 marks. Manual Pages: 11 to 13.\n• Applied Company Project or Startup Pitch Deck: 1 project file, 15 marks. Page: 14.\n• Pitch Deck Presentation & Feasibility Analysis: 1 presentation instance, 10 marks. Page: 15.\n• Organizational Case Study & Business Problem Solving: 1 structured report, 15 marks. Page: 16.\n\nBilingual Business Studies Guidance:\n• It is mandatory to provide formal project grading matrices displaying criteria mapped strictly against core learning outcomes.",
    tableData: {
      headers: ["أداة تقويم دراسات الأعمال / Business CA Tool", "مرات التقييم / Frequency", "توزيع درجات المادة / Max Marks Alloc.", "صفحة المرجع بالدليل / Page No."],
      rows: [
        ["الامتحانات القصيرة / Business Short Tests", "2", "20", "11 -> 13"],
        ["المشروع الريادي وبرمجة الأعمال / Applied Project", "1", "15", "14"],
        ["تقديم وعرض دراسة الجدوى / Startup Presentation", "1", "10", "15"],
        ["تحليل حالة تجارية وتسويقية / Case Study File", "1", "15", "16"]
      ]
    }
  },
  {
    pageNumber: 24,
    titleAr: "مادة اللغة الإنجليزية الأساسية (English Core)",
    titleEn: "English Language Subject (English Core Blueprint)",
    category: "subjects-en",
    contentAr: "16- مادة اللغة الإنجليزية الأساسية (English Core):\nمستند تقييم مهارات الطالب (SAH) وأدوات ومقاييس درجات الكفاءة اللغوية:\n\nمهارة التحدث (Speaking):\n• ملاحظات كتابية لنشاط التفاعل اللغوي (written notes of INTERACTION): العلامة: 10 درجات.\n• ملاحظات كتابية لمشروعات التقديم الإنشائي (written notes of PRESENTATION): العلامة: 5 درجات.\n\nمهارة القراءة (Reading):\n• عينات ونصوص قراءة صيفية وتطبيقات صفية (reading samples of CLASS-BASED): العلامة: 5 درجات.\n\nمهارة الكتابة (Writing):\n• عينات ومقالات السرد القصصي (writing samples of NARRATIVE): العلامة: 5 درجات.\n• عينات ومقالات النقد والتقييم (writing samples of EVALUATIVE): العلامة: 5 درجات.\n• عينات ومقالات التفاعل والحوار (writing samples of INTERACTIVE): العلامة: 5 درجات.\n• عينات ومقالات التحليل الإخباري والوصفي (writing samples of INFORMATIVE): العلامة: 5 درجات.\n\nملحوظات وزارة التعليم لمادة الإنجليزية الأساسية:\n• يشترط وجود تعليقات تفصيلية وتاريخ رصد الدرجة وتوقيع المعلم بمسودة الأداء الشفوي لمهارة التحدث.\n• ملف الطالب يجب أن يحمل أربع عينات قسطية لنصوص وأنواع قراءة متنوعة على الأقل.",
    contentEn: "16 - English Language Subject (English Core):\nStudents Assessment Handbook (SAH) and mandatory language competence parameters:\n\nSpeaking Competency Skills:\n• Teacher notes of interactive student dialogs (INTERACTION): Total Marks: 10.\n• Teacher notes of formal topic presentation tasks (PRESENTATION): Total Marks: 5.\n\nReading Competency Skills:\n• Evidence of comprehension, questions & reading samples (CLASS-BASED): Total Marks: 5.\n\nWriting Competency Skills:\n• Portfolio writing sample of narrative text (NARRATIVE / Semester 1): Total Marks: 5.\n• Portfolio writing sample of critical review article (EVALUATIVE / Semester 1): Total Marks: 5.\n• Portfolio writing sample of interactive task or letter (INTERACTIVE / Semester 2): Total Marks: 5.\n• Portfolio writing sample of informative review (INFORMATIVE / Semester 2): Total Marks: 5.\n\nEnglish Core Compliance Pointers:\n• All marks on speaking assessments require verified written logs capturing structural strengths and weaknesses for each candidate.\n• Reading folders must contain at least four distinct reading samples with clear, annotated learning tasks.",
    tableData: {
      headers: ["المهارة اللغوية / Language Skill", "أداة تقويم الإنجليزية / CA Assessment Tool", "تكرار التقييم / Frequency", "العلامة المحددة / Marks Alloc."],
      rows: [
        ["Speaking / التحدث", "Interaction notes / ملاحظات تفاعلية", "1", "10"],
        ["Speaking / التحدث", "Presentation notes / ملاحظات عروض", "1", "5"],
        ["Reading / القراءة", "Class-based reading samples / عينات فهم", "Min 4 samples", "5"],
        ["Writing / الكتابة", "Narrative sample / مقال سردي (Sm.1)", "1", "5"],
        ["Writing / الكتابة", "Evaluative sample / مقال تقييمي (Sm.1)", "1", "5"],
        ["Writing / الكتابة", "Interactive sample / رسالة تفاعلية (Sm.2)", "1", "5"],
        ["Writing / الكتابة", "Informative sample / تقرير وصفي (Sm.2)", "1", "5"]
      ]
    }
  },
  {
    pageNumber: 25,
    titleAr: "مادة اللغة الإنجليزية الاختيارية (English Elective)",
    titleEn: "English Language Subject (English Elective Blueprint)",
    category: "subjects-en",
    contentAr: "17- مادة اللغة الإنجليزية الاختيارية (English Elective):\nمقرر مهارات كفاءة اللغة والإنتاج التحريري والشفوي المتقدم:\n\nمهارة التحدث (Speaking):\n• تفاعلات صيفية وحفز حواري محرر برصد المعلم (written notes of INTERACTION): العلامة: 10 درجات.\n\nمهارة القراءة (Reading):\n• عينات فهم صفي لمقرر الكتيب (reading samples of CLASS-BASED): العلامة: 5 درجات.\n\nمهارة الكتابة (Writing):\n• عينات ومخاطبات المقال الإخباري التثقيفي (writing samples of INFORMATIVE): العلامة: 5 درجات.\n• عينات ومخاطبات المقال النقدي والبدائل (writing samples of EVALUATIVE): العلامة: 10 درجات.\n• عينات ومخاطبات المقالات التفاعلية والبريد (writing samples of INTERACTIVE): العلامة: 10 درجات.\n\nملحوظات تقييم مادة الإنجليزية الاختيارية:\n• تدوين ملاحظات المعلم بخط اليد أو مطبوعة بنقاط واضحة تستعرض نقاط قوة وضعف أداء الطالب بالتحدث الحواري.",
    contentEn: "17- English Language Subject (English Elective):\nAdvanced language training program, written composition levels and oral tools:\n\nSpeaking Competency Skills:\n• Verified written logs of structural interaction sessions (INTERACTION): Total Marks: 10.\n\nReading Competency Skills:\n• Evidence of class-based core reading sheets (CLASS-BASED): Total Marks: 5.\n\nWriting Competency Skills:\n• Portfolio writing sample of informative reviews (INFORMATIVE / Semester 1 & 2): Total Marks: 5.\n• Portfolio writing sample of comprehensive critical thesis (EVALUATIVE / Semester 1): Total Marks: 10.\n• Portfolio writing sample of complex interactive dialog/letter (INTERACTIVE / Semester 2): Total Marks: 10.\n\nEnglish Elective Compliance Pointers:\n• Teacher commentaries detailing candidates' spoken interaction must be saved, highlighting clear syntactic performance indexes.",
    tableData: {
      headers: ["المهارة اللغوية / Skill Focus", "أداة تقويم الإنجليزية الاختيارية / CA Elective Tool", "عدد العينات / Target Quantity", "العلامة المحددة / Marks Alloc."],
      rows: [
        ["Speaking / التحدث", "Interaction written notes / تدوينات تفاعلية", "1", "10"],
        ["Reading / القراءة", "Class-based reading samples / فهم وإجابة", "Min 4 samples", "5"],
        ["Writing / الكتابة", "Informative writing sample / المقال الإخباري", "1", "5"],
        ["Writing / الكتابة", "Evaluative writing sample / المقال المتقدم", "1", "10"],
        ["Writing / الكتابة", "Interactive writing sample / التعبير التفاعلي", "1", "10"]
      ]
    }
  },
  {
    pageNumber: 26,
    titleAr: "مادة اللغة الإنجليزية للنظام ثنائي اللغة (Bilingual)",
    titleEn: "English Language Subject (Bilingual Program Blueprint)",
    category: "subjects-en",
    contentAr: "18- مادة اللغة الإنجليزية للنظام ثنائي اللغة (Bilingual):\nأقسام التقييم لمدارس البرامج ثنائية اللغة لوزارة التعليم:\n\nمهارة التحدث (Speaking):\n• ملاحظات كتابية للعرض والتقديم الإبداعي (written notes of PRESENTATION): العلامة: 10 درجات.\n\nمهارة القراءة (Reading):\n• عينات ونصوص قراءة صيفية (reading samples of CLASS-BASED): العلامة: 5 درجات.\n\nمهارة الكتابة (Writing):\n• مقال إخباري وصفي (INFORMATIVE / Sm.1): العلامة: 5 درجات.\n• مقال تفاعلي حواري (INTERACTIVE / Sm.1): العلامة: 5 درجات.\n• مقال سردي قصصي (NARRATIVE / Sm.2): العلامة: 5 درجات.\n• مقال إقناعي خطابي (PERSUASIVE / Sm.2): العلامة: 5 درجات.\n\nمهارات الأدب والنصوص (Literature):\n• عينات قصص قصيرة وروايات وشعر ومسرح (SHORT STORIES / DRAMA / POETRY / NOVELS): العلامة: 5 درجات للفصل الأول + 5 درجات للفصل الثاني.\n\nملحوظات مادة الإنجليزية ثنائية اللغة:\n• يشترط وجود عينة أدبية واحدة على الأقل لكل نوع من الأجناس الأدبية (رواية، شعر، مسرحية) بملفات الطلاب.",
    contentEn: "18- English Language Subject (Bilingual Program):\nDedicated portfolio standards for advanced state bilingual branches:\n\nSpeaking Competency Skills:\n• Detailed descriptive performance logs of students' topic presentations (PRESENTATION): Total Marks: 10.\n\nReading Competency Skills:\n• Standard classroom-based reading diagnostics (CLASS-BASED): Total Marks: 5.\n\nWriting Competency Skills:\n• Informative analytical paper text (INFORMATIVE / Semester 1): Total Marks: 5.\n• Interactive letter or conversational task (INTERACTIVE / Semester 1): Total Marks: 5.\n• Creative narrative story manuscript (NARRATIVE / Semester 2): Total Marks: 5.\n• Argumentative persuasive discourse paper (PERSUASIVE / Semester 2): Total Marks: 5.\n\nCore Literature Competence:\n• Literary analysis reviews covering Short Stories, Drama, Poetry or Novels: Total Marks: 5 (Semester 1) + 5 (Semester 2).\n\nBilingual English Department Guidelines:\n• Student portfolios must encompass at least one literary analytical essay corresponding to assigned drama, poetry, or novels.",
    tableData: {
      headers: ["المهارات الفنية / Subject Category", "أداة تقويم ثقافة اللغة / CA Bilingual Tool", "ترشيح التكرار / Target Tracking", "العلامة المحددة / Marks Alloc."],
      rows: [
        ["Speaking / التحدث", "Presentation notes / ملاحظات تقديم", "1", "10"],
        ["Reading / القراءة", "Class-based reading samples / قرائيات صيفية", "Min 4 samples", "5"],
        ["Writing / الكتابة", "Writing portfolio essays / مقالات فصلية منوعة", "4 tasks", "20 (5 x 4)"],
        ["Literature / الأدب", "Short Stories / Drama reviews (Sm.1)", "Min 1 analysis", "5"],
        ["Literature / الأدب", "Poetry / Novels analytical tasks (Sm.2)", "Min 1 analysis", "5"]
      ]
    }
  },
  {
    pageNumber: 27,
    titleAr: "مادة اللغة الألمانية",
    titleEn: "Deutsch Language Subject Blueprint (German)",
    category: "subjects-en",
    contentAr: "19- مادة اللغة الألمانية:\nمقرر وهيكل درجات تقويم اللغة الألمانية لوزارة التعليم:\n\nمهارة التحدث (Speaking):\n• ملاحظات كتابية لنشاط التفاعل الحواري بالألمانية (written notes of INTERACTION): العلامة: 15 درجة.\n• ملاحظات كتابية لمشروعات التقديم الإنشائي (written notes of PRESENTATION): العلامة: 10 درجات.\n\nمهارة القراءة (Reading):\n• عينات ونصوص قراءة صيفية وتطبيقات صيفية (reading samples of CLASS-BASED): العلامة: 10 درجات.\n\nمهارة الكتابة (Writing):\n• عينات ومخاطبات المقال الإخباري الوصفي بالألمانية (INFORMATIVE / Sm.1 & 2): العلامة: 5 درجات.\n• عينات ومخاطبات البريد الإلكتروني غير الرسمي بالألمانية (INFORMAL EMAIL / Sm.1 & 2): العلامة: 10 درجات للمستوى الأول + 5 درجات للمستوى الثاني.\n• عينات ومخاطبات البريد الإلكتروني الرسمي بالألمانية (FORMAL EMAIL / Sm.2): العلامة: 5 درجات.\n\nمهارة الاستماع (Listening):\n• ملفات وعينات فهم الاستماع الألماني الصفي (listening samples of CLASS-BASED): العلامة: 10 درجات.\n\nملحوظات وزارة التعليم لمادة الألمانية:\n• ملف الطالب يجب أن يحمل عينات وافية لرسائل البريد الإلكتروني بنوعيه الرسمي وغير الرسمي.",
    contentEn: "19- Deutsch Language Subject:\nComprehensive framework and official CA mark sheets for German school courses:\n\nSpeaking Competency Skills:\n• Verified written logs of structural interaction sessions in German (INTERACTION): Total Marks: 15.\n• Verified written logs of topic presentation and vocabulary expression (PRESENTATION): Total Marks: 10.\n\nReading Competency Skills:\n• Portfolio evidence of German text comprehension worksheets (CLASS-BASED): Total Marks: 10.\n\nWriting Competency Skills:\n• Written German informative summary sheets (INFORMATIVE / Semester 1 & 2): Total Marks: 5.\n• Applied Informal German Email compositions (INFORMAL EMAIL / Semester 1 & 2): Marks: 10 (Sem.1) / 5 (Sem.2).\n• Formal letter or German email compositions (FORMAL EMAIL / Semester 2): Total Marks: 5.\n\nListening Competency Skills:\n• Comprehension feedback and auditive diagnostic tests (CLASS-BASED): Total Marks: 10.\n\nGerman Department Compliance:\n• Portfolios must hold at least two independent email messages displaying structural formal and informal speech codes.",
    tableData: {
      headers: ["المكون الألماني / Deutsch Skill Component", "مرات التقييم / Frequency Tracker", "توزيع درجات الألمانية / Marks Alloc.", "صفحات المرجع ومستند SAH / manual Info"],
      rows: [
        ["Speaking Interaction / تفاعل تحدث", "1", "15", "SAH Guidelines Index"],
        ["Speaking Presentation / تقديم لغوي", "1", "10", "SAH Guidelines Index"],
        ["Reading / القراءة والفهم", "Min 4 samples", "10", "CLASS-BASED files"],
        ["Informative Writing / كتابة وصفية", "1", "5", "Portfolios files"],
        ["Informal German Email / بريد غير رسمي", "2 (1xSm1, 1xSm2)", "15 (10+5)", "German email templates"],
        ["Formal German Email / بريد رسمي", "1 (Sm.2)", "5", "German letter guidelines"],
        ["Listening / الاستماع والإنصات", "Min 3 samples", "10", "Auditive tests logs"]
      ]
    }
  },
  {
    pageNumber: 28,
    titleAr: "مادة اللغة الفرنسية",
    titleEn: "French Language Subject Blueprint (French)",
    category: "subjects-en",
    contentAr: "20- مادة اللغة الفرنسية:\nمقرر وهيكل درجات تقويم اللغة الفرنسية لوزارة التعليم:\n\nمهارة التحدث (Speaking):\n• ملاحظات كتابية للتفاعل الحواري الشفوي بالفرنسية (INTERACTION / Sm.1): العلامة: 25 درجة.\n• ملاحظات كتابية لعرض مشروع شفوي تقديمي (PRESENTATION / Sm.2): العلامة: 10 درجات.\n• ملاحظات كتابية لتفاعلات شفوية بنهاية العام (INTERACTION / Sm.2): العلامة: 15 درجة.\n\nمهارة القراءة (Reading):\n• عينات ونصوص قراءة صيفية وتطبيقات الفهم (reading samples of CLASS-BASED): العلامة: 10 درجات.\n\nمهارة الكتابة (Writing):\n• عينات المقال الوصفي الفرنسي بالترم الأول (INFORMATIVE / Sm.1): العلامة: 15 درجة.\n• عينات التعبير التفاعلي والحوار بالترم الثاني (INTERACTIVE / Sm.2): العلامة: 10 درجات.\n• عينات المقال التعريفي والوصفي بالترم الثاني (INFORMATIVE / Sm.2): العلامة: 5 درجات.\n\nمهارة الاستماع (Listening):\n• اختبارات فهم الاستماع الفرنسي وتطبيقاته الصفية (listening samples of CLASS-BASED): العلامة: 10 درجات.\n\nملحوظات وزارة التعليم لمادة الفرنسية:\n• ملف الطالب يجب أن يحمل اختبارات استماع مقيمة ومؤرخة باليوم والدرجة بمسودة المنهج.",
    contentEn: "20- French Language Subject:\nContinuous evaluation frameworks and marks specifications for French school programs:\n\nSpeaking Competency Skills:\n• Spoken interactive dialogue sessions in French language (INTERACTION / Semester 1): Total Marks: 25.\n• Spoken formal topic presentation reviews (PRESENTATION / Semester 2): Total Marks: 10.\n• Final speaking interactive tests (INTERACTION / Semester 2): Total Marks: 15.\n\nReading Competency Skills:\n• French text reading comprehension feedback sheets (CLASS-BASED): Total Marks: 10.\n\nWriting Competency Skills:\n• Creative French informative essay sheets (INFORMATIVE / Semester 1): Total Marks: 15.\n• French written interactive compositions (INTERACTIVE / Semester 2): Total Marks: 10.\n• Written French informative review sheets (INFORMATIVE / Semester 2): Total Marks: 5.\n\nListening Competency Skills:\n• Listening comprehension diaries and auditive test notes (CLASS-BASED): Total Marks: 10.\n\nFrench Department Compliance:\n• Portfolios must hold comprehensive folders indicating certified evaluations of speaking and listening, dating each test instance.",
    tableData: {
      headers: ["المكون الفرنسي / French Skill Target", "تكرار التقييم / Frequency", "علامة المادة / Marks Alloc.", "صفحة المرجع الأساسي / Manual Page No."],
      rows: [
        ["Speaking Interaction (Sem.1) / تفاعل شفوي", "1", "25", "French Speaking Rubrics"],
        ["Speaking Presentation (Sem.2) / عرض شفوي", "1", "10", "French Speaking Rubrics"],
        ["Speaking Interaction (Sem.2) / تفاعل ختامي", "1", "15", "French Speaking Rubrics"],
        ["Reading / القراءة ومقالات الفهم", "Min 4 tasks", "10", "CLASS-BASED portfolios"],
        ["Informative Writing (Sem.1) / كتابة وصفية", "1", "15", "Student essay folders"],
        ["Interactive Writing (Sem.2) / حوار كتابي", "1", "10", "Student essay folders"],
        ["Informative Writing (Sem.2) / وصف فرنسي", "1", "5", "Student essay folders"],
        ["Listening / الاستماع والإنصات صفي", "Min 3 tasks", "10", "Audio feedback archives"]
      ]
    }
  },
  {
    pageNumber: 29,
    titleAr: "خلفية التوثيق والمظهر الختامي",
    titleEn: "CEAM Board Directory & Conclusion Photo",
    category: "cover",
    contentAr: "سلطنة عُمان • وزارة التعليم\nمركز القياس والتقويم التربوي بمسقط (CEAM)\n\nفي ختام هذا الدليل، يُشيد مركز القياس والتقويم بالتزام الكوادر التعليمية والإدارية في الميدان لضمان جودة تطبيق أدوات التقويم بمدارسنا العامة والخاصة ثنائية اللغة لرفع كفاءة ومصداقية التحصيل ومخرجات طلابنا الأوفياء.",
    contentEn: "Sultanate of Oman • Ministry of Education\nCenter for Educational Assessment and Measurement, Muscat (CEAM)\n\nWe commend our pedagogical inspectors, administrative leaders, and dedicated classroom educators for holding continuous assessment elements to international standards, building trust and excellence for Omani students."
  }
];
