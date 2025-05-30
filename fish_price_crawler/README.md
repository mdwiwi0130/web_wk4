# 鱼价爬虫

这是一个用于爬取台湾渔业署网站吴郭鱼价格的爬虫程序。

## 功能特点

- 自动爬取吴郭鱼最新价格
- 自动解析日期信息
- 将数据保存到SQLite数据库
- 数据存储在 `db/prices.db` 文件中

## 安装步骤

1. 安装依赖：
```bash
pip install -r requirements.txt
```

## 使用方法

运行爬虫：
```bash
python crawler.py
```

## 数据表结构

```sql
CREATE TABLE fish_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE,
    price REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
``` 