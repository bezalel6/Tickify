import * as vscode from 'vscode';

// Create output channel for logging
let outputChannel: vscode.OutputChannel;

// Regex to match strings that should be template literals (those containing ${...} expressions)
const shouldReplaceRegex = /(['"])((?:\\.|(?!\1).)*?\$\{(?:[^{}]|\{[^{}]*\})*\}(?:\\.|(?!\1).)*?)\1/g;

/**
 * Result interface containing the converted template literal and position information
 */
interface ConversionResult {
    convertedString: string;
    startingIndex: number;
    length: number;
}

/**
 * Finds the boundaries of the string at the given position
 * @param lineText The full line text
 * @param cursorPosition The character position within the line
 * @returns Object with start and end indices of the string, or null if not in a string
 */
function findStringBoundaries(lineText: string, cursorPosition: number): { start: number, end: number } | null {
    let inString = false;
    let currentQuote = '';
    let start = -1;

    // Scan character by character to properly handle escaping and nesting
    for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i];
        const prevChar = i > 0 ? lineText[i - 1] : '';

        // Handle quote characters
        if ((char === '"' || char === "'") && prevChar !== '\\') {
            if (!inString) {
                // Start of a new string
                inString = true;
                currentQuote = char;
                start = i;
            } else if (char === currentQuote) {
                // End of the current string
                const end = i;

                // Check if our cursor position is within this string
                if (cursorPosition >= start && cursorPosition <= end) {
                    return { start, end };
                }

                // Reset for the next potential string
                inString = false;
                currentQuote = '';
            }
            // If we see a different quote inside a string, it's just a character in the string
        }
    }

    // If we're still in a string at the end of scanning and the cursor is inside it
    if (inString && cursorPosition >= start) {
        return { start, end: lineText.length - 1 };
    }

    return null;
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
        const [fullMatch, quote, content] = match;
        const startingIndex = match.index;

        // Convert to template literal
        const convertedString = `\`${content}\``;

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
            // Skip changes that don't contain potential template expression characters
            if (!change.text.includes('$') && !change.text.includes('{') && !change.text.includes('}')) {
                continue;
            }

            try {
                const position = change.range.start;
                const lineText = document.lineAt(position.line).text;

                // Find the string boundaries at the cursor position
                const boundaries = findStringBoundaries(lineText, position.character);

                if (!boundaries) {
                    outputChannel.appendLine(`No string detected at position ${position.line}:${position.character}`);
                    continue;
                }

                // Extract the full string including its quotes
                const fullString = lineText.substring(boundaries.start, boundaries.end + 1);
                outputChannel.appendLine(`Detected string: ${fullString}`);

                // Check if this string should be converted to a template literal
                const result = convertToTemplateLiteral(fullString);

                if (result) {
                    outputChannel.appendLine(`Converting to template literal: ${result.convertedString}`);

                    const edit = new vscode.WorkspaceEdit();
                    const range = new vscode.Range(
                        new vscode.Position(position.line, boundaries.start),
                        new vscode.Position(position.line, boundaries.end + 1)
                    );

                    edit.replace(document.uri, range, result.convertedString);

                    vscode.workspace.applyEdit(edit).then(success => {
                        if (success) {
                            outputChannel.appendLine('Successfully applied template literal conversion');
                        } else {
                            outputChannel.appendLine('Failed to apply template literal conversion');
                        }
                    });
                }
            } catch (error) {
                outputChannel.appendLine(`Error processing template literal conversion: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
    outputChannel.appendLine('Template Literal Converter extension is now deactivated');
    outputChannel.dispose();
}