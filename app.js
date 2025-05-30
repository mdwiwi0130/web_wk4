const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// 靜態文件服務
app.use(express.static('public'));

// 添加 CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 建立資料庫連接
const db = new sqlite3.Database(path.join(__dirname, 'db', 'prices.db'), (err) => {
  if (err) {
    console.error('資料庫連接錯誤:', err);
  } else {
    console.log('成功連接到 SQLite 資料庫');
  }
});

// 執行爬蟲
app.post('/api/crawler/run', async (req, res) => {
    try {
        console.log('開始執行爬蟲...');
        const pythonProcess = spawn('python', ['fish_price_crawler/crawler.py']);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            const chunk = data.toString();
            console.log('爬蟲輸出:', chunk);
            output += chunk;
        });
        
        pythonProcess.stderr.on('data', (data) => {
            const chunk = data.toString();
            console.error('爬蟲錯誤:', chunk);
            errorOutput += chunk;
        });
        
        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                console.log(`爬蟲進程退出，退出碼: ${code}`);
                if (code === 0) {
                    // 從輸出中提取最後的狀態資訊
                    const statusMatch = output.match(/爬蟲執行狀態：\n-+\n(.*?)$/s);
                    const status = statusMatch ? statusMatch[1].trim() : '爬蟲執行完成';
                    resolve(status);
                } else {
                    reject(new Error(`爬蟲執行失敗，退出碼：${code}\n${errorOutput}`));
                }
            });
        }).then(status => {
            res.json({ status });
        }).catch(error => {
            console.error('爬蟲執行錯誤:', error);
            res.status(500).json({ 
                status: `爬蟲執行失敗: ${error.message}`,
                error: errorOutput
            });
        });
        
    } catch (error) {
        console.error('執行爬蟲時發生錯誤:', error);
        res.status(500).json({ 
            status: `執行爬蟲時發生錯誤: ${error.message}`,
            error: error.stack
        });
    }
});

// 獲取價格數據
app.get('/api/prices', (req, res) => {
  console.log('開始獲取價格數據...');
  const { limit = 20, startDate, endDate } = req.query;
  console.log('查詢參數:', { limit, startDate, endDate });
  
  let sql = 'SELECT date, product_name, avg_price FROM tilapia_prices';
  const params = [];
  
  if (startDate || endDate) {
    sql += ' WHERE';
    if (startDate) {
      sql += ' date >= ?';
      params.push(startDate);
    }
    if (startDate && endDate) {
      sql += ' AND';
    }
    if (endDate) {
      sql += ' date <= ?';
      params.push(endDate);
    }
  }
  
  sql += ' ORDER BY date DESC';
  if (limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit));
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('獲取數據失敗:', err);
      res.status(500).json({ error: '獲取數據失敗' });
      return;
    }
    
    const records = rows.map(row => ({
      date: row.date,
      product_name: row.product_name,
      avg_price: row.avg_price
    }));
    
    // 獲取總記錄數
    let countSql = 'SELECT COUNT(*) as total FROM tilapia_prices';
    const countParams = [];
    
    if (startDate || endDate) {
      countSql += ' WHERE';
      if (startDate) {
        countSql += ' date >= ?';
        countParams.push(startDate);
      }
      if (startDate && endDate) {
        countSql += ' AND';
      }
      if (endDate) {
        countSql += ' date <= ?';
        countParams.push(endDate);
      }
    }
    
    db.get(countSql, countParams, (err, result) => {
      if (err) {
        console.error('獲取記錄總數失敗:', err);
        res.status(500).json({ error: '獲取記錄總數失敗' });
        return;
      }
      
      res.json({
        records,
        total: result.total,
        limit: parseInt(limit)
      });
    });
  });
});

// 搜索價格數據
app.get('/api/prices/search', (req, res) => {
  console.log('開始搜索價格數據...');
  const { term, startDate, endDate } = req.query;
  console.log('搜索參數:', { term, startDate, endDate });
  
  if (!term) {
    return res.status(400).json({ error: '請提供搜尋關鍵字' });
  }
  
  let sql = 'SELECT date, product_name, avg_price FROM tilapia_prices WHERE product_name LIKE ?';
  const params = [`%${term}%`];
  
  if (startDate) {
    sql += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND date <= ?';
    params.push(endDate);
  }
  
  sql += ' ORDER BY date DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('搜索數據失敗:', err);
      res.status(500).json({ error: '搜索數據失敗' });
      return;
    }
    
    const records = rows.map(row => ({
      date: row.date,
      product_name: row.product_name,
      avg_price: row.avg_price
    }));
    
    res.json({
      records,
      total: records.length
    });
  });
});

// 啟動服務器
app.listen(port, () => {
  console.log(`服務器運行在 http://localhost:${port}`);
});
