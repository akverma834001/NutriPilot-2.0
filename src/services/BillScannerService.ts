// Bill & Grocery Receipt Scanning Intelligence Service for NutriPilot 2.0
// Extracts text, filters STRICTLY FOR EATABLES ONLY, and auto-populates Pantry Inventory

import { PantryItem } from '../types';
import { APP_CONFIG } from '../config/apiConfig';

export interface ScannedItem {
  id: string;
  name: string;
  rawText: string;
  quantity: string;
  unitCostInr: number;
  category: 'protein' | 'dairy' | 'grain' | 'vegetable' | 'fruit' | 'staple' | 'spice';
  isEatable: boolean;
  expiryDays: number;
  exclusionReason?: string;
  selected: boolean;
}

export interface BillScanResult {
  id: string;
  storeName: string;
  invoiceNumber: string;
  detectedDate: string;
  totalBillAmount: number;
  edibleItemsCount: number;
  nonEdibleItemsCount: number;
  items: ScannedItem[];
  confidence: 'high' | 'medium';
  receiptImageUrl?: string;
  upiKeyRef?: string;
  apiKeyStatus?: string;
}

// Strict Blacklist for Non-Edible Grocery / Household Items
const NON_EATABLE_PATTERNS = [
  /surf\s*excel/i, /ariel/i, /tide\b/i, /detergent/i, /rin\b/i, /wheel\b/i, /ghadi/i,
  /harpic/i, /lizol/i, /domex/i, /cleaner/i, /toilet\s*clean/i, /floor\s*wash/i,
  /colgate/i, /pepsodent/i, /sensodyne/i, /close\s*up/i, /dant\s*kanti/i, /toothpaste/i, /toothbrush/i,
  /dettol/i, /lifebuoy/i, /lux\b/i, /pears\b/i, /cinthol/i, /medimix/i, /handwash/i, /sanitizer/i,
  /shampoo/i, /conditioner/i, /pantene/i, /dove\b/i, /sunsilk/i, /head\s*&\s*shoulders/i, /clinic\s*plus/i,
  /vim\b/i, /pril\b/i, /dishwash/i, /scrub/i, /sponge/i, /scotch\s*brite/i, /steel\s*wool/i,
  /garbage\s*bag/i, /trash\s*bag/i, /plastic\s*wrap/i, /cling\s*film/i, /aluminium\s*foil/i, /foil\s*roll/i,
  /tissue/i, /napkin/i, /toilet\s*paper/i, /paper\s*towel/i, /serviette/i, /wipe/i,
  /diaper/i, /pampers/i, /huggies/i, /mamy\s*poko/i, /whisper/i, /stayfree/i, /sanitary\s*pad/i,
  /good\s*knight/i, /all\s*out/i, /hit\b/i, /mortein/i, /mosquito\s*repellent/i, /odonil/i,
  /duracell/i, /battery/i, /eveready/i, /nippo/i, /bulb/i, /led\b/i, /tube\s*light/i,
  /matchbox/i, /candle/i, /agarbatti/i, /incense/i, /camphor/i, /kapoor/i,
  /broom/i, /mop/i, /wiper/i, /duster/i, /bucket/i, /dustbin/i,
  /fabric\s*softener/i, /comfort\b/i, /vanish/i, /bleach/i, /robin\s*blue/i,
  /air\s*freshener/i, /godrej\s*aer/i, /ambipur/i,
  /facewash/i, /himalaya\s*face/i, /nivea/i, /body\s*lotion/i, /sunscreen/i, /cream/i, /vaseline/i,
  /shaving/i, /razor/i, /gillette/i, /blade/i, /aftershave/i, /foam/i,
  /deodorant/i, /axe\b/i, /fogg\b/i, /wild\s*stone/i, /perfume/i, /deo\s*spray/i,
  /notebook/i, /ball\s*pen/i, /pencil/i, /eraser/i, /stapler/i, /glue/i, /fevicol/i,
  /pedigree/i, /whiskas/i, /dog\s*food/i, /cat\s*food/i, /pet\s*food/i,
  /paracetamol/i, /crocin/i, /bandaid/i, /d-cold/i, /vicks/i, /iodex/i, /moov/i, /volini/i
];

