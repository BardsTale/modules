const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
module.exports = async (req, res, next) => {
	await db.read(); // 동기적으로 db.json 값 read.
	res.header('X-NARAS', 'Json Server Response.') // 응답값 header를 통해 Json-Server임을 암시


	//요청을 가로채어 진행
	if(req._parsedUrl?.pathname.indexOf('skill')>-1) { //요청 pathname에 skill이 있는 경우
		const initData = db.get('init').value(); //db.json에서 메인 데이터인 init get 호출
		const skills = initData.skill; //initData 중 skill 얕은 복사(shallow copy)
		const skillName = req.query.type; //요청 쿼리스트링에서 스킬명(type) 추출
		const skillData = skills.find(ele => ele.SKILL_NAME === skillName); //명시한 스킬명이 있을 경우 매칭

		if (req.method === 'GET') {
			res.send(skillData || skills); // skillData(단 건 조회) 없을 경우 skills(다 건 조회) 반환
		}
		else if (req.method === 'POST') {
			const payload = req.body; // 요청 페이로드

			// skills 배열에 필요한 데이터만 가공 후 삽입
			skills.push({
				"SKILL_NAME": payload.SKILL_NAME, 
				"SKILL_GBN": payload.SKILL_GBN
			});

			// 스킬을 구분하여 스킬카운트 증가 
			if(req.body.SKILL_GBN === 'frontEnd') initData.frontSkillCount++;
			else initData.backSkillCount++;

			db.get('skillBackData').assign(skills).write(); //skillBackData에 skills 덮어씌움과 동시에 write 메서드를 통해 db.json에 변경된 사항 적용.
			res.sendStatus(201) // 응답값에 http Status 201(create)값만 전송
		}
		else if (req.method === 'PUT') {
			const payload = req.body;

			// skills의 SKILL_GBN 값을 payLoad에서 매칭된 값으로 변경
			skills.map(ele => {
				if(ele.SKILL_NAME === payload.SKILL_NAME) ele.SKILL_GBN = payload.SKILL_GBN;
				return ele;
			});

			db.get('skillBackData').assign(skills).write();
			res.sendStatus(201) // 응답값에 http Status 201(create)값만 전송
		}
		else if (req.method === 'DELETE') {
			const payload = req.body;

			// 삭제할 타겟 index 찾은 후 splice를 통해 배열에서 제거
			const targetIndex = skills.findIndex(ele => ele.SKILL_NAME === payload.SKILL_NAME)
			skills.splice(targetIndex, 1);

			// 스킬을 구분하여 스킬카운트 감소
			if(req.body.SKILL_GBN === 'frontEnd') initData.frontSkillCount--;
			else initData.backSkillCount--;

			db.get('skillBackData').assign(skills).write();
			res.sendStatus(204) // 응답값에 http Status 204(No Content)값만 전송
		}
	}else{
		next() // 일반적인 라우팅 진행
	}
}
