const mysql = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/mysql2/promise');
const { translate } = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/@vitalets/google-translate-api');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function translateText(text) {
  try {
    const res = await translate(text, { to: 'zh-CN' });
    return res.text;
  } catch (e) {
    return null;
  }
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '750301', database: 'Summit'
  });

  const [rows] = await conn.execute(
    'SELECT id, seq, title FROM pbl_references WHERE title_zh IS NULL ORDER BY seq'
  );
  console.log(`需要翻译 ${rows.length} 条`);

  for (const row of rows) {
    const zh = await translateText(row.title);
    if (zh) {
      await conn.execute('UPDATE pbl_references SET title_zh = ? WHERE id = ?', [zh, row.id]);
      console.log(`[${row.seq}] ${zh}`);
    } else {
      console.log(`[${row.seq}] 翻译失败，跳过`);
    }
    await sleep(400);
  }

  await conn.end();
  console.log('\n完成');
}

main().catch(console.error);
