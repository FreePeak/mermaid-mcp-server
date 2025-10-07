#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import MermaidValidator from './mermaid-validator-flexible.js';

/**
 * Lightweight Mermaid MCP Server
 *
 * Features:
 * - Real-time syntax validation
 * - Minimal memory footprint
 * - Comprehensive error reporting
 * - Batch validation support
 */

class MermaidMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mermaid-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.validator = new MermaidValidator();
    this.setupToolHandlers();
    this.setupErrorHandling();

    console.log('[TRACE] Mermaid MCP Server initialized');
  }

  setupErrorHandling() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('[ERROR] Uncaught exception:', error);
      this.cleanup();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[ERROR] Unhandled rejection at:', promise, 'reason:', reason);
    });

    process.on('SIGINT', () => {
      console.log('[TRACE] Received SIGINT, cleaning up...');
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('[TRACE] Received SIGTERM, cleaning up...');
      this.cleanup();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'validate_mermaid',
            description: 'Validate Mermaid diagram syntax in real-time',
            inputSchema: {
              type: 'object',
              properties: {
                diagramCode: {
                  type: 'string',
                  description: 'The Mermaid diagram code to validate',
                },
              },
              required: ['diagramCode'],
            },
          },
          {
            name: 'validate_mermaid_batch',
            description: 'Validate multiple Mermaid diagrams in batch',
            inputSchema: {
              type: 'object',
              properties: {
                diagrams: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of Mermaid diagram codes to validate',
                },
              },
              required: ['diagrams'],
            },
          },
          {
            name: 'get_mermaid_info',
            description: 'Get information about supported diagram types and server status',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'mermaid_realtime_validate',
            description: 'Real-time validation hook for live diagram editing',
            inputSchema: {
              type: 'object',
              properties: {
                diagramCode: {
                  type: 'string',
                  description: 'Current Mermaid diagram code',
                },
                changeType: {
                  type: 'string',
                  enum: ['add', 'remove', 'modify', 'full'],
                  description: 'Type of change made to the diagram',
                },
                lineNumber: {
                  type: 'number',
                  description: 'Line number where the change occurred (optional)',
                },
              },
              required: ['diagramCode', 'changeType'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'validate_mermaid':
            return await this.handleValidateMermaid(args);

          case 'validate_mermaid_batch':
            return await this.handleValidateBatch(args);

          case 'get_mermaid_info':
            return await this.handleGetInfo();

          case 'mermaid_realtime_validate':
            return await this.handleRealtimeValidate(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`[ERROR] Tool ${name} failed:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async handleValidateMermaid(args) {
    const { diagramCode } = args;

    console.log(`[TRACE] Validating Mermaid diagram (${diagramCode.length} chars)`);

    const result = await this.validator.validateSyntax(diagramCode);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            validation: result,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  async handleValidateBatch(args) {
    const { diagrams } = args;

    console.log(`[TRACE] Validating batch of ${diagrams.length} Mermaid diagrams`);

    const results = await this.validator.validateBatch(diagrams);

    const summary = {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            summary,
            results,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  async handleGetInfo() {
    const stats = this.validator.getStats();
    const supportedTypes = this.validator.getSupportedTypes();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            server: {
              name: 'mermaid-mcp-server',
              version: '1.0.0',
              uptime: process.uptime(),
            },
            supportedTypes,
            stats,
            features: [
              'Real-time syntax validation',
              'Batch validation',
              'Detailed error reporting',
              'Performance monitoring',
              'Lightweight memory footprint'
            ],
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  async handleRealtimeValidate(args) {
    const { diagramCode, changeType, lineNumber } = args;

    console.log(`[TRACE] Real-time validation: ${changeType}${lineNumber ? ` at line ${lineNumber}` : ''}`);

    const result = await this.validator.validateSyntax(diagramCode);

    // Add real-time specific metadata
    const realtimeResult = {
      ...result,
      changeType,
      lineNumber: lineNumber || null,
      realtime: true,
      timestamp: new Date().toISOString(),
    };

    // For real-time validation, provide concise feedback
    let message = '';
    if (result.isValid) {
      message = `✅ Valid ${result.diagramType} diagram (${result.elementCount} elements)`;
    } else {
      message = `❌ ${result.error}`;
      if (result.line) {
        message += ` (line ${result.line})`;
      }
      if (result.suggestion) {
        message += `\n💡 ${result.suggestion}`;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: message,
        },
        {
          type: 'text',
          text: JSON.stringify(realtimeResult, null, 2),
        },
      ],
    };
  }

  async cleanup() {
    console.log('[TRACE] Cleaning up Mermaid MCP Server...');

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    console.log('[TRACE] Cleanup completed');
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.log('[TRACE] Mermaid MCP Server started and listening');
  }
}

// Start the server
const server = new MermaidMCPServer();
server.run().catch((error) => {
  console.error('[ERROR] Failed to start server:', error);
  process.exit(1);
});