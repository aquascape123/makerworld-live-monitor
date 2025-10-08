#include <WiFi.h>
#include <WebServer.h>
#include <TFT_eSPI.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <WiFiManager.h>

// ============ PIN CYD-R ============
#define TFT_BL 21

// ============ PIN LED RGB CYD-R ============
#define LED_R 4
#define LED_G 16
#define LED_B 17

// ============ PIN BUZZER ============
#define BUZZER_PIN 22

// ============ OGGETTI ============
TFT_eSPI tft = TFT_eSPI();
WebServer server(80);
Preferences prefs;

// ============ VARIABILI GLOBALI ============
struct Stats {
  int totalDownloads = 0;
  int totalPrints = 0;
  int totalBoosts = 0;
  float totalPoints = 0.0;  // CAMBIATO DA int A float
  unsigned long lastNotification = 0;
  bool initialized = false;
} stats;

struct Notification {
  String type;
  String modelName;
  float value;    // CAMBIATO DA int A float
  float total;    // CAMBIATO DA int A float
  float points;   // CAMBIATO DA int A float
  unsigned long timestamp;
  bool active = false;
} currentNotif;

unsigned long lastStatsUpdate = 0;
unsigned long lastSyncAttempt = 0;
const unsigned long STATS_UPDATE_INTERVAL = 5000;
const unsigned long NOTIF_DISPLAY_TIME = 15000;
const unsigned long SYNC_TIMEOUT = 30000;

// ============ COLORI MODERNI ============
#define COLOR_BG_TOP      0x0520
#define COLOR_BG_BOTTOM   0x1C60
#define COLOR_CARD_BG     0x2945
#define COLOR_PRIMARY     0x07FF
#define COLOR_SUCCESS     0x07E0
#define COLOR_WARNING     0xFFE0
#define COLOR_DANGER      0xF81F
#define COLOR_TEXT        0xFFFF
#define COLOR_TEXT_DIM    0xBDF7
#define COLOR_ACCENT      0x3E0

// ============================================
// FUNZIONI BUZZER
// ============================================
void setupBuzzer() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

void playBeep(int frequency, int duration) {
  int period = 1000000L / frequency;
  int pulseWidth = period / 2;
  long cycles = frequency * duration / 1000;
  
  for (long i = 0; i < cycles; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delayMicroseconds(pulseWidth);
    digitalWrite(BUZZER_PIN, LOW);
    delayMicroseconds(pulseWidth);
  }
}

void playNotificationSound() {
  playBeep(523, 150);
  delay(50);
  playBeep(659, 150);
  delay(50);
  playBeep(784, 200);
}

void playSuccessSound() {
  playBeep(523, 200);
  delay(100);
  playBeep(784, 300);
}

void playErrorSound() {
  playBeep(392, 500);
}

void playStartupSound() {
  playBeep(523, 200);
  delay(150);
  playBeep(659, 200);
  delay(150);
  playBeep(784, 200);
  delay(150);
  playBeep(1047, 300);
}

// ============================================
// SALVATAGGIO E CARICAMENTO STATS
// ============================================
void saveStats() {
  prefs.begin("makerworld", false);
  prefs.putInt("downloads", stats.totalDownloads);
  prefs.putInt("prints", stats.totalPrints);
  prefs.putInt("boosts", stats.totalBoosts);
  prefs.putFloat("points", stats.totalPoints);  // CAMBIATO putInt in putFloat
  prefs.putBool("initialized", stats.initialized);
  prefs.end();
  Serial.println("Stats saved to flash");
}

void loadStats() {
  prefs.begin("makerworld", true);
  stats.totalDownloads = prefs.getInt("downloads", 0);
  stats.totalPrints = prefs.getInt("prints", 0);
  stats.totalBoosts = prefs.getInt("boosts", 0);
  stats.totalPoints = prefs.getFloat("points", 0.0);  // CAMBIATO getInt in getFloat
  stats.initialized = prefs.getBool("initialized", false);
  prefs.end();
  
  Serial.println("Stats loaded from flash:");
  Serial.print("Downloads: "); Serial.println(stats.totalDownloads);
  Serial.print("Prints: "); Serial.println(stats.totalPrints);
  Serial.print("Boosts: "); Serial.println(stats.totalBoosts);
  Serial.print("Points: "); Serial.println(stats.totalPoints, 2);  // AGGIUNTO , 2 per mostrare 2 decimali
  Serial.print("Initialized: "); Serial.println(stats.initialized ? "YES" : "NO");
}

