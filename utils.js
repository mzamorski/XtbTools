function parseNumberOrDefault(value, defaultValue = 0) {
    if (value == null) return defaultValue;

    const str = String(value).replace(',', '.').trim();
    const num = parseFloat(str);

    return isNaN(num) ? defaultValue : num;
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

    // Obsługa pojedynczego elementu lub kolekcji
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

