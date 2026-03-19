const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const saveDir = 'E:/shimo/pages/11056';
if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

const files = [
  { id: 1,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Science_711_Bioremediation_%28Teacher%29.docx',          filename: '01_Teacher_Directions.docx' },
  { id: 2,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Science_711_Bioremediation_%28Student%29.docx',          filename: '02_Student_Instructions.docx' },
  { id: 3,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20A.%20Socratic%20Seminar%20E-waste.docx',          filename: '03_Item_A_Socratic_Seminar.docx' },
  { id: 4,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20B.%20Graphic%20Organizer%20-%20Socratic%20Seminar%20.docx', filename: '04_Item_B_Graphic_Organizer.docx' },
  { id: 5,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20C.%20Background%20Info%20and%20Experiment%20Brainstorm.docx', filename: '05_Item_C_Experiment_Brainstorm.docx' },
  { id: 6,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20D.%20Research%20Question%20Hypothesis.docx',      filename: '06_Item_D_Research_Hypothesis.docx' },
  { id: 7,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20E.%20How%20to%20Write%20a%20Procedure.docx',       filename: '07_Item_E_How_to_Write_Procedure.docx' },
  { id: 8,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20F.%20Lab%20Report%20Analysis.docx',               filename: '08_Item_F_Lab_Report_Analysis.docx' },
  { id: 9,  url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20G.%20Lab%20Report%20Conclusion.docx',             filename: '09_Item_G_Lab_Report_Conclusion.docx' },
  { id: 10, url: 'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20H.%20Lab%20Report%20Outline.docx',                filename: '10_Item_H_Lab_Report_Outline.docx' },
  { id: 11, url: 'https://performanceassessmentresourcebank.org/sites/default/files/rubrics/Science_711_Bioremediation%20Rubric_0.pdf',                       filename: '11_Bioremediation_Rubric.pdf' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = { rejectUnauthorized: false };
    https.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlink(dest, () => {});
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const results = [];
  for (const f of files) {
    const dest = path.join(saveDir, f.filename);
    process.stdout.write(`下载 [${f.id}] ${f.filename} ... `);
    try {
      await download(f.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`OK (${size} bytes)`);
      results.push({ id: f.id, filename: f.filename, ok: true });
    } catch (e) {
      console.log(`失败: ${e.message}`);
      results.push({ id: f.id, filename: f.filename, ok: false });
    }
  }

  // 写 SQL 更新语句
  const sqls = results
    .filter(r => r.ok)
    .map(r => {
      const localPath = `pages/11056/${r.filename}`;
      return `UPDATE pbl_project_summit_files SET is_downloaded=1, local_path='${localPath}' WHERE id=${r.id};`;
    });

  const sqlFile = 'E:/shimo/pages/update_downloaded.sql';
  fs.writeFileSync(sqlFile, 'USE summit;\n' + sqls.join('\n') + '\n', 'utf8');
  console.log(`\n生成 SQL: ${sqlFile}`);

  // 执行 SQL
  try {
    execSync(`mysql -uroot -p750301 --default-character-set=utf8mb4 summit < "${sqlFile}"`, { stdio: 'pipe' });
    console.log('数据库更新完成');
  } catch (e) {
    console.log('数据库更新失败:', e.stderr?.toString());
  }

  console.log('\n汇总:');
  results.forEach(r => console.log(`  [${r.ok ? '✓' : '✗'}] ${r.filename}`));
}

run();
