const mysql = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
  const s = String(v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
  return "'" + s + "'";
}

function rowsToInsert(rows, table) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const colList = '`' + cols.join('`,`') + '`';
  const valueLines = rows.map(r => '(' + cols.map(c => escapeVal(r[c])).join(',') + ')');
  return 'INSERT INTO `' + table + '` (' + colList + ') VALUES\n' + valueLines.join(',\n') + ';';
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '750301', database: 'Summit'
  });

  const outDir = path.dirname(__filename);

  // ── pbl_references ────────────────────────────────
  {
    const [[tbl]] = await conn.execute('SHOW CREATE TABLE pbl_references');
    const [rows]  = await conn.execute('SELECT * FROM pbl_references ORDER BY seq');
    let out = '-- ============================================================\n';
    out += '-- 表：pbl_references  参考文献（60条）\n';
    out += '-- ============================================================\n\n';
    out += 'DROP TABLE IF EXISTS `pbl_references`;\n\n';
    out += tbl['Create Table'] + ';\n\n';
    out += rowsToInsert(rows, 'pbl_references') + '\n';
    fs.writeFileSync(path.join(outDir, 'pbl_references.sql'), out, 'utf8');
    console.log('pbl_references.sql  (' + rows.length + ' rows)');
  }

  // ── pbl_open_project ──────────────────────────────
  {
    const [[tbl]] = await conn.execute('SHOW CREATE TABLE pbl_open_project');
    const [rows]  = await conn.execute('SELECT * FROM pbl_open_project ORDER BY sort_num');
    let out = '-- ============================================================\n';
    out += '-- 表：pbl_open_project  公开PBL项目汇总（36条）\n';
    out += '-- ============================================================\n\n';
    out += 'DROP TABLE IF EXISTS `pbl_open_project`;\n\n';
    out += tbl['Create Table'] + ';\n\n';
    out += rowsToInsert(rows, 'pbl_open_project') + '\n';
    fs.writeFileSync(path.join(outDir, 'pbl_open_project.sql'), out, 'utf8');
    console.log('pbl_open_project.sql  (' + rows.length + ' rows)');
  }

  await conn.end();
  console.log('\n完成');
}

main().catch(console.error);
