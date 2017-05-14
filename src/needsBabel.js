// consumed as obj::dot('foo')::dot('bar')
function dot(prop) { return this && this[prop] }