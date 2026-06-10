# 📝 Changelog

All notable changes to MakerWorld Live Monitor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.2.0] - Unreleased

### ✨ Added
- **Home Assistant MQTT support**: Browser extension can publish Downloads, Prints, Boosts, and Points using MQTT over WebSockets with Home Assistant discovery
- **MQTT configuration UI**: Extension popup now supports broker URL, username, password, topic prefix, and device name settings

### 📝 Documentation
- Added Home Assistant MQTT setup notes, including Mosquitto WebSocket listener configuration

---

## [2.1.0] - 2024-01-XX

### ✨ Added
- **Decimal points support**: Points now display with 2 decimal precision (e.g., 123.45)
- **Points notification screen**: Dedicated screen for point updates showing before/after values
- **Buzzer support**: Optional passive buzzer for audio notifications
- **Sound alerts**: Different melodies for startup, notifications, success, and errors
- **WiFiManager integration**: Easy WiFi setup without code changes
- **Web flasher**: Browser-based firmware installer (no Arduino IDE needed)
- **Persistent storage**: Stats saved to ESP32 flash memory
- **Telegram support**: Send notifications to Telegram bot
- **Daily reports**: Automated 24-hour summaries
- **Multi-line model names**: Long model names wrap correctly on display

### 🎨 Improved
- Modern gradient background on all screens
- Larger model names in notifications (more readable)
- Better error handling and timeout management
- Enhanced visual feedback with RGB LED
- Smoother animations and transitions
- Better WiFi connection reliability

### 🔧 Changed
- Increased HTTP timeout from 10s to 15s for better reliability
- Points stored as float instead of int for decimal precision
- Notification display time increased to 15 seconds
- WiFi setup network name changed to "MakerWorld-Setup"

### 🐛 Fixed
- JSON parsing errors with decimal points
- Display flickering during updates
- Timeout issues on slow networks
- WiFi reconnection failures
- Stats reset after power cycle

---

## [2.0.0] - 2024-01-XX

### ✨ Major Rewrite
- Complete code restructure for better maintainability
- Separated ESP32 and extension into distinct components
- Added comprehensive documentation

### Added
- Real-time stat tracking for downloads, prints, boosts
- Customizable refresh intervals
- Manual test notifications
- Debug endpoints for troubleshooting
- Factory reset functionality
- Resync capability

### Changed
- Migrated from direct polling to event-driven notifications
- Improved JSON data structure
- Better error messages and logging

---

## [1.0.0] - 2023-12-XX

### 🎉 Initial Release
- Basic ESP32 display integration
- Simple download/print tracking
- Static WiFi configuration
- Basic notification system

---

## 🔮 Upcoming Features

### [2.2.0] - Planned
- [ ] OTA (Over-The-Air) updates
- [ ] Mobile app for configuration
- [ ] Multiple profile support
- [ ] Custom notification sounds
- [ ] Theme customization via web interface
- [ ] Historical stats graphs
- [ ] Export stats to CSV
- [x] MQTT support for Home Assistant
- [ ] Discord webhook support
- [ ] Push notification to phone (via app)

### [3.0.0] - Future
- [ ] Touch screen controls
- [ ] On-device configuration
- [ ] Multi-language support
- [ ] Cloud sync for stats backup
- [ ] Social features (compare with friends)
- [ ] Achievement system
- [ ] Custom dashboard layouts

---

## 📊 Version History

| Version | Release Date | Downloads | Notable Features |
|---------|--------------|-----------|------------------|
| 2.1.0   | 2024-01-XX  | -         | Decimals, Buzzer, Web Flasher |
| 2.0.0   | 2024-01-XX  | -         | Major rewrite, Telegram |
| 1.0.0   | 2023-12-XX  | -         | Initial release |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style guidelines

---

## 📝 Deprecation Notices

### Version 2.0.0
- **Removed**: Static WiFi credentials in code
- **Migration**: Use WiFiManager setup instead
- **Reason**: Better security and easier setup

### Version 2.1.0
- **Changed**: Points from int to float
- **Migration**: Old stats will be converted automatically
- **Reason**: Support decimal precision for accurate tracking

---

## 🔒 Security Updates

### 2.1.0
- No hardcoded credentials
- WiFiManager for secure setup
- Input validation for API endpoints
- Protection against buffer overflow

### 2.0.0
- Removed plaintext WiFi storage
- Added HTTPS support for Telegram
- Sanitized user inputs

---

## 🐛 Known Issues

### Version 2.1.0
- Firefox extension requires reload after browser restart (temporary add-on limitation)
- Large model names (>60 chars) may wrap awkwardly
- Telegram photos may fail to send on slow connections (falls back to text)
- Serial monitor shows garbled text on initial connection (normal ESP32 behavior)

**Workarounds**: See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📈 Statistics

### Code Metrics (v2.1.0)
- Lines of Code: ~1,200
- Arduino Libraries: 3
- JavaScript Files: 3
- Supported Browsers: Chrome, Edge, Opera
- Supported Hardware: ESP32-2432S028R (CYD)

### Performance (v2.1.0)
- Memory Usage: ~45% (ESP32)
- HTTP Response Time: <100ms
- Display Refresh Rate: 60 FPS
- Notification Delay: <2s
- Boot Time: ~5s

---

## 🎯 Roadmap

### Short Term (1-3 months)
- ✅ Web flasher
- ✅ Buzzer support
- ✅ Decimal points
- 🔄 Mobile configuration app
- 🔄 OTA updates
- ⏳ Docker container for backend (optional)

### Medium Term (3-6 months)
- Multiple platform support (MakerWorld, Printables, Thingiverse)
- Historical data visualization
- Export/import settings
- Custom themes

### Long Term (6-12 months)
- Standalone device (no computer needed)
- Battery power support
- E-ink display variant
- Commercial version with case

---

## 💖 Acknowledgments

### Contributors
- [@aquascape](https://makerworld.com/en/@aquascape) - Original creator
- [Community contributors](https://github.com/[username]/makerworld-live-monitor/graphs/contributors)

### Libraries
- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) by Bodmer
- [ArduinoJson](https://arduinojson.org/) by Benoit Blanchon
- [WiFiManager](https://github.com/tzapu/WiFiManager) by tzapu

### Inspiration
- MakerWorld community for feedback
- ESP32 community for support
- Open source projects that made this possible

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**[⬆ back to top](#-changelog)**