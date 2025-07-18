let settings = {
	appFullName: "'XTB Tools'",
	appName: "XtbTools",
	appVersion: "1.1",
	appShortName: "XTBT",

	enableExtension: true,

    isFakeProfitEnabled: false,
    isNegativeProfitHidden: true,
    isAutoCollapseEnabled: true,
    labelMap: new Map(),
    hiddenMarketTabs: [],

    fakeProfit: { min: 190000, max: 200000 }
}

let globals = {
    mainContainer: null,
    marketTabsContainer: null,
	portfolioContainer: null,
    balanceContainer: null,
	profitContainer: null
}

let hasCollapsedOnce = false;
let rowFilter = createRowFilter();
let rowMarker = createRowMarker();

const logger = new Logger(settings.appShortName, 'warn');

// Przy inicjalizacji (wczytaniu ustawień)
chrome.storage.sync.get([
    'selectedFilter', 'selectedMarker',
    'isFakeProfitEnabled', 'isNegativeProfitHidden', 'isAutoCollapseEnabled', 
    'accountLabelsText', 'hiddenMarketTabsText'
], (data) => {
    const filterType = data.selectedFilter || RowFilterType.Empty.value;
    const markerType = data.selectedMarker || RowMarkerType.Empty.value;

    rowFilter = RowFilterFactory.create(filterType);
    rowMarker = RowMarkerFactory.create(markerType);

    settings.isFakeProfitEnabled = !!data.isFakeProfitEnabled;
    settings.isNegativeProfitHidden = !!data.isNegativeProfitHidden;
    settings.isAutoCollapseEnabled = !!data.isAutoCollapseEnabled;
    settings.labelMap = parseAccountLabelMap(data.accountLabelsText ?? '');
    settings.hiddenMarketTabs = parseHiddenMarketTabs(data.hiddenMarketTabsText ?? '');

    logger.debug("Settings: ", settings);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.debug("Message: ", message);

    if (message.type === 'settingsChanged') {
        logger.log("Otrzymano aktualizację ustawień:", message);

        rowFilter = createRowFilter(message.selectedFilter);
        rowMarker = createRowMarker(message.selectedMarker);

        settings.isFakeProfitEnabled = !!message.isFakeProfitEnabled;
        settings.isNegativeProfitHidden = !!message.isNegativeProfitHidden;
        settings.isAutoCollapseEnabled = !!message.isAutoCollapseEnabled;
        settings.labelMap = parseAccountLabelMap(message.accountLabelsText ?? '');
        settings.hiddenMarketTabs = parseHiddenMarketTabs(message.hiddenMarketTabsText ?? '');

        handlePortfolioRows(globals.portfolioContainer);
        handleProfit();
        handleBalance();
        handleMain();
        handleMarketTabs()
    }
});

function createRowFilter(name) {
    return RowFilterFactory.create(name);
}

function createRowMarker(name) {
    return RowMarkerFactory.create(name)
}

function parseAccountLabelMap(text) {
  const map = new Map();
  text.split('\n').forEach(line => {
    const [login, label] = line.split(':').map(x => x?.trim());
    if (login && label) {
      map.set(login, label);
    }
  });
  return map;
}

function parseHiddenMarketTabs(text) {
    return text
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
}

function setAccountLabel(accountNode) {
    const serverSpan = accountNode.querySelector('.xs-account-label-server-part');
    const loginSpan = accountNode.querySelector('.xs-account-label-login-part');

    if (serverSpan) {
        const serverType = serverSpan.textContent;

        if (serverType === 'REAL') {
            serverSpan.style.setProperty('color', 'red');
        }
        else {
            serverSpan.style.setProperty('color', 'green');
        }
    }

    if (loginSpan) {
        const login = loginSpan.textContent;
        const label = settings.labelMap.get(login);

        if (label && !loginSpan.textContent.includes(label)) {
            loginSpan.textContent += ` — ${label}`;
        }
    }
}

function handleMain(container) {
    container = container || globals.mainContainer;

    const comboBoxNode = container.querySelector('xs-combobox');
    if (!comboBoxNode) {
        logger.warn('Account comboBoxNode not found.');
        return;
    }

    const selectedAccountNode = comboBoxNode.querySelector('button > div');
    setAccountLabel(selectedAccountNode);

    const items = comboBoxNode.querySelectorAll('ul > li');

    items.forEach((li, index) => {
        setAccountLabel(li);
    });
}

function handlePortfolioRows(container) {
    container = container || globals.portfolioContainer;

    const rows = container.querySelectorAll("div.slick-row");
    logger.debug("Rows: ", rows)

    let markNextChildren = false;

    rows.forEach(row => {
        logger.debug("Row: ", row);

        // Wymagane czyszczenie by nowo dodane wiersze (np. rozwinięcie grupy wyżej) nie miały błędnie oznaczonego stylu.
        rowMarker.clear(row);

        let markRow = false;

        const rowInfo = AssetRowInfo.fromRow(row);
        logger.debug("RowInfo: ", rowInfo);

        if (settings.isAutoCollapseEnabled) {
            if (!hasCollapsedOnce) {
                if (rowInfo.isExpanded) {
                    logger.debug("Row will be collapsed", row);

                    const toggle = row.querySelector('.slick-group-toggle');
                    if (toggle) toggle.click();
                }
            }
        }

        let color;

        // Parent row
        if (rowInfo.isParent) {      
            DarkOverlayRowMarker.apply(row);

            markNextChildren = false;

            if (rowFilter.matches(rowInfo)) {
                markRow = true;
                
                if (rowInfo.isExpanded) {
                    markNextChildren = true;

                    // if (parseNumberOrDefault(amount) > 0) {
                    //     markNextChildren = true;
                    // }
                }
                else {
                    markNextChildren = false;
                }
            }

            color = 'WhiteSmoke';
        }
        // Child row
        else {
            //logger.log("Child row: ", row);

            //color = 'LightGray';
            color = 'Gray';
        }

        row.style.setProperty('color', color, 'important');

        // Główna akcja na wierszu (jeśli klasyfikuje się)
        if (markRow || markNextChildren) {
            //logger.log("Mark current row.", row)

            rowMarker.apply(row);
        }

        // Trade type
        const tradeTypeNode = row.children[1];
        const tradeType = TradeType.parse(tradeTypeNode.textContent);

        if (tradeType === TradeType.SELL) {
            tradeTypeNode.style.setProperty('color', 'red', 'important');
        } 
        else if (tradeType === TradeType.BUY) {
            tradeTypeNode.style.setProperty('color', 'green', 'important');
        }
        else {
            tradeTypeNode.style.removeProperty('color');
        }
    });

    hasCollapsedOnce = true;
}

