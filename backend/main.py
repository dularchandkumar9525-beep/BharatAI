import os
import json
from urllib.parse import urlparse
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI(title="BharatAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# GROQ
# =========================

groq_api_key = os.getenv("GROQ_API_KEY")

if not groq_api_key:
    raise RuntimeError("GROQ_API_KEY .env mein nahi mili")

GROQ_MODEL = "openai/gpt-oss-20b"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# =========================
# POSTGRESQL
# =========================

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 5432,
    "dbname": "bharatai",
    "user": "u0_a277",
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


# =========================
# DATA MODELS
# =========================

class SchemeRequest(BaseModel):
    age: int
    gender: str
    state: str
    income: str
    category: str


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "status": "success",
        "message": "🇮🇳 BharatAI Backend is running!"
    }


# =========================
# OFFICIAL URL VALIDATION
# =========================

def is_government_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False

    try:
        parsed = urlparse(url.strip())

        if parsed.scheme != "https":
            return False

        host = (parsed.hostname or "").lower().rstrip(".")

        return (
            host == "gov.in"
            or host == "nic.in"
            or host == "myscheme.gov.in"
            or host.endswith(".gov.in")
            or host.endswith(".nic.in")
        )

    except Exception:
        return False


def add_official_urls(schemes):
    """
    AI ke diye hue URLs par trust nahi karna.
    Known government schemes ke URLs backend se fixed rahenge.
    Unknown schemes ke liye generic official MyScheme portal use hoga.
    """

    OFFICIAL_URLS = {
        # Insurance
        "pmjjby": "https://www.financialservices.gov.in/pmjjby",
        "pradhan mantri jeevan jyoti bima yojana": "https://www.financialservices.gov.in/pmjjby",

        "pmsby": "https://www.financialservices.gov.in/pmsby",
        "pradhan mantri suraksha bima yojana": "https://www.financialservices.gov.in/pmsby",

        # Skill
        "pmkvy": "https://www.pmkvyproject.org/",
        "pradhan mantri kaushal vikas yojana": "https://www.pmkvyproject.org/",

        # Financial inclusion
        "pmjdy": "https://pmjdy.gov.in/",
        "pradhan mantri jan-dhan yojana": "https://pmjdy.gov.in/",

        # LPG
        "pradhan mantri ujjwala yojana": "https://www.pmuy.gov.in/",

        # Government scheme discovery portal
        "myscheme": "https://www.myscheme.gov.in/",
    }

    GENERIC_OFFICIAL = "https://www.myscheme.gov.in/"

    for scheme in schemes:
        if not isinstance(scheme, dict):
            continue

        name = str(scheme.get("scheme_name", "")).strip().lower()

        matched_url = None

        # Longest/more specific matching first
        for key, url in sorted(
            OFFICIAL_URLS.items(),
            key=lambda item: len(item[0]),
            reverse=True
        ):
            if key in name:
                matched_url = url
                break

        # AI ka fake/generated URL kabhi trust nahi karna.
        scheme["apply_url"] = matched_url or GENERIC_OFFICIAL

    return schemes



def normalize_scheme_name(name):
    """
    Same government scheme ke common name variants ko
    ek canonical naam mein convert karta hai.
    """
    name = str(name).strip()

    normalized = name.lower()
    normalized = normalized.replace("(", " ")
    normalized = normalized.replace(")", " ")
    normalized = " ".join(normalized.split())

    aliases = {
        "pradhan mantri jeevan jyoti bima yojana":
            "Pradhan Mantri Jeevan Jyoti Bima Yojana",

        "pradhan mantri jeevan jyoti bima yojana pmjjby":
            "Pradhan Mantri Jeevan Jyoti Bima Yojana",

        "pradhan mantri employment generation programme pmegp":
            "Pradhan Mantri Employment Generation Programme (PMEGP)",

        "prime minister employment generation programme pmegp":
            "Pradhan Mantri Employment Generation Programme (PMEGP)",

        "prime minister s employment generation programme pmegp":
            "Pradhan Mantri Employment Generation Programme (PMEGP)",

        "pradhan mantri mudra yojana pmm y":
            "Pradhan Mantri Mudra Yojana (PMMY)",

        "pradhan mantri mudra yojana pmmy":
            "Pradhan Mantri Mudra Yojana (PMMY)",

        "pradhan mantri kaushal vikas yojana":
            "Pradhan Mantri Kaushal Vikas Yojana",

        "pradhan mantri kaushal vikas yojana pmkvy 4.0":
            "Pradhan Mantri Kaushal Vikas Yojana",

        "up mukhyamantri yuva swarozgar yojana":
            "Mukhyamantri Yuva Swarozgar Yojana (Uttar Pradesh)",

        "up mukhyamantri yuva swarozgar yojana mukhyamantri yuva swarojgar yojana":
            "Mukhyamantri Yuva Swarozgar Yojana (Uttar Pradesh)",

        "mukhyamantri yuva swarozgar yojana uttar pradesh":
            "Mukhyamantri Yuva Swarozgar Yojana (Uttar Pradesh)",

        "mukhyamantri abhyudaya yojana uttar pradesh":
            "Mukhyamantri Abhyudaya Yojana (Uttar Pradesh)",
    }

    return aliases.get(normalized, name)



