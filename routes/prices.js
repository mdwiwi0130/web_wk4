const express = require('express');
const router = express.Router();
const priceModel = require('../models/price');

// 獲取所有價格記錄
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const records = await priceModel.getAllPrices(limit, startDate, endDate);
    const total = await priceModel.getTotalCount(startDate, endDate);
    res.json({ records, total, limit });
  } catch (err) {
    console.error('獲取記錄失敗:', err);
    res.status(500).json({ error: '獲取記錄失敗' });
  }
});

// 新增價格記錄
router.post('/', async (req, res) => {
  try {
    const { date, product_name, avg_price } = req.body;
    
    // 驗證輸入
    if (!date || !product_name || avg_price === undefined) {
      return res.status(400).json({ error: '請提供所有必要欄位' });
    }
    
    // 驗證日期格式
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: '日期格式不正確' });
    }
    
    // 驗證價格
    const price = parseFloat(avg_price);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: '價格必須為正數' });
    }
    
    const id = await priceModel.addPrice(date, product_name, price);
    res.json({ id, message: '新增記錄成功' });
  } catch (err) {
    console.error('新增記錄失敗:', err);
    res.status(500).json({ error: '新增記錄失敗' });
  }
});

// 搜尋價格記錄
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    if (!searchTerm) {
      return res.status(400).json({ error: '請提供搜尋關鍵字' });
    }
    
    const records = await priceModel.searchPrices(searchTerm, startDate, endDate);
    const total = records.length;
    res.json({ records, total });
  } catch (err) {
    console.error('搜尋記錄失敗:', err);
    res.status(500).json({ error: '搜尋記錄失敗' });
  }
});

module.exports = router; 