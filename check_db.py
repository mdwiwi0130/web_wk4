import sqlite3
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_db_connection():
    db_path = os.path.join('db', 'prices.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/crawler/status', methods=['GET'])
def get_crawler_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 取得最新的吳郭魚價格記錄
        cursor.execute("""
            SELECT date, product_name, avg_price 
            FROM prices 
            WHERE product_name LIKE '%吳郭魚%' 
            ORDER BY date DESC 
            LIMIT 1
        """)
        latest_record = cursor.fetchone()
        
        if latest_record:
            return jsonify({
                'status': 'success',
                'message': '資料已存在',
                'data': {
                    'date': latest_record['date'],
                    'product_name': latest_record['product_name'],
                    'price': latest_record['avg_price']
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '找不到吳郭魚價格記錄'
            })
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'查詢資料庫時發生錯誤: {str(e)}'
        })
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    app.run(port=3001)  # 使用不同的端口避免衝突 