# Extension Installation Guide 

Browser extension that automatically sends your MakerWorld statistics to the ESP32 CYD display, Telegram, and Home Assistant via MQTT.

## 📥 Installation

### Chrome/Edge/Brave
1. Download the latest release from the [Main page](https://github.com/aquascape123/makerworld-live-monitor/tree/main)
2. Unzip the downloaded file
3. Open Chrome/Edge and go to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top-right corner)
5. Click **"Load unpacked"** and select the unzipped extension folder
6. The MakerWorld Monitor icon should appear in your toolbar

## ⚙️ Configuration Guide

### 1. ESP32 Display Setup
**Enable ESP32 Display:**
- Click the extension icon in your toolbar
- Under "ESP32 Display", select **"Enabled"**
- Enter your ESP32's IP address (e.g., `192.168.1.100`)

**Find ESP32 IP:**
- Check the bottom of your ESP32 display
- Or look in your router's connected devices list

**Test Connection:**
- Click **"Test Connection"** to verify communication
- Click **"Test Notification"** to send a test alert to your display

### 2. Telegram Notifications (Optional)
**Enable Telegram:**
- Under "Telegram Notifications", select **"Enabled"**

**Get Bot Token:**
- Message `@BotFather` on Telegram
- Send `/newbot` and follow instructions
- Copy the bot token into **"Telegram Bot Token"**

**Get Chat ID:**
- Message `@userinfobot` on Telegram
- Copy your numeric Chat ID into **"Telegram Chat ID"**

### 3. Home Assistant MQTT (Optional)
The extension can publish MakerWorld totals to Home Assistant using MQTT discovery. Because browser extensions cannot connect to raw MQTT/TCP on port `1883`, your broker must expose MQTT over WebSockets.

**Enable MQTT:**
- Under "Home Assistant MQTT", select **"Enabled"**
- Broker WebSocket URL: enter your broker WebSocket listener, for example `ws://homeassistant.local:1884`
- Username and password: use a dedicated MQTT user if possible
- Topic Prefix: defaults to `makerworld`
- Device Name: defaults to `MakerWorld Monitor`

**Mosquitto WebSocket listener example:**
```conf
listener 1883
protocol mqtt

listener 1884
protocol websockets
```

After saving, open your MakerWorld uploads page. The extension publishes retained Home Assistant MQTT discovery topics and retained state for:
- Downloads
- Prints
- Boosts
- Points

### 4. General Settings
**Refresh Interval:** How often to check for updates (15 minutes recommended)

**Daily Summary:** Receive a daily recap of your statistics

**Summary Time:** Set the time for your daily report (default: 12:00 PM)

### 5. Save Configuration
- Click **"Save Configuration"** to apply all settings
- The status message will confirm successful save

## 🎯 Features

### Real-time Monitoring
- 📥 **New Downloads** - Instant notification on display and Telegram
- 🖨️ **New Prints** - Live print count updates  
- ⚡ **Boosts** - Boost activity tracking
- ⭐ **Points** - Real-time point changes
- 🔔 **Visual & Audio Alerts** - On-display notifications with RGB feedback

### Dual Notification System
- **ESP32 Display**: Live stats with color-coded LED notifications
- **Telegram**: Push notifications to your phone (optional)
- **Home Assistant MQTT**: Auto-discovered sensors for Downloads, Prints, Boosts, and Points
- **Daily Summary**: Recap of daily activity at your chosen time

### Privacy & Security
- ✅ **Local network only** - ESP32 communication stays within your network
- ✅ **No data storage** - We don't collect or store your statistics
- ✅ **Encrypted communication** - Secure data transmission

## 🚨 Troubleshooting

### ESP32 Connection Issues
1. **"Test Connection" fails:**
   - Verify ESP32 IP address is correct
   - Ensure computer and ESP32 are on same WiFi network
   - Check if ESP32 is powered on and connected

2. **IP Address unknown:**
   - Check serial monitor output during ESP32 boot
   - Look for "Connected! IP address:" message
   - Check your router's device list

### Telegram Not Working
1. **Bot not responding:**
   - Verify bot token is correct (from @BotFather)
   - Ensure you've started a chat with your bot
   - Check that Chat ID is numeric (from @userinfobot)

2. **No notifications:**
   - Send `/start` to your bot in Telegram
   - Check if bot has permission to message you

### Home Assistant MQTT Not Working
1. **No sensors appear:**
   - Confirm the MQTT integration is enabled in Home Assistant
   - Confirm your broker has a WebSocket listener, such as `ws://homeassistant.local:1884`
   - Open the browser console on the MakerWorld page and look for MQTT publish errors

2. **Connection fails:**
   - Check the WebSocket URL starts with `ws://` or `wss://`
   - Verify the MQTT username/password
   - If using HTTPS or a secure Home Assistant page, prefer `wss://` with a valid certificate

### Extension Not Monitoring
1. **Check active tab:**
   - Extension only works on makerworld.com pages
   - Ensure you're logged into your MakerWorld account

2. **Refresh interval:**
   - Statistics check happens at your set interval
   - Use 15 minutes for balance of performance and freshness

## 🔧 Advanced Features

### Manual Testing
- **Test Connection**: Verifies ESP32 is reachable
- **Test Notification**: Sends sample alert to display and Telegram

### Customization
- Adjust refresh frequency based on your needs
- Enable/disable daily summaries
- Set preferred time for daily report

## 📊 Supported Platforms

- ✅ **Google Chrome** 88+
- ✅ **Microsoft Edge** 88+
- ✅ **Brave Browser** 1.20+
- ✅ **Firefox** 85+

## 🔒 Permissions Explained

- **"Access your data for makerworld.com"** - Reads your statistics from MakerWorld profile
- **"Access data for local network"** - Communicates with your ESP32 device
- **"Access api.telegram.org"** - Sends Telegram notifications when enabled
- **"Access ws/wss hosts"** - Publishes MQTT over WebSockets to your broker when enabled

## 🐛 Reporting Issues

If you encounter problems:

1. **Check connection:**
   - Test ESP32 connection in extension
   - Verify Telegram bot settings

2. **Gather information:**
   - Browser version and OS
   - ESP32 serial output (if available)
   - Error messages from extension status

3. **Create issue on GitHub** with:
   - What you were doing when issue occurred
   - Steps to reproduce
   - Any error messages received

## ❓ Frequently Asked Questions

**Q: How often should I set the refresh interval?**
A: 15 minutes is recommended for most users. Set shorter for more frequent updates, longer for better performance.

**Q: Can I use only one notification method?**
A: Yes! You can enable just ESP32, just Telegram, or both.

**Q: Why do I need to provide my MakerWorld username?**
A: The extension monitors your specific profile page for statistic changes.

**Q: Is my data secure?**
A: Yes! All communication stays on your local network or goes directly to Telegram. No data is stored on external servers.

---

**Need Help?** Visit the [main repository](https://github.com/aquascape123/makerworld-live-monitor) for firmware setup and community support!

**Enjoy your MakerWorld Live Monitor!** 🎉
