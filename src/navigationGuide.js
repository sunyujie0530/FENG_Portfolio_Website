export function navigationGuide({ path, origin = '/works', studentIndex = null, card = false }, students, works) {
  const studentTrail = index => students[index] ? `学生 / 柜子展厅 / ${students[index].name}` : '学生 / 柜子展厅';
  if (path === '/') return '';
  if (path === '/students') return studentIndex === null ? '学生 / 柜子展厅' : studentTrail(studentIndex) + (card ? ' / 学生卡' : '');
  if (path === '/works') return '全部作品';
  const student = path.match(/^\/students\/(\d+)(?:\/discs)?$/);
  if (student) return `${studentTrail(Number(student[1]) - 1)} / ${path.endsWith('/discs') ? '作品光盘库' : '个人主页'}`;
  const creator = path.match(/^\/creators\/([0-9a-f-]{36})(\/discs)?$/);
  if (creator) {
    const index = students.findIndex(student => student.creatorId === creator[1] && student.active !== false);
    if (index >= 0) return `${studentTrail(index)} / ${creator[2] ? '作品光盘库' : '个人主页'}`;
  }
  if (path.startsWith('/works/')) {
    const author = origin.match(/^\/students\/(\d+)(?:\/discs)?$/);
    const creatorOrigin = origin.match(/^\/creators\/([0-9a-f-]{36})(?:\/discs)?$/);
    const creatorIndex = creatorOrigin ? students.findIndex(student => student.creatorId === creatorOrigin[1] && student.active !== false) : -1;
    if (creatorIndex >= 0) return `${studentTrail(creatorIndex)} / 作品详情`;
    const work = works.find(work => path === `/works/${work.id}`);
    return author && work ? `${studentTrail(Number(author[1]) - 1)} / 作品详情` : '全部作品 / 作品详情';
  }
  return null;
}
