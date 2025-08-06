export interface Transaction {
    user: number;
    card: number;
    year: number;
    month: number;
    day: number;
    time: string;
    amount: string;
    use_chip: string;
    merchant_name: number;
    merchant_city: string;
    merchant_state?: string;
    zip?: number;
    mcc: number;
    errors?: string;
    is_fraud: string;
}

export interface User {
    person: string;
    current_age: number;
    retirement_age: number;
    birth_year: number;
    birth_month: number;
    gender: string;
    address: string;
    apartment?: number;
    city: string;
    state: string;
    zipcode: number;
    latitude: number;
    longitude: number;
    per_capita_income_zipcode: string;
    yearly_income_person: string;
    total_debt: string;
    fico_score: number;
    num_credit_cards: number;
}

export interface Card {
    user: number;
    card_index: number;
    card_brand: string;
    card_type: string;
    card_number: number;
    expires: string;
    cvv: number;
    has_chip: string;
    cards_issued: number;
    credit_limit: string;
    acct_open_date: string;
    year_pin_last_changed: number;
    card_on_dark_web: string;
}
