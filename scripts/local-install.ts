import { version } from '../package.json'
import { execSync } from 'child_process'

const extensionPath = `tickify-${version}.vsix`
import * as fs from 'fs'

// Check if the VSIX file already exists
if (fs.existsSync(extensionPath)) {
    // get around vscode's issue with installing an existing version
    console.log(`This version exists already`)
} else {
    // Run the build and package process
    execSync('vsce package', { stdio: 'inherit' })

    // Install the extension
    execSync(`code --install-extension ${extensionPath}`, { stdio: 'inherit' })

    console.log("hello ${}")
    console.log("hello ${}")
}

