/**
 * Flexible Mermaid Syntax Validator
 * Uses more flexible patterns to accept valid syntax while catching obvious errors
 */

class FlexibleMermaidValidator {
  constructor() {
    this.isInitialized = true;
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      // More lenient flowchart patterns
      graph: {
        types: /^(graph|flowchart)\s*(TB|TD|BT|RL|LR)?\s*$/i,
        // More flexible node/connection pattern
        validLine: /^\s*[A-Za-z0-9_\s\[\]\(\)\{\}<>"':|+\-\*\/\\\.,\->]+\s*$/,
        comment: /^%%.*$/,
        subgraph: /^subgraph/,
        end: /^end\s*$/
      },

      // Sequence diagram patterns
      sequence: {
        type: /^sequenceDiagram\s*$/i,
        // More flexible participant and message patterns
        validLine: /^\s*(participant|loop|alt|else|end|note|actor)\b.*$|^\s*[A-Za-z0-9_]+\s*(->>|-->>|\-\->|-\-\->|->|-->|x|-\-x|\-\-x)\s*[A-Za-z0-9_]+.*$/i,
        comment: /^%%.*$/
      },

      // Class diagram patterns
      classDiagram: {
        type: /^classDiagram\s*$/i,
        // More flexible class patterns
        validLine: /^\s*(class|interface|enum)\b.*$|^\s*[A-Za-z0-9_]+\s*(--|\.\.\.|<\|--|\*--|o--|\|\.\.\.)\s*[A-Za-z0-9_]+.*$|^\s*[+\-#~]?\s*[A-Za-z0-9_]+(\(\))?\s*[:{].*$/i,
        comment: /^%%.*$/
      },

      // State diagram patterns
      stateDiagram: {
        type: /^stateDiagram(-v2)?\s*$/i,
        // More flexible state and transition patterns
        validLine: /^\s*\[*\]*\s*-->\s*\w+.*$|^\s*\w+\s*-->\s*\[*\]*.*$|^\s*\[\*\]\s*-->\s*\w+.*$|^\s*\w+\s*-->\s*\[\*\].*$/i,
        comment: /^%%.*$/
      },

      // ER diagram patterns
      erDiagram: {
        type: /^erDiagram\s*$/i,
        // More flexible entity and relationship patterns
        validLine: /^\s*\w+\s*\{.*$|^\s*\w+\s*:\s*\w+.*$|^\s*\w+\s*(\|\||\{o|o\||}o|o{|\|\}|}\||\{\{)\s*\w+.*$|^\s*\}\s*$/i,
        comment: /^%%.*$/
      },

      // Gantt chart patterns
      gantt: {
        type: /^gantt\s*$/i,
        // More flexible Gantt patterns
        validLine: /^\s*(title|dateFormat|section)\b.*$|^\s*\w+\s*:\s*.*$/i,
        comment: /^%%.*$/
      },

      // Journey diagram patterns
      journey: {
        type: /^journey\s*$/i,
        // More flexible journey patterns
        validLine: /^\s*(title|section)\b.*$|^\s*[^:]+:\s*\d+\s*:\s*\w+.*$/i,
        comment: /^%%.*$/
      },

      // Pie chart patterns
      pie: {
        type: /^pie\s*(title\s+.+)?\s*$/i,
        // More flexible pie data pattern
        validLine: /^\s*"[^"]+"\s*:\s*\d+\s*$/i,
        comment: /^%%.*$/
      },

      // Git graph patterns
      gitGraph: {
        type: /^gitGraph\s*$/i,
        // More flexible git patterns
        validLine: /^\s*(commit|branch|checkout|merge|cherry-pick)\b.*$/i,
        comment: /^%%.*$/
      },

      // Mind map patterns
      mindmap: {
        type: /^mindmap\s*$/i,
        // More flexible mindmap pattern - just check for basic structure
        validLine: /^\s*[\s]*[\+\-\*].*$/i,
        comment: /^%%.*$/
      }
    };
  }

  validateSyntax(diagramCode) {
    if (!diagramCode || typeof diagramCode !== 'string') {
      return {
        isValid: false,
        error: 'Diagram code must be a non-empty string',
        type: 'input_error',
        line: null,
        suggestion: null,
        processingTime: 0,
        diagramType: 'unknown',
        elementCount: 0
      };
    }

    const startTime = Date.now();
    const lines = diagramCode.split('\n');
    let diagramType = 'unknown';

    try {
      // Detect diagram type
      diagramType = this.detectDiagramType(lines);

      if (diagramType === 'unknown') {
        return {
          isValid: false,
          error: 'No valid diagram type detected',
          type: 'no_type',
          line: 1,
          suggestion: 'Add a diagram type at the beginning (e.g., graph TD, sequenceDiagram, classDiagram)',
          processingTime: Date.now() - startTime,
          diagramType: 'unknown',
          elementCount: 0
        };
      }

      // Validate based on diagram type
      const validationResult = this.validateByType(diagramType, lines);

      return {
        ...validationResult,
        processingTime: Date.now() - startTime,
        diagramType,
        elementCount: this.countElements(lines)
      };

    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        type: 'general',
        line: null,
        suggestion: 'Check diagram syntax and structure',
        processingTime: Date.now() - startTime,
        diagramType,
        elementCount: 0
      };
    }
  }

