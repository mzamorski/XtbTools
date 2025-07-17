// Helper
const $ = id => document.getElementById(id);

function populateSelect(select, enumObj) {
  for (const key in enumObj) {
    const { label, value } = enumObj[key];
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // const filterSelect = $('filter-select');
  const filterSelect = document.getElementById('filter-select');
  const markerSelect = document.getElementById('marker-select');

  const fakeProfitCheckbox = document.getElementById('isFakeProfitEnabled');
  const negativeProfitCheckbox = document.getElementById('isNegativeProfitHidden');
  const autoCollapseCheckbox = document.getElementById('isAutoCollapseEnabled');
  const accountLabels = document.getElementById('account-labels');
  const hiddenMarketTabs = $('hidden-market-tabs');

  populateSelect(filterSelect, RowFilterType);
  populateSelect(markerSelect, RowMarkerType);

  // ------------------------------------------------------------------------------------------------------------------------
  // Przywrócenie poprzednio zapisanych wartości

  chrome.storage.sync.get([
    'selectedFilter', 'selectedMarker',
    'isFakeProfitEnabled', 'isNegativeProfitHidden', 'isAutoCollapseEnabled',
    'accountLabelsText', 'hiddenMarketTabsText'
  ], (data) => {
    if (data.selectedFilter) filterSelect.value = data.selectedFilter;
    if (data.selectedMarker) markerSelect.value = data.selectedMarker;

    fakeProfitCheckbox.checked = !!data.isFakeProfitEnabled;
    negativeProfitCheckbox.checked = !!data.isNegativeProfitHidden;
    autoCollapseCheckbox.checked = !!data.isAutoCollapseEnabled;
    accountLabels.value = data.accountLabelsText || '';
    hiddenMarketTabs.value = data.hiddenMarketTabsText || '';
  });

  // ------------------------------------------------------------------------------------------------------------------------
  // Zapis ustawień

  document.getElementById('save-button').addEventListener('click', () => {
    const selectedFilter = filterSelect.value;
    const selectedMarker = markerSelect.value;

    const isFakeProfitEnabled = fakeProfitCheckbox.checked;
    const isNegativeProfitHidden = negativeProfitCheckbox.checked;
    const isAutoCollapseEnabled = autoCollapseCheckbox.checked;
    const accountLabelsText = accountLabels.value.trim();
    const hiddenMarketTabsText = hiddenMarketTabs.value.trim();

    chrome.storage.sync.set({
      selectedFilter, selectedMarker,
      isFakeProfitEnabled, isNegativeProfitHidden, isAutoCollapseEnabled,
      accountLabelsText, hiddenMarketTabsText
    }, () => {
      console.log("Ustawienia zapisane:", selectedFilter, selectedMarker, isFakeProfitEnabled, isNegativeProfitHidden, isAutoCollapseEnabled, accountLabelsText);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'settingsChanged',
            selectedFilter,
            selectedMarker,
            isFakeProfitEnabled,
            isNegativeProfitHidden,
            isAutoCollapseEnabled,
            accountLabelsText,
            hiddenMarketTabsText
          });
        }
      });
    });
  });
});