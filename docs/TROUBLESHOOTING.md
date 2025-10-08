# 🔧 Troubleshooting Guide

Common issues and solutions for MakerWorld Live Monitor.

---

## 🚫 ESP32 Issues

### Display Shows Nothing / Black Screen

**Possible Causes:**
- Wrong TFT_eSPI configuration
- Hardware connection issue
- Wrong board selected

**Solutions:**

1. **Check TFT_eSPI Configuration**
   ```cpp
   // In User_Setup_Select.h, should have:
   #include <User_Setups/Setup24_ST7789.h>
   ```

2. **Test with Different Setup**
   - Try: `Setup25_TTGO_T_Display.h`
   - Re-upload and check

3. **Check Board Selection**
   - Must be: "ESP32 Dev Module"
   - Not "ESP32-S2" or other variants

4. **Hardware Test**
   - Check USB power LED is on
   - Try different USB cable
   - Try different USB port

---

### WiFi Not Connecting

**Symptoms:**
- "MakerWorld-Setup" network not appearing
- Can't connect to setup network
- Display stuck on "WiFi Setup" screen

**Solutions:**

1. **Reset WiFi Settings**
   - Visit: `http://[ESP32_IP]/reset-wifi`
   - Or hold BOOT button during power-on
   - ESP32 will restart in setup mode

2. **Check WiFi Password**
   - Ensure correct password entered
   - Check for hidden characters (spaces)
   - Try WiFi without password first (guest network)

3. **Check WiFi Band**
   - ESP32 only supports **2.4GHz WiFi**
   - 5GHz WiFi will NOT work
   - Check router settings

4. **Check Signal Strength**
   - Move ESP32 closer to router
   - Remove metal objects nearby
   - Check antenna is not damaged

5. **Factory Reset**
   - Erase flash completely:
   ```bash
   esptool.py --port COM3 erase_flash
   ```
   - Re-flash firmware

---

### Display Shows "WAITING SYNC"

**Symptoms:**
- Display works but shows "WAITING SYNC"
- Stats show 0 for everything

**Cause:** Extension hasn't synced initial data yet

**Solutions:**

1. **Check Extension Running**
   - Visit MakerWorld profile page
   - Open Console (F12)
   - Should see: "Syncing initial stats..."

2. **Verify IP Address**
   - Extension popup → ESP32 IP
   - Must match IP on display
   - Click "Test Connection"

3. **Check Network**
   - ESP32 and computer on same network?
   - Try ping: `ping 192.168.x.x`
   - Check firewall settings

4. **Manual Sync**
   - Visit: `http://[ESP32_IP]/debug`
   - Click "Force Resync"
   - Reload MakerWorld page

---

### RGB LED Not Working

**Solutions:**

1. **Check LED Pins**
   ```cpp
   #define LED_R 4
   #define LED_G 16
   #define LED_B 17
   ```
   - These are correct for CYD

2. **Test LED**
   - Upload test sketch:
   ```cpp
   void setup() {
     pinMode(4, OUTPUT);
     digitalWrite(4, LOW);  // Should be RED
   }
   ```

---

## 🔔 Buzzer Issues

### No Sound from Buzzer

**Possible Causes:**
- Wrong buzzer type (active vs passive)
- Incorrect wiring
- Wrong GPIO pin

**Solutions:**

