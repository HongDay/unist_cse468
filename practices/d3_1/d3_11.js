let data = Array(10).fill(10).map((x,i)=>x+i)
let body = d3.select('body')
let ul = body.append('ul')
let li = ul.selectAll('li')
            .data(data)
            .enter()
            .append('li')
            .text(d=>d)

// 클래스 이름을 부여
li.attr('class',d=>d%2==0 ? 'even' : 'odd')
// li 요소에 대해 직접 inline 스타일로 글자 색상 설정
li.style('color',d=>d%2==0 ? 'red' : 'blue')

/* 결과예시 :
<li class="even" style="color: red;">10</li>
<li class="odd" style="color: blue;">11</li>
<li class="even" style="color: red;">12</li>
...
*/