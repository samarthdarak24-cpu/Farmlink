import { Router } from 'express';
import axios from 'axios';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api';

// Helper to handle AI service proxying
const proxyToAI = async (req: any, res: any, path: string, method: 'get' | 'post' = 'get') => {
  try {
    const url = `${AI_SERVICE_URL}${path}`;
    const response = method === 'get' 
      ? await axios.get(url, { params: req.query })
      : await axios.post(url, req.body);
    
    res.json(response.data);
  } catch (error: any) {
    console.error(`AI Service Error (${path}):`, error.message);
    res.status(error.response?.status || 500).json({
      error: 'AI Service Error',
      message: error.message
    });
  }
};

// Legacy Simulated Routes (Kept for compatibility, but could be proxied)
router.post('/price-suggestion', (req, res) => proxyToAI(req, res, '/price-suggestion', 'post'));
router.post('/supplier-recommendation', (req, res) => proxyToAI(req, res, '/supplier-recommendation', 'post'));
router.get('/quality-grade/:productId', (req, res) => proxyToAI(req, res, `/quality-grade/${req.params.productId}`));
router.get('/demand-forecast/:category', (req, res) => proxyToAI(req, res, `/demand-forecast/${req.params.category}`));

// --- Strategic Analytics Routes ---

// 1. Revenue & Financial Analytics
router.get('/analytics/revenue/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/revenue-metrics/${req.params.farmerId}`));

// 2. Spend & Profitability Intelligence
router.get('/analytics/profitability/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/profitability/${req.params.farmerId}`));

// 3. Predictive Revenue Forecasting
router.get('/analytics/revenue-forecast/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/revenue-forecast/${req.params.farmerId}`));

// 4. Buyer Sentiment & Market Pull
router.get('/analytics/buyer-sentiment/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/buyer-sentiment/${req.params.farmerId}`));

// 5. Tender & RFQ Win-Loss Analytics
router.get('/analytics/tender-insights/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/tender-insights/${req.params.farmerId}`));

// 6. Order Fulfillment & Operational Health
router.get('/analytics/fulfillment-health/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/fulfillment-health/${req.params.farmerId}`));

// 7. AI Inventory & Wastage Intelligence
router.get('/analytics/inventory-intelligence/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/inventory-intelligence/${req.params.farmerId}`));

// 8. Logistics & Supply Chain Optimization
router.get('/analytics/logistics-efficiency/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/logistics-efficiency/${req.params.farmerId}`));

// 9. Strategic Growth Scorecard
router.get('/analytics/growth-index/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/growth-index/${req.params.farmerId}`));

// 10. Dynamic Market Benchmarking
router.get('/analytics/market-benchmarking/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/market-benchmarking/${req.params.farmerId}`));

// 11. Precision Expansion Opportunities
router.get('/analytics/expansion-opportunities/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/expansion-opportunities/${req.params.farmerId}`));

// 12. Multi-Hazard Risk Intelligence
router.get('/analytics/risk-profile/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/risk-profile/${req.params.farmerId}`));

// 13. Digital Compliance & Quality Compliance Score
router.get('/analytics/compliance-checker/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/compliance-checker/${req.params.farmerId}`));

// 14. Platform Digital Adoption Index
router.get('/analytics/digital-footprint/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/digital-footprint/${req.params.farmerId}`));

// 15. Sustainable Farming & ESG Impact
router.get('/analytics/sustainability-score/:farmerId', (req, res) => 
  proxyToAI(req, res, `/analytics/sustainability-score/${req.params.farmerId}`));

export default router;