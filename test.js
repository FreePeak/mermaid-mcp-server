#!/usr/bin/env node

import MermaidValidator from './mermaid-validator-flexible.js';

/**
 * Test suite for Mermaid MCP Server
 * Tests various diagram types and validation scenarios
 */

const testDiagrams = {
  valid: [
    {
      name: 'Simple Flowchart',
      code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D`,
      type: 'graph'
    },
    {
      name: 'Sequence Diagram',
      code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!`,
      type: 'sequenceDiagram'
    },
    {
      name: 'Class Diagram',
      code: `classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog`,
      type: 'classDiagram'
    },
    {
      name: 'State Diagram',
      code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still`,
      type: 'stateDiagram'
    },
    {
      name: 'Gantt Chart',
      code: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Research   :a1, 2024-01-01, 30d
    Development :a2, after a1, 60d`,
      type: 'gantt'
    },
    {
      name: 'ER Diagram',
      code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }`,
      type: 'erDiagram'
    },
    {
      name: 'User Journey',
      code: `journey
    title User Journey
    section Purchase
      Browse: 5: User
      Select: 3: User
      Buy: 2: User`,
      type: 'journey'
    },
    {
      name: 'Pie Chart',
      code: `pie title Pets in 2024
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
      type: 'pie'
    },
    {
      name: 'Git Graph',
      code: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop`,
      type: 'gitgraph'
    },
    {
      name: 'Mind Map',
      code: `mindmap
      root((Mermaid))
        Syntax
          Flowchart
          Sequence
          Class
        Styling
          Themes
          CSS`,
      type: 'mindmap'
    }
  ],
  invalid: [
    {
      name: 'Missing diagram type',
      code: `A --> B
    B --> C`,
      expectedError: 'no_type'
    },
    {
      name: 'Invalid syntax',
      code: `graph TD
    A[Start] -> B[End]`,
      expectedError: 'syntax'
    },
    {
      name: 'Unknown command',
      code: `graph TD
    A[Start] --> B[End]
    invalidCommand xyz`,
      expectedError: 'unknown_command'
    },
    {
      name: 'Malformed sequence diagram',
      code: `sequenceDiagram
    A->>B: Hello
    B-:A: Broken arrow`,
      expectedError: 'syntax'
    },
    {
      name: 'Invalid class diagram',
      code: `classDiagram
    class Test {
        +invalidProperty::
    }`,
      expectedError: 'syntax'
    }
  ]
};

class TestRunner {
  constructor() {
    this.validator = new MermaidValidator();
    this.results = {
      valid: [],
      invalid: [],
      performance: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        totalTime: 0,
        averageTime: 0
      }
    };
  }

  async runTests() {
    console.log('🚀 Starting Mermaid MCP Server Tests\n');

    // Simple validator doesn't need initialization
    console.log('✅ Validator ready (simple mode)\n');

    // Test valid diagrams
    await this.testValidDiagrams();

    // Test invalid diagrams
    await this.testInvalidDiagrams();

    // Test batch validation
    await this.testBatchValidation();

    // Test performance
    await this.testPerformance();

    // Display results
    this.displayResults();
  }

  async testValidDiagrams() {
    console.log('📊 Testing Valid Diagrams');
    console.log('================================');

    for (const test of testDiagrams.valid) {
      console.log(`\nTesting: ${test.name}`);
      console.log(`Code: ${test.code.split('\n')[0]}...`);

      const result = await this.validator.validateSyntax(test.code);

      if (result.isValid) {
        console.log(`✅ PASSED - ${result.diagramType} (${result.processingTime}ms)`);
        this.results.valid.push({
          name: test.name,
          result,
          passed: true
        });
        this.results.summary.passed++;
      } else {
        console.log(`❌ FAILED - Expected valid but got: ${result.error}`);
        this.results.valid.push({
          name: test.name,
          result,
          passed: false
        });
        this.results.summary.failed++;
      }

      this.results.performance.push(result.processingTime);
      this.results.summary.total++;
    }
  }

  async testInvalidDiagrams() {
    console.log('\n\n❌ Testing Invalid Diagrams');
    console.log('================================');

    for (const test of testDiagrams.invalid) {
      console.log(`\nTesting: ${test.name}`);
      console.log(`Code: ${test.code.split('\n')[0]}...`);

      const result = await this.validator.validateSyntax(test.code);

      if (!result.isValid) {
        const errorMatch = !test.expectedError || result.type === test.expectedError;

        if (errorMatch) {
          console.log(`✅ PASSED - ${result.type}: ${result.error} (${result.processingTime}ms)`);
          this.results.invalid.push({
            name: test.name,
            result,
            expectedError: test.expectedError,
            passed: true
          });
          this.results.summary.passed++;
        } else {
          console.log(`⚠️  PARTIAL - Expected ${test.expectedError}, got ${result.type}: ${result.error}`);
          this.results.invalid.push({
            name: test.name,
            result,
            expectedError: test.expectedError,
            passed: false
          });
          this.results.summary.failed++;
        }
      } else {
        console.log(`❌ FAILED - Expected invalid but got valid`);
        this.results.invalid.push({
          name: test.name,
          result,
          expectedError: test.expectedError,
          passed: false
        });
        this.results.summary.failed++;
      }

      this.results.performance.push(result.processingTime);
      this.results.summary.total++;
    }
  }

  async testBatchValidation() {
    console.log('\n\n📦 Testing Batch Validation');
    console.log('================================');

    const validCodes = testDiagrams.valid.map(t => t.code);
    const invalidCodes = testDiagrams.invalid.map(t => t.code);
    const allCodes = [...validCodes, ...invalidCodes];

    console.log(`\nTesting batch validation with ${allCodes.length} diagrams...`);

    const startTime = Date.now();
    const results = await this.validator.validateBatch(allCodes);
    const batchTime = Date.now() - startTime;

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.filter(r => !r.isValid).length;

    console.log(`✅ Batch validation completed in ${batchTime}ms`);
    console.log(`📊 Results: ${validCount} valid, ${invalidCount} invalid`);

    this.results.batch = {
      totalTime: batchTime,
      validCount,
      invalidCount,
      results
    };
  }

  async testPerformance() {
    console.log('\n\n⚡ Performance Testing');
    console.log('================================');

    // Test with increasingly complex diagrams
    const complexityTests = [
      { name: 'Simple', code: 'graph TD\n    A --> B' },
      {
        name: 'Medium',
        code: `graph TD
            A[Start] --> B{Decision}
            B -->|Yes| C[Process 1]
            B -->|No| D[Process 2]
            C --> E[End]
            D --> E`
      },
      {
        name: 'Complex',
        code: `graph TD
            A[Start] --> B{Decision}
            B -->|Yes| C[Process A]
            B -->|No| D[Process B]
            C --> E{Check}
            D --> F{Validate}
            E -->|OK| G[Continue]
            E -->|Error| H[Retry]
            F -->|Valid| I[Proceed]
            F -->|Invalid| J[Correct]
            G --> K[End]
            H --> C
            I --> K
            J --> D`
      }
    ];

    for (const test of complexityTests) {
      console.log(`\nTesting ${test.name} diagram complexity...`);

      const times = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const result = await this.validator.validateSyntax(test.code);
        times.push(result.processingTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`📊 Performance: Avg ${avgTime.toFixed(2)}ms, Min ${minTime}ms, Max ${maxTime}ms`);
    }
  }

  displayResults() {
    console.log('\n\n📈 Test Results Summary');
    console.log('================================');

    const { summary } = this.results;
    const avgPerformance = this.results.performance.reduce((a, b) => a + b, 0) / this.results.performance.length;
    summary.totalTime = avgPerformance;
    summary.averageTime = avgPerformance;

    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    console.log(`Average Processing Time: ${summary.averageTime.toFixed(2)}ms`);

    if (this.results.batch) {
      console.log(`\nBatch Validation:`);
      console.log(`  Total time: ${this.results.batch.totalTime}ms`);
      console.log(`  Valid: ${this.results.batch.validCount}`);
      console.log(`  Invalid: ${this.results.batch.invalidCount}`);
    }

    // Memory stats
    const stats = this.validator.getStats();
    console.log(`\nMemory Usage:`);
    console.log(`  RSS: ${(stats.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Heap Used: ${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Heap Total: ${(stats.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);

    // Failed tests details
    const failedTests = [...this.results.valid, ...this.results.invalid].filter(t => !t.passed);
    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedTests.forEach(test => {
        console.log(`  - ${test.name}`);
      });
    }

    console.log('\n🎉 Test suite completed!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.runTests().catch(console.error);
}

export default TestRunner;