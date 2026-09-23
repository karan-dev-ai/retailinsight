import React, { useState, useEffect } from 'react';
import { Database, Table, Key, Link as LinkIcon, Eye, RefreshCw, Layers, ShieldCheck, Server, Sparkles } from 'lucide-react';
import { productApi, salesApi, wholesaleApi } from '../services/api';

interface ColumnDef {
  name: string;
  type: string;
  keyType?: 'PK' | 'FK' | 'UK';
  references?: string;
  nullable: boolean;
  description: string;
}

interface TableSchemaDef {
  tableName: string;
  displayName: string;
  description: string;
  rowCountEstimate: string;
  columns: ColumnDef[];
}

const SCHEMAS: TableSchemaDef[] = [
  {
    tableName: 'users',
    displayName: 'Users & Shopkeeper Accounts',
    description: 'Stores retailers, wholesalers, and admin profiles with encrypted BCrypt credentials and business tax info.',
    rowCountEstimate: '3+ accounts',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Unique internal user identifier' },
      { name: 'username', type: 'VARCHAR(50)', keyType: 'UK', nullable: false, description: 'Login username' },
      { name: 'email', type: 'VARCHAR(100)', keyType: 'UK', nullable: false, description: 'Business email address' },
      { name: 'password', type: 'VARCHAR(255)', nullable: false, description: 'BCrypt hashed password string' },
      { name: 'full_name', type: 'VARCHAR(100)', nullable: false, description: 'Owner / Contact full name' },
      { name: 'business_name', type: 'VARCHAR(150)', nullable: true, description: 'Store name (e.g. Sharma General Store)' },
      { name: 'role', type: 'VARCHAR(30)', nullable: false, description: 'ROLE_RETAILER, ROLE_WHOLESALER, ROLE_ADMIN' },
      { name: 'phone', type: 'VARCHAR(20)', nullable: true, description: 'Contact phone number' },
      { name: 'gst_or_tax_id', type: 'VARCHAR(50)', nullable: true, description: 'GSTIN / State Tax Registration ID' },
      { name: 'address', type: 'VARCHAR(255)', nullable: true, description: 'Physical shop / warehouse address' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Account registration timestamp' },
    ],
  },
  {
    tableName: 'products',
    displayName: 'Products & Inventory',
    description: 'Retail inventory catalog tracking purchase prices (CP), retail prices (MRP), live stock, and margin calculations.',
    rowCountEstimate: '12+ items',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Unique product ID' },
      { name: 'retailer_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Retailer store that owns this inventory item' },
      { name: 'name', type: 'VARCHAR(150)', nullable: false, description: 'Product title / SKU description' },
      { name: 'category', type: 'VARCHAR(50)', nullable: false, description: 'Groceries, Dairy, Beverages, Snacks, Personal Care' },
      { name: 'barcode', type: 'VARCHAR(100)', keyType: 'UK', nullable: false, description: 'Universal Code128 / EAN-13 barcode' },
      { name: 'sku', type: 'VARCHAR(50)', keyType: 'UK', nullable: true, description: 'Stock keeping unit identifier' },
      { name: 'cost_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Purchase price from wholesaler (CP)' },
      { name: 'selling_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Retail customer selling price (MRP)' },
      { name: 'profit_margin_percent', type: 'DECIMAL(5,2)', nullable: true, description: 'Computed: ((SP - CP) / SP) * 100' },
      { name: 'stock_quantity', type: 'INTEGER', nullable: false, description: 'Current available physical stock' },
      { name: 'min_threshold', type: 'INTEGER', nullable: false, description: 'Low-stock safety threshold alert level' },
      { name: 'unit', type: 'VARCHAR(30)', nullable: false, description: 'Unit of measure (e.g. Kg, Piece, Liter, Pouch)' },
      { name: 'image_url', type: 'VARCHAR(255)', nullable: true, description: 'Product image thumbnail' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Date added to catalog' },
    ],
  },
  {
    tableName: 'sale_orders',
    displayName: 'Sales Orders & Invoices',
    description: 'Customer checkout records containing tax (GST), discounts, grand totals, and store net profit earned.',
    rowCountEstimate: '97+ orders',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Unique sale transaction ID' },
      { name: 'retailer_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Retailer who processed the billing' },
      { name: 'order_number', type: 'VARCHAR(50)', keyType: 'UK', nullable: false, description: 'Invoice number (e.g. INV-20260922-1042)' },
      { name: 'customer_name', type: 'VARCHAR(100)', nullable: false, description: 'Customer name or Walk-in Customer' },
      { name: 'customer_phone', type: 'VARCHAR(20)', nullable: true, description: 'Customer mobile number' },
      { name: 'subtotal', type: 'DECIMAL(10,2)', nullable: false, description: 'Gross item total before tax and discounts' },
      { name: 'tax_rate', type: 'DECIMAL(5,2)', nullable: false, description: 'GST rate applied (0%, 5%, 12%, 18%)' },
      { name: 'tax_amount', type: 'DECIMAL(10,2)', nullable: false, description: 'Calculated GST tax value' },
      { name: 'discount_amount', type: 'DECIMAL(10,2)', nullable: false, description: 'Cashier promotional discount applied' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false, description: 'Final bill amount collected from customer' },
      { name: 'total_cost', type: 'DECIMAL(10,2)', nullable: false, description: 'Total cost price of items sold (COGS)' },
      { name: 'total_profit', type: 'DECIMAL(10,2)', nullable: false, description: 'Net store profit: (total_amount - tax - total_cost)' },
      { name: 'profit_margin_percent', type: 'DECIMAL(5,2)', nullable: false, description: 'Overall transaction gross margin %' },
      { name: 'payment_method', type: 'VARCHAR(30)', nullable: false, description: 'CASH, UPI, CARD, CREDIT' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Checkout date and time' },
    ],
  },
  {
    tableName: 'sale_order_items',
    displayName: 'Sale Order Line Items',
    description: 'Itemized breakdown for each sale order recording snapshot prices and per-item margin.',
    rowCountEstimate: '200+ line items',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Line item identifier' },
      { name: 'sale_order_id', type: 'BIGINT', keyType: 'FK', references: 'sale_orders(id)', nullable: false, description: 'Parent invoice reference' },
      { name: 'product_id', type: 'BIGINT', keyType: 'FK', references: 'products(id)', nullable: false, description: 'Catalog product sold' },
      { name: 'product_name', type: 'VARCHAR(150)', nullable: false, description: 'Historical product title snapshot' },
      { name: 'quantity', type: 'INTEGER', nullable: false, description: 'Quantity units sold' },
      { name: 'unit_cost_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Cost price at moment of sale' },
      { name: 'unit_selling_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Selling price at moment of sale' },
      { name: 'item_total', type: 'DECIMAL(10,2)', nullable: false, description: 'quantity * unit_selling_price' },
      { name: 'item_profit', type: 'DECIMAL(10,2)', nullable: false, description: 'quantity * (selling_price - cost_price)' },
    ],
  },
  {
    tableName: 'stock_adjustment_logs',
    displayName: 'Stock Audit & History Logs',
    description: 'Immutable ledger of all inventory increments and decrements for audits and loss tracking.',
    rowCountEstimate: '150+ logs',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Audit log ID' },
      { name: 'product_id', type: 'BIGINT', keyType: 'FK', references: 'products(id)', nullable: false, description: 'Adjusted product' },
      { name: 'product_name', type: 'VARCHAR(150)', nullable: false, description: 'Product title' },
      { name: 'retailer_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Store identifier' },
      { name: 'quantity_changed', type: 'INTEGER', nullable: false, description: 'Positive (+) for restock, negative (-) for sale/loss' },
      { name: 'previous_stock', type: 'INTEGER', nullable: false, description: 'Stock before change' },
      { name: 'new_stock', type: 'INTEGER', nullable: false, description: 'Stock balance after change' },
      { name: 'adjustment_type', type: 'VARCHAR(50)', nullable: false, description: 'SALE, RESTOCK, WHOLESALE_PURCHASE, LOSS_DAMAGE, PHYSICAL_AUDIT' },
      { name: 'reason', type: 'VARCHAR(255)', nullable: true, description: 'Explanation or PO invoice reference' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Timestamp of adjustment' },
    ],
  },
  {
    tableName: 'wholesale_listings',
    displayName: 'Wholesale Bulk Offerings',
    description: 'Bulk catalog created by wholesalers with packaging units, MOQs, and volume discount tiers.',
    rowCountEstimate: '6+ bulk offers',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Wholesale listing ID' },
      { name: 'wholesaler_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Supplier who listed this bulk offer' },
      { name: 'wholesaler_name', type: 'VARCHAR(100)', nullable: false, description: 'Distributor / Supplier company name' },
      { name: 'title', type: 'VARCHAR(150)', nullable: false, description: 'Bulk package title (e.g. Atta 5kg Carton of 8)' },
      { name: 'description', type: 'TEXT', nullable: true, description: 'Logistics and delivery notes' },
      { name: 'category', type: 'VARCHAR(50)', nullable: false, description: 'Groceries, Dairy, Beverages, Snacks' },
      { name: 'unit', type: 'VARCHAR(50)', nullable: false, description: 'Packaging unit (e.g. Carton 24 Packs)' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Price per carton / wholesale pack' },
      { name: 'min_order_quantity', type: 'INTEGER', nullable: false, description: 'Minimum order quantity (MOQ)' },
      { name: 'stock_available', type: 'INTEGER', nullable: false, description: 'Available bulk inventory in warehouse' },
      { name: 'bulk_discount_percent', type: 'DECIMAL(5,2)', nullable: true, description: 'Extra discount % for large orders' },
      { name: 'bulk_discount_threshold', type: 'INTEGER', nullable: true, description: 'Minimum quantity to trigger volume discount' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Date published' },
    ],
  },
  {
    tableName: 'purchase_orders',
    displayName: 'B2B Restock Purchase Orders',
    description: 'Restock orders linking retailer to supplier with automated inventory increment on DELIVERED.',
    rowCountEstimate: '4+ restock POs',
    columns: [
      { name: 'id', type: 'BIGSERIAL', keyType: 'PK', nullable: false, description: 'Purchase order ID' },
      { name: 'order_number', type: 'VARCHAR(50)', keyType: 'UK', nullable: false, description: 'PO number (e.g. PO-20260922-8412)' },
      { name: 'retailer_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Buyer retailer shop' },
      { name: 'wholesaler_id', type: 'BIGINT', keyType: 'FK', references: 'users(id)', nullable: false, description: 'Fulfilling wholesaler' },
      { name: 'listing_id', type: 'BIGINT', keyType: 'FK', references: 'wholesale_listings(id)', nullable: false, description: 'Wholesale catalog item' },
      { name: 'product_name', type: 'VARCHAR(150)', nullable: false, description: 'Package name' },
      { name: 'quantity', type: 'INTEGER', nullable: false, description: 'Number of wholesale packs ordered' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', nullable: false, description: 'Agreed unit price per pack' },
      { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false, description: 'Total purchase expense' },
      { name: 'status', type: 'VARCHAR(30)', nullable: false, description: 'PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED' },
      { name: 'tracking_number', type: 'VARCHAR(100)', nullable: true, description: 'Courier / Transport LR number' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Order placement date' },
    ],
  },
];

export const DatabaseSchemaPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('products');
  const [liveData, setLiveData] = useState<any[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  const activeSchema = SCHEMAS.find((s) => s.tableName === selectedTable) || SCHEMAS[0];

  useEffect(() => {
    loadLiveTableData(selectedTable);
  }, [selectedTable]);

  const loadLiveTableData = async (tableName: string) => {
    setIsLoadingLive(true);
    try {
      if (tableName === 'products') {
        const prods = await productApi.getAll();
        setLiveData(prods);
      } else if (tableName === 'sale_orders') {
        const orders = await salesApi.getOrders();
        setLiveData(orders);
      } else if (tableName === 'wholesale_listings') {
        const listings = await wholesaleApi.getListings();
        setLiveData(listings);
      } else if (tableName === 'purchase_orders') {
        const pos = await wholesaleApi.getRetailerOrders();
        setLiveData(pos);
      } else {
        setLiveData([]);
      }
    } catch (e) {
      console.error('Failed to load table sample:', e);
      setLiveData([]);
    } finally {
      setIsLoadingLive(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Database Architecture & Live Schema Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete PostgreSQL 16 entity-relationship models, constraints, data types, and live database tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PostgreSQL 16 (Neon.tech Connected)</span>
          </div>
        </div>
      </div>

      {/* Database Connection Specs Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Database Engine</span>
          <h3 className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-400" />
            <span>PostgreSQL 16</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">ACID Compliant JPA/Hibernate</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Schema Tables</span>
          <h3 className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
            7 Relational Tables
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Indexed & Foreign Keyed</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Connection Pool</span>
          <h3 className="text-lg font-black text-purple-400 mt-0.5 font-mono">
            HikariCP + SSL
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Auto-reconnect & Pooling</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Interactive OpenAPI Docs</span>
          <a
            href="https://retailinsight-backend.onrender.com/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 underline"
          >
            <span>Open Swagger UI</span>
            <LinkIcon className="w-3 h-3" />
          </a>
          <p className="text-[10px] text-slate-500 mt-0.5">Live API documentation</p>
        </div>
      </div>

      {/* Main Table Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <span>Database Tables ({SCHEMAS.length})</span>
          </p>

          <div className="space-y-1.5">
            {SCHEMAS.map((table) => {
              const isSelected = table.tableName === selectedTable;
              return (
                <button
                  key={table.tableName}
                  onClick={() => setSelectedTable(table.tableName)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-lg'
                      : 'bg-slate-800/50 border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-400">
                      public.{table.tableName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                      {table.columns.length} cols
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-200 mt-1">{table.displayName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{table.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table Schema & Columns (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-blue-400">
                  TABLE public.{activeSchema.tableName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeSchema.rowCountEstimate}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeSchema.description}</p>
            </div>

            <button
              onClick={() => loadLiveTableData(selectedTable)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
              title="Refresh Live Table Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingLive ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Columns Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3.5">Column Name</th>
                  <th className="py-2.5 px-3.5">SQL Type</th>
                  <th className="py-2.5 px-3.5 text-center">Key / Constraint</th>
                  <th className="py-2.5 px-3.5">Description & Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {activeSchema.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-white flex items-center gap-1.5">
                      {col.keyType === 'PK' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                      {col.keyType === 'FK' && <LinkIcon className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{col.name}</span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-purple-300 text-[11px]">
                      {col.type}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {col.keyType === 'PK' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold font-mono">
                          PRIMARY KEY
                        </span>
                      )}
                      {col.keyType === 'FK' && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold font-mono" title={`References ${col.references}`}>
                          FK ➔ {col.references}
                        </span>
                      )}
                      {col.keyType === 'UK' && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold font-mono">
                          UNIQUE
                        </span>
                      )}
                      {!col.keyType && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {col.nullable ? 'NULLABLE' : 'NOT NULL'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Data Records Preview */}
          {liveData.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Live Stored Rows ({liveData.length} records in Neon database)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time PostgreSQL query</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-800 text-slate-400 sticky top-0">
                    <tr>
                      {Object.keys(liveData[0] || {}).slice(0, 6).map((key) => (
                        <th key={key} className="py-2 px-3 font-mono capitalize">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {liveData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        {Object.keys(liveData[0] || {}).slice(0, 6).map((key) => (
                          <td key={key} className="py-2 px-3 font-mono truncate max-w-[150px]">
                            {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
