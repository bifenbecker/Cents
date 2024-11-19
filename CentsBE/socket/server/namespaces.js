const io = require('./socketServer/bareBonesServer');

const namespaces = {
    ui: io.of('/ui'),
    machine: io.of('/machines'),
};
function returnNamespaces(name) {
    return namespaces[name];
}

module.exports.namespaces = namespaces;
module.exports.returnNamespaces = returnNamespaces;
