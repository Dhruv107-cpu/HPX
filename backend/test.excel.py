import pandas as pd

pd.set_option("display.max_columns", None)

df = pd.read_excel(
    r"data\2026\06\capacity2-Northern-2026-05.xls",
    header=None,
    engine="xlrd"
)

print(df.iloc[:10])