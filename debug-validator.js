import SimpleMermaidValidator from './mermaid-validator-simple.js';

const validator = new SimpleMermaidValidator();

// Test a simple flowchart
const testDiagram = `graph TD
    A[Start] --> B[End]`;

console.log('Testing simple flowchart:');
console.log('Pattern keys:', Object.keys(validator.patterns));
console.log('Graph patterns:', validator.patterns.graph);
console.log('Result:', validator.validateSyntax(testDiagram));