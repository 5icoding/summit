const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const https = require('https');

const srcDir = 'E:/shimo/pages/11056';
const outDir = 'E:/shimo/pages/11056_zh';

function translateChunk(text) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|zh`;
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.responseStatus === 200 ? json.responseData.translatedText : text);
        } catch { resolve(text); }
      });
    }).on('error', () => resolve(text));
  });
}

async function translateText(text) {
  const paragraphs = text.split('\n');
  const translated = [];
  let buffer = '';

  async function flush() {
    if (!buffer.trim()) return;
    const result = await translateChunk(buffer.trim());
    translated.push(result);
    buffer = '';
    await new Promise(r => setTimeout(r, 200));
  }

  for (const para of paragraphs) {
    if ((buffer + '\n' + para).length > 450) await flush();
    buffer += (buffer ? '\n' : '') + para;
  }
  await flush();
  return translated.join('\n');
}

function extractPdfText(filePath) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', data => {
      const text = data.Pages.map(p =>
        p.Texts.map(t => decodeURIComponent(t.R.map(r => r.T).join(''))).join(' ')
      ).join('\n');
      resolve(text);
    });
    parser.on('pdfParser_dataError', reject);
    parser.loadPDF(filePath);
  });
}

async function main() {
  const file = '11_Bioremediation_Rubric.pdf';
  const out  = '11_生物修复评分量规.txt';
  console.log(`处理: ${file}`);
  const text = await extractPdfText(path.join(srcDir, file));
  console.log(`  提取文本: ${text.length} 字符`);
  console.log('  翻译中...');
  const zhText = await translateText(text);
  const outPath = path.join(outDir, out);
  fs.writeFileSync(outPath, zhText, 'utf8');
  console.log(`  已保存: ${out}`);
}

main().catch(console.error);
