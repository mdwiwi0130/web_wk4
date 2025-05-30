import sqlite3
import os
import sys

# 设置标准输出编码为 UTF-8
sys.stdout.reconfigure(encoding='utf-8')

def get_db_connection():
    """建立資料庫連線"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'prices.db')
    return sqlite3.connect(db_path)

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT date, price FROM fish_prices ORDER BY date DESC")
    rows = cursor.fetchall()

    print("\n資料庫中的資料：")
    print("-" * 30)
    print("日期\t\t價格(元/公斤)")
    print("-" * 30)

    for date, price in rows:
        print(f"{date}\t{price}")
        
except Exception as e:
    print(f"錯誤：{str(e)}")
finally:
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
        conn.close() 