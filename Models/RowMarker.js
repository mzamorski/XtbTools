class RowMarker {
    apply(row) {
        throw new Error("Not implemented");
    }

    static clear(row) {
        row.style.removeProperty('background-color');
        row.style.removeProperty('opacity');
        row.style.removeProperty('display');
    }

    clear(row) {
        RowMarker.clear(row);
    }
}

class EmptyRowMarker extends RowMarker {
    apply(row) {
    }

    clear(row) {
    }
}

class HighlightRowMarker extends RowMarker {
    static apply(row) {
        row.style.setProperty('background-color', 'rgba(255, 255, 0, 0.15)', 'important');
        row.style.setProperty('opacity', '1');
    }

    apply(row) {
        HighlightRowMarker.apply(row);
    }    
}

class LowlightRowMarker extends RowMarker {
    apply(row) {
        row.style.setProperty('background-color', 'rgba(0, 0, 0, 0.05)', 'important');
        row.style.setProperty('opacity', '0.2');
    }
}

class GrayedRowMarker extends RowMarker {
    constructor(foreColor = null) {
        super();
        this.foreColor = foreColor;
    }

    static apply(row, foreColor = null) {
        row.style.setProperty('background-color', 'rgba(0, 0, 0, 0.05)', 'important');
        row.style.setProperty('opacity', '0.2', 'important');

        const color = foreColor || getComputedStyle(row).color;

        row.style.setProperty('color', color, 'important');

        row.querySelectorAll("*").forEach(el => {
            el.style.setProperty('color', color, 'important');
        });
    }

    apply(row) {
        GrayedRowMarker.apply(row, this.foreColor);
    }

    clear(row) {
        super.clear(row);

        row.querySelectorAll("*").forEach(el => {
            el.style.removeProperty('color');
        });
    }
}
 
class DarkOverlayRowMarker extends RowMarker {
    static apply(row) {
        row.style.setProperty('background-color', 'rgba(0, 0, 0, 0.2)', 'important');
    }

    apply(row) {
        DarkOverlayRowMarker.apply(row);
    }    
}

class ProfitableRowMarker extends RowMarker {
    static apply(row) {
        row.style.setProperty(
            'background-image',
            'linear-gradient(to left, rgba(0, 128, 0, 0.3) 0%, rgba(0, 128, 0, 0) 40%)',
            'important'
        );
    }

    apply(row) {
        ProfitableRowMarker.apply(row);
    }

    clear() {
        super.clear(row);
        
        row.style.removeProperty('background-image');       
        row.style.removeProperty('linear-gradient');       
    }
}

class HiddenRowMarker extends RowMarker {
    static apply(row) {
        row.style.setProperty('display', 'none');
    }

    apply(row) {
        HiddenRowMarker.apply(row);
    }
}
