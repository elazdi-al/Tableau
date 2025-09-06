// Test file for the refactored local-table implementation
import {
  useCollectionStore,
  useTables,
  useTableColumns,
  useTableRows,
  initializeSampleData
} from './lib/local-table.ts';

console.log('Testing TanStack DB + Zustand implementation...');

// Test store initialization
const store = useCollectionStore.getState();
console.log('Store initialized:', {
  isInitialized: store.isInitialized,
  selectedTableId: store.selectedTableId
});

// Test sample data creation
try {
  const tableId = initializeSampleData();
  console.log('Sample data initialized with table ID:', tableId);

  // Test store operations
  const newTableId = store.createTable('Test Table 2');
  console.log('Created new table:', newTableId);

  const columnId = store.createColumn(newTableId, 'Test Column', 'text');
  console.log('Created new column:', columnId);

  const rowId = store.createRow(newTableId, { [columnId]: 'Test Value' });
  console.log('Created new row:', rowId);

  // Test cell update
  store.updateCellValue(rowId, columnId, 'Updated Test Value');
  console.log('Updated cell value');

  console.log('All tests passed! ✅');
} catch (error) {
  console.error('Test failed:', error);
}
