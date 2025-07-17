const RowFilterType = {
  Stock: { label: 'Akcje', value: 'Stock' },
  Cfd: { label: 'CFD', value: 'Cfd' },
  Empty: { label: 'Brak', value: 'Empty' },
};

class RowFilterFactory {
  static create(type) {
    switch (type) {
      case RowFilterType.Stock.value:
        return new StockRowFilter();
      case RowFilterType.Cfd.value:
        return new CfdRowFilter();
      case RowFilterType.Empty.value:
        return new EmptyRowFilter();
      default:
        //console.warn(`Nieznany typ filtra: "${type}". Zwracam domyślny.`);
        return new EmptyRowFilter();
    }
  }
}
