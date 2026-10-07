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
    vscode.languages.registerDocumentLinkProvider(
      { language: "python" },
      { provideDocumentLinks: documentLinks }
    ),
    vscode.languages.registerDefinitionProvider("python", {
      provideDefinition(document, position) {
        const step = quotedOnStepLine(document, position);
        if (step) {
          return findLines(expressionToRegExp(step));
        }
        const title = quotedScenarioTitle(document, position);
        if (title) {
          return findLines(scenarioRegExp(title));
        }
        return null;
      },
    }),
    vscode.commands.registerCommand("bdd-links.openStep", (expression) =>
      showLocations(findLines(expressionToRegExp(expression)))
    ),
    vscode.commands.registerCommand("bdd-links.openScenario", (title) =>
      showLocations(findLines(scenarioRegExp(title)))
    )
  );
}

function documentLinks(document) {
  const links = [];
  for (let index = 0; index < document.lineCount; index++) {
    const line = document.lineAt(index);
    const step = line.text.match(/@(?:given|when|then|step)\s*\(\s*(["'])(.*?)\1/i);
    if (step) {
      links.push(linkFor(line, step[1] + step[2] + step[1], "bdd-links.openStep", step[2]));
    }
    const scenario = line.text.match(
      /@scenario\s*\(\s*["'][^"']+["']\s*,\s*(["'])([^"']+)\1/i
    );
    if (scenario) {
      links.push(
        linkFor(line, scenario[1] + scenario[2] + scenario[1], "bdd-links.openScenario", scenario[2])
      );
    }
  }
  return links;
}

function linkFor(line, quoted, command, argument) {
  const start = line.text.indexOf(quoted);
  const range = new vscode.Range(line.lineNumber, start, line.lineNumber, start + quoted.length);
  const target = vscode.Uri.parse(
    `command:${command}?${encodeURIComponent(JSON.stringify([argument]))}`
  );
  const link = new vscode.DocumentLink(range, target);
  link.tooltip = "Open the matching line in the feature file";
  return link;
}

function quotedOnStepLine(document, position) {
  const line = document.lineAt(position.line);
  if (!/@(?:given|when|then|step)\s*\(/i.test(line.text)) {
    return null;
  }
  return quotedAt(line.text, position.character);
}

function quotedScenarioTitle(document, position) {
  const line = document.lineAt(position.line);
  const match = line.text.match(/@scenario\s*\(\s*["'][^"']+["']\s*,\s*(["'])([^"']+)\1/i);
  if (!match) {
    return null;
  }
  const quoted = match[1] + match[2] + match[1];
  const start = line.text.indexOf(quoted);
  if (position.character > start && position.character <= start + quoted.length) {
    return match[2];
  }
  return null;
}

function quotedAt(text, character) {
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
      if (character > start && character <= index) {
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

function scenarioRegExp(title) {
  return new RegExp("^\\s*Scenario(?: Outline)?:\\s+" + escapeRegExp(title) + "\\s*$");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findLines(pattern) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) {
    return [];
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

async function showLocations(locations) {
  if (locations.length === 0) {
    vscode.window.showInformationMessage("No matching line in the feature file.");
    return;
  }
  let location = locations[0];
  if (locations.length > 1) {
    const picked = await vscode.window.showQuickPick(
      locations.map((item) => ({
        label: `${path.basename(item.uri.fsPath)}:${item.range.start.line + 1}`,
        description: fs.readFileSync(item.uri.fsPath, "utf8").split(/\r?\n/)[item.range.start.line].trim(),
        location: item,
      })),
      { placeHolder: "This step is used on more than one line" }
    );
    if (!picked) {
      return;
    }
    location = picked.location;
  }
  const document = await vscode.workspace.openTextDocument(location.uri);
  const editor = await vscode.window.showTextDocument(document);
  editor.selection = new vscode.Selection(location.range.start, location.range.end);
  editor.revealRange(location.range, vscode.TextEditorRevealType.InCenter);
}

function deactivate() {}

module.exports = { activate, deactivate };
