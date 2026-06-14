const fs = require('fs');

const file = 'src/pages/GamePage.jsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Find the index of the line containing '{/* Toast */}'
const toastLineIndex = lines.findIndex(line => line.includes('{/* Toast */}'));

// Find the index of 'disabled={isAILoading || !inputText.trim()}' to locate line 1249
const disabledLineIndex = lines.findIndex(line => line.includes('disabled={isAILoading || !inputText.trim()}'));

// The end of the chat container is 4 lines after disabledLineIndex
const endOfChatContainerIndex = disabledLineIndex + 4;

// The lines we want to insert
const closingTags = [
  '            </div>',
  '          </div>',
  '        </motion.div>',
  '      </div>',
  ''
];

// Reconstruct the file
const newLines = [
  ...lines.slice(0, endOfChatContainerIndex + 1),
  ...closingTags,
  ...lines.slice(toastLineIndex)
];

fs.writeFileSync(file, newLines.join('\n'));
console.log('Fixed GamePage.jsx properly.');
