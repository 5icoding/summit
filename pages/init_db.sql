USE summit;

-- 表1：资源主表
CREATE TABLE IF NOT EXISTS `pbl_project_summit_resources` (
  `id`                    INT          NOT NULL COMMENT '资源编号',
  `title`                 VARCHAR(200) NOT NULL COMMENT '资源标题',
  `url`                   VARCHAR(500) NOT NULL COMMENT '页面地址',
  `task_type`             VARCHAR(100) DEFAULT NULL COMMENT '任务类型',
  `subject`               VARCHAR(100) DEFAULT NULL COMMENT '学科',
  `course`                VARCHAR(100) DEFAULT NULL COMMENT '课程',
  `grade_level`           VARCHAR(50)  DEFAULT NULL COMMENT '具体年级',
  `grade_level_span`      VARCHAR(50)  DEFAULT NULL COMMENT '年级段',
  `duration`              VARCHAR(100) DEFAULT NULL COMMENT '时长',
  `student_collaboration` VARCHAR(100) DEFAULT NULL COMMENT '学生协作程度',
  `source`                VARCHAR(200) DEFAULT NULL COMMENT '来源机构',
  `rating`                FLOAT        DEFAULT 0    COMMENT '评分(0-5)',
  `description`           TEXT         DEFAULT NULL COMMENT '简介',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PBL资源主表';

-- 表2：下载文件表
CREATE TABLE IF NOT EXISTS `pbl_project_summit_files` (
  `id`          INT           NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `resource_id` INT           NOT NULL COMMENT '关联资源ID',
  `file_type`   ENUM('download','rubric') NOT NULL DEFAULT 'download' COMMENT '文件类型',
  `title`       VARCHAR(200)  NOT NULL COMMENT '文件标题',
  `url`         VARCHAR(500)  NOT NULL COMMENT '文件下载地址',
  `sort_order`  INT           DEFAULT 0 COMMENT '排列顺序',
  PRIMARY KEY (`id`),
  KEY `idx_resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PBL资源下载文件表';

-- 表3：标准表
CREATE TABLE IF NOT EXISTS `pbl_project_summit_standards` (
  `id`   INT          NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `code` VARCHAR(100) NOT NULL COMMENT '标准编号',
  `url`  VARCHAR(500) NOT NULL COMMENT '标准页面地址',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PBL标准表';

-- 表4：资源-标准关联表
CREATE TABLE IF NOT EXISTS `pbl_project_summit_resource_standards` (
  `resource_id` INT NOT NULL COMMENT '关联资源ID',
  `standard_id` INT NOT NULL COMMENT '关联标准ID',
  PRIMARY KEY (`resource_id`, `standard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PBL资源与标准关联表';

-- ============================================================
-- 插入数据
-- ============================================================

-- 资源主表
INSERT INTO `pbl_project_summit_resources`
  (`id`, `title`, `url`, `task_type`, `subject`, `course`, `grade_level`, `grade_level_span`, `duration`, `student_collaboration`, `source`, `rating`, `description`)
VALUES (
  11056,
  'Bioremediation',
  'https://performanceassessmentresourcebank.org/resource/11056',
  'Complex Project',
  'Science',
  'Biology',
  '9,10,11',
  'High (9-12)',
  '4 or more weeks',
  'Substantial',
  'Summit Public Schools',
  0,
  '在这个任务中，学生设计一项实验，利用快速植物（Fast Plants）测试其去除环境中铜和锌毒素的效果。该任务共分3个部分：1) 准备并参与一场关于电子废弃物（e-waste）的苏格拉底研讨会；2) 利用快速植物及铜、锌毒素，设计并开展一项为期多周的实验；3) 分析实验结果，并以实验报告的形式进行呈现与交流。'
);

-- 下载文件（download 类型）
INSERT INTO `pbl_project_summit_files` (`resource_id`, `file_type`, `title`, `url`, `sort_order`) VALUES
(11056, 'download', 'Teacher Directions - Bioremediation',  'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Science_711_Bioremediation_%28Teacher%29.docx', 1),
(11056, 'download', 'Student Instructions - Bioremediation','https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Science_711_Bioremediation_%28Student%29.docx', 2),
(11056, 'download', 'Item A - Socratic Seminar E-waste',    'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20A.%20Socratic%20Seminar%20E-waste.docx', 3),
(11056, 'download', 'Item B - Socratic Graphic Organizer',  'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20B.%20Graphic%20Organizer%20-%20Socratic%20Seminar%20.docx', 4),
(11056, 'download', 'Item C - Experiment Brainstorm',       'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20C.%20Background%20Info%20and%20Experiment%20Brainstorm.docx', 5),
(11056, 'download', 'Item D - Research Q Hypothesis',       'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20D.%20Research%20Question%20Hypothesis.docx', 6),
(11056, 'download', 'Item E - How to Write a Procedure',    'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20E.%20How%20to%20Write%20a%20Procedure.docx', 7),
(11056, 'download', 'Item F - Lab Report Analysis',         'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20F.%20Lab%20Report%20Analysis.docx', 8),
(11056, 'download', 'Item G - Lab Report Conclusion',       'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20G.%20Lab%20Report%20Conclusion.docx', 9),
(11056, 'download', 'Item H - Lab Report Outline',          'https://performanceassessmentresourcebank.org/system/files/PARB%20CC%20BY%204.0%20Item%20H.%20Lab%20Report%20Outline.docx', 10);

-- 下载文件（rubric 类型）
INSERT INTO `pbl_project_summit_files` (`resource_id`, `file_type`, `title`, `url`, `sort_order`) VALUES
(11056, 'rubric', 'Summit Public Schools Bioremediation Rubric', 'https://performanceassessmentresourcebank.org/sites/default/files/rubrics/Science_711_Bioremediation%20Rubric_0.pdf', 1);

-- 标准表
INSERT INTO `pbl_project_summit_standards` (`code`, `url`) VALUES
('CCSS.ELA-LITERACY.RST.11-12.9',  'https://performanceassessmentresourcebank.org/standard/98'),
('CCSS.ELA-LITERACY.SL.9-10.1.A',  'https://performanceassessmentresourcebank.org/standard/120'),
('CCSS.ELA-LITERACY.WHST.11-12.1.A','https://performanceassessmentresourcebank.org/standard/143'),
('CCSS.ELA-LITERACY.WHST.11-12.1.E','https://performanceassessmentresourcebank.org/standard/149'),
('CCSS.ELA-LITERACY.WHST.11-12.5', 'https://performanceassessmentresourcebank.org/standard/164'),
('CCSS.ELA-LITERACY.WHST.11-12.7', 'https://performanceassessmentresourcebank.org/standard/167'),
('NGSS.HS-LS2-7',                  'https://performanceassessmentresourcebank.org/standard/9771');

-- 资源-标准关联
INSERT INTO `pbl_project_summit_resource_standards` (`resource_id`, `standard_id`)
SELECT 11056, id FROM `pbl_project_summit_standards`
WHERE code IN (
  'CCSS.ELA-LITERACY.RST.11-12.9',
  'CCSS.ELA-LITERACY.SL.9-10.1.A',
  'CCSS.ELA-LITERACY.WHST.11-12.1.A',
  'CCSS.ELA-LITERACY.WHST.11-12.1.E',
  'CCSS.ELA-LITERACY.WHST.11-12.5',
  'CCSS.ELA-LITERACY.WHST.11-12.7',
  'NGSS.HS-LS2-7'
);
