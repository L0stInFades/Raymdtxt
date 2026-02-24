import mitt from 'mitt'

// Shared event bus using mitt (Vue 3 compatible replacement for new Vue() bus).
// API: bus.on(event, handler) / bus.emit(event, data) / bus.off(event, handler)
const bus = mitt()
export default bus
