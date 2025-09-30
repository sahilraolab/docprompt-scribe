import { Item, Stock } from '@/types';

export const items: Item[] = [
  // Cement & Binding Materials (1-15)
  { id: 'item-1', name: 'ACC Cement 53 Grade', code: 'CEM-001', sku: 'ACC53', category: 'Cement', uom: 'Bag', description: '50kg bag' },
  { id: 'item-2', name: 'UltraTech Cement 53 Grade', code: 'CEM-002', sku: 'UT53', category: 'Cement', uom: 'Bag', description: '50kg bag' },
  { id: 'item-3', name: 'Ambuja Cement 43 Grade', code: 'CEM-003', sku: 'AMB43', category: 'Cement', uom: 'Bag', description: '50kg bag' },
  { id: 'item-4', name: 'White Cement', code: 'CEM-004', sku: 'WCEM', category: 'Cement', uom: 'Bag', description: '40kg bag' },
  { id: 'item-5', name: 'Grey Cement OPC', code: 'CEM-005', sku: 'GOPC', category: 'Cement', uom: 'Bag', description: '50kg bag' },
  { id: 'item-6', name: 'Quick Setting Cement', code: 'CEM-006', sku: 'QSC', category: 'Cement', uom: 'Bag', description: '50kg bag' },
  { id: 'item-7', name: 'Tile Adhesive', code: 'ADH-001', sku: 'TADH', category: 'Adhesive', uom: 'Bag', description: '20kg bag' },
  { id: 'item-8', name: 'Plaster of Paris (POP)', code: 'POP-001', sku: 'POP', category: 'Finishing', uom: 'Bag', description: '25kg bag' },
  { id: 'item-9', name: 'Wall Putty', code: 'PUT-001', sku: 'WPUT', category: 'Finishing', uom: 'Bag', description: '40kg bag' },
  { id: 'item-10', name: 'Waterproofing Compound', code: 'WPC-001', sku: 'WPC', category: 'Chemical', uom: 'Ltr', description: '20 liter drum' },
  { id: 'item-11', name: 'Epoxy Resin', code: 'EPX-001', sku: 'EPX', category: 'Chemical', uom: 'Kg', description: 'Epoxy coating' },
  { id: 'item-12', name: 'Curing Compound', code: 'CUR-001', sku: 'CC', category: 'Chemical', uom: 'Ltr', description: 'Concrete curing' },
  { id: 'item-13', name: 'Polymer Mortar', code: 'MOR-001', sku: 'PMOR', category: 'Mortar', uom: 'Bag', description: '25kg bag' },
  { id: 'item-14', name: 'Ready Mix Plaster', code: 'RMP-001', sku: 'RMP', category: 'Plaster', uom: 'Bag', description: '50kg bag' },
  { id: 'item-15', name: 'Joint Filler Compound', code: 'JFC-001', sku: 'JFC', category: 'Finishing', uom: 'Kg', description: 'Joint filling' },

  // Steel & Metal (16-30)
  { id: 'item-16', name: 'TMT Bars 8mm', code: 'STL-001', sku: 'TMT8', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-17', name: 'TMT Bars 10mm', code: 'STL-002', sku: 'TMT10', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-18', name: 'TMT Bars 12mm', code: 'STL-003', sku: 'TMT12', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-19', name: 'TMT Bars 16mm', code: 'STL-004', sku: 'TMT16', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-20', name: 'TMT Bars 20mm', code: 'STL-005', sku: 'TMT20', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-21', name: 'TMT Bars 25mm', code: 'STL-006', sku: 'TMT25', category: 'Steel', uom: 'MT', description: 'Thermo Mechanically Treated' },
  { id: 'item-22', name: 'Mild Steel Angles', code: 'STL-007', sku: 'MSA', category: 'Steel', uom: 'MT', description: 'L-shaped angle' },
  { id: 'item-23', name: 'Steel Channels', code: 'STL-008', sku: 'SC', category: 'Steel', uom: 'MT', description: 'C-shaped channel' },
  { id: 'item-24', name: 'Steel Beams (I-Section)', code: 'STL-009', sku: 'ISB', category: 'Steel', uom: 'MT', description: 'I-beam structural' },
  { id: 'item-25', name: 'Steel Plates 6mm', code: 'STL-010', sku: 'SP6', category: 'Steel', uom: 'MT', description: 'Flat steel plate' },
  { id: 'item-26', name: 'GI Pipes 15mm', code: 'PIP-001', sku: 'GIP15', category: 'Pipe', uom: 'Mtr', description: 'Galvanized Iron Pipe' },
  { id: 'item-27', name: 'GI Pipes 20mm', code: 'PIP-002', sku: 'GIP20', category: 'Pipe', uom: 'Mtr', description: 'Galvanized Iron Pipe' },
  { id: 'item-28', name: 'GI Pipes 25mm', code: 'PIP-003', sku: 'GIP25', category: 'Pipe', uom: 'Mtr', description: 'Galvanized Iron Pipe' },
  { id: 'item-29', name: 'MS Square Pipe', code: 'PIP-004', sku: 'MSP', category: 'Pipe', uom: 'Mtr', description: 'Mild Steel Square Pipe' },
  { id: 'item-30', name: 'Binding Wire', code: 'WIR-001', sku: 'BW', category: 'Wire', uom: 'Kg', description: 'Steel binding wire' },

  // Aggregates & Sand (31-45)
  { id: 'item-31', name: 'River Sand (Fine)', code: 'AGG-001', sku: 'RSAND', category: 'Aggregate', uom: 'CFT', description: 'Fine river sand' },
  { id: 'item-32', name: 'M-Sand (Manufactured)', code: 'AGG-002', sku: 'MSAND', category: 'Aggregate', uom: 'CFT', description: 'Machine made sand' },
  { id: 'item-33', name: 'P-Sand (Plastering)', code: 'AGG-003', sku: 'PSAND', category: 'Aggregate', uom: 'CFT', description: 'Plastering sand' },
  { id: 'item-34', name: '20mm Aggregate', code: 'AGG-004', sku: 'AGG20', category: 'Aggregate', uom: 'CFT', description: 'Coarse aggregate 20mm' },
  { id: 'item-35', name: '10mm Aggregate', code: 'AGG-005', sku: 'AGG10', category: 'Aggregate', uom: 'CFT', description: 'Coarse aggregate 10mm' },
  { id: 'item-36', name: '40mm Aggregate', code: 'AGG-006', sku: 'AGG40', category: 'Aggregate', uom: 'CFT', description: 'Coarse aggregate 40mm' },
  { id: 'item-37', name: 'Metal (Mixed Aggregate)', code: 'AGG-007', sku: 'META', category: 'Aggregate', uom: 'CFT', description: 'Mixed size aggregate' },
  { id: 'item-38', name: 'Granite Chips 6mm', code: 'AGG-008', sku: 'GC6', category: 'Aggregate', uom: 'CFT', description: 'Granite chips' },
  { id: 'item-39', name: 'Pebbles', code: 'AGG-009', sku: 'PEB', category: 'Aggregate', uom: 'CFT', description: 'River pebbles' },
  { id: 'item-40', name: 'Crushed Stone', code: 'AGG-010', sku: 'CS', category: 'Aggregate', uom: 'CFT', description: 'Crushed stone aggregate' },
  { id: 'item-41', name: 'Gravel', code: 'AGG-011', sku: 'GRVL', category: 'Aggregate', uom: 'CFT', description: 'Gravel aggregate' },
  { id: 'item-42', name: 'Rock Dust', code: 'AGG-012', sku: 'RD', category: 'Aggregate', uom: 'CFT', description: 'Stone crusher dust' },
  { id: 'item-43', name: 'Blue Metal', code: 'AGG-013', sku: 'BM', category: 'Aggregate', uom: 'CFT', description: 'Blue granite aggregate' },
  { id: 'item-44', name: 'Murum', code: 'AGG-014', sku: 'MRM', category: 'Aggregate', uom: 'CFT', description: 'Laterite gravel' },
  { id: 'item-45', name: 'Boulder', code: 'AGG-015', sku: 'BLDR', category: 'Aggregate', uom: 'CFT', description: 'Large stones' },

  // Bricks & Blocks (46-60)
  { id: 'item-46', name: 'Red Clay Bricks', code: 'BRK-001', sku: 'RCB', category: 'Brick', uom: 'Nos', description: '230x110x75mm' },
  { id: 'item-47', name: 'Fly Ash Bricks', code: 'BRK-002', sku: 'FAB', category: 'Brick', uom: 'Nos', description: 'Eco-friendly brick' },
  { id: 'item-48', name: 'AAC Blocks 4"', code: 'BLK-001', sku: 'AAC4', category: 'Block', uom: 'Nos', description: 'Autoclaved Aerated Concrete' },
  { id: 'item-49', name: 'AAC Blocks 6"', code: 'BLK-002', sku: 'AAC6', category: 'Block', uom: 'Nos', description: 'Autoclaved Aerated Concrete' },
  { id: 'item-50', name: 'AAC Blocks 8"', code: 'BLK-003', sku: 'AAC8', category: 'Block', uom: 'Nos', description: 'Autoclaved Aerated Concrete' },
  { id: 'item-51', name: 'Solid Concrete Blocks 4"', code: 'BLK-004', sku: 'SCB4', category: 'Block', uom: 'Nos', description: 'Concrete masonry unit' },
  { id: 'item-52', name: 'Solid Concrete Blocks 6"', code: 'BLK-005', sku: 'SCB6', category: 'Block', uom: 'Nos', description: 'Concrete masonry unit' },
  { id: 'item-53', name: 'Hollow Concrete Blocks 8"', code: 'BLK-006', sku: 'HCB8', category: 'Block', uom: 'Nos', description: 'Hollow CMU' },
  { id: 'item-54', name: 'CLC Blocks', code: 'BLK-007', sku: 'CLC', category: 'Block', uom: 'Nos', description: 'Cellular Lightweight Concrete' },
  { id: 'item-55', name: 'Interlocking Bricks', code: 'BRK-003', sku: 'ILB', category: 'Brick', uom: 'Nos', description: 'No mortar bricks' },
  { id: 'item-56', name: 'Paver Blocks 60mm', code: 'PAV-001', sku: 'PV60', category: 'Paver', uom: 'Nos', description: 'Concrete paver' },
  { id: 'item-57', name: 'Paver Blocks 80mm', code: 'PAV-002', sku: 'PV80', category: 'Paver', uom: 'Nos', description: 'Heavy duty paver' },
  { id: 'item-58', name: 'Kerb Stone', code: 'KRB-001', sku: 'KS', category: 'Stone', uom: 'Nos', description: 'Road kerb' },
  { id: 'item-59', name: 'Hollow Clay Blocks', code: 'BLK-008', sku: 'HCL', category: 'Block', uom: 'Nos', description: 'Clay hollow block' },
  { id: 'item-60', name: 'Perforated Bricks', code: 'BRK-004', sku: 'PB', category: 'Brick', uom: 'Nos', description: 'Ventilated brick' },

  // Tiles & Flooring (61-75)
  { id: 'item-61', name: 'Vitrified Tiles 600x600mm', code: 'TIL-001', sku: 'VT60', category: 'Tiles', uom: 'Sqft', description: 'Polished vitrified' },
  { id: 'item-62', name: 'Vitrified Tiles 800x800mm', code: 'TIL-002', sku: 'VT80', category: 'Tiles', uom: 'Sqft', description: 'Large format vitrified' },
  { id: 'item-63', name: 'Ceramic Wall Tiles 300x450mm', code: 'TIL-003', sku: 'CW34', category: 'Tiles', uom: 'Sqft', description: 'Glazed ceramic' },
  { id: 'item-64', name: 'Ceramic Floor Tiles 600x600mm', code: 'TIL-004', sku: 'CF60', category: 'Tiles', uom: 'Sqft', description: 'Ceramic flooring' },
  { id: 'item-65', name: 'Mosaic Tiles', code: 'TIL-005', sku: 'MOS', category: 'Tiles', uom: 'Sqft', description: 'Small format mosaic' },
  { id: 'item-66', name: 'Granite Slabs 16mm', code: 'GRN-001', sku: 'GS16', category: 'Granite', uom: 'Sqft', description: 'Natural granite slab' },
  { id: 'item-67', name: 'Granite Slabs 18mm', code: 'GRN-002', sku: 'GS18', category: 'Granite', uom: 'Sqft', description: 'Natural granite slab' },
  { id: 'item-68', name: 'Marble White', code: 'MRB-001', sku: 'MW', category: 'Marble', uom: 'Sqft', description: 'White marble' },
  { id: 'item-69', name: 'Marble Italian', code: 'MRB-002', sku: 'MI', category: 'Marble', uom: 'Sqft', description: 'Premium italian marble' },
  { id: 'item-70', name: 'Kota Stone', code: 'STO-001', sku: 'KS', category: 'Stone', uom: 'Sqft', description: 'Natural kota stone' },
  { id: 'item-71', name: 'Slate Stone', code: 'STO-002', sku: 'SS', category: 'Stone', uom: 'Sqft', description: 'Natural slate' },
  { id: 'item-72', name: 'Sandstone', code: 'STO-003', sku: 'SDS', category: 'Stone', uom: 'Sqft', description: 'Natural sandstone' },
  { id: 'item-73', name: 'Wooden Flooring Laminate', code: 'FLR-001', sku: 'WFL', category: 'Flooring', uom: 'Sqft', description: 'Laminate wood flooring' },
  { id: 'item-74', name: 'Vinyl Flooring', code: 'FLR-002', sku: 'VFL', category: 'Flooring', uom: 'Sqft', description: 'PVC vinyl flooring' },
  { id: 'item-75', name: 'Epoxy Flooring', code: 'FLR-003', sku: 'EPF', category: 'Flooring', uom: 'Sqft', description: 'Industrial epoxy' },

  // Paints & Coatings (76-90)
  { id: 'item-76', name: 'Emulsion Paint White', code: 'PNT-001', sku: 'EMW', category: 'Paint', uom: 'Ltr', description: 'Interior wall paint' },
  { id: 'item-77', name: 'Emulsion Paint Tinted', code: 'PNT-002', sku: 'EMT', category: 'Paint', uom: 'Ltr', description: 'Colored wall paint' },
  { id: 'item-78', name: 'Exterior Emulsion', code: 'PNT-003', sku: 'EXE', category: 'Paint', uom: 'Ltr', description: 'Weather-proof paint' },
  { id: 'item-79', name: 'Enamel Paint', code: 'PNT-004', sku: 'ENM', category: 'Paint', uom: 'Ltr', description: 'Gloss enamel' },
  { id: 'item-80', name: 'Wood Primer', code: 'PNT-005', sku: 'WP', category: 'Paint', uom: 'Ltr', description: 'Wood surface primer' },
  { id: 'item-81', name: 'Metal Primer', code: 'PNT-006', sku: 'MP', category: 'Paint', uom: 'Ltr', description: 'Anti-rust primer' },
  { id: 'item-82', name: 'Wall Putty Primer', code: 'PNT-007', sku: 'WPP', category: 'Paint', uom: 'Ltr', description: 'Putty primer' },
  { id: 'item-83', name: 'Distemper Paint', code: 'PNT-008', sku: 'DST', category: 'Paint', uom: 'Kg', description: 'Water-based distemper' },
  { id: 'item-84', name: 'Texture Paint', code: 'PNT-009', sku: 'TXT', category: 'Paint', uom: 'Ltr', description: 'Decorative texture' },
  { id: 'item-85', name: 'Wood Stain', code: 'PNT-010', sku: 'WS', category: 'Paint', uom: 'Ltr', description: 'Wood stain finish' },
  { id: 'item-86', name: 'Wood Varnish', code: 'PNT-011', sku: 'WV', category: 'Paint', uom: 'Ltr', description: 'Gloss varnish' },
  { id: 'item-87', name: 'Polyurethane Paint', code: 'PNT-012', sku: 'PU', category: 'Paint', uom: 'Ltr', description: 'PU coating' },
  { id: 'item-88', name: 'Epoxy Paint', code: 'PNT-013', sku: 'EPP', category: 'Paint', uom: 'Ltr', description: 'Epoxy coating' },
  { id: 'item-89', name: 'Heat Resistant Paint', code: 'PNT-014', sku: 'HRP', category: 'Paint', uom: 'Ltr', description: 'High temperature paint' },
  { id: 'item-90', name: 'Anti-Fungal Paint', code: 'PNT-015', sku: 'AFP', category: 'Paint', uom: 'Ltr', description: 'Moisture resistant' },

  // Electrical (91-105)
  { id: 'item-91', name: 'Copper Wire 1.5 Sqmm', code: 'ELC-001', sku: 'CW15', category: 'Electrical', uom: 'Mtr', description: 'Electrical copper wire' },
  { id: 'item-92', name: 'Copper Wire 2.5 Sqmm', code: 'ELC-002', sku: 'CW25', category: 'Electrical', uom: 'Mtr', description: 'Electrical copper wire' },
  { id: 'item-93', name: 'Copper Wire 4 Sqmm', code: 'ELC-003', sku: 'CW40', category: 'Electrical', uom: 'Mtr', description: 'Heavy duty wire' },
  { id: 'item-94', name: 'Aluminum Wire 2.5 Sqmm', code: 'ELC-004', sku: 'AW25', category: 'Electrical', uom: 'Mtr', description: 'Aluminum conductor' },
  { id: 'item-95', name: 'Electrical Conduit PVC 19mm', code: 'ELC-005', sku: 'EC19', category: 'Electrical', uom: 'Mtr', description: 'PVC conduit pipe' },
  { id: 'item-96', name: 'Electrical Conduit PVC 25mm', code: 'ELC-006', sku: 'EC25', category: 'Electrical', uom: 'Mtr', description: 'PVC conduit pipe' },
  { id: 'item-97', name: 'MCB 16A Single Pole', code: 'ELC-007', sku: 'MCB16', category: 'Electrical', uom: 'Nos', description: 'Miniature Circuit Breaker' },
  { id: 'item-98', name: 'MCB 32A Double Pole', code: 'ELC-008', sku: 'MCB32', category: 'Electrical', uom: 'Nos', description: 'Double pole MCB' },
  { id: 'item-99', name: 'Distribution Board 4Way', code: 'ELC-009', sku: 'DB4', category: 'Electrical', uom: 'Nos', description: '4-way DB' },
  { id: 'item-100', name: 'Distribution Board 8Way', code: 'ELC-010', sku: 'DB8', category: 'Electrical', uom: 'Nos', description: '8-way DB' },
  { id: 'item-101', name: 'Switch 6A 2-Way', code: 'ELC-011', sku: 'SW6', category: 'Electrical', uom: 'Nos', description: 'Modular switch' },
  { id: 'item-102', name: 'Socket 6A 3-Pin', code: 'ELC-012', sku: 'SO6', category: 'Electrical', uom: 'Nos', description: '3-pin socket' },
  { id: 'item-103', name: 'LED Bulb 9W', code: 'ELC-013', sku: 'LED9', category: 'Electrical', uom: 'Nos', description: 'LED bulb' },
  { id: 'item-104', name: 'LED Tube Light 18W', code: 'ELC-014', sku: 'LEDT18', category: 'Electrical', uom: 'Nos', description: 'LED tube light' },
  { id: 'item-105', name: 'LED Panel Light 40W', code: 'ELC-015', sku: 'LEDP40', category: 'Electrical', uom: 'Nos', description: 'Panel light' },

  // Plumbing (106-120)
  { id: 'item-106', name: 'PVC Pipes 3/4"', code: 'PLB-001', sku: 'PVC75', category: 'Plumbing', uom: 'Mtr', description: 'PVC water pipe' },
  { id: 'item-107', name: 'PVC Pipes 1"', code: 'PLB-002', sku: 'PVC10', category: 'Plumbing', uom: 'Mtr', description: 'PVC water pipe' },
  { id: 'item-108', name: 'PVC Pipes 1.5"', code: 'PLB-003', sku: 'PVC15', category: 'Plumbing', uom: 'Mtr', description: 'PVC water pipe' },
  { id: 'item-109', name: 'CPVC Pipes 3/4"', code: 'PLB-004', sku: 'CPVC75', category: 'Plumbing', uom: 'Mtr', description: 'Hot water pipe' },
  { id: 'item-110', name: 'CPVC Pipes 1"', code: 'PLB-005', sku: 'CPVC10', category: 'Plumbing', uom: 'Mtr', description: 'Hot water pipe' },
  { id: 'item-111', name: 'SWR Pipes 75mm', code: 'PLB-006', sku: 'SWR75', category: 'Plumbing', uom: 'Mtr', description: 'Soil waste rainwater' },
  { id: 'item-112', name: 'SWR Pipes 110mm', code: 'PLB-007', sku: 'SWR110', category: 'Plumbing', uom: 'Mtr', description: 'Soil waste rainwater' },
  { id: 'item-113', name: 'Water Tank 500L', code: 'PLB-008', sku: 'WT500', category: 'Plumbing', uom: 'Nos', description: 'Plastic water tank' },
  { id: 'item-114', name: 'Water Tank 1000L', code: 'PLB-009', sku: 'WT1000', category: 'Plumbing', uom: 'Nos', description: 'Plastic water tank' },
  { id: 'item-115', name: 'Brass Ball Valve 3/4"', code: 'PLB-010', sku: 'BV75', category: 'Plumbing', uom: 'Nos', description: 'Ball valve' },
  { id: 'item-116', name: 'Brass Ball Valve 1"', code: 'PLB-011', sku: 'BV10', category: 'Plumbing', uom: 'Nos', description: 'Ball valve' },
  { id: 'item-117', name: 'WC Pan (European)', code: 'SNT-001', sku: 'WCP', category: 'Sanitary', uom: 'Nos', description: 'Toilet pan' },
  { id: 'item-118', name: 'WC Pan (Indian)', code: 'SNT-002', sku: 'WCPI', category: 'Sanitary', uom: 'Nos', description: 'Squatting pan' },
  { id: 'item-119', name: 'Wash Basin Counter Top', code: 'SNT-003', sku: 'WB', category: 'Sanitary', uom: 'Nos', description: 'Counter basin' },
  { id: 'item-120', name: 'Kitchen Sink Single Bowl', code: 'SNT-004', sku: 'KS1', category: 'Sanitary', uom: 'Nos', description: 'SS kitchen sink' },
];

// Stock records across 5 locations
const locations = ['Mumbai Site A', 'Pune Site B', 'Bangalore Site C', 'Delhi Site D', 'Hyderabad Site E'];

export const stock: Stock[] = [];

// Generate 200 stock records (40 items per location)
items.slice(0, 40).forEach((item, index) => {
  locations.forEach((location, locIndex) => {
    const stockId = `stock-${index * 5 + locIndex + 1}`;
    const baseQty = Math.floor(Math.random() * 500) + 100;
    const variance = Math.floor(Math.random() * 200);
    
    stock.push({
      id: stockId,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      location: location,
      qty: baseQty + variance,
      minQty: 50,
      maxQty: 1000,
      uom: item.uom,
      lastUpdated: new Date(2024, 10, Math.floor(Math.random() * 28) + 1).toISOString(),
    });
  });
});
