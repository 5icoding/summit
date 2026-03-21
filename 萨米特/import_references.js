const XLSX = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/xlsx');
const mysql = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/mysql2/promise');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

async function downloadUrl(url, filename) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(path.join(DOWNLOAD_DIR, filename));
    proto.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(path.join(DOWNLOAD_DIR, filename));
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        downloadUrl(redirectUrl, filename).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve({ success: true, status: res.statusCode, contentType: res.headers['content-type'] });
      });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(path.join(DOWNLOAD_DIR, filename)); } catch(e) {}
      resolve({ success: false, error: err.message });
    }).on('timeout', () => {
      file.close();
      try { fs.unlinkSync(path.join(DOWNLOAD_DIR, filename)); } catch(e) {}
      resolve({ success: false, error: 'timeout' });
    });
  });
}

function classifyLink(link) {
  if (!link) return { type: null, url: null };
  const s = link.toString().trim();
  if (s.startsWith('http://') || s.startsWith('https://')) {
    // fix broken URLs with spaces
    return { type: 'url', url: s.replace(/\s+/g, '') };
  }
  if (s.endsWith('.pdf')) {
    return { type: 'pdf', url: s };
  }
  return { type: 'text', url: null };
}

async function main() {
  const wb = XLSX.readFile(path.join(__dirname, '9pbUM.xlsx'));
  const ws = wb.Sheets['参考文献'];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '750301',
    database: 'Summit',
    charset: 'utf8mb4'
  });

  // Create table
  await conn.execute(`DROP TABLE IF EXISTS pbl_references`);
  await conn.execute(`
    CREATE TABLE pbl_references (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seq INT NOT NULL COMMENT '顺序',
      type VARCHAR(50) COMMENT '类型',
      author TEXT COMMENT '作者',
      year INT COMMENT '年份',
      title TEXT COMMENT '名称',
      source TEXT COMMENT '出处',
      link TEXT COMMENT '链接原始值',
      notes TEXT COMMENT '备注',
      link_type VARCHAR(20) COMMENT 'url/pdf/text/null',
      local_file VARCHAR(255) COMMENT '本地保存文件名',
      download_status VARCHAR(50) COMMENT '下载状态',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='参考文献'
  `);
  console.log('Table pbl_references created.');

  // Skip header row (index 0)
  const dataRows = rows.slice(1).filter(r => r.length > 0 && r[0]);

  let insertCount = 0;
  const urlsToDownload = [];

  for (const row of dataRows) {
    const [seq, type, author, year, title, source, link, notes] = row;
    const { type: linkType, url: cleanUrl } = classifyLink(link);

    let localFile = null;
    if (linkType === 'pdf') {
      localFile = link.toString().trim();
    } else if (linkType === 'url') {
      const safeName = `ref_${seq}_${cleanUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 60)}.html`;
      localFile = safeName;
      urlsToDownload.push({ seq, url: cleanUrl, filename: safeName });
    }

    await conn.execute(
      `INSERT INTO pbl_references (seq, type, author, year, title, source, link, notes, link_type, local_file, download_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seq || null,
        type || null,
        author || null,
        year || null,
        title || null,
        (source === '——' ? null : source) || null,
        link ? link.toString() : null,
        notes || null,
        linkType,
        localFile,
        linkType === 'url' ? 'pending' : (linkType === 'pdf' ? 'local_ref' : null)
      ]
    );
    insertCount++;
    console.log(`Inserted row ${seq}: ${title ? title.slice(0,50) : ''}`);
  }

  console.log(`\nInserted ${insertCount} rows.`);

  // Download URLs
  console.log(`\nDownloading ${urlsToDownload.length} URLs...`);
  for (const { seq, url, filename } of urlsToDownload) {
    console.log(`  [${seq}] ${url}`);
    const result = await downloadUrl(url, filename);
    const status = result.success ? `ok_${result.status}` : `fail_${result.error.slice(0,30)}`;
    console.log(`      => ${status}`);
    await conn.execute(
      `UPDATE pbl_references SET download_status=? WHERE seq=?`,
      [status, seq]
    );
  }

  await conn.end();
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