def validate_scheme_facts(scheme):
    """
    Known schemes ke critical facts ko backend side se enforce karta hai.
    AI ke galat numerical claims ko database tak pahunchne se rokta hai.
    """

    if not isinstance(scheme, dict):
        return False

    name = str(scheme.get("scheme_name", "")).lower().strip()
    benefit = str(scheme.get("benefit_summary", ""))
    eligibility = str(scheme.get("eligibility", ""))

    # PMJJBY: official cover ₹2 lakh, entry age 18-50.
    if "jeevan jyoti bima" in name or "pmjjby" in name:
        scheme["benefit_summary"] = (
            "Pradhan Mantri Jeevan Jyoti Bima Yojana ke tahat "
            "₹2 lakh ka life insurance cover milta hai."
        )

        scheme["eligibility"] = (
            "18 se 50 varsh ki age mein PMJJBY mein enrollment kiya ja sakta hai; "
            "scheme ke official rules aur participating bank/post office ki "
            "conditions lagu hoti hain."
        )

    # PMMY: AI ko arbitrary loan amount/interest claim karne se rokna.
    elif "mudra" in name or "pmmy" in name:
        scheme["benefit_summary"] = (
            "Pradhan Mantri Mudra Yojana eligible micro enterprises ke liye "
            "institutional credit ki suvidha deti hai."
        )

        scheme["eligibility"] = (
            "Eligible micro enterprises aur non-corporate, non-farm "
            "income-generating activities ke liye applicable rules ke "
            "anusar loan mil sakta hai."
        )

    # PMAY-G: arbitrary subsidy/loan figures remove.
    elif "awas yojana" in name and (
        "gramin" in name or "pmay-g" in name or "pmay g" in name
    ):
        scheme["benefit_summary"] = (
            "Pradhan Mantri Awas Yojana-Gramin rural households ke liye "
            "pucca house construction ke liye financial assistance provide karti hai."
        )

        scheme["eligibility"] = (
            "Eligibility government ke prescribed rural housing criteria "
            "aur official verification ke according hoti hai."
        )

    return True

def clean_schemes(schemes):
    if not isinstance(schemes, list):
        return []

    cleaned = []

    for scheme in schemes:
        if not isinstance(scheme, dict):
            continue

        name = normalize_scheme_name(
            str(scheme.get("scheme_name", "")).strip()
        )
        benefit = str(scheme.get("benefit_summary", "")).strip()
        eligibility = str(scheme.get("eligibility", "")).strip()
        how_to_apply = str(scheme.get("how_to_apply", "")).strip()
        apply_url = str(scheme.get("apply_url", "")).strip()

        if not name or not benefit or not eligibility:
            continue

        if not validate_scheme_facts(scheme):
            continue

        # Validation ke baad updated values dobara read karo.
        benefit = str(scheme.get("benefit_summary", "")).strip()
        eligibility = str(scheme.get("eligibility", "")).strip()

        if not is_government_url(apply_url):
            print("REJECTED NON-GOVERNMENT URL:", apply_url)
            continue

        cleaned.append({
            "scheme_name": name,
            "benefit_summary": benefit,
            "eligibility": eligibility,
            "how_to_apply": how_to_apply,
            "apply_url": apply_url
        })

        if len(cleaned) >= 3:
            break

    return cleaned


# =========================
# FIND SCHEMES
# =========================

