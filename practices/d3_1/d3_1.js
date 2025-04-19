// 텍스트 'Hello World!'를 담은 배열
let helloWorld = ['Hello World!']
// 길이 10짜리 배열 생성, 전부 10으로 채움, 각 요소를 10+i로 매핑
let data = Array(10).fill(6).map((x,i)=>x+i)
// html 문서에서 <body> 요소 하나를 선택해서 D3객체로 만들기
let body = d3.select('body')

const numericData = [1,2,4,8,16];

const svg = d3.select('body').append('svg')
            .attr('width', 300)
            .attr('height', 50);

body.select('p') // p태그를 찾고 selection 생성, 없으면 빈 selection으로 생성. 모든 p 태그들에 대해 한번에 접근 (데이터 기반 반복 생성 가능)
    .data(helloWorld) // 데이터 바인딩
    .enter() // 데이터는 넣었는데 해당 element가 없으니 새 element를 만들어서 마지막에 추가
             // 아직 DOM에 존재하지 않는 데이터 항목에 대한 "가상 요소(selection)" 생성
    .append('p') // selection에 대해 <p> 태그 부여
    .text(d => d) // 텍스트로 데이터 넣기 (출력되게)
// 결과: HTML에 <p>Hello World!</p>가 생김

/* 혹은 아래와 같이
body.append('p')    // p태그 생성해서 추가 후, 그 요소 하나에 데이터 바인딩
    .data(helloWorld)
    .text(d=>d)
*/

body.append('ul') // body 맨 위에 ul 태그 생성.
    .selectAll('li') // ul안에 <li>는 아직 없음, 빈 선택임, 일단 다음으로 넘어감
    .data(data) // data 배열 바인딩 [10,11,...,19]
    .enter()
    .append('li') // <li>태그 부여. 원소만큼.
    .text(d=>d)
// ul : 항목들 앞에 점(●)이 붙은 순서 없는 리스트
// li : list item들

svg.selectAll('rect')
    .data(numericData)
    .enter()
    .append('rect')
    .attr('fill', 'red')
    .attr('width', 50)
    .attr('height', 50)
    .attr('y', 0)
    .attr('x', (d, index) => index * 60)
