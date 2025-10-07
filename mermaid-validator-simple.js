/**
 * Simple Mermaid Syntax Validator
 * Uses regex-based validation for better performance and reliability
 * Supports all major Mermaid diagram types
 */

class SimpleMermaidValidator {
  constructor() {
    this.isInitialized = true; // No initialization needed
    this.patterns = this.initializePatterns();
  }

  initializePatterns() {
    return {
      // Flowchart patterns
      graph: {
        types: /^(graph|flowchart)\s*(TB|TD|BT|RL|LR)?\s*$/i,
        node: /^[A-Za-z0-9_]+(\[[^\]]*\]|\([^\)]*\)|\{[^}]*\}|[^:]*?:[^:]*|<[^>]*>|\*[^*]*\*)?\s*$/,
        connection: /^\s*[A-Za-z0-9_]+\s*(-->|---|\.\.\.>|==>|---\|>|\.\.\.\|>|\.\.\.)\s*[A-Za-z0-9_]+\s*(\[[^\]]*\]|\([^\)]*\)|\{[^}]*\})?(\s*\|\s*.+?\s*\|)?\s*$/,
        subgraph: /^subgraph\s+(.+)\s*$/i,
        endSubgraph: /^end\s*$/i,
        comment: /^%%.*$/
      },

      // Sequence diagram patterns
      sequence: {
        type: /^sequenceDiagram\s*$/i,
        participant: /^participant\s+(.+?)\s+as\s+(.+?)\s*$/i,
        message: /^\s*(.+?)\s*(->>|-->>|\-\->|-\-\->|->|-->|x|-\-x|\-\-x)\s*(.+?):\s*(.+?)\s*$/,
        note: /^note\s+(right|left|over)\s+(.+?):\s*(.*?)\s*$/i,
        loop: /^loop\s+(.*?)\s*$/i,
        alt: /^alt\s+(.*?)\s*$/i,
        else: /^else\s+(.*?)\s*$/i,
        end: /^end\s*$/i,
        comment: /^%%.*$/
      },

      // Class diagram patterns
      classDiagram: {
        type: /^classDiagram\s*$/i,
        classDef: /^class\s+(\w+)(\s+<\|\-.*|\s*\{[^}]*\})?\s*$/i,
        relation: /^\s*(\w+)\s*(--|\.\.\.|<\|--|\*--|o--|\|\.\.\.)\s*(\w+)\s*$/i,
        method: /^\s*[+\-#~]?\s*\w+\([^)]*\)(\s*:\s*\w+)?\s*$/,
        property: /^\s*[+\-#~]?\s*\w+(\s*:\s*\w+)?\s*$/,
        comment: /^%%.*$/
      },

      // State diagram patterns
      stateDiagram: {
        type: /^stateDiagram(-v2)?\s*$/i,
        state: /^\s*\[?\*?\]?\s*-->\s*\w+(\s*:\s*.+?)?\s*$/i,
        transition: /^\s*(\w+|\[*\]?)\s*-->\s*(\w+|\[*\]?)(\s*:\s*.+?)?\s*$/i,
        initial: /^\s*\[\*\]\s*-->\s*\w+\s*$/i,
        final: /^\s*\w+\s*-->\s*\[\*\]\s*$/i,
        comment: /^%%.*$/
      },

      // ER diagram patterns
      erDiagram: {
        type: /^erDiagram\s*$/i,
        entity: /^(\w+)\s*\{\s*$/,
        attribute: /^\s*(\w+)\s+(\w+)(\s+(PK|FK))?\s*$/,
        relationship: /^\s*(\w+)\s*(\|\||\{o|o\||}o|o{|\|\}|}\||\{\{)\s*(\w+)\s*:\s*(.+?)\s*$/,
        endEntity: /^\s*\}\s*$/,
        simpleRelationship: /^\s*(\w+)\s*(\|\||\{o|o\||}o|o{|\|\}|}\||\{\{)\s*(\w+)\s*$/,
        comment: /^%%.*$/
      },

      // Gantt chart patterns
      gantt: {
        type: /^gantt\s*$/i,
        title: /^title\s+(.+?)\s*$/i,
        dateFormat: /^dateFormat\s+(.+?)\s*$/i,
        section: /^section\s+(.+?)\s*$/i,
        task: /^\s*(\w+)\s*:\s*(.+?),\s*(.+?)(\s*,\s*(.+?))?\s*$/,
        milestone: /^\s*(\w+)\s*:\s*milestone,\s*(.+?)\s*$/,
        comment: /^%%.*$/
      },

      // Journey diagram patterns
      journey: {
        type: /^journey\s*$/i,
        title: /^title\s+(.+?)\s*$/i,
        section: /^section\s+(.+?)\s*$/i,
        task: /^\s*(.+?)\s*:\s*(\d+)\s*:\s*(.+?)\s*$/,
        comment: /^%%.*$/
      },

      // Pie chart patterns
      pie: {
        type: /^pie\s*(title\s+(.+?))?\s*$/i,
        data: /^\s*"(.*?)"\s*:\s*(\d+)\s*$/,
        comment: /^%%.*$/
      },

      // Git graph patterns
      gitGraph: {
        type: /^gitGraph\s*$/i,
        commit: /^\s*commit\s*(?:type:\s*(\w+))?\s*$/i,
        branch: /^\s*branch\s+(.+?)\s*$/i,
        checkout: /^\s*checkout\s+(.+?)\s*$/i,
        merge: /^\s*merge\s+(.+?)\s*$/i,
        cherryPick: /^\s*cherry-pick\s+(.+?)\s*$/i,
        comment: /^%%.*$/
      },

      // Mind map patterns
      mindmap: {
        type: /^mindmap\s*$/i,
        node: /^\s*([\s]*)([\+\-\*])(.+?)(\(\(.*?\)\))?(\[.*?\])?(\{.*?\})?\s*$/,
        comment: /^%%.*$/
      }
    };
  }

  /**
   * Validate Mermaid diagram syntax using pattern matching
   */
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
    let errors = [];
    let elementCount = 0;

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
    switch (diagramType) {
      case 'graph':
        return this.validateGraph(lines);
      case 'sequence':
        return this.validateSequence(lines);
      case 'classDiagram':
        return this.validateClassDiagram(lines);
      case 'stateDiagram':
        return this.validateStateDiagram(lines);
      case 'erDiagram':
        return this.validateERDiagram(lines);
      case 'gantt':
        return this.validateGantt(lines);
      case 'journey':
        return this.validateJourney(lines);
      case 'pie':
        return this.validatePie(lines);
      case 'gitGraph':
        return this.validateGitGraph(lines);
      case 'mindmap':
        return this.validateMindmap(lines);
      default:
        return {
          isValid: false,
          error: `Unsupported diagram type: ${diagramType}`,
          type: 'unsupported',
          line: 1,
          suggestion: 'Use a supported diagram type'
        };
    }
  }

  validateGraph(lines) {
    let hasType = false;
    let hasNodes = false;
    let hasConnections = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      // Check for graph type declaration
      if (this.patterns.graph.types.test(line)) {
        hasType = true;
        continue;
      }

      // Check for subgraph
      if (this.patterns.graph.subgraph.test(line)) {
        continue;
      }

      // Check for end subgraph
      if (this.patterns.graph.endSubgraph.test(line)) {
        continue;
      }

      // Check for node definition
      if (this.patterns.graph.node.test(line)) {
        hasNodes = true;
        continue;
      }

      // Check for connection
      if (this.patterns.graph.connection.test(line)) {
        hasConnections = true;
        continue;
      }

      // If we get here, line doesn't match any pattern
      return {
        isValid: false,
        error: `Invalid graph syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check graph syntax. Valid formats: A[Text], A --> B, subgraph Title'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing graph type declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "graph TB" or "graph TD" at the beginning'
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

  validateSequence(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.sequence.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.sequence.participant.test(line) ||
          this.patterns.sequence.message.test(line) ||
          this.patterns.sequence.note.test(line) ||
          this.patterns.sequence.loop.test(line) ||
          this.patterns.sequence.alt.test(line) ||
          this.patterns.sequence.else.test(line) ||
          this.patterns.sequence.end.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid sequence diagram syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check sequence diagram syntax. Valid formats: A->>B: Message, participant A as Alice'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing sequence diagram declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "sequenceDiagram" at the beginning'
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

  validateClassDiagram(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.classDiagram.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.classDiagram.classDef.test(line) ||
          this.patterns.classDiagram.relation.test(line) ||
          this.patterns.classDiagram.method.test(line) ||
          this.patterns.classDiagram.property.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid class diagram syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check class diagram syntax. Valid formats: class ClassName, A --> B'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing class diagram declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "classDiagram" at the beginning'
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

  validateStateDiagram(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.stateDiagram.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.stateDiagram.state.test(line) ||
          this.patterns.stateDiagram.transition.test(line) ||
          this.patterns.stateDiagram.initial.test(line) ||
          this.patterns.stateDiagram.final.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid state diagram syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check state diagram syntax. Valid formats: [*] --> State, State1 --> State2'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing state diagram declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "stateDiagram" or "stateDiagram-v2" at the beginning'
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

  validateERDiagram(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.erDiagram.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.erDiagram.entity.test(line) ||
          this.patterns.erDiagram.attribute.test(line) ||
          this.patterns.erDiagram.relationship.test(line) ||
          this.patterns.erDiagram.simpleRelationship.test(line) ||
          this.patterns.erDiagram.endEntity.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid ER diagram syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check ER diagram syntax. Valid formats: ENTITY { }, ENTITY ||--o{ ENTITY : relationship'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing ER diagram declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "erDiagram" at the beginning'
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

  validateGantt(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.gantt.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.gantt.title.test(line) ||
          this.patterns.gantt.dateFormat.test(line) ||
          this.patterns.gantt.section.test(line) ||
          this.patterns.gantt.task.test(line) ||
          this.patterns.gantt.milestone.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid Gantt chart syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check Gantt chart syntax. Valid formats: title Text, section Name, task : id, date, duration'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing Gantt chart declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "gantt" at the beginning'
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

  validateJourney(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.journey.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.journey.title.test(line) ||
          this.patterns.journey.section.test(line) ||
          this.patterns.journey.task.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid journey diagram syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check journey diagram syntax. Valid formats: title Text, section Name, Task: score: User'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing journey diagram declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "journey" at the beginning'
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

  validatePie(lines) {
    let hasType = false;
    let hasData = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.pie.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.pie.data.test(line)) {
        hasData = true;
        continue;
      }

      return {
        isValid: false,
        error: `Invalid pie chart syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check pie chart syntax. Valid formats: "Label" : value'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing pie chart declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "pie" or "pie title Text" at the beginning'
      };
    }

    if (!hasData) {
      return {
        isValid: false,
        error: 'No data found in pie chart',
        type: 'no_data',
        line: 2,
        suggestion: 'Add data in format: "Label" : value'
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

  validateGitGraph(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.gitGraph.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.gitGraph.commit.test(line) ||
          this.patterns.gitGraph.branch.test(line) ||
          this.patterns.gitGraph.checkout.test(line) ||
          this.patterns.gitGraph.merge.test(line) ||
          this.patterns.gitGraph.cherryPick.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid Git graph syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check Git graph syntax. Valid formats: commit, branch name, checkout name, merge name'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing Git graph declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "gitGraph" at the beginning'
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

  validateMindmap(lines) {
    let hasType = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('%%')) continue;

      if (this.patterns.mindmap.type.test(line)) {
        hasType = true;
        continue;
      }

      if (this.patterns.mindmap.node.test(line)) {
        continue;
      }

      return {
        isValid: false,
        error: `Invalid mind map syntax: "${line}"`,
        type: 'syntax',
        line: i + 1,
        suggestion: 'Check mind map syntax. Use indentation and +, -, or * for hierarchy'
      };
    }

    if (!hasType) {
      return {
        isValid: false,
        error: 'Missing mind map declaration',
        type: 'no_type',
        line: 1,
        suggestion: 'Add "mindmap" at the beginning'
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
      validationType: 'regex-based'
    };
  }
}

export default SimpleMermaidValidator;