@app.post("/api/find-schemes")
def find_schemes(data: SchemeRequest):

    prompt = f"""
You are BharatAI, an Indian government schemes assistant.

User:
Age: {data.age}
Gender: {data.gender}
State: {data.state}
Annual Income: {data.income}
Category: {data.category}

Return up to 3 REAL Indian government schemes that may be relevant to this user.

Return ONLY a JSON array.
Do not use Markdown.
Do not use ``` or ```json.
Do not add explanations before or after the JSON.

Each item MUST contain exactly these fields:
[
  {{
    "scheme_name": "string",
    "benefit_summary": "string",
    "eligibility": "string",
    "how_to_apply": "string",
    "apply_url": ""
  }}
]

Rules:
- Use real Indian government schemes only.
- Do not invent scheme names.
- Do not invent eligibility requirements.
- Do not guess benefit amounts.
- Do not guess age limits, income limits, coverage amounts, loan limits, or other numerical facts.
- For known schemes, use only established official facts.
- Important factual constraints:
  * Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY): life insurance cover is ₹2 lakh; entry age is 18 to 50 years.
  * Pradhan Mantri Mudra Yojana (PMMY): provides institutional credit for eligible micro enterprises; do not claim a fixed interest rate or guaranteed loan amount unless officially established for the specific product.
  * Pradhan Mantri Awas Yojana - Gramin (PMAY-G): provides financial assistance for rural housing; do not invent loan amounts, subsidy amounts, or eligibility thresholds.
- If you are uncertain about a factual detail, use a cautious general description instead of inventing a number.
- Write benefit, eligibility and application instructions in clear Hindi/Hinglish.
- Keep each field concise.
- Leave apply_url as an empty string. The backend will add the official URL.
- If no suitable scheme is known, return [].
"""

    # Groq request
    groq_payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "temperature": 0,
    }

    response = None

    for attempt in range(2):
        try:
            response = httpx.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json",
                },
                json=groq_payload,
                timeout=60,
            )

            if response.status_code == 429:
                retry_after = response.headers.get("retry-after", "5")

                try:
                    wait_seconds = min(float(retry_after), 15)
                except ValueError:
                    wait_seconds = 5

                if attempt == 0:
                    print(
                        f"GROQ RATE LIMIT (429). "
                        f"Retrying after {wait_seconds} seconds..."
                    )

                    import time
                    time.sleep(wait_seconds)
                    continue

                print("GROQ RATE LIMIT: retry also returned 429")
                print(response.text[:1000])
                raw_result = "[]"
                break

            if response.status_code >= 400:
                print(
                    f"GROQ API ERROR: HTTP {response.status_code}"
                )
                print(response.text[:1000])
                raw_result = "[]"
                break

            raw_result = response.json()["choices"][0]["message"]["content"].strip()

            print("===== GROQ RAW RESPONSE =====")
            print(raw_result)
            print("===== END GROQ RAW RESPONSE =====")

            break

        except httpx.RequestError as e:
            print("GROQ NETWORK ERROR:", e)
            raw_result = "[]"
            break

        except (KeyError, TypeError, ValueError) as e:
            print("GROQ RESPONSE PARSE ERROR:", e)
            raw_result = "[]"
            break

    else:
        raw_result = "[]"

    # JSON parse
    try:
        if raw_result.startswith("```"):
            raw_result = raw_result.replace("```json", "", 1)
            raw_result = raw_result.replace("```", "")
            raw_result = raw_result.strip()

        schemes = json.loads(raw_result)

    except json.JSONDecodeError:
        print("INVALID GROQ JSON:", raw_result)
        schemes = []

    schemes = add_official_urls(schemes)
    schemes = clean_schemes(schemes)

    # =========================
    # DATABASE SAVE
    # =========================

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Save search history
        cur.execute(
            """
            INSERT INTO search_logs
            (state, income_group, search_type)
            VALUES (%s, %s, %s)
            """,
            (
                data.state,
                data.income,
                "scheme_search"
            )
        )

        # Save generated schemes
        for scheme in schemes:

            scheme_name = normalize_scheme_name(str(scheme.get("scheme_name", "")).strip())
            benefit = scheme.get("benefit_summary", "")
            eligibility = scheme.get("eligibility", "")
            how_to_apply = scheme.get("how_to_apply", "")
            apply_url = scheme.get("apply_url", "")

            description = (
                f"Benefit: {benefit}\n"
                f"Eligibility: {eligibility}\n"
                f"How to apply: {how_to_apply}"
            )

            cur.execute(
                """
                INSERT INTO cached_schemes
                (scheme_name, state, description, apply_url)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (scheme_name, state)
                DO UPDATE SET
                    description = EXCLUDED.description,
                    apply_url = EXCLUDED.apply_url,
                    updated_at = NOW()
                """,
                (
                    scheme_name,
                    data.state,
                    description,
                    apply_url
                )
            )

        conn.commit()

        cur.close()
        conn.close()

    except Exception as db_error:
        print("DATABASE ERROR:", db_error)

    # =========================
    # RESPONSE
    # =========================

    return {
        "status": "success",
        "result": schemes
    }
