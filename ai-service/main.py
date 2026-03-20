from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
from datetime import datetime, timedelta
import cv2
from PIL import Image
import io
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
import os
from pymongo import MongoClient

app = FastAPI(
    title="ODOP Connect AI Service",
    description="AI-powered pricing, recommendations, and forecasting",
    version="1.0.0"
)

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI) if MONGO_URI else None
mongo_db = mongo_client["odop"] if mongo_client else None

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class PriceSuggestionRequest(BaseModel):
    category: str
    location: str
    season: str
    quality: int
    competitor_prices: Optional[List[float]] = None


class SupplierRecommendationRequest(BaseModel):
    buyer_id: str
    requirements: dict


class QualityGradeRequest(BaseModel):
    product_id: str
    image_url: Optional[str] = None


class ChatSmartReplyRequest(BaseModel):
    content: str
    conversation_history: Optional[List[dict]] = None


class ChatTranslateRequest(BaseModel):
    content: str
    target_lang: str


# Simulated ML models and logic

def calculate_price(category: str, location: str, season: str, quality: int) -> float:
    """AI-powered price suggestion algorithm"""
    base_prices = {
        'Vegetables': 5.0,
        'Fruits': 10.0,
        'Grains': 4.0,
        'Spices': 15.0,
        'Dairy': 8.0,
        'Organic': 12.0,
    }

    base = base_prices.get(category, 5.0)

    # Quality factor (1-100)
    quality_factor = (quality / 100) * 0.5 + 0.75

    # Season factor
    season_factors = {
        'peak': 0.7,
        'normal': 1.0,
        'off-peak': 1.3,
    }
    season_factor = season_factors.get(season, 1.0)

    # Location factor
    location_factors = {
        'Maharashtra': 1.1,
        'Gujarat': 1.0,
        'Punjab': 0.9,
        'Karnataka': 1.05,
        'Telangana': 1.0,
    }
    location_factor = location_factors.get(location, 1.0)

    # Add some ML-based randomness
    noise = np.random.normal(0, 0.05)

    suggested_price = base * quality_factor * season_factor * location_factor * (1 + noise)
    return round(suggested_price, 2)


def recommend_suppliers(requirements: dict) -> List[dict]:
    """AI-powered supplier recommendation based on buyer requirements"""
    suppliers = [
        {
            'id': '1',
            'name': 'Rajesh Organic Farms',
            'rating': 4.8,
            'products': 45,
            'location': 'Maharashtra',
            'match_score': 95,
            'certifications': ['Organic', 'GAP'],
            'price_range': (4, 8),
            'delivery_time': 2,
        },
        {
            'id': '2',
            'name': 'Green Valley Agri',
            'rating': 4.6,
            'products': 32,
            'location': 'Gujarat',
            'match_score': 88,
            'certifications': ['Organic'],
            'price_range': (5, 10),
            'delivery_time': 3,
        },
        {
            'id': '3',
            'name': 'Farm Fresh Co.',
            'rating': 4.9,
            'products': 58,
            'location': 'Karnataka',
            'match_score': 82,
            'certifications': ['GAP', 'Export Quality'],
            'price_range': (4, 12),
            'delivery_time': 1,
        },
    ]

    # Filter based on requirements
    filtered = suppliers

    if requirements.get('category'):
        # Would use ML model in production
        pass

    if requirements.get('location'):
        filtered = [s for s in filtered if s['location'].lower() == requirements['location'].lower()]

    if requirements.get('organic_only'):
        filtered = [s for s in filtered if 'Organic' in s['certifications']]

    return filtered