// ============================================
// GESTIONE LED RGB
// ============================================
void setupLED() {
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);
  
  digitalWrite(LED_R, HIGH);
  digitalWrite(LED_G, HIGH);
  digitalWrite(LED_B, HIGH);
}

void setLEDColor(bool red, bool green, bool blue) {
  digitalWrite(LED_R, !red);
  digitalWrite(LED_G, !green);
  digitalWrite(LED_B, !blue);
}

void ledGreen() {
  setLEDColor(false, true, false);
}

void ledRed() {
  setLEDColor(true, false, false);
}

void ledOff() {
  setLEDColor(false, false, false);
}

void blinkRed(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    ledRed();
    delay(delayMs);
    ledOff();
    delay(delayMs);
  }
  ledGreen();
}

// ============================================
// FUNZIONI GRAFICHE AVANZATE
// ============================================
void drawGradient(int x, int y, int w, int h, uint16_t colorTop, uint16_t colorBottom) {
  for (int i = 0; i < h; i++) {
    float ratio = (float)i / h;
    
    uint8_t r1 = (colorTop >> 11) & 0x1F;
    uint8_t g1 = (colorTop >> 5) & 0x3F;
    uint8_t b1 = colorTop & 0x1F;
    
    uint8_t r2 = (colorBottom >> 11) & 0x1F;
    uint8_t g2 = (colorBottom >> 5) & 0x3F;
    uint8_t b2 = colorBottom & 0x1F;
    
    uint8_t r = r1 + (r2 - r1) * ratio;
    uint8_t g = g1 + (g2 - g1) * ratio;
    uint8_t b = b1 + (b2 - b1) * ratio;
    
    uint16_t color = (r << 11) | (g << 5) | b;
    tft.drawFastHLine(x, y + i, w, color);
  }
}

void drawCard(int x, int y, int w, int h, uint16_t color) {
  tft.fillRoundRect(x + 2, y + 2, w, h, 8, 0x18E3);
  tft.fillRoundRect(x, y, w, h, 8, color);
}

void drawDownloadIcon(int x, int y, uint16_t color) {
  tft.fillTriangle(x+5, y+8, x+10, y+3, x+15, y+8, color);
  tft.fillRect(x+9, y, 3, 8, color);
  tft.drawFastHLine(x+3, y+10, 15, color);
}

void drawPrintIcon(int x, int y, uint16_t color) {
  tft.fillRect(x+3, y+3, 15, 6, color);
  tft.fillRect(x+5, y, 11, 4, color);
  tft.drawRect(x+3, y+3, 15, 6, COLOR_BG_TOP);
}

void drawBoostIcon(int x, int y, uint16_t color) {
  tft.fillTriangle(x+10, y, x+6, y+6, x+10, y+6, color);
  tft.fillTriangle(x+10, y+6, x+14, y+6, x+10, y+12, color);
}

void drawStarIcon(int x, int y, uint16_t color) {
  for(int i = 0; i < 5; i++) {
    float angle = -PI/2 + (2 * PI * i / 5);
    int x1 = x + 6 + cos(angle) * 6;
    int y1 = y + 6 + sin(angle) * 6;
    tft.fillCircle(x1, y1, 2, color);
  }
  tft.fillCircle(x+6, y+6, 3, color);
}

