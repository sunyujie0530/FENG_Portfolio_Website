export const MB = 1024 * 1024;
export const fileRules = {
  avatar: { count: 1, each: 5 * MB, total: 5 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  cover: { count: 1, each: 5 * MB, total: 5 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  gallery: { count: 12, each: 8 * MB, total: 60 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  document: { count: 1, each: 20 * MB, total: 20 * MB, types: ['application/pdf'] },
};
export function validateFiles(form) {
  const errors = [];
  let grandTotal = 0;
  for (const [name, rule] of Object.entries(fileRules)) {
    const files = [...form.elements[name].files];
    const total = files.reduce((sum, file) => sum + file.size, 0);
    grandTotal += total;
    if (files.length > rule.count) errors.push(`${name} 最多选择 ${rule.count} 个文件`);
    if (files.some(file => file.size <= 0 || !rule.types.includes(file.type))) errors.push(`${name} 包含空文件或不支持的格式`);
    if (files.some(file => file.size > rule.each) || total > rule.total) errors.push(`${name} 大小超过限制`);
  }
  if (!form.elements.cover.files.length) errors.push('请上传封面图');
  if (grandTotal > 90 * MB) errors.push('单次投稿总大小不能超过 90MB');
  return { errors, grandTotal };
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export const statusLabels = { draft:'上传未完成', pending:'待审核', approved:'已发布', rejected:'已退回 / 下架' };
export const categoryKind = { '游戏':'game', '动画':'video', '3D':'model', '视觉设计':'scene', '交互设计':'game', '其他':'scene' };
export function publishedWork(row, students) {
  const cover = row.files.find(file => file.kind === 'cover')?.url;
  if (!cover) throw new Error('已发布作品缺少封面');
  const author = students.findIndex(student => student.name === row.student_name && student.grade === row.grade);
  return { id:`submission-${row.id}`, title:row.title, kind:categoryKind[row.category] || 'scene',
    authors:author < 0 ? [] : [author], cover, summary:row.summary, uploaded:true,
    authorName:row.student_name, authorGrade:row.grade, creatorId:row.creator_id,
    year:row.year, roles:row.roles, files:row.files };
}
