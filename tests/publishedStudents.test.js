import assert from 'node:assert/strict';
import {syncPublishedStudents,publishedWork,studentPath} from '../src/submissionData.js';
const students = [{name:'刘思盈',grade:'2026级'}];
const row = {id:'one',creator_id:'account-a',student_name:'刘思盈',grade:'2026级',files:[{kind:'cover',url:'/cover.png'}]};
syncPublishedStudents([row,{...row,id:'two'}],students);
assert.equal(students.length,2);
assert.deepEqual(publishedWork(row,students).authors,[1]);
assert.equal(studentPath(students[1],1),'/creators/account-a');
syncPublishedStudents([{...row,creator_id:'account-b'},row],students);
assert.equal(students.length,3); // Same names are separate accounts.
assert.deepEqual(publishedWork({...row,creator_id:'account-b'},students).authors,[2]);
syncPublishedStudents([{...row,grade:'2027级'}],students);
assert.equal(students[1].grade,'2027级');
assert.equal(students[2].active,false); // No published work: no visible cabinet.
syncPublishedStudents([{...row,creator_id:'account-b'}],students);
assert.equal(students.length,3); // Restore the same cabinet, no duplicate.
assert.equal(students[2].active,true);
assert.equal(studentPath(students[0],0),'/students/1');
console.log('Published students: account identity, stable routes, multiple works, namesakes, grades and withdrawal passed.');

// New students reuse the reference interior and route model clicks to their own ID.
const {readFileSync} = await import('node:fs');
const main = readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('createLocker(index,{empty:true,personalInterior:true})'));
assert.ok(main.includes('if ((!empty && index === 3) || personalInterior)'));
assert.ok(main.includes('else if (personalInterior) addStudentBadge(door,index)'));
assert.ok(main.includes("new CustomEvent('browse-student', {detail:focusedLocker})"));
assert.ok(main.includes("new CustomEvent('browse-discs', { detail: focusedLocker })"));
assert.ok(!main.includes('locker-author-actions'));