// ============================================
// SETUP
// ============================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== MakerWorld Monitor CYD-R ===");

  loadStats();

  pinMode(TFT_BL, OUTPUT);
  digitalWrite(TFT_BL, HIGH);
  
  setupLED();
  setupBuzzer();
  ledOff();
  
  tft.init();
  tft.setRotation(3);
  tft.fillScreen(COLOR_BG_TOP);
  tft.setTextColor(COLOR_TEXT, COLOR_BG_TOP);
  
  playStartupSound();
  
  showSplash();
  connectWiFi();
  
  server.on("/notify", HTTP_POST, handleNotification);
  server.on("/ping", HTTP_GET, handlePing);
  server.on("/stats", HTTP_GET, handleStats);
  server.on("/sync", HTTP_POST, handleSync);
  server.on("/resync", HTTP_GET, handleResync);
  server.on("/debug", HTTP_GET, handleDebug);
  server.on("/test", HTTP_GET, handleTestNotification);
  server.on("/reset", HTTP_GET, handleReset);
  server.on("/reset-wifi", HTTP_GET, []() {
    server.send(200, "text/html", 
      "<html><body style='font-family:Arial;text-align:center;padding:50px;'>"
      "<h1>WiFi Reset</h1>"
      "<p>Device will restart in setup mode...</p>"
      "</body></html>");
    delay(1000);
    resetWiFiSettings();
  });
  server.begin();
  
  Serial.println("Server started!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  showMainScreen();
  lastSyncAttempt = millis();
}

// ============================================
// LOOP
// ============================================
void loop() {
  server.handleClient();
  
  unsigned long now = millis();
  
  if (currentNotif.active) {
    if (now - currentNotif.timestamp > NOTIF_DISPLAY_TIME) {
      currentNotif.active = false;
      showMainScreen();
    }
  } else {
    if (now - lastStatsUpdate > STATS_UPDATE_INTERVAL) {
      updateStatsDisplay();
      lastStatsUpdate = now;
    }
    
    if (!stats.initialized && (now - lastSyncAttempt > SYNC_TIMEOUT)) {
      showWaitingForSync();
      lastSyncAttempt = now;
    }
  }
}

// WIFI CONNECTION CON WIFIMANAGER
// ============================================
void connectWiFi() {
  drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
  
  tft.setTextColor(COLOR_TEXT);
  tft.setTextSize(2);
  tft.setCursor(30, 60);
  tft.println("WiFi Setup");
  
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(20, 90);
  tft.println("1. Connect to WiFi:");
  tft.setTextColor(COLOR_ACCENT);
  tft.setCursor(20, 105);
  tft.println("   'MakerWorld-Setup'");
  
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(20, 125);
  tft.println("2. Open browser");
  
  tft.setCursor(20, 140);
  tft.println("3. Enter your WiFi");
  
  WiFiManager wm;
  
  wm.setAPCallback([](WiFiManager *myWiFiManager) {
    tft.fillRect(0, 160, 320, 40, COLOR_BG_BOTTOM);
    tft.setTextColor(COLOR_WARNING);
    tft.setCursor(40, 170);
    tft.println("Setup mode active!");
  });
  
  wm.setConfigPortalTimeout(180);
  
  bool connected = wm.autoConnect("MakerWorld-Setup");
  
  if (connected) {
    ledGreen();
    
    drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
    
    tft.setTextSize(2);
    tft.setTextColor(COLOR_SUCCESS);
    tft.setCursor(60, 80);
    tft.println("WiFi Connected!");
    
    tft.setTextSize(1);
    tft.setTextColor(COLOR_TEXT);
    tft.setCursor(90, 110);
    tft.print("SSID: ");
    tft.println(WiFi.SSID());
    
    tft.setCursor(90, 125);
    tft.print("IP: ");
    tft.println(WiFi.localIP());
    
    if (!stats.initialized) {
      tft.setTextColor(COLOR_WARNING);
      tft.setCursor(70, 155);
      tft.println("Waiting for sync...");
    }
    
    delay(3000);
  } else {
    tft.fillScreen(COLOR_BG_TOP);
    tft.setTextSize(2);
    tft.setTextColor(COLOR_DANGER);
    tft.setCursor(50, 100);
    tft.println("Setup Failed!");
    
    tft.setTextSize(1);
    tft.setTextColor(COLOR_TEXT);
    tft.setCursor(60, 130);
    tft.println("Restarting...");
    
    delay(3000);
    ESP.restart();
  }
}

void resetWiFiSettings() {
  WiFiManager wm;
  wm.resetSettings();
  ESP.restart();
}

