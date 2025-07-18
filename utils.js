function parseNumberOrDefault(value, defaultValue = 0) {
    if (value == null) return defaultValue;

    const str = String(value).replace(',', '.').trim();
    const num = parseFloat(str);

    return isNaN(num) ? defaultValue : num;
}

function parseMoney(input) {
    if (typeof input !== 'string') return NaN;
    
    const normalized = input.replace(/\s/g, ''); 
    
    return parseFloat(normalized);
}


function getRandom(min, max, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.floor((Math.random() * (max - min) + min) * factor) / factor;
}

function formatCurrency(number) {
    return number
        .toFixed(2) 
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); 
}

function style(el, options = {}) {
    if (!el) return;

    const apply = elem => {
        if (options.hide) elem.style.display = 'none';
        if (options.show) elem.style.display = '';
        if (options.color) elem.style.color = options.color;
        if (options.bg) elem.style.backgroundColor = options.bg;
        if (options.display) elem.style.display = options.display;
        if (options.css) Object.assign(elem.style, options.css);
        if (options.cssText) elem.style.cssText += options.cssText;
    };

    if (NodeList.prototype.isPrototypeOf(el) || Array.isArray(el)) {
        el.forEach(apply);
    } else {
        apply(el);
    }
}

// Fluent: s(el).color('white').bg('red').hide();
const s = el => ({
  color: c => (el.style.color = c, s(el)),
  bg: c => (el.style.backgroundColor = c, s(el)),
  hide: () => (el.style.display = 'none', s(el)),
  show: () => (el.style.display = '', s(el)),
});

function waitForElement(selector, options = {}) {
    const interval = options.interval ?? 1000;
    const timeout = options.timeout ?? 20000;
    const errorMsg = options.errorMsg || 'Element not found';

    return new Promise((resolve, reject) => {
        let timeoutId;

        const checkExist = setInterval(() => {
            const element = typeof selector === 'function'
                ? selector()
                : document.querySelector(selector);

            if (element) {
                clearInterval(checkExist);
                clearTimeout(timeoutId);
                resolve(element);
            }
        }, interval);

        timeoutId = setTimeout(() => {
            clearInterval(checkExist);
            reject(new Error(errorMsg));
        }, timeout);
    });
}

async function waitForContainer(selector, options = {}) {
    const label = options.label;
    const { onReady, logger, ...waitOptions } = options;
    
    if (label) {
        logger.log(`Waiting for container '${label}'...`);
    }

    try {
        const el = await waitForElement(selector, {
            ...waitOptions,
            errorMsg: waitOptions.errorMsg || `'${label}' not found!`
        });

         if (label) {
            logger.log(`Container '${label}' found.`);
        }

        if (typeof onReady === 'function') {
            onReady(el);
        }

        return el;

    } catch (error) {
        logger.error(`Error while waiting for the container ('${label}'):`, error);
    }
}
