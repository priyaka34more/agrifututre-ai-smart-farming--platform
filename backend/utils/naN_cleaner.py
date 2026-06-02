import math
import numpy as np
from typing import Any, Dict, List, Union

def clean_nan(data: Any) -> Any:
    """
    Recursively clean NaN and infinite values from data structures.
    Converts NaN/Inf to safe fallback values for JSON serialization.
    """
    if isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return 0.0  # Safe fallback for NaN/Inf
        return data
    elif isinstance(data, int):
        return data  # Integers can't be NaN
    elif isinstance(data, str):
        return data
    elif isinstance(data, bool):
        return data
    elif isinstance(data, list):
        return [clean_nan(item) for item in data]
    elif isinstance(data, tuple):
        return tuple(clean_nan(item) for item in data)
    elif isinstance(data, dict):
        return {key: clean_nan(value) for key, value in data.items()}
    elif isinstance(data, np.ndarray):
        return clean_nan(data.tolist())
    elif isinstance(data, np.integer):
        return int(data)
    elif isinstance(data, np.floating):
        if np.isnan(data) or np.isinf(data):
            return 0.0
        return float(data)
    else:
        # For any other type, return as-is
        return data

def safe_json_response(data: Any) -> Dict[str, Any]:
    """
    Clean data and return a safe response dictionary.
    """
    return clean_nan(data)