1. **Check Buzzer Type**
   - Must be **PASSIVE** buzzer
   - Has PCB with components
   - If it beeps with DC voltage = ACTIVE (won't work)

2. **Check Wiring**
   ```
   Buzzer (+) → GPIO 22
   Buzzer (-) → GND
   ```

3. **Test Buzzer Directly**
   - Connect buzzer to 3.3V and GND
   - Should NOT beep (passive buzzer)
   - If it beeps = wrong type

4. **Verify GPIO Pin**
   ```cpp
   #define BUZZER_PIN 22
   ```

5. **Test via Web**
   - Visit: `http://[ESP32_IP]/test`
   - Should hear melody

---

## 🌐 Extension Issues

### Extension Not Loading

**Chrome/Edge:**

1. **Check Developer Mode**
   - Must be enabled in `chrome://extensions/`

2. **Reload Extension**
   - Click reload button in extensions page
   - Or remove and re-add

3. **Check Manifest Errors**
   - Red errors shown in extensions page
   - Usually syntax errors in manifest.json

**Firefox:**

1. **Reload Temporary Add-on**
   - Extensions are temporary in Firefox
   - Reload after every browser restart

---

### "Cannot reach ESP32" Error

**Solutions:**

1. **Verify IP Address**
   - Check display: `IP: 192.168.x.x`
   - Extension must have exact same IP
   - No typos!

2. **Test Ping**
   - Open Command Prompt/Terminal
   - Type: `ping 192.168.x.x`
   - Should get replies

3. **Check Same Network**
   - Computer and ESP32 must be on same WiFi
   - Not guest network vs main network
   - Check IP range matches

4. **Firewall/Antivirus**
   - May block local network access
   - Temporarily disable and test
   - Add exception for Chrome

5. **Test with Browser**
   - Open: `http://192.168.x.x/ping`
   - Should show: "OK"
   - If not, network issue

---

### Extension Shows "Enable at least one notification method"

**Cause:** Both ESP32 and Telegram are disabled

**Solution:**
- Enable ESP32 OR Telegram
- At least one must be enabled
- Both can be enabled simultaneously

---

### Stats Not Updating

**Symptoms:**
- Extension running but no notifications
- Stats stuck at old values

**Solutions:**

1. **Check Page URL**
   - Must be on: `https://makerworld.com/en/@username/Uploads/Models.html`
   - Extension only works on Models page

2. **Check Console for Errors**
   - Press F12
   - Look for red errors
   - Common: "Cannot find elements"

3. **MakerWorld Layout Changed**
   - Website updates may break selectors
   - Check for extension updates
   - Report issue on GitHub

4. **Clear Storage**
   - Extension popup → Reset Stats
   - Reload page

---

## 📱 Telegram Issues

### "Telegram Error: 401 Unauthorized"

**Cause:** Wrong Bot Token

**Solution:**
- Go back to @BotFather
- Send: `/mybots`
- Select your bot
- Copy token again
- Paste in extension

---

### "Telegram Error: 400 Bad Request"

**Cause:** Wrong Chat ID

**Solution:**
- Go to @userinfobot again
- Copy ID carefully
- Must be numbers only (e.g., `123456789`)
- No letters or symbols

---

### Bot Not Responding

**Solutions:**

1. **Start Bot**
   - Search for your bot in Telegram
   - Send: `/start`
   - Required before bot can send messages

2. **Check Bot Privacy**
   - Go to @BotFather
   - Send: `/mybots`
   - Select bot → Bot Settings → Group Privacy
   - Can be enabled or disabled

---

### No Photo in Telegram Notifications

**Cause:** MakerWorld image URL blocked or invalid

**Solution:**
- Extension will send text-only message as fallback
- This is normal behavior
- Not an error

---

## 🔄 Sync Issues

### "Timeout: sync took too long"

**Solutions:**

1. **Increase Timeout**
   - Edit `content.js`:
   ```javascript
   }, 20000); // Increase from 15000 to 20000
   ```

2. **Check Network Speed**
   - Slow network = longer timeouts
   - Use wired connection if possible

---

### Initial Sync Fails

**Symptoms:**
- Display stays on "WAITING SYNC"
- Console shows sync errors

**Solutions:**

1. **Refresh Page**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check Stats Exist**
   - Must have at least 1 model uploaded
   - Stats must be visible on page

3. **Manual Resync**
   - Visit: `http://[ESP32_IP]/resync`
   - Reload MakerWorld page

---

## 💾 Storage Issues

### "Stats reset to 0" after Restart

**Cause:** Flash storage not working

**Solutions:**

1. **Check Partition Scheme**
   - Arduino IDE → Tools → Partition Scheme
   - Select: "Default 4MB with spiffs"
   - Re-upload

2. **Test Flash**
   - Visit: `http://[ESP32_IP]/debug`
   - Check if stats show correct values
   - If 0, flash storage issue

---

## 🖥️ Web Flasher Issues

### "Failed to connect"

**Solutions:**

1. **Check Browser**
   - Must use Chrome, Edge, or Opera
   - Firefox and Safari NOT supported

2. **Check USB Cable**
   - Must be data cable, not charge-only
   - Try different cable

3. **Install Drivers**
   - Windows: CH340 driver
   - Download from: http://www.wch-ic.com/downloads/CH341SER_ZIP.html

4. **Try Different Port**
   - Some USB ports don't work well
   - Try USB 2.0 port instead of 3.0

---

### "Timeout during flash"

**Solutions:**

1. **Hold BOOT Button**
   - Some boards need BOOT held during "Connecting..."
   - Release when upload starts

2. **Lower Upload Speed**
   - Arduino IDE: Tools → Upload Speed → 115200

---

## 🔍 Debug Mode

### Enable Serial Monitor

Arduino IDE:
```
Tools → Serial Monitor
Set: 115200 baud
```

You'll see:
```
=== MakerWorld Monitor CYD-R ===
Stats loaded from flash:
Downloads: 123
Prints: 45
...
IP Address: 192.168.1.100
```

### Debug Endpoints

| URL | Purpose |
|-----|---------|
| `/ping` | Test connection |
| `/debug` | View stats and system info |
| `/stats` | Get JSON stats |
| `/test` | Trigger test notification |
| `/reset` | Reset all stats to 0 |
| `/resync` | Force browser resync |

---

## 🆘 Still Having Issues?

1. **Check Documentation**
   - [Installation Guide](INSTALLATION.md)
   - [Configuration Guide](CONFIGURATION.md)
   - [API Documentation](API.md)

2. **Search Existing Issues**
   - https://github.com/[username]/makerworld-live-monitor/issues

3. **Create New Issue**
   - Include:
     - Hardware used
     - Browser and OS
     - Error messages from console
     - Screenshots
     - Serial monitor output
   - https://github.com/[username]/makerworld-live-monitor/issues/new

4. **Community Help**
   - GitHub Discussions
   - MakerWorld comments
   - Discord (if available)

---

## ✅ Diagnostic Checklist

Copy this checklist when reporting issues:

```
Hardware:
[ ] ESP32 model: _____________
[ ] Display working: Yes / No
[ ] RGB LED working: Yes / No
[ ] Buzzer connected: Yes / No
[ ] Buzzer working: Yes / No

Network:
[ ] WiFi connected: Yes / No
[ ] IP address: _____________
[ ] Ping works: Yes / No
[ ] /ping endpoint works: Yes / No

Extension:
[ ] Browser: Chrome / Edge / Opera / Firefox
[ ] Extension loaded: Yes / No
[ ] Configuration saved: Yes / No
[ ] Console errors: Yes / No (attach screenshot)

Stats:
[ ] MakerWorld page loads: Yes / No
[ ] Stats visible on page: Yes / No
[ ] Extension monitoring: Yes / No
[ ] Initial sync completed: Yes / No

Notifications:
[ ] ESP32 display updates: Yes / No
[ ] Telegram messages arrive: Yes / No
[ ] Test notification works: Yes / No
```