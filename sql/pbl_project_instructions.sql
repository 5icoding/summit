-- pbl_project_instructions: 树形结构（id, parent_id, title, number）
-- parent_id=NULL 为一级节点，子节点 parent_id 指向父节点 id
-- pbl_project_sample: 关联 pbl_project_instructions.id（子节点，id 6-33）
-- 数据来源：萨米特核心素养.xlsx Sheet2（生物降解项目案例）

CREATE TABLE IF NOT EXISTS `pbl_project_instructions` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `parent_id` INT               NULL DEFAULT NULL COMMENT '父节点id，NULL=一级',
  `title`     VARCHAR(500)      NULL DEFAULT NULL COMMENT '中文标题',
  `en_title`  VARCHAR(500)      NULL DEFAULT NULL COMMENT '英文标题',
  `number`    VARCHAR(100)      NULL DEFAULT NULL COMMENT '编号（A/B/C 或 Item A 等）',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_instruction_parent`
    FOREIGN KEY (`parent_id`) REFERENCES `pbl_project_instructions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='PBL项目指导结构表（树形）';

CREATE TABLE IF NOT EXISTS `pbl_project_sample` (
  `id`             INT      NOT NULL AUTO_INCREMENT COMMENT '主键',
  `instruction_id` INT      NOT NULL                COMMENT '关联 pbl_project_instructions.id（子节点）',
  `content`        LONGTEXT          DEFAULT NULL   COMMENT '内容',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sample_instruction`
    FOREIGN KEY (`instruction_id`) REFERENCES `pbl_project_instructions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='PBL项目案例内容表';

-- --------------------------------------------------------
-- 一级父节点 (id 1-5)
-- --------------------------------------------------------
INSERT INTO `pbl_project_instructions` (`parent_id`, `title`, `en_title`, `number`) VALUES
(NULL, '基本信息',  NULL,                       NULL),
(NULL, '学生任务书', 'STUDENT INSTRUCTIONS',     NULL),
(NULL, '教师说明书', 'TEACHER''S GUIDE',          NULL),
(NULL, '评分量规',  'SCORING GUIDES/RUBRICS',    NULL),
(NULL, '附件',     NULL,                        NULL);

-- --------------------------------------------------------
-- 子节点 (id 6-33)，对应原 id 1-28
-- --------------------------------------------------------
INSERT INTO `pbl_project_instructions` (`parent_id`, `number`, `title`, `en_title`) VALUES
-- 基本信息 (parent_id=1)
(1, '名称',    NULL, NULL),
(1, '简介',    NULL, NULL),
(1, '学生作品', NULL, NULL),
-- 学生任务书 (parent_id=2)
(2, 'A', '任务情境',                       'Task context'),
(2, 'B', '最终产出',                       'Final product'),
(2, 'C', '这项任务中你需要展示的知识和技能', 'Knowledge and skills you will need to demonstrate on this task'),
(2, 'D', '所需材料',                       'Materials needed'),
(2, 'E', '时间限制',                       'Time requirements'),
(2, 'F', '评分',                           'Scoring'),
-- 教师说明书 (parent_id=3)
(3, 'A', '任务概述',     'Task overview'),
(3, 'B', '对应标准',     'Aligned standards'),
(3, 'C', '时间限制',     'Time/schedule requirements'),
(3, 'D', '所需材料',     'Materials/resources'),
(3, 'E', '已有知识',     'Prior knowledge'),
(3, 'F', '与课程的联系', 'Connection to curriculum'),
(3, 'G', '教师教学',     'Teacher instructions'),
(3, 'H', '学生支持',     'Student support'),
(3, 'I', '扩展或变化',   'Extensions or variations'),
(3, 'J', '评分',         'Scoring'),
-- 评分量规 (parent_id=4)
(4, 'Bioremediation Rubric', NULL, NULL),
-- 附件 (parent_id=5)
(5, 'Item A', NULL, NULL),
(5, 'Item B', NULL, NULL),
(5, 'Item C', NULL, NULL),
(5, 'Item D', NULL, NULL),
(5, 'Item E', NULL, NULL),
(5, 'Item F', NULL, NULL),
(5, 'Item G', NULL, NULL),
(5, 'Item H', NULL, NULL);

-- --------------------------------------------------------
-- pbl_project_sample 数据（instruction_id 对应子节点 id 6-33）
-- --------------------------------------------------------
INSERT INTO `pbl_project_sample` (`instruction_id`, `content`) VALUES
(6,  '生物降解项目'),
(7,  '在这项任务中，学生们设计了一个实验，使用快速植物来测试他们如何清除铜和锌毒素的环境。\n有三个部分: 1)准备和参加苏格拉底研讨会的电子废物(电子废物)，2)设计和进行一个多星期的实验使用快速植物和铜和锌毒素，和3)分析和交流实验结果在一个实验室报告。'),
(8,  NULL),
(9,  '对新的 iPhone 6感到兴奋吗？你听说过关于 iWatch 的传言吗？你不希望自己有一副谷歌眼镜吗？已经厌倦了你的 Galaxy s 5？在你去商店购买最新最好的智能手机之前，你应该停下来想一想你的新手机从哪里来，以及你打算怎么处理你的旧手机。全球每年有1.4亿部手机被丢弃，这些手机含有数百种化学物质，这些化学物质对人体有毒，并且破坏我们的环境。\n为了完成这项任务，你将作为一个研究小组在硅谷环境保护局(EPA)工作。苹果公司和谷歌公司的高管们已经来到你们面前，要求你们研究清理戴利城、雷德伍德城和圣何塞垃圾填埋场的数百万旧手机、电脑和电视机产生的有毒物质。为了制定一个清理计划，你首先需要设计和进行一个实验，使用快速植物去除垃圾填埋场的电子垃圾毒素。'),
(10, '这个任务的三个部分将发展你的能力，为苏格拉底研讨会做准备和贡献，在实验中设计和收集数据，组织和分析你的数据，并根据证据写出结论和建议。\n\n第一部分: 电子废物问题苏格拉底研讨会\n• 完成苏格拉底研讨会的准备图像式思考辅助工具 (附件B) 通过阅读和录像\n• 参加苏格拉底研讨会，通过提问和回答问题，使用阅读材料和录像带中的证据\n\n第二部分: 设计与实施实验\n• 研究并编写一个实验研究问题和假设\n• 在几个星期内进行实验\n• 在数据表中组织实验数据\n\n第三部分\n• 分析实验数据中的模式\n• 根据实验的证据写出结论\n• 向苹果和谷歌推荐清理垃圾填埋场电子垃圾的最佳方式'),
(11, '• 进行持续的研究项目，以回答问题(包括自己产生的问题)或解决问题，在适当的时候缩小或扩大调查范围，并表现出对被调查对象的理解。\n• 以不同的形式和媒介整合和综合多种信息来源，以便解决一个问题，作出明智的决定，理解一个过程、现象或概念，并解决问题。\n• 使用口头和书面的沟通技巧来学习，评估和表达一系列的任务，目的和听众的想法。根据需要通过计划、修改、编辑和重写来发展和加强写作，同时考虑到读者。\n• 人际交往能力，包括与他人合作的能力，能够有效地参与一系列的对话和协作。'),
(12, '文件:\n• 附件A. 苏格拉底研讨会电子废物\n• 附件B. 图像式思考辅助工具-苏格拉底研讨会\n• 附件C. 背景信息和实验头脑风暴\n• 附件D. 研究问题假说\n• 附件E. 如何设计过程\n• 附件F. 实验室报告分析\n• 附件G. 实验室报告结论\n• 附件H. 实验室报告大纲\n\n建议的阅读材料(文本和视频)包括:\n视频\n• E-waste Hell (Ghana)\n• Story of Stuff: Electronics\n• 60 Minutes: Electronic Wasteland\n• Citizens at Risk (India)\n\n文本\n• E-waste Problem Overview\n• Body Burden Diagram\n• E-Waste Dumping Map\n• E-waste In Landfills\n• Cell Phone Recycling\n• E-waste Recycling in Prisons\n• Facts & Figures on E-waste Recycling\n• State Legislation-E-Waste\n• Toxic Sweatshops (E-waste Recycling in Prisons)\n• Exporting Harm (The High-Tech Trashing of Asia)\n• The Digital Dump (Exporting Re-use and Abuse to Africa)\n• More Reports by Silicon Valley Toxics Coalition'),
(13, '• 第一步: 图像式思考辅助工具: 苏格拉底研讨会准备和第二步: 苏格拉底研讨会: 电子垃圾: 大约2周\n• 第三步: 头脑风暴: 实验设计; 一周\n• 第四步: 实验报告: 研究问题与假设: 一周\n• 第五步: 种植速生植物: 一周\n• 第六步: 实验报告: 程序: 一周\n• 第七步: 向速生植物中添加毒素: 一周\n• 第八步: 实验报告: 数据表: 两周\n• 第九步: 速生植物的最终测量: 一周\n• 第十步: 实验报告: 分析: 一周\n• 第十一步: 实验报告: 结论: 一周\n• 第十二步: 项目清单和同伴评议: 一周\n• 第十三步: 提交计划'),
(14, '你的作品将使用生物降解项目评分。您应该确保自己熟悉描述精通性能期望的语言。'),
(15, '在这项任务中，学生们设计了一个实验，使用速生植物来测试他们如何清除铜和锌毒素的环境。有三个部分: 1)准备和参加苏格拉底研讨会的电子废物(电子废物)，2)设计和进行一个多星期的实验使用快速植物和铜和锌毒素，和3)分析和交流实验结果在一个实验室报告。'),
(16, '1. 共同核心国家标准（美国的课程标准）\nCCSS.ELA-LITERACY.SL.9-10.1.A 参加准备好的讨论，阅读和研究正在研究的材料; 明确地利用准备工作，参考文本中的证据和关于这一主题或问题的其他研究，以促进深思熟虑的、合理的思想交流。\nCCSS.ELA-Literacy.RST.11-12.9 从一系列来源综合信息，使其对一个过程、现象或概念有一个连贯的理解，尽可能解决相互冲突的信息。\nCCSS.ELA-Literacy.WHST.11-12.1.a 引入精确的、有见地的权利要求，确定权利要求的重要性，将权利要求与其他或相反的权利要求区分开来，并创建一个逻辑地排列权利要求、反权利要求、理由和证据的组织。\nCCSS.ELA-Literacy.WHST.11-12.5 根据需要，通过计划、修改、编辑、重写或者尝试一种新的方法来发展和加强写作能力，着重于针对特定目的和读者的最重要的东西。\nCCSS.ELA-Literacy.WHST.11-12.1.e 提供一个结论性陈述或部分来自或支持所提出的论点。\nCCSS.ELA-Literacy.WHST.11-12.7 进行简短和较持续的研究项目，以回答一个问题或解决一个问题; 在适当的时候缩小或扩大调查范围; 综合关于这个问题的多种来源，表明对所调查的主题的理解。\n\n2. 关键能力\n研究、信息分析、技术应用、多种形式的沟通、人际互动和协作。\n\n3. 其他标准\n下一代科学标准\nHS-LS2-7 设计、评估和完善减少人类活动对环境和生物多样性影响的解决方案。'),
(17, '• 第一步: 图像式思考辅助工具: 苏格拉底研讨会准备和第二步: 苏格拉底研讨会: 电子垃圾: 大约2周\n• 第三步: 头脑风暴: 实验设计; 一周\n• 第四步: 实验报告: 研究问题与假设: 一周\n• 第五步: 种植速生植物: 一周\n• 第六步: 实验报告: 程序: 一周\n• 第七步: 向速生植物中添加毒素: 一周\n• 第八步: 实验报告: 数据表: 两周\n• 第九步: 速生植物的最终测量: 一周\n• 第十步: 实验报告: 分析: 一周\n• 第十一步: 实验报告: 结论: 一周\n• 第十二步: 项目清单和同伴评议: 一周\n• 第十三步: 提交计划'),
(18, '文件:\n• 附件A. 苏格拉底研讨会电子废物\n• 附件B. 图像式思考辅助工具-苏格拉底研讨会\n• 附件C. 背景信息和实验头脑风暴\n• 附件D. 研究问题假说\n• 附件E. 如何设计过程\n• 附件F. 实验室报告分析\n• 附件G. 实验室报告结论\n• 附件H. 实验室报告大纲\n\n同学生任务书所列视频与文本资料。'),
(19, '没有提供。'),
(20, '没有提供。'),
(21, '第一步: 图像式思考辅助工具: 苏格拉底研讨会准备: 让学生观看和阅读提供的资源，为苏格拉底研讨会做准备。让学生完成图像式思考辅助工具，为讨论提供证据。\n第二步: 苏格拉底研讨会: 电子废物\n第三步: 头脑风暴: 实验设计: 让学生阅读背景资料，并回答每个部分的反思问题。学生应该阅读并总结两个他们选择的生物修复案例研究。学生应该完成化学案例学习拼图，了解快速植物群体活动。让学生以小组形式回答提供的问题，对实验设计进行头脑风暴。\n第四步: 实验报告: 研究问题与假设: 使用研究问题假设组织者，让学生识别他们团队的生物修复实验变量，形成一个假设，并最终确定他们的生物修复实验设计。\n第五步: 种植速生植物\n第六步: 实验报告: 程序: 让学生完成多次编写程序活动，以发展描述他们的研究方法所需的技能。\n第七步: 向速食植物中添加毒素\n第八步: 实验报告: 数据表\n第九步: 速生植物的最终测量\n第十步: 实验报告: 分析: 让学生回答提供的分析图像式思考辅助工具中的指导性问题，以完成他们的数据分析段落。\n第十一步: 实验报告: 结论: 让学生回答提供的报告结论中的指导性问题，并在图像式思考辅助工具完成他们的报告。\n第十二步: 项目清单和同伴评议\n第十三步: 提交计划'),
(22, '• 为了鼓励合作，允许学生以小组形式工作，并在提交前提供时间/材料供同行评审最终材料。\n• 学生应获得指导图表和句子完成练习，以帮助他们组织信息。\n• 如果需要，为学生提供额外的时间，以预先形成初步的背景研究和准备实验报告。\n• 为学生研究提供了多层次的阅读材料和视频。'),
(23, '没有提供。'),
(24, '学生作品可以使用生物降解项目评分。'),
(25, NULL),
(26, 'PARB CC BY 4.0 Item A. Socratic Seminar E-waste.docx'),
(27, 'PARB CC BY 4.0 Item B. Graphic Organizer - Socratic Seminar .docx'),
(28, 'PARB CC BY 4.0 Item C. Background Info and Experiment Brainstorm.docx'),
(29, 'PARB CC BY 4.0 Item D. Research Question Hypothesis.docx'),
(30, 'PARB CC BY 4.0 Item E. How to Write a Procedure.docx'),
(31, 'PARB CC BY 4.0 Item F. Lab Report Analysis.docx'),
(32, 'PARB CC BY 4.0 Item G. Lab Report Conclusion.docx'),
(33, 'PARB CC BY 4.0 Item H. Lab Report Outline.docx');
