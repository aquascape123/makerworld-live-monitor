# 🤝 Contributing to MakerWorld Live Monitor

First off, thank you for considering contributing! It's people like you that make this project great.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity.

### Our Standards
✅ **Do:**
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

❌ **Don't:**
- Use sexualized language or imagery
- Troll, insult, or make derogatory comments
- Publish others' private information
- Conduct yourself unprofessionally

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Found a bug? Help us fix it!

**Before submitting:**
1. Check [existing issues](https://github.com/[username]/makerworld-live-monitor/issues)
2. Check [troubleshooting guide](docs/TROUBLESHOOTING.md)
3. Test with latest version

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Hardware: ESP32-2432S028R
- Browser: Chrome 120
- OS: Windows 11
- Firmware Version: 2.1.0
- Extension Version: 2.1.0

**Additional context**
- Serial monitor output
- Console errors (F12)
- Network configuration
```

### 💡 Suggesting Features

Have an idea? We'd love to hear it!

**Feature Request Template:**
```markdown
**Is your feature related to a problem?**
A clear description of the problem.

**Describe the solution**
What you want to happen.

**Describe alternatives**
Other solutions you've considered.

**Additional context**
Mockups, examples, or references.
```

### 📝 Improving Documentation

- Fix typos or clarify instructions
- Add missing examples
- Translate documentation
- Create video tutorials

### 💻 Contributing Code

Ready to code? Awesome!

**Good First Issues:**
- Issues labeled `good-first-issue`
- Documentation improvements
- Small bug fixes
- Adding code comments

---

## 🛠️ Development Setup

### Prerequisites

- **Arduino IDE** 2.0+ or Arduino CLI
- **VS Code** (recommended) with extensions:
  - Arduino
  - C/C++
  - ESP32 Exception Decoder
- **Git**
- **Node.js** (for extension development)

### Clone Repository

```bash
git clone https://github.com/[username]/makerworld-live-monitor.git
cd makerworld-live-monitor
```

### Setup Arduino Environment

1. **Install ESP32 Board Support**
   ```
   https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```

2. **Install Libraries**
   - TFT_eSPI
   - ArduinoJson
   - WiFiManager

3. **Configure TFT_eSPI**
   - Edit `User_Setup_Select.h`
   - Enable `Setup24_ST7789.h`

### Setup Extension Development

```bash
cd extension
# No build step needed - load directly in browser
```

### Test Your Changes

**Firmware:**
```bash
# Compile
arduino-cli compile --fqbn esp32:esp32:esp32 arduino/makerworld_monitor_cyd/

# Upload
arduino-cli upload -p COM3 --fqbn esp32:esp32:esp32 arduino/makerworld_monitor_cyd/
```

**Extension:**
1. Load unpacked in Chrome: `chrome://extensions/`
2. Test on MakerWorld page
3. Check console for errors

---

## 🔀 Pull Request Process

### 1. Fork & Create Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clear commit messages
- Follow code style guidelines
- Add comments for complex logic
- Test thoroughly

### 3. Commit

```bash
git add .
git commit -m "✨ Add amazing feature"
```

**Commit Message Format:**
```
<emoji> <type>: <subject>

<body>

<footer>
```

**Emoji Guide:**
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 📝 `:memo:` - Documentation
- 🎨 `:art:` - UI/style improvement
- ♻️ `:recycle:` - Code refactoring
- ⚡ `:zap:` - Performance improvement
- 🔧 `:wrench:` - Configuration change
- 🚀 `:rocket:` - Deployment
- ✅ `:white_check_mark:` - Tests

**Examples:**
```
✨ feat: Add OTA update support

Implemented Over-The-Air firmware updates using
AsyncElegantOTA library.

Closes #123
```

### 4. Push & Create PR

```bash
git push origin feature/amazing-feature
```

**Pull Request Template:**
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested on ESP32 hardware
- [ ] Tested extension in Chrome
- [ ] No console errors
- [ ] All existing features still work

## Screenshots
If applicable.

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Changelog updated
```

### 5. Code Review

- Address feedback promptly
- Be open to suggestions
- Update PR as needed
- Squash commits if requested

### 6. Merge

Once approved, a maintainer will merge your PR. Congrats! 🎉

---

## 📐 Style Guidelines

### Arduino/C++ Code

**Formatting:**
```cpp
// Use 2-space indentation
void functionName() {
  if (condition) {
    doSomething();
  }
}

// Constants in UPPER_CASE
#define MAX_VALUE 100
const int TIMEOUT = 5000;

// Variables in camelCase
int myVariable = 0;
String userName = "test";

// Functions in camelCase
void handleRequest() {
  // ...
}
```

**Comments:**
```cpp
// ============================================
// SECTION HEADER
// ============================================

// Single line comment for simple explanations

/*
 * Multi-line comment for complex logic
 * Explain WHY, not WHAT
 */

/**
 * Function documentation
 * @param value The input value
 * @return The processed result
 */
int processValue(int value) {
  // Implementation
}
```

**Naming Conventions:**
```cpp
// Pin definitions
#define LED_PIN 13

// Global variables
int globalCounter = 0;

// Local variables
int tempValue = 0;

// Functions - descriptive verbs
void updateDisplay() { }
bool checkConnection() { }
int calculateTotal() { }
```

### JavaScript Code

**Formatting:**
```javascript
// Use 2-space indentation
function functionName() {
  if (condition) {
    doSomething();
  }
}

// Use const/let, not var
const API_URL = 'http://example.com';
let currentValue = 0;

// Async/await preferred
async function fetchData() {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Comments:**
```javascript
// Single line for simple logic

/*
 * Multi-line for complex
 * Explain WHY, not WHAT
 */

/**
 * Function documentation
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object>} The response data
 */
async function fetchData(url) {
  // Implementation
}
```

### File Organization

```
arduino/
├── makerworld_monitor_cyd/
│   ├── makerworld_monitor_cyd.ino  # Main file
│   ├── config.h                     # Configuration
│   ├── display.cpp                  # Display functions
│   └── display.h
```

---

## 🧪 Testing

### Manual Testing Checklist

**Firmware:**
- [ ] Compiles without errors
- [ ] Uploads successfully
- [ ] WiFi connects
- [ ] Display shows correctly
- [ ] Notifications work
- [ ] Buzzer sounds (if connected)
- [ ] Stats persist after restart
- [ ] All HTTP endpoints respond

**Extension:**
- [ ] Loads without errors
- [ ] Configuration saves
- [ ] Connection test passes
- [ ] Page monitoring works
- [ ] Notifications send correctly
- [ ] Console shows no errors

### Test on Multiple Platforms

- [ ] Windows
- [ ] Mac
- [ ] Linux
- [ ] Chrome
- [ ] Edge
- [ ] Opera

---

## 📚 Documentation

### Update Documentation When:

- Adding new features
- Changing configuration
- Modifying API endpoints
- Fixing bugs (add to troubleshooting)
- Changing hardware requirements

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI changes
- Update README.md
- Update relevant docs/ files
- Add entry to CHANGELOG.md

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Added to GitHub contributors page
- Credited in documentation

**Top Contributors get:**
- Special mention in README
- Beta access to new features
- Direct communication channel

---

## 📞 Questions?

- 💬 [GitHub Discussions](https://github.com/[username]/makerworld-live-monitor/discussions)
- 🐛 [Issues](https://github.com/[username]/makerworld-live-monitor/issues)
- 📧 Email: [your-email@example.com]
- 🌐 MakerWorld: [@aquascape](https://makerworld.com/en/@aquascape)

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**

Every contribution, no matter how small, makes a difference. Whether it's fixing a typo, reporting a bug, or adding a major feature - we appreciate your help in making this project better for everyone.

Happy coding! 🚀