def grade_quality(product_id: str) -> dict:
    """AI-powered quality grading with computer vision defect detection"""
    # In production, this would use a trained TensorFlow/PyTorch model
    
    score = np.random.randint(75, 98)
    
    # Simulate defect detection (bounding boxes)
    # [x, y, w, h] in normalized coordinates (0-100)
    defects = [
        {"type": "spot", "box": [15, 20, 10, 8], "severity": "low"},
        {"type": "bruise", "box": [45, 60, 15, 12], "severity": "medium"}
    ] if score < 90 else []

    # Calculate price impact based on grade
    # Grade A+ (+15%), A (+5%), B (-10%), C (-25%)
    impact = 15 if score >= 90 else 5 if score >= 80 else -10 if score >= 70 else -25

    return {
        'product_id': product_id,
        'grade': 'A+' if score >= 90 else 'A' if score >= 80 else 'B' if score >= 70 else 'C',
        'score': score,
        'defects': defects,
        'factors': {
            'freshness': np.random.randint(85, 98),
            'appearance': np.random.randint(80, 95),
            'size_uniformity': np.random.randint(75, 95),
            'color_consistency': np.random.randint(80, 98),
        },
        'environmental_data': {
            'temperature': 24.5,
            'humidity': 62.0,
            'storage_status': 'Optimal'
        },
        'price_impact': impact,
        'suggestions': [
            "Maintain storage temperature below 22°C to extend freshness.",
            "Improve sorting uniformity to reach A+ grade.",
            "Verify organic certificates for 12% additional premium."
        ],
        'confidence': round(np.random.uniform(0.88, 0.96), 2),
        'blockchain_hash': f"0x{os.urandom(16).hex()}",
        'model_version': 'computer-vision-v2.1',
    }


def preprocess_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(image)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    resized = cv2.resize(bgr, (224, 224))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(np.mean(gray))
    return {
        "blur_score": round(blur_score, 2),
        "brightness": round(brightness, 2),
        "shape": [int(x) for x in resized.shape],
    }


def rank_buyers_ml(farmer: dict, buyers: List[dict]) -> List[dict]:
    if not buyers:
        return []
    
    # Feature engineering for more intelligent matching
    # Factors: Location Match, Demand Match, Reliability, Success Rate, Past History
    
    X = []
    for b in buyers:
        # Calculate individual factors
        location_match = 1.0 if str(b.get("location", "")).lower() == str(farmer.get("location", "")).lower() else 0.2
        demand_factor = min(1.0, float(b.get("recentDemand", 0)) / 1000) if b.get("recentDemand") else 0.5
        trust_score = float(b.get("trustScore", 0.85)) # Default high trust for mock
        success_rate = float(b.get("successRate", 0.92))
        
        # Combine into feature vector
        X.append([location_match, demand_factor, trust_score, success_rate])

    X = np.array(X, dtype=float)
    scaler = MinMaxScaler()
    Xs = scaler.fit_transform(X)
    
    # Farmer preference vector (weights)
    # 1.0 Location, 1.0 Demand, 0.8 Trust, 0.7 Success
    farmer_vec = np.array([[1.0, 1.0, 0.8, 0.7]], dtype=float)
    fs = scaler.transform(farmer_vec)
    
    sims = cosine_similarity(fs, Xs).flatten()
    
    ranked = []
    for i, b in enumerate(buyers):
        score = round(float(sims[i] * 100), 2)
        
        # Breakdown factors for UI
        breakdown = {
            "location": round(X[i][0] * 100, 1),
            "demand": round(X[i][1] * 100, 1),
            "reliability": round(X[i][2] * 100, 1),
            "success": round(X[i][3] * 100, 1)
        }
        
        ranked.append({
            **b, 
            "score": score,
            "breakdown": breakdown,
            "trustScore": X[i][2],
            "successRate": X[i][3],
            "trending": "up" if np.random.random() > 0.5 else "stable"
        })
        
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked


