// Z3R Simulator Offline Integration Script
// Adds Generate Seed, Load Spoiler Log, and other UI enhancements
// Designed to work with the compiled Angular app output

// ---- UI Enhancement Functions ----

function addGenerateSeedButtonToNavbar() {
    var navbarNav = document.querySelector('.navbar .nav.navbar-nav');
    if (!navbarNav) return;

    var existingButton = document.getElementById('generate-seed-button');
    if (existingButton && existingButton.onclick) return;

    var li = document.createElement('li');
    var button = document.createElement('a');
    button.type = 'button';
    button.id = 'generate-seed-button';
    button.onclick = function() { generateNewSeed(); };
    button.innerHTML = '<i class="fa fa-magic"></i> Generate Seed';
    li.appendChild(button);

    if (navbarNav.firstChild) {
        navbarNav.insertBefore(li, navbarNav.firstChild);
    } else {
        navbarNav.appendChild(li);
    }
}

function addSpoilerLogButtonToNavbar() {
    var existingButton = document.getElementById('spoiler-log-input-navbar');
    if (existingButton) return;

    var navbarNav = document.querySelector('.navbar .nav.navbar-nav');
    if (!navbarNav) return;

    var li = document.createElement('li');
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.id = 'spoiler-log-input-navbar';
    hiddenInput.accept = '.json,.txt';
    hiddenInput.style.display = 'none';

    var button = document.createElement('a');
    button.type = 'button';
    button.onclick = function() { document.getElementById('spoiler-log-input-navbar').click(); };
    button.innerHTML = '<i class="fa fa-upload"></i> Load Spoiler Log';

    li.appendChild(hiddenInput);
    li.appendChild(button);

    if (navbarNav.firstChild) {
        navbarNav.insertBefore(li, navbarNav.firstChild);
    } else {
        navbarNav.appendChild(li);
    }
}

