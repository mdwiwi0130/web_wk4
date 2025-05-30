const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 確保資料庫目錄存在
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 建立資料庫連接
const db = new sqlite3.Database(path.join(dbDir, 'prices.db'), (err) => {
  if (err) {
    console.error('資料庫連接錯誤:', err);
  } else {
    console.log('成功連接到 SQLite 資料庫');
    // 建立資料表
    db.run(`CREATE TABLE IF NOT EXISTS tilapia_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      product_name TEXT NOT NULL,
      avg_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, async (err) => {
      if (err) {
        console.error('建立資料表錯誤:', err);
      } else {
        console.log('資料表建立成功或已存在');
        // 檢查並初始化測試數據
        await checkAndInitData();
      }
    });
  }
});

// 初始化測試數據
const initTestData = () => {
  return new Promise((resolve, reject) => {
    // 先清空現有數據
    db.run('DELETE FROM tilapia_prices', [], (err) => {
      if (err) {
        console.error('清空資料表失敗:', err);
        reject(err);
        return;
      }

      const testData = [
        { date: '2021-01-30', product_name: '吳郭魚', avg_price: 42.9 },
        { date: '2021-02-28', product_name: '吳郭魚', avg_price: 47.1 },
        { date: '2021-03-30', product_name: '吳郭魚', avg_price: 47.6 },
        { date: '2021-04-30', product_name: '吳郭魚', avg_price: 49.4 },
        { date: '2021-05-30', product_name: '吳郭魚', avg_price: 51.7 },
        { date: '2021-06-30', product_name: '吳郭魚', avg_price: 51.5 },
        { date: '2021-07-30', product_name: '吳郭魚', avg_price: 51.8 },
        { date: '2021-08-30', product_name: '吳郭魚', avg_price: 49.8 },
        { date: '2021-09-30', product_name: '吳郭魚', avg_price: 51.5 },
        { date: '2021-10-30', product_name: '吳郭魚', avg_price: 48.6 },
        { date: '2021-11-30', product_name: '吳郭魚', avg_price: 45.2 },
        { date: '2021-12-30', product_name: '吳郭魚', avg_price: 47.3 },
        { date: '2022-01-30', product_name: '吳郭魚', avg_price: 51.3 },
        { date: '2022-02-28', product_name: '吳郭魚', avg_price: 53.6 },
        { date: '2022-03-30', product_name: '吳郭魚', avg_price: 51.3 },
        { date: '2022-04-30', product_name: '吳郭魚', avg_price: 49.2 },
        { date: '2022-05-30', product_name: '吳郭魚', avg_price: 48.0 },
        { date: '2022-06-30', product_name: '吳郭魚', avg_price: 46.9 },
        { date: '2022-07-30', product_name: '吳郭魚', avg_price: 45.0 },
        { date: '2022-08-30', product_name: '吳郭魚', avg_price: 43.4 },
        { date: '2022-09-30', product_name: '吳郭魚', avg_price: 43.1 },
        { date: '2022-10-30', product_name: '吳郭魚', avg_price: 42.9 },
        { date: '2022-11-30', product_name: '吳郭魚', avg_price: 42.7 },
        { date: '2022-12-30', product_name: '吳郭魚', avg_price: 42.4 },
        { date: '2023-01-30', product_name: '吳郭魚', avg_price: 45.3 },
        { date: '2023-02-28', product_name: '吳郭魚', avg_price: 48.0 },
        { date: '2023-03-30', product_name: '吳郭魚', avg_price: 51.3 },
        { date: '2023-04-30', product_name: '吳郭魚', avg_price: 51.1 },
        { date: '2023-05-30', product_name: '吳郭魚', avg_price: 49.2 },
        { date: '2023-06-30', product_name: '吳郭魚', avg_price: 47.9 },
        { date: '2023-07-30', product_name: '吳郭魚', avg_price: 47.9 },
        { date: '2023-08-30', product_name: '吳郭魚', avg_price: 49.1 },
        { date: '2023-09-30', product_name: '吳郭魚', avg_price: 51.9 },
        { date: '2023-10-30', product_name: '吳郭魚', avg_price: 49.3 },
        { date: '2023-11-30', product_name: '吳郭魚', avg_price: 49.5 },
        { date: '2023-12-30', product_name: '吳郭魚', avg_price: 48.5 },
        { date: '2024-01-30', product_name: '吳郭魚', avg_price: 55.5 },
        { date: '2024-02-29', product_name: '吳郭魚', avg_price: 59.3 },
        { date: '2024-03-30', product_name: '吳郭魚', avg_price: 64.4 },
        { date: '2024-04-30', product_name: '吳郭魚', avg_price: 62.8 },
        { date: '2024-05-30', product_name: '吳郭魚', avg_price: 59.4 },
        { date: '2024-06-30', product_name: '吳郭魚', avg_price: 59.4 },
        { date: '2024-07-30', product_name: '吳郭魚', avg_price: 58.9 },
        { date: '2024-08-30', product_name: '吳郭魚', avg_price: 63.3 },
        { date: '2024-09-30', product_name: '吳郭魚', avg_price: 61.7 },
        { date: '2024-10-30', product_name: '吳郭魚', avg_price: 62.0 },
        { date: '2024-11-30', product_name: '吳郭魚', avg_price: 59.1 },
        { date: '2024-12-30', product_name: '吳郭魚', avg_price: 59.1 },
        { date: '2025-01-30', product_name: '吳郭魚', avg_price: 61.0 },
        { date: '2025-02-28', product_name: '吳郭魚', avg_price: 61.4 },
        { date: '2025-03-30', product_name: '吳郭魚', avg_price: 62.5 }
      ];

      const sql = `INSERT INTO tilapia_prices (date, product_name, avg_price) VALUES (?, ?, ?)`;
      let completed = 0;
      
      testData.forEach(data => {
        db.run(sql, [data.date, data.product_name, data.avg_price], (err) => {
          if (err) {
            console.error('插入測試數據失敗:', err);
            reject(err);
          } else {
            completed++;
            if (completed === testData.length) {
              console.log('測試數據初始化完成，共插入', completed, '筆記錄');
              resolve();
            }
          }
        });
      });
    });
  });
};

// 檢查並初始化測試數據
const checkAndInitData = async () => {
  try {
    const total = await getTotalCount();
    console.log('當前資料庫記錄數:', total);
    if (total === 0) {
      console.log('資料庫為空，開始初始化測試數據...');
      await initTestData();
    }
  } catch (err) {
    console.error('初始化測試數據失敗:', err);
  }
};

// 獲取記錄總數
const getTotalCount = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT COUNT(*) as total FROM tilapia_prices`;
    const params = [];
    
    if (startDate || endDate) {
      sql += ` WHERE`;
      if (startDate) {
        sql += ` date >= ?`;
        params.push(startDate);
      }
      if (startDate && endDate) {
        sql += ` AND`;
      }
      if (endDate) {
        sql += ` date <= ?`;
        params.push(endDate);
      }
    }
    
    console.log('執行計數查詢:', sql, '參數:', params);
    
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('獲取記錄總數錯誤:', err);
        reject(err);
      } else {
        resolve(row ? row.total : 0);
      }
    });
  });
};