def forecast_demand(category: str) -> dict:
    """Demand forecasting using time series analysis (simulated Prophet)"""
    # In production, would use Facebook Prophet or similar

    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    # Generate forecast data
    base_demand = 100
    trend = 1.05  # 5% growth per month

    forecast = []
    current_month = datetime.now().month

    for i in range(6):
        month_idx = (current_month + i) - 1
        demand = int(base_demand * (trend ** i) * (1 + np.random.normal(0, 0.1)))
        price = round(5 + np.random.uniform(-1, 2), 2)

        forecast.append({
            'month': months[month_idx % 12],
            'demand': demand,
            'predicted_price': price,
            'confidence': round(0.9 - (i * 0.05), 2),
        })

    return {
        'category': category,
        'forecast': forecast,
        'trend': 'increasing' if trend > 1 else 'decreasing',
        'insight': f'{category} demand is projected to grow by {int((trend**6 - 1) * 100)}% over the next 6 months',
        'model': 'Prophet-v1',
    }


def get_smart_replies(content: str) -> List[str]:
    """AI logic to generate contextual smart replies"""
    # In production, use an LLM (GPT-4, Claude, Gemini)
    content_lower = content.lower()
    
    if "price" in content_lower or "cost" in content_lower:
        return ["Is the price negotiable?", "What's your best offer?", "I have a budget of ₹X.", "Can you offer a bulk discount?"]
    if "avail" in content_lower or "stock" in content_lower:
        return ["Is this still available?", "How much stock do you have?", "When will it be back in stock?"]
    if "ship" in content_lower or "deliv" in content_lower:
        return ["What are the shipping charges?", "How long does delivery take?", "Do you deliver to my location?"]
    if "qual" in content_lower or "fresh" in content_lower:
        return ["Can you send more photos?", "When was this harvested?", "Is it organic?"]
        
    return ["Tell me more.", "I'm interested.", "Let's discuss.", "Thank you!"]


def get_negotiation_insight(price: float, category: str) -> dict:
    """AI logic to provide negotiation advice"""
    # Mocking insight based on category base prices
    base_prices = {'Vegetables': 5.0, 'Fruits': 10.0, 'Grains': 4.0}
    base = base_prices.get(category, 5.0)
    
    if price < base * 0.8:
        return {"advice": "This is a very low offer. You might want to counter higher.", "strength": "low"}
    if price > base * 1.2:
        return {"advice": "This is a premium price. Ensure quality meets expectations.", "strength": "high"}
        
    return {"advice": "Fair market price. Good for closing the deal.", "strength": "fair"}


# API Endpoints

