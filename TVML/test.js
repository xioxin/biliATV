var pageData = {
    title:"title1",
    list:[],
};



var listProxy = new Proxy(pageData, {
    get(target, name) {
        console.log('get', target, name);
        return Reflect.get(target, name);
    },
    set(target, name) {
        console.log('set' + name);
        return Reflect.set(target, name);
    },
    deleteProperty(target, name) {
        console.log('delete' + name);
        return Reflect.deleteProperty(target, name);
    }
});