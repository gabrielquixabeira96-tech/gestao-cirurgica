import igit from 'isomorphic-git'
console.log(Object.keys(igit).slice(0, 10))
import('isomorphic-git/http/node').then(m => {
  console.log('http/node exports:', Object.keys(m))
}).catch(e => {
  console.log('http/node fail:', e.message)
  return import('isomorphic-git/http/web').then(m => {
    console.log('http/web exports:', Object.keys(m))
  }).catch(e2 => console.log('http/web fail:', e2.message))
})
