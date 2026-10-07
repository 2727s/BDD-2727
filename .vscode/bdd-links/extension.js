const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

const TYPES = {
  string: "(?:\"[^\"]*\"|'[^']*')",
  int: "-?\\d+",
  float: "-?\\d+\\.\\d+",
  word: "[A-Za-z0-9_]+",
};

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider("python", {
      provideDefinition(document, position) {
        const expression = stepExpressionAt(document, position);
        if (!expression) {
          return null;
        }
        const pattern = expressionToRegExp(expression);
        return findFeatureSteps(pattern);
      },
    })
  );
}

function stepExpressionAt(document, position) {
  const line = document.lineAt(position.line);
  if (!/@(?:given|when|then|step)\s*\(/i.test(line.text)) {
    return null;
  }
  const text = line.text;
  const quotes = ['"', "'"];
  for (const quote of quotes) {
    let start = -1;
    for (let index = 0; index < text.length; index++) {
      if (text[index] !== quote || text[index - 1] === "\\") {
        continue;
      }
      if (start < 0) {
        start = index;
        continue;
      }
      if (position.character > start && position.character <= index) {
        return text.slice(start + 1, index);
      }
      start = -1;
    }
  }
  return null;
}

function expressionToRegExp(expression) {
  let pattern = "";
  const placeholder = /\{(string|int|float|word)\}/g;
  let last = 0;
  for (const match of expression.matchAll(placeholder)) {
    pattern += escapeRegExp(expression.slice(last, match.index));
    pattern += TYPES[match[1]];
    last = match.index + match[0].length;
  }
  pattern += escapeRegExp(expression.slice(last));
  return new RegExp("^\\s*(?:Given|When|Then|And|But)\\s+" + pattern + "\\s*$");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findFeatureSteps(pattern) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) {
    return null;
  }
  const locations = [];
  for (const file of featureFiles(path.join(root, "features"))) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        const start = Math.max(0, line.search(/\S/));
        locations.push(
          new vscode.Location(
            vscode.Uri.file(file),
            new vscode.Range(index, start, index, line.length)
          )
        );
      }
    });
  }
  return locations;
}

function featureFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...featureFiles(full));
    } else if (entry.name.endsWith(".feature")) {
      found.push(full);
    }
  }
  return found;
}

function deactivate() {}

module.exports = { activate, deactivate };
