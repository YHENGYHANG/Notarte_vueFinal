// First-run data. It is copied into localStorage the first time the app opens.
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export const seedCategories = [
  { id: 'cat-electronics', name: 'Electronics', icon: 'electronics', color: '#2f6fb0' },
  { id: 'cat-furniture', name: 'Furniture', icon: 'furniture', color: '#2a8670' },
  { id: 'cat-stationery', name: 'Stationery', icon: 'stationery', color: '#d99a10' },
  { id: 'cat-apparel', name: 'Apparel', icon: 'apparel', color: '#c2415f' },
  { id: 'cat-grocery', name: 'Grocery', icon: 'grocery', color: '#5b9a2f' },
  { id: 'cat-tools', name: 'Tools', icon: 'tools', color: '#58697b' },
]

const item = (id, sku, name, categoryId, quantity, minStock, price, location, supplier, description, age) => ({
  id,
  sku,
  name,
  categoryId,
  quantity,
  minStock,
  price,
  location,
  supplier,
  description,
  image: null,
  createdAt: daysAgo(age + 10),
  updatedAt: daysAgo(age),
})

export const seedItems = [
  item('item-1', 'LAP-0012', 'ThinkBook 14 Laptop', 'cat-electronics', 14, 5, 38500, 'A1-03', 'Northwind Tech', '14-inch laptop, 16 GB RAM, 512 GB SSD.', 2),
  item('item-2', 'EAR-0045', 'Wireless Headphones', 'cat-electronics', 3, 8, 2490, 'A1-07', 'Northwind Tech', 'Over-ear Bluetooth headphones with noise reduction.', 1),
  item('item-3', 'MON-0031', '27-inch 4K Monitor', 'cat-electronics', 0, 4, 14990, 'A2-01', 'Pixel Supply Co.', 'IPS panel, HDMI and DisplayPort inputs.', 0),
  item('item-4', 'CHR-0101', 'Ergonomic Office Chair', 'cat-furniture', 22, 6, 6490, 'B1-02', 'Casa Office', 'Mesh back, adjustable lumbar support and armrests.', 5),
  item('item-5', 'DSK-0042', 'Standing Desk 140 cm', 'cat-furniture', 5, 4, 12900, 'B1-05', 'Casa Office', 'Electric height-adjustable desk with memory presets.', 4),
  item('item-6', 'SHF-0007', 'Steel Shelf Unit', 'cat-furniture', 9, 3, 3250, 'B2-01', 'Casa Office', 'Five-tier shelf, 150 kg per level.', 9),
  item('item-7', 'NTB-0210', 'A5 Dotted Notebook', 'cat-stationery', 240, 80, 185, 'C1-01', 'Paper Trail Inc.', '120 gsm paper, lay-flat binding.', 3),
  item('item-8', 'PEN-0330', 'Gel Pens, 12-pack', 'cat-stationery', 36, 40, 220, 'C1-04', 'Paper Trail Inc.', 'Assorted colours, 0.5 mm tip.', 1),
  item('item-9', 'TSH-0150', 'Cotton Crew Tee, M', 'cat-apparel', 58, 20, 450, 'D1-02', 'Threadworks', 'Heavyweight 220 gsm cotton.', 6),
  item('item-10', 'HDI-0151', 'Zip Hoodie, L', 'cat-apparel', 11, 12, 1290, 'D1-06', 'Threadworks', 'Fleece-lined hoodie with front pockets.', 2),
  item('item-11', 'COF-0500', 'Arabica Beans, 1 kg', 'cat-grocery', 40, 15, 890, 'E1-01', 'Highland Roasters', 'Medium roast, whole bean.', 7),
  item('item-12', 'TEA-0501', 'Green Tea Tin, 100 g', 'cat-grocery', 64, 20, 380, 'E1-03', 'Highland Roasters', 'Loose-leaf sencha in a resealable tin.', 8),
  item('item-13', 'HAM-0900', 'Claw Hammer, 16 oz', 'cat-tools', 18, 6, 420, 'F1-01', 'Ironside Tools', 'Fibreglass handle with rubber grip.', 12),
  item('item-14', 'WRN-0901', 'Adjustable Wrench Set', 'cat-tools', 7, 5, 1150, 'F1-02', 'Ironside Tools', 'Three-piece chrome vanadium set.', 11),
]

export const seedUsers = [
  { id: 'u-admin', name: 'Alex Rivera', username: 'admin', password: 'admin123', role: 'admin', createdAt: daysAgo(60) },
  { id: 'u-staff', name: 'Sam Reyes', username: 'staff', password: 'staff123', role: 'user', createdAt: daysAgo(30) },
]
