document.addEventListener('DOMContentLoaded', function () {
    // ESP32 elements
    const esp32EnabledSelect = document.getElementById('esp32-enabled');
    const esp32Section = document.getElementById('esp32-config');
    const esp32IpInput = document.getElementById('esp32-ip');
    const testEsp32Button = document.getElementById('test-esp32');
    const testNotificationButton = document.getElementById('test-notification');
    
    // Telegram elements
    const telegramEnabledSelect = document.getElementById('telegram-enabled');
    const telegramSection = document.getElementById('telegram-config');
    const telegramTokenInput = document.getElementById('telegram-token');
    const chatIdInput = document.getElementById('chat-id');
    
    // General elements
    const refreshIntervalSelect = document.getElementById('refresh-interval');
    const dailyReportSelect = document.getElementById('daily-report');
    const notificationTimeInput = document.getElementById('notification-time');
    const saveButton = document.getElementById('save-button');
    const statusDiv = document.getElementById('status');

    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + (isError ? 'error' : 'success');
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    function toggleESP32Config() {
        const enabled = esp32EnabledSelect.value === 'yes';
        esp32Section.style.display = enabled ? 'block' : 'none';
        if (!enabled) {
            esp32IpInput.value = '';
        }
    }

    function toggleTelegramConfig() {
        const enabled = telegramEnabledSelect.value === 'yes';
        telegramSection.style.display = enabled ? 'block' : 'none';
        if (!enabled) {
            telegramTokenInput.value = '';
            chatIdInput.value = '';
        }
    }

    // Load saved configuration
    chrome.storage.sync.get([
        'esp32_enabled',
        'esp32_ip',
        'telegram_enabled',
        'telegramToken',
        'chatId',
        'refreshInterval',
        'dailyReport',
        'dailyNotificationTime'
    ], function (config) {
        if (chrome.runtime.lastError) {
            console.error('Error loading configuration:', chrome.runtime.lastError);
            showStatus('Error loading configuration', true);
            return;
        }

        // ESP32
        esp32EnabledSelect.value = config.esp32_enabled || 'no';
        if (config.esp32_ip) esp32IpInput.value = config.esp32_ip;
        toggleESP32Config();

        // Telegram
        telegramEnabledSelect.value = config.telegram_enabled || 'no';
        if (config.telegramToken) telegramTokenInput.value = config.telegramToken;
        if (config.chatId) chatIdInput.value = config.chatId;
        toggleTelegramConfig();

        // General
        if (config.refreshInterval) refreshIntervalSelect.value = config.refreshInterval;
        if (config.dailyReport) dailyReportSelect.value = config.dailyReport;
        if (config.dailyNotificationTime) notificationTimeInput.value = config.dailyNotificationTime;
    });

    // Toggle handlers
    esp32EnabledSelect.addEventListener('change', toggleESP32Config);
    telegramEnabledSelect.addEventListener('change', toggleTelegramConfig);

    // Test ESP32 connection
    testEsp32Button.addEventListener('click', function() {
        const ip = esp32IpInput.value.trim();
        if (!ip) {
            showStatus('Please enter ESP32 IP address', true);
            return;
        }

        showStatus('Testing connection...');
        testEsp32Button.disabled = true;
        testEsp32Button.textContent = 'Testing...';

        chrome.runtime.sendMessage({
            action: "testESP32",
            ip: ip
        }, (response) => {
            if (response && response.success) {
                showStatus('ESP32 Connected Successfully!');
            } else {
                showStatus('Cannot reach ESP32. Check IP and network.', true);
            }
            
            testEsp32Button.disabled = false;
            testEsp32Button.textContent = 'Test Connection';
        });
    });

    // Test ESP32 notification
    testNotificationButton.addEventListener('click', function() {
        const ip = esp32IpInput.value.trim();
        if (!ip) {
            showStatus('Please enter ESP32 IP address', true);
            return;
        }

        showStatus('Sending test notification...');
        testNotificationButton.disabled = true;
        testNotificationButton.textContent = 'Sending...';

        chrome.runtime.sendMessage({
            action: "testESP32Notification",
            ip: ip
        }, (response) => {
            if (response && response.success) {
                showStatus('Test notification sent! Check ESP32 display');
            } else {
                showStatus('Failed to send test notification', true);
            }
            
            testNotificationButton.disabled = false;
            testNotificationButton.textContent = 'Test Notification';
        });
    });

    // Save configuration
    saveButton.addEventListener('click', function () {
        const esp32Enabled = esp32EnabledSelect.value;
        const esp32Ip = esp32IpInput.value.trim();
        const telegramEnabled = telegramEnabledSelect.value;
        const telegramToken = telegramTokenInput.value.trim();
        const chatId = chatIdInput.value.trim();
        const refreshInterval = parseInt(refreshIntervalSelect.value);
        const dailyReport = dailyReportSelect.value;
        const notificationTime = notificationTimeInput.value;

        // Validation
        if (esp32Enabled === 'no' && telegramEnabled === 'no') {
            showStatus('Enable at least one notification method', true);
            return;
        }

        if (esp32Enabled === 'yes' && !esp32Ip) {
            showStatus('Please enter ESP32 IP address', true);
            return;
        }

        if (esp32Enabled === 'yes') {
            const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (!ipPattern.test(esp32Ip)) {
                showStatus('Invalid ESP32 IP address format', true);
                return;
            }
        }

        if (telegramEnabled === 'yes' && (!telegramToken || !chatId)) {
            showStatus('Please enter Telegram Bot Token and Chat ID', true);
            return;
        }

        chrome.storage.sync.set({
            esp32_enabled: esp32Enabled,
            esp32_ip: esp32Ip,
            telegram_enabled: telegramEnabled,
            telegramToken: telegramToken,
            chatId: chatId,
            refreshInterval: refreshInterval,
            dailyReport: dailyReport,
            dailyNotificationTime: notificationTime
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving:', chrome.runtime.lastError);
                showStatus('Error saving configuration', true);
                return;
            }
            
            showStatus('Configuration saved successfully!');
            
            // Reload page after 2 seconds
            setTimeout(() => {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.reload(tabs[0].id);
                    }
                });
            }, 2000);
        });
    });

    // Handle daily report enable/disable
    dailyReportSelect.addEventListener('change', function() {
        notificationTimeInput.disabled = this.value === 'no';
    });
    
    // Set initial state
    notificationTimeInput.disabled = dailyReportSelect.value === 'no';
});