void showWaitingForSync() {
  tft.fillRect(0, 200, 320, 40, COLOR_BG_BOTTOM);
  tft.setTextSize(1);
  tft.setTextColor(COLOR_WARNING);
  tft.setCursor(30, 210);
  tft.println("Waiting for browser sync...");
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(40, 225);
  tft.println("Open MakerWorld page");
}

// ============================================
// SPLASH SCREEN
// ============================================
void showSplash() {
  drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
  
  tft.setTextSize(4);
  tft.setTextColor(COLOR_ACCENT);
  tft.setCursor(30, 60);
  tft.println("MakerWorld");
  
  tft.setTextSize(3);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setCursor(70, 100);
  tft.println("Monitor");
  
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(100, 150);
  tft.println("by @aquascape");
  
  delay(2000);
}

// ============================================
// SCHERMATA PRINCIPALE
// ============================================
void showMainScreen() {
  drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
  
  tft.fillRect(0, 0, 320, 35, COLOR_CARD_BG);
  tft.setTextColor(COLOR_TEXT);
  tft.setTextSize(2);
  tft.setCursor(50, 10);
  tft.println("MakerWorld Stats");
  
  updateStatsDisplay();
}

void updateStatsDisplay() {
  if (currentNotif.active) return;
  
  int cardY = 45;
  int cardHeight = 35;
  int cardSpacing = 40;
  
  drawCard(10, cardY, 300, cardHeight, COLOR_CARD_BG);
  drawDownloadIcon(20, cardY + 10, COLOR_SUCCESS);
  tft.setTextSize(2);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(50, cardY + 10);
  tft.print("Downloads:");
  tft.setCursor(200, cardY + 10);
  tft.println(stats.totalDownloads);
  
  cardY += cardSpacing;
  
  drawCard(10, cardY, 300, cardHeight, COLOR_CARD_BG);
  drawPrintIcon(20, cardY + 10, COLOR_PRIMARY);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(50, cardY + 10);
  tft.print("Prints:");
  tft.setCursor(200, cardY + 10);
  tft.println(stats.totalPrints);
  
  cardY += cardSpacing;
  
  drawCard(10, cardY, 300, cardHeight, COLOR_CARD_BG);
  drawBoostIcon(20, cardY + 10, COLOR_WARNING);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(50, cardY + 10);
  tft.print("Boosts:");
  tft.setCursor(200, cardY + 10);
  tft.println(stats.totalBoosts);
  
  cardY += cardSpacing;
  
  drawCard(10, cardY, 300, cardHeight, COLOR_CARD_BG);
  drawStarIcon(20, cardY + 10, COLOR_DANGER);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(50, cardY + 10);
  tft.print("Points:");
  tft.setCursor(200, cardY + 10);
  tft.println(stats.totalPoints, 2);  // AGGIUNTO , 2 per mostrare 2 decimali
  
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(10, 225);
  tft.print("IP: ");
  tft.print(WiFi.localIP());
  
  if (!stats.initialized) {
    tft.setTextColor(COLOR_WARNING);
    tft.setCursor(200, 225);
    tft.print("WAITING SYNC");
  }
}

