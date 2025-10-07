// Setup minimal DOM environment for validation
import { JSDOM } from 'jsdom';

// Create a minimal DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: false,
  resources: 'usable'
});

// Set global DOM variables
globalThis.document = dom.window.document;
globalThis.window = dom.window;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;

// Add DOMPurify fallback for validation-only mode
globalThis.DOMPurify = {
  sanitize: (input) => input,
  addHook: () => {},
  removeHook: () => {},
  setConfig: () => {},
  version: '2.4.0'
};

import mermaid from 'mermaid';

/**
 * Lightweight Mermaid syntax validator
 * Optimized for real-time validation with minimal memory footprint
 */
class MermaidValidator {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize Mermaid with minimal configuration for validation only
   */
  async init() {
    if (this.isInitialized) return;

    if (!this.initPromise) {
      this.initPromise = this._doInit();
    }

    return this.initPromise;
  }

  async _doInit() {
    try {
      // Configure Mermaid for validation only (no rendering)
      await mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: false
        },
        sequence: {
          useMaxWidth: false
        },
        gantt: {
          useMaxWidth: false
        },
        er: {
          useMaxWidth: false
        },
        journey: {
          useMaxWidth: false
        },
        // Disable unnecessary features for validation
        deterministicID: true,
        logLevel: 1, // Only errors
        // Disable DOM-related features that require DOMPurify
        fontFamily: 'monospace',
        fontSize: 16,
        securityLevel: 'loose'
      });

      this.isInitialized = true;
      console.log('[TRACE] Mermaid validator initialized successfully');
    } catch (error) {
      console.error('[ERROR] Failed to initialize Mermaid validator:', error);
      throw error;
    }
  }

  /**
   * Validate Mermaid diagram syntax
   * @param {string} diagramCode - The Mermaid diagram code to validate
   * @returns {Promise<ValidationResult>} - Validation result with details
   */
  async validateSyntax(diagramCode) {
    if (!diagramCode || typeof diagramCode !== 'string') {
      return {
        isValid: false,
        error: 'Diagram code must be a non-empty string',
        type: 'input_error',
        line: null,
        suggestion: null
      };
    }

    await this.init();

    const startTime = Date.now();

    try {
      // Use Mermaid's parse method for syntax validation only
      const result = await mermaid.parse(diagramCode);
      const processingTime = Date.now() - startTime;

      return {
        isValid: true,
        error: null,
        type: null,
        line: null,
        suggestion: null,
        processingTime,
        diagramType: this._extractDiagramType(diagramCode),
        elementCount: this._countElements(diagramCode)
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      return {
        isValid: false,
        error: error.message,
        type: this._classifyError(error),
        line: this._extractLineNumber(error),
        suggestion: this._getSuggestion(error),
        processingTime,
        diagramType: this._extractDiagramType(diagramCode),
        elementCount: 0
      };
    }
  }

  /**
   * Extract diagram type from code
   */
  _extractDiagramType(code) {
    const match = code.match(/^\s*(graph|flowchart|sequenceDiagram|seq|classDiagram|class|stateDiagram|state|erDiagram|er|gantt|journey|pie|gitgraph|mindmap|timeline|zenuml|c4|sankey|block|architecture)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Count elements in the diagram (nodes, connections, etc.)
   */
  _countElements(code) {
    const lines = code.split('\n');
    let count = 0;

    for (const line of lines) {
      // Count meaningful lines (not comments or empty)
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('%%') && !trimmed.startsWith('%%{')) {
        count++;
      }
    }

    return count;
  }

  /**
   * Classify the type of error
   */
  _classifyError(error) {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('syntax error')) return 'syntax';
    if (message.includes('no diagram type')) return 'no_type';
    if (message.includes('unknown')) return 'unknown_command';
    if (message.includes('parse')) return 'parse';
    if (message.includes('identifier')) return 'identifier';
    if (message.includes('relation')) return 'relation';

    return 'general';
  }

  /**
   * Extract line number from error
   */
  _extractLineNumber(error) {
    const message = error.message || '';
    const match = message.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Get suggestion based on error type
   */
  _getSuggestion(error) {
    const message = error.message?.toLowerCase() || '';
    const errorType = this._classifyError(error);

    const suggestions = {
      syntax: 'Check for missing semicolons, brackets, or incorrect syntax',
      no_type: 'Add a diagram type at the beginning (e.g., graph TD, sequenceDiagram)',
      unknown_command: 'Verify the command is supported in your Mermaid version',
      parse: 'Check the structure and syntax of your diagram',
      identifier: 'Ensure all identifiers are valid and properly referenced',
      relation: 'Check arrow syntax and node connections',
      general: 'Review the diagram syntax and structure'
    };

    return suggestions[errorType] || suggestions.general;
  }

  /**
   * Batch validate multiple diagrams
   */
  async validateBatch(diagrams) {
    const results = [];

    for (let i = 0; i < diagrams.length; i++) {
      const result = await this.validateSyntax(diagrams[i]);
      results.push({
        index: i,
        ...result
      });
    }

    return results;
  }

  /**
   * Get supported diagram types
   */
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
      'gitgraph',
      'mindmap',
      'timeline',
      'zenuml',
      'c4',
      'sankey',
      'block',
      'architecture'
    ];
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      supportedTypes: this.getSupportedTypes().length,
      memoryUsage: process.memoryUsage()
    };
  }
}

export default MermaidValidator;

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the diagram syntax is valid
 * @property {string|null} error - Error message if invalid
 * @property {string|null} type - Error type classification
 * @property {number|null} line - Line number where error occurred
 * @property {string|null} suggestion - Suggestion to fix the error
 * @property {number} processingTime - Time taken to validate in ms
 * @property {string} diagramType - Type of diagram detected
 * @property {number} elementCount - Number of elements in diagram
 */