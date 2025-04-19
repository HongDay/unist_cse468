let data = Array(10).fill(10).map((x,i)=>x+i) // [10,11,...,19]

let body = d3.select('body')
let ul = body.append('ul')

let li = ul.selectAll('li')
    .data(data)
    .enter()
    .append('li')
    .text(d=>d)

function exit(){
    let dataExit = data.slice(0,5)  // [10, 11, 12, 13, 14]
    console.log(data)
    li.data(dataExit)   // 기존 li selection에 새 데이터 바인딩
        .exit()           // 데이터와 매칭되지 않는 나머지 li 선택
        .remove()         // 제거
    }

function update(){
    li = li.append('ul')          // 각 <li> 안에 <ul> 추가
        .merge(li)                  // 새로운 <ul>이 생긴 요소와 기존 <li>를 합침 (merge는 enter + update)
        .append('li')               // 그 안에 또 <li> 추가
        .text(d=>d)                 // 같은 값을 텍스트로 출력
    }

body.append('button')
    .text('exit')
    .on('click', exit) // exit함수 실행되어, li가 새로운 data에 맞춰 제거된다.

body.append('button')
    .text('update')
    .on('click', update)