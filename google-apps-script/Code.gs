/**
 * SheetLogger - Google Apps Script Backend
 * Bu script, Android uygulamasından gelen harcama verilerini
 * Google Sheets'e kaydeder.
 */

// Spreadsheet ayarları
const SHEET_NAME = 'Harcamalar';
const CATEGORIES_SHEET = 'Kategoriler';

/**
 * POST isteklerini işler (Harcama ekleme, güncelleme, silme)
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = JSON.parse(e.postData.contents);
    
    let result;
    
    switch(data.action) {
      case 'add':
        result = addExpense(sheet, data);
        break;
      case 'delete':
        result = deleteExpense(sheet, data.id);
        break;
      case 'update':
        result = updateExpense(sheet, data);
        break;
      default:
        result = { success: false, error: 'Geçersiz action: ' + data.action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET isteklerini işler (Veri okuma)
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const action = e.parameter.action || 'list';
    
    let result;
    
    switch(action) {
      case 'list':
        result = getExpenses(sheet, e.parameter);
        break;
      case 'summary':
        result = getSummary(sheet, e.parameter.month, e.parameter.year);
        break;
      case 'categories':
        result = getCategories();
        break;
      default:
        result = { success: false, error: 'Geçersiz action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ana sheet'i alır veya oluşturur
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Başlık satırını ekle
    sheet.getRange(1, 1, 1, 6).setValues([['ID', 'Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Timestamp']]);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Yeni harcama ekler
 */
function addExpense(sheet, data) {
  const id = Utilities.getUuid();
  const timestamp = new Date().toISOString();
  const date = data.date || new Date().toISOString().split('T')[0];
  
  const newRow = [
    id,
    date,
    data.category || 'Diğer',
    data.description || '',
    parseFloat(data.amount) || 0,
    timestamp
  ];
  
  sheet.appendRow(newRow);
  
  return {
    success: true,
    message: 'Harcama başarıyla eklendi',
    data: {
      id: id,
      date: date,
      category: data.category,
      description: data.description,
      amount: parseFloat(data.amount),
      timestamp: timestamp
    }
  };
}

/**
 * Harcama siler
 */
function deleteExpense(sheet, id) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Harcama silindi' };
    }
  }
  
  return { success: false, error: 'Harcama bulunamadı' };
}

/**
 * Harcama günceller
 */
function updateExpense(sheet, data) {
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      const rowNum = i + 1;
      if (data.date) sheet.getRange(rowNum, 2).setValue(data.date);
      if (data.category) sheet.getRange(rowNum, 3).setValue(data.category);
      if (data.description !== undefined) sheet.getRange(rowNum, 4).setValue(data.description);
      if (data.amount !== undefined) sheet.getRange(rowNum, 5).setValue(parseFloat(data.amount));
      sheet.getRange(rowNum, 6).setValue(new Date().toISOString());
      
      return { success: true, message: 'Harcama güncellendi' };
    }
  }
  
  return { success: false, error: 'Harcama bulunamadı' };
}

/**
 * Harcamaları listeler
 */
function getExpenses(sheet, params) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let expenses = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const expense = {
      id: row[0],
      date: row[1],
      category: row[2],
      description: row[3],
      amount: row[4],
      timestamp: row[5]
    };
    
    // Filtreleme
    let include = true;
    
    if (params.month && params.year) {
      const expenseDate = new Date(row[1]);
      if (expenseDate.getMonth() + 1 !== parseInt(params.month) || 
          expenseDate.getFullYear() !== parseInt(params.year)) {
        include = false;
      }
    }
    
    if (params.category && row[2] !== params.category) {
      include = false;
    }
    
    if (include) {
      expenses.push(expense);
    }
  }
  
  // Tarihe göre sırala (en yeni önce)
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Limit uygula
  if (params.limit) {
    expenses = expenses.slice(0, parseInt(params.limit));
  }
  
  return {
    success: true,
    count: expenses.length,
    data: expenses
  };
}

/**
 * Aylık özet hesaplar
 */
function getSummary(sheet, month, year) {
  const data = sheet.getDataRange().getValues();
  const currentDate = new Date();
  const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
  const targetYear = year ? parseInt(year) : currentDate.getFullYear();
  
  let total = 0;
  const categoryTotals = {};
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const expenseDate = new Date(row[1]);
    
    if (expenseDate.getMonth() + 1 === targetMonth && 
        expenseDate.getFullYear() === targetYear) {
      const amount = parseFloat(row[4]) || 0;
      const category = row[2] || 'Diğer';
      
      total += amount;
      count++;
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    }
  }
  
  // Kategori bazlı dağılımı diziye çevir
  const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: total > 0 ? Math.round((categoryTotals[cat] / total) * 100) : 0
  }));
  
  // Tutara göre sırala
  categoryBreakdown.sort((a, b) => b.amount - a.amount);
  
  return {
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      totalAmount: total,
      expenseCount: count,
      categoryBreakdown: categoryBreakdown
    }
  };
}

/**
 * Varsayılan kategorileri döndürür
 */
function getCategories() {
  const categories = [
    { id: 1, name: 'Yemek', icon: '🍔', color: '#FF6B6B' },
    { id: 2, name: 'Ulaşım', icon: '🚗', color: '#4ECDC4' },
    { id: 3, name: 'Market', icon: '🛒', color: '#45B7D1' },
    { id: 4, name: 'Faturalar', icon: '💡', color: '#96CEB4' },
    { id: 5, name: 'Eğlence', icon: '🎬', color: '#FFEAA7' },
    { id: 6, name: 'Giyim', icon: '👕', color: '#DDA0DD' },
    { id: 7, name: 'Sağlık', icon: '💊', color: '#98D8C8' },
    { id: 8, name: 'Eğitim', icon: '📚', color: '#F7DC6F' },
    { id: 9, name: 'Kira', icon: '🏠', color: '#BB8FCE' },
    { id: 10, name: 'Diğer', icon: '💰', color: '#85C1E9' }
  ];
  
  return {
    success: true,
    data: categories
  };
}

/**
 * Test fonksiyonu - Script'in çalıştığını doğrular
 */
function testScript() {
  const sheet = getOrCreateSheet();
  Logger.log('Sheet hazır: ' + sheet.getName());
  Logger.log('Kategori sayısı: ' + getCategories().data.length);
  Logger.log('Script başarıyla çalışıyor!');
}
