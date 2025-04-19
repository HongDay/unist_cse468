// 원시 데이터
const rawHierarchy = [
    { name: "A", parent: "Root" },
    { name: "A1", parent: "A" },
    { name: "A2", parent: "A" },
    { name: "B", parent: "Root" },
    { name: "B1", parent: "B" }
  ];

  
function listToTree(data, rootName) {
    const lookup = {};
    data.forEach(d => lookup[d.name] = { name: d.name, children: [] });
  
    let root = { name: rootName, children: [] };
  
    data.forEach(d => {
      const parent = d.parent === rootName ? root : lookup[d.parent];
      parent.children.push(lookup[d.name]);
    });
  
    return root;
  }
  
  const treeData = listToTree(rawHierarchy, "Root");
  

/*
const treeData = {
  name: "Root",
  children: [
    {
      name: "A",
      children: [
        { name: "A1" },
        { name: "A2" }
      ]
    },
    {
      name: "B",
      children: [
        { name: "B1" }
      ]
    }
  ]
};
*/