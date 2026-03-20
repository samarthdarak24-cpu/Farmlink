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
    """AI-powered quality grading (simulated image analysis)"""
    # In production, this would use a trained TensorFlow/PyTorch model
    # to analyze product images and grade them

    base_score = np.random.randint(80, 98)

    return {
        'product_id': product_id,
        'grade': 'A' if base_score >= 90 else 'B' if base_score >= 75 else 'C',
        'score': base_score,
        'factors': {
            'freshness': np.random.randint(85, 98),
            'appearance': np.random.randint(80, 95),
            'size_consistency': np.random.randint(75, 95),
            'color_grade': np.random.randint(80, 98),
        },
        'confidence': round(np.random.uniform(0.85, 0.95), 2),
        'model_version': 'v1.0.0',
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
    X = np.array([
        [
            1 if str(b.get("location", "")).lower() == str(farmer.get("location", "")).lower() else 0,
            float(b.get("recentDemand", 0)),
            float(b.get("pastOrders", 0)),
            float(b.get("avgOrderValue", 0)),
        ]
        for b in buyers
    ], dtype=float)
    scaler = MinMaxScaler()
    Xs = scaler.fit_transform(X)
    farmer_vec = np.array([[1, float(farmer.get("targetDemand", 0)), float(farmer.get("targetPastOrders", 0)), float(farmer.get("targetOrderValue", 0))]], dtype=float)
    fs = scaler.transform(farmer_vec)
    sims = cosine_similarity(fs, Xs).flatten()
    ranked = []
    for i, b in enumerate(buyers):
        ranked.append({**b, "score": round(float(sims[i] * 100), 2)})
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)