// 연습 모드용 가짜 직원. 실제 AI 없이 사무실이 어떻게 돌아가는지 확인할 때 씁니다.
// 실행: npm run demo
'use strict';
const fs = require('fs');
const path = require('path');
const [, , id, taskFile] = process.argv;
const task = fs.readFileSync(taskFile, 'utf8');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => process.stdout.write(s + '\n');
const progress = (s) => process.stderr.write(s + '\n'); // 진행 상황은 터미널 화면에만

(async () => {
  const isLead = task.includes('## 업무 나누는 법');
  const isReview = task.includes('## 지금까지 팀원 결과');
  progress('업무 지시서를 읽는 중...');
  await wait(900);

  if (isLead && !isReview) {
    progress('업무를 팀원에게 나누는 중...');
    await wait(1200);
    say('네 대표님! 먼저 조사와 기획부터 진행하겠습니다.');
    say('<업무 to="researcher">\n요청과 관련된 최근 트렌드와 경쟁 사례 5개를 조사해 output/research.md 로 저장\n</업무>');
    say('<업무 to="planner">\n요청을 바탕으로 1페이지 기획안을 output/plan.md 로 작성\n</업무>');
    return;
  }
  if (isReview && isLead) {
    const hasDesign = task.includes('### 디자이너');
    const lastRound = !task.includes('## 업무 나누는 법');
    if (!hasDesign && !lastRound) {
      say('조사와 기획 결과 확인 완료. 다음 단계로 넘깁니다.');
      say('<업무 to="designer">\nplan.md 를 참고해 썸네일 시안 2개를 output/thumbnail-draft.md 로 정리\n</업무>');
      say('<업무 to="marketer">\nplan.md 를 참고해 후킹 문구 5개를 output/hooks.md 로 작성\n</업무>');
      say('<업무 to="developer">\nplan.md 를 참고해 랜딩페이지 초안을 output/landing.html 로 제작\n</업무>');
      return;
    }
    say('최종 보고드립니다 🎉\n- 조사, 기획, 디자인, 문구, 페이지 초안이 모두 준비됐습니다.\n- 결과물 탭에서 파일을 확인해 주세요.\n- 대표님 결정 필요: 썸네일 시안 A/B 중 선택');
    return;
  }

  const steps = ['자료 확인 중...', '초안 작성 중...', '다듬는 중...'];
  for (const s of steps) { progress(s); await wait(700 + Math.random() * 900); }
  const instruction = (task.split('## 지시 내용\n')[1] || '').split('\n')[0];
  const m = instruction.match(/output\/([\w.-]+)/);
  const name = m ? m[1] : `${id}-note.md`;
  fs.mkdirSync('output', { recursive: true });
  const body = name.endsWith('.html')
    ? `<!doctype html><meta charset="utf-8"><title>연습 결과</title><h1>${id} 연습 결과물</h1><p>${instruction}</p>`
    : `# ${id} 연습 결과물\n\n지시: ${instruction}\n\n(연습 모드에서 만든 가짜 파일입니다)\n`;
  fs.writeFileSync(path.join('output', name), body);
  say(`완료했습니다! output/${name} 파일을 만들었어요.`);
})();