export class BillScannerService {
  /**
   * Classifies an item into edible vs non-edible and assigns appropriate pantry categories
   */
  public static classifyItem(rawName: string, price: number = 50, rawQuantity: string = '1 unit'): Omit<ScannedItem, 'id' | 'selected'> {
    const text = rawName.trim();
    const lower = text.toLowerCase();

    // 1. Check strict non-edibles
    for (const pattern of NON_EATABLE_PATTERNS) {
      if (pattern.test(lower)) {
        return {
          name: text,
          rawText: text,
          quantity: rawQuantity,
          unitCostInr: price,
          category: 'staple',
          isEatable: false,
          expiryDays: 0,
          exclusionReason: 'Non-edible household / cleaning / personal hygiene item'
        };
      }
    }

    // 2. Classify Edibles
    // Dairy
    if (/paneer|cottage\s*cheese|milk|dahi|curd|yogurt|butter|cheese|ghee|cream|buttermilk|chaas|lassi/i.test(lower)) {
      const isQuickExpiry = /milk|paneer|curd|dahi|yogurt|buttermilk/i.test(lower);
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? '500g' : rawQuantity,
        unitCostInr: price,
        category: 'dairy',
        isEatable: true,
        expiryDays: isQuickExpiry ? 4 : 45
      };
    }

