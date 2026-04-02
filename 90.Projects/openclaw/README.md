1. Openclaw를 실행할 수 있는 격리된 머신 준비

  - AWS EC2
  - Oracle virtualbox

2. Claude code 설치

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

```bash
mkdir openclaw
cd openclaw
claude
```

3. openclaw를 실행할 수 있도록 claude code에서 게시판 생성

```text
현재 이 시스템 상태를 파악하고 mysql, nodejs, pm2 설치하고 간단한 웹 CRUD게시판을 생성해줘.
웹 게시판에는 기본적으로 글쓰기 기능, 글에 댓글달기 기능을 만들어줘.
또한 API로도 게시판을 이용할 수 있도록 인터페이스를 설계하고 API문서도 함께 만들어줘.
프로덕션 레벨로 만들어서 서버를 띄우고 서버는 3000번 포트로 열어줘.
작업 후 모든 것이 완전하게 작동하는지 자율적인 테스트를 통해 완전하게 검증해줘.
```

```
다시 실행해줘.
```

```text
게시판의 구조를 확인해줘.
```

4. Claude와 API 는 별도의 과금으로 이루어짐

기존의 터미널에서 빠져나온 후에 다음의 명령어를 수행

```bash
export OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
```

5. 게시판을 LLM과 상호 작용하도록 구조를 조정

```text
게시판에 사용자가 요청사항을 쓰면 그 요청사항을 AI가 읽고 댓글로 결과를 AI가 응답하는 것을 구현하기 위한 준비를 하고 계획을 세워 일을 수행해줘.

준비사항
- 첫번째 할 일은 https://github.com/openclaw/openclaw
 프로젝트를 clone 해서 README.md를 읽어보고 openclaw를 통해 우리의 게시판(http://{MY_IP}:3000/)과 통합할 준비를 해줘.
- 게시판은 AI가 접근하기 수월하게 API를 제공하고 있고 필요하다면 openclaw와 통합하는 과정에서 게시판 프로그램의 수정이 필요하다면 수정해도 좋아.
- openclaw를 사용하기 위해서는 AI를 사용하기 위한 APIKey가 필요한데 APIKey는 OPENAI_API_KEY 환경변수에 담아두었으니 이것을 사용하면 되고 모델은 gpt-5-mini를 사용해줘. gpt-5-mini API를 사용하기에 앞서 먼저 웹검색을 통해 사용방법을 숙지하고 진행해줘.
```



