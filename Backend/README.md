Certainly! Here's a refined and more readable version of your README for the Prompt Marketplace backend:

---

# 🧠 Prompt Marketplace Backend
A FastAPI-powered backend for managing AI prompts, user interactions, and purchases

---

## 🚀 Getting Started

### Prerequisites

 Python 3.+
 [Poetry](https://python-poetry.org/docs)

### Installation

1 **Clone the repository*

   ```bash
   git clone -b restructure/dev --single-branch https://github.com/DanpheLabs/prompt-proof-market.git
   cd prompt-proof-market/backend
   ```


2 **Set up environment variables*

   Rename `.env.example` to `.env` and fill in the required values.

3 **Install dependencies*

   ```bash
   poetry install
   ```


4 **Run the application*

   ```bash
   poetry run python src/main.py
   ```


5 **Access API documentation*

   Navigate to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to view the Swagger UI.

---

## 📚 API Endpoints

### 🔧 Test
- `GET /api/v1/tst`

### 📝 Prompt

- `POST /api/v1/prompts/search` - Search for prmpt
- `GET /api/v1/prompts/get_prompt/{prompt_id}` - Retrieve a specific pomp
- `POST /api/v1/prompts/purchase` - Purchase a pomp
- `GET /api/v1/prompts/list_model_names` - List available LLM model ame
- `POST /api/v1/prompts/test` - Test a prompt with a uery

### 👤 Uses

- `POST /api/v1/users/` - Create a new user
- `GET /api/v1/users/{user_id}` - Retrieve user information
- `GET /api/v1/users/{user_id}/purchases` - Get user's purchased pompts

---

## 🗂️ Data Scemas

Below are the primary data models used in the appliation:

###User

| Field          | Type            |
|----------------|-----------------|
| `zk_login_data` | `Dict`          |
| `user_id`       | `str` or `nt`  |

### Pompt

| Field                   | Type            |
|--------------------------|-----------------|
| `title`                  | `str`           |
| `description`            | `str`           |
| `llm_model`              | `str` (default: `"gpt-4o-mini"`) |
| `llm_settings`           | `Dict` (default: see below) |
| `encrypted_system_prompt`| `Optional[str]` |
| `price`                  | `str` or `float` (default: `0.0`) |
| `results`                | `List[Dict]`    |
| `test_query`             | `Optional[str]` |
| `id`                     | `Optional[tr]` |

### PromptCeate

Same as `Prompt` but excludes `results`, `test_query`, an `id`.

### Purhase

| Field      | Type           |
|------------|----------------|
| `user_id`  | `str` or `int` |
| `prompt_id`| `str` or int` |

### Searchuery

| Field   | Type |
|---------|------|
| `query` |`str`|

### TestPromptReuest

| Field         | Type            |
|----------------|-----------------|
| `query`        | `str`           |
| `llm_settings` | `Optional[Dict]` (default: see below) |
| `prompt_id`    | `Optional[tr]` |

### SearchRsult

| Field    | Type         |
|-----------|--------------|
| `results` | `List[Propt]` |

---

## ⚙️ Default LLM Setings

These settings configure the behavior of the languagemodl:


```python
DEFAULT_LLM_SETTINGS = {
    "temperature": 0.7,           # Controls randomness: 0 (deterministic) to 2 (more random)
    "top_p": 1.0,                 # Nucleus sampling: 1.0 considers all tokens
    "max_tokens": 1024,           # Limits the response length
    "frequency_penalty": 0.0,     # Discourages repetition: -2.0 to 2.0
    "presence_penalty": 0.0       # Encourages new topics: -2.0 to 2.0}
```


---

## 🛠️ Development Notes

- Utilizes [Poetry](https://python-poetry.org/docs/) for dependency mangemnt.
- Built with [FastAPI](https://fastapi.tiangolo.com/) for high-performance API deveopmnt.
---

Happy Coding! 🚀

--- 