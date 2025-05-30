from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import subprocess
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
    db_path = os.path.join('db', 'prices.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/crawler/run', methods=['POST'])
def run_crawler():
    try:
        # 執行爬蟲腳本
        result = subprocess.run(['python', 'crawler.py'], 
                              capture_output=True, 
                              text=True)
        
        # 解析爬蟲輸出
        output = result.stdout
        error = result.stderr
        print("爬蟲輸出:", output)  # 用於調試
        print("爬蟲錯誤:", error)   # 用於調試
        
        # 檢查爬蟲是否成功執行
        if result.returncode != 0:
            return jsonify({
                'status': f'失敗：爬蟲執行錯誤 - {error}',
                'error': error
            }), 500
        
        # 查詢最新價格
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT date, product_name, avg_price 
            FROM prices 
            WHERE product_name LIKE '%吳郭魚%' 
            ORDER BY date DESC 
            LIMIT 1
        """)
        latest_record = cursor.fetchone()
        
        # 準備回應
        response = {
            'status': '爬蟲執行完成',
            'output': output
        }
        
        # 如果有最新記錄，加入價格資訊
        if latest_record:
            response['data'] = {
                'date': latest_record['date'],
                'product_name': latest_record['product_name'],
                'price': latest_record['avg_price']
            }
            
            # 檢查是否為今日資料
            today = datetime.now().strftime('%Y-%m-%d')
            if latest_record['date'] == today:
                response['status'] = '資料已存在'
            else:
                response['status'] = '成功儲存資料'
        
        return jsonify(response)
        
    except Exception as e:
        print("爬蟲執行錯誤:", str(e))  # 用於調試
        return jsonify({
            'status': f'失敗：{str(e)}',
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/prices', methods=['GET'])
def get_prices():
    try:
        limit = request.args.get('limit', default=20, type=int)
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM prices"
        params = []
        
        if start_date or end_date:
            conditions = []
            if start_date:
                conditions.append("date >= ?")
                params.append(start_date)
            if end_date:
                conditions.append("date <= ?")
                params.append(end_date)
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY date DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        records = cursor.fetchall()
        
        # 取得總記錄數
        cursor.execute("SELECT COUNT(*) FROM prices")
        total = cursor.fetchone()[0]
        
        return jsonify({
            'records': [dict(record) for record in records],
            'total': total,
            'limit': limit
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

@app.route('/api/prices/search', methods=['GET'])
def search_prices():
    try:
        term = request.args.get('term', '')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM prices WHERE product_name LIKE ?"
        params = [f'%{term}%']
        
        if start_date:
            query += " AND date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date <= ?"
            params.append(end_date)
        
        query += " ORDER BY date DESC"
        
        cursor.execute(query, params)
        records = cursor.fetchall()
        
        return jsonify({
            'records': [dict(record) for record in records],
            'total': len(records)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == '__main__':
    app.run(port=3000) 