  detectDiagramType(lines) {
    const nonEmptyLines = lines.filter(line => line.trim() && !line.trim().startsWith('%%'));

    if (nonEmptyLines.length === 0) return 'unknown';

    const firstLine = nonEmptyLines[0].trim().toLowerCase();

    if (this.patterns.graph.types.test(firstLine)) return 'graph';
    if (this.patterns.sequence.type.test(firstLine)) return 'sequence';
    if (this.patterns.classDiagram.type.test(firstLine)) return 'classDiagram';
    if (this.patterns.stateDiagram.type.test(firstLine)) return 'stateDiagram';
    if (this.patterns.erDiagram.type.test(firstLine)) return 'erDiagram';
    if (this.patterns.gantt.type.test(firstLine)) return 'gantt';
    if (this.patterns.journey.type.test(firstLine)) return 'journey';
    if (this.patterns.pie.type.test(firstLine)) return 'pie';
    if (this.patterns.gitGraph.type.test(firstLine)) return 'gitGraph';
    if (this.patterns.mindmap.type.test(firstLine)) return 'mindmap';

    return 'unknown';
  }

  validateByType(diagramType, lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for comments
      if (line.startsWith('%%')) continue;

      // Check for diagram type declaration
      const typePattern = this.patterns[diagramType].type;
      if (typePattern && typePattern.test(line)) {
        hasType = true;
        continue;
      }

      // Check for valid lines based on diagram type
      const patterns = this.patterns[diagramType];
      let isValidLine = false;

      if (patterns.validLine && patterns.validLine.test(line)) {
        isValidLine = true;
      }

      // Special checks for subgraph/end in flowcharts
      if (diagramType === 'graph' && (patterns.subgraph.test(line) || patterns.end.test(line))) {
        isValidLine = true;
      }

      if (!isValidLine) {
        return {
          isValid: false,
          error: `Invalid ${diagramType} syntax: "${line}"`,
          type: 'syntax',
          line: i + 1,
          suggestion: `Check ${diagramType} diagram syntax`
        };
      }
    }

    if (!hasType) {
      return {
        isValid: false,
        error: `Missing ${diagramType} declaration`,
        type: 'no_type',
        line: 1,
        suggestion: `Add "${diagramType}" at the beginning`
      };
    }

    return {
      isValid: true,
      error: null,
      type: null,
      line: null,
      suggestion: null
    };
  }

  countElements(lines) {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('%%');
    }).length;
  }

  async validateBatch(diagrams) {
    const results = [];

    for (let i = 0; i < diagrams.length; i++) {
      const result = this.validateSyntax(diagrams[i]);
      results.push({
        index: i,
        ...result
      });
    }

    return results;
  }

  getSupportedTypes() {
    return [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'gantt',
      'journey',
      'pie',
      'gitGraph',
      'mindmap'
    ];
  }

  getStats() {
    return {
      isInitialized: this.isInitialized,
      supportedTypes: this.getSupportedTypes().length,
      memoryUsage: process.memoryUsage(),
      validationType: 'flexible-regex-based'
    };
  }
}

export default FlexibleMermaidValidator;