// 新增價格記錄
const addPrice = (date, productName, avgPrice) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tilapia_prices (date, product_name, avg_price) VALUES (?, ?, ?)`;
    db.run(sql, [date, productName, avgPrice], function(err) {
      if (err) {
        console.error('新增記錄錯誤:', err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

// 獲取所有價格記錄
const getAllPrices = (limit, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM tilapia_prices`;
    const params = [];
    
    if (startDate || endDate) {
      sql += ` WHERE`;
      if (startDate) {
        sql += ` date >= ?`;
        params.push(startDate);
      }
      if (startDate && endDate) {
        sql += ` AND`;
      }
      if (endDate) {
        sql += ` date <= ?`;
        params.push(endDate);
      }
    }
    
    sql += ` ORDER BY date DESC, created_at DESC`;
    
    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }
    
    console.log('執行查詢:', sql, '參數:', params);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('獲取記錄錯誤:', err);
        reject(err);
      } else {
        console.log('查詢結果數量:', rows ? rows.length : 0);
        resolve(rows || []);
      }
    });
  });
};

// 搜尋價格記錄
const searchPrices = (searchTerm, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    console.log('搜尋關鍵字:', searchTerm);
    
    let sql = `SELECT * FROM tilapia_prices WHERE product_name LIKE ?`;
    const params = [`%${searchTerm}%`];
    
    if (startDate || endDate) {
      if (startDate) {
        sql += ` AND date >= ?`;
        params.push(startDate);
      }
      if (endDate) {
        sql += ` AND date <= ?`;
        params.push(endDate);
      }
    }
    
    sql += ` ORDER BY date DESC, created_at DESC`;
    
    console.log('搜尋模式:', params[0]);
    console.log('執行查詢:', sql, '參數:', params);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('搜尋記錄錯誤:', err);
        reject(err);
      } else {
        console.log('搜尋結果數量:', rows ? rows.length : 0);
        if (rows && rows.length > 0) {
          console.log('第一筆記錄:', rows[0]);
        }
        resolve(rows || []);
      }
    });
  });
};

// 關閉資料庫連接
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('關閉資料庫連接錯誤:', err);
    } else {
      console.log('資料庫連接已關閉');
    }
    process.exit(0);
  });
});

module.exports = {
  addPrice,
  getAllPrices,
  searchPrices,
  getTotalCount
}; 