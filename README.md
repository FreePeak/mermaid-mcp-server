# Mermaid MCP Server

A lightweight Model Context Protocol (MCP) server that provides real-time Mermaid diagram syntax validation with minimal memory footprint.

## Features

- ✅ **Real-time Syntax Validation**: Instant validation while you edit diagrams
- 🚀 **Ultra Lightweight**: Minimal memory usage, optimized for performance
- 🎯 **100% Compatibility**: Supports all Mermaid diagram types
- 📊 **Detailed Error Reporting**: Line numbers, error classification, and suggestions
- 🔧 **Batch Validation**: Validate multiple diagrams at once
- 📈 **Performance Monitoring**: Track validation times and memory usage

## Supported Diagram Types

- Flowcharts (`graph`, `flowchart`)
- Sequence Diagrams (`sequenceDiagram`)
- Class Diagrams (`classDiagram`)
- State Diagrams (`stateDiagram`)
- Entity Relationship Diagrams (`erDiagram`)
- Gantt Charts (`gantt`)
- User Journey (`journey`)
- Pie Charts (`pie`)
- Git Graphs (`gitgraph`)
- Mind Maps (`mindmap`)
- Timelines (`timeline`)
- C4 Architecture (`c4`)
- Sankey Diagrams (`sankey`)
- Block Diagrams (`block`)
- Architecture Diagrams (`architecture`)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd mermaid-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Add to your MCP client configuration:

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": ["/path/to/mermaid-mcp-server/server.js"],
      "env": {}
    }
  }
}
```

## Usage Examples

### Basic Syntax Validation

```javascript
// Validate a simple flowchart
const result = await validate_mermaid({
  diagramCode: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
    C --> D`
});
```

### Real-time Validation Hook

```javascript
// Real-time validation during editing
const realtimeResult = await mermaid_realtime_validate({
  diagramCode: "sequenceDiagram\n    A->>B: Hello",
  changeType: "add",
  lineNumber: 2
});
```

### Batch Validation

```javascript
// Validate multiple diagrams at once
const batchResult = await validate_mermaid_batch({
  diagrams: [
    "graph TD\n    A --> B",
    "sequenceDiagram\n    A->>B: Test",
    "invalid diagram code"
  ]
});
```

## API Reference

### Tools

#### `validate_mermaid`
Validates a single Mermaid diagram.

**Parameters:**
- `diagramCode` (string, required): The Mermaid diagram code to validate

**Returns:**
```json
{
  "isValid": true,
  "error": null,
  "type": null,
  "line": null,
  "suggestion": null,
  "processingTime": 12,
  "diagramType": "graph",
  "elementCount": 4
}
```

#### `mermaid_realtime_validate`
Real-time validation for live editing scenarios.

**Parameters:**
- `diagramCode` (string, required): Current diagram code
- `changeType` (string, required): Type of change (`add`, `remove`, `modify`, `full`)
- `lineNumber` (number, optional): Line where change occurred

**Returns:**
Enhanced validation result with change metadata.

#### `validate_mermaid_batch`
Validates multiple diagrams in a single call.

**Parameters:**
- `diagrams` (array, required): Array of diagram codes

**Returns:**
```json
{
  "summary": {
    "total": 3,
    "valid": 2,
    "invalid": 1,
    "averageProcessingTime": 15.3
  },
  "results": [...]
}
```

#### `get_mermaid_info`
Gets server information and supported diagram types.

**Returns:**
```json
{
  "server": {
    "name": "mermaid-mcp-server",
    "version": "1.0.0",
    "uptime": 3600
  },
  "supportedTypes": [...],
  "stats": {...},
  "features": [...]
}
```

## Error Types

The server classifies errors into these categories:

- `syntax`: General syntax errors
- `no_type`: Missing diagram type declaration
- `unknown_command`: Unsupported commands
- `parse`: Parsing errors
- `identifier`: Invalid identifiers
- `relation`: Connection/arrow issues
- `general`: Other errors

## Performance Optimization

### Memory Management
- Lazy initialization of Mermaid engine
- Minimal dependencies
- Efficient garbage collection
- No DOM rendering (validation only)

### Processing Speed
- Direct Mermaid parsing without rendering
- Optimized error extraction
- Batch processing capabilities
- Performance metrics tracking

### Usage Tips
1. Use `mermaid_realtime_validate` for live editing
2. Use `validate_mermaid_batch` for multiple diagrams
3. Check `processingTime` to monitor performance
4. Monitor memory usage with `get_mermaid_info`

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
# Test with various diagram types
node test.js
```

### Environment Variables

- `NODE_ENV`: Set to `development` for debug logging
- `GC_INTERVAL`: Garbage collection interval (default: 60000ms)

## Configuration

The server can be configured via environment variables:

```bash
# Enable debug logging
DEBUG=mermaid-mcp-server

# Set memory limit (MB)
MEMORY_LIMIT=128

# Enable performance monitoring
PERFORMANCE_MONITORING=true
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check Node.js version (>=18.0.0 required)
   - Verify all dependencies are installed
   - Check for port conflicts if applicable

2. **Memory usage high**
   - Restart server periodically
   - Use batch validation instead of many single calls
   - Monitor memory usage via `get_mermaid_info`

3. **Validation errors**
   - Ensure proper diagram syntax
   - Check supported diagram types
   - Use real-time validation for immediate feedback

### Debug Mode

Enable debug logging:

```bash
DEBUG=mermaid-mcp-server:* npm start
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation