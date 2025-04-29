import * as vscode from 'vscode';

// Create output channel for logging
let outputChannel: vscode.OutputChannel;

// Regex to match strings that should be template literals (those containing ${...} expressions)
const shouldReplaceRegex = /(["'])((?:(?!\1)[^\\]|\\.)*)(\$\{(?:(?:[^{}]|\{[^{}]*\})*)\})(?:(?!\1)[^\\]|\\.)*\1/g;
/**
 * Result interface containing the converted template literal and position information
 */
interface ConversionResult {
    convertedString: string;
    startingIndex: number;
    length: number;
}

/**
 * Converts a string containing potential template expressions (${...}) wrapped in
 * single or double quotes to a proper template literal wrapped in backticks,
 * and returns information about the position and length.
 * 
 * @param input - The string potentially containing template expressions with incorrect quotes
 * @returns Object containing the converted string and position information, or null if no conversion needed
 */
function convertToTemplateLiteral(input: string): ConversionResult | null {
    let match: RegExpExecArray | null;
    let result: ConversionResult | null = null;

    // Use exec to get the match position
    shouldReplaceRegex.lastIndex = 0; // Reset regex state
    match = shouldReplaceRegex.exec(input);

    if (match) {
        const [fullMatch, quote, beforeExpression, templateExpression] = match;
        const startingIndex = match.index;
        const fullContent = fullMatch.slice(1, -1); // Remove the quotes

        // Convert to template literal
        const convertedString = `\`${fullContent}\``;

        result = {
            convertedString,
            startingIndex,
            length: fullMatch.length
        };
    }

    return result;
}

export function activate(context: vscode.ExtensionContext) {
    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel('Tickify');
    outputChannel.appendLine('Template Literal Converter extension is now active');

    // Register command to show output channel
    let showOutputCommand = vscode.commands.registerCommand('tickify.showOutput', () => {
        outputChannel.show(true);
    });
    context.subscriptions.push(showOutputCommand);

    let disposable = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const document = editor.document;
        const languageId = document.languageId;

        // Only process JavaScript and TypeScript files
        if (!['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(languageId)) {
            return;
        }

        const changes = event.contentChanges;
        for (const change of changes) {
            if (!change.text.match(/[{}$]/)) {
                continue;
            }

            try {
                const position = change.range.start;
                const document = editor.document;

                // Get the line and its text
                const line = document.lineAt(position.line);
                const lineText = line.text;

                // Find the string boundaries around the change
                const beforeChange = lineText.substring(0, position.character);
                const afterChange = lineText.substring(position.character);

                // Find the last quote before the change
                const lastQuoteBefore = Math.max(
                    beforeChange.lastIndexOf('"'),
                    beforeChange.lastIndexOf("'")
                );

                // Find the first quote after the change
                const firstQuoteAfter = Math.min(
                    afterChange.indexOf('"') !== -1 ? afterChange.indexOf('"') + position.character : Infinity,
                    afterChange.indexOf("'") !== -1 ? afterChange.indexOf("'") + position.character : Infinity
                );

                // If we can't find proper string boundaries, skip
                if (lastQuoteBefore === -1 || firstQuoteAfter === Infinity) {
                    continue;
                }

                // Extract the potential template literal
                const potentialTemplateLiteral = lineText.substring(lastQuoteBefore, firstQuoteAfter + 1);

                outputChannel.appendLine(`Processing potential template literal: ${potentialTemplateLiteral}`);

                const result = convertToTemplateLiteral(potentialTemplateLiteral);

                if (result) {
                    outputChannel.appendLine(`Found template expression to convert: ${result.convertedString}`);

                    const edit = new vscode.WorkspaceEdit();
                    const range = new vscode.Range(
                        new vscode.Position(position.line, lastQuoteBefore),
                        new vscode.Position(position.line, firstQuoteAfter + 1)
                    );

                    edit.replace(document.uri, range, result.convertedString);

                    // Use await to ensure the edit is applied before continuing
                    vscode.workspace.applyEdit(edit).then(success => {
                        if (!success) {
                            outputChannel.appendLine('Failed to apply template literal conversion');
                        } else {
                            outputChannel.appendLine('Successfully applied template literal conversion');
                        }
                    });
                }
            } catch (error) {
                outputChannel.appendLine(`Error processing template literal conversion: ${error}`);
            }
        }
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
    outputChannel.appendLine('Template Literal Converter extension is now deactivated');
    // outputChannel.dispose();
}