function handlePortfolio(container) {
    container = container || globals.portfolioContainer;

    //handlePortfolioRows(container);

    const observer = new MutationObserver(mutations => {
        //logger.log("Zmiana drzewa DOM.");
        handlePortfolioRows(container);
    });

    // const observer = new MutationObserver((mutationsList) => {
    //     let shouldHandleRows = false;

    //     for (const mutation of mutationsList) {
    //         if (mutation.type === 'childList') {
    //             for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
    //                 if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('slick-row')) {
    //                     shouldHandleRows = true;
    //                     break;
    //                 }
    //             }
    //         }
    //         if (shouldHandleRows) break;
    //     }

    //     if (shouldHandleRows) {
    //         handlePortfolioRows(container);
    //     }
    // });

    logger.debug("Watching: ", container);

    observer.observe(container, { childList: true, subtree: true });
}

function handleBalance(container) {
    container = container || globals.balanceContainer;
}

function handleProfit(container) {
    container = container || globals.profitContainer;

    const span = container.querySelector('span');
    if (!span) {
        logger.warn('Brak <span> w etykiecie zysku.');
        return;
    }

    if (settings.isFakeProfitEnabled) {
        const amount = getRandom(settings.fakeProfit.min, settings.fakeProfit.max);

        span.textContent = formatCurrency(amount);
        span.class = "positive";
    }
    else if (settings.isNegativeProfitHidden) {
        const value = parseNumberOrDefault(span.textContent, 0);
        logger.log("Profit amount: ", value);

        if (value < 0) {
            GrayedRowMarker.apply(span, 'gray');
        }
    }
}

function handleMarketTabs(container) {
    container = container || globals.marketTabsContainer;
    logger.debug("MarketTabs: ", container);

    const tabsToHide = settings.hiddenMarketTabs;

    container.querySelectorAll('.xs-mws-menu-tab').forEach(tab => {
        const label = tab.querySelector('.xs-mws-menu-label')?.textContent.trim();
        logger.debug("Tab: ", tab, "Label: ", label);

        if (tabsToHide.includes(label)) {
            style(tab, { hide: true });
        }
    });
}

function handleMarketAssets(container) {
    container = container || globals.marketTabsContainer;

    logger.debug("MarketAssets: ", container);

    const rows = container.querySelectorAll("div.slick-row");

    rows.forEach(row => {
        logger.debug("Row: ", row)

        const assetNameNode = row.querySelector('.xs-display-name');
        const assetTypeNode = row.querySelector('.xs-btn-asset-class');

        if (assetNameNode && assetTypeNode) {
            const assetName = assetNameNode.textContent.trim();
            const assetType = assetTypeNode.textContent.trim();

            logger.debug("Asset:", assetName, "| Class:", assetType);

            if (assetType === 'CFD') {
                HighlightRowMarker.apply(row);
            }
        }        
    });
}

const containerSelectors = {
    marketTabs: 'div[market-watch-module] .xs-mws-menu-tabs:has(.xs-mws-menu-tab)',
    main: 'div.mainContainer',
    balance: '.balance-summary-container',
    portfolio: 'div[open-trades-module] .jspPane:has(.slick-row)',
    profit: () => document.querySelector('xs6-balance-summary')?.shadowRoot?.querySelector('.profit-box label.profit'),
};

// ------------------------------------------------------------------------------------------------------------------------ //
//  MAIN
// ------------------------------------------------------------------------------------------------------------------------ //

logger.log(settings.appFullName + " has started.");

// Top-level async initialization function
async function initApp() {
    try {
        globals.mainContainer = await waitForContainer(containerSelectors.main, {
            label: 'Main',
            logger: logger,
            onReady: handleMain
        });

        globals.marketTabsContainer = await waitForContainer(containerSelectors.marketTabs, {
            label: 'MarketTabs',
            logger: logger,
            onReady: handleMarketTabs
        });

        globals.portfolioContainer = await waitForContainer(containerSelectors.portfolio, {
            label: 'Portfolio',
            logger: logger,
            onReady: handlePortfolio
        });

        globals.balanceContainer = await waitForContainer(containerSelectors.balance, {
            label: 'Balance',
            logger: logger,
            onReady: handleBalance
        });

        globals.profitContainer = await waitForContainer(containerSelectors.profit, {
            label: 'Profit',
            logger: logger,
            onReady: handleProfit
        });

    } catch (error) {
        logger.error("Error while waiting for the container:", error);
    }
}

window.onload = function () {
    initApp();
};

