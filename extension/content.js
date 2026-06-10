class SimpleMqttClient {
  constructor({ url, username, password, clientId }) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.encoder = new TextEncoder();
    this.socket = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url, ['mqtt']);
      const timeoutId = setTimeout(() => {
        socket.close();
        reject(new Error('MQTT connection timed out'));
      }, 8000);

      socket.binaryType = 'arraybuffer';
      socket.onopen = () => {
        socket.send(this.createConnectPacket());
      };
      socket.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('MQTT WebSocket connection failed'));
      };
      socket.onmessage = (event) => {
        const data = new Uint8Array(event.data);
        if (data[0] === 0x20 && data[1] === 0x02) {
          clearTimeout(timeoutId);
          const returnCode = data[3];
          if (returnCode === 0) {
            this.socket = socket;
            resolve();
          } else {
            socket.close();
            reject(new Error(`MQTT CONNACK failed with code ${returnCode}`));
          }
        }
      };
    });
  }

  publish(topic, payload, { retain = false } = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('MQTT socket is not connected');
    }

    this.socket.send(this.createPublishPacket(topic, payload, retain));
  }

  disconnect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(new Uint8Array([0xE0, 0x00]));
      this.socket.close();
    }
  }

  createConnectPacket() {
    const variableHeader = [
      ...this.encodeString('MQTT'),
      0x04,
      this.getConnectFlags(),
      0x00,
      0x3C
    ];

    const payload = [
      ...this.encodeString(this.clientId),
      ...(this.username ? this.encodeString(this.username) : []),
      ...(this.password ? this.encodeString(this.password) : [])
    ];

    return this.createPacket(0x10, [...variableHeader, ...payload]);
  }

  createPublishPacket(topic, payload, retain) {
    const body = [
      ...this.encodeString(topic),
      ...this.encoder.encode(payload)
    ];

    return this.createPacket(retain ? 0x31 : 0x30, body);
  }

  getConnectFlags() {
    let flags = 0x02; // clean session
    if (this.username) flags |= 0x80;
    if (this.password) flags |= 0x40;
    return flags;
  }

  createPacket(packetType, body) {
    return new Uint8Array([
      packetType,
      ...this.encodeRemainingLength(body.length),
      ...body
    ]);
  }

  encodeString(value) {
    const bytes = Array.from(this.encoder.encode(value));
    return [(bytes.length >> 8) & 0xFF, bytes.length & 0xFF, ...bytes];
  }

  encodeRemainingLength(length) {
    const encoded = [];
    do {
      let digit = length % 128;
      length = Math.floor(length / 128);
      if (length > 0) {
        digit |= 0x80;
      }
      encoded.push(digit);
    } while (length > 0);
    return encoded;
  }
}

class ValueMonitor {
  constructor() {
    this.esp32IP = '';
    this.esp32Enabled = false;
    this.telegramToken = '';
    this.chatId = '';
    this.telegramEnabled = false;
    this.mqttEnabled = false;
    this.mqttUrl = '';
    this.mqttUsername = '';
    this.mqttPassword = '';
    this.mqttPrefix = 'makerworld';
    this.mqttDeviceName = 'MakerWorld Monitor';
    this.previousValues = null;
    this.checkInterval = null;
    this.isChecking = false;
  }

