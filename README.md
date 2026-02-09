# 🚀 MakerWorld Live Monitor

Real-time monitoring system for your MakerWorld statistics with ESP32 display and Telegram notifications.

![Version](https://img.shields.io/badge/version-2.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📺 Features

- **ESP32 CYD Display**: Beautiful real-time statistics on a 320x240 TFT screen
- **Telegram Bot**: Receive instant notifications on your phone
- **Multi-notification Support**: Downloads, Prints, Boosts, and Points tracking
- **Sound Alerts**: Buzzer notifications for events (optional)
- **Daily Reports**: Automated 24h summaries
- **WiFi Manager**: Easy WiFi setup without code changes
- **Persistent Storage**: Stats saved to flash memory

## 🎯 What Gets Tracked

- ✅ **Downloads**: Track model downloads with point calculations
- ✅ **Prints**: Monitor print counts (2 points each)
- ✅ **Boosts**: See when someone boosts your models
- ✅ **Points**: Real-time point updates with decimal precision
- ✅ **Daily Summaries**: Top 5 models by downloads and prints

## 🛠️ Hardware Requirements

### Option 1: ESP32 Display (Recommended)
- **ESP32-2432S028R** (CYD - Cheap Yellow Display)
  - Built-in 320x240 TFT display
  - Touch screen (not used in this project)
  - USB-C programming
  - RGB LED
  - ~$15 on AliExpress

### Option 2: Telegram Only
- Any device with a browser (no hardware needed!)

### Optional: Buzzer
- Passive buzzer (for audio notifications)
- Connect to GPIO 22

## 📦 Installation

### 🌐 Web Flasher (Easiest Method)

1. **Visit the Web Flasher**
   ```
   https://aquascape123.github.io/makerworld-live-monitor/flasher/
   ```

2. **Connect ESP32** via USB-C

3. **Click "Connect"** and select your ESP32 port

4. **Click "Flash"** and wait ~2 minutes

5. **Done!** The device will restart automatically

### 💻 Manual Installation (Arduino IDE)

<details>
<summary>Click to expand manual installation steps</summary>

1. **Install Arduino IDE**
   - Download from [arduino.cc](https://www.arduino.cc/en/software)

2. **Add ESP32 Board Support**
   - File → Preferences
   - Add to "Additional Board Manager URLs":
     ```
     https://espressif.github.io/arduino-esp32/package_esp32_index.json
     ```
   - Tools → Board → Boards Manager
   - Search "ESP32" and install

3. **Install Required Libraries**
   - TFT_eSPI
   - ArduinoJson
   - WiFiManager
   
   Via: Sketch → Include Library → Manage Libraries

4. **Configure TFT_eSPI**
   - Locate library folder: `Arduino/libraries/TFT_eSPI/`
   - Edit `User_Setup_Select.h`:
     ```cpp
     // Comment out default
     //#include <User_Setup.h>
     
     // Add this line
     #include <User_Setups/Setup24_ST7789.h>
     ```

5. **Upload Code**
   - Tools → Board → "ESP32 Dev Module"
   - Tools → Port → Select your ESP32
   - Upload!

</details>

## 🔧 Setup

### 1️⃣ ESP32 WiFi Setup

After flashing, the ESP32 will create a WiFi network:

1. **Connect to WiFi**: `MakerWorld-Setup`
2. **Open Browser**: Automatically redirects to setup page
3. **Select your WiFi** and enter password
4. **Save**: ESP32 will connect and show IP address

> 💡 **Tip**: Write down the IP address shown on screen!

### 2️⃣ Browser Extension Setup

1. **Install Extension**
   - Chrome/Edge: Load unpacked from `extension/` folder
   - Firefox: Load temporary add-on

2. **Configure Extension**
   - Click extension icon
   - **ESP32 Display** (Optional):
     - Enable: `Yes`
     - IP Address: Enter IP from ESP32 screen
     - Test Connection
   
   - **Telegram** (Optional):
     - Enable: `Yes`
     - Bot Token: Get from [@BotFather](https://t.me/BotFather)
     - Chat ID: Get from [@userinfobot](https://t.me/userinfobot)
   
   - **Settings**:
     - Refresh Interval: 5-60 minutes
     - Daily Summary: Enable/Disable
     - Summary Time: Set preferred time

3. **Save Configuration**

4. **Open MakerWorld**
   - Visit: `https://makerworld.com/en/@your-username`
   - Navigate to "Uploads" → "Models"
   - Extension will auto-start monitoring

## 🎵 Buzzer Setup (Optional)

Want sound notifications? Add a passive buzzer!

### Wiring
```
Buzzer (+) → GPIO 22
Buzzer (-) → GND
```

### Sound Events
- 🎶 **Startup**: Do-Mi-Sol-Do (device ready)
- 🔔 **Notification**: Do-Mi-Sol (new event)
- ✅ **Success**: Do-Sol (action completed)
- ❌ **Error**: Low Sol (connection issue)

> 🔇 **Disable Buzzer**: Simply don't connect it, or comment out buzzer code

## 📱 Telegram Bot Setup

<details>
<summary>Detailed Telegram setup guide</summary>

### Create Bot

1. **Open Telegram** and search for [@BotFather](https://t.me/BotFather)

2. **Create Bot**:
   ```
   /newbot
   ```

3. **Name your bot**: `MakerWorld Monitor`

4. **Choose username**: `your_makerworld_bot`

5. **Copy Token**: Looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### Get Chat ID

1. **Search** [@userinfobot](https://t.me/userinfobot)

2. **Start chat**: Click "Start"

3. **Copy your ID**: e.g., `987654321`

### Test

1. **Paste Token and Chat ID** in extension

2. **Save Configuration**

3. **Wait for notification** or trigger manual test

</details>

## 🖥️ Display Screens

### Main Screen
Shows 4 cards with real-time stats:
- 📥 **Downloads**: Total count
- 🖨️ **Prints**: Total count  
- ⚡ **Boosts**: Total count
- ⭐ **Points**: Total with 2 decimals (e.g., 123.45)

### Notification Screen (15 seconds)
- Large model name (multi-line support)
- Event type icon
- Value increase
- Total count
- Points earned (for downloads/prints)
- Animated border
- RGB LED blinks red

## 🎨 Customization

### Colors
Edit in Arduino code:
```cpp
#define COLOR_BG_TOP      0x0520  // Dark blue
#define COLOR_BG_BOTTOM   0x1C60  // Lighter blue
#define COLOR_PRIMARY     0x07FF  // Cyan
#define COLOR_SUCCESS     0x07E0  // Green
#define COLOR_WARNING     0xFFE0  // Yellow
```

### Intervals
```cpp
// Stats refresh (default: 5 seconds)
const unsigned long STATS_UPDATE_INTERVAL = 5000;

// Notification duration (default: 15 seconds)
const unsigned long NOTIF_DISPLAY_TIME = 15000;
```

### Buzzer Frequencies
```cpp
void playNotificationSound() {
  playBeep(523, 150);  // Do - 523 Hz, 150ms
  delay(50);
  playBeep(659, 150);  // Mi - 659 Hz, 150ms
  delay(50);
  playBeep(784, 200);  // Sol - 784 Hz, 200ms
}
```

## 🐛 Troubleshooting

### ESP32 Not Connecting to WiFi
- Reset WiFi settings: Visit `http://[ESP32_IP]/reset-wifi`
- Power cycle the device
- Check WiFi credentials

### No Notifications Received
- Verify IP address is correct
- Check ESP32 and computer are on same network
- Test connection in extension popup
- Check browser console (F12) for errors

### Display Shows "WAITING SYNC"
- Visit your MakerWorld profile page
- Ensure extension is enabled
- Check extension has correct IP
- Wait 30 seconds for first sync

### Buzzer Not Working
- Check wiring (GPIO 22 and GND)
- Verify it's a **passive** buzzer
- Test with `http://[ESP32_IP]/test`

### Telegram Not Working
- Verify bot token is correct
- Check chat ID is correct
- Ensure bot is not blocked
- Test by sending `/start` to your bot

## 🔌 API Endpoints

The ESP32 provides these HTTP endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ping` | GET | Test connection |
| `/stats` | GET | Get current stats (JSON) |
| `/notify` | POST | Send notification |
| `/sync` | POST | Initial sync |
| `/test` | GET | Test notification |
| `/debug` | GET | Debug page |
| `/reset` | GET | Reset all stats |
| `/reset-wifi` | GET | Reset WiFi settings |
| `/resync` | GET | Force resync |

## 📊 Data Format

### Notification JSON
```json
{
  "type": "download",
  "modelName": "Cool Model",
  "value": 5,
  "total": 142,
  "points": 5.25,
  "currentTotalDownloads": 1234,
  "currentTotalPrints": 567,
  "currentTotalBoosts": 89,
  "currentTotalPoints": 2468.50
}
```

### Points Notification JSON
```json
{
  "type": "points",
  "before": 123.45,
  "after": 128.70,
  "increase": 5.25,
  "currentTotalPoints": 128.70
}
```

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 💖 Support

If you find this project useful:

- ⭐ Star this repository
- 🐛 Report bugs via [Issues](https://github.com/aquascape123/makerworld-live-monitor/issues)
- 💡 Suggest features
- ☕ [Support my work](https://makerworld.com/en/@aquascape)
- ⚡️ Bitcoin Lightning: sullencicada855@walletofsatoshi.com

## 🙏 Credits

Created with ❤️ by [@aquascape](https://makerworld.com/en/@aquascape)

### Libraries Used
- [TFT_eSPI](https://github.com/Bodmer/TFT_eSPI) - Display driver
- [ArduinoJson](https://arduinojson.org/) - JSON parsing
- [WiFiManager](https://github.com/tzapu/WiFiManager) - Easy WiFi setup

## 🔗 Links

- [MakerWorld Profile](https://makerworld.com/en/@aquascape)
- [Project Documentation](https://github.com/aquascape123/makerworld-live-monitor/wiki)


---

**Made for the MakerWorld Community** 🌍✨