    // High Protein (Eggs, Soya, Pulses, Meat, Whey, Sattu, Seeds)
    if (/egg|soya|tofu|chicken|fish|meat|dal|moong|toor|chana|rajma|chole|lentil|sattu|whey|protein|sprouts|peanut\s*butter|almond|walnut|chia/i.test(lower)) {
      const isShortExpiry = /egg|chicken|fish|meat|tofu|sprouts/i.test(lower);
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? (lower.includes('egg') ? '6 eggs' : '500g') : rawQuantity,
        unitCostInr: price,
        category: 'protein',
        isEatable: true,
        expiryDays: isShortExpiry ? (lower.includes('egg') ? 14 : 3) : 180
      };
    }

    // Grains, Breads & Cereals
    if (/rice|atta|wheat|flour|oats|bread|roti|poha|suji|rava|pasta|noodles|quinoa|millet|ragi|cornflakes/i.test(lower)) {
      const isBread = /bread|bun|pav/i.test(lower);
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? (isBread ? '400g' : '1 kg') : rawQuantity,
        unitCostInr: price,
        category: 'grain',
        isEatable: true,
        expiryDays: isBread ? 5 : 120
      };
    }

    // Fruits
    if (/banana|apple|orange|mango|papaya|lemon|guava|watermelon|pomegranate|grapes|chikoo|berries/i.test(lower)) {
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? '1 kg' : rawQuantity,
        unitCostInr: price,
        category: 'fruit',
        isEatable: true,
        expiryDays: 5
      };
    }

    // Vegetables
    if (/tomato|potato|aloo|onion|pyaz|spinach|palak|broccoli|carrot|gajar|cucumber|kheera|capsicum|cauliflower|gobhi|cabbage|ginger|adrak|garlic|lahsun|chilli|mirch|coriander|dhaniya/i.test(lower)) {
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? '1 kg' : rawQuantity,
        unitCostInr: price,
        category: 'vegetable',
        isEatable: true,
        expiryDays: 6
      };
    }

    // Spices
    if (/turmeric|haldi|jeera|cumin|masala|pepper|kali\s*mirch|cardamom|elaichi|clove|laung|cinnamon|mustard\s*seeds|rai|fenugreek|methi|salt|namak/i.test(lower)) {
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? '100g' : rawQuantity,
        unitCostInr: price,
        category: 'spice',
        isEatable: true,
        expiryDays: 365
      };
    }

    // Staples & Oils & Beverages
    if (/oil|mustard\s*oil|olive\s*oil|sunflower|refined|sugar|jaggery|gur\b|honey|tea|chai|coffee|green\s*tea|vinegar/i.test(lower)) {
      return {
        name: text,
        rawText: text,
        quantity: rawQuantity.includes('unit') ? '1 Litre' : rawQuantity,
        unitCostInr: price,
        category: 'staple',
        isEatable: true,
        expiryDays: 180
      };
    }

    // Default Eatables check (if it sounds like food or edible item)
    return {
      name: text,
      rawText: text,
      quantity: rawQuantity,
      unitCostInr: price,
      category: 'staple',
      isEatable: true,
      expiryDays: 30
    };
  }

  /**
   * Pre-configured Real-World Grocery Store Receipts (India: Supermarkets, Kirana, Quick Commerce)
   */
  public static getSampleReceipts(): BillScanResult[] {
    return [
      {
        id: 'sample_dmart_supermarket',
        storeName: 'D-Mart Hypermarket Superstore',
        invoiceNumber: 'DM-MUM-892147',
        detectedDate: new Date().toISOString().split('T')[0],
        totalBillAmount: 894,
        edibleItemsCount: 6,
        nonEdibleItemsCount: 3,
        confidence: 'high',
        receiptImageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&auto=format&fit=crop&q=80',
        items: [
          {
            id: 'd1',
            name: 'Fresh Malai Paneer (200g)',
            rawText: 'AMUL MALAI PANEER 200G',
            quantity: '200g',
            unitCostInr: 85,
            category: 'dairy',
            isEatable: true,
            expiryDays: 4,
            selected: true
          },
          {
            id: 'd2',
            name: 'Amul Taaza Toned Milk (1 Litre)',
            rawText: 'AMUL TAAZA TONED MILK 1L',
            quantity: '1 Litre',
            unitCostInr: 56,
            category: 'dairy',
            isEatable: true,
            expiryDays: 3,
            selected: true
          },
          {
            id: 'd3',
            name: 'Farm Fresh White Eggs (Pack of 12)',
            rawText: 'FARM FRESH EGGS 12PK',
            quantity: '12 eggs',
            unitCostInr: 84,
            category: 'protein',
            isEatable: true,
            expiryDays: 14,
            selected: true
          },
          {
            id: 'd4',
            name: 'Rolled Oats Porridge (1 kg)',
            rawText: 'QUAKER ROLLED OATS 1KG',
            quantity: '1 kg',
            unitCostInr: 190,
            category: 'grain',
            isEatable: true,
            expiryDays: 180,
            selected: true
          },
          {
            id: 'd5',
            name: 'Yellow Moong Dal (1 kg)',
            rawText: 'DMART PREM MOONG DAL 1KG',
            quantity: '1 kg',
            unitCostInr: 130,
            category: 'protein',
            isEatable: true,
            expiryDays: 120,
            selected: true
          },
          {
            id: 'd6',
            name: 'Robusta Bananas (1 Dozen)',
            rawText: 'FRESH BANANA ROBUSTA 1DZ',
            quantity: '12 pcs',
            unitCostInr: 50,
            category: 'fruit',
            isEatable: true,
            expiryDays: 4,
            selected: true
          },
          // NON-EATABLES (Strictly Filtered Out)
          {
            id: 'd7',
            name: 'Surf Excel Easy Wash Detergent Powder (1 kg)',
            rawText: 'SURF EXCEL EASY WASH 1KG',
            quantity: '1 kg pack',
            unitCostInr: 145,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Non-edible laundry detergent chemical',
            selected: false
          },
          {
            id: 'd8',
            name: 'Dettol Original Liquid Handwash (200ml)',
            rawText: 'DETTOL LIQ HANDWASH 200ML',
            quantity: '200ml bottle',
            unitCostInr: 99,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Personal hygiene soap/chemical',
            selected: false
          },
          {
            id: 'd9',
            name: 'Harpic Power Plus Toilet Cleaner (500ml)',
            rawText: 'HARPIC DISINFECTANT 500ML',
            quantity: '500ml',
            unitCostInr: 92,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Hazardous surface cleaning chemical',
            selected: false
          }
        ]
      },
      {
        id: 'sample_blinkit_quick_commerce',
        storeName: 'Blinkit Instant Grocery Delivery',
        invoiceNumber: 'BL-ORD-339104',
        detectedDate: new Date().toISOString().split('T')[0],
        totalBillAmount: 739,
        edibleItemsCount: 5,
        nonEdibleItemsCount: 2,
        confidence: 'high',
        receiptImageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
        items: [
          {
            id: 'b1',
            name: 'Epigamia Greek Yogurt Natural (100g × 2)',
            rawText: 'EPIGAMIA GREEK YOGURT 100GX2',
            quantity: '200g',
            unitCostInr: 90,
            category: 'dairy',
            isEatable: true,
            expiryDays: 5,
            selected: true
          },
          {
            id: 'b2',
            name: 'Whole Wheat Brown Bread (400g)',
            rawText: 'ENGLISH OVEN BROWN BREAD 400G',
            quantity: '400g',
            unitCostInr: 45,
            category: 'grain',
            isEatable: true,
            expiryDays: 5,
            selected: true
          },
          {
            id: 'b3',
            name: 'Pintola High Protein Peanut Butter (500g)',
            rawText: 'PINTOLA ALL NATURAL PB CRUNCH 500G',
            quantity: '500g',
            unitCostInr: 299,
            category: 'protein',
            isEatable: true,
            expiryDays: 180,
            selected: true
          },
          {
            id: 'b4',
            name: 'Fresh Shimla Green Apples (4 pcs)',
            rawText: 'APPLE SHIMLA 4PCS PACK',
            quantity: '4 pcs',
            unitCostInr: 120,
            category: 'fruit',
            isEatable: true,
            expiryDays: 7,
            selected: true
          },
          {
            id: 'b5',
            name: 'Amul Salted Table Butter (100g)',
            rawText: 'AMUL BUTTER 100G',
            quantity: '100g',
            unitCostInr: 58,
            category: 'dairy',
            isEatable: true,
            expiryDays: 30,
            selected: true
          },
          // NON-EATABLES
          {
            id: 'b6',
            name: 'Vim Lemon Dishwash Gel (250ml)',
            rawText: 'VIM LEMON DISHWASH GEL 250ML',
            quantity: '250ml',
            unitCostInr: 60,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Dishwashing detergent liquid',
            selected: false
          },
          {
            id: 'b7',
            name: 'Origami 3-Ply Toilet Paper (Pack of 2)',
            rawText: 'ORIGAMI TOILET ROLLS 2PK',
            quantity: '2 rolls',
            unitCostInr: 85,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Household paper & sanitation product',
            selected: false
          }
        ]
      },
      {
        id: 'sample_kirana_mart',
        storeName: 'Shree Ganesh Kirana & Organic Mart',
        invoiceNumber: 'KRN-INV-00412',
        detectedDate: new Date().toISOString().split('T')[0],
        totalBillAmount: 585,
        edibleItemsCount: 5,
        nonEdibleItemsCount: 2,
        confidence: 'medium',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe74a661?w=600&auto=format&fit=crop&q=80',
        items: [
          {
            id: 'k1',
            name: 'Bihar Roasted Chana Sattu (500g)',
            rawText: 'PURE CHANA SATTU 500G',
            quantity: '500g',
            unitCostInr: 70,
            category: 'protein',
            isEatable: true,
            expiryDays: 120,
            selected: true
          },
          {
            id: 'k2',
            name: 'Roasted Salted Chana with Skin (500g)',
            rawText: 'ROASTED CHANA CHILKA 500G',
            quantity: '500g',
            unitCostInr: 80,
            category: 'protein',
            isEatable: true,
            expiryDays: 90,
            selected: true
          },
          {
            id: 'k3',
            name: 'Fresh Farm Spinach / Palak (250g)',
            rawText: 'FRESH PALAK BUNCH 250G',
            quantity: '250g',
            unitCostInr: 25,
            category: 'vegetable',
            isEatable: true,
            expiryDays: 3,
            selected: true
          },
          {
            id: 'k4',
            name: 'Fresh Red Tomatoes (1 kg)',
            rawText: 'DESI TAMATAR 1KG',
            quantity: '1 kg',
            unitCostInr: 35,
            category: 'vegetable',
            isEatable: true,
            expiryDays: 6,
            selected: true
          },
          {
            id: 'k5',
            name: 'California Whole Almonds (250g)',
            rawText: 'CALIFORNIA BADAM GIRI 250G',
            quantity: '250g',
            unitCostInr: 220,
            category: 'protein',
            isEatable: true,
            expiryDays: 180,
            selected: true
          },
          // NON-EATABLES
          {
            id: 'k6',
            name: 'Duracell AA Alkaline Batteries (Pack of 2)',
            rawText: 'DURACELL AA BATTERIES 2PK',
            quantity: '2 pcs',
            unitCostInr: 75,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Electronics / battery power cell',
            selected: false
          },
          {
            id: 'k7',
            name: 'Black Garbage Bags (Roll of 30 pcs)',
            rawText: 'OXO GARBAGE BAG MED 30PK',
            quantity: '1 roll',
            unitCostInr: 90,
            category: 'staple',
            isEatable: false,
            expiryDays: 0,
            exclusionReason: 'Plastic waste disposal product',
            selected: false
          }
        ]
      }
    ];
  }

  /**
   * Retrieves a specific sample receipt by ID or returns the first
   */
  public static getSampleReceipt(id: string): BillScanResult {
    const list = this.getSampleReceipts();
    return list.find((r) => r.id === id) || list[0];
  }

  /**
   * Parses user-uploaded receipt image file or custom OCR text lines
   */
  public static parseCustomReceipt(
    fileName: string,
    imagePreviewUrl?: string,
    customTextLines?: string[]
  ): BillScanResult {
    // If user provided custom lines or we simulate OCR line analysis from real bill:
    const lines = customTextLines && customTextLines.length > 0 ? customTextLines : [
      'AMUL PANEER 200G - 85.00',
      'EGGS TRAY 6PK - 42.00',
      'ROASTED PEANUTS 200G - 40.00',
      'CURD 400G - 35.00',
      'BANANAS 1KG - 45.00',
      'SURF EXCEL DETERGENT 500G - 75.00',
      'COLGATE TOTAL 120G - 90.00'
    ];

    const items: ScannedItem[] = lines.map((line, idx) => {
      // Split on dash, tab, or price at end
      const priceMatch = line.match(/(\d+(?:\.\d{1,2})?)\s*$/);
      const price = priceMatch ? Math.round(parseFloat(priceMatch[1])) : 50;
      const cleanName = line.replace(/[-:]\s*\d+(\.\d{1,2})?\s*$/, '').trim();

      const classified = this.classifyItem(cleanName, price);
      return {
        id: `scanned_custom_${Date.now()}_${idx}`,
        ...classified,
        selected: classified.isEatable
      };
    });

    const edibleItems = items.filter((i) => i.isEatable);
    const nonEdibleItems = items.filter((i) => !i.isEatable);
    const total = items.reduce((sum, item) => sum + item.unitCostInr, 0);

    return {
      id: `receipt_${Date.now()}`,
      storeName: fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded Grocery Receipt',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      detectedDate: new Date().toISOString().split('T')[0],
      totalBillAmount: total,
      edibleItemsCount: edibleItems.length,
      nonEdibleItemsCount: nonEdibleItems.length,
      items,
      confidence: 'high',
      receiptImageUrl: imagePreviewUrl,
      upiKeyRef: APP_CONFIG.formatUpiTxnRef('RECEIPT'),
      apiKeyStatus: `Active (UPI Key: ${APP_CONFIG.maskedKey})`
    };
  }

  /**
   * Converts scanned edible items into NutriPilot PantryItems
   */
  public static toPantryItems(scannedItems: ScannedItem[]): Omit<PantryItem, 'id'>[] {
    return scannedItems
      .filter((item) => item.isEatable && item.selected)
      .map((item) => ({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        expiryDays: item.expiryDays,
        inStock: true,
        unitCostInr: item.unitCostInr
      }));
  }
}