  async loadPreviousValues() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['previousValues'], (result) => {
        if (result.previousValues) {
          console.log('Previous values loaded:', result.previousValues);
          this.previousValues = result.previousValues;
        }
        resolve();
      });
    });
  }

  async savePreviousValues(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ previousValues: values }, () => {
        console.log('Values saved to storage');
        resolve();
      });
    });
  }

  async loadMqttConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'mqtt_enabled',
        'mqtt_url',
        'mqtt_username',
        'mqtt_password',
        'mqtt_prefix',
        'mqtt_device_name'
      ], (config) => {
        this.mqttEnabled = config.mqtt_enabled === 'yes';
        this.mqttUrl = config.mqtt_url || '';
        this.mqttUsername = config.mqtt_username || '';
        this.mqttPassword = config.mqtt_password || '';
        this.mqttPrefix = this.sanitizeTopicPart(config.mqtt_prefix || 'makerworld');
        this.mqttDeviceName = config.mqtt_device_name || 'MakerWorld Monitor';
        resolve();
      });
    });
  }

  getRewardInterval(total) {
    let next = 100;
    if (total <= 50) {
      next = 10;
    } else if (total <= 500) {
      next = 25;
    } else if (total <= 1000) {
      next = 50;
    }
    return next;
  }

  nextRewardPoints(total) {
    const interval = this.getRewardInterval(total);
    const mod = total % interval;
    if (total === 0 || mod === 0) {
      return total + interval;
    }
    return total + (interval - mod);
  }

  calculateTotalPoints(downloads, prints) {
    return downloads + (prints * 2);
  }

  async sendViaBackground(endpoint, data) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.error(`Timeout: ${endpoint} took too long`);
        resolve(false);
      }, 15000);
      
      chrome.runtime.sendMessage({
        action: "sendToESP32",
        ip: this.esp32IP,
        endpoint: endpoint,
        data: data,
        method: 'POST'
      }, (response) => {
        clearTimeout(timeoutId);
        
        if (response && response.success) {
          console.log(`✅ Background relay success for ${endpoint}`);
          resolve(true);
        } else {
          console.error(`❌ Background relay failed for ${endpoint}:`, response?.error);
          resolve(false);
        }
      });
    });
  }

  async sendTelegramMessage(message) {
    if (!this.telegramEnabled || !this.telegramToken || !this.chatId) {
      return false;
    }

    try {
      console.log('Sending Telegram message:', message);
      const response = await fetch(`https://api.telegram.org/bot${this.telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: this.chatId, 
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      console.log('Telegram message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  async sendTelegramMessageWithPhoto(message, photoUrl) {
    if (!this.telegramEnabled || !this.telegramToken || !this.chatId) {
      return false;
    }

    if (!photoUrl) {
      return this.sendTelegramMessage(message);
    }

    try {
      const imageResponse = await fetch(photoUrl);
      if (!imageResponse.ok) {
        throw new Error(`Image download failed: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('caption', message);
      formData.append('photo', imageBlob, 'model_image.jpg');

      const response = await fetch(`https://api.telegram.org/bot${this.telegramToken}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Telegram Error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending photo:', error);
      return this.sendTelegramMessage(message);
    }
  }

  async publishToMqtt(currentValues) {
    if (!this.mqttEnabled || !this.mqttUrl) {
      return false;
    }

    const client = new SimpleMqttClient({
      url: this.mqttUrl,
      username: this.mqttUsername,
      password: this.mqttPassword,
      clientId: `makerworld_monitor_${Date.now()}`
    });

    try {
      const stateTopic = `${this.mqttPrefix}/state`;
      const availabilityTopic = `${this.mqttPrefix}/status`;
      await client.connect();

      for (const message of this.buildHomeAssistantDiscoveryMessages(stateTopic, availabilityTopic)) {
        client.publish(message.topic, JSON.stringify(message.payload), { retain: true });
      }

      client.publish(availabilityTopic, 'online', { retain: true });
      client.publish(stateTopic, JSON.stringify({
        total_downloads: currentValues.totalDownloads || 0,
        total_prints: currentValues.totalPrints || 0,
        total_boosts: currentValues.totalBoosts || 0,
        points: Math.round(currentValues.points || 0),
        account_name: currentValues.accountName || '',
        last_updated: new Date(currentValues.timestamp || Date.now()).toISOString(),
        timestamp: currentValues.timestamp || Date.now()
      }), { retain: true });

      console.log('MQTT state published successfully');
      return true;
    } catch (error) {
      console.error('MQTT publish failed:', error);
      return false;
    } finally {
      client.disconnect();
    }
  }

  buildHomeAssistantDiscoveryMessages(stateTopic, availabilityTopic) {
    const objectId = this.sanitizeTopicPart(this.mqttDeviceName).replace(/\//g, '_');
    const device = {
      identifiers: [`makerworld_${objectId}`],
      name: this.mqttDeviceName,
      manufacturer: 'MakerWorld',
      model: 'Browser Extension'
    };

    const base = {
      state_topic: stateTopic,
      availability_topic: availabilityTopic,
      payload_available: 'online',
      payload_not_available: 'offline',
      device
    };

    const sensors = [
      {
        key: 'total_downloads',
        name: 'Downloads',
        icon: 'mdi:download',
        stateClass: 'total_increasing'
      },
      {
        key: 'total_prints',
        name: 'Prints',
        icon: 'mdi:printer-3d',
        stateClass: 'total_increasing'
      },
      {
        key: 'total_boosts',
        name: 'Boosts',
        icon: 'mdi:rocket-launch',
        stateClass: 'total_increasing'
      },
      {
        key: 'points',
        name: 'Points',
        icon: 'mdi:star',
        stateClass: 'measurement'
      }
    ];

    return sensors.map((sensor) => ({
      topic: `homeassistant/sensor/${objectId}_${sensor.key}/config`,
      payload: {
        ...base,
        name: `${this.mqttDeviceName} ${sensor.name}`,
        unique_id: `${objectId}_${sensor.key}`,
        object_id: `${objectId}_${sensor.key}`,
        icon: sensor.icon,
        state_class: sensor.stateClass,
        value_template: `{{ value_json.${sensor.key} }}`
      }
    }));
  }

  sanitizeTopicPart(value) {
    return String(value || 'makerworld')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'makerworld';
  }

  async syncInitialStats() {
    if (!this.esp32Enabled || !this.esp32IP) {
        console.log('ESP32 disabled, skipping sync');
        return true;
    }

    const currentValues = this.getCurrentValues();
    if (!currentValues) {
        console.error('Cannot get current values for sync');
        return false;
    }

    const totalDownloads = currentValues.totalDownloads || 0;
    const totalPrints = currentValues.totalPrints || 0;
    const totalBoosts = currentValues.totalBoosts || 0;
    const totalPoints = currentValues.points || 0;
    const accountName = currentValues.accountName || '';  // AGGIUNTO

    try {
        console.log('Syncing initial stats to ESP32:', {
            accountName,  // AGGIUNTO
            totalDownloads,
            totalPrints,
            totalBoosts,
            totalPoints
        });

        const success = await this.sendViaBackground('sync', {
            accountName,  // AGGIUNTO
            totalDownloads,
            totalPrints,
            totalBoosts,
            totalPoints
        });

        if (success) {
            console.log('Initial stats synced successfully');
            return true;
        } else {
            throw new Error('Background relay failed');
        }
    } catch (error) {
        console.error('Error syncing initial stats:', error);
        return false;
    }
  }

  async sendNotifications(data, message, imageUrl = null) {
    const promises = [];

    if (this.esp32Enabled && this.esp32IP) {
      promises.push(this.sendToESP32(data));
    }

    if (this.telegramEnabled && this.telegramToken && this.chatId) {
      if (imageUrl) {
        promises.push(this.sendTelegramMessageWithPhoto(message, imageUrl));
      } else {
        promises.push(this.sendTelegramMessage(message));
      }
    }

    await Promise.all(promises);
  }

  async sendToESP32(data) {
    if (!this.esp32Enabled || !this.esp32IP) {
        return false;
    }

    const currentValues = this.getCurrentValues();
    if (currentValues) {
        data.currentTotalDownloads = currentValues.totalDownloads || 0;
        data.currentTotalPrints = currentValues.totalPrints || 0;
        data.currentTotalBoosts = currentValues.totalBoosts || 0;
        data.currentTotalPoints = currentValues.points || 0;
    }

    console.log('Sending to ESP32:', data);
    return await this.sendViaBackground('notify', data);
  }

  getCurrentValues() {
    try {
        console.log('=== STARTING DATA EXTRACTION ===');
        
        const currentValues = {
            models: {},
            points: 0,
            accountName: '',  // AGGIUNTO
            timestamp: Date.now()
        };

        // 0. ESTRAZIONE NOME ACCOUNT (NUOVO)
        try {
            const accountElement = document.querySelector('.mw-css-1v58zuy');
            if (accountElement) {
                currentValues.accountName = accountElement.textContent.trim();
                console.log('Account name extracted:', currentValues.accountName);
            }
        } catch (accountError) {
            console.error('Error extracting account name:', accountError);
        }

        // 1. ESTRAZIONE PUNTI
        try {
            const pointsSelectors = [
                '.mw-css-1541sxf',
                '[class*="points"]',
                '[class*="reward"]'
            ];
            
            let pointsElement = null;
            for (const selector of pointsSelectors) {
                pointsElement = document.querySelector(selector);
                if (pointsElement) break;
            }
            
            if (pointsElement) {
                const pointsText = pointsElement.textContent || pointsElement.innerText;
                const pointsValue = this.parsePointsValue(pointsText);
                
                if (Number.isFinite(pointsValue)) {
                    currentValues.points = pointsValue;
                    console.log('Points extracted:', currentValues.points);
                }
            }
        } catch (pointsError) {
            console.error('Error extracting points:', pointsError);
        }

        // 2. ESTRAZIONE STATISTICHE TOTALI
        const statElements = document.querySelectorAll('.mw-css-13aylfg');
        
        if (statElements.length >= 4) {
            const boostText = statElements[0]?.textContent?.trim() || '0';
            const likeText = statElements[1]?.textContent?.trim() || '0';
            const downloadText = statElements[2]?.textContent?.trim() || '0';
            const printText = statElements[3]?.textContent?.trim() || '0';
            
            currentValues.totalBoosts = this.parseNumber(boostText);
            currentValues.totalLikes = this.parseNumber(likeText);
            currentValues.totalDownloads = this.parseNumber(downloadText);
            currentValues.totalPrints = this.parseNumber(printText);
            
            console.log('Total stats extracted:', {
                boosts: currentValues.totalBoosts,
                downloads: currentValues.totalDownloads,
                prints: currentValues.totalPrints
            });
        }

        // 3. ESTRAZIONE MODELLI SINGOLI
        const modelElements = document.querySelectorAll('[data-trackid]');
        
        modelElements.forEach((element) => {
            const modelId = element.getAttribute('data-trackid');
            
            const modelTitle = element.querySelector('h3.translated-text') || 
                             element.querySelector('h3');
            const name = modelTitle?.textContent?.trim() || `Model-${modelId}`;
            
            const imageElement = element.querySelector('img');
            const imageUrl = imageElement?.getAttribute('src') || '';
            
            let boosts = 0, downloads = 0, prints = 0;
            
            const metricsContainer = element.querySelector('.mw-css-xlgty3');
            
            if (metricsContainer) {
                const allSpans = metricsContainer.querySelectorAll('span');
                const lastThree = Array.from(allSpans).slice(-3);
                
                if (lastThree.length >= 3) {
                    boosts = this.parseNumber(lastThree[0]?.textContent || '0');
                    downloads = this.parseNumber(lastThree[1]?.textContent || '0');
                    prints = this.parseNumber(lastThree[2]?.textContent || '0');
                }
            }
            
            currentValues.models[modelId] = {
                name,
                boosts,
                downloads,
                prints,
                imageUrl
            };
        });

        console.log('Extraction complete:', {
            accountName: currentValues.accountName,  // AGGIUNTO
            points: currentValues.points,
            totalDownloads: currentValues.totalDownloads,
            totalPrints: currentValues.totalPrints,
            modelsCount: Object.keys(currentValues.models).length
        });
        
        return currentValues;
    } catch (error) {
        console.error('Error in getCurrentValues:', error);
        return null;
    }
  }

  parseNumber(text) {
    if (!text) return 0;
    text = text.trim().toLowerCase();
    
    if (text.includes('k')) {
      const base = parseFloat(text.replace('k', ''));
      return Math.round(base * 1000);
    }
    
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  }

  parsePointsValue(text) {
    if (!text) return 0;

    const match = String(text).match(/\d[\d\s,.]*/);
    if (!match) return 0;

    let value = match[0].replace(/\s/g, '');
    const hasComma = value.includes(',');
    const hasDot = value.includes('.');

    if (hasComma && hasDot) {
      const decimalSeparator = value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.';
      const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
      value = value
        .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
        .replace(decimalSeparator, '.');
    } else if (hasComma) {
      value = /^\d{1,3}(,\d{3})+$/.test(value)
        ? value.replace(/,/g, '')
        : value.replace(',', '.');
    } else if (hasDot && /^\d{1,3}(\.\d{3})+$/.test(value)) {
      value = value.replace(/\./g, '');
    }

    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async getDailySummary() {
    const currentValues = this.getCurrentValues();
    if (!currentValues) {
      console.error('Unable to get current values');
      return null;
    }

    const previousDay = await new Promise((resolve) => {
      chrome.storage.local.get(['dailyStats'], (result) => {
        if (result.dailyStats && (Date.now() - result.dailyStats.timestamp) <= 24 * 60 * 60 * 1000) {
          resolve(result.dailyStats);
        } else {
          resolve(null);
        }
      });
    });

    chrome.storage.local.set({
      dailyStats: {
        models: currentValues.models,
        points: currentValues.points,
        timestamp: Date.now()
      }
    });

    if (!previousDay) {
      return {
        dailyDownloads: 0,
        dailyPrints: 0,
        points: currentValues.points,
        pointsGained: 0,
        top5Downloads: [],
        top5Prints: []
      };
    }

    const modelChanges = {};
    for (const [id, current] of Object.entries(currentValues.models)) {
      const previous = previousDay.models[id] || { downloads: 0, prints: 0 };
      if (current.downloads > previous.downloads || current.prints > previous.prints) {
        modelChanges[id] = {
          name: current.name,
          downloadsGained: current.downloads - previous.downloads,
          printsGained: current.prints - previous.prints
        };
      }
    }

    const dailyDownloads = Object.values(modelChanges)
      .reduce((sum, model) => sum + model.downloadsGained, 0);
    const dailyPrints = Object.values(modelChanges)
      .reduce((sum, model) => sum + model.printsGained, 0);

    const top5Downloads = Object.values(modelChanges)
      .filter(m => m.downloadsGained > 0)
      .sort((a, b) => b.downloadsGained - a.downloadsGained)
      .slice(0, 5);

    const top5Prints = Object.values(modelChanges)
      .filter(m => m.printsGained > 0)
      .sort((a, b) => b.printsGained - a.printsGained)
      .slice(0, 5);

    return {
      dailyDownloads,
      dailyPrints,
      points: currentValues.points,
      pointsGained: currentValues.points - previousDay.points,
      top5Downloads,
      top5Prints
    };
  }

  scheduleDailyNotification() {
    chrome.storage.sync.get(['dailyReport', 'dailyNotificationTime'], (config) => {
      const dailyReport = config.dailyReport || 'yes';
      if (dailyReport === 'no') {
        console.log('Daily report disabled');
        return;
      }

      const dailyTime = config.dailyNotificationTime || '12:00';
      const [hour, minute] = dailyTime.split(':').map(Number);

      const now = new Date();
      const nextNotification = new Date();
      nextNotification.setHours(hour, minute, 0, 0);

      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      const delay = nextNotification - now;
      console.log(`Daily report scheduled for: ${nextNotification}`);

      setTimeout(async () => {
        const summary = await this.getDailySummary();
        if (summary) {
          const data = {
            type: 'daily_summary',
            dailyDownloads: summary.dailyDownloads,
            dailyPrints: summary.dailyPrints,
            points: summary.points,
            pointsGained: summary.pointsGained,
            top5Downloads: summary.top5Downloads,
            top5Prints: summary.top5Prints
          };

          const telegramMessage = `
📊 24-Hour Summary:
- New Downloads: ${summary.dailyDownloads}
- New Prints: ${summary.dailyPrints}
- Points: ${summary.points} (${summary.pointsGained >= 0 ? '+' : ''}${summary.pointsGained})

🏆 Top Downloaded:
${summary.top5Downloads.map((m, i) => `${i + 1}. ${m.name}: +${m.downloadsGained}`).join('\n') || 'No new downloads'}

🖨 Top Printed:
${summary.top5Prints.map((m, i) => `${i + 1}. ${m.name}: +${m.printsGained}`).join('\n') || 'No new prints'}`;

          await this.sendNotifications(data, telegramMessage);
        }

        this.scheduleDailyNotification();
      }, delay);
    });
  }

  async checkAndNotify() {
    if (this.isChecking) {
      console.log('Check already in progress, skipping...');
      return;
    }
    this.isChecking = true;

    try {
      const currentValues = this.getCurrentValues();
      if (!currentValues) {
        console.log('No current values found');
        return;
      }

      await this.publishToMqtt(currentValues);

      if (!this.previousValues) {
        await this.loadPreviousValues();
      }

      if (!this.previousValues) {
        console.log('First run, saving initial values');
        this.previousValues = currentValues;
        await this.savePreviousValues(currentValues);
        return;
      }

      // Points change
      if (currentValues.points > this.previousValues.points) {
        const data = {
          type: 'points',
          before: this.previousValues.points,
          after: currentValues.points,
          increase: currentValues.points - this.previousValues.points
        };

        const message = `
⭐ New Points!
Before: ${this.previousValues.points}
After: ${currentValues.points} 
Increase: +${(currentValues.points - this.previousValues.points).toFixed(1)}`;

        await this.sendNotifications(data, message);
      }

      // Check each model
      for (const [id, current] of Object.entries(currentValues.models)) {
        const previous = this.previousValues.models[id];
        if (!previous) continue;

        const previousTotal = this.calculateTotalPoints(previous.downloads, previous.prints);
        const currentTotal = this.calculateTotalPoints(current.downloads, current.prints);
        const nextReward = this.nextRewardPoints(currentTotal);
        const pointsToNext = nextReward - currentTotal;
        const rewardInterval = this.getRewardInterval(currentTotal);

        // Boosts
        if (current.boosts > previous.boosts) {
          const data = {
            type: 'boost',
            modelName: current.name,
            value: current.boosts - previous.boosts,
            total: current.boosts,
            imageUrl: current.imageUrl
          };

          const message = `
⚡ New boosts for: ${current.name}
Before: ${previous.boosts}
After: ${current.boosts}
Increase: +${current.boosts - previous.boosts}`;

          await this.sendNotifications(data, message, current.imageUrl);
        }

        // Downloads
        if (current.downloads > previous.downloads) {
          const newPoints = current.downloads - previous.downloads;
          const data = {
            type: 'download',
            modelName: current.name,
            value: current.downloads - previous.downloads,
            total: current.downloads,
            points: newPoints,
            totalPoints: currentTotal,
            nextReward: nextReward,
            pointsToNext: pointsToNext,
            imageUrl: current.imageUrl
          };

          const message = `
📈 New downloads for: ${current.name}

Total: ${current.downloads}
Increase: +${current.downloads - previous.downloads}

📊 Points Status:
Total Points: ${currentTotal} (+${newPoints})
Next Reward: ${nextReward} (${pointsToNext} points needed)
Reward Interval: every ${rewardInterval} points`;

          await this.sendNotifications(data, message, current.imageUrl);
        }

        // Prints
        if (current.prints > previous.prints) {
          const newPoints = (current.prints - previous.prints) * 2;
          const data = {
            type: 'print',
            modelName: current.name,
            value: current.prints - previous.prints,
            total: current.prints,
            points: newPoints,
            totalPoints: currentTotal,
            nextReward: nextReward,
            pointsToNext: pointsToNext,
            imageUrl: current.imageUrl
          };

          const message = `
🖨 New prints for: ${current.name}

Total: ${current.prints}
Increase: +${current.prints - previous.prints}

📊 Points Status:
Total Points: ${currentTotal} (+${newPoints})
Next Reward: ${nextReward} (${pointsToNext} points needed)
Reward Interval: every ${rewardInterval} points`;

          await this.sendNotifications(data, message, current.imageUrl);
        }
      }

      this.previousValues = currentValues;
      await this.savePreviousValues(currentValues);

    } catch (error) {
      console.error('Error during check:', error);
    } finally {
      this.isChecking = false;
    }
  }

  start() {
    console.log('Starting monitor...');
    
    chrome.storage.sync.get([
      'esp32_enabled',
      'esp32_ip',
      'telegram_enabled',
      'telegramToken',
      'chatId',
      'refreshInterval',
      'dailyReport'
    ], async (config) => {
      this.esp32Enabled = config.esp32_enabled === 'yes';
      this.esp32IP = config.esp32_ip || '';

      this.telegramEnabled = config.telegram_enabled === 'yes';
      this.telegramToken = config.telegramToken || '';
      this.chatId = config.chatId || '';

      await this.loadMqttConfig();

      if (!this.esp32Enabled && !this.telegramEnabled && !this.mqttEnabled) {
        console.error('No notification or publishing method is enabled. Enable ESP32, Telegram, or MQTT.');
        return;
      }

      console.log('Configuration:', {
        esp32: this.esp32Enabled ? `Enabled (${this.esp32IP})` : 'Disabled',
        telegram: this.telegramEnabled ? 'Enabled' : 'Disabled',
        mqtt: this.mqttEnabled ? `Enabled (${this.mqttUrl})` : 'Disabled'
      });
      
      const refreshInterval = config.refreshInterval || 900000;

      if (this.esp32Enabled) {
        let syncSuccess = false;
        let attempts = 0;
        while (!syncSuccess && attempts < 3) {
          syncSuccess = await this.syncInitialStats();
          attempts++;
          if (!syncSuccess && attempts < 3) {
            console.log(`Sync attempt ${attempts} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      await this.checkAndNotify();

      this.checkInterval = setInterval(() => {
        console.log('Refreshing page...');
        window.location.reload();
      }, refreshInterval);

      if (config.dailyReport !== 'no') {
        this.scheduleDailyNotification();
      }

      console.log(`Monitor started, refresh every ${refreshInterval/60000} minutes`);
    });
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
    console.log('Monitor stopped');
  }
}

console.log('Initializing monitor...');
const monitor = new ValueMonitor();
monitor.start();