// ============================================
// MOSTRA NOTIFICA - CON DECIMALI PER POINTS
// ============================================
void showNotification() {
  playNotificationSound();
  
  blinkRed(3, 150);
  
  uint16_t headerColor = COLOR_PRIMARY;
  uint16_t accentColor = COLOR_ACCENT;
  String title = "Notification";
  
  // GESTIONE POINTS CON DECIMALI
  if (currentNotif.type == "points") {
    drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
    
    drawCard(10, 10, 300, 50, COLOR_WARNING);
    drawStarIcon(20, 25, COLOR_TEXT);
    
    tft.setTextSize(2);
    tft.setTextColor(COLOR_TEXT);
    tft.setCursor(55, 25);
    tft.println("POINTS UPDATE!");
    
    drawCard(10, 70, 300, 130, COLOR_CARD_BG);
    
    int y = 90;
    
    tft.setTextSize(1);
    tft.setTextColor(COLOR_TEXT_DIM);
    tft.setCursor(20, y);
    tft.println("Before:");
    tft.setTextSize(3);
    tft.setTextColor(COLOR_TEXT);
    tft.setCursor(100, y - 5);
    tft.println(currentNotif.total, 2);  // MOSTRA 2 DECIMALI
    
    y += 40;
    
    tft.setTextSize(1);
    tft.setTextColor(COLOR_TEXT_DIM);
    tft.setCursor(20, y);
    tft.println("After:");
    tft.setTextSize(3);
    tft.setTextColor(COLOR_WARNING);
    tft.setCursor(100, y - 5);
    tft.println(currentNotif.points, 2);  // MOSTRA 2 DECIMALI
    
    y += 40;
    
    tft.drawFastHLine(20, y, 280, COLOR_WARNING);
    y += 10;
    
    tft.setTextSize(2);
    tft.setTextColor(COLOR_SUCCESS);
    tft.setCursor(60, y);
    tft.print("+ ");
    tft.print(currentNotif.value, 2);  // MOSTRA 2 DECIMALI
    tft.print(" points");
    
    for (int i = 0; i < 2; i++) {
      tft.drawRoundRect(5, 5, 310, 230, 12, COLOR_WARNING);
      delay(200);
      tft.drawRoundRect(5, 5, 310, 230, 12, COLOR_BG_TOP);
      delay(200);
    }
    
    blinkRed(2, 100);
    return;
  }
  
  // GESTIONE NORMALE - NOME MODELLO PIU GRANDE
  if (currentNotif.type == "download") {
    headerColor = COLOR_SUCCESS;
    accentColor = COLOR_SUCCESS;
    title = "NEW DOWNLOAD!";
  } else if (currentNotif.type == "print") {
    headerColor = COLOR_PRIMARY;
    accentColor = COLOR_PRIMARY;
    title = "NEW PRINT!";
  } else if (currentNotif.type == "boost") {
    headerColor = COLOR_WARNING;
    accentColor = COLOR_WARNING;
    title = "NEW BOOST!";
  }
  
  drawGradient(0, 0, 320, 240, COLOR_BG_TOP, COLOR_BG_BOTTOM);
  
  drawCard(10, 10, 300, 45, headerColor);
  
  if (currentNotif.type == "download") {
    drawDownloadIcon(20, 22, COLOR_TEXT);
  } else if (currentNotif.type == "print") {
    drawPrintIcon(20, 22, COLOR_TEXT);
  } else if (currentNotif.type == "boost") {
    drawBoostIcon(20, 22, COLOR_TEXT);
  }
  
  tft.setTextSize(2);
  tft.setTextColor(COLOR_TEXT);
  tft.setCursor(55, 22);
  tft.println(title);
  
  drawCard(10, 65, 300, 160, COLOR_CARD_BG);
  
  int y = 75;
  
  tft.setTextSize(2);
  tft.setTextColor(accentColor);
  
  String modelName = currentNotif.modelName;
  int maxCharsPerLine = 18;
  int startPos = 0;
  int lineCount = 0;
  
  while (startPos < modelName.length() && lineCount < 3) {
    String line = "";
    int endPos = startPos + maxCharsPerLine;
    
    if (endPos >= modelName.length()) {
      line = modelName.substring(startPos);
    } else {
      int spacePos = modelName.lastIndexOf(' ', endPos);
      if (spacePos > startPos) {
        endPos = spacePos;
      }
      line = modelName.substring(startPos, endPos);
    }
    
    tft.setCursor(20, y);
    tft.println(line);
    y += 20;
    startPos = endPos + 1;
    lineCount++;
  }
  
  if (startPos < modelName.length()) {
    tft.setCursor(20, y);
    tft.println("...");
    y += 20;
  }
  
  y += 5;
  
  tft.drawFastHLine(20, y, 280, accentColor);
  y += 10;
  
  tft.setTextSize(3);
  tft.setTextColor(accentColor);
  tft.setCursor(20, y);
  tft.print("+");
  tft.print(currentNotif.value, 0);  // value rimane intero per download/print/boost
  
  tft.setTextSize(1);
  tft.setTextColor(COLOR_TEXT_DIM);
  tft.setCursor(120, y + 10);
  tft.print("(total: ");
  tft.print(currentNotif.total, 0);
  tft.println(")");
  y += 30;
  
  // Points CON DECIMALI
  if (currentNotif.type != "boost" && currentNotif.points > 0) {
    drawStarIcon(20, y, COLOR_WARNING);
    tft.setTextSize(1);
    tft.setTextColor(COLOR_WARNING);
    tft.setCursor(40, y + 2);
    tft.print("+");
    tft.print(currentNotif.points, 2);  // MOSTRA 2 DECIMALI
    tft.print(" pts");
    
    tft.setTextColor(COLOR_TEXT_DIM);
    tft.setCursor(120, y + 2);
    tft.print("Total: ");
    tft.println(stats.totalPoints, 2);  // MOSTRA 2 DECIMALI
  }
  
  for (int i = 0; i < 2; i++) {
    tft.drawRoundRect(5, 5, 310, 230, 12, accentColor);
    delay(200);
    tft.drawRoundRect(5, 5, 310, 230, 12, COLOR_BG_TOP);
    delay(200);
  }
  
  blinkRed(2, 100);
}

