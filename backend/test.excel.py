import pandas as pd

df = pd.read_excel(
    r"D:\HPX\backend\data\capacity\2026\06\dgr1-2026-06-24 (2).xls",
    header=None,
    engine="xlrd"
)

pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)
pd.set_option("display.width", None)

for i in range(40):
    print(f"\nROW {i}")
    print(df.iloc[i].tolist())