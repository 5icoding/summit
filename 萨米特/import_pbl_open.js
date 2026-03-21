const XLSX  = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/xlsx');
const mysql = require('C:/Users/ASUS/AppData/Local/Temp/xlsx_tools/node_modules/mysql2/promise');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const DOWNLOAD_DIR = path.join(__dirname, 'pbl_downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// ── 下载 URL ────────────────────────────────────────────
function downloadUrl(url, filename) {
  return new Promise((resolve) => {
    const cleanUrl = url.replace(/\s+/g, '');
    const proto = cleanUrl.startsWith('https') ? https : http;
    const dest = path.join(DOWNLOAD_DIR, filename);
    const file = fs.createWriteStream(dest);
    proto.get(cleanUrl, { timeout: 15000, rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e) {}
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, cleanUrl).href;
        downloadUrl(loc, filename).then(resolve);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve({ ok: true, status: res.statusCode }); });
    }).on('error', (e) => {
      file.close();
      try { fs.unlinkSync(dest); } catch(_) {}
      resolve({ ok: false, error: e.message });
    }).on('timeout', () => {
      file.close();
      try { fs.unlinkSync(dest); } catch(_) {}
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

// ── 检测灰色背景（年级适用） ───────────────────────────
function hasColor(ws, col, row) {
  // col: 0-based, row: 0-based (xlsx uses 0-based internally)
  const addr = XLSX.utils.encode_cell({ c: col, r: row });
  const cell = ws[addr];
  return cell?.s?.patternType === 'solid';
}

// ── 读取维度值 ▲ ──────────────────────────────────────
function dimVal(row, col) {
  return row[col] === '▲' ? 1 : 0;
}

// ── 主流程 ────────────────────────────────────────────
async function main() {
  const wb = XLSX.readFile(path.join(__dirname, '9pbUM.xlsx'), { cellStyles: true, cellDates: false });
  const ws = wb.Sheets['公开PBL汇总'];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });

  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '750301',
    database: 'Summit', charset: 'utf8mb4'
  });

  // ── 建表 ──────────────────────────────────────────
  await conn.execute('DROP TABLE IF EXISTS pbl_open_project');
  await conn.execute(`
    CREATE TABLE pbl_open_project (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      pa_type       INT            COMMENT 'PA类型',
      is_certified  TINYINT(1)     COMMENT '官方认证 Y=1',
      category      VARCHAR(50)    COMMENT '大类标签',
      subject       VARCHAR(100)   COMMENT '学科大类',
      course_name   VARCHAR(100)   COMMENT '课程名称',
      china_grade   VARCHAR(20)    COMMENT '中国学段',
      grade_range   VARCHAR(30)    COMMENT '案例年级原始值',
      grade_6       TINYINT(1) DEFAULT 0,
      grade_7       TINYINT(1) DEFAULT 0,
      grade_8       TINYINT(1) DEFAULT 0,
      grade_9       TINYINT(1) DEFAULT 0,
      grade_10      TINYINT(1) DEFAULT 0,
      grade_11      TINYINT(1) DEFAULT 0,
      grade_12      TINYINT(1) DEFAULT 0,
      duration      VARCHAR(30)    COMMENT '所需时间',
      name_en       VARCHAR(300)   COMMENT '英文名',
      name_zh       VARCHAR(300)   COMMENT '中文名',
      url_original      TEXT       COMMENT '原链接',
      url_translation   TEXT       COMMENT '翻译后链接',
      sort_num      INT            COMMENT '整理编号',
      notes         TEXT           COMMENT '探月备注',
      -- 文本分析（精读）5维
      d_theme_main_idea      TINYINT(1) DEFAULT 0 COMMENT '主题与中心思想',
      d_viewpoint_purpose    TINYINT(1) DEFAULT 0 COMMENT '观点与目的',
      d_development          TINYINT(1) DEFAULT 0 COMMENT '发展',
      d_structure            TINYINT(1) DEFAULT 0 COMMENT '结构',
      d_word_choice          TINYINT(1) DEFAULT 0 COMMENT '用词选择',
      -- 使用资料 3维
      d_select_source        TINYINT(1) DEFAULT 0 COMMENT '选择相关原始资料',
      d_contextualize_source TINYINT(1) DEFAULT 0 COMMENT '情境化原始资料',
      d_synthesize_source    TINYINT(1) DEFAULT 0 COMMENT '综合多种原始资料',
      -- 探究 3维
      d_raise_question       TINYINT(1) DEFAULT 0 COMMENT '提出问题',
      d_predict_hypothesize  TINYINT(1) DEFAULT 0 COMMENT '预测与假设',
      d_design_procedure     TINYINT(1) DEFAULT 0 COMMENT '设计程序与流程',
      -- 分析与综合 7维
      d_identify_patterns    TINYINT(1) DEFAULT 0 COMMENT '识别模式和关系',
      d_compare_contrast     TINYINT(1) DEFAULT 0 COMMENT '比较与对比',
      d_build_data           TINYINT(1) DEFAULT 0 COMMENT '建立数据和信息',
      d_interpret_connect    TINYINT(1) DEFAULT 0 COMMENT '阐释联系和推断',
      d_build_reasoning      TINYINT(1) DEFAULT 0 COMMENT '建立他人的推理',
      d_evaluate_evidence    TINYINT(1) DEFAULT 0 COMMENT '评判有证据的解释',
      d_build_evidence       TINYINT(1) DEFAULT 0 COMMENT '建立有证据的解释',
      -- 创作与写作 9维
      d_argumentation        TINYINT(1) DEFAULT 0 COMMENT '立论',
      d_informational_essay  TINYINT(1) DEFAULT 0 COMMENT '资料性或解释性论文',
      d_narrative            TINYINT(1) DEFAULT 0 COMMENT '叙事',
      d_counterargument      TINYINT(1) DEFAULT 0 COMMENT '反论',
      d_evidence_selection   TINYINT(1) DEFAULT 0 COMMENT '证据选择',
      d_evidence_interpret   TINYINT(1) DEFAULT 0 COMMENT '证据解释',
      d_evidence_integration TINYINT(1) DEFAULT 0 COMMENT '证据整合',
      d_organization         TINYINT(1) DEFAULT 0 COMMENT '组织结构',
      d_intro_conclusion     TINYINT(1) DEFAULT 0 COMMENT '开头和结尾',
      -- 听与说 4维
      d_discussion           TINYINT(1) DEFAULT 0 COMMENT '讨论或贡献',
      d_preparation          TINYINT(1) DEFAULT 0 COMMENT '准备',
      d_rules_language       TINYINT(1) DEFAULT 0 COMMENT '规则和语言',
      d_style_listening      TINYINT(1) DEFAULT 0 COMMENT '风格和积极倾听',
      -- 产出与演讲 5维
      d_oral_expression      TINYINT(1) DEFAULT 0 COMMENT '口头表达',
      d_multimedia_written   TINYINT(1) DEFAULT 0 COMMENT '笔头表达中的多媒体',
      d_multimedia_oral      TINYINT(1) DEFAULT 0 COMMENT '口头表达中的多媒体',
      d_normativity          TINYINT(1) DEFAULT 0 COMMENT '规范性',
      d_precision            TINYINT(1) DEFAULT 0 COMMENT '精准性',
      -- 其他
      rubric_notes  TEXT           COMMENT '量规使用情况备注',
      local_file    VARCHAR(255)   COMMENT '本地下载文件名',
      download_status VARCHAR(50)  COMMENT '下载状态',
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公开PBL项目汇总'
  `);
  console.log('Table pbl_open_project created.');

  // ── 插入数据 ────────────────────────────────────────
  const dataRows = raw.slice(2); // skip header rows 0 and 1
  const urlsToDownload = [];
  let insertCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length === 0 || row[0] == null) continue;

    const excelRow = i + 2; // 0-based xlsx row index (rows 0,1 = headers)

    // col 6 grade_range raw: if it's a number (date serial), read formatted value
    const g6cell = ws[XLSX.utils.encode_cell({ c: 6, r: excelRow })];
    let gradeRange = null;
    if (g6cell) {
      if (g6cell.t === 'd') {
        gradeRange = g6cell.w || String(g6cell.v);
      } else {
        gradeRange = String(g6cell.v);
      }
    }

    // grade applicability from cell colors (cols 7-13 = grade 6-12)
    const grades = [];
    for (let c = 7; c <= 13; c++) {
      grades.push(hasColor(ws, c, excelRow) ? 1 : 0);
    }

    const url = row[21] ? String(row[21]).trim() : null;
    const sortNum = row[23] ? Number(row[23]) : null;

    let localFile = null;
    if (url) {
      const safeName = `pbl_${sortNum || i}_${url.replace(/[^a-zA-Z0-9]/g, '_').slice(-50)}.html`;
      localFile = safeName;
      urlsToDownload.push({ sortNum, url, localFile });
    }

    const values = [
      row[0]  != null ? Number(row[0]) : null,   // pa_type
      row[1] === 'Y'  ? 1 : 0,                   // is_certified
      row[2]  || null,                            // category
      row[3]  || null,                            // subject
      row[4]  || null,                            // course_name
      row[5]  || null,                            // china_grade
      gradeRange,                                 // grade_range
      grades[0], grades[1], grades[2], grades[3], grades[4], grades[5], grades[6], // grade_6~12
      row[14] || null,                            // duration
      row[19] || null,                            // name_en
      row[20] || null,                            // name_zh
      url,                                        // url_original
      row[22] || null,                            // url_translation
      sortNum,                                    // sort_num
      row[24] || null,                            // notes
      // 36 dimensions (cols 25-60)
      dimVal(row,25), dimVal(row,26), dimVal(row,27), dimVal(row,28), dimVal(row,29),
      dimVal(row,30), dimVal(row,31), dimVal(row,32),
      dimVal(row,33), dimVal(row,34), dimVal(row,35),
      dimVal(row,36), dimVal(row,37), dimVal(row,38), dimVal(row,39), dimVal(row,40), dimVal(row,41), dimVal(row,42),
      dimVal(row,43), dimVal(row,44), dimVal(row,45), dimVal(row,46), dimVal(row,47), dimVal(row,48), dimVal(row,49), dimVal(row,50), dimVal(row,51),
      dimVal(row,52), dimVal(row,53), dimVal(row,54), dimVal(row,55),
      dimVal(row,56), dimVal(row,57), dimVal(row,58), dimVal(row,59), dimVal(row,60),
      row[61] || null,                            // rubric_notes
      localFile,
      url ? 'pending' : null
    ];

    await conn.execute(`
      INSERT INTO pbl_open_project (
        pa_type, is_certified, category, subject, course_name, china_grade, grade_range,
        grade_6, grade_7, grade_8, grade_9, grade_10, grade_11, grade_12,
        duration, name_en, name_zh, url_original, url_translation, sort_num, notes,
        d_theme_main_idea, d_viewpoint_purpose, d_development, d_structure, d_word_choice,
        d_select_source, d_contextualize_source, d_synthesize_source,
        d_raise_question, d_predict_hypothesize, d_design_procedure,
        d_identify_patterns, d_compare_contrast, d_build_data, d_interpret_connect,
        d_build_reasoning, d_evaluate_evidence, d_build_evidence,
        d_argumentation, d_informational_essay, d_narrative, d_counterargument,
        d_evidence_selection, d_evidence_interpret, d_evidence_integration,
        d_organization, d_intro_conclusion,
        d_discussion, d_preparation, d_rules_language, d_style_listening,
        d_oral_expression, d_multimedia_written, d_multimedia_oral, d_normativity, d_precision,
        rubric_notes, local_file, download_status
      ) VALUES (${values.map(() => '?').join(',')})
    `, values);

    console.log(`[${String(sortNum || i).padStart(2)}] ${row[19] || '(no name)'}`);
    insertCount++;
  }

  console.log(`\n已插入 ${insertCount} 条记录`);

  // ── 下载链接 ─────────────────────────────────────────
  console.log(`\n下载 ${urlsToDownload.length} 个链接...`);
  for (const { sortNum, url, localFile } of urlsToDownload) {
    process.stdout.write(`  [${sortNum}] ${url.slice(0,70)} ... `);
    const result = await downloadUrl(url, localFile);
    const status = result.ok ? `ok_${result.status}` : `fail_${String(result.error).slice(0,30)}`;
    console.log(status);
    await conn.execute(
      'UPDATE pbl_open_project SET download_status=? WHERE sort_num=?',
      [status, sortNum]
    );
  }

  await conn.end();
  console.log('\n完成');
}

main().catch(err => { console.error(err); process.exit(1); });
