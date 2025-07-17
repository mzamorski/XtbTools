const RowMarkerType = {
  Highlight: { label: 'Podświetlenie', value: 'Highlight' },
  Lowlight: { label: 'Przyciemnienie', value: 'Lowlight' },
  Grayed: { label: 'Wyszarzenie', value: 'Grayed' },
  Hidden: { label: 'Ukrycie', value: 'Hidden' },
  Empty: { label: 'Brak', value: 'Empty' },
};

class RowMarkerFactory {
  static create(type) {
    switch (type) {
      case RowMarkerType.Highlight.value:
        return new HighlightRowMarker();
      case RowMarkerType.Lowlight.value:
        return new LowlightRowMarker();
      case RowMarkerType.Hidden.value:
        return new HiddenRowMarker();
      case RowMarkerType.Grayed.value:
        return new GrayedRowMarker();
      case RowMarkerType.Empty.value:
        return new EmptyRowMarker();
      default:
        //console.warn(`Nieznany typ markera: "${type}". Zwracam domyślny.`);
        return new EmptyRowMarker();
    }
  }
}
