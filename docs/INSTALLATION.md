# 📥 Installation Guide

Complete step-by-step installation guide for MakerWorld Live Monitor.

## 🎯 Choose Your Installation Method

### ⚡ Quick Install (Recommended)
**Web Flasher** - No software needed, just a browser!
- ⏱️ Time: ~5 minutes
- 💻 Requirements: Chrome/Edge browser + USB cable
- ✅ Best for: Beginners

### 💻 Advanced Install
**Arduino IDE** - Full control and customization
- ⏱️ Time: ~15 minutes
- 💻 Requirements: Arduino IDE + libraries
- ✅ Best for: Advanced users who want to customize

---

## ⚡ Method 1: Web Flasher (Easy)

### Step 1: Hardware Check

✅ **You need:**
- ESP32-2432S028R (CYD) board
- USB-C data cable (not charge-only!)
- Computer with Chrome/Edge browser

### Step 2: Flash Firmware

1. **Visit Web Flasher**
   ```
   https://[your-github-username].github.io/makerworld-live-monitor/
   ```

2. **Connect ESP32**
   - Plug USB-C cable into ESP32
   - Plug other end into computer
   - Wait for driver installation (Windows may take 30 seconds)

3. **Flash**
   - Click **"Install MakerWorld Monitor"** button
   - Select your ESP32 port from popup (usually `COM3` on Windows or `/dev/ttyUSB0` on Linux)
   - Click **"Connect"**
   - Click **"Install"** when prompted
   - Wait ~2 minutes (progress bar will show status)

4. **Verify**
   - ESP32 will restart automatically
   - Display shows "MakerWorld Monitor" splash screen
   - After 2 seconds, WiFi setup appears

### Step 3: WiFi Configuration

1. **Connect to Setup Network**
   - On your phone/computer, open WiFi settings
   - Find network: `MakerWorld-Setup`
   - Connect (no password needed)

2. **Configure WiFi**
   - Browser should open automatically
   - If not, go to: `http://192.168.4.1`
   - Select your home WiFi from list
   - Enter password
   - Click **"Save"**

3. **Note IP Address**
   - ESP32 reconnects to your WiFi
   - Display shows: `IP: 192.168.x.x`
   - **Write this down!** You'll need it later

✅ **Hardware setup complete!**

---

## 💻 Method 2: Arduino IDE (Advanced)

### Step 1: Install Arduino IDE

1. **Download**
   - Visit: https://www.arduino.cc/en/software
   - Download for your OS (Windows/Mac/Linux)
   - Install with default settings

### Step 2: Add ESP32 Support

1. **Open Arduino IDE**
   
2. **Add Board Manager URL**
   - File → Preferences
   - Find: "Additional Board Manager URLs"
   - Add:
     ```
     https://espressif.github.io/arduino-esp32/package_esp32_index.json
     ```
   - Click "OK"

3. **Install ESP32 Boards**
   - Tools → Board → Boards Manager
   - Search: `esp32`
   - Install: "ESP32 by Espressif Systems"
   - Wait for installation (~5 minutes)

### Step 3: Install Required Libraries

Open: Tools → Manage Libraries

Install these libraries (search by name):

| Library | Version | Purpose |
|---------|---------|---------|
| **TFT_eSPI** | Latest | Display driver |
| **ArduinoJson** | 6.x or 7.x | JSON parsing |
| **WiFiManager** | Latest | Easy WiFi setup |

### Step 4: Configure TFT_eSPI

⚠️ **IMPORTANT:** This step is required for display to work!

1. **Find Library Location**
   - Windows: `C:\Users\[YourName]\Documents\Arduino\libraries\TFT_eSPI\`
   - Mac: `~/Documents/Arduino/libraries/TFT_eSPI/`
   - Linux: `~/Arduino/libraries/TFT_eSPI/`

2. **Edit User_Setup_Select.h**
   - Open file in text editor
   - Find line: `#include <User_Setup.h>`
   - Comment it out: `// #include <User_Setup.h>`
   - Below it, add: `#include <User_Setups/Setup24_ST7789.h>`
   - Save file

   **Should look like:**
   ```cpp
   // Comment out default
   // #include <User_Setup.h>
   
   // Use this for CYD
   #include <User_Setups/Setup24_ST7789.h>
   ```

### Step 5: Upload Firmware

1. **Open Project**
   - File → Open
   - Navigate to: `arduino/makerworld_monitor_cyd.ino`
   - Click "Open"

2. **Select Board**
   - Tools → Board → ESP32 Arduino
   - Select: **"ESP32 Dev Module"**

3. **Configure Settings**
   - Tools → Upload Speed: `115200`
   - Tools → Flash Frequency: `80MHz`
   - Tools → Partition Scheme: `Default 4MB with spiffs`

4. **Connect ESP32**
   - Plug in USB-C cable
   - Tools → Port → Select your port
     - Windows: `COM3`, `COM4`, etc.
     - Mac: `/dev/cu.usbserial-*`
     - Linux: `/dev/ttyUSB0`

5. **Upload**
   - Click **Upload** button (right arrow icon)
   - Wait for: "Connecting........"
   - Some boards need: Hold BOOT button until upload starts
   - Wait for "Hard resetting via RTS pin..."
   - **Upload complete!**

6. **Open Serial Monitor** (optional)
   - Tools → Serial Monitor
   - Set baud rate: `115200`
   - You'll see startup messages and IP address

### Step 6: WiFi Setup

