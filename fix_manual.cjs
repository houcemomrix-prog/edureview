const fs = require('fs');

function manualReplace(filePath, searchStr, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<\/DocumentViewer>/g, '');
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync(filePath, content);
}

manualReplace('src/App.tsx',
`                      </div>
                    </div>
                    {currentAssessment.feedback && (`,
`                      </DocumentViewer>
                    </div>
                    {currentAssessment.feedback && (`
);

manualReplace('src/components/SchoolArchiveView.tsx',
`                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (`,
`                      </DocumentViewer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (`
);
