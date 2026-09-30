const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `          {activeTab === 'archive' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <SchoolArchiveView
                archivedForms={archivedForms}
                language={language}
                onSignForm={async (archiveId, pName, qrData, stampUrl) => {
                  await signArchivedForm(archiveId, pName, qrData, stampUrl);
                  await fetchArchivedFormsList();
                }}
                onSignTeacherForm={async (archiveId, tName, qrData) => {
                  await signArchivedTeacherForm(archiveId, tName, qrData);
                  await fetchArchivedFormsList();
                }}
                onSignExaminerForm={async (archiveId, eName, qrData, conformanceStatus, hasGradeRevisions) => {
                  await signArchivedExaminerForm(archiveId, eName, qrData, undefined, conformanceStatus, hasGradeRevisions);
                  await fetchArchivedFormsList();
                }}
                userProfile={userProfile}
                onSuccess={handleSuccess}
                certifiedOnly={true}
              />
            </div>
          )}

            </div>`;
const replacement = target + "\n            </ErrorBoundary>";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  
  // Clean up the wrong replacement if it exists
  const wrongReplacement = `            </ErrorBoundary>
          </div>
        )
      }
    </div>
  );
}`;
  const correctEnd = `          </div>
        )
      }
    </div>
  );
}`;
  code = code.replace(wrongReplacement, correctEnd);

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find the target");
}
