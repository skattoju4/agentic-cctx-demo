import datetime
from pydantic import BaseModel
from typing import Optional


class Transaction(BaseModel):
    user: int
    card: int
    year: int
    month: int
    day: int
    time: datetime.time
    amount: str
    use_chip: str
    merchant_name: int
    merchant_city: str
    merchant_state: Optional[str] = None
    zip: Optional[float] = None
    mcc: int
    errors: Optional[str] = None
    is_fraud: str


class User(BaseModel):
    person: str
    current_age: int
    retirement_age: int
    birth_year: int
    birth_month: int
    gender: str
    address: str
    apartment: Optional[int] = None
    city: str
    state: str
    zipcode: int
    latitude: float
    longitude: float
    per_capita_income_zipcode: str
    yearly_income_person: str
    total_debt: str
    fico_score: int
    num_credit_cards: int


class Card(BaseModel):
    user: int
    card_index: int
    card_brand: str
    card_type: str
    card_number: int
    expires: str
    cvv: int
    has_chip: str
    cards_issued: int
    credit_limit: str
    acct_open_date: str
    year_pin_last_changed: int
    card_on_dark_web: str
