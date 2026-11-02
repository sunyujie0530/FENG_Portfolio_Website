export function navigationGuide({ path, origin = '/works', studentIndex = null, card = false }, students, works) {
  const studentTrail = index => students[index] ? `学生 / 柜子展厅 / ${students[index].name}` : '学生 / 柜子展厅';
  if (path === '/') return '';
  if (path === '/students') return studentIndex === null ? '学生 / 柜子展厅' : studentTrail(studentIndex) + (card ? ' / 学生卡' : '');
  if (path === '/works') return '全部作品';
  const student = path.match(/^\/students\/(\d+)(?:\/discs)?$/);
  if (student) return `${studentTrail(Number(student[1]) - 1)} / 作品详情`;
  if (path.startsWith('/works/')) {
    const author = origin.match(/^\/students\/(\d+)(?:\/discs)?$/);
    const work = works.find(work => path === `/works/${work.id}`);
    return author && work ? `${studentTrail(Number(author[1]) - 1)} / 作品详情` : '全部作品 / 作品详情';
  }
  return null;
}
