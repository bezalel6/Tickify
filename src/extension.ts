import * as vscode from 'vscode';

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
    console.log('Template Literal Converter extension is now active');

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
            // Only check if the change includes "}" which might indicate a template expression
            if (!change.text.match(/[{}$]/)) {
                continue;
            }
            
            try {
                const position = change.range.start;
                const line = document.lineAt(position.line);
                const lineText = line.text;
                
                const result = convertToTemplateLiteral(lineText);
                
                if (result) {
                    const edit = new vscode.WorkspaceEdit();
                    const range = new vscode.Range(
                        new vscode.Position(position.line, result.startingIndex),
                        new vscode.Position(position.line, result.startingIndex + result.length)
                    );
                    
                    edit.replace(document.uri, range, result.convertedString);
                    
                    // Use await to ensure the edit is applied before continuing
                    vscode.workspace.applyEdit(edit).then(success => {
                        if (!success) {
                            console.error('Failed to apply template literal conversion');
                        }
                    });
                }
            } catch (error) {
                console.error('Error processing template literal conversion:', error);
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Template Literal Converter extension is now deactivated');
}