@app.get("/")
async def root():
    return {
        "service": "ODOP Connect AI",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/price-suggestion")
async def price_suggestion(request: PriceSuggestionRequest):
    """Get AI-powered price suggestion for a product"""
    try:
        suggested_price = calculate_price(
            request.category,
            request.location,
            request.season,
            request.quality
        )

        return {
            "suggested_price": suggested_price,
            "confidence": 0.85,
            "factors": [
                "Market demand analysis",
                "Seasonal trends",
                "Quality assessment",
                "Location-based pricing",
                "Competitor analysis"
            ],
            "model": "price-optimization-v1"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/supplier-recommendation")
async def supplier_recommendation(request: SupplierRecommendationRequest):
    """Get AI-powered supplier recommendations"""
    try:
        recommendations = recommend_suppliers(request.requirements)

        return {
            "recommendations": recommendations,
            "total_matched": len(recommendations),
            "model": "supplier-matching-v1"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quality-grade")
async def quality_grade(request: QualityGradeRequest):
    """Get AI-powered quality grade for a product"""
    try:
        grade_result = grade_quality(request.product_id)
        if mongo_db is not None:
            mongo_db["quality_results"].insert_one({
                "product_id": request.product_id,
                "grade": grade_result["grade"],
                "score": grade_result["score"],
                "confidence": grade_result["confidence"],
                "created_at": datetime.utcnow(),
            })
        return grade_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quality-grade/upload")
async def quality_grade_upload(product_id: str = Form(...), image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        prep = preprocess_image(image_bytes)
        result = grade_quality(product_id)
        if prep["blur_score"] < 80:
            result["score"] = max(result["score"] - 6, 50)
        if prep["brightness"] < 40:
            result["score"] = max(result["score"] - 5, 50)
        result["grade"] = "A" if result["score"] >= 90 else "B" if result["score"] >= 75 else "C"
        result["preprocessing"] = prep
        if mongo_db is not None:
            mongo_db["quality_results"].insert_one({
                "product_id": product_id,
                "grade": result["grade"],
                "score": result["score"],
                "confidence": result["confidence"],
                "preprocessing": prep,
                "created_at": datetime.utcnow(),
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/demand-forecast/{category}")
async def demand_forecast(category: str):
    """Get demand forecast for a product category"""
    try:
        forecast = forecast_demand(category)
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/smart-replies")
async def chat_smart_replies(request: ChatSmartReplyRequest):
    """Get AI-powered smart reply suggestions"""
    try:
        replies = get_smart_replies(request.content)
        return {"suggestions": replies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/translate")
async def chat_translate(request: ChatTranslateRequest):
    """Translate message content"""
    try:
        # Simple mock translation
        translations = {
            "hi": {"es": "hola", "hi": "नमस्ते"},
            "price": {"es": "precio", "hi": "कीमत"},
        }
        # Real impl would use Google Translate / DeepL
        return {"translated": f"[AI {request.target_lang}]: {request.content}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/negotiation-insight")
async def chat_negotiation_insight(price: float, category: str):
    """Get AI insights for a price offer"""
    try:
        insight = get_negotiation_insight(price, category)
        return insight
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/buyer-recommendation")
async def buyer_recommendation(payload: dict):
    """Rank buyers for a farmer using ML features + optional Mongo aggregation."""
    try:
        farmer = payload.get("farmer", {})
        buyers = payload.get("buyers", [])

        if payload.get("use_mongo", False) and mongo_db is not None:
            pipeline = [
                {"$match": {"status": "delivered"}},
                {"$group": {
                    "_id": "$buyerId",
                    "pastOrders": {"$sum": 1},
                    "recentDemand": {"$sum": "$quantity"},
                    "avgOrderValue": {"$avg": "$totalAmount"},
                }},
                {"$limit": 500},
            ]
            agg = list(mongo_db["orders"].aggregate(pipeline))
            buyers = [{
                "id": x["_id"],
                "pastOrders": x.get("pastOrders", 0),
                "recentDemand": x.get("recentDemand", 0),
                "avgOrderValue": x.get("avgOrderValue", 0),
                "location": payload.get("default_location", ""),
            } for x in agg]

        ranked = rank_buyers_ml(farmer, buyers)
        return {"ranked_buyers": ranked, "count": len(ranked), "model": "sklearn-cosine-v1"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Strategic Analytics Definitions

def calculate_growth_score(farmer_id: str, data: dict) -> dict:
    """Calculates a multi-dimensional growth score for the farmer"""
    # Weights for different dimensions
    weights = {'revenue': 0.35, 'fulfillment': 0.25, 'rating': 0.2, 'innovation': 0.2}
    
    # Normalized scores (0-100)
    scores = {
        'revenue': min(100, (data.get('revenue_growth', 0) / 0.15) * 100), # 15% growth is 100
        'fulfillment': data.get('fulfillment_rate', 95),
        'rating': (data.get('avg_rating', 4.5) / 5.0) * 100,
        'innovation': 85 # Mock for now
    }
    
    total_score = sum(scores[k] * weights[k] for k in weights)
    
    return {
        "score": round(total_score, 1),
        "dimensions": scores,
        "percentile": 88,
        "badge": "Top 10% Gold Farmer",
        "next_milestone": "Reach 92 growth score for Platinum status"
    }

# --- Strategic Analytics Endpoints ---

@app.get("/api/analytics/revenue-metrics/{farmer_id}")
async def get_revenue_metrics(farmer_id: str):
    """1. Revenue & Financial Analytics"""
    return {
        "total_revenue": 1250000.0,
        "growth_rate_yoy": 12.5,
        "avg_order_value": 45000.0,
        "revenue_by_buyer_type": {
            "Government": 45,
            "Private Corporates": 30,
            "Export Houses": 15,
            "Retailers": 10
        },
        "top_performing_districts": ["Satara", "Nashik", "Ratnagiri"],
        "insights": ["Government procurement increased by 15% this quarter.", "Export demand for Spices is at peak cycle."],
        "ai_confidence": 0.94
    }

@app.get("/api/analytics/profitability/{farmer_id}")
async def get_profitability_analysis(farmer_id: str):
    """2. Spend & Profitability Intelligence"""
    return {
        "gross_margin": 32.4,
        "net_profit": 285000.0,
        "cost_breakdown": {
            "Seeds/Input": 20,
            "Logistics": 15,
            "Labor": 25,
            "Storage": 10,
            "Platform Fees": 5
        },
        "efficiency_score": 82,
        "optimizations": [
            {"type": "logistics", "savings": 4500.0, "tip": "Batch ship with neighboring farms in Satara cluster."},
            {"type": "input", "savings": 2200.0, "tip": "Purchase Grade B fertilizer for current Grains cycle."}
        ]
    }

@app.get("/api/analytics/revenue-forecast/{farmer_id}")
async def get_revenue_forecast(farmer_id: str):
    """3. Predictive Revenue Forecasting"""
    months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    forecast = [140000, 155000, 180000, 165000, 145000, 130000]
    return {
        "forecast_6m": [{"month": m, "amount": a} for m, a in zip(months, forecast)],
        "projected_annual": 1850000.0,
        "volatility_index": 0.12,
        "peak_revenue_month": "December",
        "factors": ["XGBoost Historical Trend", "Prophet Seasonal Bias", "Local Weather Forecast"]
    }

@app.get("/api/analytics/buyer-sentiment/{farmer_id}")
async def get_buyer_sentiment(farmer_id: str):
    """4. Buyer Sentiment & Market Pull (Market Analysis)"""
    return {
        "average_sentiment": 8.8,
        "keyword_cloud": ["Quality", "Timely", "Ethical", "Organic", "Competitive"],
        "retention_rate": 78.5,
        "market_share_in_category": 4.2,
        "brand_loyalty_index": "High",
        "buyer_types": ["Retailers (Stable)", "Exporters (Occasional High Volume)"]
    }

@app.get("/api/analytics/tender-insights/{farmer_id}")
async def get_tender_insights(farmer_id: str):
    """5. Tender & RFQ Win-Loss Analytics"""
    return {
        "win_rate": 35.0,
        "total_rfqs_participated": 42,
        "avg_bid_competitiveness": 92.5,
        "reason_for_loss": {
            "Price": 60,
            "Distance": 20,
            "Certification": 15,
            "Logistics Speed": 5
        },
        "win_probability_next_bid": 68.0,
        "suggested_bid_adjustment": -2.5
    }

@app.get("/api/analytics/fulfillment-health/{farmer_id}")
async def get_fulfillment_health(farmer_id: str):
    """6. Order Fulfillment & Operational Health"""
    return {
        "fulfillment_rate": 96.8,
        "on_time_delivery": 92.0,
        "rejection_rate": 1.2,
        "avg_processing_time_hours": 14.5,
        "efficiency_trend": "Improving",
        "operational_bottlenecks": ["Logistics delay in Ratnagiri-Mumbai route", "Packaging material shortage"]
    }

@app.get("/api/analytics/inventory-intelligence/{farmer_id}")
async def get_inventory_intelligence(farmer_id: str):
    """7. AI Inventory & Wastage Intelligence"""
    return {
        "inventory_turnover_ratio": 4.5,
        "wastage_percentage": 2.8,
        "storage_cost_per_unit": 1.5,
        "stockout_risk": "Low",
        "predicted_stockout_date": "2026-05-12",
        "smart_stock_level": 500,
        "units": "KG"
    }

@app.get("/api/analytics/logistics-efficiency/{farmer_id}")
async def get_logistics_efficiency(farmer_id: str):
    """8. Logistics & Supply Chain Optimization"""
    return {
        "avg_freight_cost_per_km": 12.5,
        "logistics_reliability_score": 88,
        "carbon_footprint_kg": 1240.0,
        "recommended_partners": ["EcoTransport Specialists", "FastTrack Agri-Logistics"],
        "route_optimizations": [
            {"route": "Farm -> FCI Hub", "potential_savings": 12, "strategy": "Load aggregation"}
        ]
    }

@app.get("/api/analytics/growth-index/{farmer_id}")
async def get_growth_index(farmer_id: str):
    """9. Strategic Growth Scorecard"""
    data = {
        "revenue_growth": 0.12,
        "fulfillment_rate": 96.8,
        "avg_rating": 4.7
    }
    return calculate_growth_score(farmer_id, data)

@app.get("/api/analytics/market-benchmarking/{farmer_id}")
async def get_market_benchmarking(farmer_id: str):
    """10. Dynamic Market Benchmarking (Competitor Comparison)"""
    return {
        "your_price_index": 1.05,
        "market_avg_price": 120.0,
        "your_quality_percentile": 92,
        "competitive_landscape": "Oversupplied",
        "benchmarks": [
            {"metric": "Yield per Acre", "you": 4.2, "market_avg": 3.8, "top_10": 4.5},
            {"metric": "Digital Adoption", "you": 85, "market_avg": 62, "top_10": 90}
        ]
    }

@app.get("/api/analytics/expansion-opportunities/{farmer_id}")
async def get_expansion_opportunities(farmer_id: str):
    """11. Precision Expansion Opportunities"""
    return {
        "recommended_next_crop": "Horticulture (Pomegranate)",
        "expansion_hotspots": ["Western Maharashtra", "Middle East Exports"],
        "estimated_roi": 24.5,
        "market_gap_probability": 0.72,
        "needed_certifications": ["Global GAP", "HALAL"]
    }

@app.get("/api/analytics/risk-profile/{farmer_id}")
async def get_risk_profile(farmer_id: str):
    """12. Multi-Hazard Risk Intelligence"""
    return {
        "overall_risk_score": 22,
        "risk_breakdown": {
            "Climate": 15,
            "Price Fluctuation": 45,
            "Credit": 10,
            "Policy": 30
        },
        "mitigation_strategies": [
            "Purchase Crop Insurance for Monsoon cycle",
            "Hedge 30% of Grains via Futures"
        ],
        "vulnerability_index": "Low"
    }

@app.get("/api/analytics/compliance-checker/{farmer_id}")
async def get_compliance_checker(farmer_id: str):
    """13. Digital Compliance & Quality Compliance Score"""
    return {
        "compliance_integrity": 98.5,
        "active_certifications": 4,
        "pending_renewals": [
            {"name": "Organic Certification", "due_date": "2026-11-20"}
        ],
        "traceability_score": 100.0,
        "audit_readiness": "High"
    }

@app.get("/api/analytics/digital-footprint/{farmer_id}")
async def get_digital_footprint(farmer_id: str):
    """14. Platform Digital Adoption Index"""
    return {
        "digital_adoption_score": 88,
        "data_completeness": 92.5,
        "app_usage_frequency": "Daily",
        "smart_contract_usage": 15,
        "digital_trust_index": 0.96
    }

@app.get("/api/analytics/sustainability-score/{farmer_id}")
async def get_sustainability_score(farmer_id: str):
    """15. Sustainable Farming & ESG Impact"""
    return {
        "esg_score": 84,
        "environmental_impact": {
            "Water Usage": "Optimized",
            "Chemical Usage": "Low",
            "Soil Health": 78
        },
        "social_contribution": "Provides employment to 12 local workers",
        "governance_adherence": "Full",
        "esg_badge": "Ethical Producer Verified"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)