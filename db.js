const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 確保 db 目錄存在
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// 建立資料庫連接
const dbPath = path.join(dbDir, 'sqlite.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('資料庫連接失敗：', err.message);
        return;
    }
    console.log('成功連接到資料庫！');
    
    // 檢查資料表是否存在，如果不存在則建立
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tilapia_prices'", (err, row) => {
        if (err) {
            console.error('檢查資料表失敗：', err.message);
            return;
        }
        
        if (!row) {
            console.log('建立 tilapia_prices 資料表...');
            // 建立資料表
            db.run(`CREATE TABLE tilapia_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                product_name VARCHAR(50) NOT NULL,
                avg_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('建立資料表失敗：', err.message);
                    return;
                }
                console.log('tilapia_prices 資料表建立成功！');
            });
        } else {
            console.log('tilapia_prices 資料表已存在！');
        }
    });
});

// 測試資料庫連接
db.get("SELECT 1", (err, row) => {
    if (err) {
        console.error('資料庫測試失敗：', err.message);
        return;
    }
    console.log('資料庫測試成功！');
});

// 關閉資料庫連接的函數
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error('關閉資料庫失敗：', err.message);
            return;
        }
        console.log('資料庫連接已關閉');
    });
}

// 匯出資料庫實例和關閉函數
module.exports = {
    db,
    closeDatabase
};

const { db } = require('./db');
db.all("SELECT * FROM tilapia_prices", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(rows);
}); 