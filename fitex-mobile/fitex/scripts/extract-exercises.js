const fs = require('fs')
const content = fs.readFileSync(__dirname + '/../constants/muscle-groups.ts', 'utf8')

// Simple approach: find all id+name+description blocks
const lines = content.split('\n')
let currentId = null
let result = []

for (let i = 0; i < lines.length; i++) {
  const idMatch = lines[i].match(/^\s+id: '([^']+)'/)
  if (idMatch) {
    currentId = idMatch[1]
  }
  const descMatch = lines[i].match(/^\s+description:\s*'(.*)'/)
  if (descMatch && currentId && currentId.split('-').length >= 2) {
    result.push({ id: currentId, desc: descMatch[1].substring(0, 100) })
  }
}

result.forEach(r => console.log(r.id + '\n  ' + r.desc + '\n'))
console.log('Total exercises with desc:', result.length)
