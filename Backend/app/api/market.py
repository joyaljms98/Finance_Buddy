from fastapi import APIRouter
import yfinance as yf
from typing import Dict
from pydantic import BaseModel

router = APIRouter()

class TickerResponse(BaseModel):
    name: str
    price: str
    change_pct: str
    is_positive: bool

# Mappings of display names to Yahoo Finance symbols
TICKERS = {
    "NIFTY 50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANK NIFTY": "^NSEBANK",
    "GOLD": "GC=F",
    "USD/INR": "INR=X",
    "CRUDE OIL": "CL=F"
}

@router.get("/tickers")
async def get_market_tickers():
    results = []
    
    for name, symbol in TICKERS.items():
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="2d")
            
            if not df.empty and len(df) >= 1:
                curr_close = df['Close'].iloc[-1]
                prev_close = df['Close'].iloc[-2] if len(df) > 1 else curr_close
                
                # Extract scalar values from Pandas Series/floats
                if hasattr(curr_close, "item"): curr_close = curr_close.item()
                if hasattr(prev_close, "item"): prev_close = prev_close.item()
                    
                change = curr_close - prev_close
                change_pct = (change / prev_close) * 100 if prev_close else 0.0
                
                results.append({
                    "name": name,
                    "price": f"{curr_close:,.2f}",
                    "change_pct": f"{abs(change_pct):.2f}%",
                    "is_positive": change_pct >= 0
                })
            else:
                results.append({
                    "name": name,
                    "price": "0.00",
                    "change_pct": "0.00%",
                    "is_positive": True
                })
        except Exception as e:
            print(f"[Market] Error fetching {symbol}: {e}")
            results.append({
                "name": name,
                "price": "N/A",
                "change_pct": "0.00%",
                "is_positive": True
            })


    return {"status": "success", "data": results}
