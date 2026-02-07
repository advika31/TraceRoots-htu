// Mock data for all dashboards

export const farmerStats = {
  totalTokens: 1250,
  batchesVerified: 42,
  surplusDonated: 320,
};

export const farmerBatches = [
  {
    id: 1,
    crop: "Tomatoes",
    date: "2025-01-15",
    status: "verified",
    quantity: "150kg",
  },
  {
    id: 2,
    crop: "Wheat",
    date: "2025-01-12",
    status: "pending",
    quantity: "200kg",
  },
  {
    id: 3,
    crop: "Carrots",
    date: "2025-01-10",
    status: "verified",
    quantity: "80kg",
  },
];

export const processorStats = {
  productsCreated: 156,
  tokensEarned: 850,
};

export const processorProducts = [
  {
    id: 1,
    name: "Organic Tomato Sauce",
    batchId: "P-2025-001",
    date: "2025-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Wheat Flour Premium",
    batchId: "P-2025-002",
    date: "2025-01-14",
    status: "active",
  },
];

export const ngoInventory = [
  {
    id: 1,
    item: "Fresh Tomatoes",
    quantity: "20kg",
    donor: "GreenAcres Farm",
    date: "2025-01-15",
  },
  {
    id: 2,
    item: "Wheat Flour",
    quantity: "50kg",
    donor: "Valley Mills",
    date: "2025-01-14",
  },
];

export const adminUsers = {
  farmers: 1240,
  processors: 156,
  ngos: 42,
};

export const blockchainLogs = [
  {
    id: 1,
    txHash: "0x1234...abcd",
    type: "Batch Verified",
    timestamp: "2025-01-15 10:30",
    status: "confirmed",
  },
  {
    id: 2,
    txHash: "0x5678...efgh",
    type: "Token Awarded",
    timestamp: "2025-01-15 09:15",
    status: "confirmed",
  },
];

export const impactStats = {
  totalTokens: 125000,
  mealsDonated: 45000,
  verifiedBatches: 15234,
};

export const traceTreeData = {
  nodes: [
    {
      id: "farm",
      label: "GreenAcres Farm",
      type: "farm",
      details: {
        name: "GreenAcres Farm",
        location: "Delhi, India",
        blockchainHash: "0x1234567890abcdef",
        image: "/images/farm-placeholder.jpg",
      },
    },
    {
      id: "processor",
      label: "FreshDistro",
      type: "processor",
      details: {
        name: "FreshDistro Processing",
        location: "Mumbai, India",
        blockchainHash: "0xabcdef1234567890",
      },
    },
    {
      id: "retailer",
      label: "Local Market",
      type: "retailer",
      details: {
        name: "Local Market Chain",
        location: "Bangalore, India",
        blockchainHash: "0x9876543210fedcba",
      },
    },
  ],
  impact: {
    surplusDonated: 20,
    mealsCreated: 60,
  },
};
