import type { Patient, DrugCategory, MemberLevel } from '@/types';

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];
const drugNames: Record<DrugCategory, string[]> = {
  '抗肿瘤靶向药': ['甲磺酸伊马替尼片', '吉非替尼片', '盐酸埃克替尼片', '甲磺酸奥希替尼片', '克唑替尼胶囊'],
  '自身免疫抑制剂': ['他克莫司胶囊', '吗替麦考酚酯片', '环孢素软胶囊', '甲氨蝶呤片', '硫唑嘌呤片'],
  '冷链生物制剂': ['注射用重组人Ⅱ型肿瘤坏死因子受体', '阿达木单抗注射液', '依那西普注射液', '英夫利昔单抗', '利妥昔单抗注射液'],
  '抗病毒药物': ['恩替卡韦片', '替诺福韦酯', '索磷布韦维帕他韦', '拉米夫定片', '齐多夫定片'],
  '心血管慢病药': ['苯磺酸氨氯地平片', '阿托伐他汀钙片', '硫酸氢氯吡格雷片', '缬沙坦胶囊', '琥珀酸美托洛尔缓释片'],
  '糖尿病用药': ['盐酸二甲双胍缓释片', '格列美脲片', '阿卡波糖片', '西格列汀片', '达格列净片'],
  '罕见病特效药': ['注射用伊米苷酶', '阿加糖酶β注射剂', '注射用拉罗尼酶', '氯苯唑酸软胶囊', '丁苯那嗪片'],
};

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
}

function randomPhone(): string {
  return '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

const categories: DrugCategory[] = [
  '抗肿瘤靶向药',
  '自身免疫抑制剂',
  '冷链生物制剂',
  '抗病毒药物',
  '心血管慢病药',
  '糖尿病用药',
  '罕见病特效药',
];

const levels: MemberLevel[] = ['普通', '普通', '普通', '银卡', '银卡', '金卡', '钻石'];

const allTags = ['新客', '老客', '高价值', '停药风险', '需重点关注', '过敏史', '老年患者', '特殊病种'];

function generatePatients(count: number): Patient[] {
  const patients: Patient[] = [];
  const storePharmacistMap: Record<string, string[]> = {
    'store-001': ['pharm-001', 'pharm-002'],
    'store-002': ['pharm-003', 'pharm-004'],
    'store-003': ['pharm-005', 'pharm-006'],
    'store-004': ['pharm-007', 'pharm-008'],
    'store-005': ['pharm-009', 'pharm-010'],
    'store-006': ['pharm-011', 'pharm-012'],
  };
  const storeIds = Object.keys(storePharmacistMap);

  for (let i = 0; i < count; i++) {
    const storeId = storeIds[i % storeIds.length];
    const pharmacistIds = storePharmacistMap[storeId];
    const pharmacistId = pharmacistIds[i % pharmacistIds.length];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const drugList = drugNames[category];
    const drugName = drugList[Math.floor(Math.random() * drugList.length)];
    const gender: '男' | '女' = Math.random() > 0.5 ? '男' : '女';
    const name = firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
    const numTags = Math.floor(Math.random() * 3);
    const tags: string[] = [];
    for (let j = 0; j < numTags; j++) {
      const tag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }
    if (i < 15) tags.push('新客');

    patients.push({
      id: `patient-${(i + 1).toString().padStart(3, '0')}`,
      name,
      gender,
      age: 35 + Math.floor(Math.random() * 45),
      phone: randomPhone(),
      storeId,
      pharmacistId,
      memberLevel: levels[Math.floor(Math.random() * levels.length)],
      tags,
      lastPurchaseDate: randomDate(45),
      lastDrugName: drugName,
      lastDrugCategory: category,
      totalPurchaseAmount: Math.floor(3000 + Math.random() * 97000),
    });
  }
  return patients;
}

export const patients: Patient[] = generatePatients(60);
