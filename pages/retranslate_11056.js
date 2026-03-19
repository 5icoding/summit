const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const PDFParser = require('pdf2json');
const { translate } = require('@vitalets/google-translate-api');

const srcDir = 'E:/shimo/pages/11056';
const outDir = 'E:/shimo/pages/11056_zh';

// 分块翻译（每块不超过 4000 字符，Google 限制约 5000）
async function translateText(text) {
  const lines = text.split('\n');
  const results = [];
  let buffer = '';

  async function flush() {
    if (!buffer.trim()) { buffer = ''; return; }
    try {
      const r = await translate(buffer, { to: 'zh-CN' });
      results.push(r.text);
    } catch (e) {
      console.log('    翻译块失败，保留原文:', e.message.slice(0, 60));
      results.push(buffer);
    }
    buffer = '';
    await new Promise(r => setTimeout(r, 300));
  }

  for (const line of lines) {
    if ((buffer + '\n' + line).length > 3500) await flush();
    buffer += (buffer ? '\n' : '') + line;
  }
  await flush();
  return results.join('\n');
}

async function processDocx(file, outName) {
  console.log(`\n[docx] ${file}`);
  const result = await mammoth.extractRawText({ path: path.join(srcDir, file) });
  console.log(`  文本: ${result.value.length} 字符`);
  const zh = await translateText(result.value);
  fs.writeFileSync(path.join(outDir, outName), zh, 'utf8');
  console.log(`  ✓ 已保存: ${outName}`);
}

async function processPdf(file, outName) {
  console.log(`\n[pdf] ${file}`);
  const text = await new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', data => {
      resolve(data.Pages.map(p =>
        p.Texts.map(t => decodeURIComponent(t.R.map(r => r.T).join(''))).join(' ')
      ).join('\n'));
    });
    parser.on('pdfParser_dataError', reject);
    parser.loadPDF(path.join(srcDir, file));
  });
  console.log(`  文本: ${text.length} 字符`);
  const zh = await translateText(text);
  fs.writeFileSync(path.join(outDir, outName), zh, 'utf8');
  console.log(`  ✓ 已保存: ${outName}`);
}

async function main() {
  const tasks = [
    { file: '04_Item_B_Graphic_Organizer.docx',    out: '04_项目B_图形组织.txt',    type: 'docx' },
    { file: '05_Item_C_Experiment_Brainstorm.docx', out: '05_项目C_实验头脑风暴.txt', type: 'docx' },
    { file: '06_Item_D_Research_Hypothesis.docx',   out: '06_项目D_研究假设.txt',    type: 'docx' },
    { file: '07_Item_E_How_to_Write_Procedure.docx',out: '07_项目E_实验步骤写法.txt', type: 'docx' },
    { file: '08_Item_F_Lab_Report_Analysis.docx',   out: '08_项目F_报告分析.txt',    type: 'docx' },
    { file: '09_Item_G_Lab_Report_Conclusion.docx', out: '09_项目G_报告结论.txt',    type: 'docx' },
    { file: '10_Item_H_Lab_Report_Outline.docx',    out: '10_项目H_报告提纲.txt',    type: 'docx' },
    { file: '11_Bioremediation_Rubric.pdf',         out: '11_生物修复评分量规.txt',  type: 'pdf'  },
  ];

  for (const t of tasks) {
    try {
      if (t.type === 'docx') await processDocx(t.file, t.out);
      else await processPdf(t.file, t.out);
    } catch (e) {
      console.log(`  ✗ 失败: ${e.message}`);
    }
  }

  console.log('\n========== 全部完成 ==========');
}

main().catch(console.error);