// ============================================
// WEB SERVER HANDLERS
// ============================================
void handlePing() {
  server.send(200, "text/plain", "OK");
  Serial.println("Ping received");
}

void handleStats() {
  StaticJsonDocument<256> doc;
  doc["downloads"] = stats.totalDownloads;
  doc["prints"] = stats.totalPrints;
  doc["boosts"] = stats.totalBoosts;
  doc["points"] = stats.totalPoints;  // JSON gestisce automaticamente i float
  doc["initialized"] = stats.initialized;
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleResync() {
  server.send(200, "text/plain", "Resync triggered");
  stats.initialized = false;
  saveStats();
  currentNotif.active = false;
  showMainScreen();
  Serial.println("Resync requested");
}

void handleReset() {
  prefs.begin("makerworld", false);
  prefs.clear();
  prefs.end();
  
  stats.totalDownloads = 0;
  stats.totalPrints = 0;
  stats.totalBoosts = 0;
  stats.totalPoints = 0.0;  // RESET A 0.0
  stats.initialized = false;
  
  showMainScreen();
  
  server.send(200, "text/plain", "Stats reset");
  Serial.println("Stats reset!");
}

void handleDebug() {
  String html = "<html><body style='font-family: Arial; background: #0f2027; color: #fff; padding: 20px;'>";
  html += "<h1 style='color: #00ff88;'>MakerWorld Monitor Debug</h1>";
  html += "<div style='background: #1a3a3a; padding: 20px; border-radius: 10px;'>";
  html += "<h2>Current Stats:</h2>";
  html += "<p>Downloads: <strong>" + String(stats.totalDownloads) + "</strong></p>";
  html += "<p>Prints: <strong>" + String(stats.totalPrints) + "</strong></p>";
  html += "<p>Boosts: <strong>" + String(stats.totalBoosts) + "</strong></p>";
  html += "<p>Points: <strong>" + String(stats.totalPoints, 2) + "</strong></p>";  // MOSTRA 2 DECIMALI
  html += "<p>Initialized: <strong>" + String(stats.initialized ? "YES" : "NO") + "</strong></p>";
  html += "<p>Uptime: <strong>" + String(millis() / 1000) + "s</strong></p>";
  html += "</div>";
  html += "<br><a href='/resync' style='color: #00ff88; padding: 10px; background: #1a3a3a; text-decoration: none; border-radius: 5px;'>Force Resync</a>";
  html += " <a href='/reset' style='color: #ff6666; padding: 10px; background: #1a3a3a; text-decoration: none; border-radius: 5px; margin-left: 10px;'>Reset Stats</a>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleTestNotification() {
  currentNotif.type = "download";
  currentNotif.modelName = "Bambu Lab X1 Carbon Complete Upgrade Kit with AMS Support";
  currentNotif.value = 5;
  currentNotif.total = 142;
  currentNotif.points = 5.25;  // TEST CON DECIMALI
  currentNotif.timestamp = millis();
  currentNotif.active = true;
  
  showNotification();
  
  server.send(200, "application/json", "{\"status\":\"Test notification displayed\"}");
}

void handleSync() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "Bad Request");
    return;
  }
  
  String body = server.arg("plain");
  Serial.println("=== SYNC REQUEST ===");
  Serial.println(body);
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }
  
  bool updated = false;
  
  if (doc.containsKey("totalDownloads")) {
    stats.totalDownloads = doc["totalDownloads"];
    updated = true;
  }
  if (doc.containsKey("totalPrints")) {
    stats.totalPrints = doc["totalPrints"];
    updated = true;
  }
  if (doc.containsKey("totalBoosts")) {
    stats.totalBoosts = doc["totalBoosts"];
    updated = true;
  }
  if (doc.containsKey("totalPoints")) {
    stats.totalPoints = doc["totalPoints"].as<float>();  // LEGGE COME FLOAT
    updated = true;
  }
  
  if (updated) {
    stats.initialized = true;
    saveStats();
    Serial.println("=== SYNC COMPLETE ===");
    Serial.print("Downloads: "); Serial.println(stats.totalDownloads);
    Serial.print("Prints: "); Serial.println(stats.totalPrints);
    Serial.print("Boosts: "); Serial.println(stats.totalBoosts);
    Serial.print("Points: "); Serial.println(stats.totalPoints, 2);  // STAMPA CON 2 DECIMALI
  }
  
  showMainScreen();
  server.send(200, "text/plain", "Synced");
}

