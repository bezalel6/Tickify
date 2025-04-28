# Template Literal Converter

[![Version](https://img.shields.io/visual-studio-marketplace/v/your-username.template-literal-converter.svg)](https://marketplace.visualstudio.com/items?itemName=your-username.template-literal-converter)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/your-username.template-literal-converter.svg)](https://marketplace.visualstudio.com/items?itemName=your-username.template-literal-converter)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/your-username.template-literal-converter.svg)](https://marketplace.visualstudio.com/items?itemName=your-username.template-literal-converter)

A VS Code extension that automatically converts string interpolation to template literals. Never manually convert quotes to backticks again!

## ✨ Features

- **Automatic Conversion**: Instantly converts string interpolation to template literals
- **Smart Detection**: Works with both single and double quotes
- **Zero Configuration**: Works out of the box with no setup required
- **Lightning Fast**: Real-time conversion as you type

### How It Works

When you type `${}` inside single or double quotes in JavaScript/TypeScript files, the extension automatically converts the quotes to backticks, creating a template literal.

**Examples:**

```javascript
// Before typing
"Hello ${name}";
"Hello ${name}" // After typing (automatically converted)
`Hello ${name}``Hello ${name}`;
```

## 🚀 Installation

1. Open VS Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
3. Type `ext install your-username.template-literal-converter`
4. Press Enter

## 📋 Requirements

- VS Code 1.60.0 or higher
- JavaScript or TypeScript files

## 🎯 Usage

1. Open any JavaScript or TypeScript file
2. Start typing a string with `${}` inside single or double quotes
3. The extension will automatically convert it to a template literal

## ⚙️ Configuration

The extension works out of the box with no configuration required. However, you can customize its behavior in your VS Code settings:

```json
{
  "templateLiteralConverter.enable": true
}
```

## 🐛 Known Issues

- May not work correctly with nested template literals
- May not work correctly with escaped quotes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Release Notes

### 0.0.1

- Initial release of Template Literal Converter
- Basic string interpolation to template literal conversion
- Support for both single and double quotes

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ☕ Support the Project

If you find this extension helpful and would like to support its development, you can buy me a coffee!

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/RNDev)

---

**Enjoy!** If you find this extension helpful, please consider giving it a ⭐️ rating on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=your-username.template-literal-converter).
