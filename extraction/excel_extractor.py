import pandas as pd
from fuzzywuzzy import fuzz

def extract_excel_fields(path):
    df = pd.read_excel(path)
    fields = {"Assets": None, "Liabilities": None, "Equity": None}
    for index, row in df.iterrows():
        label = str(row[0]).lower()
        value = row[1]
        if fuzz.partial_ratio("assets", label) > 80:
            fields["Assets"] = value
        elif fuzz.partial_ratio("liabilities", label) > 80:
            fields["Liabilities"] = value
        elif fuzz.partial_ratio("equity", label) > 80 or "capital" in label:
            fields["Equity"] = value
    return fields
