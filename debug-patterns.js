import SimpleMermaidValidator from './mermaid-validator-simple.js';

const validator = new SimpleMermaidValidator();

// Test a flowchart line
const testLines = [
  'A[Start] --> B{Decision}',
  'class Animal {',
  'CUSTOMER ||--o{ ORDER : places',
  'root((Mermaid))'
];

testLines.forEach((line, index) => {
  console.log(`\nTesting line ${index + 1}: "${line}"`);

  // Test graph connection pattern
  if (validator.patterns.graph.connection.test(line)) {
    console.log('✅ Matches graph connection pattern');
  } else {
    console.log('❌ Does not match graph connection pattern');
  }

  // Test class diagram pattern
  if (validator.patterns.classDiagram.classDef.test(line)) {
    console.log('✅ Matches class definition pattern');
  } else {
    console.log('❌ Does not match class definition pattern');
  }

  // Test ER relationship pattern
  if (validator.patterns.erDiagram.simpleRelationship.test(line)) {
    console.log('✅ Matches ER relationship pattern');
  } else {
    console.log('❌ Does not match ER relationship pattern');
  }

  // Test mindmap pattern
  if (validator.patterns.mindmap.node.test(line)) {
    console.log('✅ Matches mindmap node pattern');
  } else {
    console.log('❌ Does not match mindmap node pattern');
  }
});