const TradeType = {
    BUY: { value: 'Buy', label: 'Buy' },
    SELL: { value: 'Sell', label: 'Sell' },
    NEUTRAL: { value: 'Neutral', label: 'Neutral (net zero)' },

    parse(raw) {
        const normalized = raw?.toLowerCase();
        switch (normalized) {
            case 'buy': return this.BUY;
            case 'sell': return this.SELL;
            default: return this.NEUTRAL;
        }
    }
};

class AssetRowInfo {
    constructor(isParent, assetType, isExpanded, assetName, amount, description) {
        this.isParent = isParent;
        this.assetType = assetType;
        this.isExpanded = isExpanded;
        this.assetName = assetName;
        this.amount = amount;
        this.description = description;
    }

    static fromRow(row) {
        let assetType = '', isExpanded = false, assetName = '', amount = '', description = '';

        const isParentRow = row.classList.contains('slick-group');
        if (isParentRow) {
            const assetTypeNode = row.querySelector("span.xs-btn-asset-class");
            assetType = assetTypeNode ? assetTypeNode.textContent.trim() : '';

            const toggleNode = row.querySelector('span.slick-group-toggle');
            isExpanded = toggleNode?.classList.contains('expanded') || false;

            const assetInfoNode = row.querySelector("span.slick-group-title > div");

            // Nazwa akcji – tylko tekst spoza spanów (czyli czysty tekstowy node)
            assetName = assetInfoNode
                ? Array.from(assetInfoNode.childNodes)
                    .filter(n => n.nodeType === Node.TEXT_NODE)
                    .map(n => n.textContent.trim())
                    .join('')
                : '';
            
            amount = assetInfoNode?.querySelector('.slick-group-rectangle')?.textContent.trim() ?? '';
            description = assetInfoNode?.querySelector('.slick-group-toggle-description')?.textContent.trim() ?? '';
        }

        return new AssetRowInfo(isParentRow, assetType, isExpanded, assetName, amount, description);
    }
}