void handleNotification() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "Bad Request");
    return;
  }
  
  String body = server.arg("plain");
  Serial.println("Notification received:");
  Serial.println(body);
  
  StaticJsonDocument<768> doc;
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    Serial.print("JSON parse error: ");
    Serial.println(error.c_str());
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }
  
  currentNotif.type = doc["type"].as<String>();
  
  if (currentNotif.type == "points") {
    currentNotif.modelName = "";
    currentNotif.value = doc["increase"].as<float>();    // LEGGE COME FLOAT
    currentNotif.total = doc["before"].as<float>();      // LEGGE COME FLOAT
    currentNotif.points = doc["after"].as<float>();      // LEGGE COME FLOAT
    
    // DEBUG CON DECIMALI
    Serial.println("=== POINTS DEBUG ===");
    Serial.print("JSON before: "); Serial.println(doc["before"].as<float>(), 2);
    Serial.print("JSON after: "); Serial.println(doc["after"].as<float>(), 2);
    Serial.print("JSON increase: "); Serial.println(doc["increase"].as<float>(), 2);
    Serial.print("Mapped total (before): "); Serial.println(currentNotif.total, 2);
    Serial.print("Mapped points (after): "); Serial.println(currentNotif.points, 2);
    Serial.print("Mapped value (increase): "); Serial.println(currentNotif.value, 2);
  } else {
    currentNotif.modelName = doc["modelName"].as<String>();
    currentNotif.value = doc["value"] | 0;
    currentNotif.total = doc["total"] | 0;
    currentNotif.points = doc["points"].as<float>();     // LEGGE COME FLOAT
  }
  
  currentNotif.timestamp = millis();
  currentNotif.active = true;
  
  bool updated = false;
  
  if (doc.containsKey("currentTotalDownloads")) {
    stats.totalDownloads = doc["currentTotalDownloads"];
    updated = true;
  }
  if (doc.containsKey("currentTotalPrints")) {
    stats.totalPrints = doc["currentTotalPrints"];
    updated = true;
  }
  if (doc.containsKey("currentTotalBoosts")) {
    stats.totalBoosts = doc["currentTotalBoosts"];
    updated = true;
  }
  if (doc.containsKey("currentTotalPoints")) {
    stats.totalPoints = doc["currentTotalPoints"].as<float>();  // LEGGE COME FLOAT
    updated = true;
  }
  
  if (updated) {
    stats.initialized = true;
    saveStats();
  }
  
  showNotification();
  server.send(200, "text/plain", "OK");
}