// 원시데이터
const rawLinks = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "C", to: "D" }
  ];

  
// 1. 모든 노드 ID 수집
const nodeSet = new Set();
rawLinks.forEach(link => {
  nodeSet.add(link.from);
  nodeSet.add(link.to);
});

// 2. nodes 배열 만들기
const nodes = Array.from(nodeSet).map(id => ({ id }));

// 3. links 배열은 그대로 사용, 단 source/target 키로 맞춤
const links = rawLinks.map(d => ({ source: d.from, target: d.to }));

// 4. 완성된 D3 그래프 구조
const graph = { nodes, links };

/* 완성 예시
const graph = {
    nodes: [
      { id: "A", group: 1 },
      { id: "B", group: 1 },
      { id: "C", group: 2 },
      { id: "D", group: 2 }
    ],
    links: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "C", target: "D" }
    ]
  };
  */