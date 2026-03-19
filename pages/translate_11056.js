const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const https = require('https');

const srcDir = 'E:/shimo/pages/11056';
const outDir = 'E:/shimo/pages/11056_zh';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 使用 MyMemory 免费翻译 API（分段翻译）
function translateChunk(text) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|zh`;
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.responseStatus === 200) {
            resolve(json.responseData.translatedText);
          } else {
            resolve(text); // 失败时保留原文
          }
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

// 按段落分块翻译（每块不超过 450 字符）
async function translateText(text) {
  const paragraphs = text.split('\n');
  const translated = [];
  let buffer = '';
  let bufParagraphs = [];

  async function flushBuffer() {
    if (!buffer.trim()) return;
    const result = await translateChunk(buffer.trim());
    translated.push(...result.split('\n'));
    buffer = '';
    bufParagraphs = [];
    await new Promise(r => setTimeout(r, 200)); // 避免限速
  }

  for (const para of paragraphs) {
    if ((buffer + '\n' + para).length > 450) {
      await flushBuffer();
    }
    buffer += (buffer ? '\n' : '') + para;
  }
  await flushBuffer();
  return translated.join('\n');
}

async function processDocx(file, outName) {
  console.log(`\n处理: ${file}`);
  const result = await mammoth.extractRawText({ path: path.join(srcDir, file) });
  const text = result.value;
  console.log(`  提取文本: ${text.length} 字符`);
  console.log('  翻译中...');
  const zhText = await translateText(text);
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, zhText, 'utf8');
  console.log(`  已保存: ${outName}`);
  return outPath;
}

async function processPdf(file, outName) {
  console.log(`\n处理: ${file}`);
  const dataBuffer = fs.readFileSync(path.join(srcDir, file));
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  console.log(`  提取文本: ${text.length} 字符`);
  console.log('  翻译中...');
  const zhText = await translateText(text);
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, zhText, 'utf8');
  console.log(`  已保存: ${outName}`);
  return outPath;
}

async function main() {
  const tasks = [
    { file: '01_Teacher_Directions.docx',        out: '01_教师说明.txt',        type: 'docx' },
    { file: '02_Student_Instructions.docx',       out: '02_学生任务书.txt',       type: 'docx' },
    { file: '03_Item_A_Socratic_Seminar.docx',    out: '03_项目A_苏格拉底研讨.txt', type: 'docx' },
    { file: '04_Item_B_Graphic_Organizer.docx',   out: '04_项目B_图形组织.txt',   type: 'docx' },
    { file: '05_Item_C_Experiment_Brainstorm.docx',out: '05_项目C_实验头脑风暴.txt',type: 'docx' },
    { file: '06_Item_D_Research_Hypothesis.docx', out: '06_项目D_研究假设.txt',   type: 'docx' },
    { file: '07_Item_E_How_to_Write_Procedure.docx',out:'07_项目E_实验步骤写法.txt',type: 'docx' },
    { file: '08_Item_F_Lab_Report_Analysis.docx', out: '08_项目F_报告分析.txt',   type: 'docx' },
    { file: '09_Item_G_Lab_Report_Conclusion.docx',out:'09_项目G_报告结论.txt',   type: 'docx' },
    { file: '10_Item_H_Lab_Report_Outline.docx',  out: '10_项目H_报告提纲.txt',   type: 'docx' },
    { file: '11_Bioremediation_Rubric.pdf',        out: '11_生物修复评分量规.txt', type: 'pdf'  },
  ];

  const results = [];
  for (const t of tasks) {
    try {
      let outPath;
      if (t.type === 'docx') outPath = await processDocx(t.file, t.out);
      else outPath = await processPdf(t.file, t.out);
      results.push({ file: t.file, out: t.out, ok: true });
    } catch (e) {
      console.log(`  错误: ${e.message}`);
      results.push({ file: t.file, out: t.out, ok: false });
    }
  }

  console.log('\n========== 完成 ==========');
  results.forEach(r => console.log(`  [${r.ok ? '✓' : '✗'}] ${r.out}`));
}

main().catch(console.error);