Follow the same WiFi configuration steps from Method 1, Step 3.

---

## 🔌 Optional: Buzzer Installation

Want sound notifications? Add a passive buzzer!

### What You Need
- **Passive buzzer** (NOT active buzzer)
- **2 jumper wires** (female-to-female or female-to-male)

### Wiring

```
ESP32 CYD          Passive Buzzer
┌────────┐         ┌──────────┐
│ GPIO22 ├─────────┤ +        │
│        │         │          │
│ GND    ├─────────┤ -        │
└────────┘         └──────────┘
```

**Pin Locations on CYD:**
- GPIO22: Available on header pins
- GND: Multiple locations (use any)

### Test Buzzer

After flashing, visit:
```
http://[ESP32_IP]/test
```

You should hear: Do-Mi-Sol melody + see test notification

**No sound?** Check:
- ✅ Wiring is correct
- ✅ Using **passive** buzzer (has circuit board inside)
- ✅ Buzzer polarity (+/-)

**Don't want buzzer?** Just don't connect it - everything works without it!

---

## 📱 Browser Extension Installation

### Step 1: Download Extension

**Option A: From GitHub**
1. Visit: https://github.com/[username]/makerworld-live-monitor
2. Click "Code" → "Download ZIP"
3. Extract ZIP
4. Navigate to `extension/` folder

**Option B: Clone Repository**
```bash
git clone https://github.com/[username]/makerworld-live-monitor.git
cd makerworld-live-monitor/extension/
```

### Step 2: Install Extension

#### Chrome / Edge

1. **Open Extensions Page**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select `extension/` folder
   - Click "Select Folder"

4. **Pin Extension** (optional)
   - Click puzzle icon in toolbar
   - Find "MakerWorld Monitor"
   - Click pin icon

#### Firefox

1. **Open Add-ons Page**
   - Type: `about:debugging#/runtime/this-firefox`

2. **Load Temporary Add-on**
   - Click "Load Temporary Add-on"
   - Navigate to `extension/`
   - Select `manifest.json`

⚠️ **Note:** Firefox extension is temporary and removed on browser restart

### Step 3: Configure Extension

1. **Click Extension Icon**
   - Opens configuration popup

2. **Choose Notification Method**

   **Option A: ESP32 Display Only**
   - ESP32 Display: `Enabled`
   - IP Address: Enter IP from display (e.g., `192.168.1.100`)
   - Click "Test Connection" ✅
   - Telegram: `Disabled`

   **Option B: Telegram Only**
   - ESP32 Display: `Disabled`
   - Telegram: `Enabled`
   - Bot Token: (see Telegram setup below)
   - Chat ID: (see Telegram setup below)
   - ESP32 Display: `Disabled`

   **Option C: Both ESP32 + Telegram**
   - Enable both sections
   - Fill in all fields
   - Test both connections

3. **General Settings**
   - Refresh Interval: `15 minutes` (recommended)
   - Daily Summary: `Enabled`
   - Summary Time: `12:00` (adjust to preference)

4. **Save Configuration**
   - Click **"Save Configuration"**
   - Extension will reload MakerWorld page
   - Monitoring starts automatically

---

## 📱 Telegram Bot Setup (Optional)

Want notifications on your phone? Set up a Telegram bot!

### Step 1: Create Bot

1. **Open Telegram**
   - Search: `@BotFather`
   - Start chat

2. **Create New Bot**
   ```
   /newbot
   ```

3. **Choose Name**
   ```
   MakerWorld Monitor
   ```

4. **Choose Username**
   ```
   your_makerworld_bot
   ```
   (must end with "bot" and be unique)

5. **Copy Token**
   - BotFather sends message with token
   - Format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Save this!**

### Step 2: Get Chat ID

1. **Open Telegram**
   - Search: `@userinfobot`
   - Start chat

2. **Get Your ID**
   - Bot replies with your user info
   - Copy the number under "Id"
   - Format: `987654321`
   - **Save this!**

### Step 3: Test Bot

1. **Find Your Bot**
   - Search for your bot username in Telegram
   - Start chat with: `/start`

2. **Configure Extension**
   - Paste Bot Token
   - Paste Chat ID
   - Save configuration

3. **Wait for Notification**
   - Next time stats change, you'll get Telegram message!

---

## ✅ Verification

### Test ESP32

1. **Visit Test Page**
   ```
   http://[ESP32_IP]/test
   ```

2. **Should see:**
   - Test notification on display (15 seconds)
   - RGB LED blinks red
   - Buzzer plays melody (if connected)

### Test Extension

1. **Open MakerWorld**
   - Go to: `https://makerworld.com/en/@your-username`
   - Click "Uploads" → "Models"

2. **Check Console** (F12)
   - Should see: "Monitor started..."
   - No errors in red

3. **Wait for Event**
   - When someone downloads/prints
   - Display shows notification
   - Telegram sends message (if enabled)

---

## 🆘 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

---

## 🎉 Success!

You're all set! Your MakerWorld stats are now being monitored 24/7.

**Next Steps:**
- Customize display colors (see examples/)
- Design a 3D printed case (see hardware/)
- Share your setup on MakerWorld!

**Need Help?**
- 📖 [Documentation](https://github.com/[username]/makerworld-live-monitor/wiki)
- 🐛 [Report Issue](https://github.com/[username]/makerworld-live-monitor/issues)
- 💬 [Discussions](https://github.com/[username]/makerworld-live-monitor/discussions)