function addFileBehavior() {
    var input = document.getElementById('spoiler-log-input-navbar');
    if (!input) return;
    input.addEventListener('change', async function(event) {
        var file = event.target.files[0];
        if (file) {
            try {
                console.log('📁 Loading spoiler log file:', file.name);

                var seed = null;
                var fileName = file.name;
                var lastUnderscoreIndex = fileName.lastIndexOf('_');
                var extensionIndex = fileName.lastIndexOf('.');

                if (lastUnderscoreIndex !== -1 && extensionIndex !== -1 && lastUnderscoreIndex < extensionIndex) {
                    seed = fileName.substring(lastUnderscoreIndex + 1, extensionIndex);
                    console.log('🔑 Extracted seed from file name:', seed);
                }

                var text = await file.text();
                var spoilerLogData = JSON.parse(text);

                if (seed) {
                    localStorage.setItem("seedHash", seed);
                }

                window.saveSpoilerLogToLocalStorage(spoilerLogData);
                var itemArray = await window.loadAndGenerateItemArray();
                localStorage.setItem("itemArray", itemArray?.join(""));

                showSuccessNotification('Spoiler log successfully loaded! Reloading page...');

                // Reload the page so Angular picks up the new localStorage data via SeedService
                setTimeout(function() {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error('❌ Error loading spoiler log:', error);
                alert('Error loading spoiler log file. Please check the console for details.');
            }
        }
    });
}

function addSeedGenerationUI() {
    // Skip form button injection - Angular handles its own Play button state
    // We only add the seed hash display area
    if (document.getElementById('seed-hash-display')) return;

    var form = document.querySelector('form.form-horizontal');
    if (!form) return;

    var playButtonGroup = form.querySelector('.col-sm-offset-4.col-sm-8');
    if (!playButtonGroup) return;

    var seedHashDiv = document.createElement('div');
    seedHashDiv.id = 'seed-hash-display';
    seedHashDiv.className = 'alert alert-info';
    seedHashDiv.style.display = 'none';
    seedHashDiv.style.marginBottom = '10px';
    seedHashDiv.innerHTML = '<strong>Generated Seed:</strong> <span id="seed-hash-text"></span>';
    playButtonGroup.parentNode.insertBefore(seedHashDiv, playButtonGroup);
}

function updateSeedHashDisplay(hash) {
    var hashDisplay = document.getElementById('seed-hash-display');
    var hashText = document.getElementById('seed-hash-text');
    if (hashDisplay && hashText && hash) {
        hashText.textContent = 'https://alttpr.com/en/h/' + hash;
        hashDisplay.style.display = 'block';
    }
}

function addUiElements() {
    addGenerateSeedButtonToNavbar();
    addSpoilerLogButtonToNavbar();
    addWarningBanner();
    addSeedGenerationUI();
}

function addWarningBanner() {
    var existingBanner = document.querySelector('.warning-banner');
    if (existingBanner) return;

    var navbar = document.querySelector('nav.navbar');
    if (!navbar) return;

    var banner = document.createElement('div');
    banner.className = 'alert alert-warning warning-banner';
    banner.setAttribute('role', 'alert');
    banner.style.margin = '0';
    banner.style.borderRadius = '0';
    banner.innerHTML = [
        '<strong>⚠️ Warning:</strong>',
        '</br>',
        'The settings on this page are currently non-functional.',
        'They will be either removed or fixed in a future update.',
        'For now, only the <strong>Overworld Simple/Advanced toggle</strong> has any effect.',
        '<hr>',
        'To start playing, either click Generate Seed or upload a spoiler log',
        'from <a href="https://alttpr.com/en/randomizer" target="_blank">alttpr.com</a>',
        'via the Load Spoiler button in the navbar',
        '</br>',
        'Generate Seed will generate a Standard world seed with default settings,',
        'you can generate seed no more then 250 times per day'
    ].join(' ');

    navbar.parentNode.insertBefore(banner, navbar.nextSibling);
}

// ---- Form Values Extraction ----

function getFormValues() {
    try {
        var form = document.querySelector('form.form-horizontal');
        if (!form) {
            console.warn('Form not found');
            return null;
        }

        var getRadioValue = function(name) {
            var radios = form.querySelectorAll('input[name="' + name + '"]:checked, label[name="' + name + '"].active');
            if (radios.length > 0) {
                return radios[0].value || radios[0].getAttribute('btnradio');
            }
            return null;
        };

        var getSelectValue = function(id) {
            var select = form.querySelector('#' + id);
            return select ? select.value : null;
        };

        return {
            itemPlacementSelected: getRadioValue('basic-place-button') || getRadioValue('advanced-place-button') || 'advanced',
            dungeonItemsSelected: getRadioValue('no-di-button') || getRadioValue('mc-button') || getRadioValue('mcs-button') || getRadioValue('keysanity-button') || 'standard',
            accessibilitySelected: getRadioValue('full-inv-button') || getRadioValue('full-loc-button') || getRadioValue('beatable-button') || 'items',
            goalSelected: getRadioValue('ganon-button') || getRadioValue('fast-ganon-button') || getRadioValue('alldungeons-button') || getRadioValue('pedestal-button') || getRadioValue('triforce-button') || 'ganon',
            openTowerSelected: getSelectValue('open-tower-mode') || '7',
            openGanonSelected: getSelectValue('open-ganon-mode') || '7',
            modeSelected: getRadioValue('standard-button') || getRadioValue('open-button') || getRadioValue('inverted-button') || 'open',
            enemizerSelected: getRadioValue('no-enemy-button') || getRadioValue('simple-button') || getRadioValue('full-button') || getRadioValue('chaos-button') || 'none',
            hintsSelected: getRadioValue('with-hints-button') || getRadioValue('no-hints-button') || 'on',
            swordsSelected: getRadioValue('randomized-button') || getRadioValue('assured-button') || getRadioValue('swordless-button') || 'randomized'
        };
    } catch (error) {
        console.warn('Error reading form values:', error);
        return null;
    }
}

// ---- Seed Generation via Proxy ----

async function generateNewSeed() {
    var spoilerData = null;

    try {
        console.log('🎲 Generating new seed...');

        var navbarButton = document.getElementById('generate-seed-button');

        var loadingHTML = '<i class="fa fa-spinner fa-spin"></i> Generating...';

        if (navbarButton) {
            navbarButton.innerHTML = loadingHTML;
            navbarButton.style.pointerEvents = 'none';
        }

        var proxyUrl = 'https://z3r-proxy.derpaholicrex.workers.dev';
        var fullUrl = proxyUrl + '/api/randomizer';

        var formValues = getFormValues();

        var seedParams = {
            glitches: "none",
            item_placement: formValues?.itemPlacementSelected || "advanced",
            dungeon_items: formValues?.dungeonItemsSelected || "standard",
            accessibility: formValues?.accessibilitySelected || "items",
            goal: formValues?.goalSelected || "ganon",
            crystals: {
                ganon: formValues?.openGanonSelected || "7",
                tower: formValues?.openTowerSelected || "7"
            },
            mode: formValues?.modeSelected || "open",
            entrances: "none",
            hints: formValues?.hintsSelected || "on",
            weapons: formValues?.swordsSelected || "randomized",
            item: { pool: "normal", functionality: "normal" },
            tournament: false,
            spoilers: "on",
            lang: "en",
            enemizer: {
                boss_shuffle: formValues?.enemizerSelected || "none",
                enemy_shuffle: "none",
                enemy_damage: "default",
                enemy_health: "default"
            }
        };

        console.log('📡 Calling alttpr.com API via OCI CORS proxy...');

        var response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seedParams)
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait before trying again.');
            }
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        spoilerData = await response.json();
        console.log('✅ Seed generated successfully!', spoilerData);

        window.saveSpoilerLogToLocalStorage(spoilerData.spoiler);
        localStorage.setItem("seedHash", spoilerData?.hash);

        var itemArray = await window.loadAndGenerateItemArray();
        console.log('📊 Item array generated:', itemArray?.length, 'locations');
        localStorage.setItem("itemArray", itemArray?.join(""));

        showSuccessNotification('New seed generated successfully! 🎉 Reloading page...');

        // Reload the page so Angular picks up the new localStorage data via SeedService
        setTimeout(function() {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('❌ Seed generation failed:', error);
        showErrorNotification('Failed to generate seed: ' + error.message);
    } finally {
        var navbarButton = document.getElementById('generate-seed-button');
        if (navbarButton) {
            navbarButton.innerHTML = '<i class="fa fa-magic"></i> Generate Seed';
            navbarButton.style.pointerEvents = 'auto';
        }
    }
}

// ---- Notification Functions ----

function showSuccessNotification(message) {
    var existingNotification = document.querySelector('.success-notification');
    if (existingNotification) existingNotification.remove();

    var notification = document.createElement('div');
    notification.className = 'alert alert-success success-notification';
    notification.setAttribute('role', 'alert');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.innerHTML = '<strong>Success:</strong> ' + message;

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'close';
    closeBtn.setAttribute('data-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
    closeBtn.onclick = function() { notification.remove(); };
    notification.appendChild(closeBtn);

    document.body.appendChild(notification);

    setTimeout(function() {
        if (notification.parentNode) notification.remove();
    }, 5000);
}

function showErrorNotification(message) {
    var existingNotification = document.querySelector('.error-notification');
    if (existingNotification) existingNotification.remove();

    var notification = document.createElement('div');
    notification.className = 'alert alert-danger error-notification';
    notification.setAttribute('role', 'alert');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    notification.innerHTML = '<strong>Error:</strong> ' + message;

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'close';
    closeBtn.setAttribute('data-dismiss', 'alert');
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
    closeBtn.onclick = function() { notification.remove(); };
    notification.appendChild(closeBtn);

    document.body.appendChild(notification);

    setTimeout(function() {
        if (notification.parentNode) notification.remove();
    }, 8000);
}

// ---- Initialization ----

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Z3R Simulator Offline Integration loaded');

    // Retry UI injection multiple times with increasing delays to catch Angular bootstrap
    var retryCount = 0;
    var maxRetries = 20;

    function tryInject() {
        retryCount++;
        var navbar = document.querySelector('.navbar .nav.navbar-nav');
        if (navbar) {
            console.log('[Integration] Angular navbar found, injecting UI (attempt ' + retryCount + ')');
            addUiElements();
            setTimeout(function() {
                addFileBehavior();
                addSeedGenerationUI();
            }, 500);
        } else if (retryCount < maxRetries) {
            setTimeout(tryInject, 500);
        } else {
            console.warn('[Integration] Failed to find Angular navbar after ' + maxRetries + ' attempts');
        }
    }

    tryInject();
});